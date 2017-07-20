let {
	getReadableTimeString,
} = require('./utils');

module.exports = {
	createEChartsSeries,
	AXIS_HOURS: { axisLabel: { formatter: value => getReadableTimeString(value) } },
	AXIS_MINUTES: { axisLabel: { formatter: '{value} mins' } },
	GRID_NORMAL: { left: '20', right: '20', bottom: '10', top: '10', containLabel: true },
	GRID_HORIZON_BAR: {left: '10', right: '20', bttom: '5', top: '5', containLabel: true}
};

/**
 * @param {string} type 
 * @param {string} name 
 * @returns  {EChartsSeriesCreator}
 */
function createEChartsSeries(type, name) {
	let chains = {};
	let object = { type, name };
	let exportFunctions = {
		showMaxMarkPoint: name => object.markPoint = { data: [{ type: 'max', name }] },
		showAverageLine: name => object.markLine = { data: [{ type: 'average', name }] },
		setLineSmooth: () => object.smooth = true,

		setLineColor: color => object.lineStyle = { normal: { color } },
		setItemColor: color => object.itemStyle = { normal: { color } },
		setAreaColor: color => object.areaStyle = { normal: { color } },

		setTooltip: formatter => object.tooltip = { formatter },
		setLabelBold: () => object.label = { normal: { textStyle: { fontWeight: 'bold' } } },
		
		setLabels: labels => object.data
			? object.data.forEach((it, i) => it.name = labels[i])
			: (object.data = labels.map(name => ({ name }))),
		setValues: values => object.data
			? object.data.forEach((it, i) => it.value = values[i])
			: (object.data = values.map(value => ({ value }))),
		
		add: (...options) => $.extend(true, object, ...options)
	};

	chains.toObject = () => object;
	for (let name in exportFunctions)
		chains[name] = (...p) => (exportFunctions[name](...p), chains);
	return chains;
}