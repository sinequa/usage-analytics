import { Component, OnDestroy } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { SearchService } from "@sinequa/components/search";
import { Utils } from "@sinequa/core/base";
import moment from "moment";
import { Subscription } from "rxjs";
import { AuditService, RelativeTimeRanges } from "../audit.service";

@Component({
    selector: "sq-audit-range-picker",
    templateUrl: "./audit-range-picker.component.html",
    styleUrls: ["./audit-range-picker.component.scss"],
})
export class AuditRangePickerComponent implements OnDestroy {
    public readonly relativeTimeRanges = [
        RelativeTimeRanges.Last30Mins,
        RelativeTimeRanges.Last1H,
        RelativeTimeRanges.Last3H,
        RelativeTimeRanges.Last6H,
        RelativeTimeRanges.Last12H,
        RelativeTimeRanges.Last24H,
        RelativeTimeRanges.Last7Days,
        RelativeTimeRanges.Last30Days,
        RelativeTimeRanges.Last90Days,
        RelativeTimeRanges.Last6M,
        RelativeTimeRanges.Last1Y,
        RelativeTimeRanges.Last2Y,
        RelativeTimeRanges.Last5Y,
    ];

    dateRangeControl: FormControl;
    form: FormGroup;
    showDateRangeOptions = false;
    displayedRange: string;

    private _querySubscription: Subscription;

    constructor(
        private formBuilder: FormBuilder,
        private auditService: AuditService,
        private searchService: SearchService
    ) {
        this.dateRangeControl = new FormControl([undefined, undefined]);
        this.form = this.formBuilder.group({
            dateRange: this.dateRangeControl,
        });

        this.dateRangeControl.valueChanges.subscribe((value: Date[]) => {
            this.auditService.auditRange$.next(value);
            this.showDateRangeOptions = false;
        });

        this._querySubscription = this.searchService.queryStream.subscribe(() => {
            const value = this.auditService.getAuditTimestampFromUrl();
            if (value) {
                if (Utils.isString(value)) {
                    this.displayedRange = value;
                } else {
                    this.displayedRange =
                        moment(value[0]).format(
                            moment.localeData().longDateFormat("L")
                        ) +
                        " - " +
                        moment(value[1]).format(
                            moment.localeData().longDateFormat("L")
                        );
                }
            }
        });
    }

    ngOnDestroy() {
        this._querySubscription?.unsubscribe();
    }

    toggleDateRangeOptions() {
        this.showDateRangeOptions = !this.showDateRangeOptions;
    }

    setAuditRange(value: string) {
        this.auditService.auditRange$.next(value);
        this.showDateRangeOptions = false;
    }
}
