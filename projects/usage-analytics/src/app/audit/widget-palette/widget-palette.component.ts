import { Component } from "@angular/core";
import { AppService } from "@sinequa/core/app-utils";
import { PALETTE } from "../config";
import { DashboardItemOption, DashboardService } from "../dashboard/dashboard.service";

@Component({
    selector: "sq-widget-palette",
    templateUrl: "./widget-palette.component.html",
    styleUrls: ["./widget-palette.component.scss"],
})
export class WidgetPaletteComponent {

    showPalette = false;

    constructor(
        public dashboardService: DashboardService,
        public appService: AppService
    ) {
    }

    togglePalette() {
        this.showPalette = !this.showPalette;
    }

    public get palette(): {name: string, items: DashboardItemOption[]}[] {
        return this.appService.app?.data?.palette as any || PALETTE;
    }

    addWidget(item: DashboardItemOption) {
        this.dashboardService.addWidget(item);
    }

}
