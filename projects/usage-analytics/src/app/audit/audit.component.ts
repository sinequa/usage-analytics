import { Component, ElementRef, OnDestroy, QueryList, ViewChild, ViewChildren } from "@angular/core";
import { Action } from "@sinequa/components/action";
import { FacetConfig, FacetListParams } from "@sinequa/components/facet";
import { SearchService } from "@sinequa/components/search";
import { UIService } from "@sinequa/components/utils";
import { AppService } from "@sinequa/core/app-utils";
import { LoginService } from "@sinequa/core/login";
import { Subscription } from "rxjs";
import { skip } from 'rxjs/operators';

import { AuditService } from "./audit.service";
import { FACETS } from "./config";
import { Dashboard, DashboardService } from "./dashboard/dashboard.service";
import {DashboardItemComponent} from "./dashboard/dashboard-item.component";
import {ExportService} from "./export.service";
import { ImportService } from "./import.service";
import { ConfirmType, ModalButton, ModalResult, ModalService } from "@sinequa/core/modal";

@Component({
    selector: "sq-audit",
    templateUrl: "./audit.component.html",
    styleUrls: ["./audit.component.scss"],
})
export class AuditComponent implements OnDestroy {
    @ViewChildren(DashboardItemComponent) dashboardItems: QueryList<DashboardItemComponent>
    @ViewChild("content", {static: false}) content: ElementRef;

    public exportAction: Action;

    public dashboards: Dashboard[] = [];
    public dashboardActions: Action[];

    // keep track of focused element
    public focusElementIndex: number;

    private _querySubscription: Subscription;
    private _loginSubscription: Subscription;
    private _dashboardChangesSubscription: Subscription;
    private _dashboardInitSubscription: Subscription;

    ready = false

    constructor(
        public auditService: AuditService,
        public dashboardService: DashboardService,
        private ui: UIService,
        private searchService: SearchService,
        public loginService: LoginService,
        private appService: AppService,
        private exportService: ExportService,
        private importService: ImportService,
        private modalService: ModalService
    ) {
        // When the screen is resized, we resize the dashboard row height, so that items keep fitting the screen height
        this.ui.addResizeListener((event) => {
            this.dashboardService.options.fixedRowHeight =
            (window.innerHeight - 255) / 10;
            this.dashboardService.updateOptions(this.dashboardService.options);
        });

        this._dashboardInitSubscription = this.dashboardService.dashboardsInit.subscribe(
            () => {
                // Properly display dashboards (default, opened ...)
                this.dashboardService.handleNavigation();
                this.dashboardService.setDefaultDashboard();
                this.dashboardActions = this.dashboardService.createDashboardActions();

                // Request data upon login
                this.auditService.updateAuditFilters();
                this._querySubscription = this.searchService.queryStream
                                            .pipe(skip(1))
                                            .subscribe(() => this.auditService.updateAuditFilters());

                this.ready = true
            }
        )

        // Upon login (ie access to user settings) initialize the dashboard widgets and actions
        this._loginSubscription = this.loginService.events.subscribe((event) => {
            if (event.type === "login-complete" || event.type === "session-start") {

                // Hack to fake a CCQuery so the search service works even if no query is attached to the app. (SBA-320)
                if(!this.appService.defaultCCQuery) {
                    this.appService['_defaultCCQuery'] = {};
                }

                // searchService.query is not yet defined from url, need to force its value
                this.searchService.setQuery(this.searchService.getQueryFromUrl());

                // Note: available dashboards and the default dashboard must be set post-login so that it can be overridden by the user settings
                this.dashboardService.initDashboards();
            }
        });

        // When adding a widget, layout could be broken unless we minimize any maximized widget
        this._dashboardChangesSubscription = this.dashboardService.dashboardChanged.subscribe(event => {
            if(event.type === 'ADD_WIDGET') {
                this.toggleMaximized();
            }
        })

        this.exportAction = new Action({
            icon: "fas fa-file-alt",
            name: "export/import",
            children: [
                this.getDataAction(),
                new Action({separator: true}),
                this.getLayoutAction(),
                new Action({separator: true}),
                ...this.getDashboardsDefAction()
            ]
        })

    }

    ngOnDestroy() {
        this._querySubscription?.unsubscribe();
        this._loginSubscription?.unsubscribe();
        this._dashboardChangesSubscription?.unsubscribe();
        this._dashboardInitSubscription?.unsubscribe();
    }

    /**
     * Returns the configuration of the facets displayed.
     * The configuration from the config.ts file can be overriden by configuration from
     * the app configuration on the server
     */
    public get facets(): FacetConfig<FacetListParams>[] {
        return this.appService.app?.data?.facets as any || FACETS;
    }

    getDataAction(): Action {
        return new Action({
            name: "Export dashboard data",
            title: "Export dashboard data",
            text: "Export dashboard data",
            children: [
                new Action({
                    title: "As Excel",
                    text: "As Excel",
                    name: "exportAsXLS",
                    action: () => this.exportXLSX()
                }),
                new Action({
                    title: "As CSV",
                    text: "As CSV",
                    name: "exportAsCSV",
                    action: () => this.exportCSV()
                }),
                new Action({
                    title: "As XML",
                    text: "As XML",
                    name: "exportAsXML",
                    action: () => this.exportXML()
                }),
                new Action({
                    title: "As PNG image",
                    text: "As PNG image",
                    name: "exportAsPNG",
                    action: () => this.exportPNG()
                })
            ]
        })
    }

    getLayoutAction(): Action {
        return new Action({
            name: "Export dashboards layout as JSON",
            title: "Export dashboards layout as JSON",
            text: "Export dashboards layout as JSON",
            action: () => this.exportLayoutJson()
        })
    }

    getDashboardsDefAction(): Action[] {
        return [
            new Action({
                title: "Export dashboards definition as JSON",
                text: "Export dashboards definition as JSON",
                name: "Export dashboards definition as JSON",
                action: () => this.exportDefJson()
            }),
            new Action({
                title: "Import dashboards definition from JSON",
                text: "Import dashboards definition from JSON",
                name: "Import dashboards definition from JSON",
                action: () => this.importDefJson()
            })
        ]
    }

    exportPNG() {
        const name = this.dashboardService.formatMessage(this.dashboardService.dashboard.name);
        this.exportService.exportToPNG(name, this.content);
    }

    exportCSV() {
        const items = this.dashboardItems.map(item => item);
        const name = this.dashboardService.formatMessage(this.dashboardService.dashboard.name);
        this.exportService.exportToCsv(name, items);
    }

    exportXLSX() {
        const items = this.dashboardItems.map(item => item);
        const name = this.dashboardService.formatMessage(this.dashboardService.dashboard.name);
        this.exportService.exportXLSX(name, items);
    }

    exportXML() {
        const items = this.dashboardItems.map(item => item);
        const name = this.dashboardService.formatMessage(this.dashboardService.dashboard.name);
        this.exportService.exportToXML(name, items);
    }

    exportLayoutJson() {
        this.exportService.exportLayoutToJson("dashboards-layout", this.dashboardService.dashboards);
    }

    exportDefJson() {
        this.exportService.exportDefToJson("dashboards-definition", this.dashboardService.dashboards);
    }

    importDefJson() {
        this.importService.dashboardsDefFromJson();
    }

    resetDashboards() {
        const dashboards = this.dashboardService.getStandardDashboards().map(
            sd => this.dashboardService.createDashboard(sd.name, sd.items)
        );

        this.modalService
            .confirm({
                title: "Reset dashboards definition",
                message: "You are about to loose ALL your current dashboards definition. Do you want to continue?",
                buttons: [
                    new ModalButton({result: ModalResult.Cancel}),
                    new ModalButton({result: ModalResult.OK, text: "Confirm", primary: true})
                ],
                confirmType: ConfirmType.Warning
            }).then(res => {
                if(res === ModalResult.OK) {
                    this.dashboardService.overrideDashboards(dashboards, "reset");
                }
            });
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

    // Focus the clicked gridster-item
    // unset previous gridster-item if any
    setFocus(index: number, event: MouseEvent) {
        this.focusElementIndex = index;
    }

    toggleMaximized() {
        this.dashboardItems.find(item => item.isMaximized())?.toggleMaximizedView();
    }
}
