#!/usr/bin/env node

/**
 * Visual Studio Code Coding Tracker Server Script
 *
 * Author: LiuYue
 * Github: https://github.com/hangxingliu
 * Version: 0.6.0
 * License: GPL-3.0
 */

/**
 * Storage Structure Version: 4.0
 * @see docs/STORAGE_SYNTAX_V4.md
 */
"use strict";
//eslint-disable-next-line no-unused-vars
var there_are_some_help_above;

//Require dependent module
require('colors');

var Express = require('express'),
	Fs = require('fs-extra');

var log = require('./lib/Log'),
	version = require('./lib/Version'),
	welcome = require('./lib/Welcome'),
	storage = require('./lib/Storage'),
	checkParams = require('./lib/ParamsChecker'),
	errorHandler = require('./lib/Handler404and500'),
	tokenChecker = require('./lib/TokenMiddleware'),
	reporter = require('./lib/analyze/ReportMiddleware'),
	reporterV2 = require('./lib/analyze/ReportMiddlewareV2'),
	randomToken = require('./lib/RandomToken'),
	Program = require('./lib/Launcher');

//If using random token
Program.token = Program.randomToken ? randomToken.gen() : Program.token;

//Express Server Object
var app = Express();

//Init Storage
storage.init(Program.output);

//Using body parser to analyze upload data
app.use(require('body-parser').urlencoded({ extended: false }));

//Using homepage welcome
app.use(welcome(Program));

//Empty favicon.ico
app.use('/favicon.ico', (req, res) => res.end());
//Using front end static files
app.use('/lib', Express.static(`${__dirname}/frontend/lib`), (req, res) => { res.writeHead(404); res.end(); });
app.use('/report', Express.static(`${__dirname}/frontend/dist`));

//Display now is debug mode
//@ts-ignore
if (global.DEBUG) {
	log.info('Debug mode be turned on!');
	//Using visitor log record (if under the debug mode)
	app.use(require('morgan')('dev'));
}

//Return timezone offset in server
const TZ_OFFSET = new Date().getTimezoneOffset();
app.use('/ajax/tz-offset', (req, res) => res.json({ timezoneOffset: TZ_OFFSET}).end());

//If it is public report. Bind analyze report ajax middleware
Program.publicReport && bindReportAPIToServer();

//Using a upload token checker middleware
app.use(tokenChecker.get(Program.token));

//private report. Bind analyze report ajax middleware
Program.publicReport || bindReportAPIToServer();

//Handler API token test request
app.use('/ajax/test', (req, res) => res.json({ success: 'test success!' }).end());

//Handler kill server request
app.use('/ajax/kill', (req, res) => {
	return !Program.local ? returnError(res, 'this server is not a local server, could not be kill') :
		(res.json({ success: 'killed' }).end(),
			log.success(`Server killed by "/ajax/kill" API`),
			process.nextTick(() => process.exit(0)));
})

//Handler upload request
app.post('/ajax/upload', (req, res) => {
	let params = req.body,
		versionCheckResult = version.check(params.version);

	//Check upload version
	if (versionCheckResult !== true)
		return log.error(versionCheckResult), returnError(res, versionCheckResult);

	//Check params
	params = checkParams(params);
	//Params are invalid
	if (params.error)
		return returnError(res, params.error);

	res.json({ success: 'upload success' });
	res.end();
	storage.write(params);
});

//add 404 and 500 response to express server
errorHandler(app);


//--------------------------------------
//|            Launch Server           |
//--------------------------------------

//If output folder is not exists then mkdirs
Fs.existsSync(Program.output) || Fs.mkdirsSync(Program.output);
//Launch express web server
Program.local ?
	app.listen(Program.port, '127.0.0.1', afterServerStarted) :
	app.listen(Program.port, afterServerStarted);


function returnError(res, errInfo) { res.json({ error: errInfo || 'Unknown error' }).end() }

function bindReportAPIToServer() {
	/// @deprecated ReportMiddleware is deprecated now.
	///   Please use /ajax/report-v2 interface.
	///   /ajax/report interface and ReportMiddleware.js will be remove in 1.0.0
	app.use('/ajax/report', reporter.init(Program.output));
	app.use('/ajax/report-v2', reporterV2.init(Program.output));
}

function afterServerStarted() {
	log.success(`Server started!\n` +
		`-------------------\n` +
		`Listening port    : ${Program.port}\n` +
		`API/Upload token  : ${Program.token}\n` +
		`Report Permission : ${Program.publicReport ? 'public' : 'private'}\n` +
		`-------------------`);
}
