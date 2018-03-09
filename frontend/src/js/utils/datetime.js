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

module.exports = {
	ONE_SECOND,
	ONE_MINUTE,
	ONE_HOUR,

	getStartOfDay,
	getEndOfDay,
	getStartOfHour,
	getEndOfHour,

	getReadableTime,
	getYYYYMMDD, getYYYYMMDD_HHMM,
	getMMDD, getHH00,

	getReadableDateDependentOnSize,
	getReadableDateWithAbbr,

	now,

	subtractDays,
	addDays,
};

function now() { return new Date(); }

function subtractDays(date, days = 0) { return addDays(date, -days); }

/**
 * add some days base on date, for example: return tomorrow if `days` equals  1
 * @param {Date} date
 * @param {number} days
 */
function addDays(date, days = 0) {
	let newDate = new Date(date);
	if (days == 0)
		return newDate;
	newDate.setDate(newDate.getDate() + days);
	return newDate;
}

function getStartOfDay(date = now()) {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

function getEndOfDay(date = now()) {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function getStartOfHour(date = now()) {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), 0, 0, 0);
}
function getEndOfHour(date = now()) {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), 59, 59, 999);
}

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
