//@ts-check
/// <reference path="index.d.ts" />

// Code Review by ESLint
// No warning and error allow!

const FILES = [
	'lib/',
	'frontend/src/',
	'test/src/',
	'app.js'
];
const TEST_SLOW_TIME = 60 * 1000;
const TEST_TIMEOUT_TIME = 120 * 1000;

// Check this unit test is running in project root folder
function runningInProjectRoot() {
	let path = require('path');
	try {
		if (require(path.join(process.cwd(), 'package.json')).name
			!= 'vscode-coding-tracker-server')
			throw new Error();
	} catch (ex) {
		throw new Error(`Please run "${__filename}" unit test in project root folder`);
	}
}	

//>>>>>>>>>>>>>>>>>>>> Main Function

function main() {
	this.slow(TEST_SLOW_TIME);
	this.timeout(TEST_TIMEOUT_TIME);
	
	let ESLint = require('eslint');		
	//@ts-ignore
	let eslint = new ESLint.CLIEngine({ useEslintrc: true });

	/** @type {ESLintResultItem[]} */
	let results = eslint.executeOnFiles(FILES).results;
	// filter: get warning/error file
	results = results.filter(item => item.messages.length);
	
	if (results.length) {
		let problemCount = 0, location = "";
		results.forEach(result => {
			result.messages.forEach(problem => {
				problemCount++;
				location = `${result.filePath}:${problem.line}:${problem.column}`;
				console.error(`  ESLint error: ${problem.ruleId} in ${location}`);
			})
		});
		throw new Error(`There has ${problemCount} problems in ${results.length} files. ` +
			`You can get detailed information by running eslint`);
	}
}

if (process.argv.indexOf('--no-eslint') < 0) {
	describe('ESLint', () => {
		it('# running in project root directory', runningInProjectRoot);
		it('# no warning and error', main);
	});
}	
