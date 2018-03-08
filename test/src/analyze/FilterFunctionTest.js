//@ts-check

let { Assert, Invoke } = require('../utils/Assert'),
	Utils = require('../../../lib/analyze/Utils');

describe('FilterFunction', () => {
	describe('#generateFilterFunction', () => {
		it('passing empty filter param should be return a alway returned true function', () => {

			let func1 = Utils.generateFilterFunction({});
			let func2 = Utils.generateFilterFunction();

			Assert(func1()).isTrue();
			Assert(func2()).isTrue();

			//@ts-ignore
			Assert(func1("ignore me")).isTrue();
			//@ts-ignore
			Assert(func2("ignore me")).isTrue();

			Assert(func1([])).isTrue();
			Assert(func2([])).isTrue();

		});

		it('generate failed and throw a error', () => {
			Invoke(Utils.generateFilterFunction, this,
				{ unknownColumn: [] }).hasException('unknownColumn');
		});

		it('enable filter', () => {
			let row = '0 1485281235871 8435 json a.json %2Fpath%2Fto%2FProject ubuntu'.split(' ');

			let funcPassing1 = Utils.generateFilterFunction({
				project: ['%2Fpath%2Fto%2FProject']
			});
			let funcPassing2 = Utils.generateFilterFunction({
				language: ['javascript', 'json'],
				computer: ['ubuntu', 'windows10']
			});

			let funcFailure1 = Utils.generateFilterFunction({
				project: ['%2Fpath%2Fto%2FProject'],
				file: ['b.json', 'c.json']
			});

			Assert(funcPassing1(row)).isTrue();
			Assert(funcPassing2(row)).isTrue();

			Assert(funcFailure1(row)).isFalse();
		});
	});
});
