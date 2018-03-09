//@ts-check
/// <reference path="../index.d.ts" />

let {
	orderByName,
	object2array,
	maxInArray
} = require('../utils/utils'),
	echarts = require('../utils/echartsUtils'),
	dateTime = require('../utils/datetime'),
	{ ONE_HOUR, getReadableTime } = dateTime;

/** @type {string[]} */
let dateLabels = [];

let base = require('./_base').createBaseChartClass();
module.exports = { recommendedChartId: 'summary', init: base.init, update };

/** @param {CodingWatchingMap} dataGroupByDate */
function update(dataGroupByDate) {
	/** @type {CodingWatchingArray} */
	let array = orderByName(object2array(dataGroupByDate));

	let maxDurationItem = maxInArray(array, (a, b) => a.watching > b.watching ? a : b),
		maxDuration = (maxDurationItem || { watching: ONE_HOUR }).watching;

	dateLabels = dateTime.getReadableDateDependentOnSize(array.map(it => it.name));

	let series = [
		echarts.createSeries('line', 'watching')
			.showMaxMarkPoint('max time', markFormatter)
			.setMarkPointAsWideRect()
			.showAverageLine('average time', markFormatter)
			.setLineSmooth()
			.setLineColor('#66bb6a')
			.setItemColor('#66bb6a')
			.setAreaColor('#c8e6c9')
			.setValues(array.map(it => it.watching))
			.toObject(),

		echarts.createSeries('line', 'coding')
			.setLineSmooth()
			.setLineColor('#1b5e20')
			.setItemColor('#1b5e20')
			.setAreaColor('#388e3c')
			.setValues(array.map(it => it.coding))
			.toObject()
	];
	//Remove max point and average line if no any data
	if (maxDuration <= 0) {
		series[0].markPoint.data = [];
		series[0].markLine.data = [];
	}

	base.getCharts().setOption({
		xAxis: { data: dateLabels, axisPointer: { type: 'shadow' } },
		yAxis: echarts.createEachDurationAxis(maxDuration, false),
		grid: echarts.createPaddingGrid(10, 25, 0, 0),
		tooltip: { trigger: 'axis', formatter: tooltipFormatter },
		series
	});
}

function markFormatter(p) {
	return getReadableTime(p.data.value);
}
function tooltipFormatter(p, ticket, set){
	let setText = text => (setTimeout(set, 1, ticket, text), text),
		getDurationText = ms => getReadableTime(ms);
	if (p.componentType == 'markLine') //average
		return setText(`Average ${p.seriesName} for <b>${getDurationText(p.value)}</b>`);
	else if (p.componentType == 'markPoint')
		return setText(`Longest ${p.seriesName} for <b>${getDurationText(p.value)}</b>` +
			`<br/>in ${dateLabels[p.data.coord[0]]}`)
	else if (Array.isArray(p) && p.length == 2)
		return setText(`In ${p[0].name}:<br/>` +
			p.map(it => `${it.seriesName} for <b>${getDurationText(it.value)}</b>`).join('<br/>'));
	return setText(null);
}
