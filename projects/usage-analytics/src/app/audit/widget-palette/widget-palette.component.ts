import { Component, HostListener, OnDestroy, OnInit } from "@angular/core";
import { SearchService } from "@sinequa/components/search";
import { AppService } from "@sinequa/core/app-utils";
import { merge, Subscription } from "rxjs";
import { DashboardItemOption, DashboardService } from "../dashboard/dashboard.service";

@Component({
    selector: "sq-widget-palette",
    templateUrl: "./widget-palette.component.html",
    styleUrls: ["./widget-palette.component.scss"],
})
export class WidgetPaletteComponent implements OnInit, OnDestroy {

    showPalette = false;
    palette: {name: string, items: DashboardItemOption[]}[];

    private _subscription: Subscription;

    constructor(
        public dashboardService: DashboardService,
        public searchService: SearchService,
        public appService: AppService
    ) {
        /** Update palette after each dashboard change OR after query change ( open new dashboard, shared dashboard ...)*/
        this._subscription = merge(this.dashboardService.dashboardChanged, this.searchService.queryStream)
                            .subscribe(() => this.palette = this.getPalette())
    }

    ngOnInit() {
        this.palette = this.getPalette()
    }

    ngOnDestroy() {
        this._subscription?.unsubscribe();
    }

    getPalette(): {name: string, items: DashboardItemOption[]}[] {
        return this.dashboardService.getPalette().map(
            (p: {name: string, items: DashboardItemOption[]}) => ({
                name: p.name,
                items: p.items.filter(
                    (widget) => !this.dashboardService.dashboard.items.find((item) => (item.title === widget.text) && !!widget.unique)
                )
            })
        )
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
