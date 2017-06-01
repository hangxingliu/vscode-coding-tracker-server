//@ts-check
/// <reference path="types/index.d.ts" />

function App() {
	let Utils = require('./utils'),
		status = require('./statusDialog').init();
		// Charts = require('./charts'),

	let chart = {
		summary: require('./charts/summary'),
		last24hours: require('./charts/24hours'),
		computer: require('./charts/computer'),
		language: require('./charts/language'),
		project: require('./charts/project'),
		file: require('./charts/file')
	};

	var reportDays = 7,
		reportProject = null;

	//get API token passing by query string
	var APIToken = (location.href.match(/[\?\&]token\=(.+?)(\&|$)/)||['',''])[1]
	
	var baseURL = '/ajax/report',
		getBaseReportDataURL = () => `${baseURL}/recent?days=${reportDays}&token=${APIToken}`,
		getLast24HoursDataURL = (now) => `${baseURL}/last24hs?ts=${now}&token=${APIToken}`;
		// getProjectReportDataURL = () => `${baseURL}/project?project=${reportProject}&days=${reportDays}&token=${APIToken}`;

	let $reportDateRange = $('#selectReportDateRange');	
	
	$reportDateRange.on('change', requestBasicReportData);
	
	requestBasicReportData();
	requestLast24hsReportData();
	reqesutVersionInfo();
	
	function reqesutVersionInfo() {
		$.get('/', info => $('#version [name]').each((i, e) => $(e).text(info[$(e).attr('name')])));
	}

	function requestBasicReportData() {
		reportDays = Number($reportDateRange.val());
		requestAPI(getBaseReportDataURL(), genChartsFromBasicResportData);
	}

	function requestLast24hsReportData() {
		let now = Date.now();
		requestAPI(getLast24HoursDataURL(now), genLast24HoursChart);
		function genLast24HoursChart(data) {
			chart.last24hours.update(Utils.expandAndShortGroupByHoursObject(data.groupBy.hour, now));
			showTotalTimes(data.total, $('#counterLast24Hs'));
		}
	}
	
	function genChartsFromBasicResportData(reportData) {
		if (reportData.error) return onTokenInvalidError(reportData);

		let today = new Date(),
			startDate = new Date(today);
		startDate.setDate(startDate.getDate() - reportDays + 1);
		
		let groupByDayData = $.extend(true, {}, reportData.groupBy.day),
			data = Utils.expandGroupByDaysObject(groupByDayData, startDate, today);
		
		chart.summary.update(data);
		showTotalTimes(reportData.total, $('#counterSummary'));

		chart.computer.update(reportData.groupBy.computer);
		chart.language.update(reportData.groupBy.language);
		chart.project.update(reportData.groupBy.project);
		chart.file.update(reportData.groupBy.file);
	}

	/**
	 * @param {WatchingCodingObject} totalObject 
	 * @param {JQuery} $dom 
	 */
	function showTotalTimes(totalObject, $dom) {
		let _data = Utils.convertUnit2Hour({ total: totalObject }).total,
			data = {
				watching: _data.watching.toFixed(2),
				coding: _data.coding.toFixed(2)
			};
		$dom.find('[name]').each((i, e) => $(e).text(data[$(e).attr('name')]));
	}

	function requestAPI(url, success) {
		status.loading();
		$.ajax({
			method: 'GET', url,
			success: data => (success(data), status.hide()),
			error: displayError
		});
	}

	function onTokenInvalidError(response) {
		status.failed($.extend(true, {}, response, {
			tip: 'You can visit private report page by passing token like this: ' +
			'`http://domain:port/report/?token=${YOUR TOKEN}`'
		}));
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