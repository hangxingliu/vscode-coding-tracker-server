//@ts-check

function create() {
	let validator = [];
	let chains = {
		connected,
		connectFailed,
		status200,
		status403,
		status404,
		status500,
		status4xx,
		status5xx,
		status,
		statusNXX,
		isJSON,
		isHTML,
		contentType,
		regexp,
		exist,
		test,
		validate,
		done: validate
	};
	return chains;

	function validate(then) {
		return (err, res, body) => {
			for (let v of validator)
				v(err, res, body);
			then();
		};
	}

	function connected() {
		validator.push(err => {
			if (err) throw err;
		});
		return chains;
	}

	function connectFailed() {
		validator.push(err => {
			if (!err)
				throw new Error(`request connected, but expectation is not!`);
		});
		return chains;
	}

	function status200() { return status(200); }
	function status403() { return status(403); }
	function status404() { return status(404); }
	function status500() { return status(500); }
	function status4xx() { return statusNXX(4); }
	function status5xx() { return statusNXX(5); }
	function status(code = 200) {
		validator.push((err, res) => {
			if (res.statusCode != code)
				throw new Error(`response code is ${res.statusCode} but not ${code}!`)
		});
		return chains;
	}
	function statusNXX(n = 0) {
		validator.push((err, res) => {
			if (Math.floor(res.statusCode /100) != n)
				throw new Error(`response code is ${res.statusCode} but not ${n}xx!`)
		});
		return chains;
	}

	function isJSON() { return contentType('application/json'); }
	function isHTML() { return contentType('text/html'); }
	/** @param {string} contentType */
	function contentType(contentType) {
		validator.push((err, res) => {
			let ct = res.headers['content-type'];
			if (!ct) throw new Error(`response has not content type header`);
			if (ct.indexOf(contentType) == -1) throw new Error(`response content type is not ${contentType}`);
		});
		return chains;
	}

	/** @param {RegExp} regex  */
	function regexp(regex) {
		validator.push((err, res, body) => {
			if (!body.match(regex))
				throw new Error(`result could not match "${regex.source}"`)
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
				} catch (e) { throw new Error('result is illegal JSON object'); }
				try {
					result = eval(express);
				} catch (e) { throw new Error(`result object could not eval ${express}`); }
				if (!result)
					throw new Error(`${express} is falsy value`);
			});
		return chains;
	}

}

module.exports = create;
