//@ts-check

const click = 'click';

let utils = require('../utils/utils'),
	dateTime = require('../utils/datetime'),
	resizer = require('../utils/resizer'),
	csvDialog = require('../ui/exportCSVDialog'),
	reportFilter = require('../reportFilter'),
	API = require('../api'),
	{ URL } = API;

let $page = $('.page-languages');
let $rangeButtons = $page.find('.range-block [data-range]'),
	$btnExportLangauges = $('#btnExportLangauges');

let chartLanguages = require('../charts/languages_detailed');
/** @type {EChartsInstance[]} */
let charts = [];

/** @type {CodingWatchingMap} */
let langaugesData = {};
let totalWatchingTime = 0;

module.exports = { name: utils.basename(__filename, '.js'), start, stop };

function stop() {
	charts.map(chart => chart.dispose());
	$rangeButtons.off(click);
	$btnExportLangauges.off(click);
	$page.hide();
}

function start() {
	$page.show();

	charts = [
		chartLanguages.init(utils.getChartDom(chartLanguages.recommendedChartId, $page)[0])
	];

	resizer.removeSubscriber();
	resizer.subscribe(charts);

	reportFilter.removeSubscribers();
	reportFilter.subscribe(request);

	$rangeButtons.on(click, updateRange);
	$btnExportLangauges.on(click, exportCSVLangauges);

	request(reportFilter.getFilter());
}

/** @param {ReportFilter} filter */
function request(filter) {
	void filter; // keep this variable in here
	API.requestSilent(URL.languages(), data => {
		totalWatchingTime = data.total.watching;
		langaugesData = data.groupBy.language;

		chartLanguages.update({ data: langaugesData })
	});
}

const CLASS_RANGE_DEFAULT = 'btn-default';
const CLASS_RANGE_SELECTED = 'btn-success';
function updateRange() {
	let top = parseInt($(this).attr('data-range'));$rangeButtons.removeClass(CLASS_RANGE_SELECTED).addClass(CLASS_RANGE_DEFAULT);
	$rangeButtons.filter(`[data-range=${top}]`)
		.addClass(CLASS_RANGE_SELECTED).removeClass(CLASS_RANGE_DEFAULT);
	chartLanguages.update({ top });
}

function exportCSVLangauges() {
	const headers = ['Language', 'Percent', 'Cost'];
	let rows = utils.orderByWatchingTime(utils.object2array(langaugesData), true);
	let data = rows.map(row => {
		let time = langaugesData[row.name].watching;
		let cost = dateTime.getReadableTime(time);
		return [
			decodeURIComponent(row.name),
			(time * 100 / totalWatchingTime).toFixed(2) + '%',
			cost];
	});
	let defaultFile = 'languages_' + csvDialog.getFileNameFromFilter();
	csvDialog.showExportDialog(defaultFile, headers, data);
}
