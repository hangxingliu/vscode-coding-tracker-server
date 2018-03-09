//@ts-check
/// <reference path="../index.d.ts" />

let {
	orderByWatchingTime,
	object2array
} = require('../utils/utils'),
	echarts = require('../utils/echartsUtils'),
	dateTime = require('../utils/datetime'),
	{ ONE_HOUR, getReadableTime } = dateTime;

const EACH_HEIGH = 50;

const SIZE = 5;
let limit = SIZE, autoSize = false;

/** @type {string[]} */
let fileNames = [];

function tooltipFormatter(p, ticket, set) {
	let setText = text => (setTimeout(set, 1, ticket, text), text);
	let i = p.dataIndex;
	if (i >= fileNames.length) return setText(null);
	return setText(`You spent <b>${getReadableTime(p.value)}</b><br/> on <u>${fileNames[i]}</u>`);
}

let base = require('./_base').createBaseChartClass();
module.exports = { recommendedChartId: 'files', init, update };

function init(dom, _limit = SIZE, _autoSize = false) {
	limit = _limit;
	autoSize = _autoSize;
	return base.init(dom);
}

function update(dataGroupByFile) {
	let array = orderByWatchingTime(object2array(dataGroupByFile)),
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
		name + `(${getReadableTime(array[i].watching)})`);

	let maxDuration = array.length ? array[array.length - 1].watching : ONE_HOUR;
	base.getCharts().setOption({
		legend: { data: [''] },
		xAxis: echarts.createTotalDurationXAxisForBar(maxDuration),
		yAxis: {
			type: 'category', nameLocation: 'start',
			axisTick: { show: false }, axisLabel: { inside: true, interval }, z: 1024,
			data: displayFileNames },
		grid: echarts.createPaddingGrid(15, 20, 0, 0),
		tooltip: { trigger: 'item', formatter: tooltipFormatter},
		series: [
			echarts.createSeries('bar', 'watching')
				.setItemColor('#ce93d8')
				.setValues(array.map(it=>it.watching))
				.toObject()
		]
	});
}
