//@ts-check

const StatusDialog = require('./statusDialog');

const BASE = '/ajax/report';
let APIToken = '';

let exportObject = {
	init: () => {
		APIToken = (location.href.match(/[?&]token=(.+?)(&|$)/) || ['', ''])[1];
		return exportObject;
	},

	/**
	 * @param {string} url
	 * @param {(data: any) => void} callback
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
	requestSilent: (url, callback) => exportObject.request(url, callback, true),

	getBasicReportDataURL: (reportDays) =>
		`${BASE}/recent?days=${reportDays}&token=${APIToken}`,
	getLast24HoursDataURL: (now) =>
		`${BASE}/last24hs?ts=${now}&token=${APIToken}`,
	getProjectReportDataURL: (reportDays, project) =>
		`${BASE}/project?project=${project}&days=${reportDays}&token=${APIToken}`

};
module.exports = exportObject;


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