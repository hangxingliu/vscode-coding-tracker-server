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
	Favicon	= require('serve-favicon'),
	Fs = require('fs-extra');

var log = require('./lib/Log'),
	version = require('./lib/Version'),
	welcome = require('./lib/Welcome'),
	storage = require('./lib/Storage'),
	checkParams = require('./lib/ParamsChecker'),
	errorHandler = require('./lib/Handler404and500'),
	tokenMiddleware = require('./lib/TokenMiddleware'),
	reporter = require('./lib/analyze/ReportMiddleware'),
	reporterV2 = require('./lib/analyze/ReportMiddlewareV2'),
	cliArgsParser = require('./lib/ParseCliArguments'),
	cliArgs = cliArgsParser.parse(process.argv);

//Express Server Object
const app = Express();

// Init token
tokenMiddleware.initMiddleware();

const needViewReportToken = tokenMiddleware.getMiddleware('report');
const needUploadToken = tokenMiddleware.getMiddleware('upload');
const needAdminToken = tokenMiddleware.getMiddleware('admin');

//Init Storage
storage.init(cliArgs.output);

//Using body parser to analyze upload data
app.use(require('body-parser').urlencoded({ extended: false }));

//Using homepage welcome
app.use(welcome(cliArgs));

//Empty favicon.ico
app.use(Favicon(`${__dirname}/frontend/favicon.ico`));
//Using front end static files
app.use('/lib', Express.static(`${__dirname}/frontend/lib`), errorHandler.on404);
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

/// @deprecated ReportMiddleware is deprecated now.
///   Please use /ajax/report-v2 interface.
///   /ajax/report interface and ReportMiddleware.js will be remove in 1.0.0
app.use('/ajax/report', needViewReportToken, reporter.init(cliArgs.output));

app.use('/ajax/report-v2', needViewReportToken, reporterV2.init(cliArgs.output));

//Handler API token test request
app.use('/ajax/test', needUploadToken, (req, res) => res.json({ success: 'test success!' }).end());

//Handler kill server request
app.use('/ajax/kill', needAdminToken, (req, res) => {
	return !cliArgs.local ? returnError(res, 'this server is not a local server, could not be kill') :
		(res.json({ success: 'killed' }).end(),
			log.success(`Server killed by "/ajax/kill" API`),
			process.nextTick(() => process.exit(0)));
})

//Handler upload request
app.post('/ajax/upload', needUploadToken, (req, res) => {
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

//add 404 and 500 handler to express server
errorHandler.setup(app);


//--------------------------------------
//|            Launch Server           |
//--------------------------------------

//If output folder is not exists then mkdirs
Fs.existsSync(cliArgs.output) || Fs.mkdirsSync(cliArgs.output);
//Launch express web server
cliArgs.local ?
	app.listen(cliArgs.port, '127.0.0.1', afterServerStarted) :
	app.listen(cliArgs.port, afterServerStarted);


function returnError(res, errInfo) { res.json({ error: errInfo || 'Unknown error' }).end() }

function afterServerStarted() {
	let tokenSign = '';
	if (cliArgs.randomToken)
		tokenSign = ' (Random)';
	if (cliArgs.isDefaultAdminToken)
		tokenSign = ' (Default)';
	log.success(`Server started!\n` +
		`-------------------\n` +
		`Listening port        : ${cliArgs.port}\n` +
		`Admin token from cli  : ${cliArgs.token}${tokenSign}\n` +
		`Report Permission     : ${cliArgs.publicReport ? 'public' : 'private'}\n` +
		`Token count           : ${tokenMiddleware.getTokenCountStr()}\n` +
		`-------------------`);
}
