//@ts-check

const { Assert } = require('@hangxingliu/assert');
const { guess, compareTwoStrings } = require('../../lib/GuessSimilarStrings');

describe('Guess similar strings', () => {
	it(`# compareTwoStrings`, () => {
		Assert(compareTwoStrings('', '')).equals(0);
		Assert(compareTwoStrings('a', 'b')).equals(0);
		Assert(compareTwoStrings('a', 'a')).equals(1);
		Assert(compareTwoStrings('abc', 'Abc')).equals(1);
		Assert(compareTwoStrings('adminToken', 'admimToken')).greaterThan(0.5);
		Assert(compareTwoStrings('adminToken', 'admimoken')).greaterThan(0.5);
		Assert(compareTwoStrings('adminToken', 'wtfoken')).lessThan(0.5);
	});

	it('# guess', () => {
		const dict = ["adminToken", "viewReportToken", "uploadToken"];
		Assert(guess('admiToken', dict)).child('match').equals('adminToken');
		Assert(guess('uploadtoken', dict)).child('match').equals('uploadToken');
		Assert(guess('viewToken', dict)).child('match').equals('viewReportToken');
		Assert(guess('reportToken', dict)).child('match').equals('viewReportToken');
	})

});
