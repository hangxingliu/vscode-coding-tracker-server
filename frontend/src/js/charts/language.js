//@ts-check
/// <reference path="../types/index.d.ts" />

let {
	convertUnit2Hour,
	orderByWatchingTime,
	object2array,
	getEachFieldToFixed2
} = require('../utils'), {
	createEChartsSeries,
	GRID_NORMAL
} = require('../echartsUtils');

const COLORS = ['#a5d6a7', '#80cbc4', '#90caf9', '#80deea', '#ef9a9a', '#ffcc80', '#bcaaa4', '#b0bec5'];
const COLORS_OTHER = ['#a5d6a7', '#80cbc4', '#90caf9', '#80deea', '#ef9a9a', '#d6d6d6'];

const SELECTOR = '#chartLanguage';

let otherLanguages = '';
function tooltipFormatter(p, ticket, set) {
	let setText = text => (setTimeout(set, 1, ticket, text), text);
	return setText(`You spent<br/> <b>${p.percent}%</b> time` +
		`<br/>(<b>${p.value}</b> hours)<br/> on ${p.name == 'other' ? otherLanguages : p.name} `);
}

/**
 * @type {EChartsObject}
 */
let charts = null;

module.exports = { update };

function update(dataGroupByLanguage) {
	if (!charts) charts = echarts.init($(SELECTOR)[0]);

	let data = convertUnit2Hour(dataGroupByLanguage),
		array = orderByWatchingTime(object2array(data), true/*DESC*/);

	let i0 = 5, i1 = array.length;
	for (let i = i0 + 1; i < i1; i++) {
		array[i0].watching += array[i].watching;
		array[i0].coding += array[i].coding;
	}
	if (i1 > i0) {
		otherLanguages = array.slice(i0, i0 + 5).map(it => it.name).join(', ') + '...';
		array[i0].name = 'other';
		array.length = i0 + 1;
	}
	
	charts.setOption({
		color: i1 > i0 ? COLORS_OTHER : COLORS,
		grid: GRID_NORMAL,
		tooltip: { trigger: 'item', formatter: tooltipFormatter },
		series: [
			createEChartsSeries('pie', 'watching')
				.setLabelBold()	
				.setLabels(array.map(it => it.name))
				.setValues(getEachFieldToFixed2(array, 'watching'))
				.toObject()
		]
	});
}
