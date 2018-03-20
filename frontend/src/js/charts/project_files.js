//@ts-check
/// <reference path="../index.d.ts" />

let {
	orderByWatchingTime,
	object2array
} = require('../utils/utils'),
	echarts = require('../utils/echartsUtils'),
	dateTime = require('../utils/datetime'),
	{ ONE_HOUR, getReadableTime } = dateTime;

function tooltipFormatter(p, ticket, set) {
	let setText = text => (setTimeout(set, 1, ticket, text), text);
	let i = p.dataIndex;
	if (i >= fileNames.length) return setText(null);
	return setText(`You spent<br/> (<b>${getReadableTime(p.value)}</b>)<br/> on <u>${fileNames[i]}</u>`);
}

/**
* @type {APIResponse}
*/
let dataCache = null;
let fileNames = [];

let base = require('./_base').createBaseChartClass();
module.exports = { recommendedChartId: 'project_files', init: base.init, update };

/**
 * @param {{top?: number, data?: any}} attr
 */
function update(attr) {
	let { top = 10, data = null } = attr;

	if (data == null)
		data = dataCache; //Read from cache
	else
		dataCache = data; //Write to cache

	let array = orderByWatchingTime(object2array(data)),
		displayFileNames = [];
	if (top > 0) array = array.slice(-top);

	let chart = base.getCharts();
	let height = array.length * 50;
	$(base.getDOM()).height(height);
	chart.resize({ height });

	fileNames = array.map(it => decodeURIComponent(it.name));
	displayFileNames = fileNames.map((name, i) =>
		name + ` (${getReadableTime(array[i].watching)})`);

	let maxDuration = array.length ? array[array.length - 1].watching : ONE_HOUR;
	chart.setOption({
		legend: { data: [''] },
		xAxis: echarts.createTotalDurationXAxisForBar(maxDuration),
		yAxis: {
			type: 'category', nameLocation: 'start',
			// interval: 0 for force display all label
			axisTick: { show: false }, axisLabel: { inside: true, interval: 0 }, z: 2048,
			data: displayFileNames },
		grid: echarts.createPaddingGrid(15, 20, 0, 0),
		tooltip: { trigger: 'item', formatter: tooltipFormatter},
		series: [
			echarts.createSeries('bar', 'watching')
				.setItemColor('#E4F6FE')
				.setValues(array.map(it=>it.watching))
				.add({ itemStyle: { normal: {borderColor: '#CAEDFD'}}})
				.toObject()
		]
	});
}
