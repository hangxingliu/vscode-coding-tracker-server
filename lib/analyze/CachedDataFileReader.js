/*
	@TODO: wait for test

	validity of cache:

	mtime > 1 week:  1  day
	mtime > 1 day:   1  hour
	else:            30 seconds
*/
//@ts-check
/// <reference path="../types/CachedDataFileReader.d.ts" />

const DEBUG_LOG = true;

const fs = require('fs-extra');
const path = require('path');

const ONE_MINUTE = 1000 * 60;
const ONE_HOUR = 1000 * 3600;
const ONE_DAY = ONE_HOUR * 24;
const ONE_WEEK = ONE_DAY * 7;

module.exports = {
	createCachedDataFileReader,
};

/**
 * @param {string} dataFileDir
 * @returns {CachedDataFileReader}
 */
function createCachedDataFileReader(dataFileDir) {
	/** @type {{[fileName: string]: {to: number; content: string}}} */
	let caches = {};

	return { clearAllCache, clearCache, prepareFiles, readFile };
	function clearAllCache() {
		for (let key in caches)
			delete caches[key];
		caches = {};

		if (DEBUG_LOG)
			console.log('CachedDataFileReader: clearCache');
	}

	/**
	 * @param {string} fileName
	 */
	function clearCache(fileName) {
		if (fileName in caches)
			delete caches[fileName];

		if (DEBUG_LOG)
			console.log(`CachedDataFileReader: clearCache ${fileName}`);
	}

	/**
	 * @param {string[]} fileList
	 */
	function prepareFiles(fileList) {
		const length = fileList.length;
		const prepare = []
			.concat(fileList.map(file => fs.readFile(path.join(dataFileDir, file), 'utf8')))
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
			if (cache.to > now) {
				if (DEBUG_LOG) {
					const SEC = ((cache.to - now) / 1000).toFixed(0);
					console.log(`CachedDataFileReader: readFile ${fileName} from cache (life: ${SEC}s)`);
				}

				return Promise.resolve(cache.content);
			}
			delete caches[fileName];
		}
		return Promise.all([
			fs.readFile(path.join(dataFileDir, fileName), 'utf8'),
			fs.stat(fileName),
		]).then(([content, stat]) => {
			let to = 0;
			if (stat && (stat.mtime instanceof Date)) {
				to = getCacheTo(stat.mtime.getTime(), now);
				caches[fileName] = { to , content };
			}

			if (DEBUG_LOG) {
				const SEC = to ? `${((to - now) / 1000).toFixed(0)}s` : '--';
				console.log(`CachedDataFileReader: readFile ${fileName} (add cache: ${SEC})`);
			}

			return content;
		})
	}
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
