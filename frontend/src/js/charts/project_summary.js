//@ts-check
/// <reference path="../index.d.ts" />

let {
	convertUnit2Hour,
	orderByName,
	object2array,
	getEachFieldToFixed2,
	merge
} = require('../utils/utils'), {
	createEChartsSeries,
		AXIS_HOURS,
		GRID_NORMAL,
} = require('../utils/echartsUtils');

function tooltipFormatter0(p, ticket, set){
	let setText = text => (setTimeout(set, 1, ticket, text), text);
	if (p.componentType == 'markLine') //average
		return setText(`Average ${p.seriesName} for <b>${p.value}</b> hours`);
	else if (p.componentType == 'markPoint')
		return setText(`Longest ${p.seriesName} for <b>${p.value}</b> hours` +
			`<br/>in ${dateLabels[p.data.coord[0]]}`)
	else if (Array.isArray(p) && p.length == 2)
		return setText(`In ${p[0].name}:<br/>` +
			p.map(it => `${it.seriesName} for <b>${it.value}</b> hours`).join('<br/>'));
	return setText(null);
}

let dateLabels = [];

let base = require('./_base').createBaseChartClass();
module.exports = { recommendedChartId: 'project_summary', init: base.init, update };

function update(data) {
	let array = orderByName(object2array(convertUnit2Hour(data)));
	dateLabels = array.map(it => it.name);
	
	let chart = base.getCharts();
	chart.resize({ height: 250 });

	chart.setOption({
		xAxis: { data: dateLabels },
		yAxis: merge(AXIS_HOURS, { boundaryGap: [0, 0.2] }),
		grid: GRID_NORMAL,
		tooltip: { trigger: 'axis', formatter: tooltipFormatter0 },
		series: [
			createEChartsSeries('line', 'watching')
				.showMaxMarkPoint('max time')
				.showAverageLine('average time')
				.setLineSmooth()
				.setLineColor('#66bb6a')
				.setItemColor('#66bb6a')
				.setAreaColor('#c8e6c9')
				.setValues(getEachFieldToFixed2(array, 'watching'))
				.toObject(),
			createEChartsSeries('line', 'coding')
				.showMaxMarkPoint('max time')
				.showAverageLine('average time')
				.setLineSmooth()
				.setLineColor('#1b5e20')
				.setItemColor('#1b5e20')
				.setAreaColor('#388e3c')
				.setValues(getEachFieldToFixed2(array ,'coding'))
				.toObject()
		]
	});
}

