require('colors');
var tester = require('child_process').spawn('npm', ['test']);

tester.on('close', code => {
	if (code) {
		console.error(`npm test failed with exit code: ${code}`.red);		
	} else {
		console.log(`npm test success!`);
	}
	process.exit(code);
});
