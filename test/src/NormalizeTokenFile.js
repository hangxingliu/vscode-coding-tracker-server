//@ts-check

const { Assert } = require('@hangxingliu/assert');
const { normalizeTokenFileObject } = require('../../lib/NormalizeTokenFile')

describe('Normalize token file object', () => {
	it(`# unknown token type`, () => {
		Assert(normalizeTokenFileObject({ adinToken: {} }).warnings).child('0')
			.containsSubString('unknwon token type "adinToken"')
			.containsSubString('Did you mean: "adminToken"?');

		Assert(normalizeTokenFileObject({ upload: {} }).warnings).child('0')
			.containsSubString('unknwon token type "upload"')
			.containsSubString('Did you mean: "uploadToken"?');
	});

	it(`# adminToken is incorrect`, () => {
		Assert(normalizeTokenFileObject({}).error)
			.containsSubString('"adminToken" is required');

		Assert(normalizeTokenFileObject({ adminToken: [] }).error)
			.containsSubString('"adminToken" is required')
			.containsSubString('empty array');

		Assert(normalizeTokenFileObject({ adminToken: {} }).error)
			.containsSubString('"adminToken" should be an array');

		Assert(normalizeTokenFileObject({ adminToken: [{}] }).error)
			.containsSubString('"adminToken[0].token" should be a string');
	});

	it(`# viewReportToken is incorrect`, () => {
		const adminToken = [{ token: 'test' }];
		Assert(normalizeTokenFileObject({ adminToken, viewReportToken: {} }).error)
			.containsSubString('"viewReportToken" should be an array');

		Assert(normalizeTokenFileObject({ adminToken, viewReportToken: 'public2' }).error)
			.containsSubString('"viewReportToken" should be an array or string "public"');

		Assert(normalizeTokenFileObject({ adminToken, viewReportToken: [{}] }).error)
			.containsSubString('"viewReportToken[0].token" should be a string');

	});

	it(`# uploadToken is incorrect`, () => {
		const adminToken = [{ token: 'test' }];
		Assert(normalizeTokenFileObject({ adminToken, uploadToken: {} }).error)
			.containsSubString('"uploadToken" should be an array');

		Assert(normalizeTokenFileObject({ adminToken, uploadToken: [{}] }).error)
			.containsSubString('"uploadToken[0].token" should be a string');

		Assert(normalizeTokenFileObject({ adminToken, uploadToken: [{ token: ' ' }] }).error)
			.containsSubString('"uploadToken[0].token" could not be empty or blank spaces string');

		const obj1 = {
			adminToken,
			uploadToken: [{ token: 'test2', computerId: 11 }]
		};
		Assert(normalizeTokenFileObject(obj1).error)
			.containsSubString('"uploadToken[0].computerId" should be an array');

		const obj2 = {
			adminToken,
			uploadToken: [{ token: 'test2', computerId: ['hello', 112] }]
		};
		Assert(normalizeTokenFileObject(obj2).error)
			.containsSubString('"uploadToken[0].computerId[1]" should be a string');
	});

	it(`# duplicated token`, () => {
		const obj1 = {
			adminToken: [{ token: 'hello' }],
			uploadToken: [{ token: 'hello' }]
		};
		Assert(normalizeTokenFileObject(obj1).error)
			.containsSubString('is duplicated');

		const obj2 = {
			adminToken: [{ token: 'hello' }, { token: 'hello' }],
		};
		Assert(normalizeTokenFileObject(obj2).error)
			.containsSubString('is duplicated');
	});

	it(`# correct token file object`, () => {
		const obj1 = {
			adminToken: [{ token: 'hello' }],
			uploadToken: [{ token: 'hello-world', computerId: "Mike's computer" }]
		};
		Assert(normalizeTokenFileObject(obj1))
			.fieldsEqual({ error: undefined, warnings: [] })
			.child('result')
			.fieldsEqual({
				adminToken: [{ token: 'hello' }],
				viewReportToken: [],
				uploadToken: [{ token: 'hello-world', computerId: ["Mike's computer"] }]
			});

		const obj2 = {
			adminToken: [{ token: 'hello' }],
			viewReportToken: 'public',
			uploadToken: [{ token: 'hello-world', computerId: ["Mike's computer", "Mike's laptop"], }]
		};
		Assert(normalizeTokenFileObject(obj2))
			.fieldsEqual({ error: undefined, warnings: [] })
			.child('result')
			.fieldsEqual({
				adminToken: [{ token: 'hello' }],
				viewReportToken: null,
				uploadToken: [{ token: 'hello-world', computerId: ["Mike's computer", "Mike's laptop"], }]
			});
	});

});
