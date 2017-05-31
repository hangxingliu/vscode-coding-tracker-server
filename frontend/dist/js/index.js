(function e(t, n, r) {
	function s(o, u) {
		if (!n[o]) {
			if (!t[o]) {
				var a = typeof require == "function" && require;if (!u && a) return a(o, !0);if (i) return i(o, !0);var f = new Error("Cannot find module '" + o + "'");throw f.code = "MODULE_NOT_FOUND", f;
			}var l = n[o] = { exports: {} };t[o][0].call(l.exports, function (e) {
				var n = t[o][1][e];return s(n ? n : e);
			}, l, l.exports, e, t, n, r);
		}return n[o].exports;
	}var i = typeof require == "function" && require;for (var o = 0; o < r.length; o++) s(r[o]);return s;
})({ 1: [function (require, module, exports) {
		function Charts() {
			let Utils = require('./utils');
			//configurations
			const GREEN_LINE = { itemStyle: { normal: { color: '#66bb6a' } }, lineStyle: { normal: { color: '#66bb6a' } } },
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
			COLOR_PALETTE_1 = ['#a5d6a7', '#80cbc4', '#90caf9', '#80deea', '#ef9a9a', '#fff59d', '#ffcc80', '#bcaaa4', '#b0bec5'],

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
				xText.forEach(key => (codingTimeValues.push(data[key].coding), watchingTimeValues.push(data[key].watching)));
				echartsSummary.setOption({
					xAxis: { data: xText },
					yAxis: group(AXIS_LABEL_HOURS, { boundaryGap: [0, 0.2] }),
					grid: NORMAL_GRID,
					tooltip: { trigger: 'axis' },
					series: [Utils.genLineChartSeriesOption('Watching time', watchingTimeValues, group(SMOOTH, GREEN_AREA, GREEN_LINE, MAX_MARK_POINT, AVERAGE_LINE)), Utils.genLineChartSeriesOption('Coding time', codingTimeValues, group(SMOOTH, DARK_GREEN_AREA, DARK_GREEN_LINE, MAX_MARK_POINT, AVERAGE_LINE))]
				});
			};

			this.setLast24HsData = dataGroupByHour => {
				var data = Utils.convertGroupByDataUnit2Minutes(dataGroupByHour),
				    xText = Object.keys(data).sort(),
				    codingTimeValues = [],
				    watchingTimeValues = [];
				xText.forEach(key => (codingTimeValues.push(data[key].coding), watchingTimeValues.push(data[key].watching)));
				xText = xText.map(v => v.slice(11));
				echartsLast24Hs.setOption({
					xAxis: { data: xText },
					yAxis: group(AXIS_LABEL_MINUTES, { boundaryGap: [0, 0.2] }),
					grid: NORMAL_GRID,
					tooltip: { trigger: 'axis' },
					series: [Utils.genLineChartSeriesOption('Watching time', watchingTimeValues, group(SMOOTH, BLUE_AREA, BLUE_LINE, MAX_MARK_POINT, AVERAGE_LINE)), Utils.genLineChartSeriesOption('Coding time', codingTimeValues, group(SMOOTH, DARK_BLUE_AREA, DARK_BLUE_LINE, MAX_MARK_POINT, AVERAGE_LINE))]
				});
			};

			this.setComputerData = dataGroupByComputer => {
				var data = Utils.convertGroupByDataUnit2Hour(dataGroupByComputer);
				var xText = Object.keys(dataGroupByComputer).sort((a, b) => data[a].watching - data[b].watching),
				    watchingTimeValues = [];
				xText.forEach(name => watchingTimeValues.push({ name, value: data[name].watching }));
				echartsComputer.setOption({
					color: COLOR_PALETTE_2,
					grid: NORMAL_GRID,
					tooltip: { trigger: 'item' },
					series: [Utils.genPieSeriesOption('Watching time', watchingTimeValues, {})]
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
					series: [Utils.genPieSeriesOption('Watching time', watchingTimeValues, {})]
				});
			};

			this.setProjectData = dataGroupByProject => {
				var data = Utils.convertGroupByDataUnit2Hour(dataGroupByProject);
				var y = Object.keys(dataGroupByProject).sort((a, b) => data[a].watching - data[b].watching).slice(-6),
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
					series: [Utils.genBarSeriesOption('Watching time', watchingTimeValues, group(YELLOW_BAR))]
				});
			};

			this.setFileData = dataGroupByFile => {
				var data = Utils.convertGroupByDataUnit2Hour(dataGroupByFile);
				var y = Object.keys(dataGroupByFile).sort((a, b) => data[a].watching - data[b].watching).slice(-6);
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
					series: [Utils.genBarSeriesOption('Watching time', watchingTimeValues, group(PURPLE_BAR))]
				});
			};

			function group() {
				var args = [true, {}];
				for (var i = 0; i < arguments.length; i++) args.push(arguments[i]);
				return $.extend(...args);
			}
		}
		module.exports = Charts;
	}, { "./utils": 4 }], 2: [function (require, module, exports) {
		(function (global) {
			//@ts-check
			/// <reference path="type.d.ts" />

			function App() {
				let Utils = require('./utils'),
				    LoadingDialog = require('./loadingDialog'),
				    Charts = require('./charts'),
				    { displayVersionInfo } = require('./version');

				var reportDays = 7,
				    reportProject = null;

				//get API token passing by query string
				var APIToken = (location.href.match(/[\?\&]token\=(.+?)(\&|$)/) || ['', ''])[1];

				var baseURL = '/ajax/report',
				    getBaseReportDataURL = () => `${baseURL}/recent?days=${reportDays}&token=${APIToken}`,
				    getLast24HoursDataURL = now => `${baseURL}/last24hs?ts=${now}&token=${APIToken}`;
				// getProjectReportDataURL = () => `${baseURL}/project?project=${reportProject}&days=${reportDays}&token=${APIToken}`;

				/**
    * @type {ClassLoadingDialog}
    */
				let loadingDialog = new LoadingDialog($('#statusDialog'));

				let $reportDateRange = $('#selectReportDateRange');
				let charts = new Charts();

				$reportDateRange.on('change', startAjaxGetBaseReportData);

				startAjaxGetBaseReportData();
				startAjaxGetLast24HoursData();
				displayVersionInfo();

				function startAjaxGetBaseReportData() {
					reportDays = Number($reportDateRange.val());

					loadingDialog.loading();
					$.ajax({
						method: 'GET',
						url: getBaseReportDataURL(),
						success: data => handlerBaseReportData(data),
						error: data => loadingDialog.failed(data)
					});
				}

				function startAjaxGetLast24HoursData() {
					var now = Date.now();
					$.ajax({
						method: 'GET',
						url: getLast24HoursDataURL(now),
						success: data => handler(data),
						error: data => loadingDialog.failed(data)
					});

					function handler(data) {
						charts.setLast24HsData(Utils.expandAndShortGroupByHoursObject(data.groupBy.hour, now));
						//last 24 hours counter
						var totalData = Utils.convertGroupByDataUnit2Hour({ total: data.total }).total;
						$('#counterLast24Hs').html(`total: watching time: <b>${totalData.watching}</b> hs. coding time: <b>${totalData.coding}</b> hs`);
					}
				}

				function handlerBaseReportData(data) {

					if (data.error) return loadingDialog.failed($.extend(true, data, {
						tip: 'You can visit private report page by passing token like this: ' + '`http://domain:port/report/?token=${YOUR TOKEN}`' }));

					//-----------show summary chart--------
					var today = new Date();
					var startDate = new Date(today);
					startDate.setDate(startDate.getDate() - reportDays + 1);
					var groupByDayData = $.extend(true, {}, data.groupBy.day);
					var data1 = Utils.expandGroupByDaysObject(groupByDayData, startDate, today);
					charts.setSummaryData(data1);

					//summary counter
					var totalData = Utils.convertGroupByDataUnit2Hour({ total: data.total }).total;
					$('#counterSummary').html(`total: watching time: <b>${totalData.watching}</b> hs. coding time: <b>${totalData.coding}</b> hs`);

					//-------------------------------------

					//-----------computer chart------------
					charts.setComputerData(data.groupBy.computer);
					//-------------------------------------
					charts.setLanguageData(data.groupBy.language);

					charts.setProjectData(data.groupBy.project);

					charts.setFileData(data.groupBy.file);

					loadingDialog.hide();
				}
			}
			global.app = new App();
		}).call(this, typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {});
	}, { "./charts": 1, "./loadingDialog": 3, "./utils": 4, "./version": 5 }], 3: [function (require, module, exports) {
		//@ts-check
		function LoadingDialog(loadStatusDlgJQDom) {
			var $dlg = loadStatusDlgJQDom,
			    $title = $dlg.find('.modal-title'),
			    $loading = $dlg.find('.alert-info'),
			    $error = $dlg.find('.alert-danger'),
			    $errorReason = $error.find('code'),
			    show = () => $dlg.modal({ keyboard: false, backdrop: 'static' }),
			    hide = () => $dlg.modal('hide');

			this.loading = () => {
				$title.text('Loading report...');
				$loading.show();
				$error.hide();
				show();
			};

			this.failed = error => {
				$title.text('Load Failed!');
				$loading.hide();
				$error.show();
				$errorReason.html(JSON.stringify(error, null, '  '));
				show();
			};

			this.hide = hide;
		}
		module.exports = LoadingDialog;
	}, {}], 4: [function (require, module, exports) {
		let Utils = {
			log: data => (console.log(data), data),

			to2: num => num == 0 ? '00' : num < 10 ? `0${num}` : `${num}`,

			date2dateString: date => `${date.getFullYear()}-${Utils.to2(date.getMonth() + 1)}-${Utils.to2(date.getDate())}`,
			date2dateHourString: date => `${Utils.date2dateString(date)} ${Utils.to2(date.getHours())}:00`,

			getZeroTimeObject: () => ({ coding: 0, watching: 0 }),

			expandGroupByDaysObject: (obj, startDate, endDate) => {
				startDate = new Date(startDate);
				if (startDate.getTime() > endDate.getTime()) throw new Error('startDate could not bigger than endDate');
				var endDateString = Utils.date2dateString(endDate),
				    cursorDateString = '';
				var result = {};
				do {
					cursorDateString = Utils.date2dateString(startDate);
					result[cursorDateString] = obj[cursorDateString] || Utils.getZeroTimeObject();
					startDate.setDate(startDate.getDate() + 1);
				} while (endDateString > cursorDateString);
				return result;
			},
			expandAndShortGroupByHoursObject: (obj, dayDate) => {
				var result = {},
				    i = 24,
				    cursorDate = new Date(dayDate),
				    cursorDateString = '';
				while (i--) {
					cursorDateString = Utils.date2dateHourString(cursorDate);
					result[cursorDateString] = obj[cursorDateString] || Utils.getZeroTimeObject();
					cursorDate.setHours(cursorDate.getHours() - 1);
				}
				return result;
			},

			convertGroupByDataUnit2Hour: data => {
				const MS_1_HOUR = 3600 * 1000;
				for (var key in data) {
					var item = data[key];
					item.coding = (item.coding / MS_1_HOUR).toFixed(2);
					item.watching = (item.watching / MS_1_HOUR).toFixed(2);
				}
				return data;
			},
			convertGroupByDataUnit2Minutes: data => {
				const MS_1_MIN = 60 * 1000;
				for (var key in data) {
					var item = data[key];
					item.coding = (item.coding / MS_1_MIN).toFixed(2);
					item.watching = (item.watching / MS_1_MIN).toFixed(2);
				}
				return data;
			},

			genLineChartSeriesOption: (name, data, extendOption) => $.extend(true, extendOption || {}, { name, data, type: 'line' }),
			genPieSeriesOption: (name, data, extendOption) => $.extend(true, extendOption || {}, { name, data, type: 'pie' }),
			genBarSeriesOption: (name, data, extendOption) => $.extend(true, extendOption || {}, { name, data, type: 'bar' })

		};
		module.exports = Utils;
	}, {}], 5: [function (require, module, exports) {
		//@ts-check
		function displayVersionInfo() {
			$.get('/', versionInfo => {
				$('#versionServer').text(versionInfo.serverVersion);
				$('#versionStorage').text(versionInfo.storageVersion);
			});
		}
		module.exports = { displayVersionInfo };
	}, {}] }, {}, [2]);
//# sourceMappingURL=index.js.map