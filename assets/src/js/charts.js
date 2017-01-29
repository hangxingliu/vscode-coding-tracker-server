var Charts = function () {
	//configurations
	const
		GREEN_LINE = { itemStyle: { normal: { color: '#66bb6a' } }, lineStyle: { normal: { color: '#66bb6a' } } },
		GREEN_AREA = { areaStyle: { normal: { color: '#c8e6c9' } } },
		DARK_GREEN_LINE = { itemStyle: { normal: { color: '#1b5e20' } }, lineStyle: { normal: { color: '#1b5e20' } } },
		DARK_GREEN_AREA = { areaStyle: { normal: { color: '#388e3c' } } },
		MAX_MARK_POINT = { markPoint: { data: [{ type: 'max', name: 'max time' }] } },
		AVERAGE_LINE = { markLine: { data: [{ type: 'average', name: 'average time' }] } },
		PIE_NO_LABEL = { label: { normal: { show: false } } },
		SMOOTH = { smooth: true },
		NORMAL_GRID = { left: '20', right: '20', bottom: '10', top: '10', containLabel: true };

	var $chartSummary = $('#chartSummary'),
		$chartComputer = $('#chartComputer'),
		$chartLanguage = $('#chartLanguage'),
		$chartProject = $('#chartProject'),
		$chartFile = $('#chartFile'),
		echartsSummary = echarts.init($chartSummary[0]),
		echartsComputer = echarts.init($chartComputer[0]),
		echartsLanguage = echarts.init($chartLanguage[0]),
		echartsProject = echarts.init($chartProject[0]),
		echartsFile = echarts.init($chartFile[0]);

	
	this.setSummaryData = dataGroupByDate => {
		var data = Utils.convertGroupByDataUnit2Hour(dataGroupByDate),
			xText = Object.keys(data).sort(),
			codingTimeValues = [],
			watchingTimeValues = [];
		xText.forEach(key =>
			(codingTimeValues.push(data[key].coding),
				watchingTimeValues.push(data[key].watching)));
		echartsSummary.setOption({
			legend: { data: [''] },
			xAxis: { data: xText, boundaryGap: true },
			yAxis: {},
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

	this.setComputerData = dataGroupByComputer => {
		var data = Utils.convertGroupByDataUnit2Hour(dataGroupByComputer);
		var xText = Object.keys(dataGroupByComputer).sort((a, b) => data[a].watching - data[b].watching),
			codingTimeValues = [],
			watchingTimeValues = [];
		xText.forEach(name =>
			(codingTimeValues.push({ name, value:data[name].coding }),
				watchingTimeValues.push({ name, value:data[name].watching })));
		echartsComputer.setOption({
			legend: { data: [''] },
			grid: NORMAL_GRID,
			tooltip: { trigger: 'item' },
			series: [
				Utils.genPieSeriesOption('Watching time', watchingTimeValues,
					group({radius: [0, '50%']}, PIE_NO_LABEL)),
				Utils.genPieSeriesOption('Coding time', codingTimeValues,
					group({radius: ['65%', '80%']}))
			]
		});
	};

	this.setLanguageData = dataGroupByLanguage => {
		var data = Utils.convertGroupByDataUnit2Hour(dataGroupByLanguage);
		var xText = Object.keys(dataGroupByLanguage).sort((a, b) => data[a].watching - data[b].watching),
			watchingTimeValues = [];
		xText.forEach(name => watchingTimeValues.push({ name, value: data[name].watching }));
		echartsLanguage.setOption({
			legend: { data: [''] },
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
			.slice(-6);			
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
				position: 'top', axisTick: { show: false }, axisLabel: { interval: 0, formatter: '{value} h', }
			},
			tooltip: { trigger: 'item' },
			series: [
				Utils.genBarSeriesOption('Watching time', watchingTimeValues, {})
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
				position: 'top', axisTick: { show: false }, axisLabel: { interval: 0, formatter: '{value} h', }
			},
			tooltip: { trigger: 'item' },
			series: [
				Utils.genBarSeriesOption('Watching time', watchingTimeValues, {})
			]
		});
	};

	
	function group() {
		var args = [true, {}];
		for (var i = 0; i < arguments.length; i++)
			args.push(arguments[i]);	
		return $.extend(...args);
	}

};