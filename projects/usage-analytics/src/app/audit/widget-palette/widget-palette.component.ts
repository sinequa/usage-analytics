import { Component, OnInit } from "@angular/core";
import { AppService } from "@sinequa/core/app-utils";
import { DashboardItemOption, DashboardService } from "../dashboard/dashboard.service";

@Component({
    selector: "sq-widget-palette",
    templateUrl: "./widget-palette.component.html",
    styleUrls: ["./widget-palette.component.scss"],
})
export class WidgetPaletteComponent implements OnInit {

    showPalette = false;
    palette: {name: string, items: DashboardItemOption[]}[];

    constructor(
        public dashboardService: DashboardService,
        public appService: AppService
    ) {
    }

    ngOnInit() {
        this.palette = this.dashboardService.getPalette();
    }

    togglePalette() {
        this.showPalette = !this.showPalette;
    }

    addWidget(item: DashboardItemOption) {
        this.dashboardService.addWidget(item);
    }

}
