import { Injectable } from '@angular/core';
import { ValidatorFn, Validators } from '@angular/forms';
import { Router, UrlSerializer } from '@angular/router';
import { Clipboard } from '@angular/cdk/clipboard';
import { Location } from '@angular/common';
import { Utils } from '@sinequa/core/base';
import { LoginService } from '@sinequa/core/login';
import { UserSettingsWebService } from '@sinequa/core/web-services';
import { ModalResult, ModalService, PromptOptions, ModalButton, ConfirmType } from '@sinequa/core/modal';
import { Action } from '@sinequa/components/action';
import { SearchService } from '@sinequa/components/search';
import { GridsterConfig, GridsterItem } from 'angular-gridster2';
import { NotificationsService } from '@sinequa/core/notification';
import { Subject } from 'rxjs';
import { UserPreferences } from '@sinequa/components/user-settings';
import { IntlService } from '@sinequa/core/intl';
import { AggregationTimeSeries, RecordsTimeSeries } from './providers/timeline-provider';
import { PALETTE, STANDARD_DASHBOARDS, WIDGETS } from '../config';
import { ChartData } from './providers/chart-provider';
import { AppService } from '@sinequa/core/app-utils';

/**
 * Interface storing the configuration of a widget. It must contain the minimal amount of information
 * to rebuild the widget's content (eg. for the preview we need an id and a query).
 * This configuration is stored in user settings and/or shared with other users, so it must not include
 * large objects or raw data (only the means to rebuild these objects or data).
 * This interface is an extension of GridsterItem, so that we store things like the position of each
 * widget in the dashboard.
 */
export interface DashboardItem extends GridsterItem {
    type: string;
    icon: string;
    title: string;
    query: string;
    info?: string;
    width?: number;
    height?: number;

    // Properties specific to some types
    recordId?: string; // For type === 'preview'
    queryStr?: string; // For type === 'preview'
    aggregation?: string; // For type === 'chart'
    chartData?: ChartData; // For type === 'chart'
    chartType?: string; // For type === 'chart'
    aggregationsTimeSeries?: AggregationTimeSeries | AggregationTimeSeries[]; // For type === 'timeline'
    recordsTimeSeries?: RecordsTimeSeries; // For type === 'timeline'
    valueLocation?: StatValueLocation; // where to find field value
    operation?: StatOperation; // operation to compute the value
    relatedQuery?: string; // query containing the second leg of the stat operands
    relatedValueLocation?: StatValueLocation; // where to find the field value of the second stat operands
    relatedOperation?: StatOperation; // operation to compute the value of the second stat operands
    computation?: StatOperation; // operation to get the global value of the stat
    asc?: boolean // if the positive evaluation is at increase or decrease trend
    statLayout?: StatLayout // the ui of displaying the stat
}

/**
 * A dashboard configuration interface incl. a name and the configuration of each widget
 */
export interface Dashboard {
    name: string;
    items: DashboardItem[];
}

export type StatValueLocation = "aggregations" | "records" | "totalrecordcount";
export type StatLayout = "standard" | "chart";
export type StatOperation = "avg" | "percentage" | "division";

/**
 * An interface to define a type of widget that can be added to the dashboard. This basic information
 * is used to create a button to select a type of widget among a list.
 */
export interface DashboardItemOption {
    type: string;
    query: string;
    icon: string;
    text: string;
    unique: boolean;
    info?: string;
    parameters?: {
        // For type === 'timeline'
        aggregationsTimeSeries?: AggregationTimeSeries | AggregationTimeSeries[];
        recordsTimeSeries?: RecordsTimeSeries;

        // For type === 'chart'
        chartData?: ChartData;
        chartType?: string;

        // For type === 'stat'
        valueLocation?: StatValueLocation; // where to find field value
        operation?: StatOperation; // operation to compute the value
        relatedQuery?: string; // query containing the second leg of the stat operands
        relatedValueLocation?: StatValueLocation; // where to find the field value of the second stat operands
        relatedOperation?: StatOperation; // operation to compute the value of the second stat operands
        computation?: StatOperation; // operation to get the global value of the stat
        asc?: boolean // if the positive evaluation is at increase or decrease trend
        statLayout?: StatLayout // the ui of displaying the stat

    }
}

export interface DashboardItemPosition {
    x?: number;
    y?: number;
    rows?: number;
    cols?: number;
}

export interface DashboardChange {
    dashboard: Dashboard,
    updateDatasets: boolean
}

// Name of the "default dashboard" (displayed prior to any user customization)
export const defaultDashboardName = "msg#dashboards.newDashboard";

@Injectable({
    providedIn: 'root'
})
export class DashboardService {

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
                this.notifyItemChange(item as DashboardItem);
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
        this.searchService.queryStream.subscribe(() => {
            this.handleNavigation();
        })

        // Dashboards are stored in User Settings
        this.userSettingsService.events.subscribe(event => {
            // E.g. new login occurs
            // ==> settings need to be rebuilt
            this.setLayout(this.layout);
        });

        // Manage Auto-save dashboards.
        this.dashboardChanged.subscribe((changes: DashboardChange) => {
            if (this.dashboard && this.defaultDashboard) {
                const dashboard = changes.dashboard;
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
                // if needed, update datasets and trigger search in order to consider the changes
                if (changes.updateDatasets) {
                    this.searchService.navigate({skipSearch: true});
                }
            }
        });
    }

    /**
     * Handle URL changes. Retrieve a dashboard name or configuration if any, depending on
     * the params contained in the URL.
     */
    protected handleNavigation() {
        const url = Utils.makeURL(this.router.url);
        const dashboard = url.searchParams.get("dashboard");
        const dashboardShared = url.searchParams.get("dashboardShared");
        // Dashboards are not available yet! (pending login complete...)
        if(dashboard && dashboard !== this.dashboard?.name) {
            this.searchService.queryStringParams.dashboard = dashboard;
            if(this.hasDashboard(dashboard)) {
                this.dashboard = this.getDashboard(dashboard)!;
            } else {
                this.notificationService.error("Could not find this dashboard...");
            }
        }
        else if(dashboardShared) {
            const db = Utils.fromJson(dashboardShared);
            if(db as DashboardItem[]) {
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
     * on the server (appService.app.data.widgets and appService.app.data.customWidgets)
     * or in the config.ts file (WIDGETS)
     */
    public getWidgets(): {[key: string]: DashboardItemOption} {
        const widgets = this.appService.app?.data?.widgets || WIDGETS;
        const customWidgets = this.appService.app?.data?.customWidgets || {};
        return Utils.extend(widgets, customWidgets);
    }

    /**
     * Builds the palette of widgets from the configuration defined
     * on the server (appService.app.data.palette) or in the config.ts file (PALETTE)
     */
    public getPalette(): {name: string, items: DashboardItemOption[]}[] {
        // Construct palette from configuration
        const palette = this.appService.app?.data?.palette as any as {name: string, items: string[]}[] || PALETTE;
        const widgets = this.getWidgets();
        return palette.map(p => {
            return {
                name: p.name,
                items: p.items.filter(i => Utils.isString(i) && widgets[i])
                              .map(i => widgets[i])
            }
        });
    }

    /**
     * Returns the list of standard dashboard from the configuration defined
     * on the server (appService.app.data.standardDashboards) or in the config.ts file (STANDARD_DASHBOARDS)
     */
    public getStandardDashboards(): {name: string, items: {item: DashboardItemOption, position: DashboardItemPosition}[]}[] {
        const dashboards = this.appService.app?.data?.standardDashboards as any as {name: string, items: {item: string, position: DashboardItemPosition}[]}[]
            || STANDARD_DASHBOARDS;
        const widgets = this.getWidgets();
        return dashboards.map(d => {
            return {
                name: d.name,
                items: d.items.filter(i => Utils.isString(i.item) && widgets[i.item])
                              .map(i => ({item: widgets[i.item], position: i.position}))
            };
        });
    }

    /**
     * Returns the list of this user's dashboards.
     * The list is stored in the user settings (this is a redirection).
     * It creates the list of dashboards if it does not already exist.
     */
    public get dashboards() : Dashboard[] {
        if(!this.userSettingsService.userSettings)
            this.userSettingsService.userSettings = {};
        if(!this.userSettingsService.userSettings["dashboards"]) {
            this.userSettingsService.userSettings["dashboards"] =
                this.getStandardDashboards().map(
                    sd => this.createDashboard(sd.name, sd.items)
                );
        }
        return this.userSettingsService.userSettings["dashboards"];
    }

    public get allDashboards(): Dashboard[] {
        return this.dashboards.concat(this.draftDashboards);
    }

    protected createDashboard(name: string, items: {item: DashboardItemOption, position: DashboardItemPosition}[] = []): Dashboard {
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
        if(!this.dashboard) {
            const name = this.formatMessage(defaultDashboardName) + (this.draftDashboards.length+1);
            const _blank = this.createDashboard(name);
            this.dashboard = Utils.copy(this.defaultDashboard ? this.defaultDashboard : _blank); // Default dashboard is kept as a deep copy, so we don't change it by editing the dashboard
        }
    }

    /**
     * Load shared dashboard, as a new draft dashboard, based on its given items
     * @param items
     */
    public setSharedDashboard(items: DashboardItem[]) {
        const name = this.formatMessage(defaultDashboardName) + (this.draftDashboards.length+1);
        const _shared = {name: name, items};
        this.draftDashboards.push(_shared)
        this.dashboard = Utils.copy(_shared);
        this.dashboardChanged.next({dashboard: this.dashboard, updateDatasets: true});
    }

    /**
     * A dashboard is considered saved if it has a name that is not among the draft and changed dashboards list
     */
    public isDashboardSaved(dashboard = this.dashboard): boolean {
        return this.defaultDashboard
                && dashboard
                && !dashboard.name.startsWith(this.formatMessage(defaultDashboardName))
                && !this.changedDashboards.find(d => d.name === dashboard.name);
    }

    /**
     * Fire an event when a dashboard item changes
     * @param item
     */
    public notifyItemChange(item: DashboardItem, notify = false) {
        this.dashboardChanged.next({dashboard: this.dashboard, updateDatasets: notify});
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
            rows = (option.type === "stat" ? 2 : 4),
            cols = (option.type === "stat" ? 1 : 3),
            x = 0,
            y = 0,
            closable = true): DashboardItem {

        let item = {
            x: x,
            y: y,
            rows,
            cols,
            type: option.type,
            query: option.query,
            icon: option.icon,
            title: option.text,
            closable: closable,
            info: option.info
        };
        if (option.parameters) {
            item = {...item, ...option.parameters}
        }
        dashboard.items.push(item);
        if (notify) {
            this.dashboardChanged.next({dashboard: dashboard, updateDatasets: true});
        }
        return dashboard.items[dashboard.items.length - 1];
    }

    /**
     * Remove a widget from the dashboard
     * @param item
     */
    public removeItem(item: DashboardItem) {
        this.dashboard.items.splice(this.dashboard.items.indexOf(item), 1);
        this.notifyItemChange(item);
    }

    /**
     * Rename a widget in the dashboard
     * @param item
     * @param newTitle
     */
    public renameWidget(item: DashboardItem, newTitle: string) {
        item.title = newTitle;
        this.notifyItemChange(item);
    }

    /**
     * Open a dialog to submit a new name for a given widget
     * @param item
     */
    public renameWidgetModal(item: DashboardItem) {

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
    public createDashboardActions(): Action[] {

        const dashboardActions = [] as Action[];

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
        const settings = new Action({
            icon: 'fas fa-ellipsis-v',
            title: 'msg#dashboard.settingsTitle',
            children: [
                this.manualLayoutAction,
                this.autoLayoutAction,
                this.fixedLayoutAction
            ],
        });

        dashboardActions.push(settings);

        return dashboardActions;
    }

    public openDashboard(dashboard: Dashboard) {
        this.dashboard = dashboard;
        this.searchService.queryStringParams.dashboard = dashboard.name;
        this.searchService.navigate({skipSearch: true});
    }

    public saveDashboard(dashboard: Dashboard) {
        if(!this.isDashboardSaved(dashboard) && !this.changedDashboards.find(d => d.name === dashboard.name)){
            this.saveAs(dashboard);
        }
        else {
            const index = this.changedDashboards.findIndex(d => d.name === dashboard.name);
            this.changedDashboards.splice(index, 1);
            this.patchDashboards();
        }
    }

    /**
     * Creates a new dashboard (from scratch)
     */
    public newDashboard() {
        const name = this.formatMessage(defaultDashboardName) + (this.draftDashboards.length+1);
        const _blank = this.createDashboard(name);
        this.draftDashboards.push(_blank);
        this.dashboard = Utils.copy(_blank);
        delete this.searchService.queryStringParams.dashboard;
        this.searchService.navigate({skipSearch: true});
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

                // Delete the dashboard
                if (this.isDashboardSaved(dashboard)) {
                    const i = this.dashboards.findIndex(d => d.name === dashboard.name);
                    this.dashboards.splice(i, 1);
                    this.patchDashboards(false);
                    if(this.prefs.get("dashboard-default") === dashboard.name) {
                        this.prefs.delete("dashboard-default");
                    }
                }
                else {
                    const i = this.draftDashboards.findIndex(d => d.name === dashboard.name);
                    this.draftDashboards.splice(i, 1);
                }

                // Open next/previous dashboard. If not existing, create new empty dashboard
                if (this.allDashboards[index]) {
                    this.dashboard = Utils.copy(this.allDashboards[index]);
                } else if (this.allDashboards[index - 1]) {
                    this.dashboard = Utils.copy(this.allDashboards[index - 1]);
                } else {
                    this.newDashboard();
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
            const unique = !control.value?.startsWith(this.formatMessage(defaultDashboardName)) && !this.getDashboard(control.value);
            if(!unique) return {unique: true};
            return null;
        };

        const model: PromptOptions = {
            title: 'msg#dashboard.saveAsModalTitle',
            message: 'msg#dashboard.saveAsModalMessage',
            buttons: [],
            output: this.formatMessage(dashboard.name),
            validators: [Validators.required, unique]
        };

        this.modalService.prompt(model).then(res => {
            if(res === ModalResult.OK) {
                const db = Utils.copy(dashboard);
                db.name = model.output;
                // Update User settings
                this.dashboards.push(db);
                this.patchDashboards();
                // Delete the saved dashboard from the draftDashboards
                const index = this.draftDashboards.findIndex(d => d.name === originalName);
                this.draftDashboards.splice(index, 1);
                // Update URL (store dashboard name in the queryParams)
                this.searchService.queryStringParams.dashboard = model.output; // Needed when refreshing the page
                this.searchService.navigate({skipSearch: true});
            }
        });

    }

    /**
     * Updates the list of dashboards in the user settings
     * @param notify
     */
    protected patchDashboards(notify = true) {
        this.userSettingsService.patch({dashboards: this.dashboards})
            .subscribe(
                next => {
                    if(notify) {
                        this.notificationService.success("msg#dashboard.saveSuccess");
                    }
                },
                error => {
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
