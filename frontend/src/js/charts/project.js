//@ts-check
/// <reference path="../index.d.ts" />

let {
	convertUnit2Hour,
	getReadableTimeString,
	orderByWatchingTime,
	object2array,
	getEachFieldToFixed2,
	getShortProjectName,
} = require('../utils'), {
	createEChartsSeries,
	AXIS_HOURS,
	GRID_NORMAL
} = require('../echartsUtils');

const SELECTOR = '#chartProject';
const SIZE = 5;

/**
* @type {string[]}
*/
let originalProjectNames = [], projectNames = [], shortProjectNames = [];

function tooltipFormatter(p, ticket, set) {
	let setText = text => (setTimeout(set, 1, ticket, text), text);
	let i = p.dataIndex;
	if (i >= projectNames.length) return setText(null);
	return setText(`You spent <b>${getReadableTimeString(p.value)}</b><br/> on <u>${projectNames[i]}</u>`);
}

/**
 * @type {EChartsObject}
 */
let charts = null;

module.exports = { update };

function update(dataGroupByProject) {
	if (!charts) {
		charts = echarts.init($(SELECTOR)[0]);
		charts.on('click', params =>
			typeof params.dataIndex == 'number' &&
			global.app.openProjectReport(originalProjectNames[params.dataIndex]));
	}

	let data = convertUnit2Hour(dataGroupByProject),
		array = orderByWatchingTime(object2array(data)).slice(-SIZE);
	originalProjectNames = array.map(it => it.name);
	projectNames = array.map(it => decodeURIComponent(it.name));
	shortProjectNames = projectNames.map((name, i) =>
		getShortProjectName(name) + `(${getReadableTimeString(array[i].watching)})`);

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
