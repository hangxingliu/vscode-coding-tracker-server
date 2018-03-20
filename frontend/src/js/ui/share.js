//@ts-check
/// <reference path="../index.d.ts" />
/// <reference path="../echarts.d.ts" />

let utils = require('../utils/utils'),
	dateTime = require('../utils/datetime'),
	resizer = require('../utils/resizer'),
	chartShareSummary = require('../charts/share_summary'),
	form = require('../utils/form'),
	reportFilter = require('../reportFilter'),
	download = require('downloadjs');

let $dialog = $('#dlgShare'),
	$btnDownload = $dialog.find('.btn-download'),
	$btnMarkline = $dialog.find('.btn-markline'),
	$inputs = $dialog.find('input,textarea');

const CLASS_SELECTED = 'btn-success', CLASS_UNSELECTED = 'btn-default';

/** @type {EChartsObject} */
let chart = null;
/** @type {CodingWatchingMap} */
let dataGroupByDate = null;

const DEFAULT_POINTS = [{
	type: 'max', name: 'max duration',
	label: { normal: { formatter: markFormatter } }
}];
const DEFAULT_FORM = {
	text: '', subtext: '',
	fontSizeMain: '24', fontSizeSub: '18',
	lines: [],
	/** @type {any[]} */
	points: DEFAULT_POINTS,
};
let formData = Object.assign({}, DEFAULT_FORM);

let delayUpdateToken = null;

const downloadOpts = { backgroundColor: '#ffffff' };
const downloadFile = 'chart.png';

$btnDownload.click(() => download(chart.getDataURL(downloadOpts), downloadFile));
$btnMarkline.click(onClickMarkLineBtn);
$inputs.keydown(() => {
	if (delayUpdateToken) clearTimeout(delayUpdateToken);
	delayUpdateToken = setTimeout(updateChartFromInputs, 300);
});

$dialog.on('shown.bs.modal', () => {
	if (!chart)
		chart = chartShareSummary.init(
			utils.getChartDom(chartShareSummary.recommendedChartId, $dialog)[0],
			onClickChart);
	resizer.subscribe([chart]);
	chartShareSummary.update(dataGroupByDate, formData);

	form.fill($dialog, formData);
	updateChartFromInputs();
}).on('hide.bs.modal', () => {
});

module.exports = { shareSummary };

/**
 * @param {CodingWatchingMap} data
 * @param {CodingWatchingObject} total
 */
function shareSummary(data, total) {
	formData = Object.assign({}, DEFAULT_FORM);
	formData.lines = [];
	formData.points = Object.assign([], DEFAULT_POINTS);

	dataGroupByDate = data;

	let days = Object.keys(data).length,
		range = reportFilter.getRangeDescription().toLowerCase();
	let totalDuration = dateTime.getReadableTime(total.watching),
		averageDuration = dateTime.getReadableTime(total.watching / days);

	formData.text = `My Coding Report`;
	formData.subtext = `${totalDuration} in ${range}. (Average: ${averageDuration}/day)`;

	$btnMarkline.removeClass(CLASS_SELECTED).addClass(CLASS_UNSELECTED);
	$dialog.modal();
}

function updateChartFromInputs() {
	let content = form.encode($dialog);
	formData = Object.assign(formData, content);
	chartShareSummary.update(dataGroupByDate, formData);
	delayUpdateToken = null;
}

function onClickChart(params) {
	if (!params) return;
	//@ts-ignore
	let points = formData.points;
	if (params.componentType == "markPoint") {
		//remove mark point
		formData.points = points.filter(it => it.name != params.name);
	} else if (params.componentType == 'series') {
		//add mark point
		points.push({
			name: `custom_${Date.now()}`,
			coord: [params.dataIndex, params.value],
			value: params.data.value,
			label: { normal: { formatter: markFormatter } }
		});
	}

	chartShareSummary.update(dataGroupByDate, formData);
}

function onClickMarkLineBtn() {
	let $this = $(this);

	$this.toggleClass(CLASS_SELECTED)
		.toggleClass(CLASS_UNSELECTED);

	let type = $this.data('type'),
		lines = formData.lines,
		index = lines.indexOf(type);
	console.log(lines, index);
	if (index < 0)
		lines.push(type);
	else
		lines = lines.splice(index, 1);
	console.log(lines);
	chartShareSummary.update(dataGroupByDate, formData);
}
function markFormatter(p) { return dateTime.getReadableTime(p.data.value); }

