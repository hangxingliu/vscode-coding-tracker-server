//@ts-check
/// <reference path="../index.d.ts" />

let {
	getReadableTime,
	orderByWatchingTime,
	object2array,
	getShortProjectName,
	ONE_HOUR
} = require('../utils/utils'),
	echarts = require('../utils/echartsUtils');

const EACH_HEIGH = 50;

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
	return setText(`You spent <b>${getReadableTime(p.value)}</b><br/> on <u>${projectNames[i]}</u>`);
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
	let array = orderByWatchingTime(object2array(dataGroupByProject));

	if(limit > 0) array = array.slice(-limit);

	originalProjectNames = array.map(it => it.name);
	projectNames = array.map(it => decodeURIComponent(it.name));
	shortProjectNames = projectNames.map((name, i) =>
		getShortProjectName(name) + `(${getReadableTime(array[i].watching)})`);

	let charts = base.getCharts(),
		//interval: 0 for force display all label
		interval = undefined;
	if (limit <= 0) {
		let height = (array.length + 1) * EACH_HEIGH;
		$(dom).height(height);
		charts.resize({ height });
		interval = 0;
	}

	let maxDuration = array.length ? array[array.length - 1].watching : ONE_HOUR;
	charts.setOption({
		legend: { data: [''] },
		xAxis: echarts.createTotalDurationXAxisForBar(maxDuration),
		yAxis: {
			type: 'category', nameLocation: 'start',
			axisTick: { show: false }, axisLabel: { inside: true, interval}, z: 1024,
			data: shortProjectNames
		},
		grid: echarts.createPaddingGrid(15, 20, 0, 0),
		tooltip: { trigger: 'item', formatter: tooltipFormatter},
		series: [
			echarts.createSeries('bar', 'watching')
				.setItemColor('#fff59d')
				.setValues(array.map(it => it.watching))
				.toObject()
		]
	});
}
