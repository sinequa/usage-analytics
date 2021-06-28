import { Component, Input, SimpleChanges,  OnChanges} from '@angular/core';

import { Results, DatasetError} from '@sinequa/core/web-services';
import { DashboardItem } from '../dashboard.service';
import { StatProvider } from '../providers/stat.provider';


export type Trend = "increase" | "decrease" | "stable" | undefined;
export type Evaluation = "ok" | "ko" | "stable" | undefined;
@Component({
    selector: 'sq-audit-stat',
    templateUrl: './audit-stat.component.html',
    styleUrls: ['./audit-stat.component.scss'],
    providers: [StatProvider]
})
export class AuditStatComponent implements OnChanges {
    @Input() config: DashboardItem;
    @Input() dataset: {[key: string]: Results | DatasetError};
    @Input() previousDataSet: {[key: string]: Results | DatasetError};
    @Input() decimalsPrecision: number = 1;

    value: number | undefined;
    trend: Trend;
    trendEvaluation: Evaluation;
    percentageChange: number | undefined;

    constructor(public statProvider: StatProvider) {}

    ngOnChanges(changes: SimpleChanges) {

        if (changes["previousDataSet"] && this.previousDataSet && this.dataset) {
            let current: number | undefined;
            let previous: number | undefined;
            let relatedCurrent: number | undefined;
            let relatedPrevious: number | undefined;
            current = this.getBasicValue(this.dataset[this.config.query], this.config.operation, this.config.valueLocation);
            previous = this.getBasicValue(this.previousDataSet[this.config.query], this.config.operation, this.config.valueLocation);
            if (!this.config.computation) {
                this.value = this.roundValue(current);
                this.percentageChange = this.getPercentageChange(current, previous);
                this.trend = this.getTrend(current, previous)
            } else {
                relatedCurrent = this.getBasicValue(this.dataset[this.config.relatedQuery!], this.config.relatedOperation, this.config.relatedValueLocation);
                relatedPrevious = this.getBasicValue(this.previousDataSet[this.config.relatedQuery!], this.config.relatedOperation, this.config.relatedValueLocation);
                this.value = this.roundValue(this.computeBasicValue(current, relatedCurrent, this.config.computation));
                this.percentageChange = this.getPercentageChange(this.value, this.computeBasicValue(previous, relatedPrevious, this.config.computation));
                this.trend = this.getTrend(this.value, this.computeBasicValue(previous, relatedPrevious, this.config.computation));
            }
            this.trendEvaluation = this.getTrendEvaluation(this.trend, this.config.asc);
        }

    }

    getPercentageChange(newValue: number | undefined, oldValue: number | undefined): number | undefined {
        if (newValue && oldValue) {
            return this.roundValue((newValue - oldValue) === 0 ? 0 : 100 * Math.abs(( newValue - oldValue ) / oldValue));
        }
        return undefined
    }

    getTrend(newValue: number | undefined, oldValue: number | undefined): Trend {
        if (newValue && oldValue) {
            return (newValue - oldValue) === 0 ? "stable" : (newValue - oldValue) > 0 ? "increase" : "decrease"
        }
        return undefined
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

    private getBasicValue(data: Results | DatasetError, operation: string | undefined, valueLocation: string | undefined): number | undefined {
        if (!operation) {
            return this.statProvider.extractStatValue(data, valueLocation);
        } else {
            switch (operation) {
                case "avg":
                    return this.statProvider.aggregate(data, valueLocation);
                default:
                    return undefined;
            }
        }
    }

    private computeBasicValue(value1: number | undefined, value2: number | undefined, computation: string): number | undefined {
        switch (computation) {
            case "division":
                return this.statProvider.divide(value1, value2);
            case "percentage":
                return this.statProvider.divide(value1, value2) ? (this.statProvider.divide(value1, value2)! * 100) : undefined;
            default:
                return undefined;
        }
    }

    private roundValue(value: number | undefined): number | undefined {
        if (value) {
            const precision = Math.pow(10, this.decimalsPrecision);
            return Math.round(value * precision) / precision;
        }
        return undefined;
    }

}
