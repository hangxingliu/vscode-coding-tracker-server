//@ts-check

let utils = require('../utils/utils'),
	dateTime = require('../utils/datetime'),
	resizer = require('../utils/resizer'),
	reportFilter = require('../reportFilter'),
	API = require('../api'),
	{ URL } = API,
	filterDialog = require('../ui/24hsFromDialog');

// components in this sub-page
let $page = $('.page-24hours'),
	$filterFrom = $page.find('.filter-24hs'),
	$txtFrom = $filterFrom.find('.txt');

// 3 charts in this sub-page
let chart24hs = require('../charts/24hours');
let chartProjects = require('../charts/projects');
let chartFiles = require('../charts/files');

/** @type {EChartsInstance[]} */
let charts = [];

/** @type {Date} */
let startDate = null, endDate = null;

module.exports = { name: utils.basename(__filename, '.js'), start, stop };

function stop() {
	charts.map(chart => chart.dispose());
	$page.hide();
}

function start() {
	$page.show();
	$filterFrom.off('click').on('click', () => filterDialog.show(onDateFilterChange));

	charts = [
		[chartProjects],
		[chartFiles, 10, true],
		[chart24hs]
	//@ts-ignore
	].map(([c, ...p]) => c.init(utils.getChartDom(c.recommendedChartId, $page)[0], ...p));

	resizer.removeSubscriber();
	resizer.subscribe(charts);

	reportFilter.removeSubscribers();
	reportFilter.subscribe(request);

	startDate = dateTime.getStartOfHour();
	startDate.setHours(startDate.getHours() - 23);
	onDateFilterChange(startDate);
}

function request() {
	API.requestSilent(URL.hoursDetailed(startDate, endDate), on24HoursResponse);
}

/** @param {Date} _startDate */
function onDateFilterChange(_startDate) {
	startDate = _startDate;

	endDate = new Date(startDate);
	endDate.setHours(endDate.getHours() + 23);
	endDate = dateTime.getEndOfHour(endDate);

	$txtFrom.text(dateTime.getMMDD(startDate) + ' ' +dateTime.getHH00(startDate));
	request();
}

/** @param {APIResponse} data */
function on24HoursResponse(data) {
	chart24hs.update(utils.expandAndShortGroupByHoursObject(data.groupBy.hour, endDate));
	showTotalTimes(data.total, $('#counterCustom24Hs'));

	chartProjects.update(data.groupBy.project);
	chartFiles.update(data.groupBy.file);
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
