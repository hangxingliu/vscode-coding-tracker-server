//a version list which analyze action in this class supported
const SUPPORT_VERSION = ['3.0', '4.0'];

//Split Regex to split columns and lines
const SPLIT_COLUMN = /\s+/;
const SPLIT_LINE = /[\r\n]+/;

/**
 * Analyze group by enum
 * Your can using it like following:
 *
 * GroupBy.DAY
 * GroupBy.DAY | GroupBy.FILE
 */
const GROUP_BY = {
	DAY: 1,
	HOUR: 2,
	LANGUAGE: 16,
	FILE: 32,
	PROJECT: 128,
	COMPUTER: 256,
	VCS: 512,
	ALL: 1024 - 1,
	NONE: 0
};

/**
 * A map from filter rules name to column
 */
const FILTER_RULE_MAP_TO_COL = {
	language: 3,
	file: 4,
	project: 5,
	computer: 6,
	vcs_repo: 7,
	vcs_branch: 7
};

/**
 * Echo column description
 */
const COLUMN_INFO_3 = {
	TYPE: 0,
	TIME: 1,
	LONE: 2,
	LANG: 3,
	FILE: 4,
	PROJ: 5,
	PCID: 6
};
const COLUMN_INFO_4_REQUIRED = {
	VCS: 7,
	LINE: 8,
	CHAR: 9
};
const COLUMN_INFO_4_OPTIONAL = {
	R1: 10,
	R2: 11
};

const COLUMN_INFO_ALL =
	Object.assign({}, COLUMN_INFO_3, COLUMN_INFO_4_REQUIRED, COLUMN_INFO_4_OPTIONAL);

module.exports = {
	FILTER_RULE_MAP_TO_COL,

	COLUMN_INFO_ALL,
	COLUMN_INFO_3,
	COLUMN_INFO_4_REQUIRED,
	COLUMN_INFO_4_OPTIONAL,

	GROUP_BY,

	SUPPORT_VERSION,

	SPLIT_COLUMN,
	SPLIT_LINE
};
