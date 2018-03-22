//@ts-check
/// <reference path="../index.d.ts" />

let {
	orderByWatchingTime,
	object2array,
	getShortProjectName,
	escapeHtml
} = require('../utils/utils'),
	echarts = require('../utils/echartsUtils'),
	dateTime = require('../utils/datetime'),
	{ ONE_HOUR, getReadableTime } = dateTime;

const EACH_HEIGH = 60;

/** @type {{label: string; tooltip: string; originalPath: string; coding: number; watching: number}[]} */
let displayItems = [];
/** @type {HTMLElement} */
let dom = null;
let onClick = null;
let limit = 5;

function tooltipFormatter(p, ticket, set) {
	let setText = text => (setTimeout(set, 1, ticket, text), text);
	let i = p.dataIndex;
	if (i >= displayItems.length)
		return setText(null);
	return setText(displayItems[i].tooltip);
}

let base = require('./_base').createBaseChartClass(charts => {
	charts.on('click', params =>
		typeof params.dataIndex == 'number' &&
		onClick && onClick(displayItems[params.dataIndex].originalPath));
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

/**
 * @param {CodingWatchingMap} groupByProject
 * @param {Association[]} associations
 */
function update(groupByProject, associations = []) {
	let rawArray = object2array(groupByProject);
	let projectToIndexMap = {};
	rawArray.forEach((it, i) => projectToIndexMap[it.name] = i);

	displayItems = [];

	// ------------
	// associate
	let associated = rawArray.map(() => false);
	for (let i in associations) {
		let { name, projects } = associations[i];
		let coding = 0, watching = 0, original = [];
		for (let j in projects) {
			let project = projects[j];
			if (!project) continue;

			let i = projectToIndexMap[project];
			if (typeof i == 'undefined') continue;

			let it = rawArray[i];
			coding += it.coding;
			watching += it.watching;
			original.push(it.name);
			associated[i] = true;
		}
		let readableElapsed = getReadableTime(watching);
		let label = `{i|${name}}  {b|(${readableElapsed})}`;
		let tooltip = `You spent <b>${readableElapsed}</b><br/> on ${name}:<br/>` +
			original.map(p => ` <u>${escapeHtml(decodeURIComponent(p))}</u>`).join('<br/>');

		displayItems.push({ label, tooltip, originalPath: original.join(':'), coding, watching });
	}
	for (let i = 0; i < rawArray.length; i++) {
		if (associated[i]) continue;

		let it = rawArray[i];
		let readableElapsed = getReadableTime(it.watching);
		let projPath = decodeURIComponent(it.name);
		let label = getShortProjectName(projPath) + ` {b|(${readableElapsed})}`;
		let tooltip = `You spent <b>${readableElapsed}</b><br/> on <u>${projPath}</u>`;

		displayItems.push({ label, tooltip, originalPath: it.name, coding: it.coding, watching: it.watching });
	}
	orderByWatchingTime(displayItems);

	if(limit > 0) displayItems = displayItems.slice(-limit);

	let charts = base.getCharts(),
		//interval: 0 for force display all label
		interval = undefined;
	if (limit <= 0) {
		let height = (displayItems.length + 1) * EACH_HEIGH;
		$(dom).height(height);
		charts.resize({ height });
		interval = 0;
	}

	let maxDuration = displayItems.length ? displayItems[displayItems.length - 1].watching : ONE_HOUR;
	charts.setOption({
		legend: { data: [''] },
		xAxis: echarts.createTotalDurationXAxisForBar(maxDuration),
		yAxis: {
			type: 'category', nameLocation: 'start',
			axisTick: { show: false },
			axisLabel: {
				inside: true, interval,
				fontSize: 14,
				rich: {
					b: { fontWeight: 'bold' },
					i: { fontStyle: 'italic' }
				}
			}, z: 1024,
			data: displayItems.map(it => it.label)
		},
		grid: echarts.createPaddingGrid(15, 20, 0, 0),
		tooltip: { trigger: 'item', formatter: tooltipFormatter},
		series: [
			echarts.createSeries('bar', 'watching')
				.setItemColor('#fff59d')
				.setValues(displayItems.map(it => it.watching))
				.toObject()
		]
	});
}
