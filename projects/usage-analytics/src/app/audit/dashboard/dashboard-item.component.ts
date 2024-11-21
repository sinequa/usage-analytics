import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ColDef, ColumnResizedEvent, GridApi, GridReadyEvent, IRowNode, SelectionChangedEvent } from "ag-grid-community";
import { GridsterItemComponent } from 'angular-gridster2';

import { Category, defaultChart } from '@sinequa/analytics/fusioncharts';
import { TimelineSeries } from '@sinequa/analytics/timeline';
import { Action } from '@sinequa/components/action';
import { SearchService } from '@sinequa/components/search';
import { Aggregation, AggregationItem, BooleanFilter, Dataset, DatasetError, ExprFilter, Filter, Record, Results } from '@sinequa/core/web-services';

import { HeatmapItem } from '@sinequa/analytics/heatmap';
import { AuditService } from '../audit.service';
import { ChartParams, DashboardItem, DashboardItemParams, DashboardService, GridParams, HeatmapParams, MultiLevelPieParams, TimelineParams } from './dashboard.service';
import { ChartProvider } from './providers/chart-provider';
import { GridProvider } from './providers/grid-provider';
import { HeatmapProvider } from './providers/heatmap-provider';
import { MultiLevelPieProvider } from './providers/multi-level-pie-provider';
import { TimelineProvider } from './providers/timeline-provider';


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
    providers: [TimelineProvider, ChartProvider, GridProvider, HeatmapProvider, MultiLevelPieProvider]
})
export class DashboardItemComponent implements OnChanges {
    @Input() config: DashboardItem<DashboardItemParams>;
    @Input() results: Results;
    @Input() dataset: Dataset;
    @Input() previousDataSet: Dataset;


    // Whether this widget can be renamed or not
    @Input() renamable = true;

    // Whether this widget can be removed or not
    @Input() closable = true;

    // Whether this widget can be viewed in maximized dimensions or not
    @Input() maximizable = true;

    // Whether this widget has info or not
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
    timelineOrGridAction: Action;
    heatmapOrGridAction: Action;
    toggleShowPreviousTimelineAction: Action;

    private readonly closeAction = new Action({
        text: "Remove",
        action: () => this.close()
    });
    private readonly renameAction = new Action({
        text: "Rename",
        action: () => this.rename()
    });
    private readonly maximizeAction = new Action({
        text: "Maximize",
        action: () => {
            this.toggleMaximizedView()
        },
        updater: (action) => {
            action.text = this.isMaximized()
                ? "Minimize"
                : "Maximize";
        }
    });

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
    rowData: (Record | AggregationItem | HeatmapItem)[] = [];
    defaultColDef: ColDef = {
        resizable: true,
        sortable: true,
        filter: true
    }
    private _gridFilter: Filter;
    private _selectedNode: IRowNode;

    /** ag-grid API for the grid */
    gridApi: GridApi | null | undefined;

    // Multi level pie
    data: Category[] = [];

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
        public heatmapProvider: HeatmapProvider,
        public multiLevelPieProvider: MultiLevelPieProvider
        ) {}

    ngOnChanges(changes: SimpleChanges) {

        if(this.config.parameters.type === "chart" && changes.buttonsStyle) {
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
            if (this.config.parameters.type === "grid") {
                this.resizeGrid();
            }
        }

        // Handle dataSets updates
        if (this.config.parameters.type === "timeline") {
            if (changes.dataset || changes.previousDataSet) {
                this._updateTimelineData();
            }
        } else if (this.config.parameters.type === "multiLevelPie") {
            if (changes.dataset) {
                this._updateMultiLevelPieData();
            }
        } else {
            if (changes.dataset) {
                if (this.dataset[this.config.parameters.query]) {
                    this.loading = false;
                    const data = this.dataset[this.config.parameters.query];
                    let relatedData;
                    if (this.config.parameters.relatedQuery) {
                        relatedData = this.dataset[this.config.parameters.relatedQuery];
                    }
                    if ((data as DatasetError).errorMessage || (relatedData as DatasetError)?.errorMessage) {
                        this.errorMessage = (data as DatasetError)?.errorMessage || (relatedData as DatasetError)?.errorMessage
                    } else {
                        this.errorMessage = undefined;
                        switch (this.config.parameters.type) {
                            case "chart":
                                {
                                    const parameters: ChartParams = this.config.parameters;
                                    if (parameters.chartData) {
                                        this.chartResults = this.chartProvider.getChartData(data, parameters.chartData);
                                        this.columnDefs = this.chartProvider.getGridColumnDefs(parameters.chartData, true, parameters.enableSelection);
                                        this.rowData = (data as Results)?.aggregations?.find((agg) => agg.name === parameters.chartData.aggregation)?.items || []
                                    }
                                    break;
                                }
                            case "heatmap":
                                {
                                    const parameters: HeatmapParams = this.config.parameters;
                                    if (parameters.chartData) {
                                        this.heatmapData = this.heatmapProvider.getHeatMapData(data, parameters.chartData);
                                        const fieldX = this.heatmapData[0]?.['fieldX'];
                                        const fieldY = this.heatmapData[0]?.['fieldY'];
                                        this.columnDefs = this.heatmapProvider.getGridColumnDefs(parameters.chartData, fieldX, fieldY, true, parameters.enableSelection);
                                        this.rowData = this.heatmapData;
                                    }
                                    break;
                                }
                            case "grid":
                                {
                                    const parameters: GridParams = this.config.parameters;
                                    this.columnDefs = this.gridProvider.getGridColumnDefs(parameters.columns, parameters.showTooltip, parameters.enableSelection);
                                    if (parameters.aggregation) {
                                        this.rowData = this.gridProvider.getAggregationRowData(data, parameters.aggregation)
                                    } else {
                                        this.rowData = (data as Results).records
                                    }
                                    break;
                                }

                            default:
                                break;
                        }
                    }
                } else {
                    this.loading = true;
                }
            }
        }

        // Update actions
        this._updateActions();
    }

    // Update the list of actions of the widget
    private _updateActions() {
        const menuAction = new Action({
            icon: 'fas fa-ellipsis-v',
            title: 'Menu',
            children: [],
        });
        if (this.maximizable) {
            menuAction.children!.push(this.maximizeAction);
        }
        if(this.renamable) {
            menuAction.children!.push(this.renameAction);
        }
        if(this.closable) {
            menuAction.children!.push(this.closeAction);
        }
        this.actions = menuAction.children!.length > 0 ? [menuAction] : [];

        if (this.tooltipInfo) {
            const infoAction = new Action({
                icon: "fas fa-circle-info",
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
                disabled: true,
                action: () => {}
            });
            this.actions = [infoAction, ...this.actions];
        }

        if (this.config.parameters.type === "timeline") {
            const parameters: TimelineParams = this.config.parameters;
            // Action to Show/Hide previous period timeline
            this.toggleShowPreviousTimelineAction = new Action({
                icon: parameters.showPreviousPeriod ? "fas fa-chart-line" : "sq-timeline-trend",
                title: parameters.showPreviousPeriod ? "Hide Trend" : "Show Trend",
                action: () => {
                    this._toggleShowPreviousTimeline();
                },
                updater: (action) => {
                    action.icon = parameters.showPreviousPeriod
                        ? "fas fa-chart-line"
                        : "sq-timeline-trend";
                    action.title = parameters.showPreviousPeriod
                        ? "Hide Trend"
                        : "Show Trend";
                }
            });

            // Action to switch between Grid/Timeline view
            this.timelineOrGridAction = new Action({
                title: "Select a view",
                text: parameters.chartType,
                updater: (action) => {
                    action.children = ["Grid", "Timeline"]
                        .filter((item) => item !== action.text)
                        .map(
                            (item) => new Action({
                                text: item,
                                action: (elem, event) => {
                                    parameters.chartType = item as "Timeline" | "Grid";
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

        if (this.config.parameters.type === "heatmap") {
            const parameters: HeatmapParams = this.config.parameters;
            // Action to switch between Grid/Heatmap view
            this.heatmapOrGridAction = new Action({
                title: "Select a view",
                text: parameters.chartType,
                updater: (action) => {
                    action.children = ["Grid", "Heatmap"]
                        .filter((item) => item !== action.text)
                        .map(
                            (item) => new Action({
                                text: item,
                                action: (elem, event) => {
                                    parameters.chartType = item as "Grid" | "Heatmap";
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
        this.config.parameters.showPreviousPeriod = !this.config.parameters.showPreviousPeriod;
        this.dashboardService.notifyItemChange(this.config, 'CHANGE_WIDGET_CONFIG');
        this.toggleShowPreviousTimelineAction.update();
        this._updateTimelineData();
    }

    private _updateTimelineData() {
        const parameters = this.config.parameters as TimelineParams;

        if (parameters.queries.every((query) => this.dataset?.[query]) && parameters.queries.every((query) => this.previousDataSet?.[query])) {
            this.loading = false;
            const currentDatas = parameters.queries.map((query) => this.dataset?.[query]);
            const previousDatas = parameters.queries.map((query) => this.previousDataSet?.[query]);

            if (currentDatas.some((data) => (data as DatasetError)?.errorMessage) || previousDatas.some((data) => (data as DatasetError)?.errorMessage)) {
                this.errorMessage = (currentDatas.find((data) => (data as DatasetError)?.errorMessage) as DatasetError)?.errorMessage || (previousDatas.find((data) => (data as DatasetError)?.errorMessage) as DatasetError)?.errorMessage
            } else {
                this.errorMessage = undefined;
                this.timeSeries = [];

                if (!parameters.showPreviousPeriod) {
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
        const parameters = this.config.parameters as TimelineParams;

        let timeSeries: TimelineSeries[] = [];
        let columnDefs: ColDef[] = [];
        let rowData: (Record | AggregationItem)[] = [];

        if (parameters.aggregationsTimeSeries) {
            timeSeries = this.timelineProvider.getAggregationsTimeSeries(data, parameters.aggregationsTimeSeries, this.auditService.mask, isCurrent, this.auditService.diffPreviousAndStart);
            columnDefs = this.timelineProvider.getGridColumnDefs(parameters.aggregationsTimeSeries, true, parameters.enableSelection, isCurrent);
            rowData = this.timelineProvider.getAggregationsRowData(data, parameters.aggregationsTimeSeries, isCurrent);
        }
        if (parameters.recordsTimeSeries) {
            timeSeries = this.timelineProvider.getRecordsTimeSeries(data, parameters.recordsTimeSeries, isCurrent, this.auditService.diffPreviousAndStart);
            columnDefs = this.timelineProvider.getGridColumnDefs(parameters.recordsTimeSeries, true, parameters.enableSelection, isCurrent);
            rowData = data.records;
        }

        return {timeSeries, columnDefs, rowData};
    }

    private _updateMultiLevelPieData() {
        const parameters = this.config.parameters as MultiLevelPieParams;
        const queries = parameters.multiLevelPieQueries?.map(item => item.query) || [];
        if (queries.every((query) => this.dataset?.[query])) {
            this.loading = false;
            this.data = this.multiLevelPieProvider.resolveData(this.dataset,  parameters.multiLevelPieData, parameters.multiLevelPieQueries) || [];
        } else {
            this.loading = true;
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

            this.maximizeAction.update();
        }
    }

    /**
     * Specific callback methods for the ag-grid widget
     * */
    onGridReady(event: GridReadyEvent) {
        this.gridApi = event.api;
        // Programmatically select filtered rows
        this.gridApi?.forEachNode((node) => {
            if (node.data.$filtered) {
                node.setSelected(true, undefined);
            }
        });
        this.resizeGrid();
    }

    onColumnResized(event: ColumnResizedEvent) {
        this.gridApi?.resetRowHeights();
    }

    onGridSelectionChanged(event: SelectionChangedEvent) {
        const newSelectedNode = this.gridApi!.getSelectedNodes();
        // Reset previous filter
        if (this._gridFilter) {
            this.searchService.query.removeSameFilters(this._gridFilter)
        }
        this._selectedNode = newSelectedNode[0];
        // Make new filter based on current selection
        if (this._selectedNode) {
            const row = this._selectedNode.data;
            switch (this.config.parameters.type) {
                case "chart":
                    this._gridFilter = {
                        operator: 'eq',
                        field: this.chartResults.aggregations[0].column,
                        value: row.value,
                        display: row.display || row.value
                    } as BooleanFilter
                    break;
                case "heatmap":
                    this._gridFilter = {
                        operator: 'and',
                        filters: [
                            {field: row['fieldX'], value: row.x.value, operator: "eq"},
                            {field: row['fieldY'], value: row.y.value, operator: "eq"}
                        ]
                    } as ExprFilter
                    break;
                // Specific custom behaviors for timeline/grid components should go here in dedicated cases
                default:
                    break;
            }
            this.searchService.query.addFilter(this._gridFilter);
        }
        // Trigger new search
        this.searchService.search();
    }

    //Resize the grid
    resizeGrid() {
        this.gridApi?.sizeColumnsToFit();
    }

    /**
     * Specific callback methods for the CHART widget
     */
    onChartInitialized(chartObj: any) {
        this.chartObj = chartObj;
        this.chartObj.resizeTo(this.innerwidth, this.innerheight);
    }

    onChartTypeChange(type: "Grid" | "Column2D" | "Bar2D" | "Pie2D" | "doughnut2d" | "Column3D" | "Bar3D" | "Pie3D" | "doughnut3d") {
        this.config.icon = type === 'Grid' ? "fas fa-th-list" : "fas fa-chart-pie";
        (this.config.parameters as ChartParams).chartType = type;
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
                {field: item['fieldX'], value: item.x.value, operator: "eq"},
                {field: item['fieldY'], value: item.y.value, operator: "eq"}
            ]
        } as ExprFilter;
        this.searchService.query.addFilter(filter);
        this.searchService.search();
    }

    isMaximized(): boolean {
        return this.gridsterItemComponent.el.classList.contains('widget-maximized-view');
    }
}
