//@ts-check

const version = require('./Version');
const generateRandomToken = require('./GenerateRandomToken');

// @ts-ignore
const cliArgs = require('commander');

const defaultTokenFile = '$HOME/.coding-tracker-token.json';

cliArgs
	.version(version.server)
	.usage('[option]')
	.description('Launch Visual Studio Code Coding Tracker Data Storage And Analyze Server')
	.option('-d, --debug', 'turn on the debug mode\n')
	.option('-t, --token <uploadToken>', 'upload data token ("123456" by default if no token file could be used)')
	.option('    --token-file <tokenFilePath>', `set token file path ("${defaultTokenFile}" by default)`)
	.option('    --disable-token-file', `disable "${defaultTokenFile}" and user given token file`)
	.option('    --no-token-file', `\n`)
	.option('-T, --random-token', 'set upload data token as a random string')
	.option('    --public-report', 'set report API and page public (everyone could visit report page without token)\n')
	.option('-p, --port <serverPort>', 'server listen port', 10345)
	.option('-l, --local', 'turn on the local server mode, could only be visited from local (listening on 127.0.0.1)\n')
	.option('-o, --output <dataOutputFolder>', 'upload data storage folder', './database');
	// @todo set output dir to "$HOME/.coding-tracker" by default.
cliArgs._name = 'coding-tracker-server';
cliArgs.parse(process.argv);

//@ts-ignore
global.DEBUG = cliArgs.debug;

if (cliArgs.randomToken)
	cliArgs.token = generateRandomToken.gen();

if (!cliArgs.noTokenFile && !cliArgs.disableTokenFile && !cliArgs.tokenFile)
	cliArgs.tokenFile = defaultTokenFile.replace('$HOME', process.env.USERPROFILE || process.env.HOME);


module.exports = cliArgs;
