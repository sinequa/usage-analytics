import { Component, HostListener, OnDestroy } from "@angular/core";
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

    /** List of relative time range options */
    public readonly relativeTimeRanges = Object.values(RelativeTimeRanges);

    /** Display the date selection options */
    showDateRangeOptions = false;

    /** Form for the date pickers */
    form: FormGroup;
    dateRangeControl: FormControl;
    applySamePeriodForTrendsControl: FormControl;
    customRangeForTrendsControl: FormControl;

    displayedRange: string;

    private _querySubscription: Subscription;

    constructor(
        private formBuilder: FormBuilder,
        private auditService: AuditService,
        private searchService: SearchService
    ) {
        // Create the form
        this.dateRangeControl = new FormControl([undefined, undefined]);
        this.applySamePeriodForTrendsControl = new FormControl(true);
        this.customRangeForTrendsControl = new FormControl([undefined, undefined]);

        this.form = this.formBuilder.group({
            dateRange: this.dateRangeControl,
            applySamePeriodForTrends: this.applySamePeriodForTrendsControl,
            customRangeForTrends: this.customRangeForTrendsControl
        });

        // Listen to form changes
        this.dateRangeControl.valueChanges.subscribe((value: Date[]) => {
            this.auditService.updateRangeFilter(value);
            this.showDateRangeOptions = false;
        });

        this.applySamePeriodForTrendsControl.valueChanges.subscribe((value: boolean) => {
            const customRange = this.customRangeForTrendsControl.value as (Date | undefined)[];
            if(!value && customRange[0] && customRange[1]) {
                this.auditService.updatePreviousRangeFilter(customRange as Date[]);
            }
            else if(!!this.auditService.previousRange) { // No need to reset the previous range if it is already undefined
                this.auditService.updatePreviousRangeFilter(undefined);
            }
        });

        this.customRangeForTrendsControl.valueChanges.subscribe((value: Date[]) => {
            this.auditService.updatePreviousRangeFilter(value);
        });

        // Subscribe to query stream to update the displayedRange
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

    /**
     * Toggle the visibility of the panel
     */
    toggleDateRangeOptions() {
        this.showDateRangeOptions = !this.showDateRangeOptions;
    }

    @HostListener('window:click', ['$event'])
    clickOut() {
        this.showDateRangeOptions = false;
    }

    /**
     * Select a predefined value from a button
     * @param value
     */
    setAuditRange(value: string) {
        this.auditService.updateRangeFilter(value);
        this.showDateRangeOptions = false;
    }
}
