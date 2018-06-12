//@ts-check

/**
 * Test about read version number from data file by stream
 */

let fs = require('fs');
let i = 0;
let stream = fs.createReadStream(__filename, { encoding: 'utf8', fd: null });
stream.on('readable', () => {
	console.log(i++, stream.read(3));
	stream.destroy();
});
stream.on('error', (...p) => console.log('error:', ...p));
