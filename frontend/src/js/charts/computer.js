//@ts-check
/// <reference path="../index.d.ts" />

let {
	orderByWatchingTime,
	object2array,
} = require('../utils/utils'),
	echarts = require('../utils/echartsUtils'),
	dateTime = require('../utils/datetime');

const COLORS = ['#4caf50', '#2196f3', '#ffeb3b', '#f44336', '#9c27b0', '#009688', '#ff9800', '#795548'];

function tooltipFormatter(p, ticket, set) {
	let setText = text => (setTimeout(set, 1, ticket, text), text);
	return setText(`You spent<br/> <b>${p.percent}%</b> time` +
		`<br/>(<b>${dateTime.getReadableTime(p.value)}</b>)<br/> on ${p.name} `);
}

let base = require('./_base').createBaseChartClass();
module.exports = { recommendedChartId: 'computers', init: base.init, update };

function update(dataGroupByComputer) {
	let array = orderByWatchingTime(object2array(dataGroupByComputer));

	base.getCharts().setOption({
		color: COLORS,
		grid: echarts.createPaddingGrid(0, 0, 0, 0),
		tooltip: { trigger: 'item', formatter: tooltipFormatter },
		series: [
			echarts.createSeries('pie', 'watching')
				.setLabelBold()
				.setLabels(array.map(it => it.name))
				.setValues(array.map(it=>it.watching))
				.toObject()
		]
	});
}
