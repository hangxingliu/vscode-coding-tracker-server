function create() { 
	let error = [], warning = [];
	return { addError, addWarning, getError, getWarning };
	
	/**
	 * @param {string} reason 
	 * @param {string} file 
	 * @param {number} [line] 
	 */
	function addError(reason, file, line) { add(error, reason, file, line); }
	/**
	 * @param {string} reason 
	 * @param {string} file 
	 * @param {number} [line] 
	 */
	function addWarning(reason, file, line) { add(warning, reason, file, line); }

	function getError() { return error; }
	function getWarning() { return warning; }

	/**
	 * @param {string[]} to 
	 * @param {string} reason 
	 * @param {string} file 
	 * @param {number} [line] 
	 */
	function add(to, reason, file, line) { 
		let prefix = file + (line ? `:${line} ` : ' ');
		to.push(prefix + reason);
	}
}

module.exports = {
	create
};