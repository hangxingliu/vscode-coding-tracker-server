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
	GRID_NORMAL
} = require('../utils/echartsUtils');

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
		`<br/>(<b>${getReadableTimeString(p.value)}</b>)<br/> on ${p.name} `);
}

let dataCache = null;

let base = require('./_base').createBaseChartClass();
module.exports = { recommendedChartId: 'languages', init: base.init, update };

function update({ top = 0, data = null}) {
	if (data) dataCache = data;
	else data = dataCache;
	
	let array = orderByWatchingTime(object2array(
			convertUnit2Hour(data)), true/*DESC*/);
			
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
		grid: GRID_NORMAL,
		tooltip: { trigger: 'item', formatter: tooltipFormatter },
		series: [
			createEChartsSeries('pie', 'watching')
				.setLabelBold()	
				.setLabels(langNames)
				.setValues(getEachFieldToFixed2(array, 'watching'))
				.toObject()
		]
	});
}
