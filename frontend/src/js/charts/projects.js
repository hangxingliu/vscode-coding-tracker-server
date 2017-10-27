//@ts-check
/// <reference path="../index.d.ts" />

let {
	convertUnit2Hour,
	getReadableTimeString,
	orderByWatchingTime,
	object2array,
	getEachFieldToFixed2,
	getShortProjectName,
} = require('../utils/utils'), {
	createEChartsSeries,
	AXIS_HOURS,
	GRID_NORMAL
} = require('../utils/echartsUtils');


/** @type {string[]} */
let originalProjectNames = [], projectNames = [], shortProjectNames = [];
/** @type {HTMLElement} */
let dom = null;
let onClick = null;
let limit = 5;

function tooltipFormatter(p, ticket, set) {
	let setText = text => (setTimeout(set, 1, ticket, text), text);
	let i = p.dataIndex;
	if (i >= projectNames.length) return setText(null);
	return setText(`You spent <b>${getReadableTimeString(p.value)}</b><br/> on <u>${projectNames[i]}</u>`);
}

let base = require('./_base').createBaseChartClass(charts => {
	charts.on('click', params =>
		typeof params.dataIndex == 'number' &&
		onClick && onClick(originalProjectNames[params.dataIndex]));
});
module.exports = { recommendedChartId: 'projects', update, init };

/**
 * @param {HTMLElement} _dom 
 * @param {(proj: string) => any} [_onClick=null] 
 * @param {number} [_limit=-1] 
 */
function init(_dom, _onClick = null, _limit = -1) { 
	limit = _limit;
	onClick = _onClick;
	return base.init(dom = _dom);
}

function update(dataGroupByProject) {
	let data = convertUnit2Hour(dataGroupByProject),
		array = orderByWatchingTime(object2array(data));

	if(limit > 0) array = array.slice(-limit);

	originalProjectNames = array.map(it => it.name);
	projectNames = array.map(it => decodeURIComponent(it.name));
	shortProjectNames = projectNames.map((name, i) =>
		getShortProjectName(name) + `(${getReadableTimeString(array[i].watching)})`);

	let charts = base.getCharts(),
		//interval: 0 for force display all label
		interval = undefined;
	if (limit <= 0) {
		let height = 50 + array.length * 50
		$(dom).height(height);
		charts.resize({ height });
		interval = 0;
	}
	
	charts.setOption({
		legend: { data: [''] },
		xAxis: {
			type: 'value', nameLocation: 'end', position: 'top',
			axisTick: { show: false }, axisLabel: AXIS_HOURS.axisLabel },
		yAxis: {
			type: 'category', nameLocation: 'start',
			axisTick: { show: false }, axisLabel: { inside: true, interval}, z: 1024,
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
