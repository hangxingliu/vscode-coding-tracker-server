//@ts-check
/// <reference path="../index.d.ts" />

let {
	orderByWatchingTime,
	object2array,
} = require('../utils/utils'),
	echarts = require('../utils/echartsUtils'),
	dateTime = require('../utils/datetime');

const COLORS = ['#a5d6a7', '#80cbc4', '#90caf9', '#80deea', '#ef9a9a', '#ffcc80', '#bcaaa4', '#b0bec5'];
const COLORS_OTHER = ['#a5d6a7', '#80cbc4', '#90caf9', '#80deea', '#ef9a9a', '#d6d6d6'];

let otherLanguages = '';
function tooltipFormatter(p, ticket, set) {
	let setText = text => (setTimeout(set, 1, ticket, text), text);
	return setText(`You spent<br/> <b>${p.percent}%</b> time` +
		`<br/>(<b>${dateTime.getReadableTime(p.value)}</b>)<br/> on ${p.name == 'other' ? otherLanguages : p.name} `);
}

let base = require('./_base').createBaseChartClass();
module.exports = { recommendedChartId: 'languages', init: base.init, update };

function update(dataGroupByLanguage) {
	let array = orderByWatchingTime(object2array(dataGroupByLanguage), true/*DESC*/);

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

	base.getCharts().setOption({
		color: i1 > i0 ? COLORS_OTHER : COLORS,
		grid: echarts.createPaddingGrid(20, 50, 0, 50),
		tooltip: { trigger: 'item', formatter: tooltipFormatter },
		series: [
			echarts.createSeries('pie', 'watching')
				.setLabelBold()
				.setLabels(array.map(it => it.name))
				.setValues(array.map(it=>it.watching))
				.toObject()
		]
	});
}
