/// <reference path="echarts.d.ts" />

declare var global: {
	app: {
		
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