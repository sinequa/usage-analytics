import { Injectable } from "@angular/core";
import { TimelineDate, TimelineSeries, BsFacetTimelineComponent } from "@sinequa/analytics/timeline";
import { Utils } from "@sinequa/core/base";
import { Aggregation, DatasetError, Record, Results } from "@sinequa/core/web-services";
import * as d3 from 'd3';
import moment from 'moment';

export interface TimeSeries {
    dateField: string;
    valueFields: TimelineValueField[]
}

export interface TimelineValueField {
    name: string;
    operatorResults?: boolean
    title?: string;
    primary?: boolean;
}

export interface AggregationTimeSeries extends TimeSeries {
    name: string;
}

export interface RecordsTimeSeries extends TimeSeries {}

@Injectable()
export class TimelineProvider {

    constructor() {}

    public getAggregationsTimeSeries(data: Results | DatasetError, aggregationsTimeSeries: AggregationTimeSeries | AggregationTimeSeries[], mask: string): TimelineSeries[] {
        if (!Utils.isArray(aggregationsTimeSeries)) {
            aggregationsTimeSeries = [aggregationsTimeSeries];
        }
        const timeSeries: TimelineSeries[] = [];
        if (data && !(data as DatasetError).errorMessage && (data as Results).aggregations) {
            for (const aggregationTimeSeries of aggregationsTimeSeries) {
                const aggregation = (data as Results).aggregations.find((aggr: Aggregation) => Utils.eqNC(aggr.name, aggregationTimeSeries.name));
                if (aggregation) {
                    timeSeries.push(...this.makeAggregationSeries(aggregation, aggregationTimeSeries, mask));
                }
            }
        }
        return this.defaultStyleRules(timeSeries);
    }

    public getRecordsTimeSeries(data: Results | DatasetError, recordsTimeSeries: RecordsTimeSeries): TimelineSeries[] {
        let timeSeries: TimelineSeries[] = [];
        if (data && !(data as DatasetError).errorMessage && (data as Results).records) {
            timeSeries = this.makeRecordsSeries((data as Results).records, recordsTimeSeries);
        }
        return this.defaultStyleRules(timeSeries);
    }

    protected makeAggregationSeries(aggregation: Aggregation, aggregationTimeSeries: AggregationTimeSeries, mask: string): TimelineSeries[] {
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
                
                rawDates.forEach((item,i) => {
                    const date = item.date;
                    if(i === 0 || timeInterval.offset(dates[dates.length-1].date, 1) < date) {
                        dates.push({date: timeInterval.offset(date, -1), value: 0});
                    }

                    dates.push(item);

                    if(i === rawDates.length-1 || timeInterval.offset(date, 1) < rawDates[i+1].date){
                        dates.push({date: timeInterval.offset(date, 1), value: 0});
                    }
                });

                dates.forEach(item => item.date = BsFacetTimelineComponent.shiftDate(item.date, mask));

                timeSeries.push({
                    name: valueField.title ? valueField.title : valueField.name,
                    dates,
                    primary: !!valueField.primary ? true : false
                });
            }
        }
        return timeSeries;
    }

    protected makeRecordsSeries(records: Record[], recordsTimeSeries: RecordsTimeSeries): TimelineSeries[] {
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
                name: valueField.title ? valueField.title : valueField.name,
                dates: (dates.filter(item => !!item.date) as TimelineDate[]).sort((a,b)=>a.date.getTime()- b.date.getTime()),
                primary: !!valueField.primary ? true : false
            })
        }
        return timeSeries;
    }

    protected defaultStyleRules(timeSeries: TimelineSeries[]): TimelineSeries[] {
        if (timeSeries.length > 1) {
            const colors = d3.schemeCategory10;
            timeSeries = timeSeries.map(
                (serie: TimelineSeries, index: number) => {
                    return {
                        ...serie,
                        lineStyles: {'stroke-width': 1, 'stroke': colors[index]},
                        areaStyles: {'fill': 'none'}
                    }
                }
            );
        }
        return timeSeries;
    }

    private _parseDate(value: any) : Date | undefined {
        if (value instanceof Date) {
            return value;
        }
        if(!!value && !(value instanceof Date)){
            const val = value.toString();
            value = moment(val.length <= 4? val + "-01" : val).toDate();
            if(isNaN(value.getTime())){
                value = <Date><unknown> undefined;
            }
            return value;
        }
        return undefined;
    }
}
