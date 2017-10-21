//@ts-check

"use strict";
const PACKAGE_JSON = require('path').join(__dirname, '..', 'package.json');
const SUPPORT_UPLOAD = ["3.0", "4.0"];

var versionMap = {
	upload: '4.0',
	storage: '4.0',
	uploadSupport: SUPPORT_UPLOAD,
	server: JSON.parse(require('fs').readFileSync(PACKAGE_JSON, 'utf8')).version,

	check: function (v) {
		if (!v)
			return "empty upload version";
		if (SUPPORT_UPLOAD.indexOf(v) < 0)
			return `unsupported upload version ${v}`;	
		return true;
	}
}

module.exports = versionMap;