// Test Syntax v4

//@ts-check
let assert = require('assert'),
	DefinedString = require('../../../lib/analyze/DefinedString');

describe('DefinedString', () => {
	describe('#add', () => {
		it('pure add method', () => {
			let container = DefinedString.create();
			let results = [
				container.add(10, 'HelloWorld'),
				container.add(0, '')
			];
			allValueIn(results, 'result').is(true);

			let innerMap = container.getInnerMap();
			assert.equal(Object.keys(innerMap).length, 2);

			for (let key in innerMap)
				assert.equal(typeof innerMap[key], 'string');
		});

		it('add invalid defining line', () => {
			let container = DefinedString.create();
			let results = [
				'0 javascript',
				'1 java script',
				'd 0 ',
				'd 0 java script',
				'd nan java',
			].map(line => container.addDefiningLine(line));
			allValueIn(results, 'result').is(false);

			assert.deepStrictEqual(Object.keys(container.getInnerMap()).length, 0);
		});

		it('add defining line success', () => {
			let container = DefinedString.create();
			let results = [
				'd 0 javascript',
				'd 1000000 java%20script'
			].map(line => container.addDefiningLine(line));
			allValueIn(results, 'result').is(true);

			let innerMap = container.getInnerMap();
			assert.deepStrictEqual(innerMap, {
				0: 'javascript',
				1000000: 'java%20script'
			});
		});
	});

	describe('#replace', () => {
		it('no defined string in container', () => {
			let container = DefinedString.create();
			let strings = [
				'test $1 helloWorld$2',
				'helloWorld',
				'',
				'$$$$111$2',
				'   '
			];
			assert.deepStrictEqual(
				strings.map(str => container.replace(str)),
				strings);
		});

		it('no defined string in test string', () => {
			let container = DefinedString.create();
			let strings = [
				'test  helloWorld',
				'helloWorld',
				'',
				'$$$ $',
				'    '
			];
			assert.deepStrictEqual(
				strings.map(str => container.replace(str)),
				strings);

			container.add(0, 'hello');
			container.add(1, 'bomb');
			assert.deepStrictEqual(
				strings.map(str => container.replace(str)),
				strings);
		});

		it('replace variable success', () => {
			let container = DefinedString.create();
			let strings = [
				'test  $1helloWorld',
				'helloWorld $1',
				'$2',
				'$$$$3$$$',
				'  $5   '
			];

			assert.deepStrictEqual(
				strings.map(str => container.replace(str)),
				strings);

			container.add(1, '$1');
			container.add(2, 'hello');
			container.add(3, ' ');
			container.add(5, 'nice to meet you');

			let expect = [
				'test  $1helloWorld',
				'helloWorld $1',
				'hello',
				'$$$ $$$',
				'  nice to meet you   '
			];
			assert.deepStrictEqual(
				strings.map(str => container.replace(str)),
				expect);
		});
	});
});

function allValueIn(array = [], name = '') {
	return { is };

	function is(value) {
		array.forEach((val, i) =>
			assert.deepStrictEqual(val, value, `${name}[${i}] == ${value}`))
	}
}
