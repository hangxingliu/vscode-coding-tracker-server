//@ts-check

const click = 'click';

let utils = require('../utils/utils'),
	resizer = require('../utils/resizer'),
	dateTime = require('../utils/datetime'),
	csvDialog = require('../ui/exportCSVDialog'),
	reportFilter = require('../reportFilter'),
	API = require('../api'),
	{ URL } = API;

let $page = $('.page-vcs');

let chartVCS = require('../charts/vcs');
/** @type {EChartsInstance[]} */
let charts = [];

/** @type {CodingWatchingMap} */
let VCSData = {};

let $btnExportVCS = $('#btnExportGit');

module.exports = { name: utils.basename(__filename, '.js'), start, stop };

function stop() {
	charts.map(chart => chart.dispose());
	$page.hide();
}

function start() {
	$page.show();

	charts = [
		chartVCS.init(utils.getChartDom(chartVCS.recommendedChartId, $page)[0], item => void item)
	];

	resizer.removeSubscriber();
	resizer.subscribe(charts);

	reportFilter.removeSubscribers();
	reportFilter.subscribe(request);

	$btnExportVCS.off(click).on(click, exportCSVGit);

	request(reportFilter.getFilter());
}

/** @param {ReportFilter} filter */
function request(filter) {
	void filter; // keep this variable in here
	API.requestSilent(URL.vcs(), data =>
		chartVCS.update(getAdvancedVCSInfoArray(VCSData = data.groupBy.vcs)));
}

/**
 * @param {CodingWatchingMap} data
 * @returns {AdvancedVCSInfo[]}
 */
function getAdvancedVCSInfoArray(data) {
	/** @type {AdvancedVCSInfo[]} */
	let result = [];
	Object.keys(data).forEach(vcsString => {
		let vcs = vcsString.split(':');
		vcs = vcs.map(it => decodeURIComponent(it || ''));

		let [type, path, branch] = vcs;

		result.push(Object.assign({
			type, path, branch, short: utils.getShortProjectName(path),
			selected: false
		}, data[vcsString]));
	});
	return result;
}

function exportCSVGit() {
	const headers = ['Project', 'Path', 'Branch', 'Cost'];
	let rows = utils.orderByWatchingTime(utils.object2array(VCSData), true);
	console.log(rows);

	let data = rows.map(row => {
		let time = VCSData[row.name].watching;
		let cost = dateTime.getReadableTime(time);

		let vcs = row.name.split(':').map(it => decodeURIComponent(it || ''));
		let [, path, branch] = vcs;
		return [
			path ? utils.getShortProjectName(path) : 'others',
			path || 'without VCS',
			branch || '',
			cost
		];
	});
	let defaultFile = 'vcs_' + csvDialog.getFileNameFromFilter();
	csvDialog.showExportDialog(defaultFile, headers, data);
}
