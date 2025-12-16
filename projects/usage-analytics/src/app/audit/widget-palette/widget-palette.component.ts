import { Component, HostListener, OnDestroy, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { ScoredAutocompleteItem, SuggestService } from "@sinequa/components/autocomplete";
import { SearchService } from "@sinequa/components/search";
import { AppService } from "@sinequa/core/app-utils";
import { debounceTime, distinctUntilChanged, merge, Subscription } from "rxjs";
import { DashboardItemOption, DashboardService } from "../dashboard/dashboard.service";

@Component({
    selector: "sq-widget-palette",
    templateUrl: "./widget-palette.component.html",
    styleUrls: ["./widget-palette.component.scss"],
    standalone: false
})
export class WidgetPaletteComponent implements OnInit, OnDestroy {

    showPalette = false;
    palette: {name: string, items: DashboardItemOption[]}[];

    searchText: FormControl = new FormControl<string|null>('');
    isFiltering = false;
    filteredWidgets: DashboardItemOption[];

    private _subscription: Subscription;
    private _filterSubscription: Subscription;

    constructor(
        public dashboardService: DashboardService,
        public searchService: SearchService,
        public appService: AppService,
        public suggestService: SuggestService
    ) {
        /** Update palette after each dashboard change OR after query change ( open new dashboard, shared dashboard ...) */
        this._subscription = merge(
                                    this.dashboardService.dashboardChanged,
                                    this.searchService.queryStream
                                )
                            .subscribe(() => {
                                    this.palette = this.getPalette();
                                    this.filterWidgets(this.searchText.value)
                                }
                            );

        /** If the search box is not empty, widgets are filtered and sorted according to a score of pertinence of the match */
        this._filterSubscription = this.searchText.valueChanges
                                        .pipe(debounceTime(500), distinctUntilChanged())
                                        .subscribe(
                                            (text: string) => this.filterWidgets(text)
                                        )
    }

    ngOnInit() {
        this.palette = this.getPalette()
    }

    ngOnDestroy() {
        this._subscription?.unsubscribe();
        this._filterSubscription?.unsubscribe();
    }

    getPalette(): {name: string, items: DashboardItemOption[]}[] {
        return this.dashboardService.getPalette()
                .map(
                    (p: {name: string, items: DashboardItemOption[]}) => ({
                        name: p.name,
                        items: p.items.filter(
                            (widget) => !this.dashboardService.dashboard.items.find((item) => (item.id === widget.id) && !!widget.unique)
                        )
                    })
                )
                .filter((p: {name: string, items: DashboardItemOption[]}) => p.items.length > 0);
    }

    filterWidgets(text: string) {
        this.isFiltering = !!text;
        this.suggestService.searchData(
            '',
            text,
            this.palette.flatMap((cat) => cat.items),
            (widget) => widget.title,
            (widget) => widget.info ? [widget.info] : [],
        ).then(
            (items) => this.filteredWidgets = items.map(
                                                        (el: ScoredAutocompleteItem<DashboardItemOption, "">) => (
                                                            {
                                                                ...el.data,
                                                                titleHighlight: (el["displayHtml"].indexOf("<small>") > -1) ? el["displayHtml"].substring(0, el["displayHtml"].indexOf("<small>")) : el["displayHtml"]
                                                            }
                                                        )
                                                    )
        )
    }

    getIcon(item: DashboardItemOption): string {
        switch (item.parameters.type) {
            case "timeline":
                return "fas fa-chart-line";
            case "chart":
            case "multiLevelPie":
                return "fas fa-chart-pie";
            case "stat":
                return "fas fa-chart-simple";
            case "grid":
                return "fas fa-th-list";
            case "heatmap":
                return "fas fa-th";
            case "multiLevelPie":
                return "fas fa-chart-pie";
            default:
                return "";
        }
    }


    togglePalette() {
        this.showPalette = !this.showPalette;
    }

    addWidget(item: DashboardItemOption) {
        this.dashboardService.addWidget(item);
    }

    @HostListener('window:click', [])
    clickOut() {
        this.showPalette = false;
    }

}
