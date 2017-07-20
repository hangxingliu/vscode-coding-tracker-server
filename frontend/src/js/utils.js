//@ts-check
/// <reference path="types/index.d.ts" />
/// <reference path="types/echarts.d.ts" />

let Utils = {
	expandGroupByDaysObject: (obj, startDate, endDate) => {
		startDate = new Date(startDate);
		if (startDate.getTime() > endDate.getTime())
			throw new Error('startDate could not bigger than endDate');	
		var endDateString = getYYYYMMDD(endDate),	
			cursorDateString = '';
		var result = {};
		do {
			cursorDateString = getYYYYMMDD(startDate)
			result[cursorDateString] = obj[cursorDateString] || getEmptyCodingWatchingObject();
			startDate.setDate(startDate.getDate() + 1);
		} while (endDateString > cursorDateString);
		return result; 	
	},
	
	expandAndShortGroupByHoursObject: (obj, dayDate) => {
		var result = {}, i = 24,
			cursorDate = new Date(dayDate),
			cursorDateString = '';
		while (i--) {
			cursorDateString = getHHMM(cursorDate);
			result[cursorDateString] = obj[cursorDateString] || getEmptyCodingWatchingObject();
			cursorDate.setHours(cursorDate.getHours() - 1);
		}
		return result;
	},

	orderByName,
	orderByWatchingTime,
		
	object2array,

	convertUnit2Hour: data => convertTimeUnits(data, 3600 * 1000),
	convertUnit2Minutes: data => convertTimeUnits(data, 60 * 1000),

	getEachFieldToFixed2,
	generateChartOption,

	merge,
	getShortProjectName,

	hasLocalStorage,

	getReadableTimeString,
	getReadableTimeStringArray
};
module.exports = Utils;

function hasLocalStorage() { return typeof localStorage != 'undefined'; }

function getEmptyCodingWatchingObject() { return { coding: 0, watching: 0 }; }

/**
 * @param {string} projectName 
 * @returns  {string}
 */
function getShortProjectName(projectName) { return (projectName.match(/.*(^|[\\/])(.+)$/) || [0, 0, projectName])[2] }

/**
 * @param {string|number} num 
 * @returns {string}
 */
function to2(num) { return num == 0 ? '00' : num < 10 ? `0${num}` : `${num}` }
/**
 * @param {Date} date 
 * @returns {string}
 */
function getYYYYMMDD(date){ return `${date.getFullYear()}-${to2(date.getMonth() + 1)}-${to2(date.getDate())}`}
/**
 * @param {Date} date 
 * @returns {string}
 */
function getHHMM(date) { return `${getYYYYMMDD(date)} ${to2(date.getHours())}:00` }

/**
 * @param {any[]} array 
 * @param {boolean} [desc]
 * @returns {any[]}
 */
function orderByName(array, desc) {
	let v0 = desc ? -1 : 1, v1 = -v0;
	array.sort((a, b) => a.name > b.name ? v0 : v1);
	return array;
}
/**
 * @param {any[]} array 
 * @param {boolean} [desc]
 * @returns {any[]}
 */
function orderByWatchingTime(array, desc) {
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
 * Get each field of item in the array. and .toFixed(2)
 * @param {any[]} array 
 * @param {string} fieldName 
 */
function getEachFieldToFixed2(array, fieldName) {
	return array.map(it => Number(it[fieldName]).toFixed(2));
}

/**
 * @param {string} name 
 * @param {'line'|'pie'|'bar'} type 
 * @param {any} data 
 * @param {any[]} options
 * @returns {EChartOption}
 */
function generateChartOption(name, type, data, ...options) {
	return $.extend(true, {}, { name, type, data }, ...options);
}
/**
 * convert each value in data(object) coding/watching time unit from ms to minValue.
 * such as 120 × 1000 => 2 (minValue=60 × 1000)
 * @param {object|any[]} data 
 * @param {number} minValue 
 * @returns  {any}
 */
function convertTimeUnits(data, minValue) {
	let result = Array.isArray(data) ? [] : {};
	for (let key in data) {
		let it = data[key];
		result[key] = {
			coding: it.coding / minValue,
			watching: it.watching / minValue
		};
	}
	return result;
}
/**
 * @param {any[]} objects 
 * @returns any
 */
function merge(...objects) {
	return $.extend(true, {}, ...objects);
}
/**
 * convert a decimal hour value in a hour minute format
 * such as 1.3 => 1h 18m
 * @param {number} data 
 * @returns {string}
 */
function getReadableTimeString(data) { 
	let hoursAsInt = Math.floor(data);
	let hoursAsText = '';

	if (hoursAsInt) {
		hoursAsText = `${hoursAsInt}h`;
	}

	return `${hoursAsText} ${Math.floor(data * 60)}m`;
}

/**
 * convert a decimal data(object) coding/watching time unit in a hour minute format
 * such as 1.3 => 1h 18m
 * @param {object} data 
 * @returns {object}
 */
function getReadableTimeStringArray(data) { 
	let result = Array.isArray(data) ? [] : {};
	data = Utils.convertUnit2Hour(data);
	for (let key in data) {
		let it = data[key];
		let hoursAsInt = {
			coding: Math.floor(it.coding),
			watching: Math.floor(it.watching),
		};
		let hoursAsText = {
			coding: '',
			watching: '',
		};

		if (hoursAsInt.coding) {
			hoursAsText.coding = `${hoursAsInt.coding}h`;
		}

		if (hoursAsInt.watching) {
			hoursAsText.watching = `${hoursAsInt.watching}h`;
		}

		result[key] = {
			coding: `${hoursAsText.coding} ${Math.floor(it.coding * 60)}m`,
			watching: `${hoursAsText.watching} ${Math.floor(it.watching * 60)}m`,
		};
	}
	return result;
}