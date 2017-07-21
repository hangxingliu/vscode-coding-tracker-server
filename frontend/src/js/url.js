//@ts-check

const BASE = '/ajax/report';
let APIToken = '';

let exportObject = {
	init: () => {
		APIToken = (location.href.match(/[?&]token=(.+?)(&|$)/) || ['', ''])[1];
		return exportObject;
	},
	getBasicReportDataURL: (reportDays) =>
		`${BASE}/recent?days=${reportDays}&token=${APIToken}`,
	getLast24HoursDataURL: (now) =>
		`${BASE}/last24hs?ts=${now}&token=${APIToken}`,
	getProjectReportDataURL: (reportDays, project) =>
		`${BASE}/project?project=${project}&days=${reportDays}&token=${APIToken}`

};
module.exports = exportObject;