//@ts-check

const version = require('./Version');
const generateRandomToken = require('./GenerateRandomToken');

// @ts-ignore
const cliArgs = require('commander');

const defaultTokenFile = '$HOME/.coding-tracker-token.json';
const defaultAdminToken = '123456';

cliArgs
	.version(version.server)
	.usage('[option]')
	.description('Launch Visual Studio Code Coding Tracker Data Storage And Analyze Server')
	.option('-d, --debug', 'turn on the debug mode\n')
	.option('-t, --token <adminToken>', `an admin token could be used for upload and everything ("${defaultAdminToken}" by default if no token file could be used)`)
	.option('    --token-file <tokenFilePath>', `set token file path ("${defaultTokenFile}" by default)`)
	.option('    --disable-token-file', `disable "${defaultTokenFile}" and user given token file`)
	.option('    --no-token-file', `\n`)
	.option('-T, --random-token', 'set admin token as a random string (admin token could be used for upload and everything)')
	.option('    --public-report', 'set report API and page public (everyone could visit report page without token)\n')
	.option('-p, --port <serverPort>', 'server listen port', 10345)
	.option('-l, --local', 'turn on the local mode (bind on address 127.0.0.1). and could be kill by uri /ajax/kill\n')
	.option('-o, --output <dataOutputFolder>', 'upload data storage folder', './database');
	// @todo set output dir to "$HOME/.coding-tracker" by default.
cliArgs._name = 'coding-tracker-server';

/** @param {string[]} argv */
function parse(argv) {
	cliArgs.parse(argv);

	//@ts-ignore
	global.DEBUG = cliArgs.debug;

	if (cliArgs.randomToken)
		cliArgs.token = generateRandomToken.gen();

	/*
		Normalize command line arguments
			(commander.js handle --token-file and --token-file incorrect)
	*/
	if (cliArgs.disableTokenFile || cliArgs.tokenFile === false) {
		cliArgs.disableTokenFile = true;
		cliArgs.noTokenFile = true;
		cliArgs.tokenFile = null;

	} else if (cliArgs.tokenFile === true) { // without ant options in --token-file, --no-token-file and --disable-token-file
		cliArgs.disableTokenFile = false;
		cliArgs.noTokenFile = false;
		cliArgs.tokenFile = null;

	} else {
		if (typeof cliArgs.tokenFile !== 'string') {
			console.error(`fatal: expected type of "--token-file" is boolean or string, but actual is ${typeof cliArgs.tokenFile}\n`);
			process.exit(1);
		}
		cliArgs.disableTokenFile = false;
		cliArgs.noTokenFile = false;
	}

	return cliArgs;
}

module.exports = {
	parse,
	getDefaultTokenFile: () => defaultTokenFile.replace('$HOME', process.env.USERPROFILE || process.env.HOME),
	getDefaultAdminToken: () => defaultAdminToken,
	get: () => cliArgs,
};
