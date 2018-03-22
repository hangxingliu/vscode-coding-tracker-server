/// <reference path="echarts.d.ts" />

declare var echarts: EChartsStatic;

type CodingWatchingObject = {
	watching: number;
	coding: number;
	[key: string]: any;
};

type EChartsSeriesCreator = {
	toObject(): EChartSeriesItem;
	showMaxMarkPoint(name: string): EChartsSeriesCreator;
	showAverageLine(name: string): EChartsSeriesCreator;
	setLineSmooth(): EChartsSeriesCreator;

	setTooltip(formatter: string | Function): EChartsSeriesCreator;
	setLabelBold(): EChartsSeriesCreator;

	setLineColor(color: any): EChartsSeriesCreator;
	setItemColor(color: any): EChartsSeriesCreator;
	setAreaColor(color: any): EChartsSeriesCreator;

	setLabels(labels: string[]): EChartsSeriesCreator;
	setValues(values: string[]|number[]): EChartsSeriesCreator;

	add(...options: any[]): EChartsSeriesCreator;
}

type APIResponse = {
	total: CodingWatchingObject;
	groupBy: {
		computer: CodingWatchingMap;
		day: CodingWatchingMap;
		file: CodingWatchingMap;
		hour: CodingWatchingMap;
		language: CodingWatchingMap;
		project: CodingWatchingMap;
		vcs: CodingWatchingMap;
	}
}
type CodingWatchingMap = {
	[name: string]: CodingWatchingObject;
};
type CodingWatchingArray = CodingWatchingObject[];


type IRoute = {
	name: string;
	start: (param: string) => void;
	stop: () => void;
	update?: (param: string) => void;
	[x: string]: any;
};
type IRoutesMap = { [x: name]: IRoute };

type ReportFilter = {
	from?: Date;
	to?: Date;
	project?: string;
	vcsRepo?: string;
};
type ReportFilterSubscriber = (filter: ReportFilter) => void;

type ChartModule = {
	recommendedName: string;
	init: (dom: HTMLElement) => EChartsInstance;
	update: (option: EChartOption) => void;
};

type AdvancedVCSInfo = {
	type: string;
	short: string;
	path: string;
	branch: string;
	watching: number;
	coding: number;
	selected: boolean;
};

type Association = {
	name: string;
	projects: string[];
};
