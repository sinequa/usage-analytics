import { Injectable } from "@angular/core";
import { Dataset, DatasetError, Results } from "@sinequa/core/web-services";
import {DashboardItem} from "../dashboard.service";

export type Trend = "increase" | "decrease" | "stable" | undefined;
export type Evaluation = "ok" | "ko" | "stable" | undefined;

// to avoid using this syntaxe: T | undefined.
// eg: const a:MayBe<number> ==> const a: number | undefined;
type MayBe<T> = T | undefined;

@Injectable( { providedIn: 'root'})
export class StatProvider {

    defaultDecimalsPrecision = 1;

    constructor() {}

    extractStatValue(data: Results | DatasetError | undefined, valueLocation: MayBe<string>): MayBe<number> {
        if (data && data as Results) {
            switch (valueLocation) {
                case "aggregations":
                    if ((data as Results).aggregations && (data as Results).aggregations[0] && (data as Results).aggregations[0].items) {
                        return (data as Results).aggregations[0].items![0]?.count;
                    }
                    break;
                case "records":
                    if ((data as Results).records && (data as Results).records[0]) {
                        return (data as Results).records[0]["value"];
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

    aggregate(data: Results | DatasetError | undefined, valueLocation: string | undefined): number | undefined {
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

    average(items: number[] | undefined): number | undefined {
        if (items) {
            const sum = items.reduce((a, b) => a + b, 0);
            return (sum / items.length) || 0;
        }
        return undefined;
    }

    divide(dividend: number | undefined, divisor: number | undefined): number | undefined {
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
        decimalsPrecision = this.defaultDecimalsPrecision
        ): {value: MayBe<number>, previousValue: MayBe<number>, percentageChange: MayBe<number>, trend: Trend, trendEvaluation: Evaluation} {

        const current: number | undefined = this.getBasicValue(dataset[config.query], config.operation, config.valueLocation);
        const previous: number | undefined = this.getBasicValue(previousDataSet[config.query], config.operation, config.valueLocation);

        let relatedCurrent: number | undefined;
        let relatedPrevious: number | undefined;

        let value, previousValue, percentageChange, trend;

        if (!config.computation) {
            value = this.roundValue(current, decimalsPrecision);
            previousValue = this.roundValue(previous, decimalsPrecision);
            percentageChange = this.getPercentageChange(current, previous, decimalsPrecision);
            trend = this.getTrend(current, previous)
        } else {
            relatedCurrent = this.getBasicValue(dataset[config.relatedQuery!], config.relatedOperation, config.relatedValueLocation);
            relatedPrevious = this.getBasicValue(previousDataSet[config.relatedQuery!], config.relatedOperation, config.relatedValueLocation);
            value = this.roundValue(this.computeBasicValue(current, relatedCurrent, config.computation), decimalsPrecision);
            previousValue = this.roundValue(this.computeBasicValue(previous, relatedPrevious, config.computation), decimalsPrecision);
            percentageChange = this.getPercentageChange(value, previousValue);
            trend = this.getTrend(value, previousValue);
        }
        const trendEvaluation = this.getTrendEvaluation(trend, config.asc);

        return {value, previousValue, percentageChange, trend, trendEvaluation};
    }

    getPercentageChange(newValue: number | undefined, oldValue: number | undefined, decimalsPrecision = this.defaultDecimalsPrecision): number | undefined {
        if (newValue && oldValue) {
            return this.roundValue((newValue - oldValue) === 0 ? 0 : 100 * Math.abs(( newValue - oldValue ) / oldValue), decimalsPrecision);
        }
        return undefined;
    }

    getTrend(newValue: number | undefined, oldValue: number | undefined): Trend {
        if (newValue && oldValue) {
            return (newValue - oldValue) === 0 ? "stable" : (newValue - oldValue) > 0 ? "increase" : "decrease";
        }
        return undefined;
    }

    getTrendEvaluation(trend: Trend, asc: boolean | undefined): Evaluation {
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

    protected getBasicValue(data: Results | DatasetError, operation: string | undefined, valueLocation: string | undefined): number | undefined {
        if (!operation) {
            return this.extractStatValue(data, valueLocation);
        } else {
            switch (operation) {
                case "avg":
                    return this.aggregate(data, valueLocation);
                default:
                    return undefined;
            }
        }
    }

    protected computeBasicValue(value1: number | undefined, value2: number | undefined, computation: string): number | undefined {
        switch (computation) {
            case "division":
                return this.divide(value1, value2);
            case "percentage":
                return this.divide(value1, value2) ? (this.divide(value1, value2)! * 100) : undefined;
            default:
                return undefined;
        }
    }

    protected roundValue(value: number | undefined, decimalsPrecision = this.defaultDecimalsPrecision): number | undefined {
        if (value) {
            const precision = Math.pow(10, decimalsPrecision);
            return Math.round(value * precision) / precision;
        }
        return undefined;
    }
}
