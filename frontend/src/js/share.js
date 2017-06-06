//@ts-check
/// <reference path="types/index.d.ts" />
/// <reference path="types/echarts.d.ts" />

let {
	convertUnit2Hour,
	orderByName,
	object2array,
	getEachFieldToFixed2,
	merge
} = require('./utils'), {
	createEChartsSeries,
	AXIS_HOURS
} = require('./echartsUtils'), {
	encode, fill
} = require('./form');

/**
 * @type {JQuery}
 */
let $dlgShare = null;

/**
 * @type {HTMLLinkElement}
 */
//@ts-ignore
let downloader = $('#chartImageDownloader')[0];

/**
 * @type {EChartsObject}
 */
let chart = null;

/**
 * @type {EChartOption}
 */
let chartOptions = null;

let formData = { text: '', fontSizeMain: '24', fontSizeSub: '18' };
let chartDownloadOption = { backgroundColor: '#ffffff' };

let delayUpdateToken = null;
const DELAY_UPDATE_TIME = 300;

function saveChart() {
	downloader.href = chart.getDataURL(chartDownloadOption);
	//@ts-ignore
	downloader.download = "chart.png";
	downloader.click();
}

function shareSummary(dataGroupByDate, total) {
	let data = convertUnit2Hour(dataGroupByDate),
		array = orderByName(object2array(data));
	let dateLabels = array.map(it => it.name),
		totalHs = convertUnit2Hour({ total }).total.watching.toFixed(2),
		days = array.length,
		averageHs = (totalHs / days).toFixed(2);
	formData.text = `My Coding Report\n  ${totalHs} hours in last ${days} days. ` +
		`(Average: ${averageHs} hours/day)`;
	chartOptions = {
		xAxis: { data: dateLabels },
		yAxis: merge(AXIS_HOURS, { boundaryGap: [0, 0.2] }),
		grid: {top: 100, left: 20, right: 30, bottom: 20, containLabel: true}, 
		series: [
			createEChartsSeries('line', 'watching')
				.showMaxMarkPoint('max time')
				.setLineSmooth()
				.setLineColor('#66bb6a')
				.setItemColor('#66bb6a')
				.setAreaColor('#c8e6c9')
				.setValues(getEachFieldToFixed2(array, 'watching'))
				.toObject()
		]
	};
	// console.log(chartOptions);
	show();
}

function delayUpdate(delayTime) {
	delayUpdateToken && clearTimeout(delayUpdateToken);
	delayUpdateToken = setTimeout(updateChartOption, delayTime || DELAY_UPDATE_TIME);
}
function updateChartOption() {
	let content = encode($dlgShare),
		[text, subtext] = content.text.trim().split('\n'),
		fontSizeMain = Number(content.fontSizeMain) || 24,
		fontSizeSub = Number(content.fontSizeSub) || 18;
	chartOptions.title = {
		text, subtext,
		textStyle: { fontSize: fontSizeMain },
		subtextStyle: { fontSize: fontSizeSub }
	};
	let markLines = [];
	$dlgShare.find('.btn-markline.btn-success')
		.each((i, ele) => {
			let type = $(ele).data('type'),
				label = { position: 'middle', formatter: `${type}: {c} hs` };
			markLines.push({ type, label: { normal: label , emphasis: label} })
		});
	//@ts-ignore
	chartOptions.series[0].markLine = { data: markLines };
	//@ts-ignore
	chartOptions.grid.top = (fontSizeMain + fontSizeSub ) * 1.8;
	chart.setOption(chartOptions);
}

/**
 * @param {JQuery} $dom 
 */
function onMarkLineBtnClick($dom) {
	$dom.toggleClass('btn-success').toggleClass('btn-default');
	updateChartOption();
}
function onChartClick(params) {
	if (!params) return;
	//@ts-ignore
	let points = chartOptions.series[0].markPoint;
	if (params.componentType == "markPoint") {
		//remove mark point
		points.data = points.data.filter(it => it.name != params.name);
	} else if (params.componentType == 'series') {
		//add mark point
		points.data.push({
			name: `custom_${Date.now()}`,
			xAxis: params.dataIndex, yAxis: params.value
		});
	}
	updateChartOption();
}

function show() {
	if (!$dlgShare) {
		$dlgShare = $('#dlgShare');
		$dlgShare.on('shown.bs.modal', () => {
			if (!chart) {
				chart = echarts.init($('#chartShare')[0]);
				chart.on('click', onChartClick);
			}
			fill($dlgShare, formData);		
			updateChartOption();
		});
	}
	$dlgShare.modal();
}

module.exports = {
	shareSummary,
	saveChart, delayUpdate,
	onMarkLineBtnClick
};