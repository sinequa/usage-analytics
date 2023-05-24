import { Component, HostListener } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from "@angular/forms";
import { AuditService } from "../audit.service";
import { RelativeTimeRanges } from "../config";

@Component({
    selector: "sq-audit-range-picker",
    templateUrl: "./audit-range-picker.component.html",
    styleUrls: ["./audit-range-picker.component.scss"],
})
export class AuditRangePickerComponent {

    /** List of relative time range options */
    public readonly relativeTimeRanges = Object.values(RelativeTimeRanges);

    /** Display the date selection options */
    showDateRangeOptions = false;

    /** Form for the date pickers */
    form: UntypedFormGroup;
    dateRangeControl: UntypedFormControl;
    applySamePeriodForTrendsControl: UntypedFormControl;
    customRangeForTrendsControl: UntypedFormControl;

    constructor(
        private formBuilder: UntypedFormBuilder,
        public auditService: AuditService
    ) {
        // Create the form
        this.dateRangeControl = new UntypedFormControl([undefined, undefined]);
        this.applySamePeriodForTrendsControl = new UntypedFormControl(true);
        this.customRangeForTrendsControl = new UntypedFormControl([undefined, undefined]);

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

    }

    /**
     * Toggle the visibility of the panel
     */
    toggleDateRangeOptions() {
        this.showDateRangeOptions = !this.showDateRangeOptions;
    }

    @HostListener('window:click', [])
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
