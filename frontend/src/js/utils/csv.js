//@ts-check

/// "Comma-Separated Values" Exporter

module.exports = { csvFromArray };

/**
 * @param {string[]} header
 * @param {any[][]} array
 * @param {string} [delimiter]
 */
function csvFromArray(header, array, delimiter = ',') {
	let csv = header.map(encodeString).join(delimiter) + '\n';
	if(array.length > 0)
		csv += array.map(row => row.map(encodeString).join(delimiter)).join('\n') + '\n';
	return csv;
}

/**
 * @param {string} str
 */
function encodeString(str) {
	if (str.match(/["\n\t]/))
		return '"' + str.replace(/"/g, '""') + '"';
	return str;
}
