//@ts-check

const JSON_HEADER = { "Content-Type": "application/json; charset=utf-8" };
const HTML_HEADER = { "Content-Type": "text/html; charset=utf-8" };

const TITLE_500 = `Server inner error`;

const log = require('./Log');

module.exports = { setup, on404, on500 };

function setup(expressApp) {
	//fake 500
	//@ts-ignore
	if (global.DEBUG)
		expressApp.get('/fake-500', () => { throw new Error(`Fake 500`); })

	//404
	expressApp.use(on404);

	//500
	expressApp.use(on500);
}

function on404(req, res) {
	const uri = req.originalUrl;
	if (req.xhr) {
		res.writeHead(404, JSON_HEADER);
		res.write(JSON.stringify({ error: `"${uri}" could not be found` }));
	} else {
		res.writeHead(404, HTML_HEADER);
		res.write(getHTML(404, `"${uri}" could not be found`));
	}
	res.end();
}

//eslint-disable-next-line no-unused-vars
function on500(err, req, res, next) {
	//@ts-ignore
	const debug = global.DEBUG;

	if (!err) err = new Error(`Unknown Error!`);
	log.error(err.stack || err.message || String(err));
	if (req.xhr) {
		res.writeHead(500, JSON_HEADER);
		res.write(JSON.stringify(debug
			? { error: err.message || TITLE_500, stack: err.stack }
			: { error: TITLE_500 }));
	} else {
		res.writeHead(500, HTML_HEADER);
		res.write(debug
			? getHTML(500, err.message || TITLE_500, err.stack)
			: getHTML(500, TITLE_500));
	}
	res.end();
}

/**
 * @param {any} title
 * @param {string} description
 * @param {string} extraCode
 */
function getHTML(title, description, extraCode = null) {
	return `<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>${title}</title>
	<style>
		* { line-height: 1.2; margin: 0; }
		html { color: #888; display: table; font-family: sans-serif; height: 100%; text-align: center; width: 100%; }
		body { display: table-cell; vertical-align: middle; margin: 2em auto; }
		h1 { color: #555; font-size: 2em; font-weight: 400; }
		.error { max-width: 80%; background: #f8f8f8; border-radius: 20px; margin: 20px auto 0 auto; padding: 20px; }
		pre { text-align: left; padding: 0 0 20px 0; overflow-x: auto; }
		p { margin: 0 auto; width: 280px; }
		@media only screen and (max-width: 576px) {
			html, body { display: inherit; }
			.error { max-width: 100%; }
		}
	</style>
</head>
<body>
	<h1>${title}</h1>
	<p>${description}</p>
	${extraCode ? (`<div class="error"><pre><code>${extraCode}</code></pre></div>`) : ''}
</body>
</html>`;
}
