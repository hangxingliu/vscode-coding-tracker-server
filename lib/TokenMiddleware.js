var errorDescription = 'token is invalid';
module.exports = {
	get: token =>
		(req, res, next) =>
			req.body.token !== token  && req.query.token !== token ?
				Log.error(errorDescription) + res.json({ error: errorDescription }).end() :
				next()
};