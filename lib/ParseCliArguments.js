//@ts-check

const version = require('./Version');
const generateRandomToken = require('./GenerateRandomToken');

// @ts-ignore
const cliArgs = require('commander');

cliArgs
	.version(version.server)
	.usage('[option]')
	.description('Launch Visual Studio Code Coding Tracker Data Storage And Analyze Server')
	.option('-d, --debug', 'turn on the debug mode\n')
	.option('-t, --token <uploadToken>', 'upload data token', '123456')
	.option('    --token-file <tokenFilePath>', '')
	.option('-T, --random-token', 'set upload data token as a random string')
	.option('    --public-report', 'set report API and page public (everyone could visit report page without token)\n')
	.option('-p, --port <serverPort>', 'server listen port', 10345)
	.option('-l, --local', 'turn on the local server mode, could only be visited from local (listening on 127.0.0.1)\n')
	.option('-o, --output <dataOutputFolder>', 'upload data storage folder', './database');
cliArgs._name = 'coding-tracker-server';
cliArgs.parse(process.argv);

//@ts-ignore
global.DEBUG = cliArgs.debug;

if (cliArgs.randomToken)
	cliArgs.token = generateRandomToken.gen();

module.exports = cliArgs;
