/// <reference path="echarts.d.ts" />

declare var global: {
	app: {
		openProjectReport(projectName: string): void;
		share: Object;
	}
};
declare var echarts: EChartsStatic;

type WatchingCodingObject = {
	watching: number;
	coding: number;
	[key: string]: any;
};

type EChartsSeriesCreator = {
	toObject(): Object;
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
		vcs_branch: CodingWatchingMap;
		vcs_repo: CodingWatchingMap;
	}
}
type CodingWatchingObject = { coding: number; watching: number };
type CodingWatchingMap = {
	[name: string]: CodingWatchingObject;
};
type CodingWatchingArray = CodingWatchingObject[];
