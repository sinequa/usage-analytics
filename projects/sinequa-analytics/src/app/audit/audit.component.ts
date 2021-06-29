import { Component, OnDestroy, QueryList, ViewChildren } from "@angular/core";
import { Action } from "@sinequa/components/action";
import { FacetConfig } from "@sinequa/components/facet";
import { SearchService } from "@sinequa/components/search";
import { UIService } from "@sinequa/components/utils";
import { AppService } from "@sinequa/core/app-utils";
import { LoginService } from "@sinequa/core/login";
import { Subscription } from "rxjs";
import { AuditService } from "./audit.service";
import { FACETS } from "./config";
import { Dashboard, DashboardService } from "./dashboard/dashboard.service";
import { skip } from 'rxjs/operators';
import {DashboardItemComponent} from "./dashboard/dashboard-item.component";
import {ExportService} from "./export.service";

@Component({
    selector: "sq-audit",
    templateUrl: "./audit.component.html",
    styleUrls: ["./audit.component.scss"],
})
export class AuditComponent implements OnDestroy {
    @ViewChildren(DashboardItemComponent) dashboardItems: QueryList<DashboardItemComponent>

    public dashboards: Dashboard[] = [];
    public dashboardActions: Action[];

    private _querySubscription: Subscription;
    private _loginSubscription: Subscription;

    constructor(
        public auditService: AuditService,
        public dashboardService: DashboardService,
        private ui: UIService,
        private searchService: SearchService,
        public loginService: LoginService,
        private appService: AppService,
        private exportService: ExportService
    ) {
        // When the screen is resized, we resize the dashboard row height, so that items keep fitting the screen height
        this.ui.addResizeListener((event) => {
            this.dashboardService.options.fixedRowHeight =
            (window.innerHeight - 255) / 10;
            this.dashboardService.updateOptions(this.dashboardService.options);
        });

        // Upon login (ie access to user settings) initialize the dashboard widgets and actions
        this._loginSubscription = this.loginService.events.subscribe((event) => {
            if (event.type === "session-start") {
                // searchService.query is not yet defined from url, need to force its value
                this.searchService.setQuery(this.searchService.getQueryFromUrl());

                // Request data upon login
                this.auditService.updateAuditFilters();
                this._querySubscription = this.searchService.queryStream
                                            .pipe(skip(1))
                                            .subscribe(() => this.auditService.updateAuditFilters());

                // Note: available dashboards and the default dashboard must be set post-login so that it can be overridden by the user settings
                this.dashboardService.setDefaultDashboard();
                this.dashboardActions = this.dashboardService.createDashboardActions();
            }
        });

    }

    exportCSV() {
        // exports
        const items = this.dashboardItems.map(item => item);
        this.exportService.export(this.dashboardService.dashboard.name, items);
    }

    /**
     * Returns the configuration of the facets displayed.
     * The configuration from the config.ts file can be overriden by configuration from
     * the app configuration on the server
     */
    public get facets(): FacetConfig[] {
        if(this.appService.app && this.appService.app.data && this.appService.app.data.facets){
        return <FacetConfig[]> <any> this.appService.app.data.facets;
        }
        return FACETS;
    }

    ngOnDestroy() {
        this._querySubscription?.unsubscribe();
        this._loginSubscription?.unsubscribe();
    }

    newDashboard(): void {
        this.dashboardService.newDashboard();
    }

    openDashboard(dashboard: Dashboard): void {
        this.dashboardService.openDashboard(dashboard);
    }

    saveDashboard(dashboard, $event): void {
        $event.stopPropagation();
        this.dashboardService.saveDashboard(dashboard);
    }

    shareDashboard(dashboard: Dashboard, $event): void {
        $event.stopPropagation();
        this.dashboardService.shareDashboard(dashboard);
    }

    markAsDefaultDashboard(dashboard, $event): void {
        $event.stopPropagation();
        this.dashboardService.markAsDefaultDashboard(dashboard);
    }

    deleteDashboard(dashboard: Dashboard, $event): void {
        $event.stopPropagation();
        this.dashboardService.deleteDashboard(dashboard);
    }

    /**
     * Whether the UI is in dark or light mode
     */
    isDark(): boolean {
        return document.body.classList.contains("dark");
    }
}
