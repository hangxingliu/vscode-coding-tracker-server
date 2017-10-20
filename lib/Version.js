
"use strict";
var Fs = require('fs'),
	Path = require('path');

var versionMap = {
	upload: '3.0',
	storage: '3.0',
	uploadSupport: [3, 0],
	server: JSON.parse(Fs.readFileSync(Path.join(__dirname, '..', 'package.json'), 'utf8')).version,

	check: function(v) {
		v = (v||'').split('.');
		if (v.length != 2)
			return Err.len;
		for (var i = 0; i < 2; i++)
			if (isNaN(v[i] = Number(v[i])))
				return Err.nan;
			else if (v[i] < versionMap.uploadSupport[i])
				return Err.old;
			else if (v[i] > versionMap.uploadSupport[i])
				return Err.low;	
		
		/*
			//codes below it means I need to support low version, but now I could not to finish this logic.
			//because I need to write many redundant codes to support low version and recalculate some coding times
			//to get a correct data. Just waste my time.
		
			var sub = v[0] - versionMap.uploadSupport[0];
			if (sub > 0) return Err.low
			if (sub < 0) return true;
			sub = v[1] - versionMap.uploadSupport[1];
			if (sub > 0) return Err.low;
		*/
		return true;
	}
}
var Err = {
	len: 'invalid version string (not format like 1.0)',
	old: 'upload data version is too low, server could not support it (Please update your extension)',
	low: 'server support upload version is too low to support this upload data (Please upgrade your server program)',
	nan: 'invalid version string (not number)',
}

module.exports = versionMap;