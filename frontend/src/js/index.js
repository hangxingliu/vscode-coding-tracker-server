/// <reference path="./index.d.ts" />

function App() {
	const VERSION_KEY = 'coding-tracker-version';	

	let Utils = require('./utils'),
		api = require('./api').init(),
		i18n = require('./i18n'),
		share = require('./share');

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
		$welcomeInfo = $('#welcomeInfo'),
		reportDays = 7,
		currentServerVersion = '';
	
	$reportDateRange.on('change', requestBasicReportData);
	$i18nSelector.on('change', () => i18n.setLanguage($i18nSelector.val()));

	i18n.update();
	$i18nSelector.val(i18n.language || 'en');

	requestBasicReportData();
	requestLast24hsReportData();
	requestVersionInfo();
	
	// export functions
	this.share = share;

	this.showAllProjects = showAllProjectsReport;
	this.showAllLangs = showAllLanguagesReport;
	this.setAllLangs = setAllLanguagesDisplayRange;
	this.setFilesInProj = setFilesInProjectRange;
	this.openProjectReport = openProjectReport;
	this.hideWelcome = hideWelcome;
	this.showWelcome = showWelcome;
	this.shareSummary = shareSummary;
	//============================
	//           Functions
	//============================
	function showAllProjectsReport() { chart.allProjects.update(basicReportData.groupBy.project) }
	function showAllLanguagesReport() { chart.allLanguages.update(basicReportData.groupBy.language) }
	function setAllLanguagesDisplayRange(range) { chart.allLanguages.setRange(range)}
	function setFilesInProjectRange(range) { chart.oneProject.setRange(range); }

	function openProjectReport(projectName) {
		api.requestSilent(api.getProjectReportDataURL(reportDays, projectName),
			data => chart.oneProject.update(data, reportDays));
	}

	function hideWelcome() { $welcomeInfo.slideUp(); localStorage.setItem(VERSION_KEY, currentServerVersion); }
	function showWelcome() { $welcomeInfo.slideDown(); }
	function requestVersionInfo() {
		$.get('/', info => {
			currentServerVersion = info.serverVersion;
			$('#version [name]').each((i, e) => $(e).text(info[$(e).attr('name')]))
			Utils.hasLocalStorage() &&
				localStorage.getItem(VERSION_KEY) != currentServerVersion && 
				showWelcome();
		});
	}

	function shareSummary() {
		share.shareSummary(getSummaryDataFromBasicData(basicReportData), basicReportData.total);
	}

	function requestBasicReportData() {
		reportDays = Number($reportDateRange.val());
		api.request(api.getBasicReportDataURL(reportDays), genChartsFromBasicReportData);
	}

	function requestLast24hsReportData() {
		let now = Date.now();
		api.request(api.getLast24HoursDataURL(now), genLast24HoursChart);
		function genLast24HoursChart(data) {
			chart.last24hours.update(Utils.expandAndShortGroupByHoursObject(data.groupBy.hour, now));
			showTotalTimes(data.total, $('#counterLast24Hs'));
		}
	}

	function getSummaryDataFromBasicData(basicReportData) {
		let today = new Date(),
			startDate = new Date(today);
		startDate.setDate(startDate.getDate() - reportDays + 1);
		
		let groupByDayData = $.extend(true, {}, basicReportData.groupBy.day),
			summaryData = Utils.expandGroupByDaysObject(groupByDayData, startDate, today);
		return summaryData;
	}

	function genChartsFromBasicReportData(data) {
		basicReportData = data;
	
		chart.summary.update(getSummaryDataFromBasicData(data));
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
		let totalHoursMap = Utils.convertUnit2Hour({ total: totalObject });
		let data = Utils.getReadableTimeStringFromMap(totalHoursMap).total;
		$dom.find('[name]').each((i, e) => $(e).text(data[$(e).attr('name')]));
	}

}
global.app = new App();