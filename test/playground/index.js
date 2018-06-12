//@ts-check

/**
 * Test script for analyzer V1
 */

let AnalyzeCore = require('../../lib/analyze/AnalyzeCore'),
	{ GroupBy } = AnalyzeCore;

let today = new Date(),
	startDate = new Date(today),
	days = 7;
startDate.setDate(startDate.getDate() - days + 1);

let analyze = new AnalyzeCore(`${process.env.HOME}/.coding-tracker`);
analyze.setGroupBy(GroupBy.PROJECT)
if (analyze.analyze(startDate, today)) {
	console.log(analyze.getResult());
} else {
	console.error(analyze.getError());
}
