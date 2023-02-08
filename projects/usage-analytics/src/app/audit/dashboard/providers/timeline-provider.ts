import { Injectable } from "@angular/core";
import { TimelineDate, TimelineSeries, BsFacetTimelineComponent } from "@sinequa/analytics/timeline";
import { Utils } from "@sinequa/core/base";
import { Aggregation, AggregationItem, DatasetError, Record, Results } from "@sinequa/core/web-services";
import * as d3 from 'd3';
import { ColDef, ValueGetterParams } from "ag-grid-community";
import moment from 'moment';
import { IntlService } from "@sinequa/core/intl";

export interface TimeSeries {
    dateField: string;
    valueFields: TimelineValueField[];
}

export interface TimelineValueField {
    name: string;
    operatorResults?: boolean;
    title?: string;
    primary?: boolean;
    displayedName?: string;
}

export interface AggregationTimeSeries extends TimeSeries {
    name: string;
}

export interface RecordsTimeSeries extends TimeSeries {}

@Injectable()
export class TimelineProvider {

    constructor(public intlService: IntlService) {}

    public getAggregationsTimeSeries(data: Results | DatasetError, aggregationsTimeSeries: AggregationTimeSeries | AggregationTimeSeries[], mask: string, isCurrent: boolean = true, scale: number = 0): TimelineSeries[] {
        if (!Array.isArray(aggregationsTimeSeries)) {
            aggregationsTimeSeries = [aggregationsTimeSeries];
        }
        const timeSeries: TimelineSeries[] = [];
        if (data && !(data as DatasetError).errorMessage && (data as Results).aggregations) {
            for (const aggregationTimeSeries of aggregationsTimeSeries) {
                const aggregation = (data as Results).aggregations.find((aggr: Aggregation) => Utils.eqNC(aggr.name, aggregationTimeSeries.name));
                if (aggregation) {
                    timeSeries.push(...this.makeAggregationSeries(aggregation, aggregationTimeSeries, mask, isCurrent, scale));
                }
            }
        }
        return timeSeries;
    }

    public getRecordsTimeSeries(data: Results | DatasetError, recordsTimeSeries: RecordsTimeSeries, isCurrent: boolean = true, scale: number = 0): TimelineSeries[] {
        let timeSeries: TimelineSeries[] = [];
        if (data && !(data as DatasetError).errorMessage && (data as Results).records) {
            timeSeries = this.makeRecordsSeries((data as Results).records, recordsTimeSeries, isCurrent, scale);
        }
        return timeSeries;
    }

    public getAggregationsRowData(data: Results | DatasetError, aggregationsTimeSeries: AggregationTimeSeries | AggregationTimeSeries[], isCurrent: boolean = true): AggregationItem[] {
        if (!Array.isArray(aggregationsTimeSeries)) {
            aggregationsTimeSeries = [aggregationsTimeSeries];
        }
        if (data && !(data as DatasetError).errorMessage && (data as Results).aggregations) {
            switch (aggregationsTimeSeries.length) {
                case 0:
                    return [];
                case 1:
                    const aggregation = (data as Results).aggregations.find((aggr: Aggregation) => Utils.eqNC(aggr.name, aggregationsTimeSeries[0].name));
                    return aggregation?.items || [];
                default:
                    const items: AggregationItem[] = [];
                    const aggregations = aggregationsTimeSeries.map((config) => (data as Results).aggregations.find((aggr: Aggregation) => Utils.eqNC(aggr.name, config.name)));
                    const dates = aggregations
                                        .flatMap((agg, index) => (agg?.items || []).map((el) => el[aggregationsTimeSeries[index].dateField || 'value']))
                                        .filter((val) => this._parseDate(val));

                    Array.from(new Set(dates)).forEach(
                        (date) => {
                            let item = {value: date};
                            (<Array<AggregationTimeSeries>>aggregationsTimeSeries).forEach(
                                (aggregationTimeSeries, index) => {
                                    for (const valueField of aggregationTimeSeries.valueFields) {
                                        item[aggregationTimeSeries.name+valueField.name] = aggregations[index]?.items?.find((el) => el[aggregationTimeSeries.dateField || 'value'] === date)?.[valueField.name]
                                    }
                                }
                            );
                            items.push(item as AggregationItem);
                        }
                    );

                    return items.sort((a,b) => this._parseDate(a.value)!.getTime()- this._parseDate(b.value)!.getTime());
            }
        }
        return [];
    }

    public getGridColumnDefs(configs: RecordsTimeSeries | RecordsTimeSeries[] | AggregationTimeSeries | AggregationTimeSeries[], isCurrent: boolean = true): ColDef[] {
        if (!Array.isArray(configs)) {
            configs = [configs];
        }
        let columnDefs: ColDef[];
        switch (configs.length) {
            case 0:
                return [];
            case 1:
                columnDefs = [{
                    headerName: 'Date',
                    field: configs[0].dateField || 'value',
                    filter: 'agDateColumnFilter',
                    cellRenderer: (params: any): HTMLElement | string => this.intlService.formatDate(params.value)
                }] as ColDef[];
                for (const valueField of configs[0].valueFields) {
                    const colDef: ColDef = {
                        headerName: valueField.displayedName || valueField.name,
                        filter: "agNumberColumnFilter",
                        cellRenderer: (params: any): HTMLElement | string => this.intlService.formatNumber(params.value)
                    }
                    if (valueField.operatorResults) {
                        colDef.valueGetter = (params: ValueGetterParams) => (params.data as AggregationItem).operatorResults?.[valueField.name]
                    } else {
                        colDef.field = valueField.name
                    }
                    columnDefs.push(colDef);
                }
                return columnDefs;
            default:
                columnDefs = [{
                    headerName: 'Date',
                    field: 'value',
                    filter: 'agDateColumnFilter',
                    cellRenderer: (params: any): HTMLElement | string => this.intlService.formatDate(params.value)
                }] as ColDef[];
                for (const config of configs) {
                    for (const valueField of config.valueFields) {
                        const colDef: ColDef = {
                            headerName: valueField.displayedName || valueField.name,
                            filter: "agNumberColumnFilter",
                            cellRenderer: (params: any): HTMLElement | string => this.intlService.formatNumber(params.value)
                        }
                        if (valueField.operatorResults) {
                            colDef.valueGetter = (params: ValueGetterParams) => (params.data as AggregationItem).operatorResults?.[(config['name'] || '') + valueField.name];
                        } else {
                            colDef.field = (config['name'] || '') + valueField.name;
                        }
                        columnDefs.push(colDef);
                    }
                }
                return columnDefs;
        }
    }

    protected makeAggregationSeries(aggregation: Aggregation, aggregationTimeSeries: AggregationTimeSeries, mask: string, isCurrent: boolean = true, scale: number = 0): TimelineSeries[] {
        const timeSeries: TimelineSeries[] = [];

        const timeInterval = BsFacetTimelineComponent.getD3TimeInterval(mask);

        if (aggregation && aggregation.items) {
            for (const valueField of aggregationTimeSeries.valueFields) {
                const rawDates: TimelineDate[] = [];
                const dates: TimelineDate[] = [];

                aggregation.items.forEach((item) => {
                    const date = this._parseDate(item[aggregationTimeSeries.dateField]);
                    const value = valueField.operatorResults? item.operatorResults?.[valueField.name] : item[valueField.name];
                    if(date && value) {
                        rawDates.push({date, value});
                    }
                });

                // in case the dates are not already sorted...
                rawDates.sort((a,b)=>a.date.getTime()- b.date.getTime());

                // replace missing value in intervals by 0
                rawDates.forEach((item,i) => {
                    const date = item.date;
                    if(i > 0 && timeInterval.offset(dates[dates.length-1].date, 1) < date) {
                        dates.push({date: timeInterval.offset(date, -1), value: 0});
                    }

                    dates.push(item);

                    if(i < rawDates.length-1 && timeInterval.offset(date, 1) < rawDates[i+1].date){
                        dates.push({date: timeInterval.offset(date, 1), value: 0});
                    }
                });

                // if it is a trend timeSerie, scale all dates by the diffPreviousAndStart
                if (!isCurrent) {
                    dates.forEach((item) => {
                            item.displayedDate = Utils.copy(item.date)
                            item.date = new Date(item.date.getTime() + scale)
                        }
                    );
                }

                // Tiny shift of the date to correspond to the middle of the step interval (month => 15th day, year => 6th month ...)
                dates.forEach(item => item.date = BsFacetTimelineComponent.shiftDate(item.date, mask));

                timeSeries.push({
                    name: (valueField.title ? valueField.title : valueField.name) + (isCurrent ? '' : ' (previous)'),
                    dates,
                    primary: !!valueField.primary ? true : false,
                    showDatapoints: true
                });
            }
        }
        return timeSeries;
    }

    protected makeRecordsSeries(records: Record[], recordsTimeSeries: RecordsTimeSeries, isCurrent: boolean = true, scale: number = 0): TimelineSeries[] {
        const timeSeries: TimelineSeries[] = []

        for (const valueField of recordsTimeSeries.valueFields) {
            const dates: any[] = [];

            records.forEach((record: any) => {
                if (record[valueField.name]) {
                    dates.push({
                        date: this._parseDate(record[recordsTimeSeries.dateField]),
                        value: +record[valueField.name],
                    });
                }
            });

            timeSeries.push({
                name: (valueField.title ? valueField.title : valueField.name) + (isCurrent ? '' : ' (previous)'),
                dates: (dates.filter(item => !!item.date) as TimelineDate[]).map((item) => isCurrent ? item : ({...item, date: new Date(item.date.getTime() + scale)})).sort((a,b)=>a.date.getTime()- b.date.getTime()),
                primary: !!valueField.primary ? true : false,
                showDatapoints: true
            })
        }
        return timeSeries;
    }

    applyStyleRules(currentTimeSeries: TimelineSeries[], previousTimeSeries: TimelineSeries[] = []): TimelineSeries[] {
        const colors = d3.schemeCategory10;
        currentTimeSeries = currentTimeSeries.map(
            (serie: TimelineSeries, index: number) => ({
                    ...serie,
                    lineStyles: {'stroke-width': 2, 'stroke': colors[index]}
                })
        );
        previousTimeSeries = previousTimeSeries.map(
            (serie: TimelineSeries, index: number) => ({
                    ...serie,
                    lineStyles: {'stroke-width': 2, 'stroke': colors[index], 'stroke-dasharray': 5}
                })
        );

        let timeSeries = currentTimeSeries.concat(previousTimeSeries);
        if (timeSeries.length > 1) {
            timeSeries = timeSeries.map(
                (serie: TimelineSeries) => ({
                        ...serie,
                        areaStyles: {'fill': 'none'}
                    })
            );
        }
        return timeSeries;
    }

    protected _parseDate(value: any) : Date | undefined {
        if (value instanceof Date) {
            return value;
        }
        if(!!value && !(value instanceof Date)){
            const val = value.toString();
            value = moment(val.length <= 4 ? (val + "-01") : val).toDate();
            if(isNaN(value.getTime())){
                value = <Date><unknown> undefined;
            }
            return value;
        }
        return undefined;
    }
}
