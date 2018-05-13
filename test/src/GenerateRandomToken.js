//@ts-check

const { Assert } = require('@hangxingliu/assert');
const GenerateRandomToken = require('../../lib/GenerateRandomToken');

describe('Generate random token', () => {
	it(`# random token should be length equals ${GenerateRandomToken.TOKEN_LENGTH}`, () => {
		for (let i = 0; i < 100; i++)
			Assert(GenerateRandomToken.gen()).isString().length(GenerateRandomToken.TOKEN_LENGTH);
	});
	it(`# random token could not contains blurry characters (0Oo1il)`, () => {
		for (let i = 0; i < 100; i++) {
			const token = GenerateRandomToken.gen();
			if (token.match(/[0Oo1il]/))
				throw new Error(`"${token}" is invalid! (it contains blurry characters (0Oo1il))`);
		}
	});

});
