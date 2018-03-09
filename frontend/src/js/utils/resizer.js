//@ts-check
/// <reference path="../index.d.ts" />

/*
	This is a module for resize charts if size of window is changed.
*/


/** @type {EChartsObject[]} */
let echartInstances = [];
/** @type {NodeJS.Timer} */
let delay = null;

$(window).on('resize', () => {
	if (!echartInstances.length) return;
	if (delay)
		clearTimeout(delay);
	delay = setTimeout(notify, 100);
});

function notify() {
	delay = null;
	echartInstances.forEach(e => e.resize());
}

/**
 * @param {EChartsObject[]} _echartInstances
 */
function subscribe(_echartInstances) {
	echartInstances = echartInstances.concat(_echartInstances);
}

module.exports = {
	subscribe,
	removeSubscriber: () => echartInstances = []
};
