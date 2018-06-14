//@ts-check

/* TODO:  MORE CHECK POINTS */

const AnalyzerV1 = require('../../../lib/analyze/AnalyzeCore');
const AnalyzerV2 = require('../../../lib/analyze/AnalyzeCoreV2');
const FileReader = require('../../../lib/analyze/CachedDataFileReader');
const { Assert } = require('@hangxingliu/assert');

// 1528905600000: 2018-06-14 12:00:00 (GMT+0800 CST)
// 1528992000000: 2018-06-15 00:00:00 (GMT+0800 CST)
const TODAY = new Date(1528905600000);
const NEXT_DAY = new Date(1528992000000);

// ==================================================================
// reference ../../resources/data-test-better-project-merge/18614.db
const WHOLE_DAY_WATCHING = 31990 + 41990 + 20500 + 20500;
const WHOLE_DAY_CODING = 20000 + 25000 + 10000 + 10000;

const PROJ_A = '%2Fproj%2FA';
const V1_WATCHING_IN_PROJ_A = 41990 + 20500;
const V2_WATCHING_IN_PROJ_A = 41990;

const PROJ_B = '%2Fproj%2FB';
const V1_WATCHING_IN_PROJ_B = 31990;
const V2_WATCHING_IN_PROJ_B = 31990 + 20500;

const V1_FILES = ['main.cc', 'index.js', '%2Fproj%2FB%2Fmain.h', '%2Fproj%2Fsingle'].sort();
const V2_FILES = ['main.cc', 'index.js', 'main.h', '%2Fproj%2Fsingle'].sort();

// ==================================================================

const DB_DIR = require('path').join(__dirname, '../../resources/data-test-better-project-merge');
const fileReader = FileReader.createCachedDataFileReader(DB_DIR);

describe('Test better project merge behavior in AnalyzeCoreV2', () => {
	it('# shallow merge in V1', () => {
		let analyzer = new AnalyzerV1(DB_DIR);
		analyzer.setGroupBy(AnalyzerV1.GroupBy.ALL);
		Assert(analyzer.analyze(TODAY, NEXT_DAY)).isTrue();

		Assert(analyzer.getWarning()).isArray().isEmpty();

		const result = analyzer.getResult();
		Assert(result.total).fieldsEqual({ coding: WHOLE_DAY_CODING, watching: WHOLE_DAY_WATCHING });
		Assert(Object.keys(result.groupBy.file).sort()).equalsInJSON(V1_FILES);

		Assert(result.groupBy.project).child(PROJ_A).fieldsEqual({ watching: V1_WATCHING_IN_PROJ_A });
		Assert(result.groupBy.project).child(PROJ_B).fieldsEqual({ watching: V1_WATCHING_IN_PROJ_B });

		// console.log(result);
	});

	it('# better merge in V2', (then) => {
		let analyzer = new AnalyzerV2(fileReader);
		analyzer.setGroupBy(AnalyzerV2.GroupBy.ALL);
		analyzer.analyze(TODAY, NEXT_DAY).then(() => {
			Assert(analyzer.getWarning()).isArray().isEmpty();

			const result = analyzer.getResult();
			Assert(result.total).fieldsEqual({ coding: WHOLE_DAY_CODING, watching: WHOLE_DAY_WATCHING });
			Assert(Object.keys(result.groupBy.file).sort()).equalsInJSON(V2_FILES);

			Assert(result.groupBy.project).child(PROJ_A).fieldsEqual({ watching: V2_WATCHING_IN_PROJ_A });
			Assert(result.groupBy.project).child(PROJ_B).fieldsEqual({ watching: V2_WATCHING_IN_PROJ_B });

			// console.log(result);

			process.nextTick(() => then());
		}).catch(err => then(err));
	});
});
