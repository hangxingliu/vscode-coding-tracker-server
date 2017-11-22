//@ts-check
/// <reference path="../index.d.ts" />

let {
	convertUnit2Hour,
	getReadableTimeString,
	orderByWatchingTime,
	getEachFieldToFixed2,
} = require('../utils/utils'), {
	createEChartsSeries,
	AXIS_HOURS,
	GRID_NORMAL
} = require('../utils/echartsUtils');

const EACH_HEIGH = 75;
// https://www.materialui.co/colors
// level 200, 900, 500(shadow)
const COLOR_MASTER = ['#C8E6C9', '#1B5E20', '#4CAF50']; // green
const COLOR_HEAD = ['#F0F4C3', '#827717', '#CDDC39']; // lime
const COLOR_NONE = ['#F5F5F5', '#212121', '#9E9E9E']; // grey
const COLOR = ['#BBDEFB', '#0D47A1', '#2196F3']; // blue

/** @type {AdvancedVCSInfo[]} */
let items = [];
/** @type {HTMLElement} */
let dom = null;
let onClick = null;

function tooltipFormatter(p, ticket, set) {
	let setText = text => (setTimeout(set, 1, ticket, text), text);
	let i = p.dataIndex;
	if (i >= items.length) return setText(null);
	let item = items[i];
	let text = `You spent <b>${getReadableTimeString(p.value)}</b> on <br/>`;
	if (!item.type)
		return setText(text + 'Project without VCS');
	return setText(text += `branch <b> ${item.branch}</b> of<br/> project <b>${item.path}</b> `)
}

let base = require('./_base').createBaseChartClass(charts => {
	charts.on('click', params =>
		typeof params.dataIndex == 'number' &&
		onClick && onClick(items[params.dataIndex]));
});
module.exports = { recommendedChartId: 'vcs', update, init };

/**
 * @param {HTMLElement} _dom
 * @param {(item: AdvancedVCSInfo) => any} _onClick
 */
function init(_dom, _onClick) {
	onClick = _onClick;
	return base.init(dom = _dom);
}

/** @param {AdvancedVCSInfo[]} vcsArray */
function update(vcsArray) {
	items = orderByWatchingTime(convertUnit2Hour(vcsArray));

	let colors = items.map(it => {
		if (!it.type) return COLOR_NONE;
		if (it.branch == 'master')
			return COLOR_MASTER;
		if (it.branch == 'HEAD')
			return COLOR_HEAD;
		return COLOR;
	})

	let charts = base.getCharts();
	let height = (items.length + 1) * EACH_HEIGH;
	$(dom).height(height);
	charts.resize({ height });

	charts.setOption({
		legend: { data: [''] },
		xAxis: {
			type: 'value', nameLocation: 'end', position: 'top',
			axisTick: { show: false }, axisLabel: AXIS_HOURS.axisLabel },
		yAxis: [{
			type: 'category', nameLocation: 'start',
			axisTick: { show: false },
			axisLabel: {
				inside: true, interval: 0,
				fontSize: 16,
				color: (d, i) => colors[i][1],
				rich: { b: {fontWeight: 'bold', fontSize: 18}}
			},
			z: 1024,
			data: items.map(it => it.type ? `${it.short} ({b|${it.branch}})` : 'Project without VCS')
		}, {
			type: 'category', nameLocation: 'start',
			axisTick: { show: false },
			axisLabel: {
				inside: true, interval: 0,
				fontSize: 12,
				padding: [30, 0, 0, 0]
			},
			z: 1024,
			data: items.map(it => getReadableTimeString(it.watching))
		}],
		grid: GRID_NORMAL,
		tooltip: { trigger: 'item', formatter: tooltipFormatter},
		series: [
			createEChartsSeries('bar', 'watching')
				.setItemColor(data => colors[data.dataIndex][0])
				.setValues(getEachFieldToFixed2(items, 'watching'))
				.toObject()
		]
	});
}
