//@ts-check

const fs = require('fs-extra');
const path = require('path');

const { Assert, Invoke } = require('@hangxingliu/assert');
const { simulateGetRequest, simulatePostRequest, simulateResponse } = require('./utils/SimulateExpressReqRes');

const fakeParseCliArguments = require('./utils/LoadFakeParseCliArguments');
fakeParseCliArguments.setup();

const TokenMiddleware = require('../../lib/TokenMiddleware');
const { getMiddleware } = TokenMiddleware;
TokenMiddleware.disable403Log();

const tokenFileDir = path.join(__dirname, '..', 'resources', 'token-files');
const getTokenFilePath = (fileName, checked = true) => {
	const p = path.join(tokenFileDir, fileName);
	if (checked) Assert(fs.statSync(p).isFile()).isTrue();
	return p;
}

const defaultTokenFile = {
	normal: getTokenFilePath('default.json'),
	notExisted: getTokenFilePath('default-dont-create-me.json', false),
	incorrect: getTokenFilePath('default-incorrect.json')
};

describe('TokenMiddleware (prepare check)', () => {
	it('# LoadFakeParseCliArguments#selfTest', () => {
		fakeParseCliArguments.selfTest()
	});
	it('# token file directory is existed', () => {
		Assert(fs.statSync(tokenFileDir).isDirectory()).isTrue();
	});
});

describe('TokenMiddleware', () => {
	// call log for 403 or next
	let callStack = [];
	const initCallStack = () => { callStack = []; }
	const next = () => callStack.push('next');
	const res = simulateResponse((name, statusCode) => {
		if (name === 'writeHead')
			callStack.push(String(statusCode));
	});

	const defaultToken = '123456';

	// AsciiArt:
	//   URL: http://patorjk.com/software/taag/
	//   Font: Standard

	//  _____         _        ___           _
	// |_   _|__  ___| |_     / _ \  __  __ / |
	//   | |/ _ \/ __| __|   | | | | \ \/ / | |
	//   | |  __/\__ \ |_    | |_| |  >  <  | |
	//   |_|\___||___/\__|    \___/  /_/\_\ |_|
	it('# 0x1: empty cli args; default token file is not existed', () => {
		fakeParseCliArguments.setDefaultAdminToken(defaultToken);
		fakeParseCliArguments.setDefaultTokenFile(defaultTokenFile.notExisted);
		fakeParseCliArguments.setCliArgs({});
		TokenMiddleware.initMiddleware();

		// 403
		initCallStack();
		getMiddleware('admin')(simulateGetRequest('/test'), res, next);
		getMiddleware('upload')(simulateGetRequest('/test'), res, next);
		getMiddleware('report')(simulateGetRequest('/test'), res, next);

		getMiddleware('admin')(simulateGetRequest('/test', { token: '23456' }), res, next);
		getMiddleware('upload')(simulateGetRequest('/test', { token: '23456' }), res, next);
		getMiddleware('report')(simulateGetRequest('/test', { token: '23456' }), res, next);
		Assert(callStack).equalsInJSON(Array(6).fill('403'));

		// passed
		const param = { token: defaultToken };
		initCallStack();
		getMiddleware('admin')(simulateGetRequest('/test', param), res, next);
		getMiddleware('admin')(simulatePostRequest('/test', param), res, next);
		getMiddleware('upload')(simulateGetRequest('/test', param), res, next);
		getMiddleware('upload')(simulatePostRequest('/test', param), res, next);
		getMiddleware('report')(simulateGetRequest('/test', param), res, next);
		getMiddleware('report')(simulatePostRequest('/test', param), res, next);

		Assert(callStack).equalsInJSON(Array(6).fill('next'));
	});


	//  _____         _        ___           ____
	// |_   _|__  ___| |_     / _ \  __  __ |___ \
	//   | |/ _ \/ __| __|   | | | | \ \/ /   __) |
	//   | |  __/\__ \ |_    | |_| |  >  <   / __/
	//   |_|\___||___/\__|    \___/  /_/\_\ |_____|
	it('# 0x2: --public-report; default token file is not existed', () => {
		fakeParseCliArguments.setDefaultAdminToken(defaultToken);
		fakeParseCliArguments.setDefaultTokenFile(defaultTokenFile.notExisted);
		fakeParseCliArguments.setCliArgs({ publicReport: true });
		TokenMiddleware.initMiddleware();

		initCallStack();
		getMiddleware('admin')(simulateGetRequest('/test'), res, next);
		getMiddleware('report')(simulateGetRequest('/test'), res, next);
		getMiddleware('upload')(simulateGetRequest('/test'), res, next);
		Assert(callStack).equalsInJSON(['403', 'next', '403']);

		const param = { token: defaultToken };
		initCallStack();
		getMiddleware('admin')(simulateGetRequest('/test', param), res, next);
		getMiddleware('admin')(simulatePostRequest('/test', param), res, next);
		getMiddleware('upload')(simulateGetRequest('/test', param), res, next);
		getMiddleware('upload')(simulatePostRequest('/test', param), res, next);

		Assert(callStack).equalsInJSON(Array(4).fill('next'));
	});

	//  _____         _      ___           _____
	// |_   _|__  ___| |_   / _ \  __  __ |___ /
	//   | |/ _ \/ __| __| | | | | \ \/ /   |_ \
	//   | |  __/\__ \ |_  | |_| |  >  <   ___) |
	//   |_|\___||___/\__|  \___/  /_/\_\ |____/
	it('# 0x3: --public-report --token=654321; default token file is not existed', () => {
		const token = '654321';
		fakeParseCliArguments.setDefaultAdminToken(defaultToken);
		fakeParseCliArguments.setDefaultTokenFile(defaultTokenFile.notExisted);
		fakeParseCliArguments.setCliArgs({ publicReport: true, token });
		TokenMiddleware.initMiddleware();

		initCallStack();
		getMiddleware('admin')(simulateGetRequest('/test'), res, next);
		getMiddleware('upload')(simulateGetRequest('/test'), res, next);
		getMiddleware('report')(simulateGetRequest('/test'), res, next);

		getMiddleware('admin')(simulateGetRequest('/test', { token: '23456' }), res, next);
		getMiddleware('upload')(simulateGetRequest('/test', { token: '23456' }), res, next);
		getMiddleware('report')(simulateGetRequest('/test', { token: '23456' }), res, next);
		Assert(callStack).equalsInJSON(['403', '403', 'next', '403', '403', 'next']);

		initCallStack();
		getMiddleware('admin')(simulateGetRequest('/test', { token }), res, next);
		getMiddleware('admin')(simulatePostRequest('/test', { token }), res, next);
		getMiddleware('upload')(simulateGetRequest('/test', { token }), res, next);
		getMiddleware('upload')(simulatePostRequest('/test', { token }), res, next);
		Assert(callStack).equalsInJSON(Array(4).fill('next'));
	});

	//  _____         _      ___           _  _
	// |_   _|__  ___| |_   / _ \  __  __ | || |
	//   | |/ _ \/ __| __| | | | | \ \/ / | || |_
	//   | |  __/\__ \ |_  | |_| |  >  <  |__   _|
	//   |_|\___||___/\__|  \___/  /_/\_\    |_|
	it('# 0x4: incorrect default token file', () => {
		fakeParseCliArguments.setDefaultTokenFile(defaultTokenFile.incorrect);
		fakeParseCliArguments.setCliArgs({}, null, true);//true: --no-token-file
		TokenMiddleware.initMiddleware(); // not throw because `--no-token`

		fakeParseCliArguments.setCliArgs({});// will load default token file
		Invoke(() => TokenMiddleware.initMiddleware()).hasException('adminToken');
	});

	it('# unload fake ParseCliArguments', () => { fakeParseCliArguments.unload(); });
});
