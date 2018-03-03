//@ts-check

"use strict";
var version = require('./Version'),
	// @ts-ignore
	Program = require('commander');

Program
	.version(version.server)
	.usage('[option]')
	.description('Launch Visual Studio Code Coding Tracker Data Storage And Analyze Server')
	.option('-d, --debug', 'turn on the debug mode\n')
	.option('-t, --token <uploadToken>', 'upload data token', '123456')
	.option('-T, --random-token', 'set upload data token as a random string')
	.option('    --public-report', 'set report API and page public(without token to visit)\n')
	.option('-p, --port <serverPort>', 'server listen port', 10345)
	.option('-l, --local', 'turn on the local server mode, could only be visited from local (listening on 127.0.0.1)\n')
	.option('-o, --output <dataOutputFolder>', 'upload data storage folder', './database');
Program._name = 'coding-tracker-server';
Program.parse(process.argv);

//@ts-ignore
global.DEBUG = Program.debug;

module.exports = Program;
