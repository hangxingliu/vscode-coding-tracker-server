//@ts-check

const ServerInstance = require('./utils/StartServerInstance');

describe('Test utils self test', () => {
	it('# StartServerInstance.selfTest', function() {
		this.slow(3000);
		return ServerInstance.selfTest();
	});
});
