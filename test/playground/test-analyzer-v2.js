//@ts-check

/**
 * A test script for debug AnalyzerV2 and compare with AnalyzerV1.
 */

const fs = require('fs-extra');

const dataDir = `${process.env.HOME}/.coding-tracker`;
const V1Result = `${__dirname}/v1-result.json`;
const V2Result = `${__dirname}/v2-result.json`;

const V1 = require('../../lib/analyze/AnalyzeCore');
const V2 = require('../../lib/analyze/AnalyzeCoreV2');
const FileReader = require('../../lib/analyze/CachedDataFileReader');


const to = new Date(); to.setDate(to.getDate() - 1);
const from = new Date(to); from.setDate(from.getDate() - 8);
console.log(`from: ${from.toJSON()} ~ to: ${to.toJSON()}`);

analyzeByV1(() =>
	analyzeByV2(() => {
		console.log("\n[+] all done!");
		console.log("    `code --diff v1-result.json v2-result.json`")
	}));


function analyzeByV1(then) {
	console.log("====================================")
	console.log("Analyzer V1")
	const analyzer = new V1(dataDir);
	analyzer.setGroupBy(V1.GroupBy.ALL);
	if(analyzer.analyze(from, to, false)) {
		console.log('V1 Warnings:', analyzer.getWarning());
		const r = analyzer.getResult();
		// console.log(r);
		fs.writeJsonSync(V1Result, r, { spaces: 4 });
	} else {
		console.error(analyzer.getError());
	}
	then();
}

function analyzeByV2(then) {
	console.log("====================================")
	console.log("Analyzer V2")
	const analyzer = new V2(FileReader.createCachedDataFileReader(dataDir));
	analyzer.setGroupBy(V2.GroupBy.ALL);
	analyzer.analyze(from, to).then(() => {
		console.log('V2 Warnings:', analyzer.getWarning());
		const r = analyzer.getResult();
		// console.log(r);
		fs.writeJsonSync(V2Result, r, { spaces: 4 });
	}).catch(err => {
		console.error(err)
	}).then(then);
}
