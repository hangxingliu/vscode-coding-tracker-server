//@ts-check

/**
 * Test about lockfile
 */

let lockFile = require('lockfile');

const FILE = `${__dirname}/test.lock`;

let c = 0;
let id = process.argv[2] || "0";
test();

function test() {
	// console.log('locking file ...');
	lockFile.lock(FILE, (err) => {
		if (err)
			return console.error(`file lock failed!(id: ${id};count: ${c++})`), setTimeout(test, 1000);
		console.log(`file locked! id: ${id}`);
		setTimeout(() => {
			lockFile.unlock(FILE, (err) => {
				if (err)
					return console.error(`file unlock failed!(id: ${id};count: ${c++})`), setTimeout(test, 1000);
				console.log(`file unlocked! id: ${id} count: ${c++}`);
				return setTimeout(test, 1000);
				// console.log('file unlocked!');
			});
		}, 1000);
	});
}
