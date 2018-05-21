//@ts-check

module.exports = {
	simulatePostRequest,
	simulateGetRequest,
	simulateResponse,
};

/**
 * @param {string} uri
 * @param {any} [body]
 */
function simulatePostRequest(uri, body) {
	return {
		originalUrl: uri,
		method: 'POST',
		body: body || {},
		query: {},
	};
}

/**
 * @param {string} uri
 * @param {any} [query]
 */
function simulateGetRequest(uri, query) {
	return {
		originalUrl: uri,
		method: 'GET',
		body: {},
		query: query || {},
	};
}

/**
 *
 * @param {(name: string, parameters: any[]) => any} on
 */
function simulateResponse(on) {
	on = on || ((...p) => void p);
	const methods = ['writeHead', 'write', 'end', 'json'];
	const response = {};
	methods.forEach(m => response[m] = on.bind(this, m));
	return response;
}
