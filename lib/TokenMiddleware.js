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

/**
 * @type {{[token: string]: {
	 role: "admin"|"upload"|"report";
	 computerIdMap?: { [id: string]: true; };
	}}}
 */
let tokenMap = {};

/** @type {string} */
let loadedTokenFile = null;

module.exports = { initMiddleware, getMiddleware, getTokenCountString, getLoadedTokenFile };

function on403(req, res, extraInfo = '') {
	const extraMsg = extraInfo ? ` (${extraInfo})` : '';
	const error = `Token is invalid: ${req.originalUrl}${extraMsg}`;
	log.error(error);
	res.writeHead(403, JSON_HEADER);
	res.write(JSON.stringify({ error }));
	res.end();
}

function initMiddleware() {
	const cliArgs = cliArgsParser.get();
	const defaultTokenFile = cliArgsParser.getDefaultTokenFile();

	// console.log(cliArgs.tokenFile, cliArgs.noTokenFile, cliArgs.disableTokenFile);
	loadedTokenFile = null;
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
			loadedTokenFile = tokenFile;

			adminToken = tokenFileObj.adminToken;
			viewReportToken = tokenFileObj.viewReportToken;
			uploadToken = tokenFileObj.uploadToken || [];
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

	// storage token into tokenMap
	for (let it of adminToken)
		tokenMap[it.token] = { role: 'admin' };
	if (viewReportToken)
		for (let it of viewReportToken)
			tokenMap[it.token] = { role: 'report' };
	for (let it of uploadToken) {
		const computerIdMap = {};
		if (it.computerId)
			it.computerId.forEach(id => { computerIdMap[id] = true });
		tokenMap[it.token] = { role: 'upload', computerIdMap: it.computerId ? computerIdMap : null };
	}
}

function getTokenCountString() {
	return [
		`adminToken: ${adminToken.length}; `,
		viewReportToken ? `viewReportToken: ${viewReportToken.length}; ` : '',
		`uploadToken: ${uploadToken.length};`
	].join('');
}
function getLoadedTokenFile() {
	return loadedTokenFile;
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
		const { role } = it;
		if (role === 'admin')
			return next();

		if (role !== type)
			return on403(req, res);

		if (role === 'upload' && it.computerIdMap) {
			const pcid = req.body && req.body.pcid;
			if (typeof pcid !== 'string' || !pcid || !(pcid in it.computerIdMap))
				return on403(req, res, `pcid ${JSON.stringify(pcid)} is invalid!`);
		}

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
