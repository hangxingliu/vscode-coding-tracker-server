
"use strict";
const JSON_HEADER = { "Content-Type": "application/json; charset=utf-8" },
	ERROR_DESCRIPTION = 'token is invalid';

const log = require('./Log');

module.exports = {
	get: token =>
		(req, res, next) =>
			(req.body.token !== token && req.query.token !== token) ?
				(log.error(ERROR_DESCRIPTION),
					res.writeHead(403, JSON_HEADER),
					res.write(JSON.stringify({ error: ERROR_DESCRIPTION })),
					res.end()) :
				next()
};