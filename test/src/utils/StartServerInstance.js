//@ts-check

const net = require('net');
const path = require('path');
const { fork } = require('child_process');
const { Assert } = require('@hangxingliu/assert');
const killAll = require('tree-kill');

const { httpGetResponse200JSON, httpGetNotResponse } = require('./Http');
const Log = require('./LogFile');

const SERVER_CWD = path.join(__dirname, '..', '..', '..');
const SERVER_APP = path.join(SERVER_CWD, 'app.js');

module.exports = { selfTest, prepareServerInstance };

function selfTest() {
	const server = prepareServerInstance('self-test', []);
	let testURL = '';
	return server.start()
		.then(port => {
			testURL = `http://127.0.0.1:${port}`;
			Assert(port).isNumber().greaterThan(0);
			return httpGetResponse200JSON(testURL).promise;
		})
		.then(() => server.kill())
		.then(() => httpGetNotResponse(testURL).promise)
		.catch(ex => {
			server.kill(); // no then promise: finnally kill for ensure server be killed!
			throw ex;
		});
}

/**
 * @param {string} serverId
 * @param {string[]} serverOptions
 */
function prepareServerInstance(serverId, serverOptions) {
	const log = Log.createLogFile(`server-${serverId}`);
	let instance = null;

	return { start, kill };

	/** @returns {Promise<number>} server port */
	function start() {
		return new Promise((resolve, reject) => {
			let callbacked = false;
			const callback = (fn, ...param) => {
				if (callbacked) return;
				callbacked = true;
				fn(...param);
			};

			getPort().then(port => {
				const getPortMsg = `Server ${serverId} getPort: ${port}`;
				log.appendLine(getPortMsg);
				// console.log(getPortMsg);

				instance = fork(SERVER_APP,
					[...serverOptions, '--port', String(port)],
					//@ts-ignore
					{ cwd: SERVER_CWD, stdio: 'pipe' });
				instance.stdout.setEncoding('utf8');
				instance.stderr.setEncoding('utf8');
				instance.on('error', error => {
					const msg = `Server ${serverId} onError: ${error.stack}`;
					console.error(msg);
					log.appendLine(msg);
					callback(reject, error);
				});
				instance.on('exit', (code, signal) => {
					const msg = `Server ${serverId} exit with ${signal||''}(${code})`;
					log.appendLine(msg);
					// console.log(msg);

					if(code != 0)
						callback(reject, new Error(msg));
				});
				instance.stderr.on('data', data => {
					log.appendLine(String(data));
				});
				instance.stdout.on('data', data => {
					const str = String(data);
					log.appendLine(str);
					if (str.indexOf('Server started!') >= 0)
						return callback(resolve, port);
				});
			}).catch(ex => callback(reject, ex));
		});
	}

	function kill() {
		return new Promise((resolve, reject) => {
			if (!instance)
				return resolve();
			killAll(instance.pid, 'SIGTERM', error => {
				if (!error) return resolve();

				const msg = `Kill Server ${serverId} onError: ${error.stack}`;
				console.error(msg);
				log.appendLine(msg);
				return reject(error);
			});
		});
	}
}


/** @returns {Promise<number>} */
function getPort() {
	return new Promise((resolve, reject) => {
		const server = net.createServer();
		server.unref();
		server.on('error', reject);
		server.listen(() => {
			const port = server.address().port;
			server.close(() => {
				resolve(port);
			});
		});
	})
}
