//@ts-check

let utils = require('../utils/utils'),
	resizer = require('../utils/resizer'),
	reportFilter = require('../reportFilter'),
	API = require('../api'),
	{ URL } = API,
	filterDialog = require('../ui/24hsFromDialog');

let $page = $('.page-24hours'),
	$filterFrom = $page.find('.filter-24hs'),
	$txtFrom = $filterFrom.find('.txt');

let chart24hs = require('../charts/24hours');
let chartProjects = require('../charts/projects');
let chartFiles = require('../charts/files');
/** @type {EChartsInstance[]} */
let charts = [];

/** @type {Date} */
let latestDate = null;

const ONE_DAY = 24 * 3600 * 1000;

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

	let initEarliestDate = new Date(Date.now() - ONE_DAY);
	initEarliestDate.setHours(initEarliestDate.getHours() + 1, 0, 0, 0);
	onDateFilterChange(initEarliestDate);
}

function request() {
	API.requestSilent(URL.hoursDetailed(latestDate), on24HoursResponse);
}

/** @param {Date} date */
function onDateFilterChange(date) {
	latestDate = new Date(date.getTime() + ONE_DAY - 1);
	$txtFrom.text(utils.getMMDD(date) + ' ' +utils.getHH00(date));
	request();
}

/** @param {APIResponse} data */
function on24HoursResponse(data) {
	chart24hs.update(utils.expandAndShortGroupByHoursObject(data.groupBy.hour, latestDate));
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
		watching: utils.getReadableTime(totalObject.watching),
		coding: utils.getReadableTime(totalObject.coding),
	};
	$dom.find('[name]').each((i, e) => { $(e).text(data[$(e).attr('name')]) });
}
