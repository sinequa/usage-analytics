import { Component, Input, SimpleChanges, Output, EventEmitter, OnChanges } from '@angular/core';
import { GridsterItemComponent } from 'angular-gridster2';
import { ColDef, ColumnResizedEvent, GridApi, GridReadyEvent } from "ag-grid-community";

import { Results, Record, Aggregation, AggregationItem, Dataset, DatasetError, ExprFilter } from '@sinequa/core/web-services';
import { Action } from '@sinequa/components/action';
import { SearchService } from '@sinequa/components/search';
import { TimelineSeries } from '@sinequa/analytics/timeline';
import { defaultChart } from '@sinequa/analytics/fusioncharts';

import { DashboardItem, DashboardService } from './dashboard.service';
import { TimelineProvider } from './providers/timeline-provider';
import { AuditService } from '../audit.service';
import { ChartProvider } from './providers/chart-provider';
import { GridProvider } from './providers/grid-provider';
import { HeatmapItem } from '@sinequa/analytics/heatmap';
import { HeatmapProvider } from './providers/heatmap-provider';


/**
 * A wrapper component for all widgets in the dashboard.
 * The component is in charge of updating inputs going into each widget.
 * To add a custom widget, add it to the template, along with other widgets,
 * then, in the ngOnChanges method, generate the inputs necessary for this widget.
 */

@Component({
    selector: 'sq-dashboard-item',
    templateUrl: './dashboard-item.component.html',
    styleUrls: ['./dashboard-item.component.scss'],
    providers: [TimelineProvider, ChartProvider, GridProvider, HeatmapProvider]
})
export class DashboardItemComponent implements OnChanges {
    @Input() config: DashboardItem;
    @Input() results: Results;
    @Input() dataset: Dataset;
    @Input() previousDataSet: Dataset;


    // Whether this widget can be renamed or not
    @Input() renamable = true;

    // Whether this widget can be removed or not
    @Input() closable = true;

    // Whether this widget can be displayed in full-screen mode or not
    @Input() fullScreenExpandable = false;

    // Whether this widget can be viewed in maximized dimensions or not
    @Input() maximizable = true;

    // Whether this widget can be viewed in maximized dimensions or not
    @Input() tooltipInfo = false;

    // Size of the container, known only after it has been resized by the Gridster library
    @Input() width?: number;
    @Input() height?: number;

    // Dark/Light theme
    @Input() buttonsStyle: string;

    // Emit an event when the user clicks on a record displayed within a widget
    @Output() recordClicked = new EventEmitter<Record>();

    // Custom actions for this widget
    actions: Action[] = [];
    closeAction: Action;
    renameAction: Action;
    fullScreenAction: Action;
    maximizeAction: Action;
    timelineOrGridAction: Action;
    heatmapOrGridAction: Action;
    toggleShowPreviousTimelineAction: Action;
    infoAction: Action;

    // Properties specific to certain types of dashboard items
    innerwidth = 500;
    innerheight = 200;

    // Fusion charts
    chart = defaultChart;
    chartObj?: any;
    chartResults: Results = {
            records: [] as Record[],
            aggregations: [] as Aggregation[]
        } as  Results;

    // Timeline
    timeSeries: TimelineSeries[] = [];

    // Heatmap
    heatmapData: HeatmapItem[] = [];

    // Grid
    columnDefs: ColDef[] = []
    rowData: (Record | AggregationItem)[] = [];
    defaultColDef: ColDef = {
        resizable: true,
        sortable: true,
        filter: true
    }
    /** ag-grid API for the grid */
    gridApi: GridApi | null | undefined;

    errorMessage?: string;
    loading = true;

    constructor(
        public gridsterItemComponent: GridsterItemComponent,
        public searchService: SearchService,
        public dashboardService: DashboardService,
        public auditService: AuditService,
        public timelineProvider: TimelineProvider,
        public chartProvider: ChartProvider,
        public gridProvider: GridProvider,
        public heatmapProvider: HeatmapProvider
        ) {

        this.closeAction = new Action({
            icon: "fas fa-times",
            title: "msg#dashboard.widgetClose",
            action: () => this.close()
        });

        this.renameAction = new Action({
            icon: "far fa-edit",
            title: "msg#dashboard.renameWidgetTitle",
            action: () => this.rename()
        });

        this.fullScreenAction = new Action({
            icon: "fas fa-expand",
            title: "msg#dashboard.fullScreenTitle",
            action: () => this.toggleFullScreen()
        });

        this.maximizeAction = new Action({
            icon: "fas fa-expand-alt",
            title: "msg#dashboard.maximizeTitle",
            action: () => {
                this.toggleMaximizedView()
            },
            updater: (action) => {
                action.icon = this.isMaximized()
                    ? "fas fa-compress-alt"
                    : "fas fa-expand-alt";
                action.title = this.isMaximized()
                    ? "msg#dashboard.minimizeTitle"
                    : "msg#dashboard.maximizeTitle";
            }
        });

    }

    ngOnChanges(changes: SimpleChanges) {

        if(this.config.type === "chart" && changes.buttonsStyle) {
          this.chart = {
            ...defaultChart,
            theme: this.buttonsStyle === "dark"? "candy" : "fusion"
          };
        }

        // Manage width and height changes. Some components need additional treatment
        if(changes.height && this.height) {
            this.innerheight = this.height - 43;
            // Update chart
            if(this.chartObj) {
                this.chartObj.resizeTo(this.width, this.innerheight)
            }
        }

        if(changes.width && this.width) {
            this.innerwidth = this.width - 2;
        }

        // Handle dataSets updates
        if (this.config.type === "timeline") {
            if (changes.dataset || changes.previousDataSet) {
                this._updateTimelineData();
            }
        } else {
            if (changes.dataset) {
                if (this.dataset?.[this.config.query]) {
                    this.loading = false;
                    const data = this.dataset?.[this.config.query];
                    let relatedData;
                    if (this.config?.relatedQuery) {
                        relatedData = this.dataset?.[this.config?.relatedQuery];
                    }
                    if ((data as DatasetError).errorMessage || (relatedData as DatasetError)?.errorMessage) {
                        this.errorMessage = (data as DatasetError)?.errorMessage || (relatedData as DatasetError)?.errorMessage
                    } else {
                        this.errorMessage = undefined;
                        switch (this.config.type) {
                            case "chart":
                                if (this.config.chartData) {
                                    this.chartResults = this.chartProvider.getChartData(data, this.config.chartData);
                                    this.columnDefs = this.chartProvider.getGridColumnDefs(this.config.chartData);
                                    this.rowData = (data as Results)?.aggregations?.find((agg) => agg.name === this.config.chartData?.aggregation)?.items || []
                                }
                                break;
                            case "heatmap":
                                if (this.config.chartData) {
                                    this.heatmapData = this.heatmapProvider.getHeatMapData(data, this.config.chartData);
                                    const fieldX = this.heatmapData[0]?.['fieldX'];
                                    const fieldY = this.heatmapData[0]?.['fieldY'];
                                    this.columnDefs = this.heatmapProvider.getGridColumnDefs(this.config.chartData, fieldX, fieldY);
                                    this.rowData = this.heatmapData;
                                }
                                break;
                            case "grid":
                                this.columnDefs = this.gridProvider.getGridColumnDefs(this.config.columns, this.config.showTooltip);
                                if (this.config.aggregationName) {
                                    this.rowData = this.gridProvider.getAggregationRowData(data, this.config.aggregationName)
                                } else {
                                    this.rowData = (data as Results).records
                                }
                                break;
                            default:
                                break;
                        }
                    }
                } else {
                    this.loading = true;
                }
            }
        }

        // Update the actions
        this.actions = [];
        if(this.renamable) {
            this.actions.push(this.renameAction);
        }
        if(this.closable) {
            this.actions.push(this.closeAction);
        }
        if (this.fullScreenExpandable) {
            this.actions = [this.fullScreenAction, ...this.actions];
        }
        if (this.maximizable) {
            this.actions = [this.maximizeAction, ...this.actions]
        }
        if (this.tooltipInfo) {
            this.infoAction = new Action({
                icon: "fas fa-info",
                title: this.config.info,
                messageParams: {
                    values: {
                        // Params processed within the app code
                        sessionCountThreshold: this.auditService.sessionCountParam,
                        start: this.auditService.startDate,
                        // Params retrieved from the app customization json / config.ts file
                        ...this.auditService.params,
                        ...this.auditService.customParams
                    }
                },
                fallbackPlacements: ["top", "bottom"],
                disabled: true,
                action: () => {}
            });
            this.actions = [this.infoAction, ...this.actions]
        }

        if (this.config.type === "timeline") {
            // Action to Show/Hide previous period timeline
            this.toggleShowPreviousTimelineAction = new Action({
                icon: this.config.showPreviousPeriod ? "fas fa-chart-line" : "sq-timeline-trend",
                title: this.config.showPreviousPeriod ? "Hide Trend" : "Show Trend",
                action: () => {
                    this._toggleShowPreviousTimeline();
                },
                updater: (action) => {
                    action.icon = this.config.showPreviousPeriod
                        ? "fas fa-chart-line"
                        : "sq-timeline-trend";
                    action.title = this.config.showPreviousPeriod
                        ? "Hide Trend"
                        : "Show Trend";
                }
            });

            // Action to switch between Grid/Timeline view
            this.timelineOrGridAction = new Action({
                title: "Select a view",
                text: this.config.chartType,
                updater: (action) => {
                    action.children = ["Grid", "Timeline"]
                        .filter((item) => item !== action.text)
                        .map(
                            (item) => new Action({
                                text: item,
                                action: (elem, event) => {
                                    this.config.chartType = item;
                                    action.text = item;
                                    this.dashboardService.notifyItemChange(this.config, 'CHANGE_WIDGET_CONFIG');
                                    this.timelineOrGridAction.update();
                                }
                            })
                        );
                    if (action.text === "Grid") {
                        const idx = this.actions.findIndex(action => action === this.toggleShowPreviousTimelineAction);
                        if (idx !== -1) {
                            this.actions.splice(idx, 1);
                        }
                    } else {
                        this.actions = [this.toggleShowPreviousTimelineAction, ...this.actions];
                    }
                }
            });

            // Add actions
            this.actions = [this.timelineOrGridAction, ...this.actions];
            this.timelineOrGridAction.update();
        }

        if (this.config.type === "heatmap") {
            // Action to switch between Grid/Heatmap view
            this.heatmapOrGridAction = new Action({
                title: "Select a view",
                text: this.config.chartType,
                updater: (action) => {
                    action.children = ["Grid", "Heatmap"]
                        .filter((item) => item !== action.text)
                        .map(
                            (item) => new Action({
                                text: item,
                                action: (elem, event) => {
                                    this.config.chartType = item;
                                    action.text = item;
                                    this.dashboardService.notifyItemChange(this.config, 'CHANGE_WIDGET_CONFIG');
                                    this.heatmapOrGridAction.update();
                                }
                            })
                        );
                }
            });
            // Add actions
            this.actions = [this.heatmapOrGridAction, ...this.actions];
            this.heatmapOrGridAction.update();
        }
    }

    private _toggleShowPreviousTimeline() {
        this.config.showPreviousPeriod = !this.config.showPreviousPeriod;
        this.dashboardService.notifyItemChange(this.config, 'CHANGE_WIDGET_CONFIG');
        this.toggleShowPreviousTimelineAction.update();
        this._updateTimelineData();
    }

    private _updateTimelineData() {
        const queries = [this.config.query, ...(this.config.extraTimelineQueries || [])];

        if (queries.every((query) => this.dataset?.[query]) && queries.every((query) => this.previousDataSet?.[query])) {
            this.loading = false;
            const currentDatas = queries.map((query) => this.dataset?.[query]);
            const previousDatas = queries.map((query) => this.previousDataSet?.[query]);

            if (currentDatas.some((data) => (data as DatasetError)?.errorMessage) || previousDatas.some((data) => (data as DatasetError)?.errorMessage)) {
                this.errorMessage = (currentDatas.find((data) => (data as DatasetError)?.errorMessage) as DatasetError)?.errorMessage || (previousDatas.find((data) => (data as DatasetError)?.errorMessage) as DatasetError)?.errorMessage
            } else {
                this.errorMessage = undefined;
                this.timeSeries = [];

                if (!this.config.showPreviousPeriod) {
                    const {timeSeries, columnDefs, rowData} = this._getTimelineData(currentDatas as Results[], true);
                    this.timeSeries = this.timelineProvider.applyStyleRules(timeSeries);
                    this.columnDefs = columnDefs;
                    this.rowData = rowData;
                } else {
                    const current = this._getTimelineData(currentDatas as Results[], true);
                    const previous = this._getTimelineData(previousDatas as Results[], false);
                    this.timeSeries = this.timelineProvider.applyStyleRules(current.timeSeries, previous.timeSeries);
                    this.columnDefs = current.columnDefs;
                    this.rowData = current.rowData;
                }
            }
        } else {
            this.loading = true;
        }

    }

    private _getTimelineData(datas: Array<Results>, isCurrent: boolean): {timeSeries: TimelineSeries[]; columnDefs: ColDef[]; rowData: (Record | AggregationItem)[];} {
        const data = {
            records: [] as Record[],
            aggregations: datas.flatMap((result) => (result as Results).aggregations)
        } as Results;

        let timeSeries: TimelineSeries[] = [];
        let columnDefs: ColDef[] = [];
        let rowData: (Record | AggregationItem)[] = [];

        if (this.config.aggregationsTimeSeries) {
            timeSeries = this.timelineProvider.getAggregationsTimeSeries(data, this.config.aggregationsTimeSeries, this.auditService.mask, isCurrent, this.auditService.diffPreviousAndStart);
            columnDefs = this.timelineProvider.getGridColumnDefs(this.config.aggregationsTimeSeries, isCurrent);
            rowData = this.timelineProvider.getAggregationsRowData(data, this.config.aggregationsTimeSeries, isCurrent);
        }
        if (this.config.recordsTimeSeries) {
            timeSeries = this.timelineProvider.getRecordsTimeSeries(data, this.config.recordsTimeSeries, isCurrent, this.auditService.diffPreviousAndStart);
            columnDefs = this.timelineProvider.getGridColumnDefs(this.config.recordsTimeSeries, isCurrent);
            rowData = data.records;
        }

        return {timeSeries, columnDefs, rowData};
    }

    toggleFullScreen(): void {
        const elem = this.gridsterItemComponent.el;

        if (!document.fullscreenElement) {
            if (elem.requestFullscreen) {
                this.config.height = window.screen.height; // update gridsterItem to full-fill the screen height
                this.config.width = window.screen.width; // update gridsterItem to full-fill the screen width
                elem.requestFullscreen()
                    .catch(
                        (err) => console.error(`Error attempting to enable full-screen mode: ${err.message}`)
                    );
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }

        /**
         * callback to update the item's actions on switch from/to full-screen mode
         */
        elem.onfullscreenchange = () => {
            if (document.fullscreenElement) {
                this.fullScreenAction.icon = "fas fa-compress";
                this.fullScreenAction.title = "msg#dashboard.exitFullScreenTitle";
            } else {
                this.fullScreenAction.icon = "fas fa-expand";
                this.fullScreenAction.title = "msg#dashboard.fullScreenTitle";
            }

            // update related maximize/minimize actions since they can not be performed in full-screen mode
            if (this.maximizable) {
                this.maximizeAction.disabled =  document.fullscreenElement !== null;
            }
        }
    }

    toggleMaximizedView(): void {
        const gridsterItem = this.gridsterItemComponent.el;
        const gridsterContainer = gridsterItem.parentElement?.parentElement;
        if(gridsterContainer) {
            gridsterItem.classList.toggle('widget-maximized-view'); // allow container of gridsterItem to full-fill its direct parent dimensions
            gridsterContainer.classList.toggle('no-scroll');  // disable the gridster element's scroll

            if (this.isMaximized()) { // update component defined in gridsterItem to full-fill its maximized space
                this.config.height = gridsterContainer.clientHeight!;
                this.config.width = gridsterContainer.clientWidth!;
                gridsterContainer.scrollTop = 0; // scroll up to view the full screen item
            } else {
                // update height/width to the dimensions of the gridsterItemComponent
                this.config.height = this.gridsterItemComponent.height;
                this.config.width = this.gridsterItemComponent.width;
            }

            // update related full-screen actions since they can not be performed in maximized mode
            if (this.fullScreenExpandable) {
                this.fullScreenAction.disabled = this.isMaximized();
            }
            this.maximizeAction.update();
        }
    }

    // Specific callback methods for the ag-grid widget
    onGridReady(event: GridReadyEvent) {
        this.gridApi = event.api;
        this.resizeGrid();
    }

    onColumnResized(event: ColumnResizedEvent) {
        this.gridApi?.resetRowHeights();
    }

    /**
     * Resize the grid
     */
    resizeGrid() {
        this.gridApi?.sizeColumnsToFit();
    }

    // Specific callback methods for the CHART widget
    onChartInitialized(chartObj: any) {
        this.chartObj = chartObj;
        this.chartObj.resizeTo(this.innerwidth, this.innerheight);
    }

    onChartTypeChange(type: string) {
        this.config.icon = type === 'grid' ? "fas fa-th-list" : "fas fa-chart-pie";
        this.config.chartType = type;
        this.dashboardService.notifyItemChange(this.config, 'CHANGE_WIDGET_CONFIG');
    }

    /**
     * Open a modal to rename this widget
     */
    rename() {
        this.dashboardService.renameWidgetModal(this.config);
    }

    /**
     * Remove this widget from the dashboard
     */
    close() {
        this.dashboardService.removeItem(this.config);
    }

    updateAuditRange(range: Date[]) {
        if (!!range) {
            this.auditService.updateRangeFilter(range);
        }
    }

    onHeatmapItemClick(item: HeatmapItem) {
        const filter = {
            operator: 'and',
            filters: [
                {field: item['fieldX'], value: item.x, operator: "eq"},
                {field: item['fieldY'], value: item.y, operator: "eq"}
            ]
        } as ExprFilter;
        this.searchService.query.addFilter(filter);
        this.searchService.search();
    }

    isMaximized(): boolean {
        return this.gridsterItemComponent.el.classList.contains('widget-maximized-view');
    }
}
