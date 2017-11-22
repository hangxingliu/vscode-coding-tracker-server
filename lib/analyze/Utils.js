//@ts-check
/// <reference path="../types/AnalyzeCore.d.ts" />

let {
	GROUP_BY,
	FILTER_RULE_MAP_TO_COL,

	COLUMN_INFO_ALL
} = require('./Constant');

//Get empty record and basic result object
function getBaseResultObject() {
	return {
		total: { coding: 0, watching: 0 },
		groupBy: {
			computer: {},
			day: {},
			hour: {},
			language: {},
			file: {},
			project: {},
			vcs: {}
		}
	};
}

//Analyze/Convert a groupBy number to a Object with fields started with "has"
function convertGroupRulesNumberToObject(groupByRulesNumber) {
	let rule = groupByRulesNumber;
	let result = {
		hasDay: GROUP_BY.DAY,
		hasHour: GROUP_BY.HOUR,
		hasLanguage: GROUP_BY.LANGUAGE,
		hasFile: GROUP_BY.FILE,
		hasProject: GROUP_BY.PROJECT,
		hasComputer: GROUP_BY.COMPUTER,
		hasVCS: GROUP_BY.VCS,
	};
	for (let key in result)
		result[key] = result[key] & rule;
	return result;
}

const ALWAY_TRUE_FUNCTION = () => true;
/**
 * generate filter function from given filter rules object
 * @param {AnalyzeFilterRules} [filterRules]
 * @returns {(row?: string[], vcs?: string[]) => boolean}
 */
function generateFilterFunction(filterRules) {
	/**
	 * rules: [ col, [colFilter...], col2, [col2Filter...], ....]
	 */
	let rules = [];
	let vcsRepoRules = {}, vcsBranchRules = {};
	let hasVCSRules = false;
	//default value is a empty array (no any filter)
	if (!filterRules)
		filterRules = {};
	for (let ruleName in filterRules) {
		let ruleColumn = FILTER_RULE_MAP_TO_COL[ruleName];
		let rule = filterRules[ruleName];

		if (typeof ruleColumn == 'undefined')
			throw new Error(`Filter rule "${ruleName}" is not exists!`);

		//VCS Filter
		if (ruleColumn == COLUMN_INFO_ALL.VCS) {
			hasVCSRules = true;
			if (ruleName.endsWith('repo'))
				rule.map(v => vcsRepoRules[v] = 1);
			else
				rule.map(v => vcsBranchRules[v] = 1);
			continue;
		}

		rules.push(ruleColumn);
		let colFilter = {};
		rule.map(v => colFilter[v] = 1);
		rules.push(colFilter);
	}

	if (rules.length == 0 && !hasVCSRules)
		return ALWAY_TRUE_FUNCTION;
	return _generateFilter(rules, hasVCSRules, vcsRepoRules, vcsBranchRules);
}

/**
 * @param {any} rules
 * @param {boolean} hasVCSRules
 * @returns {(row: string[], vcs?: string[]) => boolean}
 */
function _generateFilter(rules, hasVCSRules, vcsRepoRules, vcsBranchRules) {
	/**
	* @param {(string|number)[]} row
	* @param {[string, string, string]} vcs
	* @returns {boolean}
	*/
	return function filter(row, vcs) {
		for (let i = 0; i < rules.length; i += 2) {
			//If special column in row be included in rules, then verify the next rule.
			if (rules[i + 1][row[rules[i]]])
				continue;
			return false;
		}

		//If VCS rules
		if (hasVCSRules) {
			//non-vcs
			if (!vcs)
				return false;
			//repo path or project path
			if (!(vcs[1] in vcsRepoRules))
				return false;
			//branch
			if (!(vcs[2] in vcsBranchRules))
				return false;
		}
		return true;
	}
}

/**
 * return null => non-vcs
 * @param {string[]} row
 * @returns {string[]}
 */
function getVCSInfo(row) {
	let vcs = (row[COLUMN_INFO_ALL.VCS] || '').split(':');
	if (vcs.length < 3 || vcs[0].length == 0)
		return null;
	if (!vcs[1])
		vcs[1] = row[COLUMN_INFO_ALL.PROJ];
	return vcs;
}


/**
 * Convert a date object to a string as format "YYYY-MM-DD HH:00"
 * @param {Date} date
 * @returns {string}
 */
function dateToYYYYMMDDHHString(date) {
	return dateToYYYYMMDDString(date) + ` ${padZeroMax99(date.getHours())}:00`
}
/**
 * Convert a date object to a string as format "YYYY-MM-DD"
 * @param {Date} date
 * @returns {string}
 */
function dateToYYYYMMDDString(date) {
	return `${date.getFullYear()}-${padZeroMax99(date.getMonth()+1)}-${padZeroMax99(date.getDate())}`
}


const MONTH = '123456789ABC';
/**
 * get database file name from given date object
 * @param {Date} date
 * @returns {string}
 */
function getFileNameFromDateObject(date) {
	return `${date.getFullYear() % 100}${MONTH[date.getMonth()]}` +
		`${padZeroMax99(date.getDate())}.db`;
}

/**
 * Pad zero to left side for number. Max number to 99.
 * Such as pasZeroMax99(5) == '05'
 * @param {string|number} num
 * @returns {string}
 */
function padZeroMax99(num) {
	return num >= 10 ? `${num}` : (num == 0 ? '00' : `0${num}`);
}

module.exports = {
	getVCSInfo,

	generateFilterFunction,
	convertGroupRulesNumberToObject,

	getBaseResultObject,

	dateToYYYYMMDDHHString,
	dateToYYYYMMDDString,
	getFileNameFromDateObject,
	padZeroMax99
};
