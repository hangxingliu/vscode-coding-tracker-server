//@ts-check

const generateRandomToken = require('../../../lib/GenerateRandomToken');
const { Assert } = require('@hangxingliu/assert');

const modulePath = '../../../lib/ParseCliArguments.js';

let originalExports = null;

let defaultAdminTokenString = null;
let defaultTokenFile = null;
let cliArgs = {};

module.exports = {
	selfTest,
	setup, unload,
	setCliArgs,
	setDefaultAdminToken,
	setDefaultTokenFile
};

function selfTest() {
	setup();
	const replacedModule = require('../../../lib/ParseCliArguments');

	setCliArgs({}, null, true);
	Assert(replacedModule.get().disableTokenFile).isTrue();

	setCliArgs({ randomToken: true }, 'test-token.json');
	Assert(replacedModule.get()).fieldsEqual({
		disableTokenFile: false,
		noTokenFile: false,
		tokenFile: 'test-token.json'
	}).child('token').isString();

	unload();
}

/** @param {string} tokenString */
function setDefaultAdminToken(tokenString) { defaultAdminTokenString = tokenString;}

/** @param {string} tokenFile */
function setDefaultTokenFile(tokenFile) { defaultTokenFile = tokenFile;}

/**
 * @param {any} [baseArgs]
 * @param {string} [tokenFile]
 * @param {boolean} [noTokenFile]
 */
function setCliArgs(baseArgs = {}, tokenFile = undefined, noTokenFile = false) {
	if (baseArgs.randomToken)
		baseArgs.token = generateRandomToken.gen();
	cliArgs = Object.assign({}, baseArgs, {
		noTokenFile,
		disableTokenFile: noTokenFile,
		tokenFile: noTokenFile || typeof tokenFile != 'string' ? null : tokenFile,
	});
	return cliArgs;
}

function getFakeExport() {
	return {
		get, parse: get,
		getDefaultTokenFile: () => defaultTokenFile,
		getDefaultAdminToken: () => defaultAdminTokenString,
	};

	function get() {
		// console.log(`call FakeParseCliArguments#get`);
		return cliArgs;
	}
}

function setup() {
	if (originalExports) return;

	require(modulePath);
	const cache = require.cache[require.resolve(modulePath)];
	if (!cache)
		throw new Error(`Could not load original module: ${modulePath} (\`cache\` is falsy)`);
	if (!cache.exports)
		throw new Error(`Could not load original module: ${modulePath} (\`cache.exports\` is falsy)`);

	originalExports = cache.exports;
	cache.exports = getFakeExport();
}

function unload() {
	if (!originalExports) return;

	const cache = require.cache[require.resolve(modulePath)];
	if (!cache || !cache.exports) return;

	cache.exports = originalExports;
	originalExports = null;
}
