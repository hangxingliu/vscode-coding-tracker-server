//@ts-check

"use strict";
let Path = require('path'),
	Fs = require('fs'),
	log = require('./Log'),
	Version = require('./Version');	

const EMPTY_VCS = encodeURIComponent('::');
const TYPE = { 'open': 0, 'look': 1, 'code': 2 };
const MONTH = "123456789ABC".split('');

let storagePath = '';

module.exports = {
	init: function (_storagePath) { storagePath = _storagePath; },
	write: function (_data) {
		let fname = getStorageFilePath(_data.time);
		if (!fname)
			return error("undefined", { stack: 'Could not get a filename from upload time field: ' + _data.time });
		getFileVersion(fname, version => {
			let data = getStorableData(_data); 
			try {
				if (version == null)
					Fs.writeFileSync(fname, Version.storage + '\n' + data);
				else if (version == '3.0') //Upgrade
					upgradeFrom3To4(fname);
				else if (version != '4.0')
					throw `unsupported storage version ${version}`;
				Fs.appendFileSync(fname, data);
				//@ts-ignore
				global.DEBUG && debug(fname, _data);
			}catch (ex) { 
				error(ex);
			}
		});
	}
};
function error(fname, err) { log.error(`Stored data into file( ${fname} ) fail!\n` + err.stack); }
function debug(fname, _data) { 
	let long = (_data.long / 1000).toFixed(2),
		name = _data.file;
	log.success(`Stored success:  ${fname} ( ${_data.type} ${long}s: ${name} )`);
}

/**
 * @param {string} fname
 * @param {(version: string) => void} callback
 */
function getFileVersion(fname, callback) { 
	if (!Fs.existsSync(fname))
		return callback(null);
	let stream = Fs.createReadStream(fname, { fd: null, encoding: 'utf8' });
	let lock = 0;
	stream.on('error', () => callback(null));
	stream.on('readable', () => { 
		if (lock++) return;
		let version = stream.read(3);
		stream.destroy();
		callback(version ? (version.length != 3 ? null : version) : null);
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
	return Path.join(storagePath, getStorageFileName(new Date(Number(paramTime) )));
}
function getStorageFileName(date) {
	let part = [date.getFullYear() % 100, MONTH[date.getMonth()] || 0, date.getDate()];
	if (part[2] < 10) part[2] = `0${part[2]}`;
	return part.join('') + '.db';
}