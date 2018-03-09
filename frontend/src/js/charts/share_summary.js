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

const DEFAULT_POINTS = [];

/** @type {CodingWatchingArray} */
let data = [];
/** @type {string[]} */
let dateLabels = [];

/** @type {EChartOption} */
let chartOptions = null;


let base = require('./_base').createBaseChartClass();
module.exports = { recommendedChartId: 'share_summary', init, update };

function init(dom, onClick) {
	let charts = base.init(dom);
	charts.on('click', onClick);
	return charts;
}

function update(dataGroupByDate,
	{ text, subtext, fontSizeMain = '24', fontSizeSub = '18', lines = [], points = [] }) {
	data = orderByName(object2array(dataGroupByDate));
	dateLabels = data.map(it => it.name);

	let maxDurationItem = maxInArray(data, (a, b) => a.watching > b.watching ? a : b),
		maxDuration = (maxDurationItem || { watching: ONE_HOUR }).watching;

	let markLines = lines.map(type => ({
		type, label: { normal: { position: 'middle', formatter: markFormatter } }
	}));
	let fontSize1 = parseFloat(fontSizeMain), fontSize2 = parseFloat(fontSizeSub),
		fontSizeTotal = fontSize1 + fontSize2;

	chartOptions = {
		title: {
			text, subtext,
			textStyle: { fontSize: fontSize1 },
			subtextStyle: { fontSize: fontSize2 }
		},
		xAxis: { data: dateLabels, axisPointer: { type: 'shadow' } },
		yAxis: echarts.createEachDurationAxis(maxDuration, false),
		grid: echarts.createPaddingGrid(fontSizeTotal * 1.8, 30, 20, 10),
		series: [
			echarts.createSeries('line', 'watching')
				.setMarkPointAsWideRect()
				.setLineSmooth()
				.setLineColor('#66bb6a')
				.setItemColor('#66bb6a')
				.setAreaColor('#c8e6c9')
				.setValues(data.map(it => it.watching))
				.add({ markLine: { data: markLines } })
				.add({ markPoint: { data: DEFAULT_POINTS } })
				.toObject()
		]
	};
	chartOptions.series[0].markPoint.data = points;
	base.getCharts().setOption(chartOptions);
}

function markFormatter(p) { return getReadableTime(p.data.value); }
