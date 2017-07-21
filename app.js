#!/usr/bin/env node

/**
 * Visual Studio Code Coding Tracker Server Script
 *
 * Author: LiuYue
 * Github: https://github.com/hangxingliu
 * Version: 0.4.1
 * License: GPL-3.0
 */

/**
 * Upload Structure Version: 3.0
 * Upload item:
 *
 * version: string      upload version
 * token: string        upload token
 *
 * type: enum<string>   open|look|code coding type(open time, looking time and coding time)
 *    if upload type is not in enum item will be choose default enum: open
 * time: integer        coding record happened timestamp
 * long: integer        coding record duration time(s)
 * lang: string         coding language
 * file: string         coding file path(relative project path)
 * proj: string         coding project path
 * pcid: string			coding computer id
 */

/**
 * Storage Structure Version: 3.0
 * Storage:
 *
 * Each file first line is storage version
 * And since second line, every line is a coding record and echo items in line are split by a space character
 * Each lines are split by a character '\n'
 * And each string item(exclude version item) should storage after encodeURIComponent operate
 *
 *
 * Example Rule:
 *
 * [version]
 * [type] [time] [long] [lang] [file] [proj] [pcid]
 * ...
 * -----
 *     [type]: open=>0, look=>1(reserve), code=>2
 *
 *
 * Storage file name:
 *
 * YYMDD.db   a output data file included all record uploaded on day YY-MM-DD
 * YYMDD.ov   a overview analyze result data file analyzed from all record before day YYMDD
 *      could be used to display each project or each files in a project time consuming
 * ...
 * -----
 *     M: use one character to express month(1,2,3,4,5,6,7,8,9,A,B,C)
 */
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
	checker = require('./lib/ParamsChecker'),
	errorHandler = require('./lib/Handler404and500'),
	tokenChecker = require('./lib/TokenMiddleware'),
	reporter = require('./lib/analyze/ReportMiddleware'),
	upgrade = require('./lib/UpgradeDatabaseFiles'),
	randomToken = require('./lib/RandomToken'),
	Program = require('./lib/Launcher');

//If using random token
Program.token = Program.randomToken ? randomToken.gen() : Program.token;

//Express Server Object
var app = Express();

//Init Storage
storage.init(Program.output);

//Display now is debug mode
//@ts-ignore
if (global.DEBUG) {
	log.info('Debug mode be turned on!');
	//Using visitor log record (if under the debug mode)	
	app.use(require('morgan')('dev'));
}
//Using body parser to analyze upload data
app.use(require('body-parser').urlencoded({ extended: false }));

//Using homepage welcome
app.use(welcome(Program));

//Using front end static files
app.use('/report', Express.static(`${__dirname}/frontend/dist`));
app.use('/lib', Express.static(`${__dirname}/frontend/lib`));


//If it is public report. Bind analyze report ajax middleware
Program.publicReport && bindReportAPI2Server();

//Using a upload token checker middleware
app.use(tokenChecker.get(Program.token));

//private report. Bind analyze report ajax middleware
Program.publicReport || bindReportAPI2Server();

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
	var params = req.body,
		versionCheckResult = version.check(params.version);

	//Check upload version
	if (versionCheckResult !== true)
		return log.error(versionCheckResult), returnError(res, versionCheckResult);
	
	//Check params
	params = checker(params);

	//Params are invalid
	return params.error ? returnError(res, params.error)
		//Storage data
		: (process.nextTick(() => storage.write(params)), res.json({ success: 'upload success' }).end())
});

//add 404 and 500 response to express server
errorHandler(app);
 

//--------------------------------------
//|            Launch Server           |
//--------------------------------------

//If output folder is not exists then mkdirs
Fs.existsSync(Program.output) || Fs.mkdirsSync(Program.output);
//upgrade exists old database files
upgradeOldDatabaseFiles(Program.output);
//Launch express web server
Program.local ?
	app.listen(Program.port, '127.0.0.1', afterServerStarted) :	
	app.listen(Program.port, afterServerStarted);


function returnError(res, errInfo) { res.json({ error: errInfo || 'Unknown error' }).end() }

function bindReportAPI2Server() { app.use('/ajax/report', reporter.init(Program.output)) }

function upgradeOldDatabaseFiles(databaseFolder) {
	var upgradeResult = upgrade.upgrade(databaseFolder);
	upgradeResult.count == 0 || log.info(`**********\nupgrade old version database file version to ${version.storage}\n` +
		`  there are ${upgradeResult.count} old version database files be upgrade\n**********`);
}

function afterServerStarted() {
	log.success(`Server started!\n` +
		`-------------------\n` +	
		`Listening port    : ${Program.port}\n` +
		`API/Upload token  : ${Program.token}\n` +
		`Report Permission : ${Program.publicReport ? 'public' : 'private'}\n` +
		`-------------------`);
}