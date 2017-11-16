let utils = require('../utils/utils'),
	resizer = require('../utils/resizer'),
	reportFilter = require('../reportFilter'),
	API = require('../api'),
	{ URL } = API;

let $page = $('.page-languages');
let $rangeButtons = $page.find('.range-block [data-range]');

let chartLanguages = require('../charts/languages_detailed');
/** @type {EChartsInstance[]} */
let charts = [];

module.exports = { name: utils.basename(__filename, '.js'), start, stop };

function stop() {
	charts.map(chart => chart.dispose());
	$rangeButtons.off('click');
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

	$rangeButtons.on('click', updateRange);

	request(reportFilter.getFilter());
}

/** @param {ReportFilter} filter */
function request(filter) {
	void filter; // keep this variable in here
	API.requestSilent(URL.languages(), data =>
		chartLanguages.update({data: data.groupBy.language}));
}

const CLASS_RANGE_DEFAULT = 'btn-default';
const CLASS_RANGE_SELECTED = 'btn-success';
function updateRange() {
	let top = parseInt($(this).attr('data-range'));$rangeButtons.removeClass(CLASS_RANGE_SELECTED).addClass(CLASS_RANGE_DEFAULT);
	$rangeButtons.filter(`[data-range=${top}]`)
		.addClass(CLASS_RANGE_SELECTED).removeClass(CLASS_RANGE_DEFAULT);
	chartLanguages.update({ top });
}
