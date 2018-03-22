//@ts-check

/*
	This is router of sub-page `projects` (Projects Report)
*/

const click = 'click';
const storageKeyAssociated = 'coding-tacker-associated-proj';

let utils = require('../utils/utils'),
	resizer = require('../utils/resizer'),
	form = require('../utils/form'),
	dateTime = require('../utils/datetime'),
	csvDialog = require('../ui/exportCSVDialog'),
	associateDialog = require('../ui/associateProjectsDialog'),
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

/** @type {Association[]} */
let associations = [];


/** Files: "All" "Top 5" "Top 10" ... */
let $rangeButtons = $pageOneProject.find('.range-block [data-range]'),
	$btnExportProjects = $('#btnExportProjects'),
	$btnExportFiles = $('#btnExportFiles'),
	$btnAssociate = $('#btnSetAssociated');

module.exports = { name: utils.basename(__filename, '.js'), start, stop, update };

function stop() {
	$pageIndex.hide();
	$pageOneProject.hide();

	charts.map(chart => chart.dispose());
}

function start(_projectName) {
	charts = [
		chartProjects.init(utils.getChartDom(chartProjects.recommendedChartId, $pageIndex)[0],
			// click bar for details of a single project(included associate projects)
			project => router.to('projects', project)),
	].concat([
		chartFilesInProject,
		chartSummaryForProject
	].map(m => m.init(utils.getChartDom(m.recommendedChartId, $pageOneProject)[0])));

	resizer.removeSubscriber();
	resizer.subscribe(charts);

	reportFilter.removeSubscribers();
	reportFilter.subscribe(() => currentProjectName ? showOneProject() : showAllProjects());

	// load associated projects information
	loadAssociationFromStorage();

	// add event listener for buttons
	$rangeButtons.off(click).on(click, updateRange);
	$btnExportProjects.off(click).on(click, exportCSVProjects);
	$btnExportFiles.off(click).on(click, exportCSVFiles);
	$btnAssociate.off(click).on(click, associateProjects);

	update(_projectName);
}

function update(proj) {
	if (proj) {
		console.log('update: display details of project:', proj);
		currentProjectName = proj;
		showOneProject();
	} else {
		console.log('update: display all projects');
		showAllProjects();
	}
}

function showAllProjects() {
	$pageIndex.show();
	$pageOneProject.hide();

	requestFilter = Object.assign({}, reportFilter.getFilter());
	API.requestSilent(URL.overview(), data => {
		projectsData = data.groupBy.project;
		chartProjects.update(projectsData, associations);
	});
}

function showOneProject() {
	$pageIndex.hide();
	$pageOneProject.show();

	if (currentProjectName.indexOf(':') > 0) {
		// It is a associated projects set
		// Query name of associated projects
		let projPath = currentProjectName.split(':');
		let projNameIndex = associations.findIndex(a => a.projects.indexOf(projPath[0]) >= 0);
		let projName = projNameIndex >= 0 ? associations[projNameIndex].name : '';
		if (!projName) {
			console.warn(`Could not match association of "${currentProjectName}"`);
			projName = utils.getShortProjectName(decodeURIComponent(projPath[0]));
		}
		form.fill($pageOneProject, {
			projName, projNameComment: '(Association)',
			projPath: projPath.map(it => decodeURIComponent(it)).join(' & ')
		});
	} else {
		let projPath = decodeURIComponent(currentProjectName);
		let projName = utils.getShortProjectName(projPath);
		form.fill($pageOneProject, { projName, projPath, projNameComment: '' });
	}

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

function associateProjects() {
	let projects = utils.orderByWatchingTime(utils.object2array(projectsData), true);

	loadAssociationFromStorage();
	associateDialog.showAssociateDialog(projects, associations, (newAssociations => {
		if (JSON.stringify(associations) == JSON.stringify(newAssociations))
			return console.log('There is nothing changed in associations');

		associations = newAssociations;
		saveAssociationToStorage();

		console.log('New Associations:', newAssociations);
		chartProjects.update(projectsData, associations);
	}));
}

function saveAssociationToStorage() {
	if (!('localStorage' in window)) return;
	localStorage.setItem(storageKeyAssociated, JSON.stringify(associations));
}

function loadAssociationFromStorage() {
	if (!('localStorage' in window)) return;
	try {
		/** @type {Association[]} */
		let raw = JSON.parse(localStorage.getItem(storageKeyAssociated) || '[]');
		if (!Array.isArray(raw))
			throw new Error(`Info is not an array`);
		for (let i = 0; i < raw.length; i ++) {
			let it = raw[i];
			if (typeof it.name != 'string')
				throw new Error(`Info[${i}].name is not a string`);
			if (!Array.isArray(it.projects))
				throw new Error(`Info[${i}].projects is not an array`);
		}
		associations = raw;
	} catch (ex) {
		alert(`Error: Could not load associated projects info from localStorage.\n  ${ex.message}`);
		if (confirm(`Do you want to remove incorrect record in localStorage?\n  key: ${storageKeyAssociated}`))
			localStorage.setItem(storageKeyAssociated, '[]');
	}
}
