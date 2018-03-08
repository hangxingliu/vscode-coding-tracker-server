//@ts-check

let assert = require('assert'),
	{ AssertionError } = assert;

module.exports = {
	Assert, Invoke
};

function Assert(value) {
	let chains = { isTrue, isFalse };
	void value;
	return chains;
	function isTrue() {
		assert.deepStrictEqual(value, true);
		return chains;
	}
	function isFalse() {
		assert.deepStrictEqual(value, false);
		return chains;
	}
}

/**
 * @param {Function} func
 * @param {any} [context]
 * @param {any[]} [parameters]
 */
function Invoke(func, context, ...parameters) {
	let invokeExpression = `${func.name}(${parameters.map(p=>JSON.stringify(p)).join(', ')})`;
	let value = undefined,
		exception = undefined;

	try {
		value = func.call(context, ...parameters);
	} catch (e) {
		exception = e;
	}

	let chains = Object.assign({ hasException }, Assert(value));

	if (typeof exception != 'undefined') {
		let throwAgain = (originalCheckerName) => {
			throw new AssertionError({
				message: `${invokeExpression} thrown an exception`,
				expected: originalCheckerName,
				actual: 'message' in exception ? exception.message : exception
			});
		};
		for (let funcName in chains)
			if (funcName != hasException.name)
				chains[funcName] = throwAgain.bind(this, funcName);
	}

	return chains;

	function hasException(keyword = '') {
		let expected = keyword ? `An exception has keyword "${keyword}"` : `An exception`;
		if (typeof exception == 'undefined') {
			throw new AssertionError({
				message: `${invokeExpression} didn't thrown an exception`,
				expected, actual: 'No exception'
			});
		}
		if (keyword) {
			let message = String('message' in exception ? exception.message : exception);
			if (message.toLowerCase().indexOf(keyword.toLowerCase()) < 0)
				throw new AssertionError({
					message: `${invokeExpression} thrown an exception without keyword`,
					expected, actual: `An exception with keyword "${keyword}"`
				})
		}
		// OK
	}
}
