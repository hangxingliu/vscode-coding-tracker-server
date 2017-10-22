/**
 * Tracking data analyzer core class
 *
 * Some data structure:
 *
 * 	setFilter(filterRules: FilterRules)
 * 		FilterRules: {
 * 			project: [...],
 * 			computer: [...],
 * 			language: [...],
 * 			file: [...]
 * 		}
 *
 * 	Result data structure:
 * 		{
 * 			total: {coding: TIME_YOU_CODING_FINGER_ON_KEYBOARD, watching: TIME_YOU_WATCHING_YOUR_CODE},
 * 			groupBy: {
 *				project: {
 * 					project1: {coding: ..., watching: ...},
 * 					...
 * 				},
 * 				...
 * 			}
 * 		}
 *
 * Using example:
 *
 * var core = new AnalyzeCore('./database');
 * core.setFilter({ fileType: ['javascript', 'json'] });
 * core.setGroupBy(AnalyzeCore.GroupBy.DAY | Analyze.GroupBy.PROJECT | Analyze.GroupBy.COMPUTER);
 *
 * var today = new Date();
 * var before30days = new Date(today);
 * before30days = before30days.setDate(before30days.getDate() - 29);
 *
 * var success = core.analyze(today, before30days);
 * if(success) {
 * 	console.log(core.getResult());
 * } else {
 * 	console.error(core.getError());
 * }
 * console.warn(core.getWarning());
 *
 * More example you can see
 * 	utility script `utils/analyzer` source codes
 * 	in the #main function(It is very short and clear)
 */
//@ts-check
/// <reference path="../types/AnalyzeCore.d.ts" />

"use strict";
let path = require('path'),
	fs = require('fs');

let DefinedString = require('./DefinedString');
let Exception = require('./ExceptionCollection');

let {
	GROUP_BY,

	COLUMN_INFO_3,
	COLUMN_INFO_4_REQUIRED,
	COLUMN_INFO_4_OPTIONAL,

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

	getBaseResultObject
} = require('./Utils');


const COLUMN_COUNT_3 = Object.keys(COLUMN_INFO_3).length;
const COLUMN_COUNT_4_MIN = COLUMN_COUNT_3 + Object.keys(COLUMN_INFO_4_REQUIRED).length;
const COLUMN_COUNT_4_MAX = COLUMN_COUNT_4_MIN + Object.keys(COLUMN_INFO_4_OPTIONAL).length;

const MS_1_HOUR = 3600 * 1000;
const MS_1_DAY = 24 * MS_1_HOUR;

function AnalyzeCore(databaseFolder) {	
	let exception = Exception.create(),
		//a filter function be generate from #setFilter rules
		filterFunction = generateFilterFunction({}),
		//a group by rules object be generate from #setGroupBy
		groupByRules = convertGroupRulesNumberToObject(0),
		//analyze timestamp range [new Date(xxxx,xx,xx,0,0,0).getTime(), new Date(xxxx,xx,xx,23,59,59).getTime()]
		analyzeTimestampRange = [0, 0],
		//analyze result object
		resultObject = getBaseResultObject(),
		definedString = DefinedString.create();

	/**
	 *clean all associated variable before analyze
	 */
	function _cleanVariableBeforeAnalyze() {
		exception = Exception.create();
		analyzeTimestampRange = [0, 0];
		filterFunction = filterFunction || generateFilterFunction();
		groupByRules = groupByRules || convertGroupRulesNumberToObject(0);
		resultObject = getBaseResultObject();
		definedString = DefinedString.create();
	}	

	/**
	 * Analyze database files.
	 * 	and get report from tracking data recorded in time range
	 * 	[startDayDate:00:00:00, endDayDate:23:59:59]
	 * @param {Date} startDayDate
	 * @param {Date} endDayDate
	 * @returns {Object}
	 */
	function analyze(startDayDate, endDayDate) {
		_cleanVariableBeforeAnalyze();
		
		//rest start and end date to 00:00:00 and 23:59:59
		//set analyzeTime stamp range
		startDayDate = new Date(startDayDate.getFullYear(), startDayDate.getMonth(), startDayDate.getDate(), 0, 0, 0);
		endDayDate = new Date(endDayDate.getFullYear(), endDayDate.getMonth(), endDayDate.getDate(), 23, 59, 59);
		analyzeTimestampRange = [startDayDate.getTime(), endDayDate.getTime()];

		//date loop cursor		
		var dateCursor = new Date(startDayDate.getTime());
		dateCursor.setDate(dateCursor.getDate() - 1);
		//loop end timestamp
		var timestampEndBoundary = new Date(endDayDate);
		var timestamp = timestampEndBoundary.setDate(timestampEndBoundary.getDate() + 1);

		//build a database file name list for prepare to analyze
		var scanFileNameList = [];
		while (dateCursor.getTime() < timestamp) {
			scanFileNameList.push(getFileNameFromDateObject(dateCursor));
			dateCursor.setDate(dateCursor.getDate() + 1);
		}
		
		//start analyze each file
		for (let i = 0, j = scanFileNameList.length; i < j; i++) {
			/*if the database file is near by the date range boundary, must check time range in sub function*/
			let needCheckTimeRange = i < 2 || i >= j - 2;
			if (!_analyzeOneFile(scanFileNameList[i], needCheckTimeRange))
				return false;
		}
		return true;
	}
	
	// Analyze one database file
	function _analyzeOneFile(fileName, needCheckTimeRange) {
		let filePath = path.join(databaseFolder, fileName);
		//If this file is not exists, just ignore
		if (!fs.existsSync(filePath))
			return true;
		let content = ''
		try {
			content = fs.readFileSync(filePath, 'utf8');
		} catch (err) {
			return exception.addError(`read file error`, fileName), false;
		}
		let lines = content.split(SPLIT_LINE);
		if (lines.length == 0)
			return exception.addError(`empty file`, fileName), false;	

		let version = lines[0].trim();
		if (SUPPORT_VERSION.indexOf(version) == -1)
			return exception.addError(`unsupported version: ${lines[0]}`, fileName), false;	

		let versionNum = version == '4.0' ? 4 : 3;
		for (let i = 1; i < lines.length; i++) {
			let line = lines[i].trim();
			if (line.startsWith('#'))
				continue;
			if (line.startsWith('d')) {
				if (!definedString.addDefiningLine(line)) 
					return exception.addError(`defining line is invalid`, fileName, i + 1), false;
				continue;
			}
			if (!_analyzeOneLine(versionNum, line, fileName, i + 1, needCheckTimeRange))
				return false;
		}
		return true;
	}

	/**
	 * analyze one line in a database file,
	 * and put this line analyze result to the `resultObject`
	 * @param {number} versionNumber 
	 * @param {string} line 
	 * @param {string} fileName 
	 * @param {number} lineNo 
	 * @param {boolean} needCheckTimeRange 
	 * @returns  
	 */
	function _analyzeOneLine(versionNumber, line, fileName, lineNo, needCheckTimeRange) {
		var cols = line.split(SPLIT_COLUMN);
		//If it is a empty line, just ignore
		if (!line)
			return true;
		
		let left = (versionNumber == 4 ? COLUMN_COUNT_4_MIN : COLUMN_COUNT_3),
			right = (versionNumber == 4 ? COLUMN_COUNT_4_MAX : COLUMN_COUNT_3);
		if (cols.length < left) {
			return exception.addError(`columns length is not valid. at least ${left}(${cols.length})`, fileName, lineNo), false;
		} else if (cols.length > right) {
			exception.addWarning(`too many columns than ${right}(${cols.length})`, fileName, lineNo);
		}
		
		let vcs = getVCSInfo(cols);
		//Ignore line
		if (!filterFunction(cols, vcs))
			return true;
		
		//Convert startTime and howLong columns to number
		var startTime = Number(cols[1]),
			howLong = Number(cols[2]);
		if (isNaN(startTime) || isNaN(howLong))
			return exception.addError(`param "start time" or param "how long" is not a number`, fileName, lineNo), false;
		
		//check is startTime in the analyze range 
		if (needCheckTimeRange) {
			if (startTime > analyzeTimestampRange[1]) return true;//ignore
			if (startTime + howLong > analyzeTimestampRange[1]) {
				//fix start time and how long (because it across boundary)
				howLong = analyzeTimestampRange[1] - startTime;
			}
			if (startTime < analyzeTimestampRange[0]) {
				if (startTime + howLong < analyzeTimestampRange[0]) return true;//ignore
				//fix start time and how long (because it across boundary)
				howLong -= analyzeTimestampRange[0] - startTime;
				startTime = analyzeTimestampRange[0];
			}
		}

		//Is this line a coding record, else is a watching record
		let isCodingRecord = cols[0] == '2',
			resultGroupBy = resultObject.groupBy;
		resultObject.total[isCodingRecord ? 'coding' : 'watching'] += howLong;
		
		//groupByRule
		if (groupByRules.hasComputer)
			addOneRecordToAGroupBy(resultGroupBy.computer, cols[6]/*computer*/, howLong, isCodingRecord);
		if (groupByRules.hasProject)
			addOneRecordToAGroupBy(resultGroupBy.project, cols[5]/*project*/, howLong, isCodingRecord);
		if (groupByRules.hasFile) 
			addOneRecordToAGroupBy(resultGroupBy.file, cols[4]/*fileName*/, howLong, isCodingRecord);
		if (groupByRules.hasLanguage)
			addOneRecordToAGroupBy(resultGroupBy.language, cols[3]/*languageId*/, howLong, isCodingRecord);
		
		if (groupByRules.hasVCSRepo)
			addOneRecordToAGroupBy(resultGroupBy.vcs_repo, vcs[1], howLong, isCodingRecord);
		if (groupByRules.hasVCSBranch)
			addOneRecordToAGroupBy(resultGroupBy.vcs_branch, vcs[2], howLong, isCodingRecord);
		
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
		return true;
	}	

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

	/**
	 * Set a filter rules object to analyzer
	 * @param {AnalyzeFilterRules} filterRules
	 */
	this.setFilter = filterRules => filterFunction = generateFilterFunction(filterRules);

	/**
	 * Set a group by rules number to analyzer
	 * @param {number} groupBy 
	 */
	this.setGroupBy = groupBy => groupByRules = convertGroupRulesNumberToObject(groupBy);
	
	/**
	 * analyze function
	 * 	return a boolean
	 *  true as success
	 *  false as failure(if you get false, you can call #getError to get failed reason)
	 */
	this.analyze = analyze;

	/**
	 * get error descriptions array
	 */
	this.getError = exception.getError;
	/**
	 * get warning descriptions array
	 */
	this.getWarning = exception.getWarning;

	/**
	 * get analyze result
	 * what data structure returned you could find in the front of this file 
	 */
	this.getResult = () => resultObject;
}
//export GroupBy enums
AnalyzeCore.GroupBy = GROUP_BY;

// for typescript intellisense
/**
* @type {AnalyzeCoreClass}
*/
//@ts-ignore
let exportClass = AnalyzeCore;
module.exports = exportClass;
