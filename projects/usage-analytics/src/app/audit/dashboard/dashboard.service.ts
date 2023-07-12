import { Injectable } from '@angular/core';
import { ValidatorFn, Validators } from '@angular/forms';
import { Router, UrlSerializer } from '@angular/router';
import { Clipboard } from '@angular/cdk/clipboard';
import { Location } from '@angular/common';
import { StrictUnion, Utils } from '@sinequa/core/base';
import { LoginService } from '@sinequa/core/login';
import { UserSettingsWebService } from '@sinequa/core/web-services';
import { ModalResult, ModalService, PromptOptions, ModalButton, ConfirmType } from '@sinequa/core/modal';
import { Action } from '@sinequa/components/action';
import { SearchService } from '@sinequa/components/search';
import { GridsterConfig, GridsterItem } from 'angular-gridster2';
import { NotificationsService } from '@sinequa/core/notification';
import { skip, Subject } from 'rxjs';
import { UserPreferences } from '@sinequa/components/user-settings';
import { IntlService } from '@sinequa/core/intl';
import { AggregationTimeSeries, RecordsTimeSeries } from './providers/timeline-provider';
import { PALETTE, STANDARD_DASHBOARDS, WIDGETS } from '../config';
import { ChartData } from './providers/chart-provider';
import { AppService } from '@sinequa/core/app-utils';
import { GridColDef } from './providers/grid-provider';
import { StatOperation, StatValueField, StatValueLocation } from './providers/stat.provider';
import { HeatmapData } from './providers/heatmap-provider';
import { MultiLevelPieConfig, MultiLevelPieQuery } from './providers/multi-level-pie-provider';

export interface TimelineParams {
    type: "timeline";
    queries: string[];
    chartType: "Timeline" | "Grid";
    aggregationsTimeSeries?: AggregationTimeSeries | AggregationTimeSeries[];
    recordsTimeSeries?: RecordsTimeSeries;
    showPreviousPeriod?: boolean;
    enableSelection?: boolean;
}

export interface ChartParams {
    type: "chart";
    query: string;
    chartType: "Column2D" | "Bar2D" | "Pie2D" | "doughnut2d" | "Column3D" | "Bar3D" | "Pie3D" | "doughnut3d" | "Grid";
    chartData: ChartData;
    enableSelection?: boolean;
}

export interface HeatmapParams {
    type: "heatmap";
    query: string;
    chartType: "Heatmap" | "Grid";
    chartData: HeatmapData;
    enableSelection?: boolean;
}

export interface MultiLevelPieParams {
    type: "multiLevelPie";
    multiLevelPieQueries: MultiLevelPieQuery[];
    multiLevelPieData: MultiLevelPieConfig[];
}

export interface StatParams {
    type: "stat"
    query: string;
    asc: boolean; // if the positive evaluation is at increase or decrease trend
    valueLocation?: StatValueLocation; // where to find value field
    valueField?: StatValueField; // how to access value field
    operation?: StatOperation; // operation to compute the value
    relatedQuery?: string, // query containing the second leg of the stat operands
    relatedValueLocation?: StatValueLocation; // where to find the value field of the second stat operands
    relatedValueField?: StatValueField, //how to access value field of the second stat operands
    relatedOperation?: StatOperation; // operation to compute the value of the second stat operands
    computation?: StatOperation; // operation to get the global value of the stat
    numberFormatOptions?: Intl.NumberFormatOptions; // options of formatting numbers
}

export interface GridParams {
    type: "grid"
    query: string;
    columns: GridColDef[];
    aggregation?: string;
    showTooltip?: boolean;
    enableSelection?: boolean;
}

export type DashboardItemParams = TimelineParams | ChartParams | HeatmapParams | MultiLevelPieParams | StatParams | GridParams;

/**
 * An interface to define a type of widget that can be added to the dashboard. This basic information
 * is used to create the widget from the palette.
 */
export interface DashboardItemOption {
    id: string;
    title: string;
    parameters: StrictUnion<DashboardItemParams>;
    icon?: string;
    unique?: boolean;
    info?: string;
}

export interface DashboardItemPosition {
    x?: number;
    y?: number;
    rows?: number;
    cols?: number;
}

/**
 * Interface storing the configuration of a widget. It must contain the minimal amount of information
 * to rebuild the widget's content (eg. for the preview we need an id and a query).
 * This configuration is stored in user settings and/or shared with other users, so it must not include
 * large objects or raw data (only the means to rebuild these objects or data).
 * This interface is an extension of GridsterItem, so that we store things like the position of each
 * widget in the dashboard.
 */
export interface DashboardItem<DashboardItemParams> extends GridsterItem {
    id: string;
    title: string;
    parameters: StrictUnion<DashboardItemParams>;
    icon?: string;
    unique?: boolean;
    info?: string;
    width?: number;
    height?: number;
}

/**
 * A dashboard configuration interface incl. a name and the configuration of each widget
 */
export interface Dashboard {
    name: string;
    items: DashboardItem<DashboardItemParams>[];
}

export interface DashboardChange {
    type: changeType,
    dashboard: Dashboard;
    updateDatasets: boolean;
    item?: DashboardItem<DashboardItemParams>;
}

export type changeType =
                'LOAD_DASHBOARD' |
                'LOAD_DEFAULT_DASHBOARD' |
                'LOAD_SHARED_DASHBOARD' |
                'OPEN_DASHBOARD' |
                'NEW_DASHBOARD' |
                'CHANGE_WIDGET_CONFIG' |
                'ADD_WIDGET' |
                'REMOVE_WIDGET' |
                'PLAIN_UI_CHANGE';

// Name of the "default dashboard" (displayed prior to any user customization)
export const defaultDashboardName = "msg#dashboards.newDashboard";

@Injectable({
    providedIn: 'root'
})
export class DashboardService {

    dashboards: Dashboard[] = [];

    /** Current active dashboard */
    dashboard: Dashboard;

    /** Default dashboard (active by default or if the user re-initializes the dashboard) */
    defaultDashboard: Dashboard;

    /** Newly created dashboards that are not yet saved */
    draftDashboards: Dashboard[] = [];

    /** A stored dashboards that are modified */
    changedDashboards: Dashboard[] = [];

    /** Options of the Gridster dashboard component*/
    options: GridsterConfig;

    /** Action objects part of the "dashboard actions" (returned by createDashboardActions()) */
    manualLayoutAction: Action;
    autoLayoutAction: Action;
    fixedLayoutAction: Action;
    saveDashboardAction: Action;

    /** A subject firing events when the dashboard changes */
    dashboardChanged = new Subject<DashboardChange>();

    /** A subject informing when dashboards list are initialized properly and ready to use */
    dashboardsInit = new Subject<boolean>();

    private forceReloadDefaultDashboard = false;

    constructor(
        public modalService: ModalService,
        public userSettingsService: UserSettingsWebService,
        public loginService: LoginService,
        public prefs: UserPreferences,
        public searchService: SearchService,
        public notificationService: NotificationsService,
        public router: Router,
        public location: Location,
        public urlSerializer: UrlSerializer,
        public clipboard: Clipboard,
        public intlService: IntlService,
        public appService: AppService
    ) {
        // Default options of the Gridster dashboard
        this.options = {
            swap: true,
            draggable: {
                enabled: true,
                ignoreContent: true, // By default, dragging is impossible
                dragHandleClass: 'card-header', // except in the facet header
                ignoreContentClass: 'btn-group', // *except* in the button group
            },
            resizable: {enabled: true},
            itemChangeCallback: (item, itemComponent) => {
                this.notifyItemChange(item as DashboardItem<DashboardItemParams>, 'PLAIN_UI_CHANGE');
            },
            itemResizeCallback: (item, itemComponent) => {
                if (!document.fullscreenElement) { // Exclude the change detection on switch from/to full-screen mode
                    /** Items must know their height/width to (re)size their content*/
                    if (!itemComponent.el.classList.contains('widget-maximized-view')) {
                        item.height = itemComponent.height;
                        item.width = itemComponent.width;
                    } else {
                        item.height = itemComponent.gridster.curHeight;
                        item.width = itemComponent.gridster.curWidth;
                    }
                }
            },
            scrollToNewItems: true, // Scroll to new items when inserted
            gridType: 'verticalFixed', // The grid has a fixed size vertically, and fits the screen horizontally
            fixedRowHeight: (window.innerHeight - 255) / 10,
            minRows: 6,
            minCols: 8,
            maxCols: 8
        };

        // Manage URL (query) changes (which may include dashboard name or config to be imported)
        // First detection === application load, must be ignored because dashboards are not yet available
        // It will be programmatically triggered once the init of dashboards is done
        this.searchService.queryStream.pipe(skip(1)).subscribe(() => {
            this.handleNavigation();
        })

        // Dashboards are stored in User Settings
        this.userSettingsService.events.subscribe(event => {
            // E.g. new login occurs
            // ==> settings need to be rebuilt
            if (this.loginService.complete) {
                this.setLayout(this.layout);
            }

        });

        // Manage Auto-save dashboards.
        this.dashboardChanged.subscribe((changes: DashboardChange) => {
            const dashboard = changes.dashboard;
            if (['NEW_DASHBOARD', 'LOAD_SHARED_DASHBOARD', 'CHANGE_WIDGET_CONFIG', 'ADD_WIDGET', 'REMOVE_WIDGET', 'PLAIN_UI_CHANGE'].includes(changes.type)) {
                // If a saved dashboard is modified, then add it to the changed dashboards list
                if (!dashboard.name.startsWith(this.formatMessage(defaultDashboardName))) {
                    const index = this.changedDashboards.findIndex(d => d.name === dashboard.name);
                    if (this.getDashboard(dashboard.name) && (index === -1)) {
                        this.changedDashboards.push(dashboard)
                    }
                    // Store the update in the list of dashboard
                    const i = this.dashboards.findIndex(d => d.name === dashboard.name);
                    this.dashboards[i] = dashboard;
                } else {
                    // If a draft dashboard is modified, then add it to the draft dashboards list
                    const i = this.draftDashboards.findIndex(d => d.name === dashboard.name);
                    this.draftDashboards[i] = dashboard;
                }
            }

            // if needed, update datasets and trigger search in order to consider the changes at data level
            if (changes.updateDatasets) {
                this.searchService.navigate({skipSearch: true});
            }
        });
    }

    /**
     * Handle URL changes. Retrieve a dashboard name or configuration if any, depending on
     * the params contained in the URL.
     */
    public handleNavigation() {
        const url = Utils.makeURL(this.router.url);
        const dashboard = url.searchParams.get("dashboard");
        const dashboardShared = url.searchParams.get("dashboardShared");
        // Dashboards are not available yet! (pending login complete...)
        if(dashboard && dashboard !== this.dashboard?.name) {
            this.searchService.queryStringParams.dashboard = dashboard;
            if(this.hasDashboard(dashboard)) {
                this.dashboard = this.getDashboard(dashboard)!;
                this.dashboardChanged.next({type: 'LOAD_DASHBOARD', dashboard: this.dashboard, updateDatasets: false});
            } else {
                this.notificationService.error("Could not find this dashboard...");
            }
        }
        else if(dashboardShared) {
            const db = Utils.fromJson(dashboardShared);
            if(db as DashboardItem<DashboardItemParams>[]) {
                this.setSharedDashboard(db);
            }
            else {
                this.notificationService.error("Could not import this dashboard...");
                console.error("Could not import this dashboard:", dashboardShared);
            }
        }
    }

    /**
     * Returns the list of widgets from the configuration defined
     * on the server (appService.app.data.widgets)
     * or in the config.ts file (WIDGETS)
     */
    public getWidgets(): {[key: string]: DashboardItemOption} {
        return (this.appService.app?.data?.widgets || WIDGETS) as {[key: string]: DashboardItemOption};
    }

    /**
     * Builds the palette of widgets from the configuration defined
     * on the server (appService.app.data.palette) or in the config.ts file (PALETTE)
     */
    public getPalette(): {name: string, items: DashboardItemOption[]}[] {
        // Construct palette from configuration
        const palette = this.appService.app?.data?.palette as any as {name: string, items: string[]}[] || PALETTE;
        const widgets = this.getWidgets();
        return palette.map(p => ({
                name: p.name,
                items: p.items.filter(i => Utils.isString(i) && widgets[i])
                            .map(i => widgets[i])
            }));
    }

    /**
     * Returns the list of standard dashboard from the configuration defined
     * on the server (appService.app.data.standardDashboards) or in the config.ts file (STANDARD_DASHBOARDS)
     */
    public getStandardDashboards(): {name: string, items: {item: DashboardItemOption, position: DashboardItemPosition}[]}[] {
        const dashboards = this.appService.app?.data?.standardDashboards as any as {name: string, items: {item: string, position: DashboardItemPosition}[]}[]
                            || STANDARD_DASHBOARDS;
        const widgets = this.getWidgets();
        return dashboards.map(d => ({
                name: d.name,
                items: d.items.filter(i => Utils.isString(i.item) && widgets[i.item])
                            .map(i => ({item: widgets[i.item], position: i.position}))
            }));
    }

    /**
     * Returns the list of this user's dashboards.
     * The list is stored in the user settings (this is a redirection).
     * It creates the list of dashboards if it does not already exist.
     * It takes care of notifying the user of new available updates comparing to its own version
     */
    initDashboards(): void {
        /** Create a hash of the last used standard dashboards */
        const standardDashboards = this.getStandardDashboards().map(
            sd => this.createDashboard(sd.name, sd.items)
        );
        const standardDashboardsHash = Utils.sha512(JSON.stringify(standardDashboards));

        /** Create a hash of the last used widgets' version */
        const standardWidgetsHash = Utils.sha512(JSON.stringify(this.getWidgets()));

        if(!this.userSettingsService.userSettings) {
            this.userSettingsService.userSettings = {};
        }

        // If nothing is stored in the user settings, then we just use the standard dashboards
        if(!this.userSettingsService.userSettings["dashboards"]) {
            this.userSettingsService.userSettings["dashboards"] = standardDashboards;
            this.prefs.set("standard-dashboards-hash", standardDashboardsHash); // Store the hash of the last used standard dashboards' version
            this.prefs.set("standard-widgets-hash", standardWidgetsHash); // Store the hash of the last used standard widgets' version
            this.prefs.delete("skipped-hash")// Once hashes are updated, "skipped hash" must be cleared
            this.dashboards = this.userSettingsService.userSettings["dashboards"];
            this.dashboardsInit.next(true);
        } else { // If the user has its own version, then we need to check for potential updates and how he wants to manage them
            const condition = ( standardDashboardsHash !== this.prefs.get("standard-dashboards-hash") ||
                                standardWidgetsHash !== this.prefs.get("standard-widgets-hash") )
                            && standardDashboardsHash !== this.prefs.get("skipped-hash")
            if (condition) { // updates are detected, user should decide what to do
                this.modalService
                    .confirm({
                        title: "Available updates !",
                        message: "Changes have been made to default dashboards/widgets. Do you want to update your own version ?",
                        buttons: [
                            new ModalButton({result: ModalResult.No, text: "See no more"}),
                            new ModalButton({result: ModalResult.Ignore, text: "Remind me later"}),
                            new ModalButton({result: ModalResult.OK, text: "Update", primary: true})
                        ],
                        confirmType: ConfirmType.Warning
                    }).then(res => {
                        if(res === ModalResult.OK) {
                            this.userSettingsService.patch({dashboards: standardDashboards}).subscribe(
                                () => {},
                                () => {},
                                () => {
                                    /**
                                     * Update Hashes
                                     */
                                    this.prefs.set("standard-dashboards-hash", standardDashboardsHash); // Update the hash of the last used standard dashboards' version
                                    this.prefs.set("standard-widgets-hash", standardWidgetsHash); // Update the hash of the last used standard widgets' version
                                    this.prefs.delete("skipped-hash") // Once hashes are updated, "skipped hash" must be cleared
                                    this.prefs.delete("dashboard-default") // Previous default dashboard may not be present in the new version. Thus, need to clear this information

                                    /**
                                     * Redraw the UI
                                     */
                                    this.dashboards = standardDashboards; // Assign the new value to dashboards
                                    this.searchService.queryStringParams = {}; // Remove all queryStringParams (dashboard, dashboardShared ...) from the url
                                    this.searchService.clearQuery(); // Clear the query (remove all eventually applied filters)
                                    this.searchService.navigate({skipSearch: true}).then(() => this.dashboardsInit.next(true)); // Trigger the local refreshing of the UI
                                }
                            )
                        } else if(res === ModalResult.No) {
                            this.prefs.set("skipped-hash", standardDashboardsHash); // Do not notify the user about changes while this skipped version is not updated
                            this.dashboards = this.userSettingsService.userSettings!["dashboards"];
                            this.dashboardsInit.next(true);
                        } else {
                            this.dashboards = this.userSettingsService.userSettings!["dashboards"];
                            this.dashboardsInit.next(true);
                        }
                    });
            } else { // No updates Or updates are skipped, then just pick the version in the user settings
                this.dashboards = this.userSettingsService.userSettings!["dashboards"];
                this.dashboardsInit.next(true);
            }
        }
    }

    public get allDashboards(): Dashboard[] {
        return this.dashboards.concat(this.draftDashboards);
    }

    public createDashboard(name: string, items: {item: DashboardItemOption, position: DashboardItemPosition}[] = []): Dashboard {
        const dashboard = {
            name: name,
            items: []
        };
        items.forEach(item => this.addWidget(item.item, dashboard, false, item.position.rows, item.position.cols, item.position.x, item.position.y));
        return dashboard;
    }

    /**
     * Tests whether a dashboard name exists or not in the user settings
     * @param dashboard
     */
    public hasDashboard(dashboard: string): boolean {
        return !!this.getDashboard(dashboard);
    }

    /**
     * Retrieves a dashboard configuration from the user settings
     * @param name
     */
    public getDashboard(name: string): Dashboard | undefined {
        return this.dashboards.find(d => this.formatMessage(d.name) === this.formatMessage(name));
    }

    /**
     * Sets the configuration for the "default dashboard" (dashboard displayed by default or
     * when the user reinitializes the dashboard).
     * @param items
     */
    public setDefaultDashboard() {
        // The default dashboard may have been customized by the user, in which case we ignore the "items" input
        const defaultDashboard = this.prefs.get("dashboard-default");
        if(defaultDashboard && this.hasDashboard(defaultDashboard)) {
            this.defaultDashboard = Utils.copy(this.getDashboard(defaultDashboard)!);
        }
        // There is no user-customized default dashboard: we use the first standard dashboard
        else if (this.dashboards[0]) {
            this.defaultDashboard = Utils.copy(this.dashboards[0]);
            // Store the name of the saved default dashboard for resetting it upon next login
            this.prefs.set("dashboard-default", this.defaultDashboard.name);
        }
        // If there is no dashboard explicitly opened currently, we open the default one if defined. If not open a new blank dashboard
        if(!this.dashboard || this.forceReloadDefaultDashboard) {
            const name = this.formatMessage(defaultDashboardName) + ' ' + (this.draftDashboards.length+1);
            const _blank = this.createDashboard(name);
            this.dashboard = Utils.copy(this.defaultDashboard ? this.defaultDashboard : _blank); // Default dashboard is kept as a deep copy, so we don't change it by editing the dashboard
            this.dashboardChanged.next({type: 'LOAD_DEFAULT_DASHBOARD', dashboard: this.dashboard, updateDatasets: false});
            this.forceReloadDefaultDashboard = false;
        }
    }

    /**
     * Load shared dashboard, as a new draft dashboard, based on its given items
     * @param items
     */
    public setSharedDashboard(items: DashboardItem<DashboardItemParams>[]) {
        const name = this.formatMessage(defaultDashboardName) + ' ' + (this.draftDashboards.length+1);
        const _shared = {name: name, items};
        this.draftDashboards.push(_shared)
        this.dashboard = Utils.copy(_shared);
        this.dashboardChanged.next({type: 'LOAD_SHARED_DASHBOARD', dashboard: this.dashboard, updateDatasets: true});
    }

    /**
     * A dashboard is considered saved if it has a name that is not among the draft and changed dashboards list
     */
    public isDashboardSaved(dashboard = this.dashboard): boolean {
        return this.defaultDashboard
                && !!dashboard
                && !dashboard.name.startsWith(this.formatMessage(defaultDashboardName))
                && !this.changedDashboards.find(d => d.name === dashboard.name);
    }

    /**
     * Fire an event when a dashboard item changes
     * @param item
     */
    public notifyItemChange(item: DashboardItem<DashboardItemParams>, event: changeType, notify = false) {
        this.dashboardChanged.next({type: event, dashboard: this.dashboard, updateDatasets: notify, item});
    }

    /**
     * Update the Gridster options
     * @param options
     */
    public updateOptions(options: GridsterConfig) {
        this.options = options;
        this.options.api?.optionsChanged!();
    }

    /**
     * Add a new widget to the dashboard. If not defined, the widget is added at x = y = 0 so that Gridster automatically
     * finds a good spot to insert the widget.
     * @param option a DashboardItemOption, containing among other thing the type of widget to be created
     * @param dashboard a Dashboard object (default to the currently active widget)
     * @param rows the number of rows that this widget should take in the dashboard
     * @param cols the number of columns that this widget should take in the dashboard
     * @param closable whether this widget is closable (default to true)
     */
    public addWidget(
            option: DashboardItemOption,
            dashboard: Dashboard = this.dashboard,
            notify = true,
            rows = (option.parameters.type === "stat" ? 2 : 4),
            cols = (option.parameters.type === "stat" ? 1 : 3),
            x = 0,
            y = 0,
            closable = true): DashboardItem<DashboardItemParams> {

        let item = {
            x: x,
            y: y,
            rows,
            cols,
            closable: closable,
            ...option
        };

        dashboard.items.push(item);
        if (notify) {
            this.dashboardChanged.next({type: 'ADD_WIDGET', dashboard: dashboard, updateDatasets: true});
        }
        return dashboard.items[dashboard.items.length - 1];
    }

    /**
     * Remove a widget from the dashboard
     * @param item
     */
    public removeItem(item: DashboardItem<DashboardItemParams>) {
        this.dashboard!.items.splice(this.dashboard.items.indexOf(item), 1);
        this.notifyItemChange(item, 'REMOVE_WIDGET');
    }

    /**
     * Rename a widget in the dashboard
     * @param item
     * @param newTitle
     */
    public renameWidget(item: DashboardItem<DashboardItemParams>, newTitle: string) {
        item.title = newTitle;
        this.notifyItemChange(item, 'CHANGE_WIDGET_CONFIG');
    }

    /**
     * Open a dialog to submit a new name for a given widget
     * @param item
     */
    public renameWidgetModal(item: DashboardItem<DashboardItemParams>) {

        const model: PromptOptions = {
            title: 'msg#dashboard.renameWidget',
            message: 'msg#dashboard.renameWidgetMessage',
            buttons: [],
            output: this.formatMessage(item.title),
            validators: [Validators.required]
        };

        this.modalService.prompt(model).then(res => {
            if(res === ModalResult.OK) {
                this.renameWidget(item, model.output);
            }
        });
    }

    /**
     * Creates a list of Action objects that allow to interact with dashboards.
     * These actions are meant to be displayed next to the dashboard within a menu
     * component.
     * The actions include:
     * - Changing the layout mode of Gridster
     * - auto Saving the dashboard
     */
    public createSettingsActions(): Action {

        // Action to select the "manual" layout mode
        this.manualLayoutAction = new Action({
            text: 'msg#dashboard.manual',
            title: 'msg#dashboard.manualTitle',
            selected: false,
            action: () => {
                if(!this.manualLayoutAction.selected) {
                    this.setLayout("manual");
                }
            }
        });
        // Action to select the "auto" layout mode
        this.autoLayoutAction = new Action({
            text: 'msg#dashboard.auto',
            title: 'msg#dashboard.autoTitle',
            selected: false,
            action: () => {
                if(!this.autoLayoutAction.selected) {
                    this.setLayout("auto");
                }
            }
        });
        // Action to select the "fixed" layout mode
        this.fixedLayoutAction = new Action({
            text: 'msg#dashboard.fixed',
            title: 'msg#dashboard.fixedTitle',
            selected: false,
            action: () => {
                if(!this.fixedLayoutAction.selected) {
                    this.setLayout("fixed");
                }
            }
        });
        if(this.loginService.complete) {
            this.setLayout(this.layout);
        }

        // Assemble the actions into one menu
        const settingsAction = new Action({
            icon: 'fas fa-gear',
            title: 'msg#dashboard.settingsTitle',
            children: [
                this.manualLayoutAction,
                this.autoLayoutAction,
                this.fixedLayoutAction
            ],
        });

        return settingsAction;
    }

    public openDashboard(dashboard: Dashboard) {
        this.dashboard = dashboard;
        this.searchService.queryStringParams.dashboard = dashboard.name;
        this.dashboardChanged.next({type: 'OPEN_DASHBOARD', dashboard: this.dashboard, updateDatasets: true});
    }

    public saveDashboard(dashboard: Dashboard) {
        if(!this.isDashboardSaved(dashboard) && !this.changedDashboards.find(d => d.name === dashboard.name)){
            this.saveAs(dashboard);
        }
        else {
            const callback = () => {
                const index = this.changedDashboards.findIndex(d => d.name === dashboard.name);
                this.changedDashboards.splice(index, 1);
            }
            this.patchDashboards(true, undefined, callback);
        }
    }

    public overrideDashboards(dashboards: Dashboard[], event: 'import' | 'reset') {
        this.userSettingsService
            .patch({dashboards: dashboards})
            .subscribe(
                () => {},
                (error) => {
                    this.notificationService.error("Could not " + event + " dashboards definition !");
                    console.error("Could not  " + event + "  dashboards definition !", error);
                },
                () => {
                    /**
                     * Update Hashes
                     */
                    const standardDashboardsHash = Utils.sha512(JSON.stringify(dashboards));
                    const standardWidgetsHash = Utils.sha512(JSON.stringify(this.getWidgets()));
                    this.prefs.set("standard-dashboards-hash", standardDashboardsHash); // Update the hash of the last used standard dashboards' version
                    this.prefs.set("standard-widgets-hash", standardWidgetsHash); // Update the hash of the last used standard widgets' version
                    this.prefs.delete("skipped-hash")// Once hashes are updated, "skipped hash" must be cleared
                    this.prefs.delete("dashboard-default") // Previous default dashboard may not be present in the new version. Thus, need to clear this information

                    /**
                     * Redraw the UI
                     */
                    this.dashboards = dashboards; // Assign the new value to dashboards
                    this.searchService.queryStringParams = {}; // Remove all queryStringParams (dashboard, dashboardShared ...) from the url
                    this.searchService.clearQuery(); // Clear the query (remove all eventually applied filters)
                    this.searchService.navigate({skipSearch: true}).then(() => { // Trigger the local refreshing of the UI
                        this.forceReloadDefaultDashboard = true; // Needed to force redraw the displayed dashboard based on new overriding dashboards
                        this.dashboardsInit.next(true);
                    });
                }
            );
    }

    /**
     * Creates a new dashboard (from scratch)
     */
    public newDashboard() {
        const name = this.formatMessage(defaultDashboardName) + ' ' + (this.draftDashboards.length+1);
        const _blank = this.createDashboard(name);
        this.draftDashboards.push(_blank);
        this.dashboard = Utils.copy(_blank);
        delete this.searchService.queryStringParams.dashboard;
        this.dashboardChanged.next({type: 'NEW_DASHBOARD', dashboard: this.dashboard, updateDatasets: true});
    }

    public renameDashboard(dashboard: Dashboard) {
        const originalName = dashboard.name;
        const unique : ValidatorFn = (control) => {
            const checkUnique = !control.value?.startsWith(this.formatMessage(defaultDashboardName)) && (!this.getDashboard(control.value) || control.value === originalName);
            if(!checkUnique) return {unique: true};
            return null;
        };

        const model: PromptOptions = {
            title: 'msg#dashboard.renameModalTitle',
            message: 'msg#dashboard.saveAsModalMessage',
            buttons: [],
            output: '',
            validators: [Validators.required, unique]
        };

        this.modalService.prompt(model).then(res => {
            if(res === ModalResult.OK) {
                dashboard.name = model.output;
                // Update User settings
                const callback = () => {
                    // Update URL (store dashboard name in the queryParams) and navigate to the newly renamed dashboard
                    this.searchService.queryStringParams.dashboard = model.output; // Needed when refreshing the page
                    this.searchService.navigate({skipSearch: true});
                }
                this.patchDashboards(true, undefined, callback);

            }
        });
    }

    public deleteDashboard(dashboard: Dashboard) {
        this.modalService.confirm({
            title: "msg#dashboard.deleteConfirmTitle",
            message: "msg#dashboard.deleteConfirmMessage",
            messageParams: {values: {dashboard: this.formatMessage(dashboard.name)}},
            confirmType: ConfirmType.Warning,
            buttons: [
                new ModalButton({
                    result: ModalResult.OK,
                    primary: true
                }),
                new ModalButton({
                    result: ModalResult.Cancel
                })
            ]
        }).then(value => {
            if(value === ModalResult.OK) {
                const index = this.allDashboards.findIndex(d => d.name === dashboard.name);
                const callback = () => {
                    // Open next/previous dashboard. If not existing, create new empty dashboard
                    if (this.allDashboards[index]) {
                        this.dashboard = Utils.copy(this.allDashboards[index]);
                        delete this.searchService.queryStringParams.dashboard;
                        this.dashboardChanged.next({type: 'OPEN_DASHBOARD', dashboard: this.dashboard, updateDatasets: true});
                    } else if (this.allDashboards[index - 1]) {
                        this.dashboard = Utils.copy(this.allDashboards[index - 1]);
                        delete this.searchService.queryStringParams.dashboard;
                        this.dashboardChanged.next({type: 'OPEN_DASHBOARD', dashboard: this.dashboard, updateDatasets: true});
                    } else {
                        this.newDashboard();
                    }
                }

                // Delete the dashboard
                if (this.isDashboardSaved(dashboard)) {
                    const i = this.dashboards.findIndex(d => d.name === dashboard.name);
                    this.dashboards.splice(i, 1);
                    this.patchDashboards(false, undefined, callback);
                    if(this.prefs.get("dashboard-default") === dashboard.name) {
                        this.prefs.delete("dashboard-default");
                    }
                }
                else {
                    const i = this.draftDashboards.findIndex(d => d.name === dashboard.name);
                    this.draftDashboards.splice(i, 1);
                    callback();
                }
            }
        });
    }

    public shareDashboard(dashboard: Dashboard) {
        const db = Utils.toJson(dashboard.items);
        const query = this.searchService.query.toJsonForQueryString();
        const urlTree = this.router.createUrlTree(['/audit'], {queryParams: {query, dashboardShared: db}});
        const url = window.location.origin+window.location.pathname+this.location.prepareExternalUrl(this.urlSerializer.serialize(urlTree));
        if(this.clipboard.copy(url)) {
            this.notificationService.success("msg#dashboard.shareSuccess");
        }
        else {
            this.notificationService.warning("msg#dashboard.shareError", {url});
        }
    }

    public markAsDefaultDashboard(dashboard: Dashboard) {
        this.modalService.confirm({
            title: "msg#dashboard.setDefaultConfirmTitle",
            message: "msg#dashboard.setDefaultConfirm",
            messageParams: {values: {dashboard: this.formatMessage(dashboard.name)}},
            buttons: [
                new ModalButton({
                    result: ModalResult.OK,
                    primary: true
                }),
                new ModalButton({
                    result: ModalResult.Cancel
                })
            ]
        }).then(res => {
            if(res === ModalResult.OK) {
                if (this.isDashboardSaved(dashboard) && !this.isDefaultDashboard(dashboard)) {
                    // Make the dashboard as the default one (locally)
                    this.defaultDashboard = Utils.copy(dashboard);
                    // Store the name of the saved default dashboard for resetting it upon next login
                    this.prefs.set("dashboard-default", this.defaultDashboard.name);
                    // Notify user that this worked
                    this.notificationService.success("msg#dashboard.setDefaultSuccess", {dashboard: this.formatMessage(dashboard.name)});
                } else {
                    this.notificationService.error("Could not mark the dashboard as default...");
                    console.error("Could not mark the dashboard as default:", this.formatMessage(dashboard.name));
                }
            }
        });
    }

    /**
     * Wether the dashboard has been the defined as default dashboard
     */
    public isDefaultDashboard(dashboard: Dashboard): boolean {
        return dashboard && dashboard.name === this.prefs.get("dashboard-default");
    }

    /**
     * Modifies the layout mode of the Gridster dashboard
     * @param layout
     */
    protected setLayout(layout: string) {
        if(layout === "auto") {
            this.options.compactType = 'compactLeft&Up';
            this.options.draggable!.enabled = true;
            this.options.resizable!.enabled = true;
        }
        else if (layout === "fixed") {
            this.options.compactType = 'none';
            this.options.draggable!.enabled = false;
            this.options.resizable!.enabled = false;
        }
        else {
            this.options.compactType = 'none';
            this.options.draggable!.enabled = true;
            this.options.resizable!.enabled = true;
        }
        this.options.api?.optionsChanged!();
        this.prefs.set("dashboard-layout", layout);
        this.manualLayoutAction.selected = this.layout === "manual";
        this.autoLayoutAction.selected = this.layout === "auto";
        this.fixedLayoutAction.selected = this.layout === "fixed";
    }

    /**
     * Prompts the user for a name and saves the dashboard under this name in the
     * user settings.
     */
    protected saveAs(dashboard: Dashboard) {

        const originalName = dashboard.name;
        const unique : ValidatorFn = (control) => {
            const checkUnique = !control.value?.startsWith(this.formatMessage(defaultDashboardName)) && !this.getDashboard(control.value);
            if(!checkUnique) return {unique: true};
            return null;
        };

        const model: PromptOptions = {
            title: 'msg#dashboard.saveAsModalTitle',
            message: 'msg#dashboard.saveAsModalMessage',
            buttons: [],
            output: '',
            validators: [Validators.required, unique]
        };

        this.modalService.prompt(model).then(res => {
            if(res === ModalResult.OK) {
                const db = Utils.copy(dashboard);
                db.name = model.output;

                // Update the list of dashboards
                this.dashboards.push(db);

                // Store a copy of draft dashboards
                const copyDraft = [...this.draftDashboards];

                // Delete the saved dashboard from the draftDashboards at this point of time in order to avoid flickering on successful patch
                const index = this.draftDashboards.findIndex(d => d.name === originalName);
                this.draftDashboards.splice(index, 1);

                const successCallback = () => {
                    // Update URL (store dashboard name in the queryParams)
                    this.searchService.queryStringParams.dashboard = model.output; // Needed when refreshing the page
                    this.searchService.navigate({skipSearch: true});
                }

                const errorCallback = () => {
                    // If the patch fails, restore the list of draft dashboards
                    this.draftDashboards = copyDraft;
                }

                // Update User settings
                this.patchDashboards(true, undefined, successCallback, errorCallback);

            }
        });

    }

    /**
     * Updates the list of dashboards in the user settings
     * @param notify
     */
    protected patchDashboards(notify = true, dashboards?: Dashboard[], successCallback = (): any => {}, errorCallback = (): any => {}) {
        this.userSettingsService.patch({dashboards: dashboards || this.dashboards})
            .subscribe(
                next => {
                    successCallback();
                    if(notify) {
                        this.notificationService.success("msg#dashboard.saveSuccess");
                    }
                },
                error => {
                    errorCallback();
                    if(notify) {
                        this.notificationService.error("msg#dashboard.saveFailure");
                    }
                    console.error("Could not patch Dashboards!", error);
                }
            );
    }

    /** Getter for the auto-save preference */
    public get autoSave(): boolean {
        return !!this.prefs.get("auto-save-dashboards");
    }

    /** Getter for the layout mode preference */
    public get layout(): string {
        return this.prefs.get("dashboard-layout") || "manual";
    }

    formatMessage(message: string) : string {
        return this.intlService.formatMessage(message);
    }
}
