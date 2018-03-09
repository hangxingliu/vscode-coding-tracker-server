//@ts-check

let assert = require('assert'),
	{ AssertionError } = assert;

module.exports = {
	Assert, Invoke
};

/** @param {any} value  */
function Assert(value) {
	let throwAsserionError = (message, expected, actual) => {
		throw new AssertionError({ message, expected, actual }) };

	let chains = {
		isTrue, isFalse, isUndefind, equals, equalsInJSON, fieldsEqual,
		differentFrom, greaterThan, lessThan,

		isString, isNumber, isObject, isTypeof,
		isArray, length,
		containsKeys,

		allKeys, allKeyValueTuples, child, sort, convertBy,

		// aliases:
		field: child
	};
	return chains;


	function isTrue() { return equals(true); }
	function isFalse() { return equals(false); }
	function isUndefind() { return equals(undefined); }
	function isString() { return isTypeof('string'); }
	function isNumber() { return isTypeof('number'); }
	function isObject() { return isTypeof('object'); }

	/** @param {string} type */
	function isTypeof(type) {
		assert.deepStrictEqual(typeof value, type);
		return chains;
	}

	function equals(expected) {
		assert.deepStrictEqual(value, expected);
		return chains;
	}
	function differentFrom(expected) {
		assert.notDeepStrictEqual(value, expected);
		return chains;
	}

	/** @type {any} */
	function equalsInJSON(expected) {
		assert.deepStrictEqual(JSON.stringify(value), JSON.stringify(expected));
		return chains;
	}

	function greaterThan(expected) {
		if(value > expected)
			return chains;
			throwAsserionError(`value is not greater than ${expected}`, `greather than ${expected}`, value);
	}
	function lessThan(expected) {
		if(value < expected)
			return chains;
		throwAsserionError(`value is not less than ${expected}`, `less than ${expected}`, value);
	}

	/** @param {{[fieldName: string]: any}} equalMap */
	function fieldsEqual(equalMap) {
		for (let fieldName in equalMap)
			assert.deepStrictEqual(value[fieldName], equalMap[fieldName]);
		return chains;
	}

	function isArray() {
		if (!Array.isArray(value))
			throwAsserionError('Value is not an array', 'An Array', value);
		return chains;
	}

	/** @param {number} len */
	function length(len) {
		if (!('length' in value))
			throwAsserionError('`length` is missing in value', 'has `length` field', value);
		if (value.length !== len)
			throwAsserionError(`value.length != ${len}`, len, value.length);
		return chains;
	}

	/** @param {string[]} keys */
	function containsKeys(...keys) {
		for (let k of keys)
			if (!(k in value))
				throwAsserionError(`\`${k}\` is missing in value`, `{ "${k}": any, ... }`, value);
		return chains;
	}

	function allKeys() { return convertBy(value => Object.keys(value)); }
	function allKeyValueTuples() { return convertBy(value => Object.keys(value).map(k => ({ k, v: value[k] })));}
	function sort() {
		isArray();
		return convertBy(value => Object.assign([], value).sort());
	}

	/** @param {string} fieldName */
	function child(fieldName) {
		containsKeys(fieldName);
		return convertBy(value => value[fieldName]);
	}

	/** @param {(any) => any} handler */
	function convertBy(handler) {
		return Assert(handler(value));
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
