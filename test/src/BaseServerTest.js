var killAll = require('tree-kill'),
	fs = require('fs-extra'),
	request = require('request');

const PORT = 24680,
	TOKEN = 'token123456',
	TEST_BASE_URL = `http://127.0.0.1:${PORT}`,
	DATABASE_FOLDER = `${__dirname}/../resources/database`;

const TEST_STATIC_RESOURCE = `${TEST_BASE_URL}/report/`,
	TEST_API_TOKEN = `${TEST_BASE_URL}/ajax/test`,
	TEST_UPLOAD = `${TEST_BASE_URL}/ajax/upload`,
	TEST_KILL = `${TEST_BASE_URL}/ajax/kill`;

var server;

//Clean resource database
fs.removeSync(DATABASE_FOLDER);

describe('Start Server', function() {
	it('#Start Server', function(then){
		this.slow(1000);
		var goThen = true;
		server = require('child_process').spawn('node',
			['app.js', '-p', `${PORT}`, '-t', `${TOKEN}`, '-o', DATABASE_FOLDER, '--local'],
			{ cwd: `${__dirname}/../../` });
		server.stdout.setEncoding('utf8');
		server.stdout.on('data', data => {
			if (data.indexOf('Server started!') >= 0 && goThen) {
				goThen = false;
				return then();
			}
		});
	});
});

describe('Request test', () => {
	it('#Welcome information', then => {
		request.get(TEST_BASE_URL, {},
			testGroup(CONNECT, IS_200, IS_JSON, JSON_EVAL('obj.localServerMode === true'), then));
	});
	it('#Static resources', then => {
		request.get(TEST_STATIC_RESOURCE, {},
			testGroup(CONNECT, IS_200, IS_HTML, REGEX(/jquery\.min\.js/), then));
	});
	describe('Token test', () => {
		it('#Token test (GET Invalid)', then => {
			request.get(TEST_API_TOKEN, { qs: { token: 'WrongToken' } },
				testGroup(CONNECT, IS_403, IS_JSON, JSON_ERROR, then));
		});
		it('#Token test (POST Invalid)', then => {
			request.post(TEST_API_TOKEN, { form: { token: 'WrongToken' } },
				testGroup(CONNECT, IS_403, IS_JSON, JSON_ERROR, then));
		});
		it('#Token test (GET)', then => {
			request.get(TEST_API_TOKEN, { qs: { token: TOKEN } },
				testGroup(CONNECT, IS_200, IS_JSON, JSON_SUCCESS, then));
		});
		it('#Token test (POST)', then => {
			request.post(TEST_API_TOKEN, { form: { token: TOKEN } },
				testGroup(CONNECT, IS_200, IS_JSON, JSON_SUCCESS, then));
		});
	});

	describe('Upload test', () => {
		it('#has not version', then => {
			request.post(TEST_UPLOAD, { form: { token: TOKEN } },
				testGroup(CONNECT, IS_JSON, JSON_ERROR, REGEX(/invalid/), then));
		});
		it('#wrong version', then => {
			request.post(TEST_UPLOAD, { form: { token: TOKEN, version: '1.2.3' } },
				testGroup(CONNECT, IS_JSON, JSON_ERROR, REGEX(/invalid/), then));
		});
		it('#low version', then => {
			request.post(TEST_UPLOAD, { form: { token: TOKEN, version: '1.0' } },
				testGroup(CONNECT, IS_JSON, JSON_ERROR, REGEX(/version/), then));
		});
		it('#high version', then => {
			request.post(TEST_UPLOAD, { form: { token: TOKEN, version: '10.0' } },
				testGroup(CONNECT, IS_JSON, JSON_ERROR, REGEX(/version/), then));
		});
		it('#missing params', then => {
			request.post(TEST_UPLOAD, { form: { token: TOKEN, version: '3.0', type: 0 } },
				testGroup(CONNECT, IS_JSON, JSON_ERROR, REGEX(/missing/), then));
		});
		it('#params not an integer', then => {
			request.post(TEST_UPLOAD, {
				form: {
					token: TOKEN, version: '3.0', type: 0, time: Date.now(), long: '?',
					lang: 'javascript', file: 'file', proj: 'proj', pcid: 'test'
				}
			}, testGroup(CONNECT, IS_JSON, JSON_ERROR, REGEX(/long/), REGEX(/integer/), then));
		});
		it('#success', then => {
			request.post(TEST_UPLOAD, {
				form: {
					token: TOKEN, version: '3.0', type: 0, time: Date.now(), long: 2000,
					lang: 'javascript', file: 'file', proj: 'proj', pcid: 'test'
				}
			}, testGroup(CONNECT, IS_JSON, JSON_SUCCESS, then));
		});

		it('#success storage to file', function (then) {
			this.retries(10);
			this.slow(500);
			//check is there a database file
			setTimeout(() => {
				let files = fs.readdirSync(DATABASE_FOLDER);
				for (let file of files)
					if (file.endsWith('.db') && fs.statSync(`${DATABASE_FOLDER}/${file}`).isFile())
						return then();
				return then(new Error(`server has not storage tracking data.`));
			}, 100);
		});
	});


	describe('kill test', () => {
		it('#call kill method', then => {
			request.get(TEST_KILL, { qs: { token: TOKEN } },
				testGroup(CONNECT, IS_JSON, JSON_SUCCESS, then));
		});
		it('#had kill', function(then){
			this.retries(10);
			request.get(TEST_KILL, { qs: { token: TOKEN} },
				testGroup(CONNECT_ERROR, then));
		});
	});

	//End Request test
});



describe('Stop Server', () => {
	it('#Stop Server', then => {
		killAll(server.pid, 'SIGTERM', then);
	});	
});


//-------------------------------------------------
function CONNECT(err) { if (err) throw err; }
function CONNECT_ERROR(err) { if (!err) throw new Error(`request connected, but expectation is not!`);}
function IS_200(err, res) { STATUS_CODE(200)(err, res) }
function IS_403(err, res) { STATUS_CODE(403)(err, res) }
function IS_404(err, res) { STATUS_CODE(404)(err, res) }
function IS_500(err, res) { STATUS_CODE(500)(err, res) }
function IS_JSON(err, res) { CONTENT_TYPE('application/json')(err, res); }
function IS_HTML(err, res) { CONTENT_TYPE('text/html')(err, res); }
function CONTENT_TYPE(needContentType) {
	return (err, res) => {
		var contentType = res.headers['content-type'];
		if (!contentType) throw new Error(`response has not content type header`);
		if (contentType.indexOf(needContentType) == -1) throw new Error(`response content type is not ${needContentType}`);
	};
}
function STATUS_CODE(code) {
	return (err, res) => { if (res.statusCode != code) throw new Error(`response code is ${res.statusCode} but not ${code}!`) };
}
function REGEX(regex) {
	return (err, res, bd) => { if (!bd.match(regex)) throw new Error(`result could not match "${regex.source}"`) }
}
function JSON_SUCCESS(err, res, bd) { JSON_EVAL('obj.success')(err, res, bd)}
function JSON_ERROR(err, res, bd) { JSON_EVAL('obj.error')(err, res, bd)}
function JSON_EVAL(express) {
	return (err, res, bd) => {
		try {
			var obj = JSON.parse(bd);
		} catch (e) { throw new Error('result is illegal JSON object'); }
		try {
			var result = eval(express);
		} catch (e) { throw new Error(`result object could not eval ${express}`);}
		if (!result)
			throw new Error(`${express} is false wrong`);
	};	
}
function ECHO(err, res, bd) {console.log(bd);}

//-------------------------------------------------
function testGroup() {
	var func = [];
	for (let i = 0; i < arguments.length; i++)
		func.push(arguments[i]);
	var then = func.pop();
	return (err, res, body) => {
		func.forEach(fun => fun(err, res, body));
		then();
	};
}