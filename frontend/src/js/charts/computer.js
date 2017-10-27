//@ts-check
/// <reference path="../index.d.ts" />

let {
	convertUnit2Hour,
	getReadableTimeString,
	orderByWatchingTime,
	object2array,
	getEachFieldToFixed2
} = require('../utils/utils'), {
	createEChartsSeries,
	GRID_NORMAL
} = require('../utils/echartsUtils');

const COLORS = ['#4caf50', '#2196f3', '#ffeb3b', '#f44336', '#9c27b0', '#009688', '#ff9800', '#795548'];
const SELECTOR = '#chartComputer';

function tooltipFormatter(p, ticket, set) {
	let setText = text => (setTimeout(set, 1, ticket, text), text);
	return setText(`You spent<br/> <b>${p.percent}%</b> time` +
		`<br/>(<b>${getReadableTimeString(p.value)}</b>)<br/> on ${p.name} `);
}

let base = require('./_base').createBaseChartClass();
module.exports = { recommendedChartId: 'computers', init: base.init, update };

function update(dataGroupByComputer) {
	let data = convertUnit2Hour(dataGroupByComputer),
		array = orderByWatchingTime(object2array(data));

	base.getCharts().setOption({
		color: COLORS,
		grid: GRID_NORMAL,
		tooltip: { trigger: 'item', formatter: tooltipFormatter },
		series: [
			createEChartsSeries('pie', 'watching')
				.setLabelBold()	
				.setLabels(array.map(it => it.name))	
				.setValues(getEachFieldToFixed2(array, 'watching'))
				.toObject()
		]
	});
}
