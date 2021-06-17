import { Component, OnDestroy } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { NavigationEnd, Router } from "@angular/router";
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

    private routerSubscription: Subscription;

    constructor(
        private formBuilder: FormBuilder,
        public auditService: AuditService,
        protected router: Router
    ) {
        this.dateRangeControl = new FormControl([undefined, undefined]);
        this.form = this.formBuilder.group({
            dateRange: this.dateRangeControl,
        });

        this.dateRangeControl.valueChanges.subscribe((value: Date[]) => {
            this.auditService.auditRange$.next(value);
            this.showDateRangeOptions = false;
        });

        this.routerSubscription = this.router.events.subscribe({
            next: (event) => {
                if (event instanceof NavigationEnd) {
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
                }
            },
        });
    }

    ngOnDestroy() {
        this.routerSubscription.unsubscribe();
    }

    toggleDateRangeOptions() {
        this.showDateRangeOptions = !this.showDateRangeOptions;
    }

    setAuditRange(value: string) {
        this.auditService.auditRange$.next(value);
        this.showDateRangeOptions = false;
    }
}
