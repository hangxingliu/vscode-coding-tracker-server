//@ts-check

/*
	Reference from:
	https://github.com/aceakash/string-similarity/blob/master/compare-strings.js
*/

module.exports = { guess, compareTwoStrings };

/**
 * @param {string} input
 * @param {string[]} dict
 */
function guess(input, dict) {
	let targetStr = null;
	let targetRate = 0;
	for (const str of dict) {
		const rate = compareTwoStrings(input, str);
		if (rate > targetRate) {
			targetStr = str;
			targetRate = rate;
		}
	}
	return { rate: targetRate, match: targetStr };
}


/**
 * @param {string} str1
 * @param {string} str2
 */
function compareTwoStrings(str1, str2) {
	str1 = str1.trim();
	str2 = str2.trim();

	if (str1.length === 0 || str2.length === 0) return 0;

	const upper1 = str1.toUpperCase();
	const upper2 = str2.toUpperCase();

	// same ignore case
	if (upper1 === upper2)
		return 1;

	// both single char
	if (str1.length === 1 && str2.length === 1)
		return 0;

	const pairs1 = wordLetterPairs(upper1);
	const pairs2 = wordLetterPairs(upper2);
	const union = pairs1.length + pairs2.length;
	let intersection = 0;

	for(const pair1 of pairs1) {
		for (let i = 0; i < pairs2.length; i++) {
			const pair2 = pairs2[i];
			if (pair1 === pair2) {
				intersection++;
				pairs2.splice(i, 1);
				break;
			}
		}
	}
	return (2.0 * intersection) / union;

	function letterPairs(str) {
		const numPairs = str.length - 1;
		const pairs = Array(numPairs);
		for (let i = 0; i < numPairs; i++)
			pairs[i] = str.substring(i, i + 2);
		return pairs;
	}

	/** @param {string} str */
	function wordLetterPairs(str) {
		return [].concat(...str.split(/\s/).map(letterPairs));
	}
}
