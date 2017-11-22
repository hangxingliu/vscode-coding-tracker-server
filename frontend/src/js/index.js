/// <reference path="./index.d.ts" />

function App() {
	require('./ui/versionAndWelcome');
	require('./api').init();
	require('./i18n/index');
	require('./reportFilter');

	let Utils = require('./utils/utils'),
		router = require('./router'),
		share = require('./share');

	/**
	 * @type {APIResponse}
	 */
	let basicReportData = null;

	router.init([
		require('./routes/overview'),
		require('./routes/24hours'),
		require('./routes/projects'),
		require('./routes/languages'),
		require('./routes/vcs'),
	]).followRouterInURL('overview');

	// requestBasicReportData();
	// requestLast24hsReportData();

	// export functions
	this.share = share;

	this.shareSummary = shareSummary;

	//============================
	//           Functions
	//============================

	function shareSummary() {
		share.shareSummary(getSummaryDataFromBasicData(basicReportData), basicReportData.total);
	}

	function getSummaryDataFromBasicData(basicReportData) {
		let today = new Date(),
			startDate = new Date(today);
		startDate.setDate(startDate.getDate() - 7 + 1);

		let groupByDayData = $.extend(true, {}, basicReportData.groupBy.day),
			summaryData = Utils.expandGroupByDaysObject(groupByDayData, startDate, today);
		return summaryData;
	}

}
global.app = new App();
