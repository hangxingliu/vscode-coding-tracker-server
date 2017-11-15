#!/usr/bin/env node

const COMPONENTS = {
	"jquery": [
		"dist/jquery.min.js",
	],
	"popper.js": [
		"dist/umd/popper.min.js"
	],
	"echarts": [
		"dist/echarts.min.js"
	],
	"bootstrap": [
		"dist/css/bootstrap.min.css",
		"dist/js/bootstrap.min.js"
	],
	"bootstrap-datepicker": [
		"dist/css/bootstrap-datepicker3.standalone.min.css",
		"dist/js/bootstrap-datepicker.min.js"
	],
	"ionicons": [
		"css/ionicons.min.css",
		"fonts/ionicons.eot",
		"fonts/ionicons.svg",
		"fonts/ionicons.ttf",
		"fonts/ionicons.woff"
	]
};

const NODE_MODULES = `${__dirname}/../../node_modules`;

const fs = require('fs-extra');
const path = require('path');

// Main ===========>
fs.existsSync(NODE_MODULES) || failed(`node_module is missing!`);
let componentNames = Object.keys(COMPONENTS);
componentNames.forEach(name =>
	fs.existsSync(path.join(NODE_MODULES, name)) ||
	failed(`${name} has not been installed in node_modules`));
componentNames.forEach(name => {
	let fromPath = path.join(NODE_MODULES, name);
	let targetPath = path.join(__dirname, name);

	if (fs.existsSync(targetPath))
		fs.removeSync(targetPath);

	let files = COMPONENTS[name];
	for (let file of files) {
		let dir = path.dirname(file);
		fs.mkdirsSync(path.join(targetPath, dir));
		fs.copySync(path.join(fromPath, file), path.join(targetPath, file));
	}
});
console.log('success!');


function failed(reason) {
	console.error(`\n  error: ${reason}\n`);
	process.exit(1);
}
