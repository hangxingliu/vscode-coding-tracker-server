//@ts-check

const HALF_DAY = 12 * 3600 * 1000;
const ONE_DAY = 2 * HALF_DAY;

let $dlg = $('#dlgCustomDateRange'),
	$calendar = $('#rangeCalendar');

let $txtStart = $('#rangeStart'),
	$txtEnd = $('#rangeEnd');

let $btnConfirm = $('#rangeConfirm');
let $txtStatus = $('#rangeDescription');

let hadSetupUI = false;
/** @type {(from: Date, to: Date) => any} */
let callback = null;

// $dlg.on('show.bs.modal', () => {});
// $dlg.on('shown.bs.modal', () => {});
// $dlg.on('hidden.bs.modal', () => {});

module.exports = { show };

/**
 * @param {(from: Date, to: Date) => any} _callback 
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
	let startDate = null, endDate = null;

	$calendar.datepicker({})
		.on('changeMonth', updateUI.bind(this))
		.on('changeDate', onChangeDate.bind(this));

	$txtStart.keyup(updateFromInput).blur(updateFromInput);
	$txtEnd.keyup(updateFromInput).blur(updateFromInput);
	
	$btnConfirm.click(() => {
		if (startDate == null || endDate == null)
			return;
		if (callback)
			callback(startDate, endDate);
		$dlg.modal('hide');
	})

	updateUI();

	function updateFromInput() { 
		let strStart = $txtStart.val(), strEnd = $txtEnd.val();
		let start = getDateFromString(String(strStart)),
			end = getDateFromString(String(strEnd));
		if (start == null || isFirstEarlierThenSecond(end, start))
			return $btnConfirm.addClass('disabled');	
		startDate = start;
		endDate = end;

		// let date-picker navigate to start date
		$calendar.datepicker('update', startDate);
		updateUI(true);
	}

	/** @param {DatepickerEventObject} event */
	function onChangeDate(event) { 
		let { date } = event;
		console.log('onChangeDate:', date.getTime(), yyyymmdd(date));
		if (startDate == null) {
			startDate = date;
		} else if (endDate == null) {
			if (isFirstEarlierThenSecond(date, startDate)) {
				endDate = startDate;
				startDate = date;
			} else {
				endDate = date;
			}
		} else {
			startDate = date; endDate = null;
		}
		updateUI();
	}
	function updateUI(dontUpdateInputBox = false) { 
		let dump = `datepicker - updateUI:\n` +
			`  start: ${startDate == null ? 'null' : startDate.getTime()} (${yyyymmdd(startDate)})\n` +
			`  end: ${endDate == null ? 'null' : endDate.getTime()} (${yyyymmdd(endDate)})`;
		console.log(dump);

		if (!dontUpdateInputBox) {
			$txtStart.val(yyyymmdd(startDate));
			$txtEnd.val(yyyymmdd(endDate));
		}

		let days = Math.floor(((+endDate + HALF_DAY) - (+startDate)) / ONE_DAY) + 1;
		if (startDate != null && endDate != null) {
			$txtStatus.html(`Total: <b>${days}</b> days`);
			$btnConfirm.removeClass('disabled');
		} else { 
			$txtStatus.text('');
			$btnConfirm.addClass('disabled');
		}


		if (startDate == null && endDate == null)
			return;	
		
		process.nextTick(() => {
			$calendar.find('td[data-date]').each((i, e) => {
				let $day = $(e),
					dateObj = new Date(parseInt($day.data('date')));
				let date = dateObj.getTime() + dateObj.getTimezoneOffset() * 60 * 1000;
				removeClasses($day, 'start', 'end', 'active', 'selected');
			
				let isStart = false, isEnd = false;
				if (startDate && isDateEqual(startDate, date)) 
					isStart = true, addClasses($day, 'start', 'active');	
				if (endDate && isDateEqual(endDate, date))
					isEnd = true, addClasses($day, 'end', 'active');	

				if (isStart || isEnd)
					return;	
				
				if (isDateInside(date, startDate, endDate))
					addClasses($day, 'selected');	
			});	
		});
	}	
}

/**
 * @param {JQuery} $jqDom
 * @param {string[]} classes 
 */
function addClasses($jqDom, ...classes) { 
	classes.forEach(cl => $jqDom.addClass(cl));
	return classes;
}
/**
 * @param {JQuery} $jqDom  
 * @param {string[]} classes 
 */
function removeClasses($jqDom, ...classes) { 
	classes.forEach(cl => $jqDom.removeClass(cl));
	return classes;	
}

/** @param {Date} date  */
function yyyymmdd(date) { 
	if (!date) return `--`;
	return `${date.getFullYear()}-${to2(date.getMonth() + 1)}-${to2(date.getDate())}`;
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

/**
 * @param {Date|number} date 
 * @param {Date|number} date2 
 */
function isDateEqual(date, date2) { 
	return (+date) == (+date2);
}

/**
 * @param {Date|number} first 
 * @param {Date|number} second 
 */
function isFirstEarlierThenSecond(first, second) {
	return (+first) < (+second);
}

/**
 * Is date in [leftBorder, rightBorder]
 * @param {Date|number} date 
 * @param {Date|number} leftBorder 
 * @param {Date|number} rightBorder 
 */
function isDateInside(date, leftBorder, rightBorder) { 
	let v = +date;
	if (v < +leftBorder) return false;
	if (v > +rightBorder) return false;
	return true;
}
