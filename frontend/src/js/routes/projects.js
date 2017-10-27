//@ts-check

let utils = require('../utils/utils'),
	resizer = require('../utils/resizer'),
	form = require('../utils/form'),
	router = require('../router'),
	reportFilter = require('../reportFilter'),
	API = require('../api'),
	{ URL } = API;

let $pageIndex = $('.page-projects-index'),
	$pageOneProject = $('.page-projects-sub');

let chartProjects = require('../charts/projects'),
	chartSummaryForProject = require('../charts/project_summary'),
	chartFilesInProject = require('../charts/project_files');

/** @type {EChartsInstance[]} */
let charts = [];

/** @type {ReportFilter} */
let requestFilter = null;
let projectName = '';

let $rangeButtons = $pageOneProject.find('.range-block [data-range]');

module.exports = {
	name: 'projects',
	start, stop, update
};

function stop() { 
	$pageIndex.hide();
	$pageOneProject.hide();
	$rangeButtons.off('click');
	charts.map(chart => chart.dispose());
}
function start(projectName) {
	charts = [
		chartProjects.init(utils.getChartDom(chartProjects.recommendedChartId, $pageIndex)[0],
			project => router.to('projects', project)),
	].concat([
		chartFilesInProject,
		chartSummaryForProject
	].map(m => m.init(utils.getChartDom(m.recommendedChartId, $pageOneProject)[0])));

	resizer.removeSubscriber();
	resizer.subscribe(charts);

	reportFilter.removeSubscribers();
	reportFilter.subscribe(() => projectName ? showOneProject() : showAllProjects());

	$rangeButtons.on('click', updateRange);

	update(projectName);
}
function update(proj) {
	(projectName = proj) ? showOneProject() : showAllProjects();
}

function showAllProjects() { 
	$pageIndex.show();
	$pageOneProject.hide();
	
	requestFilter = Object.assign({}, reportFilter.getFilter());
	API.requestSilent(URL.overview(), data => chartProjects.update(data.groupBy.project));
}
function showOneProject() {
	$pageIndex.hide();
	$pageOneProject.show(); 

	let projPath = decodeURIComponent(projectName);
	let projName = utils.getShortProjectName(projPath);
	form.fill($pageOneProject, { projName, projPath });

	requestFilter = Object.assign({}, reportFilter.getFilter());
	API.requestSilent(URL.project(projectName), data => {
		chartSummaryForProject.update(getSummaryDataFromResponse(data))
		chartFilesInProject.update({ data: data.groupBy.file })
	});
}

/** @param {APIResponse} data */
function getSummaryDataFromResponse(data) {
	let groupByDayData = $.extend(true, {}, data.groupBy.day),
		summaryData = utils.expandGroupByDaysObject(groupByDayData, requestFilter.from, requestFilter.to);
	return summaryData;
}

const CLASS_RANGE_DEFAULT = 'btn-default';
const CLASS_RANGE_SELECTED = 'btn-primary';
function updateRange() {
	let top = parseInt($(this).attr('data-range'));
	$rangeButtons.removeClass(CLASS_RANGE_SELECTED).addClass(CLASS_RANGE_DEFAULT);
	$rangeButtons.filter(`[data-range=${top}]`)
		.addClass(CLASS_RANGE_SELECTED).removeClass(CLASS_RANGE_DEFAULT);
	chartFilesInProject.update({ top });
}