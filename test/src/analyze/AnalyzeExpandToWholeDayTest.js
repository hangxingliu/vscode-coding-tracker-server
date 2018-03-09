//@ts-check

let Analyzer = require('../../../lib/analyze/AnalyzeCore'),
	{ Assert } = require('../utils/Assert'),
	{ GroupBy } = Analyzer;

// 1520568000000: 2018-03-09 12:00:00 (GMT+0800 CST)
// 1520611200000: 2018-03-10 00:00:00 (GMT+0800 CST)
const NOON = new Date(1520568000000);
const NEXT_DAY = new Date(1520611200000);

// reference ../../resources/data-simulate-one-day/18309.db
const FROM_NOON_WATCHING = 41990 + 20500;
const FROM_NOON_CODING = 25000 + 10000;

// reference ../../resources/data-simulate-one-day/18309.db
const WHOLE_DAY_WATCHING = 31990 + 41990 + 20500;
const WHOLE_DAY_CODING = 20000 + 25000 + 10000;


const DB_DIR = require('path').join(__dirname, '../../resources/data-simulate-one-day');
const createAnalyzer = () => { let a = new Analyzer(DB_DIR); a.setGroupBy(GroupBy.ALL); return a; };

describe('New parameter `expandToWholeDay` in AnalyzeCore.analyze ', () => {

	it('# ignore this parameter (same as `true`)', () => {
		let analyzer1 = createAnalyzer();
		Assert(analyzer1.analyze(NOON, NEXT_DAY)).isTrue();

		let analyzer2 = createAnalyzer();
		Assert(analyzer2.analyze(NOON, NEXT_DAY, true)).isTrue();

		Assert(analyzer1.getResult()).equalsInJSON(analyzer2.getResult());

		// has working record about TODO.md in the morning although analyze from noon (expandToWholeDay)
		Assert(analyzer1.getResult())
			.field('groupBy').field('file').allKeys().sort()
			.equalsInJSON(['TODO.md', 'index.js', 'README.md',].sort());

		Assert(analyzer1.getResult()).field('total').fieldsEqual({
			coding: WHOLE_DAY_CODING,
			watching: WHOLE_DAY_WATCHING
		});

	});

	it('# set this parameter as false', () => {
		let analyzerFromNoon = createAnalyzer();
		Assert(analyzerFromNoon.analyze(NOON, NEXT_DAY, false)).isTrue();

		Assert(analyzerFromNoon.getResult()).field('total').fieldsEqual({
			coding: FROM_NOON_CODING,
			watching: FROM_NOON_WATCHING
		});

		// has working record about TODO.md in the morning although analyze from noon (expandToWholeDay)
		Assert(analyzerFromNoon.getResult())
			.field('groupBy').field('file').allKeys().sort()
			.equalsInJSON(['index.js', 'README.md',].sort());
	});
});
