//@ts-check

let fs = require('fs-extra'),
	path = require('path');

const LOG_FOLDER = `${__dirname}/../../log`;

/** @type {{write: (fn: Function) => any}[]} */
const logInstances = [];
let beforeExitSavedLog = false;

process.on('beforeExit', () => {
	if (beforeExitSavedLog) return;
	beforeExitSavedLog = true;

	return Promise.all(logInstances.map(log => new Promise(resolve => log.write(resolve))))
		.then(() => console.log(`LogFile#beforeExit: ${logInstances.length} log files be saved to disk!`))
});

module.exports = { createLogFile };

function createLogFile(fileName) {
	const log = _createLogFile(fileName);
	logInstances.push(log);
	return log;
}

function _createLogFile(fileName) {
	let filePath = path.join(LOG_FOLDER, fileName + '.log');

	if (!fs.existsSync(LOG_FOLDER))
		fs.mkdirsSync(LOG_FOLDER);

	fs.writeFileSync(filePath, '');

	let lines = [];
	return { appendLine, write };

	/** @param {string} line */
	function appendLine(line) {
		// const escaped = line.match(/\033\[[\d;]+m/g);
		// console.log(line);
		lines.push(line);
	}
	function write(then) {
		fs.writeFile(filePath, lines.join('\n'), then);
	}
}
