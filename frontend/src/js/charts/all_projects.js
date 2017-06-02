//@ts-check
/// <reference path="../types/index.d.ts" />

let {
	convertUnit2Hour,
	orderByWatchingTime,
	object2array,
	getEachFieldToFixed2,
} = require('../utils'), {
	createEChartsSeries,
	AXIS_HOURS,
	GRID_NORMAL
} = require('../echartsUtils');

const SELECTOR = '#chartAllProjects',
	DIALOG_SELECTOR = '#dlgAllProjects';

/**
* @type {string[]}
*/
let projectNames = [], shortProjectNames = [];

function tooltipFormatter(p, ticket, set) {
	let setText = text => (setTimeout(set, 1, ticket, text), text);
	let i = p.dataIndex;
	if (i >= projectNames.length) return setText(null);
	return setText(`You spent<br/> (<b>${p.value}</b> hours)<br/> on <u>${projectNames[i]}</u>`);
}

/**
 * @type {EChartsObject}
 */
let charts = null;
let $dlg = null;
let dataGroupByProject = null;

module.exports = { update };
function update(data) {
	if (!$dlg) {
		$dlg = $(DIALOG_SELECTOR);
		$dlg.on('shown.bs.modal', _update);
	}
	dataGroupByProject = data;
	$dlg.modal();
}
function _update() {
	if (!charts) charts = echarts.init($(SELECTOR)[0]);
	
	let data = convertUnit2Hour(dataGroupByProject),
		array = orderByWatchingTime(object2array(data));
	
	projectNames = array.map(it => decodeURIComponent(it.name));
	shortProjectNames = projectNames.map((name, i) =>
		name.match(/.*(^|[\\\/])(.+)$/)[2] + ` (${Number(array[i].watching).toFixed(2)} hs)`);
	
	let height = array.length * 50;
	$(SELECTOR).height(height);
	charts.resize({ height });
	
	charts.setOption({
		legend: { data: [''] },
		xAxis: {
			type: 'value', nameLocation: 'end', position: 'top',
			axisTick: { show: false }, axisLabel: AXIS_HOURS.axisLabel },
		yAxis: {
			type: 'category', nameLocation: 'start',
			axisTick: { show: false }, axisLabel: { inside: true }, z: 1024,
			data: shortProjectNames },
		grid: GRID_NORMAL,
		tooltip: { trigger: 'item', formatter: tooltipFormatter},
		series: [
			createEChartsSeries('bar', 'watching')
				.setItemColor('#fff59d')
				.setValues(getEachFieldToFixed2(array ,'watching'))
				.toObject()
		]
	});
}
