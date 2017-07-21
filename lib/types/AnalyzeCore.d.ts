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
	ALL: 511;
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
	project?: string[],
	computer?: string[],
	language?: string[],
	file?: string[]
};
type AnalyzeResult = {
	total: HasCodingWatchingObject,
	groupBy: {
		hour?: (HasCodingWatchingObject & HasNameObject)[];
		file?: (HasCodingWatchingObject & HasNameObject)[];
		day?: (HasCodingWatchingObject & HasNameObject)[];
		project?: (HasCodingWatchingObject & HasNameObject)[];
		computer?: (HasCodingWatchingObject & HasNameObject)[];
	}
};
type HasCodingWatchingObject = { coding: number; watching: number; }
type HasNameObject = { name: string; }
