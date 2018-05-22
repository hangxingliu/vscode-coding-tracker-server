//@ts-check

let request = require('request'),
	logFile = require('./LogFile').createLogFile('http-response');

const MAX_BODY_LOG_SIZE = 1024;

module.exports = {
	httpGet, httpGetResponse200, httpGetResponse200JSON, httpGetNotResponse,

	deprecatedhttpGet, deprecatedhttpPost
};

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

/** @param {string} name */
function createLogMiddleware(name) {
	return (err, res, body) => {
		logFile.appendLine(name);
		if (err) {
			logFile.appendLine(`error: ${err.message}\n${err.stack}\n`);
		} else {
			logFile.appendLine((res ? res.statusCode : '0') + ':');
			logFile.appendLine(body.length > MAX_BODY_LOG_SIZE ? body.slice(0, MAX_BODY_LOG_SIZE) : body);
			logFile.appendLine('\n');
		}
		return true;
	};
}

function httpGet(url, param) {
	let name = generateRequestName('GET', url, param);
	let validator = createBaseValidate(name);
	validator.test(createLogMiddleware(name));
	return {
		validator,
		promise: new Promise((resolve, reject) =>
			request(url, Object.assign({ method: 'get' }, param),
				validator.validate(resolve, reject)))
	};
}

function httpGetResponse200(url, param = {}) {
	const obj = httpGet(url, param);
	obj.validator.connected().status200();
	return obj;
}

function httpGetResponse200JSON(url, param = {}) {
	const obj = httpGet(url, param);
	obj.validator.connected().status200().isJSON();
	return obj;
}

function httpGetNotResponse(url, param = {}) {
	const obj = httpGet(url, param);
	obj.validator.connectFailed();
	return obj;
}

/**
 * @param {string} url
 * @param {any} param
 * @param {Function} then
 * @param {boolean} [connected]
 * @param {number} [statusCode]
 */
function deprecatedhttpGet(url, param, then, connected = true, statusCode = 0) {
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
function deprecatedhttpPost(url, param, then, connected = true, statusCode = 0) {
	let name = generateRequestName('POST', url, param);
	let v = createCommonValidate(name, connected, statusCode);
	process.nextTick(() =>
		request(url, Object.assign({ method: 'post' }, param), v.done(then)));
	return v;
}


function createCommonValidate(name = '', connected = true, statusCode = 0) {
	let v = createBaseValidate(name);

	//log
	v.test(createLogMiddleware(name));

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

		print,

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

	/**
	 * @param {Function} resolve
	 * @param {Function} [reject]
	 */
	function validate(resolve, reject) {
		return (err, res, body) => {
			try {
				for (let v of validator)
					v(err, res, body);
			} catch (ex) {
				if (reject)
					return reject(ex);
				throw ex;
			}
			resolve();
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

	function print(printHeader = true, printBody = true) {
		validator.push((err, res, body) => {
			if (printHeader) console.log(res.headers);
			if (printBody) console.log(body);
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
				} catch (e) { throwError(`result object could not eval ${JSON.stringify(express)}`); }
				if (!result)
					throwError(`${express} is falsy value`);
			});
		return chains;
	}

}
