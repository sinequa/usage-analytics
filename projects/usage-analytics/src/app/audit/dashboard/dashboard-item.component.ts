import { Component, Input, SimpleChanges, Output, EventEmitter, OnChanges } from '@angular/core';
import { GridsterItemComponent } from 'angular-gridster2';
import { ColDef, ColumnResizedEvent, GridApi, GridReadyEvent } from "ag-grid-community";

import { Results, Record, Aggregation, AggregationItem, Dataset, DatasetError } from '@sinequa/core/web-services';
import { ExprBuilder } from '@sinequa/core/app-utils'

import { Action } from '@sinequa/components/action';
import { SearchService } from '@sinequa/components/search';
import { TimelineSeries } from '@sinequa/analytics/timeline';
import { defaultChart } from '@sinequa/analytics/fusioncharts';

import { DashboardItem, DashboardService } from './dashboard.service';
import { TimelineProvider } from './providers/timeline-provider';
import { AuditService } from '../audit.service';
import { ChartProvider } from './providers/chart-provider';
import { GridProvider } from './providers/grid-provider';


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
    providers: [TimelineProvider, ChartProvider, GridProvider]
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
    infoAction: Action;

    // Properties specific to certain types of dashboard items
    innerwidth = 500;
    innerheight = 200;

    // Fusion charts
    chart = defaultChart;
    chartObj?: any;
    chartResults: Results = {
            records: [] as Record[],
            aggregations: [
                {
                    name: "regular-new-user",
                    column: ""
                }
            ] as Aggregation[]
        } as  Results;

    // Timeline
    timeSeries: TimelineSeries[] = [];

    gridView = false;
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
        public exprBuilder: ExprBuilder,
        public auditService: AuditService,
        public timelineProvider: TimelineProvider,
        public chartProvider: ChartProvider,
        public gridProvider: GridProvider) {

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
            action: (action) => {
                this.toggleMaximizedView();
                action.icon = this.gridsterItemComponent.el.classList.contains('widget-maximized-view')
                            ? "fas fa-compress-alt"
                            : "fas fa-expand-alt";
                action.title = this.gridsterItemComponent.el.classList.contains('widget-maximized-view')
                            ? "msg#dashboard.minimizeTitle"
                            : "msg#dashboard.maximizeTitle";
            }
        });

    }

    ngOnChanges(changes: SimpleChanges) {

        if(this.config.type === "chart") {
            this.chart.theme = this.buttonsStyle === "dark"? "candy" : "fusion";
        }

        // Manage width and height changes. Some components need additional treatment
        if(changes["height"] && this.height) {
            this.innerheight = this.height - 43;
            // Update chart
            if(this.chartObj) {
                this.chartObj.resizeTo(this.width, this.innerheight)
            }
        }

        if(changes["width"] && this.width) {
            this.innerwidth = this.width;
            // Update chart, if not already done
            if(this.chartObj && !changes["height"]) {
                this.chartObj.resizeTo(this.width, this.innerheight)
            }
        }

        if (changes["dataset"]) {
            if (this.dataset?.[this.config.query]) {
                this.loading = false;
                let data = this.dataset?.[this.config.query];

                if((data as DatasetError).errorMessage) {
                    this.errorMessage = (data as DatasetError).errorMessage;
                } else {
                    this.errorMessage = undefined;
                    data = data as Results;

                    switch (this.config.type) {
                      case "timeline":
                          this.timeSeries = [];
                          if (this.config.aggregationsTimeSeries) {
                              this.timeSeries.push(
                                  ...this.timelineProvider.getAggregationsTimeSeries(data, this.config.aggregationsTimeSeries, this.auditService.mask)
                              );
                              this.columnDefs = this.timelineProvider.getGridColumnDefs(this.config.aggregationsTimeSeries);
                              this.rowData = this.timelineProvider.getAggregationsRowData(data, this.config.aggregationsTimeSeries);
                          }
                          if (this.config.recordsTimeSeries) {
                              this.timeSeries.push(
                                  ...this.timelineProvider.getRecordsTimeSeries(data, this.config.recordsTimeSeries)
                              );
                              this.columnDefs = this.timelineProvider.getGridColumnDefs(this.config.recordsTimeSeries);
                              this.rowData = data.records
                          }
                          break;
                      case "chart":
                          if (this.config.chartData) {
                              if (this.config.title === 'msg#widgets.regular_newUsers.text') {
                                  this.chartResults = {
                                      records: [] as Record[],
                                      aggregations: [
                                          {
                                              name: "regular-new-user",
                                              column: "",
                                              items: (this.dataset["newUsers"] && this.dataset["regularUsers"])
                                                      ? [
                                                          {value: "New users", count: this.dataset["newUsers"]["totalrecordcount"]},
                                                          {value: "Regular users", count: this.dataset["regularUsers"]["totalrecordcount"]}
                                                      ]
                                                      : []
                                          }
                                      ] as Aggregation[]
                                  } as  Results;
                              } else {
                                  this.chartResults = this.chartProvider.getChartData(data, this.config.chartData);
                              }
                              this.columnDefs = this.chartProvider.getGridColumnDefs(this.config.chartData);
                              this.rowData = data?.aggregations?.find((agg) => agg.name === this.config.chartData?.aggregation)?.items || []
                          }
                          break;
                      case "grid":
                          this.columnDefs = this.gridProvider.getGridColumnDefs(this.config.columns, this.config.showTooltip);
                          if (this.config.aggregationName) {
                              this.rowData = this.gridProvider.getAggregationRowData(data, this.config.aggregationName)
                          } else {
                              this.rowData = data.records
                          }
                          break;
                      default:
                          break;
                  }
                }
            } else {
                this.loading = true
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
        if (this.config.type === "chart" || this.config.type === "timeline") {
            this.resizeGrid();
        }
        if (this.tooltipInfo) {
            this.infoAction = new Action({
                icon: "fas fa-info",
                title: this.config.info,
                disabled: true,
                action: () => {}
            });
            this.actions = [this.infoAction, ...this.actions]
        }

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

            if (gridsterItem.classList.contains('widget-maximized-view')) { // update component defined in gridsterItem to full-fill its maximized space
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
                this.fullScreenAction.disabled = gridsterItem.classList.contains('widget-maximized-view');
            }
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
        this.chartObj.resizeTo(this.width, this.innerheight);
    }

    onChartTypeChange(type: string) {
        if(type === 'grid') {
          this.config.icon = "fas fa-th-list";
        }
        else {
          this.config.icon = "fas fa-chart-pie";
        }
        this.config.chartType = type;
        this.dashboardService.notifyItemChange(this.config);
    }

    /**
     * Notifies parent that a record was clicked
     * @param record
     */
    onRecordClicked(record?: Record){
        if(record){
            this.recordClicked.next(record);
        }
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
}
