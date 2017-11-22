//@ts-check
/*
Example:

let q = createQueue(data => {
	setTimeout(() => {
		if(Math.random() > 0.5)
			return q.retry();//failed
		console.log('Success:', data);
		q.next();
	}, 1000);
});

q.add({result: 'ok'});
q.add("Your name");
q.add([1, 2, 3]);

*/

let log = require('./Log');

/**
 * @param {(data: any) => any} handler
 * @param {number} maxRetry max retry times for one task
 */
function createQueue(handler, maxRetry = 3) {
	let q = [], qLock = false, retryCount = 0;

	let context = { add, next, retry };
	return context;

	function add(data) {
		q.push(typeof data == 'object' ? Object.assign(Array.isArray(data) ? [] : {}, data) : data);

		if (!qLock)
			handleFirstTaskInQueue();
	}

	function next() {
		q.shift();
		retryCount = 0;

		if (q.length)
			return handleFirstTaskInQueue();

		qLock = false;
	}

	function retry() {
		if (retryCount > maxRetry) {
			log.error(`Queue: task cancelled because too many retry (${maxRetry})`);
			return next();
		}

		retryCount++;
		if (q.length)
			return handleFirstTaskInQueue();
	}

	function handleFirstTaskInQueue() {
		qLock = true;
		process.nextTick(handler, q[0]);

		//@ts-ignore
		global.DEBUG && log(`Queue: handle first task in next tick. total task: ${q.length}`);
	}
}


module.exports = createQueue;
