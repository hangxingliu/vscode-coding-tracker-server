const JSON_HEADER = { "Content-Type": "application/json; charset=utf-8" };

const log = require('./Log');

var returnError = (res, code, errInfo) =>
	(res.writeHead(code, JSON_HEADER), res.write(JSON.stringify({ error: errInfo })), res.end());
	
module.exports = function (expressApp) {
	//404
	expressApp.use((req, res) => returnError(res, 404, 'Request invalid'));
	//500
	//eslint-disable-next-line no-unused-vars
	expressApp.use((err, req, res, next) => log.error(err.stack) + returnError(res, 500, 'Server inner error'));
};