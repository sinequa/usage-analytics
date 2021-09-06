import { Component, Input, SimpleChanges,  OnChanges} from '@angular/core';

import { Results, DatasetError} from '@sinequa/core/web-services';
import {AuditService} from '../../audit.service';
import { DashboardItem } from '../dashboard.service';
import { Evaluation, StatProvider, Trend } from '../providers/stat.provider';


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

    constructor(
        public statProvider: StatProvider,
        private auditService: AuditService
        ) {}
    
    /**
     * returns current range filter
     */
    get currentRange(): string | undefined {
        return this.auditService.currentFilter;
    }
    
    /**
     * returns previous range filter if defined
     */
    get previousRange(): string | undefined {
        const range = this.auditService.previousFilter;
        if(range === undefined) {
            return this.currentRange;
        }
        
        return range;
    }
    
    /**
     * returns the correct tooltip based on currentRange and previousRange values
     */
    get trendTooltip(): string {
        if( this.currentRange !== this.previousRange) {
            // here previous is a dates range
            return "msg#stat.trendTooltipPrevDates";
        }
        
        // here previous is undefined
        return "msg#stat.trendTooltip";
    }

    ngOnChanges(changes: SimpleChanges) {

        if (changes["previousDataSet"] && this.previousDataSet && this.dataset) {
            const {value, percentageChange, trend, trendEvaluation} = this.statProvider.getvalues(this.previousDataSet, this.dataset, this.config, this.decimalsPrecision);
            this.value = value;
            this.percentageChange = percentageChange;
            this.trend = trend;
            this.trendEvaluation = trendEvaluation;
        }
    }


}