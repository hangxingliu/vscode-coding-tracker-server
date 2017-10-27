//@ts-check
/// <reference path="./index.d.ts" />

let { getYYYYMMDD } = require('./utils/utils');

const RECENT_DAYS = [0, 7, 14, 30, 365];

/** @type {ReportFilter} */
let filter = {};
let subscribers = [];

installReportRangeComponent();

function installReportRangeComponent() {
	let $rangeDropdown = $('#reportRangeDropdown, #reportRangeDropdown4Mobile');
	let $currentRange = $rangeDropdown.find('.current-range');
	let $rangeDropdownItem = $rangeDropdown.find('.dropdown-item');
	$rangeDropdownItem.off('click').on('click', onClick);
	onClick.call($rangeDropdownItem[0]);

	function onClick() { 
		//TODO: 20: custom date range
		$currentRange.text($(this).text());
		setRange($(this).attr('data-range'));
	}
}

/** @param {string} _rangeId */
function setRange(_rangeId) { 
	let rangeId = parseInt(_rangeId);
	if (isNaN(rangeId)) return;
	
	let to = new Date();
	let from = new Date(to.getTime());
	if (rangeId < 10) {
		from.setDate(from.getDate() - (RECENT_DAYS[rangeId] || -1) + 1);
	} else if (rangeId == 11 || rangeId == 12) {
		// This week or last week
		from.setDate(from.getDate() - from.getDay());
		to.setDate(from.getDate() + 6);
		if (rangeId == 12) { // Last Week
			from.setDate(from.getDate() - 7);
			to.setDate(to.getDate() - 7);
		}
	} else if (rangeId == 13) {
		// This month
		from.setDate(1); // This month: 1th

		to.setMonth(to.getMonth() + 1); // Next month
		to.setDate(0); // This month: last day
	} else if (rangeId == 14) { 
		// Last month
		from.setMonth(from.getMonth() - 1); // Last month
		from.setDate(1); // Last month 1th
		
		to.setDate(0); // Last month: last day 
	} else { 
		return;
	}
	filter.to = to;
	filter.from = from;
	notifySubscribers();
}
function setCustomRange(todo, todo2, todo3, todo4, todo5) { 

}	

/** @param {string} repo */
function setVCSRepo(repo) { 
	filter.vcsRepo = repo;
	notifySubscribers();
}
function notifySubscribers() {
	let debug = `report filter: [${getYYYYMMDD(filter.from)}, ${getYYYYMMDD(filter.to)}]`;
	if (filter.project) debug += ` proj: ${filter.project}`;
	if (filter.vcsRepo) debug += ` proj: ${filter.vcsRepo}`;
	console.log(debug);
	
	subscribers.forEach(s => s(filter));
}

/** @param {ReportFilterSubscriber} subscriber */
function subscribe(subscriber) { subscribers.push(subscriber); } 
function removeSubscribers() { subscribers = []; }

/** @returns {ReportFilter} */
function getFilter() {return filter; }


module.exports = {
	installReportRangeComponent,
	setRange, setCustomRange,
	setVCSRepo,
	subscribe,
	removeSubscribers,
	getFilter
};