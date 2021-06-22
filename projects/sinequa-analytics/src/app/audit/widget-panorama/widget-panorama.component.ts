import { Component, OnDestroy } from "@angular/core";
import { PANORAMA } from "../config";
import { DashboardItemOption, DashboardService } from "../dashboard/dashboard.service";

@Component({
    selector: "sq-widget-panorama",
    templateUrl: "./widget-panorama.component.html",
    styleUrls: ["./widget-panorama.component.scss"],
})
export class WidgetPanoramaComponent implements OnDestroy {

    showPanorama = false;

    constructor(public dashboardService: DashboardService) {
    }

    ngOnDestroy() {
    }

    togglePanorama() {
        this.showPanorama = !this.showPanorama;
    }

    public get panorama(): {name: string, items: DashboardItemOption[]}[] {
        return PANORAMA;
    }

    addWidget(item: DashboardItemOption) {
        this.dashboardService.addWidget(item);
    }

}
