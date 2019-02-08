//@ts-check

const lodashSet = require('lodash/set');
const lodashGet = require('lodash/get');
const lodashMerge = require('lodash/merge');
const { getReadableTime, ONE_HOUR, ONE_MINUTE } = require('./datetime');

module.exports = {
	createSeries,
	createEachDurationAxis,
	createTotalDurationAxis,
	createTotalDurationXAxisForBar,
	createPaddingGrid,
};

function createPaddingGrid(top, right, bottom, left, containLabel = true, addons = null) {
	let result = { left, right, bottom, top, containLabel };
	return addons ? Object.assign(result, addons) : result;
}

/** number unit: ms */
function createEachDurationAxis(maxDuration = 0, limitIntoOneHour = false, addons = null) {
	const NO_HOUR = maxDuration < 2 * ONE_HOUR || limitIntoOneHour;
	const BASE = {
		axisLabel: {
			formatter: value => value == 0 ? '' : getReadableTime(value, NO_HOUR)
		}
	};
	let interval = 0, max = 0;
	if (NO_HOUR) {
		interval = 15 * ONE_MINUTE;
		max = limitIntoOneHour ? ONE_HOUR : (2 * ONE_HOUR);
	} else {
		if (maxDuration < 6 * ONE_HOUR) { interval = ONE_HOUR; max = 8 * ONE_HOUR; }
		else if (maxDuration < 10 * ONE_HOUR) { interval = 2 * ONE_HOUR; max = 12 * ONE_HOUR; }
		else { interval = 3 * ONE_HOUR; max = 24 * ONE_HOUR; }
	}
	BASE.max = max; BASE.interval = interval;
	return Object.assign({}, BASE, addons || {});
}

/** number unit: ms */
function createTotalDurationAxis(maxDuration = 0, addons = null) {
	const CUT = 5;
	const NO_HOUR = maxDuration < 2 * ONE_HOUR;
	const BASE = {
		axisLabel: {
			formatter: value => value == 0 ? '' : getReadableTime(value, NO_HOUR)
		}
	};
	let interval = 15 * ONE_MINUTE, max = 2 * ONE_HOUR;
	if(!NO_HOUR) {
		let hours = Math.ceil(maxDuration / ONE_HOUR);
		max = hours * ONE_HOUR;
		interval = Math.ceil(hours / CUT) * ONE_HOUR;
	}
	BASE.max = max; BASE.interval = interval;
	return Object.assign({}, BASE, addons || {});
}
function createTotalDurationXAxisForBar(maxDuration = 0) {
	return createTotalDurationAxis(maxDuration,
		{ type: 'value', nameLocation: 'end', position: 'top' });
}


function createSeries(type = '', name = '') {
	/** @type {any} */
	const object = { type, name };
	const chains = {
		setLabels, setValues,
		add, toObject,
		showMaxMarkPoint,
		showAverageLine,
		setLineSmooth,
		setMarkPointAsWideRect,
		setLineColor,
		setItemColor,
		setAreaColor,
		setTooltip,
		setLabelFormatter,
		setLabelBold,
	};
	return chains;

	/** @returns {EChartSeriesItem} */
	function toObject() { return object; }

	function setLabels(labels) {
		object.data
			? object.data.forEach((it, i) => it.name = labels[i])
			: (object.data = labels.map(name => ({ name })));
		return chains;
	}
	function setValues(values) {
		object.data
			? object.data.forEach((it, i) => it.value = values[i])
			: (object.data = values.map(value => ({ value })));
		return chains;
	}
	function add(...options) {
		lodashMerge(object, ...options);
		return chains;
	}

	function showMaxMarkPoint(name, formatter = null, addons = null) {
		let value = { type: 'max', name };
		if (formatter) value.label = { normal: { formatter } };
		if (addons) value = Object.assign(value, addons);

		const data = lodashGet(object, ['markPoint', 'data']);
		if (Array.isArray(data)) data.push(value);
		else lodashSet(object, ['markPoint', 'data'], [value]);
		return chains;
	}
	function showAverageLine(name, formatter = null, addons = null) {
		let value = { type: 'average', name };
		if (formatter) value.label = { normal: { formatter } };
		if (addons) value = Object.assign(value, addons);

		const data = lodashGet(object, ['markLine', 'data']);
		if (Array.isArray(data)) data.push(value);
		else lodashSet(object, ['markLine', 'data'], [value]);
		return chains;
	}
	function setLineSmooth() {
		object.smooth = true;
		return chains;
	}
	function setMarkPointAsWideRect() {
		lodashSet(object, ['markPoint', 'symbol'], 'rect');
		lodashSet(object, ['markPoint', 'symbolSize'], [80, 30]);
		lodashSet(object, ['markPoint', 'symbolOffset'], [0, '-60%']);
		return chains;
	}
	function setLineColor(color) {
		lodashSet(object, ['lineStyle', 'normal', 'color'], color);
		return chains;
	}
	function setItemColor(color) {
		lodashSet(object, ['itemStyle', 'normal', 'color'], color);
		return chains;
	}
	function setAreaColor(color) {
		lodashSet(object, ['areaStyle', 'normal', 'color'], color);
		return chains;
	}
	function setTooltip(formatter) {
		lodashSet(object, ['tooltip', 'formatter'], formatter);
		return chains;
	}
	function setLabelFormatter(formatter) {
		lodashSet(object, ['label', 'normal', 'formatter'], formatter);
		return chains;
	}
	function setLabelBold() {
		lodashSet(object, ['label', 'normal', 'textStyle', 'fontWeight'], 'bold');
		return chains;
	}
}
