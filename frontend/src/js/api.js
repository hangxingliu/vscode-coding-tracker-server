//@ts-check

let StatusDialog = require('./ui/statusDialog');
let { getFilter } = require('./reportFilter');

const BASE = '/ajax/report-v2';

let APIToken = '';
let URL = {
	overview: () => getBaseURL('overview', getFilter()),
	languages: () => getBaseURL('languages', getFilter()),
	vcs: () => getBaseURL('vcs', getFilter()),
	project: proj => getBaseURL('project', getFilter()) + '&project=' + encodeURIComponent(proj),

	hours: (startDate, endDate) => getGroupByHoursURL('hours', startDate, endDate),
	hoursDetailed: (startDate, endDate) => getGroupByHoursURL('hours-detailed', startDate, endDate),
};

let API = {
	URL,
	init: () => {
		APIToken = (location.href.match(/[?&]token=(.+?)(&|$)/) || ['', ''])[1];
		return API;
	},

	/**
	 * @param {string} url
	 * @param {(data: APIResponse) => void} callback
	 * @param {boolean} [silentWithoutDialog]
	 */
	request: (url, callback, silentWithoutDialog) => {
		silentWithoutDialog || StatusDialog.loading();
		$.ajax({
			method: 'GET', url,
			success: data => { StatusDialog.hide(), callback(data) },
			error: displayError
		});
	},

	/**
	 * @param {string} url
	 * @param {(data: APIResponse) => void} callback
	 */
	requestSilent: (url, callback) => API.request(url, callback, true)

};
module.exports = API;

/**
 * @param {string} name
 * @param {ReportFilter} filter
 */
function getBaseURL(name, filter) {
	return `${BASE}/${name}?token=${APIToken}&from=${filter.from.getTime()}&to=${filter.to.getTime()}`;
}

/**
 * @param {string} name
 * @param {Date} [endDate]
 */
function getGroupByHoursURL(name, startDate, endDate) {
	return `${BASE}/${name}?token=${APIToken}&from=${startDate.getTime()}&to=${endDate.getTime()}`;
}


function displayError(error) {
	let info = '',
		getXHRInfo = () => `\n  readyState: ${error.readyState}\n  status: ${error.status}\n  statusText: ${error.statusText}`;
	if (error) {
		if (('readyState' in error && error.readyState < 4) ||
			('status' in error && error.status != 200))
			info = `Network exception!` + getXHRInfo();
		let response = json(error.responseText, {});
		if (response.error)
			info += `\nError:\n${obj2str(response.error, '  ')}`;
		else
			info += `\nResponse:\n${obj2str(response, '  ')}`;
	}
	if (!info)
		info = error;
	StatusDialog.failed(info);
}
function json(str, defaultValue = {}) {
	try { return JSON.parse(str); }
	catch (ex) { return defaultValue; }
}
function obj2str(obj, indent = '') {
	return JSON.stringify(obj, null, 2).split('\n').map(line => indent + line).join('\n');
}
