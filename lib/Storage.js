//@ts-check

"use strict";
let Path = require('path'),
	Fs = require('fs'),
	log = require('./Log'),
	Version = require('./Version'),
	createQueue = require('./StorageQueue');

const EMPTY_VCS = '::';
const TYPE = { 'open': 0, 'look': 1, 'code': 2 };
const MONTH = "123456789ABC".split('');
const EMPTY_ERROR = { message: '', stack: '' };

/** @type {{[fileName: string]: string}} */
let fileVersionCache = {};

let storagePath = '';

let queue = createQueue(write);

module.exports = {
	init: function (path) { storagePath = path; },
	write: function (data) {
		let { time } = data;
		let file = getStorageFilePath(time);
		if (!file)
			return log.error('Storage failed: could not get filename from upload time: ' + time);

		// add into queue
		let description = `${data.type} (${data.file}) ${getReadableDuration(data.long)}`;
		queue.add({ file, description, data: getStorableData(data) });
	}
};

/**
 * This is core storage function will be called by variable `queue`
 */
function write({ file, description, data }) {
	getFileVersion(file, (error, version) => {
		if (error)
			return recordError(file, error), queue.retry();
		try {

			if (version == null) {
				log.info(`new storage data file: ${file}`);
				Fs.writeFileSync(file, Version.storage + '\n');
			} else if (version == '3.0') { //Upgrade
				upgradeFrom3To4(file);
			} else if (version != '4.0') {
				throw `unsupported storage version ${version}`;
			}

			Fs.appendFileSync(file, data);
			//@ts-ignore
			global.DEBUG && log.success(`Storage success: ${description} => ${file}`);

			queue.next();
		}catch (ex) {
			recordError(ex);
		}
	});
}


function recordError(fname, error) {
	if (!error)
		error = EMPTY_ERROR;
	log.error(`Stored failed: ${error.message} => ${fname}\n` + error.stack);
}
/** @param {number} ms */
function getReadableDuration(ms) {
	let s = Math.floor(ms / 1000), m = 0;
	if (s > 60) { m = Math.floor(s / 60); s -= m * 60; }
	return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

/**
 * @param {string} fname
 * @param {(err: Error, version: string) => void} callback
 */
function getFileVersion(fname, callback) {
	if (!Fs.existsSync(fname))
		return callback(null, null);
	//File is existed with version cache information
	if (fname in fileVersionCache)
		return callback(null, fileVersionCache[fname]);

	let stream = Fs.createReadStream(fname, { fd: null, encoding: 'utf8' }), lock = 0;
	stream.on('error', error => callback(error, null));
	stream.on('readable', () => {
		if (lock++) return;

		let rawVersion = stream.read(3);
		stream.destroy();

		let version = null;
		if (rawVersion && rawVersion.length == 3)
			version = String(rawVersion);

		callback(null, fileVersionCache[fname] = version);
	});
}

function upgradeFrom3To4(fname) {
	let lines = Fs.readFileSync(fname, 'utf8').split(/[\n\r]+/);
	let result = ['4.0'];
	lines.shift();
	for (let line of lines)
		if (line.trim())
			result.push(line + ` ${EMPTY_VCS} 0 0 0 0`);
	Fs.writeFileSync(fname, result.join('\n') + '\n');
	log.info(fname + ' has been upgraded to version 4.0');
}

function getStorableData(data) {
	let ret = [
		(TYPE[data.type] || 0),
		data.time,
		data.long,

		data.lang,
		data.file,
		data.proj,
		data.pcid
	];

	for (let i = 3; i < ret.length; i++)
		ret[i] = encodeURIComponent(ret[i]);

	// 4.0:
	return ret.concat([
		getStorableVCSInfo(data),
		data.line || 0,
		data.char || 0,
		0, 0
	]).join(' ') + '\n';
}
function getStorableVCSInfo(data) {
	return [data.vcs_type, data.vcs_repo, data.vcs_branch]
		.map(str => encodeURIComponent(str || ''))
		.join(':');
}

function getStorageFilePath(paramTime) {
	let date = new Date(Number(paramTime));
	let y = date.getFullYear(), m = date.getMonth(), d = date.getDate();
	if (isNaN(y) || isNaN(m) || isNaN(d))
		return null;
	// if (!storagePath)
	// 	return null;
	return Path.join(storagePath, ( y % 100 ) + MONTH[m] + (d < 10 ? `0${d}` : d) + '.db');
}
