//@ts-check
/// <reference path="types/index.d.ts" />

function App() {
	let Utils = require('./utils'),
		status = require('./statusDialog').init(),
		url = require('./url').init(),
		i18n = require('./i18n');

	let chart = {
		summary: require('./charts/summary'),
		last24hours: require('./charts/24hours'),
		computer: require('./charts/computer'),
		language: require('./charts/language'),
		project: require('./charts/project'),
		file: require('./charts/file'),
		allProjects: require('./charts/all_projects'),
		allLanguages: require('./charts/all_languages'),
		oneProject: require('./charts/one_project')
	};

	/**
	 * @type {APIResponse}
	 */
	let basicReportData = null;

	let $reportDateRange = $('#selectReportDateRange'),
		$i18nSelector = $('#selectI18N'),
		reportDays = 7;	
	
	$reportDateRange.on('change', requestBasicReportData);
	$i18nSelector.on('change', () => i18n.setLanguage($i18nSelector.val()));

	i18n.update();
	$i18nSelector.val(i18n.language || 'eng');

	requestBasicReportData();
	requestLast24hsReportData();
	reqesutVersionInfo();
	
	// export functionsw
	this.showAllProjects = showAllProjectsReport;
	this.showAllLangs = showAllLanguagesReport;
	this.setAllLangs = setAllLangaugesDisplayRange;
	this.setFilesInProj = setFilesInProjectRange;
	this.openProjectReport = openProjectReport;
	//============================
	//           Functions
	//============================
	function showAllProjectsReport() { chart.allProjects.update(basicReportData.groupBy.project) }
	function showAllLanguagesReport() { chart.allLanguages.update(basicReportData.groupBy.language) }
	function setAllLangaugesDisplayRange(range) { chart.allLanguages.setRange(range)}
	function setFilesInProjectRange(range) { chart.oneProject.setRange(range); }

	function openProjectReport(projectName) {
		requestAPI(url.getProjectReportDataURL(reportDays, projectName),
			data => chart.oneProject.update(data, reportDays), true);
	}

	function reqesutVersionInfo() {
		$.get('/', info => $('#version [name]').each((i, e) => $(e).text(info[$(e).attr('name')])));
	}

	function requestBasicReportData() {
		reportDays = Number($reportDateRange.val());
		requestAPI(url.getBasicReportDataURL(reportDays), genChartsFromBasicResportData);
	}

	function requestLast24hsReportData() {
		let now = Date.now();
		requestAPI(url.getLast24HoursDataURL(now), genLast24HoursChart);
		function genLast24HoursChart(data) {
			chart.last24hours.update(Utils.expandAndShortGroupByHoursObject(data.groupBy.hour, now));
			showTotalTimes(data.total, $('#counterLast24Hs'));
		}
	}
	
	function genChartsFromBasicResportData(data) {
		basicReportData = data;

		let today = new Date(),
			startDate = new Date(today);
		startDate.setDate(startDate.getDate() - reportDays + 1);
		
		let groupByDayData = $.extend(true, {}, data.groupBy.day),
			summaryData = Utils.expandGroupByDaysObject(groupByDayData, startDate, today);
		chart.summary.update(summaryData);
		showTotalTimes(data.total, $('#counterSummary'));

		chart.computer.update(data.groupBy.computer);
		chart.language.update(data.groupBy.language);
		chart.project.update(data.groupBy.project);
		chart.file.update(data.groupBy.file);
	}

	/**
	 * @param {WatchingCodingObject} totalObject 
	 * @param {JQuery} $dom 
	 */
	function showTotalTimes(totalObject, $dom) {
		let data = Utils.convertUnit2Hour({ total: totalObject }).total;
		$dom.find('[name]').each((i, e) => $(e).text(Number(data[$(e).attr('name')]).toFixed(2)));
	}

	function requestAPI(url, success, noLoadingDialog) {
		noLoadingDialog || status.loading();
		$.ajax({
			method: 'GET', url,
			success: data => (success(data), status.hide()),
			error: displayError
		});
	}

	function displayError(error) {
		let info = '',
			getXHRInfo = () => `\n  readyState: ${error.readyState}\n  status: ${error.status}\n  statusText: ${error.statusText}`;
		if (error) {
			if (('readyState' in error && error.readyState < 4) ||
				('status' in error && error.status != 200))
				info = `Network exception!` + getXHRInfo();	
			if (error.responseJSON && typeof error.responseJSON.error == 'string')
				info = `Server response:\n  ${error.responseJSON.error}`;
		}
		//@ts-ignore
		if (!info) info = error;
		status.failed(info);
	}
}
global.app = new App();