var Utils = {
	log: data => (console.log(data), data),

	to2: num => num == 0 ? '00' : num < 10 ? `0${num}` : `${num}`,
	
	date2dateString: date => `${date.getFullYear()}-${Utils.to2(date.getMonth() + 1)}-${Utils.to2(date.getDate())}`,

	getZeroTimeObject: () => ({ coding: 0, watching: 0 }),
	
	expandGroupByDaysObject: (obj, startDate, endDate) => {
		startDate = new Date(startDate);
		if (startDate.getTime() > endDate.getTime())
			throw new Error('startDate could not bigger than endDate');	
		var endDateString = Utils.date2dateString(endDate),	
			cursorDateString = '';
		var result = {};
		do {
			cursorDateString = Utils.date2dateString(startDate)
			result[cursorDateString] = obj[cursorDateString] || Utils.getZeroTimeObject();
			startDate.setDate(startDate.getDate() + 1);
		} while (endDateString > cursorDateString);
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

	genLineChartSeriesOption: (name, data, extendOption) => $.extend(true, extendOption || {}, { name, data, type: 'line' }),
	genPieSeriesOption: (name, data, extendOption) => $.extend(true, extendOption || {}, { name, data, type: 'pie' }),
	genBarSeriesOption: (name, data, extendOption) => $.extend(true, extendOption || {}, { name, data, type: 'bar' })
	

	
};