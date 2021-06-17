import { Injectable } from "@angular/core";
import { DatasetError, Results } from "@sinequa/core/web-services";

@Injectable()
export class StatProvider {

    constructor() {}

    extractStatValue(data: Results | DatasetError, valueLocation: string | undefined): number | undefined {
        if (data as Results) {
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

    aggregate(data: Results | DatasetError, valueLocation: string | undefined): number | undefined {
        if (data as Results) {
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
        return undefined
    }

    divide(dividend: number | undefined, divisor: number | undefined): number | undefined {
        if (dividend && divisor) {
            return (dividend / divisor);
        }
        return undefined;
    }

}
