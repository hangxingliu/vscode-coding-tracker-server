//@ts-check
/// <reference path="index.d.ts" />

// Code Review by tsc (Typescript Check)
// No warning and error allow!

const TEMP_DIRECTORY = `${__dirname}/../temp`;
const CWD = `${__dirname}/../../`;
const COMMAND = `tsc`;

const TEST_SLOW_TIME = 60 * 1000;
const TEST_TIMEOUT_TIME = 120 * 1000;


let { exec } = require('child_process'),
	{ removeSync } = require('fs-extra');

if (process.argv.indexOf('--no-tsc') < 0) {
	describe('Typescript', function () {
		it('# type check', function (done) {
			this.slow(TEST_SLOW_TIME);
			this.timeout(TEST_TIMEOUT_TIME);

			exec(COMMAND, { cwd: CWD, encoding: 'utf8' }, (err, stdout, stderr) => {
				if (err) throw err;
				if ((stdout + stderr).indexOf('error') >= 0) {
					console.log(stdout);
					console.log(stderr);
					throw new Error(`Check failed by tsc!`);
				}
				// clean temp path
				removeSync(TEMP_DIRECTORY);
				return done();
			});
		});
	});
}	
