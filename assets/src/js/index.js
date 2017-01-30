var App = function () {
	
	var reportDays = 7,
		reportProject = null;

	var baseURL = '/ajax/report',
		getBaseReportDataURL = () => `${baseURL}/recent?days=${reportDays}`,
		getLast24HoursDataURL = (now) => `${baseURL}/last24hs?ts=${now}`,
		getProjectReportDataURL = () => `${baseURL}/project?project=${reportProject}&days=${reportDays}`;

	var loadStatus = new LoadStatus($('#statusDialog')),
		$reportDateRange = $('#selectReportDateRange');	
	var charts = new Charts();
	
	$reportDateRange.on('change', startAjaxGetBaseReportData);
	
	
	startAjaxGetBaseReportData();
	startAjaxGetLast24HoursData();

	function startAjaxGetBaseReportData() {
		reportDays = Number($reportDateRange.val());

		loadStatus.showLoading();
		$.ajax({
			method: 'GET',
			url: getBaseReportDataURL(),
			success: data => handlerBaseReportData(data),
			error: data => loadStatus.showFailed(data)
		});
	}
	
	function startAjaxGetLast24HoursData() {
		var now = Date.now();
		$.ajax({
			method: 'GET',
			url: getLast24HoursDataURL(now),
			success: data => handler(data),
			error: data => loadStatus.showFailed(data)			
		})

		function handler(data) {
			charts.setLast24HsData(Utils.expandAndShortGroupByHoursObject(data.groupBy.hour, now));
		}	
	}

//Working today logic
	function handlerBaseReportData(data) {

		//-----------show summary chart--------
		var today = new Date();
		var startDate = new Date(today);
		startDate.setDate(startDate.getDate() - reportDays + 1);
		var groupByDayData = data.groupBy.day;
		var data1 = Utils.expandGroupByDaysObject(groupByDayData, startDate, today);
		charts.setSummaryData(data1);
		//-------------------------------------
		
		//-----------computer chart------------
		charts.setComputerData(data.groupBy.computer);
		//-------------------------------------
		charts.setLanguageData(data.groupBy.language);

		charts.setProjectData(data.groupBy.project);

		charts.setFileData(data.groupBy.file);
		
		loadStatus.hide();
	}
};
var app = new App();