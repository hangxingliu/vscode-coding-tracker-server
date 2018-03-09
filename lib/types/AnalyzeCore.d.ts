interface AnalyzeCoreClass {
    new (dbPath: string): AnalyzeCoreInstance;
	GroupBy: AnalyzeGroupByEnum;
}

type AnalyzeGroupByEnum = {
	DAY: 1;
	HOUR: 2;
	LANGUAGE: 16;
	FILE: 32;
	PROJECT: 128;
	COMPUTER: 256;
	VCS: 512;
	ALL: 1023;
	NONE: 0;
};

type AnalyzeFilterRules = {
	project?: string[];
	computer?: string[];
	language?: string[];
	file?: string[];
	repo?: string[];
	branch?: string[];
};

type AnalyzeCoreInstance = {
	setFilter(filterRules: AnalyzeFilterRules): void;
	setGroupBy(groupBy: number): void;
	analyze(startDayDate: Date, endDayDate: Date, expandToWholeDay?: boolean): boolean;
	getError(): string[];
	getWarning(): string[];
	getResult(): AnalyzeResult;
};

type AnalyzeResult = {
	total: HasCodingWatchingObject,
	groupBy: {
		hour?: HasCodingWatchingObjectMap;
		file?: HasCodingWatchingObjectMap;
		day?: HasCodingWatchingObjectMap;
		project?: HasCodingWatchingObjectMap;
		computer?: HasCodingWatchingObjectMap;
		vcs?: HasCodingWatchingObjectMap;
	}
};

type HasCodingWatchingObject = { coding: number; watching: number; }
type HasNameAndTimeObject = { name: string; } & HasCodingWatchingObject;
type HasCodingWatchingObjectMap = { [name: string]: HasCodingWatchingObject; };
