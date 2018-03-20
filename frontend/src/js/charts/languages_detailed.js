//@ts-check
/// <reference path="../index.d.ts" />

let {
	orderByWatchingTime,
	object2array,
} = require('../utils/utils'),
	echarts = require('../utils/echartsUtils'),
	dateTime = require('../utils/datetime');

const COLORS = ['#a5d6a7', '#80cbc4', '#90caf9', '#80deea', '#ef9a9a', '#ffcc80', '#bcaaa4'];
const COLOR_OTHER = '#b0bec5';

function getColors(range) {
	if (!range) return COLORS;
	let result = [];
	for (let i = 0; i < range; i++) result.push(COLORS[i % COLORS.length]);
	result.push(COLOR_OTHER);
	return result;
}

function tooltipFormatter(p, ticket, set) {
	let setText = text => (setTimeout(set, 1, ticket, text), text);
	return setText(`You spent<br/> <b>${p.percent}%</b> time` +
		`<br/>(<b>${dateTime.getReadableTime(p.value)}</b>)<br/> on ${p.name} `);
}

let dataCache = null;

let base = require('./_base').createBaseChartClass();
module.exports = { recommendedChartId: 'languages', init: base.init, update };

/**
 * @param {{top?: number, data?: any}} attr
 */
function update(attr) {
	let { top = 0, data = null } = attr;

	if (data) dataCache = data;
	else data = dataCache;

	let array = orderByWatchingTime(object2array(data), true/*DESC*/);

	if (top > 0) {
		let i0 = top, i1 = array.length;
		for (let i = i0 + 1; i < i1; i++) {
			array[i0].watching += array[i].watching;
			array[i0].coding += array[i].coding;
		}
		if (i1 > i0) {
			array[i0].name = 'other';
			array.length = i0 + 1;
		}
	}
	let langNames = array.map(it => it.name);
	base.getCharts().setOption({
		legend: { orient: 'vertical', x: 'right', data: langNames },
		color: getColors(array.length),
		grid: echarts.createPaddingGrid(0, 0, 0, 0),
		tooltip: { trigger: 'item', formatter: tooltipFormatter },
		series: [
			echarts.createSeries('pie', 'watching')
				.setLabelBold()
				.setLabels(langNames)
				.setValues(array.map(it=>it.watching))
				.toObject()
		]
	});
}
