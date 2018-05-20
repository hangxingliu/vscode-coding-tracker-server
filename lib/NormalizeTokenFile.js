//@ts-check

const { guess } = require('./GuessSimilarStrings');

const rootProps = ["adminToken", "viewReportToken", "uploadToken"];

module.exports = { normalizeTokenFileObject };

/**
 * @param {any} tokenObject
 * @returns {{
		error: string;
		warnings: string[];
		result: {
			adminToken: {token: string}[];
			viewReportToken: {token: string}[];
			uploadToken: {token: string; computerId?: string[]}[];
		}
	}}
 */
function normalizeTokenFileObject(tokenObject) {
	let error = undefined;
	let warnings = [];
	let adminToken = [];
	let viewReportToken = [];
	let uploadToken = [];
	const tokenMap = {};

	let hasAdminToken = false;
	for (const prop in tokenObject) {
		if (error) break;

		if (prop === 'adminToken') {
			hasAdminToken = true;
			const arr = tokenObject[prop];
			if (!mustArray('adminToken', arr)) break;
			if (arr.length === 0) {
				error = `"adminToken" is required, but it is a empty array!`;
				break;
			}
			for (let i = 0; i < arr.length; i++) {
				if (!isFieldTokenOK('adminToken', i, arr[i]))
					break;
				adminToken.push(arr[i]);
			}
			continue;
		}


		if (prop === 'viewReportToken') {
			const arr = tokenObject[prop];
			if (typeof arr === 'string') {
				if (arr === 'public')
					viewReportToken = null;
				else
					error = `"viewReportToken" should be an array or string "public", but it is "${arr}"`;
				continue;
			}
			if (!mustArray('viewReportToken', arr)) break;
			for (let i = 0; i < arr.length; i++) {
				if (!isFieldTokenOK('viewReportToken', i, arr[i]))
					break;
				viewReportToken.push(arr[i]);
			}
			continue;
		}


		if (prop === 'uploadToken') {
			const arr = tokenObject[prop];
			if (!mustArray('uploadToken', arr)) break;
			for (let i = 0; i < arr.length; i++) {
				const it = arr[i];
				if (!isFieldTokenOK('uploadToken', i, it))
					break;

				const it2 = Object.assign({}, it); // immutable
				if (typeof it2.computerId === 'string') {
					it2.computerId = [it2.computerId];
				} else if (Array.isArray(it.computerId)) {
					const { computerId } = it;
					for (let j = 0; j < computerId.length; j++) {
						if (typeof computerId[j] !== 'string') {
							error = `"uploadToken[${i}].computerId[${j}]" should be a string`
							break;
						}
					}
					if (error) break;
				} else if (typeof it2.computerId != 'undefined') {
					error = `"uploadToken[${i}].computerId" should be an array or a string,` +
						`but is is a ${typeof it2.computerId}`;
					break;
				}
				uploadToken.push(it2);
			}
			continue;
		}

		// Special JSON field names, for example: $schema
		if (prop.startsWith('$'))
			continue;
		warnings.push(`unknwon token type "${prop}" ${didYouMean(prop, rootProps)}`);
	}

	if (!hasAdminToken)
		error = '"adminToken" is required, but it is missing!';

	return { error, warnings, result: { adminToken, viewReportToken, uploadToken } };

	function mustArray(name, object) {
		if (!Array.isArray(object)) {
			error = `"${name}" should be an array, but it is ${typeof object}`;
			return false;
		}
		return true;
	}
	function isFieldTokenOK(name, index, object) {
		if (typeof object !== 'object') {
			error = `"${name}[${index}]" should be an object, but it is ${typeof object}`;
			return false;
		}
		const token = object.token;
		if (typeof token !== 'string') {
			error = `"${name}[${index}].token" should be a string, but it is ${typeof token}`;
			return false;
		}
		if (!token.trim()) {
			error = `"${name}[${index}].token" could not be empty or blank spaces string`;
			return false;
		}
		if (token in tokenMap) {
			error = `"${name}[${index}].token" is duplicated!`;
			return false;
		}
		tokenMap[token] = true;
		return true;
	}
}


function didYouMean(str, dict) {
	const result = guess(str, dict);
	if (result.rate >= 0.3)
		return `(Did you mean: "${result.match}"?)`;
	return '';
}
