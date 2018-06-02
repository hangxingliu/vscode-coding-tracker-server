/*
	@TODO: wait for test

	validity of cache:

	mtime > 1 week:  1  day
	mtime > 1 day:   1  hour
	else:            30 seconds
*/

//@ts-check
const fs = require('fs-extra');
const path = require('path');

const ONE_MINUTE = 1000 * 60;
const ONE_HOUR = 1000 * 3600;
const ONE_DAY = ONE_HOUR * 24;
const ONE_WEEK = ONE_DAY * 7;

let baseDir = '';

/** @type {{[fileName: string]: {to: number; content: string}}} */
let caches = {};

module.exports = {
	init, prepareFiles, readFile, clearCache
};

/**
 * @param {string} dataFileDir
 */
function init(dataFileDir) {
	baseDir = dataFileDir;
}

function clearCache() {
	for (let key in caches)
		delete caches[key];
	caches = {};
}

/**
 * @param {string[]} fileList
 */
function prepareFiles(fileList) {
	const length = fileList.length;
	const prepare = []
		.concat(fileList.map(file => fs.readFile(path.join(baseDir, file), 'utf8')))
		.concat(fileList.map(file => fs.stat(file)));

	return Promise.all(prepare)
		.then(array => {
			const now = Date.now();
			let count = 0;
			for (let i = 0; i < length; i++) {
				const stat = array[length + i];
				if (!stat || !(stat.mtime instanceof Date))
					continue;
				count++;
				caches[fileList[i]] = { to: getCacheTo(stat.mtime.getTime(), now), content: array[i] };
			}
			return count;
		});
}

/**
 * @param {string} fileName
 */
function readFile(fileName) {
	const cache = caches[fileName];
	const now = Date.now();
	if (cache) {
		if (cache.to > now)
			return Promise.resolve(cache.content);
		delete caches[fileName];
	}
	return Promise.all([
		fs.readFile(path.join(baseDir, fileName), 'utf8'),
		fs.stat(fileName),
	]).then(([content, stat]) => {
		if (stat && (stat.mtime instanceof Date))
			caches[fileName] = { to: getCacheTo(stat.mtime.getTime(), now), content };
		return content;
	})
}


/**
 * @param {number} mtime
 * @param {number} now
 */
function getCacheTo(mtime, now) {
	const sub = now - mtime;
	if (sub > ONE_WEEK)
		return now + ONE_DAY;
	if (sub > ONE_DAY)
		return now + ONE_HOUR;
	return now + ONE_MINUTE;
}
