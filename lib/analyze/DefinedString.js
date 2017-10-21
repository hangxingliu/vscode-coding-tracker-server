let { SPLIT_COLUMN } = require('./Constant');

function create() { 
	let map = {};
	return {add, addDefiningLine, replace};
	/**
	 * @param {number} id 
	 * @param {string} string 
	 * @returns {boolean}
	 */
	function add(id, string) { 
		map[id] = string;
		return true;
	}

	/**
	 * @param {string} line 
	 * @returns {boolean}
	 */
	function addDefiningLine(line) { 
		let part = line.split(SPLIT_COLUMN);
		if (part.length != 3 || part[0] != 'd')
			return false;
		let id = parseInt(part[1]);
		if (isNaN(id))
			return false;	
		return add(id, part[2]);
	}

	/**
	 * @param {string} line
	 * @returns {string}
	 */
	function replace(line) { 
		return line.replace(/\$(\d+)/g, _replaceFunc);
	}

	function _replaceFunc(_, id) { return map[id]; }
}

module.exports = { create };
