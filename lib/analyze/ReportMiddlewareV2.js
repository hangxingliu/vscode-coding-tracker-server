//@ts-check
/// <reference path="../types/AnalyzeCore.d.ts" />

"use strict";
const Analyzer = require('./AnalyzeCore'),
	{ GroupBy } = Analyzer;

const GROUP_BY_OVERVIEW = GroupBy.DAY | GroupBy.LANGUAGE | GroupBy.FILE | GroupBy.PROJECT | GroupBy.COMPUTER;
const GROUP_BY_HOURS = GroupBy.HOUR;
const GROUP_BY_HOURS_DETAILED = GroupBy.HOUR | GroupBy.PROJECT | GroupBy.FILE;
const GROUP_BY_PROJECTS = GroupBy.DAY | GroupBy.FILE | GroupBy.LANGUAGE | GroupBy.COMPUTER;
const GROUP_BY_LANGUAGES = GroupBy.LANGUAGE;

const HEADER_JSON = { "Content-Type": "application/json; charset=utf-8" };
const ROUTER_MAP = {
	//Required parameters:
	//	week-cfg: {0: sunday; 1: monday}
	//  tz-offset: (timezone offset UTC)
	'GET /overview': [overview, 'from', 'to'],
	'GET /hours': [hours, 'from', 'to'],
	'GET /hours-detailed': [hoursDetailed, 'from', 'to'],
	'GET /project': [project, 'from', 'to', 'project'],
	'GET /languages': [languages, 'from', 'to'],
	'GET /vcs': [vcs, 'from', 'to'],
};

let dbPath = 'this value will be set in init(databasePath) method';
module.exports = { init: databaseFolder => (dbPath = databaseFolder, middleware) };


function overview(from, to, req, res) { return analyze(res, from, to, GROUP_BY_OVERVIEW); }
function hours(from, to, req, res) { return analyze(res, from, to, GROUP_BY_HOURS); }
function hoursDetailed(from, to, req, res) { return analyze(res, from, to, GROUP_BY_HOURS_DETAILED); }
function languages(from, to, req, res) { return analyze(res, from, to, GROUP_BY_LANGUAGES); }
function vcs(from, to, req, res) { return analyze(res, from, to, GroupBy.VCS); }
function project(from, to, project, req, res) {
	if (!project)
		return responseError(res, 400, 'param project is invalid!');
	let projects = project.split(':');
	return analyze(res, from, to, GROUP_BY_PROJECTS, { project: projects });
}

/**
 * @param {any} res
 * @param {string} _from
 * @param {string} _to
 * @param {number} groupBy
 * @param {any} [filter]
 */
function analyze(res, _from, _to, groupBy, filter) {
	let from = parseInt(_from), to = parseInt(_to);
	if (!from) return responseError(res, 400, 'param from is invalid!');
	if (!to) return responseError(res, 400, 'param to is invalid!');

	let analyze = new Analyzer(dbPath);
	analyze.setGroupBy(groupBy);
	filter && analyze.setFilter(filter);

	let success = analyze.analyze(new Date(from), new Date(to), false);
	if (!success)
		return responseError(res, 500, analyze.getError());
	res.json(analyze.getResult());
}

//-------------- Core middleware ---------------------
function middleware(req, res, next) { //eslint-disable-line no-unused-vars
	let routerName = getRouterName(),
		match = ROUTER_MAP[routerName];
	if (!match)
		return responseError(res, 404, `${routerName} not found!`);

	let params = [];
	for (let i = 1; i < match.length; i++) {
		let name = match[i];
		params.push(req.query[name] || (req.body && req.body[name]) || void 0);
	}
	params.push(req);
	params.push(res);

	match[0].apply(this, params);

	function getRouterName() {
		let { method, url } = req, index = url.indexOf('?');
		if (index != -1) url = url.slice(0, index);
		return `${method} ${url}`;
	}
}
function responseError(res, code, message) {
	res.writeHead(code, HEADER_JSON);
	res.write(JSON.stringify({ error: message }));
	res.end();
}

