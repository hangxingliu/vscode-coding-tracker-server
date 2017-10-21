//@ts-check

"use strict";
const REQUIRED_V3 = [
	'version',
	'token',
	'type',
	'time',
	'long',
	'lang',
	'file',
	'proj',
	'pcid'
];
const REQUIRED_V4 = [
	'vcs_type',
	'vcs_repo',
	'vcs_branch',
	'line',
	'char'
];
const NUMBER = [
	'time',
	'long',
	'line',
	'char'
];

module.exports = function (params) {
	for(let req of REQUIRED_V3)
		if (typeof params[req] == 'undefined')
			return { error: `missing param "${req}"!` };

	if (params.version == '4.0')
		for(let req of REQUIRED_V4)
			if (typeof params[req] == 'undefined')
				return { error: `missing param "${req}" (upload version 4.0)!` };
	
	for (let num of NUMBER)
		if (typeof params[num] != 'undefined' &&
			isNaN(parseInt(params[num])))
			return { error: `param "${num}" is not an integer` };
	
	// TODO : It is could also verify params length and type 
	
	return params;
}