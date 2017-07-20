//@ts-check
/// <reference path="../types/index.d.ts" />

let {
	convertUnit2Hour,
	getReadableTimeString,
	orderByName,
	object2array,
	getEachFieldToFixed2,
	merge
} = require('../utils'), {
	createEChartsSeries,
	AXIS_HOURS,
	GRID_NORMAL
} = require('../echartsUtils');

let dateLabels = [];

const SELECTOR = '#chartSummary';
function tooltipFormatter(p, ticket, set){
	let setText = text => (setTimeout(set, 1, ticket, text), text);
	if (p.componentType == 'markLine') //average
		return setText(`Average ${p.seriesName} for <b>${getReadableTimeString(p.value)}</b>`);
	else if (p.componentType == 'markPoint')
		return setText(`Longest ${p.seriesName} for <b>${getReadableTimeString(p.value)}</b>` +
			`<br/>in ${dateLabels[p.data.coord[0]]}`)
	else if (Array.isArray(p) && p.length == 2)
		return setText(`In ${p[0].name}:<br/>` +
			p.map(it => `${it.seriesName} for <b>${getReadableTimeString(it.value)}</b>`).join('<br/>'));
	return setText(null);
}

/**
 * @type {EChartsObject}
 */
let charts = null;

module.exports = { update };

function update(dataGroupByDate) {
	if (!charts) charts = echarts.init($(SELECTOR)[0]);

	let data = convertUnit2Hour(dataGroupByDate),
		array = orderByName(object2array(data));
	dateLabels = array.map(it => it.name);

	charts.setOption({
		xAxis: { data: dateLabels },
		yAxis: merge(AXIS_HOURS, { boundaryGap: [0, 0.2] }),
		grid: GRID_NORMAL,
		tooltip: { trigger: 'axis', formatter: tooltipFormatter},
		series: [
			createEChartsSeries('line', 'watching')
			.showMaxMarkPoint('max time')
			.showAverageLine('average time')
			.setLineSmooth()
			.setLineColor('#66bb6a')
			.setItemColor('#66bb6a')
			.setAreaColor('#c8e6c9')
			.setValues(getEachFieldToFixed2(array ,'watching'))
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
