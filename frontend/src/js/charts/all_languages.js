//@ts-check
/// <reference path="../index.d.ts" />

let {
	convertUnit2Hour,
	getReadableTimeString,
	orderByWatchingTime,
	object2array,
	getEachFieldToFixed2,
} = require('../utils/utils'), {
	createEChartsSeries,
	GRID_NORMAL
} = require('../utils/echartsUtils');

const SELECTOR = '#chartAllLangs',
	DIALOG_SELECTOR = '#dlgAllLangs';

const CLASS_RANGE_DEFAULT = 'btn-default',
	CLASS_RANGE_SELECTED = 'btn-success';

const COLORS = ['#a5d6a7', '#80cbc4', '#90caf9', '#80deea', '#ef9a9a', '#ffcc80', '#bcaaa4'],
	COLOR_OTHER = '#b0bec5';

function getColors(range) {
	if (!range) return COLORS;
	let result = [];
	for (let i = 0; i < range; i++) result.push(COLORS[i % COLORS.length]);
	result.push(COLOR_OTHER);
	return result;
}

function tooltipFormatter(p, ticket, set) {
	let setText = text => (setTimeout(set, 1, ticket, text), text);
	return setText(`You spent<br/> <b>${p.percent}%</b> time` +
		`<br/>(<b>${getReadableTimeString(p.value)}</b>)<br/> on ${p.name} `);
}

let $dlg = null,
	dataGroupByLanguage = null,
	range = 0;

let base = require('./_base').createBaseChartClass();
module.exports = { recommendedChartId: 'languages', init: base.init, update };

function update(data) {
	if (!$dlg) {
		$dlg = $(DIALOG_SELECTOR);
		$dlg.on('shown.bs.modal', _update);
	}
	dataGroupByLanguage = data;
	$dlg.modal();
}
function setRange(_range) {
	range = Number(_range);
	let $btns = $dlg.find('.range-block [data-range]');
	$btns.removeClass(CLASS_RANGE_SELECTED).addClass(CLASS_RANGE_DEFAULT);
	$btns.filter(`[data-range=${range}]`)
		.addClass(CLASS_RANGE_SELECTED).removeClass(CLASS_RANGE_DEFAULT);
	_update();
}
function _update() {
	let data = convertUnit2Hour(dataGroupByLanguage),
		array = orderByWatchingTime(object2array(data), true/*DESC*/);
	
	if (range) {
		let i0 = range, i1 = array.length;
		for (let i = i0 + 1; i < i1; i++) {
			array[i0].watching += array[i].watching;
			array[i0].coding += array[i].coding;
		}
		if (i1 > i0) {
			array[i0].name = 'other';
			array.length = i0 + 1;
		}
	}	
	
	let langNames = array.map(it => it.name);
	base.getCharts().setOption({
		legend: { orient: 'vertical', x: 'right', data: langNames },
		color: getColors(range),
		grid: GRID_NORMAL,
		tooltip: { trigger: 'item', formatter: tooltipFormatter },
		series: [
			createEChartsSeries('pie', 'watching')
				.setLabelBold()	
				.setLabels(langNames)
				.setValues(getEachFieldToFixed2(array, 'watching'))
				.toObject()
		]
	});
}
