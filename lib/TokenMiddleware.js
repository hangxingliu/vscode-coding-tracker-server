//@ts-check

const fs = require('fs-extra');
const log = require('./Log');
const cliArgsParser = require('./ParseCliArguments');

const JSON_HEADER = { "Content-Type": "application/json; charset=utf-8" };

/** @type {{token: string}[]} */
let adminToken = [];

/** @type {{token: string}[]} */
let viewReportToken = []; // `null` for public report

/** @type {{token: string; computerId: string[]}[]} */
let uploadToken = [];

/** @type {{[token: string]: {role: "admin"|"upload"|"report"; [x: string]: any}}} */
let tokenMap = {};

module.exports = { initMiddleware, getMiddleware, getTokenCountStr };

function on403(req, res) {
	const error = `Token is invalid: ${req.originalUrl}`;
	log.error(`Token is invalid: ${req.originalUrl}`);
	res.writeHead(403, JSON_HEADER);
	res.write(JSON.stringify({ error }));
	res.end();
}

function initMiddleware() {
	const cliArgs = cliArgsParser.get();
	const defaultTokenFile = cliArgsParser.getDefaultTokenFile();

	// console.log(cliArgs.tokenFile, cliArgs.noTokenFile, cliArgs.disableTokenFile);
	let loadedTokenFile = false;
	if (cliArgs.noTokenFile === false) {
		if (typeof cliArgs.tokenFile === 'string') {
			if (!fs.existsSync(cliArgs.tokenFile)) {
				log.error(`token file ${JSON.stringify(cliArgs.tokenFile)} is not existed!`);
				process.exit(1);
			}
		} else if (fs.existsSync(defaultTokenFile)) {
			cliArgs.tokenFile = defaultTokenFile;
		}
		const { tokenFile } = cliArgs;
		if (tokenFile) {
			const tokenFileObj = loadTokenFile(tokenFile);
			loadedTokenFile = true;

			adminToken = tokenFileObj.adminToken;
			viewReportToken = tokenFileObj.viewReportToken;
			uploadToken = tokenFileObj.uploadToken;
		}
	}

	if (typeof cliArgs.token !== 'string') {
		if (!loadedTokenFile) {
			cliArgs.token = cliArgsParser.getDefaultAdminToken();
			cliArgs.isDefaultAdminToken = true;
			adminToken.push({ token: cliArgs.token });
		}
	} else {
		// token from cli
		adminToken.push({ token: cliArgs.token });
	}

	if (cliArgs.publicReport)
		viewReportToken = null;

	for (let it of adminToken) tokenMap[it.token] = { role: 'admin' };
	for (let it of uploadToken) tokenMap[it.token] = { role: 'upload', computerId: it.computerId };
	if(viewReportToken)
		for (let it of viewReportToken) tokenMap[it.token] = { role: 'report' };
}

function getTokenCountStr() {
	return [
		`adminToken: ${adminToken.length}; `,
		viewReportToken ? `viewReportToken: ${viewReportToken.length}; ` : '',
		`uploadToken: ${uploadToken.length};`
	].join('');
}

/**
 * @param {"upload"|"report"|"admin"} type
 */
function getMiddleware(type) {
	if (type === 'report' && !viewReportToken)
		return (req, res, next) => next(); // public report page

	return function tokenMiddlewareCallback(req, res, next) {
		let { token } = req.body;
		if (!token) token = req.query.token;
		if (typeof token !== 'string' || !token)
			return on403(req, res);

		if (!(token in tokenMap))
			return on403(req, res);
		const it = tokenMap[token];
		if (it.role === 'admin')
			return next();

		if (it.role !== type)
			return on403(req, res);

		return next();
	};
}


function loadTokenFile(filePath) {
	try {
		return fs.readJSONSync(filePath);
	} catch (err) {
		log.error(`could not parse token file ${JSON.stringify(filePath)}\n${err.stack}`);
		process.exit(1);
	}
}
