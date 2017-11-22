//@ts-check

let killAll = require('tree-kill'),
	fs = require('fs-extra'),
	request = require('request'),
	Async = require('async'),
	createValidate = require('./_ResponseValidator');

const LOG_FOLDER = `${__dirname}/../log`;
const LOG_SERVER_FILE = `${LOG_FOLDER}/server-stdout-stderr.log`;
const LOG_RESPONSE_FILE = `${LOG_FOLDER}/response.log`;

const LOG_SERVER = [];
const LOG_RESPONSE = [];

//Create log folder
fs.existsSync(LOG_FOLDER) || fs.mkdirsSync(LOG_FOLDER);
//Create empty log files
fs.writeFileSync(LOG_SERVER_FILE, '');
fs.writeFileSync(LOG_RESPONSE_FILE, '');


const PORT = 24680,
	TOKEN = 'token123456',
	TEST_BASE_URL = `http://127.0.0.1:${PORT}`,
	DATABASE_FOLDER = `${__dirname}/../resources/database`;

const TEST_STATIC_RESOURCE = `${TEST_BASE_URL}/report/`,
	TEST_API_TOKEN = `${TEST_BASE_URL}/ajax/test`,
	TEST_UPLOAD = `${TEST_BASE_URL}/ajax/upload`,
	TEST_KILL = `${TEST_BASE_URL}/ajax/kill`,
	TEST_REPORT_RECENT = `${TEST_BASE_URL}/ajax/report/recent`,
	TEST_REPORT_LAST_24HS = `${TEST_BASE_URL}/ajax/report/last24hs`,
	TEST_REPORT_PROJECT = `${TEST_BASE_URL}/ajax/report/project`;

const NOW = Date.now();
const _5S = 5000, _2S = 2000;
const UPLOAD_RECORDS = [
	{ type: 'open', time: NOW - 8 * _5S, long: _5S, lang: 'html', file: 'index.html', proj: 'old_proj' },
	{ type: 'open', time: NOW - 2 * _5S, long: _5S, lang: 'html', file: 'test.html', proj: 'proj' },
	{ type: 'open', time: NOW - _5S, long: _5S, lang: 'javascript', file: 'index.js', proj: 'proj' },
	{ type: 'code', time: NOW - _2S, long: _2S, lang: 'javascript', file: 'index.js', proj: 'proj' },
];
const UPLOAD_COMMON = { token: TOKEN, version: '3.0', pcid: 'test' };

const RESPONSE_ERROR = 'obj.error';
const RESPONSE_SUCCESS = 'obj.success';

let server;
//Clean resource database
fs.removeSync(DATABASE_FOLDER);

describe('Start server', function() {
	it('#Start Server', function(then){
		this.slow(1000);
		var goThen = true;
		server = require('child_process').spawn('node',
			['app.js', '-p', `${PORT}`, '-t', `${TOKEN}`, '-o', DATABASE_FOLDER, '--local', '--debug'],
			{ cwd: `${__dirname}/../../` });
		server.stdout.setEncoding('utf8');
		server.stderr.setEncoding('utf8');
		server.stderr.on('data', data => LOG_SERVER.push(data));
		server.stdout.on('data', data => {
			LOG_SERVER.push(data);
			if (typeof data == 'string' && data.indexOf('Server started!') >= 0 && goThen) {
				goThen = false;
				return then();
			}
		});
	});
});

describe('Request test', () => {

	it('#Welcome information', then =>
		get(TEST_BASE_URL, {}, then).isJSON().test('obj.localServerMode === true'));

	it('#Static resources', then =>
		get(TEST_STATIC_RESOURCE, {}, then).isHTML().regexp(/jquery\.min\.js/));

	describe('Token test', () => {
		it('#Token test (GET Invalid)', then =>
			get(TEST_API_TOKEN, { qs: { token: 'WrongToken' } }, then, true, 403).isJSON().exist(RESPONSE_ERROR));

		it('#Token test (POST Invalid)', then =>
			post(TEST_API_TOKEN, { form: { token: 'WrongToken' } }, then, true, 403).isJSON().exist(RESPONSE_ERROR));

		it('#Token test (GET)', then =>
			get(TEST_API_TOKEN, { qs: { token: TOKEN } }, then).isJSON().exist(RESPONSE_SUCCESS));

		it('#Token test (POST)', then =>
			post(TEST_API_TOKEN, { form: { token: TOKEN } }, then).isJSON().exist(RESPONSE_SUCCESS));

	});

	describe('Upload test', () => {
		it('#has not version', then =>
			post(TEST_UPLOAD, { form: { token: TOKEN } }, then)
				.isJSON().exist(RESPONSE_ERROR).regexp(/empty/));
		it('#wrong version1', then =>
			post(TEST_UPLOAD, { form: { token: TOKEN, version: '1.2.3' } }, then)
				.isJSON().exist(RESPONSE_ERROR).regexp(/unsupported/));

		it('#wrong version2', then =>
			post(TEST_UPLOAD, { form: { token: TOKEN, version: '4.0.3' } }, then)
				.isJSON().exist(RESPONSE_ERROR).regexp(/unsupported/));

		it('#wrong version3', then =>
			post(TEST_UPLOAD, { form: { token: TOKEN, version: 'version' } }, then)
				.isJSON().exist(RESPONSE_ERROR).regexp(/unsupported/));

		it('#missing params', then =>
			post(TEST_UPLOAD, { form: { token: TOKEN, version: '3.0', type: 0 } }, then)
				.isJSON().exist(RESPONSE_ERROR).regexp(/missing/));

		it('#params not an integer', then =>
			post(TEST_UPLOAD, {
				form: {
					token: TOKEN, version: '3.0', type: 0, time: Date.now(), long: '?',
					lang: 'javascript', file: 'file', proj: 'proj', pcid: 'test'
				}
			}, then).isJSON().exist(RESPONSE_ERROR).regexp(/long/).regexp(/integer/));

		it('#success', then =>
			Async.mapLimit(UPLOAD_RECORDS, 1, (record, then) =>
				post(TEST_UPLOAD, { form: Object.assign({}, record, UPLOAD_COMMON) }, then)
					.isJSON().exist(RESPONSE_SUCCESS), then));

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

	describe('Analyze test', () => {
		it('#recent', then =>
			get(TEST_REPORT_RECENT, { qs: { token: TOKEN } }, then).isJSON()
				.test('obj.total.coding > 0')
				.test('obj.total.watching > 0')
				.test('obj.groupBy.computer.test')
				.test('obj.groupBy.project.proj && obj.groupBy.project.old_proj')
				.test('obj.groupBy.file["test.html"] && obj.groupBy.file["index.js"]')
				.test('obj.groupBy.language.html && obj.groupBy.language.javascript')
				.test('Object.keys(obj.groupBy.day).length > 0'));

		it('#last24hs', then =>
			get(TEST_REPORT_LAST_24HS, { qs: { token: TOKEN } }, then)
				.test('obj.total.coding > 0')
				.test('obj.total.watching > 0')
				.test('Object.keys(obj.groupBy.hour).length > 0'));

		it('#project (missing parameter)', then =>
			get(TEST_REPORT_PROJECT, { qs: { token: TOKEN } }, then)
				.status4xx().exist(RESPONSE_ERROR).regexp(/missing parameter/));

		it('#project', then =>
			get(TEST_REPORT_PROJECT, { qs: { token: TOKEN, project: 'proj' } }, then)
				.test('obj.total.coding > 0')
				.test('obj.total.watching > 0')
				.test('obj.groupBy.computer.test')
				// has proj but not old_proj
				.test('obj.groupBy.project.proj && !obj.groupBy.project.old_proj')
				// has files in project "proj" but not files in project "old_proj"
				.test('obj.groupBy.file["test.html"] && obj.groupBy.file["index.js"] && !obj.groupBy.file["index.html"]')
				.test('obj.groupBy.language.html && obj.groupBy.language.javascript')
				.test('Object.keys(obj.groupBy.day).length > 0'));
	});

	describe('kill test', () => {
		it('#call kill method', then => {
			get(TEST_KILL, { qs: { token: TOKEN } }, then).test(RESPONSE_SUCCESS);
		});
		it('#had kill', function(then){
			this.retries(10);
			get(TEST_KILL, { qs: { token: TOKEN } }, then, false);
		});
	});

	//End Request test
});

describe('Stop server', () => {
	it('#Stop Server', then => {
		killAll(server.pid, 'SIGTERM', then);
	});
});

describe('Write log to file', () => {
	it('#Write server output log', then =>
		fs.writeFile(LOG_SERVER_FILE, LOG_SERVER.join('\n'), then));
	it('#Write response log', then =>
		fs.writeFile(LOG_RESPONSE_FILE, LOG_RESPONSE.join('\n'), then));
})


function get(url, param, then, connected = true, statusCode = 0) {
	return req('get', url, param, then, connected, statusCode);
}
function post(url, param, then, connected = true, statusCode = 0) {
	return req('post', url, param, then, connected, statusCode);
}
function req(method, url, param, then, connected = true, statusCode = 0) {
	let v = validate(connected, statusCode);
	process.nextTick(() => request(url, Object.assign({ method }, param), v.done(then)));
	return v;
}
function validate(connected = true, statusCode = 0) {
	let v = createValidate().test((err, res, body) => {
		//log
		if (err) {
			LOG_RESPONSE.push(`error: ${err.message}\n${err.stack}\n`);
		} else {
			LOG_RESPONSE.push((res ? res.statusCode : '0') + ':');
			LOG_RESPONSE.push(body);
			LOG_RESPONSE.push('\n');
		}
		return true;
	});
	v = connected ? v.connected() : v.connectFailed();
	if(statusCode) v = v.status(statusCode);
	return v;
}
