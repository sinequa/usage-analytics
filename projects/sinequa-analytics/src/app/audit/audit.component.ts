import { Component, OnDestroy } from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
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

@Component({
    selector: "sq-audit",
    templateUrl: "./audit.component.html",
    styleUrls: ["./audit.component.scss"],
})
export class AuditComponent implements OnDestroy {
    public dashboards: Dashboard[] = [];
    public dashboardActions: Action[];

    private routerSubscription: Subscription;
    private _loginSubscription: Subscription;

    constructor(
        public auditService: AuditService,
        public dashboardService: DashboardService,
        public ui: UIService,
        protected router: Router,
        protected route: ActivatedRoute,
        public searchService: SearchService,
        public loginService: LoginService,
        private appService: AppService
    ) {
        // When the screen is resized, we resize the dashboard row height, so that items keep fitting the screen height
        this.ui.addResizeListener((event) => {
            this.dashboardService.options.fixedRowHeight =
            (window.innerHeight - 255) / 6;
            this.dashboardService.updateOptions(this.dashboardService.options);
        });

        // Upon login (ie access to user settings) initialize the dashboard widgets and actions
        this._loginSubscription = this.loginService.events.subscribe(event => {
            if (event.type === "session-start") {
                // Request data upon login
                this.routerSubscription = this.router.events.subscribe({
                    next: (event) => {
                        if (event instanceof NavigationEnd) {
                            this.auditService.updateAuditFilters();
                        }
                    },
                });

                // Note: available dashboards and the default dashboard must be set post-login so that it can be overridden by the user settings
                this.dashboards = this.dashboardService.allDashboards;
                this.dashboardService.setDefaultDashboard();
                this.dashboardActions = this.dashboardService.createDashboardActions();
            }
        });
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
        this.routerSubscription?.unsubscribe();
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
