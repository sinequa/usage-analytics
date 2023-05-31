import { Injectable } from "@angular/core";
import { Dataset, DatasetError, Results } from "@sinequa/core/web-services";
import {DashboardItem} from "../dashboard.service";

export interface StatValueField {
    name: string;
    operatorResults?: boolean;
}
export type StatValueLocation = "aggregations" | "records" | "totalrecordcount";
export type StatOperation = "avg" | "percentage" | "division";

export type Trend = "increase" | "decrease" | "stable" | undefined;
export type Evaluation = "ok" | "ko" | "stable" | undefined;

// to avoid using this syntaxe: T | undefined.
// eg: const a:MayBe<number> ==> const a: number | undefined;
export type MayBe<T> = T | undefined;

@Injectable( { providedIn: 'root'})
export class StatProvider {

    constructor() {}

    extractStatValue(data:  MayBe<Results | DatasetError>, valueLocation: MayBe<string>, valueField: MayBe<StatValueField>): MayBe<number> {
        if (data && data as Results) {
            switch (valueLocation) {
                case "aggregations":
                    if ((data as Results).aggregations && (data as Results).aggregations[0] && (data as Results).aggregations[0].items) {
                        if (!valueField) {
                            return (data as Results).aggregations[0].items![0]?.count;
                        } else {
                            return valueField.operatorResults ? (data as Results).aggregations[0].items![0].operatorResults?.[valueField.name] : (data as Results).aggregations[0].items![0][valueField.name];
                        }
                    }
                    break;
                case "records":
                    if ((data as Results).records && (data as Results).records[0]) {
                        return !valueField ? (data as Results).records[0]["value"] : (data as Results).records[0][valueField.name];
                    }
                    break;
                case "totalrecordcount":
                    if ((data as Results)) {
                        return (data as Results)["totalrecordcount"];
                    }
                    break;
                default:
                    return undefined
            }
        }
        return undefined;
    }

    aggregate(data: MayBe<Results | DatasetError>, valueLocation: MayBe<string>): MayBe<number> {
        if (data && data as Results) {
            switch (valueLocation) {
                case "aggregations":
                    if ((data as Results).aggregations && (data as Results).aggregations[0] && (data as Results).aggregations[0].items) {
                        const array = (data as Results).aggregations[0].items?.map(item => item.count) as number[];
                        return this.average(array);
                    }
                    break;
                case "records":
                    if ((data as Results).records) {
                        const array = (data as Results).records.map(record => record["count"]) as number[];
                        return this.average(array);
                    }
                    break;
                default:
                    return undefined;
            }
        }
        return undefined;
    }

    average(items: MayBe<number[]>): MayBe<number> {
        if (items) {
            const sum = items.reduce((a, b) => a + b, 0);
            return (sum / items.length) || 0;
        }
        return undefined;
    }

    divide(dividend: MayBe<number>, divisor: MayBe<number>): MayBe<number> {
        if (dividend && divisor) {
            return (dividend / divisor);
        }
        return undefined;
    }

    // refacto

    /**
     *
     * @param previousDataSet previous dataset used to set trend
     * @param dataset current dataset used to compute values
     * @param config dashboard item configuration
     * @param decimalsPrecision decimals precision
     * @returns an object containing computed values {value, percentageChange, trend, trendEvaluation}
     */
    getvalues(
        previousDataSet: Dataset,
        dataset: Dataset,
        config: DashboardItem,
        ): {value: MayBe<number>, previousValue: MayBe<number>, percentageChange: MayBe<number>, trend: Trend, trendEvaluation: Evaluation} {

        const current: MayBe<number> = this.getBasicValue(dataset[config.query], config.operation, config.valueLocation, config.valueField);
        const previous: MayBe<number> = this.getBasicValue(previousDataSet[config.query], config.operation, config.valueLocation, config.valueField);

        let relatedCurrent: MayBe<number>;
        let relatedPrevious: MayBe<number>;

        let value, previousValue, percentageChange, trend;

        if (!config.computation) {
            value = current;
            previousValue = previous;
            percentageChange = this.getPercentageChange(current, previous);
            trend = this.getTrend(current, previous)
        } else {
            relatedCurrent = this.getBasicValue(dataset[config.relatedQuery!], config.relatedOperation, config.relatedValueLocation, config.relatedValueField);
            relatedPrevious = this.getBasicValue(previousDataSet[config.relatedQuery!], config.relatedOperation, config.relatedValueLocation, config.relatedValueField);
            value = this.computeBasicValue(current, relatedCurrent, config.computation);
            previousValue = this.computeBasicValue(previous, relatedPrevious, config.computation);
            percentageChange = this.getPercentageChange(value, previousValue);
            trend = this.getTrend(value, previousValue);
        }
        const trendEvaluation = this.getTrendEvaluation(trend, config.asc);

        return {value, previousValue, percentageChange, trend, trendEvaluation};
    }

    getPercentageChange(newValue: MayBe<number>, oldValue: MayBe<number>): MayBe<number> {
        if (newValue && oldValue) {
            return (newValue - oldValue) === 0 ? 0 : Math.abs(( newValue - oldValue ) / oldValue);
        }
        return undefined;
    }

    getTrend(newValue: MayBe<number>, oldValue: MayBe<number>): Trend {
        if (newValue && oldValue) {
            return (newValue - oldValue) === 0 ? "stable" : (newValue - oldValue) > 0 ? "increase" : "decrease";
        }
        return undefined;
    }

    getTrendEvaluation(trend: Trend, asc: MayBe<boolean>): Evaluation {
        switch (trend) {
            case "increase":
                return asc && !!asc ? "ok" : "ko";
            case "decrease":
                return asc && !!asc ? "ko" : "ok";
            case "stable":
                return "stable";
            default:
                return undefined;
        }
    }

    protected getBasicValue(data: Results | DatasetError, operation: MayBe<string>, valueLocation: MayBe<string>, valueField: MayBe<StatValueField>): MayBe<number> {
        if (!operation) {
            return this.extractStatValue(data, valueLocation, valueField);
        } else {
            switch (operation) {
                case "avg":
                    return this.aggregate(data, valueLocation);
                default:
                    return undefined;
            }
        }
    }

    protected computeBasicValue(value1: MayBe<number>, value2: MayBe<number>, computation: string): MayBe<number> {
        switch (computation) {
            case "division":
                return this.divide(value1, value2);
            case "percentage":
                return this.divide(value1, value2) ? this.divide(value1, value2) : undefined;
            default:
                return undefined;
        }
    }

}
