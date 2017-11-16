//@ts-check
/// <reference path="../index.d.ts" />

let {
	convertUnit2Hour,
	getReadableTimeString,
	orderByWatchingTime,
	object2array,
	getEachFieldToFixed2,
} = require('../utils/utils'), {
	createEChartsSeries,
	AXIS_HOURS,
	GRID_NORMAL
} = require('../utils/echartsUtils');

const EACH_HEIGH = 50;

const SIZE = 5;
let limit = SIZE, autoSize = false;

/** @type {string[]} */
let fileNames = [];

function tooltipFormatter(p, ticket, set) {
	let setText = text => (setTimeout(set, 1, ticket, text), text);
	let i = p.dataIndex;
	if (i >= fileNames.length) return setText(null);
	return setText(`You spent <b>${getReadableTimeString(p.value)}</b><br/> on <u>${fileNames[i]}</u>`);
}

let base = require('./_base').createBaseChartClass();
module.exports = { recommendedChartId: 'files', init, update };

function init(dom, _limit = SIZE, _autoSize = false) { 
	limit = _limit;
	autoSize = _autoSize;
	return base.init(dom);
}

function update(dataGroupByFile) {
	let data = convertUnit2Hour(dataGroupByFile),
		array = orderByWatchingTime(object2array(data)),
		displayFileNames = [],
		charts = base.getCharts(),
		//interval: 0 for force display all label
		interval = undefined;
	
	if (limit > 0) {
		array = array.slice(-limit);
	}
	if (limit <= 0 || autoSize) {
		let height = (array.length + 1) * EACH_HEIGH;
		$(base.getDOM()).height(height);
		charts.resize({ height });
		interval = 0;
	}
	
	fileNames = array.map(it => decodeURIComponent(it.name));
	displayFileNames = fileNames.map((name, i) =>
		name + `(${getReadableTimeString(array[i].watching)})`);

	base.getCharts().setOption({
		legend: { data: [''] },
		xAxis: {
			type: 'value', nameLocation: 'end', position: 'top',
			axisTick: { show: false }, axisLabel: AXIS_HOURS.axisLabel },
		yAxis: {
			type: 'category', nameLocation: 'start',
			axisTick: { show: false }, axisLabel: { inside: true, interval }, z: 1024,
			data: displayFileNames },
		grid: GRID_NORMAL,
		tooltip: { trigger: 'item', formatter: tooltipFormatter},
		series: [
			createEChartsSeries('bar', 'watching')
				.setItemColor('#ce93d8')
				.setValues(getEachFieldToFixed2(array ,'watching'))
				.toObject()
		]
	});
}
