module.exports = {
	formatTime: (hours = 0, minutes = 0, seconds = 0) => {
		let result = [];
		if (hours > 0) result.push(hours == 1 ? '1h' : `${hours}hs`);
		if (minutes > 0) result.push(minutes == 1 ? '1min' : `${minutes}mins`);
		if (seconds > 0) result.push(seconds == 1 ? '1sec' : `${seconds}secs`);
		if (result.length == 0)
			return `0`;
		return result.join(' ');
	},
	daysOfTheWeek: ['Sun.', 'Mon.', 'Tue.', 'Wed.', 'Thu.', 'Fri.', 'Sat.'],
};
