//@ts-check
/// <reference path="./index.d.ts" />

let dateTime = require('./utils/datetime');
let customRangeDlg = require('./ui/customDateRangeDialog');

const CUSTOM = '20';
const DROPDOWN_IDS = ['#reportRangeDropdown','#reportRangeDropdown4Mobile'];
const RECENT_DAYS = [0, 7, 14, 30, 365];

/** @type {ReportFilter} */
let filter = {};
let subscribers = [];

installReportRangeComponent();

function installReportRangeComponent() {
	let $rangeDropdown = $(DROPDOWN_IDS.join());
	let $currentRange = $rangeDropdown.find('.current-range');
	let $rangeDropdownItem = $rangeDropdown.find('.dropdown-item');
	$rangeDropdownItem.off('click').on('click', onClick);
	onClick.call($rangeDropdownItem[0]);

	function onClick() {
		let rangeId = $(this).attr('data-range');
		if (rangeId == CUSTOM)
			return customRangeDlg.show((from, to) => {
				from = dateTime.getStartOfDay(from);
				to = dateTime.getEndOfDay(to);

				$currentRange.text(dateTime.getMMDD(from) + ' ~ ' + dateTime.getMMDD(to));
				setCustomRange(from, to);
			});

		$currentRange.text($(this).text());
		setRange(rangeId);
	}
}
function getRangeDescription() {
	return String($(DROPDOWN_IDS[0]).find('.current-range').text());
}

/** @param {string} _rangeId */
function setRange(_rangeId) {
	let rangeId = parseInt(_rangeId);
	if (isNaN(rangeId)) return;

	// from and to are start of today and end of today by default
	let from = dateTime.getStartOfDay();
	let to = dateTime.getEndOfDay(from);

	if (rangeId < 10) {
		// Recent xx days
		if (!(rangeId in RECENT_DAYS))
			return console.error(`FATAL: ${rangeId} is not a valid RECENT_DAYS`);
		from = dateTime.subtractDays(from, RECENT_DAYS[rangeId] - 1);

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
		return; // invalid
	}

	filter.to = to;
	filter.from = from;
	notifySubscribers();
}
function setCustomRange(from ,to) {
	filter.from = from;
	filter.to = to;
	notifySubscribers();
}

/** @param {string} repo */
function setVCSRepo(repo) {
	filter.vcsRepo = repo;
	notifySubscribers();
}
function notifySubscribers() {
	let debug = `report filter: [${dateTime.getYYYYMMDD(filter.from)}, ${dateTime.getYYYYMMDD(filter.to)}]`;
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
	getFilter,
	getRangeDescription
};
