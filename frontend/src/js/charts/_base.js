//@ts-check
/// <reference path="../index.d.ts" />

/**
 * @param {(charts: EChartsInstance) => any} [afterInit=null] 
 * @returns  
 */
function createBaseChartClass(afterInit = null) {
	/**
	 * @type {EChartsInstance}
	 */
	let charts = null;
	/**
	 * @type {HTMLElement}
	 */
	let domCache = null;

	function init(dom) {
		domCache = dom;
		if (charts && !charts.isDisposed()) {
			charts.dispose();
			charts = null;
		}
		charts = echarts.init(dom);
		afterInit && afterInit(charts);
		return charts;
	}

	return { init, getCharts: () => charts, getDOM: () => domCache };
}	

module.exports = { createBaseChartClass };