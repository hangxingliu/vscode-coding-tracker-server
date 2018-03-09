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

let timeLabels = [];


let base = require('./_base').createBaseChartClass();
module.exports = { recommendedChartId: '24hs', init: base.init, update };

function update(dataGroupByDate) {
	let array = orderByName(object2array(dataGroupByDate));
	timeLabels = array.map(it => it.name);

	let maxDurationItem = maxInArray(array, (a, b) => a.watching > b.watching ? a : b),
		maxDuration = (maxDurationItem || { watching: ONE_HOUR }).watching;

	let series = [
		echarts.createSeries('line', 'watching')
			.showMaxMarkPoint('max time', markFormatter)
			.setMarkPointAsWideRect()
			.showAverageLine('average time', markFormatter)
			.setLineSmooth()
			.setLineColor('#29b6f6')
			.setItemColor('#29b6f6')
			.setAreaColor('#b3e5fc')
			.setValues(array.map(it => it.watching))
			.toObject(),

		echarts.createSeries('line', 'coding')
			.setLineSmooth()
			.setLineColor('#01579b')
			.setItemColor('#01579b')
			.setAreaColor('#0288d1')
			.setValues(array.map(it => it.coding))
			.toObject()
	];
	//Remove max point and average line if no any data
	if (maxDuration <= 0) {
		series[0].markPoint.data = [];
		series[0].markLine.data = [];
	}

	base.getCharts().setOption({
		xAxis: { data: array.map(it => it.name.slice(11)) },//slice(11) remove yyyy-mm-dd
		yAxis: echarts.createEachDurationAxis(maxDuration, true),
		grid: echarts.createPaddingGrid(25, 25, 0, 15),
		tooltip: { trigger: 'axis', formatter: tooltipFormatter},
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
			`<br/>in ${timeLabels[p.data.coord[0]]}`)
	else if (Array.isArray(p) && p.length == 2)
		return setText(`In ${p[0].name}:<br/>` +
			p.map(it => `${it.seriesName} for <b>${getDurationText(it.value)}</b>`).join('<br/>'));
	return setText(null);
}

