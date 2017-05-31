function Charts() {
	let Utils = require('./utils');
	//configurations
	const
		GREEN_LINE = { itemStyle: { normal: { color: '#66bb6a' } }, lineStyle: { normal: { color: '#66bb6a' } } },
		GREEN_AREA = { areaStyle: { normal: { color: '#c8e6c9' } } },
		DARK_GREEN_LINE = { itemStyle: { normal: { color: '#1b5e20' } }, lineStyle: { normal: { color: '#1b5e20' } } },
		DARK_GREEN_AREA = { areaStyle: { normal: { color: '#388e3c' } } },
		
		BLUE_LINE = { itemStyle: { normal: { color: '#29b6f6' } }, lineStyle: { normal: { color: '#29b6f6' } } },
		BLUE_AREA = { areaStyle: { normal: { color: '#b3e5fc' } } },
		DARK_BLUE_LINE = { itemStyle: { normal: { color: '#01579b' } }, lineStyle: { normal: { color: '#01579b' } } },
		DARK_BLUE_AREA = { areaStyle: { normal: { color: '#0288d1' } } },

		YELLOW_BAR = { itemStyle: { normal: { color: '#fff59d' } } },
		PURPLE_BAR = { itemStyle: { normal: { color: '#ce93d8' } } },

		//lighten-3
		COLOR_PALETTE_1 = ['#a5d6a7', '#80cbc4', '#90caf9', '#80deea', '#ef9a9a', '#fff59d', '#ffcc80', '#bcaaa4' ,'#b0bec5'],
		//normal
		COLOR_PALETTE_2 = ['#4caf50', '#2196f3', '#ffeb3b', '#f44336', '#9c27b0', '#009688', '#ff9800', '#795548'],

		MAX_MARK_POINT = { markPoint: { data: [{ type: 'max', name: 'max time' }] } },
		AVERAGE_LINE = { markLine: { data: [{ type: 'average', name: 'average time' }] } },
		PIE_NO_LABEL = { label: { normal: { show: false } } },
		SMOOTH = { smooth: true },
		NORMAL_GRID = { left: '20', right: '20', bottom: '10', top: '10', containLabel: true },
		AXIS_LABEL_HOURS = { axisLabel: { formatter: '{value} hs' } },
		AXIS_LABEL_MINUTES = { axisLabel: { formatter: '{value} mins' } };

	var $chartSummary = $('#chartSummary'),
		$chartLast24Hs = $('#chartLast24Hs'),
		$chartComputer = $('#chartComputer'),
		$chartLanguage = $('#chartLanguage'),
		$chartProject = $('#chartProject'),
		$chartFile = $('#chartFile'),
		echartsSummary = echarts.init($chartSummary[0]),
		echartsComputer = echarts.init($chartComputer[0]),
		echartsLanguage = echarts.init($chartLanguage[0]),
		echartsProject = echarts.init($chartProject[0]),
		echartsFile = echarts.init($chartFile[0]),
		echartsLast24Hs = echarts.init($chartLast24Hs[0]);

	
	this.setSummaryData = dataGroupByDate => {
		var data = Utils.convertGroupByDataUnit2Hour(dataGroupByDate),
			xText = Object.keys(data).sort(),
			codingTimeValues = [],
			watchingTimeValues = [];
		xText.forEach(key =>
			(codingTimeValues.push(data[key].coding),
				watchingTimeValues.push(data[key].watching)));
		echartsSummary.setOption({
			xAxis: { data: xText },
			yAxis: group(AXIS_LABEL_HOURS, {boundaryGap: [0, 0.2]}),
			grid: NORMAL_GRID,
			tooltip: { trigger: 'axis' },
			series: [
				Utils.genLineChartSeriesOption('Watching time', watchingTimeValues,
					group(SMOOTH, GREEN_AREA, GREEN_LINE, MAX_MARK_POINT, AVERAGE_LINE)),
				Utils.genLineChartSeriesOption('Coding time', codingTimeValues,
					group(SMOOTH, DARK_GREEN_AREA, DARK_GREEN_LINE, MAX_MARK_POINT, AVERAGE_LINE))
			]
		});
		
	};

	this.setLast24HsData = dataGroupByHour => {
		var data = Utils.convertGroupByDataUnit2Minutes(dataGroupByHour),
			xText = Object.keys(data).sort(),
			codingTimeValues = [],
			watchingTimeValues = [];
		xText.forEach(key =>
			(codingTimeValues.push(data[key].coding),
				watchingTimeValues.push(data[key].watching)));
		xText = xText.map(v => v.slice(11));
		echartsLast24Hs.setOption({
			xAxis: { data: xText },
			yAxis: group(AXIS_LABEL_MINUTES, {boundaryGap: [0, 0.2]}),
			grid: NORMAL_GRID,
			tooltip: { trigger: 'axis' },
			series: [
				Utils.genLineChartSeriesOption('Watching time', watchingTimeValues,
					group(SMOOTH, BLUE_AREA, BLUE_LINE, MAX_MARK_POINT, AVERAGE_LINE)),
				Utils.genLineChartSeriesOption('Coding time', codingTimeValues,
					group(SMOOTH, DARK_BLUE_AREA, DARK_BLUE_LINE, MAX_MARK_POINT, AVERAGE_LINE))
			]
		});
	};


	this.setComputerData = dataGroupByComputer => {
		var data = Utils.convertGroupByDataUnit2Hour(dataGroupByComputer);
		var xText = Object.keys(dataGroupByComputer).sort((a, b) => data[a].watching - data[b].watching),
			watchingTimeValues = [];
		xText.forEach(name => watchingTimeValues.push({ name, value:data[name].watching }));
		echartsComputer.setOption({
			color: COLOR_PALETTE_2,
			grid: NORMAL_GRID,
			tooltip: { trigger: 'item' },
			series: [
				Utils.genPieSeriesOption('Watching time', watchingTimeValues, {})
			]
		});
	};

	this.setLanguageData = dataGroupByLanguage => {
		var data = Utils.convertGroupByDataUnit2Hour(dataGroupByLanguage);
		var xText = Object.keys(dataGroupByLanguage).sort((a, b) => data[a].watching - data[b].watching),
			watchingTimeValues = [];
		xText.forEach(name => watchingTimeValues.push({ name, value: data[name].watching }));
		echartsLanguage.setOption({
			color: COLOR_PALETTE_2,
			grid: NORMAL_GRID,
			tooltip: { trigger: 'item' },
			series: [
				Utils.genPieSeriesOption('Watching time', watchingTimeValues, {})
			]
		});
	};

	this.setProjectData = dataGroupByProject => {
		var data = Utils.convertGroupByDataUnit2Hour(dataGroupByProject);
		var y = Object.keys(dataGroupByProject)
			.sort((a, b) => data[a].watching - data[b].watching)
			.slice(-6),	
			yText = y.map(name => decodeURIComponent(name).match(/.*(^|[\\\/])(.+)$/)[2]),
			watchingTimeValues = [];
		y.forEach(name => watchingTimeValues.push(data[name].watching));
		echartsProject.setOption({
			legend: { data: [''] },
			grid: NORMAL_GRID,
			yAxis: {
				type: 'category', name: 'Project name', nameLocation: 'start',
				axisTick: { show: false }, axisLabel: { inside: true }, z: 1024,
				data: yText
			},
			xAxis: {
				type: 'value', name: 'Watching Time', nameLocation: 'end',
				position: 'top', axisTick: { show: false }, axisLabel: AXIS_LABEL_HOURS.axisLabel
			},
			tooltip: { trigger: 'item' },
			series: [
				Utils.genBarSeriesOption('Watching time', watchingTimeValues,
					group(YELLOW_BAR))
			]
		});
	};

	this.setFileData = dataGroupByFile => {
		var data = Utils.convertGroupByDataUnit2Hour(dataGroupByFile);
		var y = Object.keys(dataGroupByFile)
			.sort((a, b) => data[a].watching - data[b].watching)
			.slice(-6);
		var yText = y.map(name => decodeURIComponent(name).match(/.*(^|[\\\/])(.+)$/)[2]),
			watchingTimeValues = [];
		y.forEach(name => watchingTimeValues.push(data[name].watching));
		echartsFile.setOption({
			legend: { data: [''] },
			grid: NORMAL_GRID,
			yAxis: {
				type: 'category', name: 'File name', nameLocation: 'start',
				axisTick: { show: false }, axisLabel: { inside: true }, z: 1024,
				data: yText
			},
			xAxis: {
				type: 'value', name: 'Watching Time', nameLocation: 'end',
				position: 'top', axisTick: { show: false }, axisLabel: AXIS_LABEL_HOURS.axisLabel
			},
			tooltip: { trigger: 'item' },
			series: [
				Utils.genBarSeriesOption('Watching time', watchingTimeValues,
					group(PURPLE_BAR))
			]
		});
	};

	
	function group() {
		var args = [true, {}];
		for (var i = 0; i < arguments.length; i++)
			args.push(arguments[i]);	
		return $.extend(...args);
	}

}
module.exports = Charts;