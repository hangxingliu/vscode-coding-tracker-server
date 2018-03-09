//@ts-check

let utils = require('../utils/utils'),
	dateTime = require('../utils/datetime'),
	resizer = require('../utils/resizer'),
	router = require('../router'),
	reportFilter = require('../reportFilter'),
	API = require('../api'),
	{ URL } = API;

let $page = $('.page-overview');
let $btnShare = $('#btnShareSummary');

let chartSummary = require('../charts/summary');
let chart24hs = require('../charts/24hours');
let chartProjects = require('../charts/projects');
let chartFiles = require('../charts/files');
let chartComputers = require('../charts/computer');
let chartLanguages = require('../charts/languages');
/** @type {EChartsInstance[]} */
let charts = [];

/** @type {ReportFilter} */
let requestFilter = null;

module.exports = { name: utils.basename(__filename, '.js'), start, stop };

function stop() { charts.map(chart => chart.dispose()); $page.hide(); }
function start() {
	$page.show();

	charts = [
		chartProjects.init(utils.getChartDom(chartProjects.recommendedChartId, $page)[0],
			project => router.to('projects', project), 5)
	].concat([
		chartSummary,
		chart24hs,
		chartFiles,
		chartComputers,
		chartLanguages
	].map(c => c.init(utils.getChartDom(c.recommendedChartId, $page)[0])));

	resizer.removeSubscriber();
	resizer.subscribe(charts);

	reportFilter.removeSubscribers();
	reportFilter.subscribe(request);

	request(reportFilter.getFilter());
}

/** @param {ReportFilter} filter */
function request(filter) {
	requestFilter = Object.assign({}, filter);
	API.requestSilent(URL.overview(), onOverviewResponse);

	let now = dateTime.now(),
		endDate = dateTime.getEndOfHour(now),
		startDate = dateTime.getStartOfHour(now);
	startDate.setHours(startDate.getHours() - 23);
	API.requestSilent(URL.hours(startDate, endDate), on24HoursResponse);
}

/** @param {APIResponse} data */
function on24HoursResponse(data) {
	chart24hs.update(utils.expandAndShortGroupByHoursObject(data.groupBy.hour, Date.now()));
	showTotalTimes(data.total, $('#counterLast24Hs'));
}

/** @param {APIResponse} data */
function onOverviewResponse(data) {
	chartSummary.update(getSummaryDataFromResponse(data))
	showTotalTimes(data.total, $('#counterSummary'));

	chartProjects.update(data.groupBy.project);
	chartFiles.update(data.groupBy.file);
	chartComputers.update(data.groupBy.computer);
	chartLanguages.update(data.groupBy.language);
}


/** @param {APIResponse} data */
function getSummaryDataFromResponse(data) {
	let groupByDayData = $.extend(true, {}, data.groupBy.day),
		summaryData = utils.expandGroupByDaysObject(groupByDayData, requestFilter.from, requestFilter.to);

	$btnShare.off('click').on('click', () => require('../ui/share').shareSummary(summaryData, data.total));
	return summaryData;
}
/**
 * @param {CodingWatchingObject} totalObject
 * @param {JQuery} $dom
 */
function showTotalTimes(totalObject, $dom) {
	let data = {
		watching: dateTime.getReadableTime(totalObject.watching),
		coding: dateTime.getReadableTime(totalObject.coding),
	};
	$dom.find('[name]').each((i, e) => { $(e).text(data[$(e).attr('name')]) });
}
