//@ts-check

/*
	This is router of sub-page `projects` (Projects Report)
*/
const click = 'click';

let utils = require('../utils/utils'),
	resizer = require('../utils/resizer'),
	form = require('../utils/form'),
	dateTime = require('../utils/datetime'),
	csvDialog = require('../ui/exportCSVDialog'),
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
let currentProjectName = '';

/** @type {CodingWatchingMap} */
let projectsData = {};
/** @type {CodingWatchingMap} */
let filesData = {};


/** Files: "All" "Top 5" "Top 10" ... */
let $rangeButtons = $pageOneProject.find('.range-block [data-range]'),
	$btnExportProjects = $('#btnExportProjects'),
	$btnExportFiles = $('#btnExportFiles');

module.exports = { name: utils.basename(__filename, '.js'), start, stop, update };

function stop() {
	$pageIndex.hide();
	$pageOneProject.hide();

	$rangeButtons.off(click);
	$btnExportProjects.off(click);
	$btnExportFiles.off(click);

	charts.map(chart => chart.dispose());
}

function start(_projectName) {
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
	reportFilter.subscribe(() => currentProjectName ? showOneProject() : showAllProjects());

	// add event listener for buttons
	$rangeButtons.on(click, updateRange);
	$btnExportProjects.on(click, exportCSVProjects);
	$btnExportFiles.on(click, exportCSVFiles);

	update(_projectName);
}

function update(proj) {
	console.log(proj);
	(currentProjectName = proj) ? showOneProject() : showAllProjects();
}

function showAllProjects() {
	$pageIndex.show();
	$pageOneProject.hide();

	requestFilter = Object.assign({}, reportFilter.getFilter());
	API.requestSilent(URL.overview(), data => {
		projectsData = data.groupBy.project;
		chartProjects.update(projectsData);
	});
}

function showOneProject() {
	$pageIndex.hide();
	$pageOneProject.show();

	let projPath = decodeURIComponent(currentProjectName);
	let projName = utils.getShortProjectName(projPath);
	form.fill($pageOneProject, { projName, projPath });

	requestFilter = Object.assign({}, reportFilter.getFilter());
	API.requestSilent(URL.project(currentProjectName), data => {
		filesData = data.groupBy.file;
		chartSummaryForProject.update(getSummaryDataFromResponse(data))
		chartFilesInProject.update({ data: filesData })
	});
}

/** @param {APIResponse} data */
function getSummaryDataFromResponse(data) {
	let groupByDayData = $.extend(true, {}, data.groupBy.day),
		summaryData = utils.expandGroupByDaysObject(groupByDayData, requestFilter.from, requestFilter.to);
	return summaryData;
}

/**
 * When you click buttons "Files in this project": "All", "Top 5", ...
 */
function updateRange() {
	const classDefault = 'btn-default', classSelected = 'btn-primary';

	let top = parseInt($(this).attr('data-range'));
	$rangeButtons.removeClass(classSelected).addClass(classDefault);
	$rangeButtons.filter(`[data-range=${top}]`)
		.addClass(classSelected).removeClass(classDefault);
	chartFilesInProject.update({ top });
}

function exportCSVProjects() {
	const headers = ['Name', 'Path', 'Cost'];
	let rows = utils.orderByWatchingTime(utils.object2array(projectsData), true);
	let data = rows.map(row => {
		let path = row.name;
		let cost = dateTime.getReadableTime(projectsData[path].watching);

		path = decodeURIComponent(path);
		return [ utils.getShortProjectName(path), path, cost ];
	});
	csvDialog.showExportDialog(csvDialog.getFileNameFromFilter(), headers, data);
}
function exportCSVFiles() {
	const headers = ['File', 'Cost'];
	let rows = utils.orderByWatchingTime(utils.object2array(filesData), true);
	let data = rows.map(row => {
		let cost = dateTime.getReadableTime(filesData[row.name].watching);
		return [ decodeURIComponent(row.name), cost ];
	});

	let defaultFile = utils.getShortProjectName(decodeURIComponent(currentProjectName));
	defaultFile = defaultFile.replace(/\W/g, '-').toLowerCase()	+ '_' + csvDialog.getFileNameFromFilter();
	csvDialog.showExportDialog(defaultFile, headers, data);
}
