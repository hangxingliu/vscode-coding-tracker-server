//@ts-check
/// <reference path="../index.d.ts" />

const HALF_DAY = 12 * 3600 * 1000;
const ONE_DAY = 2 * HALF_DAY;

let $dlg = $('#dlg24HsFrom'),
	$calendar = $('#_24hsFromCalendar');

let $txtDate = $dlg.find('.from-date'),
	$txtTime = $dlg.find('.from-time');

let $btnConfirm = $('#_24hsFromConfirm');
let $txtStatus = $('#_24hsFromDescription');

let hadSetupUI = false;
/** @type {(from: Date) => any} */
let callback = null;

module.exports = { show };

/**
 * @param {(from: Date) => any} _callback
 */
function show(_callback) {
	if (!hadSetupUI) {
		hadSetupUI = true;
		setupUI();
	}
	callback = _callback;
	$dlg.modal();
}

/**
 * setting up bootstrap-date-picker as a range picker
 */
function setupUI() {
	/** @type {Date} */
	let fromDate = null;

	$calendar.datepicker({
		todayHighlight: true
	})
		.on('changeDate', onChangeDate.bind(this));

	$txtDate.keyup(updateFromInput).blur(updateFromInput);
	$txtTime.change(updateFromInput);

	$btnConfirm.click(() => {
		if (fromDate == null) return;
		if (callback) callback(fromDate);
		$dlg.modal('hide');
	})

	updateUI();

	/** @param {Date} date */
	function appendSelectedTimeToDate(date) {
		let time = String($txtTime.val()).split(':').map(v => parseInt(v));
		if (time.length != 2 || isNaN(time[0]) || isNaN(time[1]))
			time = [0, 0];

		date.setHours(time[0], time[1]);
		return date;
	}
	function updateFromInput() {
		let date = getDateFromString(String($txtDate.val()));
		if (date == null)
			return $btnConfirm.addClass('disabled');
		fromDate = appendSelectedTimeToDate(date);
		// let date-picker navigate to start date
		$calendar.datepicker('update', fromDate);
		updateUI(true);
	}

	/** @param {DatepickerEventObject} event */
	function onChangeDate(event) {
		console.log('onChangeDate:', yyyymmdd(event.date));
		fromDate = appendSelectedTimeToDate(event.date);
		updateUI();
	}

	function updateUI(dontUpdateInputBox = false) {
		console.log(`datepicker - updateUI: ${yyyymmdd(fromDate)}`);

		if (!dontUpdateInputBox)
			$txtDate.val(yyyymmdd(fromDate));

		if (fromDate != null) {
			let to = new Date(fromDate.getTime() + ONE_DAY);
			$txtStatus.html(`From <b>${mmdd_hh00(fromDate)}</b> to <b>${mmdd_hh00(to)}</b>`);
			$btnConfirm.removeClass('disabled');
			return;
		}
		$txtStatus.text('');
		$btnConfirm.addClass('disabled');
	}
}

/** @param {Date} date  */
function yyyymmdd(date) {
	if (!date) return `--`;
	return `${date.getFullYear()}-${to2(date.getMonth() + 1)}-${to2(date.getDate())}`;
}
/** @param {Date} date  */
function hh00(date) {
	if (!date) return `--`;
	return `${to2(date.getHours())}:00`;
}
/** @param {Date} date  */
function mmdd_hh00(date) {
	if (!date) return `-- -:-`;
	return `${to2(date.getMonth() + 1)}-${to2(date.getDate())} ${hh00(date)}`;
}
function to2(num) { return num < 10 ? `0${num}` : `${num}`; }


function getDateFromString(str = '') {
	str = str.trim();
	if (!str || str == '--') return null;

	let part = str.split(/\s*-\s*/);
	let y = parseInt(part[0]), m = parseInt(part[1]), d = parseInt(part[2]);
	if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
	if (y > 2038 || y < 1997 || m < 1 || m > 12 || d < 1 || d > 31) return null;

	let date = new Date(y, m - 1, d, 0, 0, 0, 0);
	// Invalid date:
	if (date.getDate() != d || date.getMonth() != m - 1) return null;
	return date;
}

