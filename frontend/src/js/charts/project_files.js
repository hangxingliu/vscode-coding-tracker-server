//@ts-check
/// <reference path="../index.d.ts" />

let {
	convertUnit2Hour,
	orderByWatchingTime,
	object2array,
	getEachFieldToFixed2
} = require('../utils/utils'), {
	createEChartsSeries,
		AXIS_HOURS,
		GRID_NORMAL,
} = require('../utils/echartsUtils');

function tooltipFormatter(p, ticket, set) {
	let setText = text => (setTimeout(set, 1, ticket, text), text);
	let i = p.dataIndex;
	if (i >= fileNames.length) return setText(null);
	return setText(`You spent<br/> (<b>${p.value}</b> hours)<br/> on <u>${fileNames[i]}</u>`);
}

/**
* @type {APIResponse}
*/
let dataCache = null;
let fileNames = [];

let base = require('./_base').createBaseChartClass();
module.exports = { recommendedChartId: 'project_files', init: base.init, update };

function update({ top = 10, data = null }) {
	if (data == null)
		data = dataCache; //Read from cache
	else
		dataCache = data; //Write to cache
	let array = orderByWatchingTime(object2array(convertUnit2Hour(data))),
		displayFileNames = [];
	if (top > 0) array = array.slice(-top);

	let chart = base.getCharts();
	let height = array.length * 50;
	$(base.getDOM()).height(height);
	chart.resize({ height });

	fileNames = array.map(it => decodeURIComponent(it.name));
	displayFileNames = fileNames.map((name, i) =>
		name + ` (${Number(array[i].watching).toFixed(2)} hs)`);
	
	chart.setOption({
		legend: { data: [''] },
		xAxis: {
			type: 'value', nameLocation: 'end', position: 'top',
			axisTick: { show: false }, axisLabel: AXIS_HOURS.axisLabel },
		yAxis: {
			type: 'category', nameLocation: 'start',
			// interval: 0 for force display all label
			axisTick: { show: false }, axisLabel: { inside: true, interval: 0 }, z: 2048,
			data: displayFileNames },
		grid: GRID_NORMAL,
		tooltip: { trigger: 'item', formatter: tooltipFormatter},
		series: [
			createEChartsSeries('bar', 'watching')
				.setItemColor('#E4F6FE')
				.setValues(getEachFieldToFixed2(array ,'watching'))
				.add({ itemStyle: { normal: {borderColor: '#CAEDFD'}}})
				.toObject()
		]
	});
}
