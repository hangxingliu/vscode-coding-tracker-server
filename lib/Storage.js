let Path = require('path'),
	Fs = require('fs'),
	log = require('./Log'),
	version = require('./Version');	

const typeMap = { 'open': 0, 'look': 1, 'code': 2 };
const monthArray = "123456789ABC".split('');

let storagePath = '';

module.exports = {
	init: function (_storagePath) {
		storagePath = _storagePath;
	},
	write: function (data) {
		let fname = getStorageFilePath(data.time),
			storableData = getStorableData(data);
		if (!fname)
			return error("undefined", { stack: 'Could not get a filename from upload time field: ' + data.time });
		try {
			if (Fs.existsSync(fname) && Fs.statSync(fname).size > 0)
				Fs.appendFileSync(fname, storableData);
			else
				Fs.writeFileSync(fname, version.storage + '\n' + storableData);
		} catch (err) {
			return error(err);
		}
		if (global.DEBUG) {
			let opLong = (data.long / 1000).toFixed(2),
				opName = decodeURIComponent(data.file);
			log.success(`Stored success:  ${fname} ( ${data.type} ${opLong}s: ${opName} )`);
		}
	}
};
function error(fname, err) { log.error(`Stored data into file( ${fname} ) fail!\n` + err.stack); }
function getStorableData(data) {
	let ret = [
		(typeMap[data.type] || 0),
		data.time,
		data.long,
		data.lang,
		data.file,
		data.proj,
		data.pcid
	];
	for (let i = 3; i < ret.length; i++) ret[i] = encodeURIComponent(ret[i]);
	return ret.join(' ') + '\n';
}
function getStorageFilePath(paramTime) {
	return Path.join(storagePath, getStorageFileName(new Date(Number(paramTime) )));
}
function getStorageFileName(date) {
	let part = [date.getFullYear() % 100, monthArray[date.getMonth()] || 0, date.getDate()];
	if (part[2] < 10) part[2] = `0${part[2]}`;
	return part.join('') + '.db';
}