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
type AnalyzeCoreInstance = {
	setFilter(filterRules: AnalyzeFilterRules): void;
	setGroupBy(groupBy: number): void;
	analyze(startDayDate: Date, endDayDate: Date): boolean;
	getError(): string[];
	getWarning(): string[];
	getResult(): AnalyzeResult;
};
type AnalyzeFilterRules = {
	project?: string[];
	computer?: string[];
	language?: string[];
	file?: string[];
	repo?: string[];
	branch?: string[];
};
type AnalyzeResult = {
	total: HasCodingWatchingObject,
	groupBy: {
		hour?: HasNameAndTimeObject[];
		file?: HasNameAndTimeObject[];
		day?: HasNameAndTimeObject[];
		project?: HasNameAndTimeObject[];
		computer?: HasNameAndTimeObject[];
		vcs?: HasNameAndTimeObject[];
	}
};
type HasCodingWatchingObject = { coding: number; watching: number; }
type HasNameAndTimeObject = { name: string; } & HasCodingWatchingObject;
