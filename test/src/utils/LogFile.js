//@ts-check

let fs = require('fs-extra'),
	path = require('path');

const LOG_FOLDER = `${__dirname}/../../log`;

module.exports = { createLogFile };

function createLogFile(fileName) {
	let filePath = path.join(LOG_FOLDER, fileName + '.log');

	if (!fs.existsSync(LOG_FOLDER))
		fs.mkdirsSync(LOG_FOLDER);

	fs.writeFileSync(filePath, '');

	let lines = [];
	return { appendLine, write };


	function appendLine(line) { lines.push(line); }
	function write(then) {
		fs.writeFile(filePath, lines.join('\n'), then);
	}
}
