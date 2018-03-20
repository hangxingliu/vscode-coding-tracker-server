//@ts-check
/// <reference path="../index.d.ts" />
/// <reference path="../echarts.d.ts" />

let dateTime = require('./datetime');

let Utils = {
	expandGroupByDaysObject,
	expandAndShortGroupByHoursObject,

	orderByName,
	orderByWatchingTime,

	object2array,

	generateChartOption,

	merge,
	getShortProjectName,

	getChartDom,

	basename,

	maxInArray,

	escapeHtml
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
	let endDateString = dateTime.getYYYYMMDD(endDate),
		cursorDateString = '';
	let result = {};
	do {
		cursorDateString = dateTime.getYYYYMMDD(startDate)
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
		cursorDateString = dateTime.getYYYYMMDD_HHMM(cursorDate);
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
 * @template T
 * @param {{[x: string]: T}} object
 * @returns {({name: string}&T)[]}
 */
function object2array(object) {
	return Object.keys(object).map(name => Object.assign({name}, object[name]));
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

/** @param {string} str */
function escapeHtml(str) {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}
