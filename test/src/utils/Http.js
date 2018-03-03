//@ts-check

let request = require('request'),
	logFile = require('./LogFile').createLogFile('http-response');

module.exports = { httpGet, httpPost, writeLogToFile};

function writeLogToFile(then) { logFile.write(then); }

/**
 * @param {string} method
 * @param {string} url
 * @param {any} [param]
 */
function generateRequestName(method, url, param) {
	let name = `${method} ${url}`;
	if (param)
		name += ' ' + JSON.stringify(param);
	return name;
}

/**
 * @param {string} url
 * @param {any} param
 * @param {Function} then
 * @param {boolean} [connected]
 * @param {number} [statusCode]
 */
function httpGet(url, param, then, connected = true, statusCode = 0) {
	let name = generateRequestName('GET', url, param);
	let v = createCommonValidate(name, connected, statusCode);
	process.nextTick(() =>
		request(url, Object.assign({ method: 'get' }, param), v.done(then)));
	return v;
}

/**
 * @param {string} url
 * @param {any} param
 * @param {Function} then
 * @param {boolean} [connected]
 * @param {number} [statusCode]
 */
function httpPost(url, param, then, connected = true, statusCode = 0) {
	let name = generateRequestName('POST', url, param);
	let v = createCommonValidate(name, connected, statusCode);
	process.nextTick(() =>
		request(url, Object.assign({ method: 'post' }, param), v.done(then)));
	return v;
}


function createCommonValidate(name = '', connected = true, statusCode = 0) {
	let v = createBaseValidate(name);

	//log
	v.test((err, res, body) => {
		if (err) {
			logFile.appendLine(`error: ${err.message}\n${err.stack}\n`);
		} else {
			logFile.appendLine((res ? res.statusCode : '0') + ':');
			logFile.appendLine(body);
			logFile.appendLine('\n');
		}
		return true;
	});

	if (connected)
		v.connected();
	else
		v.connectFailed();

	if (statusCode)
		v = v.status(statusCode);

	return v;
}

/** @param {string} name */
function createBaseValidate(name) {
	let validator = [];
	let chains = {

		connected,
		connectFailed,

		status200: () => status(200),
		status403: () => status(403),
		status404: () => status(404),
		status500: () => status(500),
		status4xx: () => statusNXX(4),
		status5xx: () => statusNXX(5),
		status,
		statusNXX,

		isJSON: () => contentType('application/json'),
		isHTML: () => contentType('text/html'),
		contentType,

		regexp,
		exist,
		test,

		validate,
		done: validate
	};
	return chains;

	/** @param {Function} then */
	function validate(then) {
		return (err, res, body) => {
			for (let v of validator)
				v(err, res, body);
			then();
		};
	}

	/** @param {string|Error} error */
	function throwError(error) {
		throw new Error((error instanceof Error ? error.message : error) + ' `' + name + '`');
	}

	function connected() {
		validator.push(err => {
			if (err) throwError(err);
		});
		return chains;
	}

	function connectFailed() {
		validator.push(err => {
			if (!err)
				throwError(`request connected, but expected is not!`);
		});
		return chains;
	}

	function status(code = 200) {
		validator.push((err, res) => {
			if (res.statusCode != code)
				throwError(`response code is ${res.statusCode} but not ${code}!`)
		});
		return chains;
	}
	function statusNXX(n = 0) {
		validator.push((err, res) => {
			if (Math.floor(res.statusCode /100) != n)
				throwError(`response code is ${res.statusCode} but not ${n}xx!`)
		});
		return chains;
	}

	/** @param {string} contentType */
	function contentType(contentType) {
		validator.push((err, res) => {
			let ct = res.headers['content-type'];
			if (!ct) throwError(`response has not content type header`);
			if (ct.indexOf(contentType) == -1) throwError(`response content type is not ${contentType}`);
		});
		return chains;
	}

	/** @param {RegExp} regex  */
	function regexp(regex) {
		validator.push((err, res, body) => {
			if (!body.match(regex))
				throwError(`result could not match "${regex.source}"`)
		});
		return chains;
	}

	// function JSON_SUCCESS(err, res, bd) { JSON_EVAL('obj.success')(err, res, bd)}
	// function JSON_ERROR(err, res, bd) { JSON_EVAL('obj.error')(err, res, bd)}
	/** @param {string} express */
	function exist(express) { return test(`typeof (${express}) != 'undefined'`); }

	/** @param {string|((err: Error, res: any, bd: string) => boolean)} express */
	function test(express) {
		if (typeof express == "function")
			validator.push(express);
		else
			validator.push((err, res, bd) => {
				//eslint-disable-next-line no-unused-vars
				let obj = {}, result = false;
				try {
					obj = JSON.parse(bd);
				} catch (e) { throwError('result is illegal JSON object'); }
				try {
					result = eval(express);
				} catch (e) { throwError(`result object could not eval ${express}`); }
				if (!result)
					throwError(`${express} is falsy value`);
			});
		return chains;
	}

}
