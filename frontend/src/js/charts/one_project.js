//@ts-check
/// <reference path="../index.d.ts" />

let {
	convertUnit2Hour,
	orderByWatchingTime,
	orderByName,
	object2array,
	getEachFieldToFixed2,
	expandGroupByDaysObject,
	getShortProjectName,
	merge
} = require('../utils'), {
	createEChartsSeries,
	AXIS_HOURS,
	GRID_NORMAL,
} = require('../echartsUtils'), {
	fill
} = require('../form');

const SELECTOR_0 = '#chartOneProjectDays',
	// TODO: add language report in one project	
	// SELECTOR_1 = '#chartOneProjectLanguages',
	SELECTOR_2 = '#chartOneProjectFiles',
	DIALOG_SELECTOR = '#dlgOneProject';

const CLASS_RANGE_DEFAULT = 'btn-default',
	CLASS_RANGE_SELECTED = 'btn-primary';

function tooltipFormatter0(p, ticket, set){
	let setText = text => (setTimeout(set, 1, ticket, text), text);
	if (p.componentType == 'markLine') //average
		return setText(`Average ${p.seriesName} for <b>${p.value}</b> hours`);
	else if (p.componentType == 'markPoint')
		return setText(`Longest ${p.seriesName} for <b>${p.value}</b> hours` +
			`<br/>in ${dateLabels[p.data.coord[0]]}`)
	else if (Array.isArray(p) && p.length == 2)
		return setText(`In ${p[0].name}:<br/>` +
			p.map(it => `${it.seriesName} for <b>${it.value}</b> hours`).join('<br/>'));
	return setText(null);
}

function tooltipFormatter2(p, ticket, set) {
	let setText = text => (setTimeout(set, 1, ticket, text), text);
	let i = p.dataIndex;
	if (i >= fileNames.length) return setText(null);
	return setText(`You spent<br/> (<b>${p.value}</b> hours)<br/> on <u>${fileNames[i]}</u>`);
}

/**
 * @type {EChartsObject}
 */
let charts0 = null, /*charts1 = null,*/ charts2 = null;
let $dlg = null;
/**
* @type {APIResponse}
*/
let allData = null;
let reportDays = 7, projName = '', projPath = '',
	filesRange = 10;

let dateLabels = [], fileNames = [];

module.exports = { update, setRange };
function update(data, _reportDays) {
	if (!$dlg) {
		$dlg = $(DIALOG_SELECTOR);
		$dlg.on('shown.bs.modal', () => {
			projPath = decodeURIComponent(Object.keys(data.groupBy.project)[0]);
			projName = getShortProjectName(projPath);
			fill($dlg, {projName, projPath, reportDays: _reportDays})
			
			updateDaysReport();
			updateFilesReport();
		});
	}
	allData = data;
	reportDays = _reportDays;
	$dlg.modal();
}
function setRange(range) {
	filesRange = Number(range);
	let $btns = $dlg.find('.range-block [data-range]');
	$btns.removeClass(CLASS_RANGE_SELECTED).addClass(CLASS_RANGE_DEFAULT);
	$btns.filter(`[data-range=${range}]`)
		.addClass(CLASS_RANGE_SELECTED).removeClass(CLASS_RANGE_DEFAULT);
	updateFilesReport();
}
//==============================
//         Charts
//==============================

function updateDaysReport() {
	if (!charts0) charts0 = echarts.init($(SELECTOR_0)[0]);

	let today = new Date(),
		startDate = new Date(today);
	startDate.setDate(startDate.getDate() - reportDays + 1);
		
	let groupByDayData = $.extend(true, {}, allData.groupBy.day),
		summaryData = expandGroupByDaysObject(groupByDayData, startDate, today);

	let data = convertUnit2Hour(summaryData),
		array = orderByName(object2array(data));
	dateLabels = array.map(it => it.name);
	console.log(groupByDayData);
	
	charts0.setOption({
		xAxis: { data: dateLabels },
		yAxis: merge(AXIS_HOURS, { boundaryGap: [0, 0.2] }),
		grid: GRID_NORMAL,
		tooltip: { trigger: 'axis', formatter: tooltipFormatter0 },
		series: [
			createEChartsSeries('line', 'watching')
				.showMaxMarkPoint('max time')
				.showAverageLine('average time')
				.setLineSmooth()
				.setLineColor('#66bb6a')
				.setItemColor('#66bb6a')
				.setAreaColor('#c8e6c9')
				.setValues(getEachFieldToFixed2(array, 'watching'))
				.toObject(),
			createEChartsSeries('line', 'coding')
				.showMaxMarkPoint('max time')
				.showAverageLine('average time')
				.setLineSmooth()
				.setLineColor('#1b5e20')
				.setItemColor('#1b5e20')
				.setAreaColor('#388e3c')
				.setValues(getEachFieldToFixed2(array ,'coding'))
				.toObject()
		]
	});
}

function updateFilesReport() {
	if (!charts2) charts2 = echarts.init($(SELECTOR_2)[0]);
	let data = convertUnit2Hour(allData.groupBy.file),
		array = orderByWatchingTime(object2array(data)),
		displayFileNames = [];
	if (filesRange) array = array.slice(-filesRange);

	let height = array.length * 50;
	$(SELECTOR_2).height(height);
	charts2.resize({ height });

	fileNames = array.map(it => decodeURIComponent(it.name));
	displayFileNames = fileNames.map((name, i) =>
		name + ` (${Number(array[i].watching).toFixed(2)} hs)`);
	
	charts2.setOption({
		legend: { data: [''] },
		xAxis: {
			type: 'value', nameLocation: 'end', position: 'top',
			axisTick: { show: false }, axisLabel: AXIS_HOURS.axisLabel },
		yAxis: {
			type: 'category', nameLocation: 'start',
			// interval: 0 for force display all label
			axisTick: { show: false }, axisLabel: { inside: true, interval: 0 }, z: 2048,
			data: displayFileNames },
		grid: GRID_NORMAL,
		tooltip: { trigger: 'item', formatter: tooltipFormatter2},
		series: [
			createEChartsSeries('bar', 'watching')
				.setItemColor('#E4F6FE')
				.setValues(getEachFieldToFixed2(array ,'watching'))
				.add({ itemStyle: { normal: {borderColor: '#CAEDFD'}}})
				.toObject()
		]
	});
}
