//@ts-check
/// <reference path="../index.d.ts" />
/// <reference path="../echarts.d.ts" />

let i18n = require('../i18n/index');

/** 1 second = 1000 ms */
const ONE_SECOND = 1000;
/** 1 minute = 60 * 1000 ms */
const ONE_MINUTE = 60 * ONE_SECOND;
/** 1 hour = 60 * 60 * 1000 ms */
const ONE_HOUR = 60 * ONE_MINUTE;

let Utils = {

	expandGroupByDaysObject,
	expandAndShortGroupByHoursObject,

	ONE_SECOND,
	ONE_MINUTE,
	ONE_HOUR,

	orderByName,
	orderByWatchingTime,

	object2array,

	generateChartOption,

	merge,
	getShortProjectName,

	getReadableTime,
	getReadableDateDependentOnSize,
	getReadableDateWithAbbr,

	getYYYYMMDD, getMMDD, getHH00,
	getChartDom,

	basename,

	maxInArray
};
module.exports = Utils;

/**
 * @param {CodingWatchingMap} obj
 * @returns {CodingWatchingMap}
 */
function expandGroupByDaysObject(obj, startDate, endDate) {
	startDate = new Date(startDate);
	if (startDate.getTime() > endDate.getTime())
		throw new Error('startDate could not bigger than endDate');
	let endDateString = getYYYYMMDD(endDate),
		cursorDateString = '';
	let result = {};
	do {
		cursorDateString = getYYYYMMDD(startDate)
		result[cursorDateString] = obj[cursorDateString] || getEmptyCodingWatchingObject();
		startDate.setDate(startDate.getDate() + 1);
	} while (endDateString > cursorDateString);
	return result;
}

/**
 * @param {CodingWatchingMap} obj
 * @returns {CodingWatchingMap}
 */
function expandAndShortGroupByHoursObject(obj, endDate) {
	let result = {}, i = 24,
		cursorDate = new Date(endDate),
		cursorDateString = '';
	while (i--) {
		cursorDateString = getYYYYMMDD_HHMM(cursorDate);
		result[cursorDateString] = obj[cursorDateString] || getEmptyCodingWatchingObject();
		cursorDate.setHours(cursorDate.getHours() - 1);
	}
	return result;
}

/**
 * @template T
 * @param {T[]} array
 * @param {(a:T,b:T)=>T} maxFunc
 * @returns {T}
 */
function maxInArray(array, maxFunc) {
	let max = array[0];
	array.forEach(item => max = maxFunc(max, item));
	return max;
}

function basename(path = '', ext = '') {
	let index = path.lastIndexOf('/');
	path = index < 0 ? path : path.slice(index + 1);
	if (ext && path.endsWith(ext))
		path = path.slice(0, -ext.length);
	return path;
}


/**
 * @param {string} chartId
 * @param {JQuery} [parentJqDom]
 */
function getChartDom(chartId, parentJqDom) {
	return (parentJqDom || $(document)).find(`[data-chart="${chartId}"]`);
}

function getEmptyCodingWatchingObject() { return { coding: 0, watching: 0 }; }

/**
 * @param {string} projectName
 * @returns  {string}
 */
function getShortProjectName(projectName) { return (projectName.match(/.*(^|[\\/])(.+)$/) || [])[2] || projectName }


/** @param {string|number} num */
function to2(num) { return num < 10 ? `0${num}` : `${num}` }

/** @param {Date} date */
function getYYYYMMDD(date){ return `${date.getFullYear()}-${to2(date.getMonth() + 1)}-${to2(date.getDate())}`}

/** @param {Date} date */
function getYYYYMMDD_HHMM(date) { return `${getYYYYMMDD(date)} ${to2(date.getHours())}:00` }

/** @param {Date} date */
function getMMDD(date) { return `${to2(date.getMonth() + 1)}-${to2(date.getDate())}`}

/** @param {Date} date */
function getHH00(date) { return `${to2(date.getHours())}:00`}

/**
 * desc default is false:  ASC small => big
 * @param {any[]} array
 * @param {boolean} [desc]
 * @returns {any[]}
 */
function orderByName(array, desc = false) {
	let v0 = desc ? -1 : 1, v1 = -v0;
	array.sort((a, b) => a.name > b.name ? v0 : v1);
	return array;
}
/**
 * desc default is false:  ASC small => big
 * @template T
 * @param {(T&CodingWatchingObject)[]} array
 * @param {boolean} [desc]
 * @returns {(T&CodingWatchingObject)[]}
 */
function orderByWatchingTime(array, desc = false) {
	array.sort(desc ? (a, b) => b.watching - a.watching : (a, b) => a.watching - b.watching);
	return array;
}
/**
 * convert object to array. each array item has a "name" field
 * @param {Object} object
 * @returns Object[]
 */
function object2array(object) {
	return Object.keys(object).map(name => { object[name].name = name; return object[name]; });
}


/**
 * @param {string} name
 * @param {'line'|'pie'|'bar'} type
 * @param {any} data
 * @param {any[]} options
 * @returns {EChartOption}
 */
function generateChartOption(name, type, data, ...options) {
	//@ts-ignore
	return $.extend(true, {}, { name, type, data }, ...options);
}

/**
 * @param {any[]} objects
 * @returns any
 */
function merge(...objects) {
	return $.extend(true, {}, ...objects);
}

/**
 * convert a millisecond number to readable duration string
 * @param {number} ms
 * @param {boolean} noHours = false
 * @param {boolean} ignoreSeconds = true (ignore seconds if there have minutes or hours)
 */
function getReadableTime(ms, noHours = false, ignoreSeconds = true) {
	let s = Math.floor(ms / 1000),
		m = Math.floor(s / 60),
		h = Math.floor(m / 60);
	s = s - m * 60;
	if (noHours)
		h = 0;
	else
		m = m - h * 60;
	if (ignoreSeconds && (m > 0 || h > 0) )
		s = 0;
	return i18n.getReadableTimeString(h, m, s);
}

/** @param {string[]} yyyymmddArray */
function getReadableDateDependentOnSize(yyyymmddArray) {
	if (yyyymmddArray.length <= 14)
		return yyyymmddArray.map(getReadableDateWithAbbr);
	if (yyyymmddArray.length <= 31)
		return yyyymmddArray.map(v => v.slice(5));//remove year
	return yyyymmddArray;
}

/**
 * For example: '2017-11-24' => '11-24 Fri.' (dependent by i18n)
 * @param {string} yyyymmddString
 */
function getReadableDateWithAbbr(yyyymmddString) {
	// TODO: 1 => 1st 2 => 2nd 3 => 3rd 4 => 4th ...
	let [y, m, d] = yyyymmddString.split('-');
	let date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
	let abbr = i18n.getAbbrOfDayOfTheWeek(date);
	return `${abbr} ${m}-${d}`;
}
