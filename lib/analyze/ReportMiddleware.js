const Analyzer = require('./AnalyzeCore'),
	GroupBy = Analyzer.GroupBy;
const ANALYZE_GROUP_BY = GroupBy.DAY | GroupBy.LANGUAGE | GroupBy.FILE | GroupBy.PROJECT | GroupBy.COMPUTER,
	ONE_ANALYZE_GROUP_BY = GroupBy.HOUR;

const HEADER_JSON = { "Content-Type": "application/json; charset=utf-8" };
const ALLOW_METHOD = {
	GET: true
};
const METHOD_MAP = {
	'GET /recent': [analyzeRecentDays, 'days'],
	'GET /last24hs': [analyze24Hours, 'ts'],
	'GET /project': [analyzeProject, 'days', 'project']
};

const errorResponseWithJSON = (res, errCode, message) =>
	(res.writeHead(errCode, HEADER_JSON), res.write(JSON.stringify({ error: message })), res.end()),

	stringBeforeQuestionMark = str => { var index = str.indexOf('?'); return index == -1 ? str : str.slice(0, index) },

	getDateRangeArray = (base, days) => {
		var to = new Date(base), from = new Date(base); from.setDate(from.getDate() - days + 1); return [from, to]},
	
	analyzeToResponseProxy = (analyze, dateRangeArray, res) =>
		analyze.analyze(dateRangeArray[0], dateRangeArray[1]) ? analyze.getResult() :
			void (errorResponseWithJSON(res, 500, analyze.getError()));

var dbPath = 'databaseFolder';

function analyzeRecentDays(days, req, res) {
	//handler default params
	days = Number(days) || 7;

	var d = getDateRangeArray(Date.now(), days);
	var analyze = new Analyzer(dbPath);
	analyze.setGroupBy(ANALYZE_GROUP_BY);
	return analyzeToResponseProxy(analyze, d, res);
}

function analyze24Hours(timestamp, req, res) {
	//handler default params
	timestamp = Number(timestamp) || Date.now();

	var d = getDateRangeArray(new Date(timestamp), 2);
	var analyze = new Analyzer(dbPath);
	analyze.setGroupBy(ONE_ANALYZE_GROUP_BY);
	return analyzeToResponseProxy(analyze, d, res);	
}

function analyzeProject(days, projectName, req, res) {
	//handler default params
	days = Number(days) || 7;
	if (!projectName)
		return void (errorResponseWithJSON(res, 400, 'missing parameter "project"!'));
	
	var d = getDateRangeArray(Date.now(), days);

	var analyze = new Analyzer(dbPath);
	analyze.setGroupBy(ANALYZE_GROUP_BY);
	analyze.setFilter({ project: [encodeURIComponent(projectName)] });
	return analyzeToResponseProxy(analyze, d, res);
}

//------------------export-----------------------


module.exports = { init: databaseFolder => (dbPath = databaseFolder, (req, res, next) => {
	var method = req.method,
		url = req.url;	
	if (!ALLOW_METHOD[method])
		return errorResponseWithJSON(res, 405, `method "${method}" is not supported!`);

	url = stringBeforeQuestionMark(url);
	var match = METHOD_MAP[`${method} ${url}`];
	if (!match)
		return errorResponseWithJSON(res, 404, `${method} ${url} not found!`);

	var params = [];
	for(var i = 1 ; i < match.length ; i++ ) {
		var name = match[i];
		params.push(req.query[name] || (req.body && req.body[name]) || void 0);
	}
	params.push(req);
	params.push(res);

	var result = match[0].apply(this, params);
	if (result)
		return res.json(result).end();
}) };

// /*
require('express')().use((req, res) => 1);
//*/