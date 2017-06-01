//@ts-check
/// <reference path="../types/index.d.ts" />

let {
	convertUnit2Minutes,
	orderByName,
	object2array,
	getEachFieldToFixed2,
	merge
} = require('../utils'), {
	createEChartsSeries,
	AXIS_MINUTES,
	GRID_NORMAL
} = require('../echartsUtils');

let timeLabels = [];

const SELECTOR = '#chartLast24Hs';
function tooltipFormatter(p, ticket, set){
	let setText = text => (setTimeout(set, 1, ticket, text), text);
	if (p.componentType == 'markLine') //average
		return setText(`Average ${p.seriesName} for <b>${p.value}</b> minutes`);
	else if (p.componentType == 'markPoint')
		return setText(`Longest ${p.seriesName} for <b>${p.value}</b> minutes` +
			`<br/>in ${timeLabels[p.data.coord[0]]}`)
	else if (Array.isArray(p) && p.length == 2)
		return setText(`In ${p[0].name}:<br/>` +
			p.map(it => `${it.seriesName} for <b>${it.value}</b> minutes`).join('<br/>'));
	return setText(null);
}

/**
 * @type {EChartsObject}
 */
let charts = null;

module.exports = { update };

function update(dataGroupByDate) {
	if (!charts) charts = echarts.init($(SELECTOR)[0]);

	let data = convertUnit2Minutes(dataGroupByDate),
		array = orderByName(object2array(data));
	timeLabels = array.map(it => it.name);
	
	charts.setOption({
		xAxis: { data: array.map(it => it.name.slice(11)) },//slice(11) remove yyyy-mm-dd
		yAxis: merge(AXIS_MINUTES, { boundaryGap: [0, 0.2] }),
		grid: GRID_NORMAL,
		tooltip: { trigger: 'axis', formatter: tooltipFormatter},
		series: [
			createEChartsSeries('line', 'watching')
				.showMaxMarkPoint('max time')
				.showAverageLine('average time')
				.setLineSmooth()
				.setLineColor('#29b6f6')
				.setItemColor('#29b6f6')
				.setAreaColor('#b3e5fc')
				.setValues(getEachFieldToFixed2(array, 'watching'))
				.toObject(),

			createEChartsSeries('line', 'coding')
				.showMaxMarkPoint('max time')
				.showAverageLine('average time')
				.setLineSmooth()
				.setLineColor('#01579b')
				.setItemColor('#01579b')
				.setAreaColor('#0288d1')
				.setValues(getEachFieldToFixed2(array ,'coding'))
				.toObject()
		]
	});
}
