//@ts-check
/// <reference path="../types/index.d.ts" />

let {
	convertUnit2Hour,
	getReadableTimeString,
	orderByWatchingTime,
	object2array,
	getEachFieldToFixed2
} = require('../utils'), {
	createEChartsSeries,
	GRID_NORMAL
} = require('../echartsUtils');

const COLORS = ['#4caf50', '#2196f3', '#ffeb3b', '#f44336', '#9c27b0', '#009688', '#ff9800', '#795548'];
const SELECTOR = '#chartComputer';

function tooltipFormatter(p, ticket, set) {
	let setText = text => (setTimeout(set, 1, ticket, text), text);
	return setText(`You spent<br/> <b>${p.percent}%</b> time` +
		`<br/>(<b>${getReadableTimeString(p.value)}</b>)<br/> on ${p.name} `);
}

/**
 * @type {EChartsObject}
 */
let charts = null;

module.exports = { update };

function update(dataGroupByComputer) {
	if (!charts) charts = echarts.init($(SELECTOR)[0]);

	let data = convertUnit2Hour(dataGroupByComputer),
		array = orderByWatchingTime(object2array(data));

	charts.setOption({
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
