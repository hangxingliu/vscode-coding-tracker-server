//@ts-check

let { getReadableTime, ONE_HOUR, ONE_MINUTE } = require('./datetime');

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
	let object = { type, name };
	let originalChains = { setLabels, setValues, add, toObject };
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
	function add(...options) { $.extend(true, object, ...options); return chains; }
	/** @returns {EChartSeriesItem} */
	function toObject() { return object; }

	//#region !!! WARNING !!!  Generated codes block

	let chains = Object.assign({
		showMaxMarkPoint,
		showAverageLine,
		setLineSmooth,
		setMarkPointAsWideRect,
		setLineColor,
		setItemColor,
		setAreaColor,
		setTooltip,
		setLabelFormatter,
		setLabelBold
	}, originalChains);
	return chains;

	function showMaxMarkPoint(name, formatter = null, addons = null) {
		let _value = Object.assign({ type: 'max', name },  formatter ? { label: { normal: { formatter } } } : {}, addons || {});
		if(!object.markPoint) object.markPoint = { data : [ _value ] };
		else if(!object.markPoint.data ) object.markPoint.data  = [ _value ];
		else object.markPoint.data .push(_value);

		return chains;
	}
	function showAverageLine(name, formatter = null, addons = null) {
		let _value = Object.assign({ type: 'average', name },  formatter ? { label: { normal: { formatter } } } : {}, addons || {});
		if(!object.markLine) object.markLine = { data : [ _value ] };
		else if(!object.markLine.data ) object.markLine.data  = [ _value ];
		else object.markLine.data .push(_value);

		return chains;
	}
	function setLineSmooth() {
		object.smooth = true;

		return chains;
	}
	function setMarkPointAsWideRect() {
		if(!object.markPoint) object.markPoint = { symbol : 'rect' };
		else object.markPoint.symbol  = 'rect';
		object.markPoint.symbolSize = [80, 30];
		object.markPoint.symbolOffset = [0, '-60%'];

		return chains;
	}
	function setLineColor(color) {
		if(!object.lineStyle) object.lineStyle = { normal: { color } };
		else if(!object.lineStyle.normal) object.lineStyle.normal = { color };
		else object.lineStyle.normal.color = color;

		return chains;
	}
	function setItemColor(color) {
		if(!object.itemStyle) object.itemStyle = { normal: { color } };
		else if(!object.itemStyle.normal) object.itemStyle.normal = { color };
		else object.itemStyle.normal.color = color;

		return chains;
	}
	function setAreaColor(color) {
		if(!object.areaStyle) object.areaStyle = { normal: { color } };
		else if(!object.areaStyle.normal) object.areaStyle.normal = { color };
		else object.areaStyle.normal.color = color;

		return chains;
	}
	function setTooltip(formatter) {
		if(!object.tooltip) object.tooltip = { formatter };
		else object.tooltip.formatter = formatter;

		return chains;
	}
	function setLabelFormatter(formatter) {
		if(!object.label) object.label = { normal: { formatter } };
		else if(!object.label.normal) object.label.normal = { formatter };
		else object.label.normal.formatter = formatter;

		return chains;
	}
	function setLabelBold() {
		if(!object.label) object.label = { normal: { textStyle: { fontWeight: 'bold' } } };
		else if(!object.label.normal) object.label.normal = { textStyle: { fontWeight: 'bold' } };
		else if(!object.label.normal.textStyle) object.label.normal.textStyle = { fontWeight: 'bold' };
		else object.label.normal.textStyle.fontWeight = 'bold';

		return chains;
	}

	//#endregion !!! WARNING !!!  Generated codes block
}
