/*
	Tracking data analyzer core class (version 2)

	Basic reference in thr front of `AnalyzeCore.js`

	Change with `AnalyzeCore.js`

	1. analyze function become asynchronized return Promise
	2. better project merge
	3. optimize file io
*/
// @ts-check
/// <reference path="../types/AnalyzeCore.d.ts" />

// TODO: definedString
// TODO: test

const fs = require('fs-extra');
const DefinedString = require('./DefinedString');
const Exception = require('./ExceptionCollection');

let {
	GROUP_BY,

	COLUMN_INFO_3,
	COLUMN_INFO_4_REQUIRED,
	COLUMN_INFO_4_OPTIONAL,
	// COLUMN_INFO_ALL,

	SUPPORT_VERSION,

	SPLIT_COLUMN,
	SPLIT_LINE
} = require('./Constant');

let {
	getVCSInfo,

	getFileNameFromDateObject,
	dateToYYYYMMDDHHString,
	dateToYYYYMMDDString,

	generateFilterFunction,
	convertGroupRulesNumberToObject,

	getBaseResultObject,

	isEncodedPathAbsolute
} = require('./Utils');

/** How many columns each line in version 3.0 database file */
const COLUMN_COUNT_3 = Object.keys(COLUMN_INFO_3).length;

/** How many columns at least each line in version 4.0 database file */
const COLUMN_COUNT_4_MIN = COLUMN_COUNT_3 + Object.keys(COLUMN_INFO_4_REQUIRED).length;
/** How many columns at most each line in version 4.0 database file */
const COLUMN_COUNT_4_MAX = COLUMN_COUNT_4_MIN + Object.keys(COLUMN_INFO_4_OPTIONAL).length;

const MS_1_HOUR = 3600 * 1000;
const MS_1_DAY = 24 * MS_1_HOUR;

class AnalyzeCoreV2 {
	static GroupBy = GROUP_BY;

	/**
	 * @param {CachedDataFileReader} fileReader
	 */
	constructor(fileReader) {
		this.exception = Exception.create();
		//a filter function be generate from #setFilter rules
		this.filterFunction = generateFilterFunction({});

		//a group by rules object be generate from #setGroupBy
		this.groupByRules = convertGroupRulesNumberToObject(0);

		//analyze timestamp range [new Date(xxxx,xx,xx,0,0,0).getTime(), new Date(xxxx,xx,xx,23,59,59).getTime()]
		this.analyzeTimestampRange = [0, 0];

		//projects
		this.projects = [];

		//analyze result object
		this.resultObject = getBaseResultObject();
		this.definedString = DefinedString.create();

		this.reader = fileReader;
	}

	//#region AnalyzeCoreV2#analyze
	/**
	 * @param {Date} start
	 * @param {Date} end
	 * @returns {Promise}
	 */
	analyze(start, end) {
		// set analyzeTimestamp range
		this.analyzeTimestampRange = [start.getTime(), end.getTime()];
		this.resultObject = getBaseResultObject();

		// date loop cursor
		let dateIterator = new Date(start.getTime());
		// one more day before `startDate` for some data item across a day and different timezone
		dateIterator.setDate(dateIterator.getDate() - 1);

		// loop end timestamp
		let _end = new Date(end);
		// one more day after `endDate` for some data item across a day and different timezone
		let iterateEnd = _end.setDate(_end.getDate() + 1);

		// build a database file name list for prepare to analyze
		let fileNameList = [];
		// get all existed files map
		const existedFiles = new Set();

		/** @type {string[]} */
		let projectsArray = [];
		/** @type {{[name: string]: true}} */
		const projects = {};
		/** @type {string[][]} */
		const lines = [];
		/** @type {number[]} */
		const startTimes = [];
		/** @type {number[]} */
		const howLongs = [];
		let lineCount = 0;

		return fs.readdir(this.reader.getDataFileDir()).then(files => {
			files.forEach(file => { existedFiles.add(file); });

			while (dateIterator.getTime() < iterateEnd) {
				const fileName = getFileNameFromDateObject(dateIterator);
				if (existedFiles.has(fileName))
					fileNameList.push(fileName);
				dateIterator.setDate(dateIterator.getDate() + 1);
			}

			return this.reader.prepareFiles(fileNameList);
		}).then(() => {
			const preAnalyzePromises = [];
			for (let i = 0, j = fileNameList.length; i < j; i++) {
				/*if the database file is near by the date range boundary, must check time range in sub function*/
				let needCheckTimeRange = i < 2 || i >= j - 2;
				preAnalyzePromises.push(this.preAnalyzeOneFile(fileNameList[i], needCheckTimeRange));
			}
			return Promise.all(preAnalyzePromises).then(results => {
				for (const result of results) {
					Object.keys(result.projects).forEach(project => { projects[project] = true; });
					for (let i = 0; i < result.count; i++) {
						startTimes[lineCount] = result.startTimes[i];
						howLongs[lineCount] = result.howLongs[i];
						lines[lineCount++] = result.lines[i];
					}
				}
				projectsArray = Object.keys(projects).sort((a, b) => b.length - a.length);
			});
		}).then(() => {
			const groupByRules = this.groupByRules;
			for (let i = 0; i < lineCount; i++) {
				const cols = lines[i];
				const startTime = startTimes[i];
				const howLong = howLongs[i];
				const vcs = getVCSInfo(cols);

				//Ignore line
				if (!this.filterFunction(cols, vcs))
					return true;

				let isCodingRecord = cols[0] == '2',
					resultGroupBy = this.resultObject.groupBy;
				this.resultObject.total[isCodingRecord ? 'coding' : 'watching'] += howLong;

				let project = cols[5];
				let fileName = cols[4];
				if (isEncodedPathAbsolute(fileName)) {
					for (const testProject of projectsArray) {
						if (fileName.startsWith(testProject)) {
							// TODO: remove '/' or '\\' at begin
							fileName = fileName.slice(testProject.length);
							project = testProject;
						}
					}
				}

				if (groupByRules.hasComputer)
					addOneRecordToAGroupBy(resultGroupBy.computer, cols[6]/*computer*/, howLong, isCodingRecord);
				if (groupByRules.hasProject)
					addOneRecordToAGroupBy(resultGroupBy.project, project, howLong, isCodingRecord);
				if (groupByRules.hasFile)
					addOneRecordToAGroupBy(resultGroupBy.file, fileName, howLong, isCodingRecord);
				if (groupByRules.hasLanguage)
					addOneRecordToAGroupBy(resultGroupBy.language, cols[3]/*languageId*/, howLong, isCodingRecord);

				if (groupByRules.hasVCS)
					addOneRecordToAGroupBy(resultGroupBy.vcs, vcs ? vcs.join(':') : '::', howLong, isCodingRecord);

				if (groupByRules.hasHour) {
					//loop start with first second in the Hour which startTime in
					let pointerTimestamp = new Date(startTime).setMinutes(0, 0, 0),
						//loop end with end time
						endTimestamp = startTime + howLong,

						lastCountTimestamp = startTime,
						nextCountTimestamp = -1,

						context = resultGroupBy.hour;

					for (; pointerTimestamp < endTimestamp; pointerTimestamp += MS_1_HOUR) {
						nextCountTimestamp = Math.min(endTimestamp, pointerTimestamp + MS_1_HOUR);
						let howLongInThisHour = nextCountTimestamp - lastCountTimestamp;
						addOneRecordToAGroupBy(context, dateToYYYYMMDDHHString(new Date(pointerTimestamp)),
							howLongInThisHour, isCodingRecord);

						lastCountTimestamp = nextCountTimestamp;
					}
				}
				if (groupByRules.hasDay) {
					//loop start with first second in the Day which startTime in
					let pointerTimestamp = new Date(startTime).setHours(0, 0, 0, 0),
						//loop end with end time
						endTimestamp = startTime + howLong,

						lastCountTimestamp = startTime,
						nextCountTimestamp = -1,

						context = resultGroupBy.day;

					for (; pointerTimestamp < endTimestamp; pointerTimestamp += MS_1_DAY) {
						nextCountTimestamp = Math.min(endTimestamp, pointerTimestamp + MS_1_DAY);
						let howLongInThisDay = nextCountTimestamp - lastCountTimestamp;
						addOneRecordToAGroupBy(context, dateToYYYYMMDDString(new Date(pointerTimestamp)),
							howLongInThisDay, isCodingRecord);

						lastCountTimestamp = nextCountTimestamp;
					}
				}
			}
			return true;
		});
		/**
		 * Add one record to groupBy result
		 * @param {any} context for example: resultObject/groupBy.day
		 * @param {string} name group name, such as "PC1", "2017-01-26"
		 * @param {number} howLong
		 * @param {boolean} isCodingRecord true=>CodingRecord false=>WatchingRecord
		 */
		function addOneRecordToAGroupBy(context, name, howLong, isCodingRecord) {
			if (!name)
				name = 'unknown';
			if (context[name])
				context[name][isCodingRecord ? 'coding' : 'watching'] += howLong;
			else
				context[name] = { coding: isCodingRecord ? howLong : 0, watching: isCodingRecord ? 0 : howLong };
		}
	}
	//#endregion AnalyzeCoreV2#analyze

	/**
	 * @param {string} fileName
	 * @param {boolean} needCheckTimeRange
	 * @returns {Promise<{
		 count: number;
		 startTimes: number[];
		 howLongs: number[];
		 lines: string[][];
		 projects: {[name: string]: true}
		}>}
	 */
	preAnalyzeOneFile(fileName, needCheckTimeRange) {
		const [analyzeFrom, analyzeTo] = this.analyzeTimestampRange;
		return this.reader.readFile(fileName).then(content => {
			let lines = content.split(SPLIT_LINE);
			if (lines.length == 0)
				throw new Error(`${fileName} is empty!`);

			let version = lines[0].trim();
			if (SUPPORT_VERSION.indexOf(version) == -1)
				throw new Error(`${fileName} with unsupported version: ${lines[0]}`);

			let resultCount = 0;
			const resultLines = Array(lines.length - 1);
			const resultStartTimes = Array(lines.length - 1);
			const resultHowLongs = Array(lines.length - 1);
			const resultProjects = {};

			let versionNum = version == '4.0' ? 4 : 3;
			for (let lineNo = 1; lineNo < lines.length; lineNo++) {
				let line = lines[lineNo].trim();
				if (line.startsWith('#'))
					continue;
				if (line.startsWith('d')) {
					if (!this.definedString.addDefiningLine(line))
						throw new Error(`${fileName}#${String(lineNo+1)} defining line is invalid`);
					continue;
				}
				//If it is a empty line, just ignore
				if (!line)
					continue;

				const cols = line.split(SPLIT_COLUMN);
				let left = (versionNum == 4 ? COLUMN_COUNT_4_MIN : COLUMN_COUNT_3),
					right = (versionNum == 4 ? COLUMN_COUNT_4_MAX : COLUMN_COUNT_3);
				if (cols.length < left)
					throw new Error(`${fileName}#${lineNo}: columns length is not valid. at least ${left}(${cols.length})`);
				if (cols.length > right)
					this.exception.addWarning(`too many columns than ${right}(${cols.length})`, fileName, lineNo);

				//Convert startTime and howLong columns to number
				let startTime = Number(cols[1]);
				let howLong = Number(cols[2]);
				//check is startTime in the analyze range
				if (needCheckTimeRange) {
					if (isNaN(startTime) || isNaN(howLong))
						throw new Error(`${fileName}#${lineNo}: param "start time" or param "how long" is not a number`);
					if (startTime > analyzeTo)
						continue;//ignore
					if (startTime + howLong > analyzeTo) {
						//fix start time and how long (because it across boundary)
						howLong = analyzeTo - startTime;
					}
					if (startTime < analyzeFrom) {
						if (startTime + howLong < analyzeFrom)
							continue;//ignore
						//fix start time and how long (because it across boundary)
						howLong -= analyzeFrom - startTime;
						startTime = analyzeFrom;
					}
				}

				resultLines[resultCount] = cols;
				resultStartTimes[resultCount] = startTime;
				resultHowLongs[resultCount++] = howLong;
				resultProjects[cols[5]] = true;
			} // #for-end

			return {
				count: resultCount,
				lines: resultLines,
				projects: resultProjects,
				startTimes: resultStartTimes,
				howLongs: resultLines,
			};
		});
	}

	getWarning() { return this.exception.getWarning(); }
	getResult() { return this.resultObject; }

	/**
	 * Set a filter rules object to analyzer
	 * @param {AnalyzeFilterRules} filterRules
	 */
	setFilter(filterRules) {
		this.filterFunction = generateFilterFunction(filterRules);
	}

	/**
	 * Set a group by rules number to analyzer
	 * @param {number} groupBy
	 */
	setGroupBy(groupBy) {
		this.groupByRules = convertGroupRulesNumberToObject(groupBy);
	}
}

module.exports = AnalyzeCoreV2;
