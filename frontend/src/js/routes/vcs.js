//@ts-check

let utils = require('../utils/utils'),
	resizer = require('../utils/resizer'),
	reportFilter = require('../reportFilter'),
	API = require('../api'),
	{ URL } = API;

let $page = $('.page-vcs');

let chartVCS = require('../charts/vcs');
/** @type {EChartsInstance[]} */
let charts = [];

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

	request(reportFilter.getFilter());
}

/** @param {ReportFilter} filter */
function request(filter) {
	void filter; // keep this variable in here
	API.requestSilent(URL.vcs(), data =>
		chartVCS.update(getAdvancedVCSInfoArray(data.groupBy.vcs)));
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
