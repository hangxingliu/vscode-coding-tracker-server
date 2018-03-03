//@ts-check
/// <reference path="index.d.ts" />

/*
 	Because tsc will check jsDoc, and it could not recognize callback function in jsDoc,
 	Such as:
 		@returns {(value: number) => number}
*/
// Code Review by tsc (Typescript Check)
// No warning and error allow!

const TEMP_DIRECTORY = `${__dirname}/../temp`;
const CWD = `${__dirname}/../../`;
const COMMAND = `${__dirname}/../../node_modules/.bin/tsc`;

const TEST_SLOW_TIME = 60 * 1000;
const TEST_TIMEOUT_TIME = 120 * 1000;


let { exec } = require('child_process'),
	{ removeSync } = require('fs-extra'),
	logFile = require('./utils/LogFile').createLogFile('typescript-check');

if (process.argv.indexOf('--no-tsc') < 0) {
	describe('Typescript', function () {
		it('# type check', function (done) {
			this.slow(TEST_SLOW_TIME);
			this.timeout(TEST_TIMEOUT_TIME);

			exec(COMMAND, { cwd: CWD, encoding: 'utf8' }, (error, stdout, stderr) => {
				let output = stdout + stderr;
				let matchedErrors = output.match(/error\s*\w+/g);

				/// @todo Dirty Fix for typescript 2.7.2
				/// because module `colors`:
				///   node_modules/@types/colors/index.d.ts(118,9):
				///     error TS2717: Subsequent property declarations must have the same type.
				///     Property 'bold' must be of type '() => string', but here has type 'string'.
				matchedErrors = matchedErrors.filter(e => e != 'error TS2717');

				if (matchedErrors.length > 0) {
					console.log(output);
					error = new Error(`Check failed by tsc!`);
				} else {
					// dirty fix TS2717
					error = void 0;
				}

				// clean temp path
				removeSync(TEMP_DIRECTORY);

				// write log
				logFile.appendLine(output);
				logFile.write(writeError => {
					if (!error)
						return done(writeError);
					return done(error);
				});

			});
		});
	});
}
