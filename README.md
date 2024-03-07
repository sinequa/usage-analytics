# Usage Analytics

*Usage Analytics* is an application built on top of Sinequa libraries, as a collaborative and interactive set of dashboards.

<span style="display:block;text-align:center">![Usage Analytics](/docs/assets/app.PNG)</span>

For more information about Sinequa libraries, please refer to the [Sinequa documentation](https://doc.sinequa.com) and the [SBA framework documentation](https://sinequa.github.io/sba-angular).

## Table of contents

* [Prerequisites](#prerequisites)
* [Dataset Web service](#dataset_web_service)
* [Dashboards](#dashboards)
    * [Introduction](#introduction)
    * [Configuration principle](#configuration_principle)
    * [Initialization of dashboards](#initialization_of_dashboards)
    * [Customization](#customization)
        * [Ordinary user](#ordinary_user)
        * [Admin user](#admin_user)
    * [Tips and tricks](#tips_tricks)
        * [Widget display](#widget_display)
        * [Widget creation / initialization](#widget_creation)
        * [Widget synchronization](#widget_synchronization)
        * [Widget persistence](#widget_persistence)
        * [Widget sizing](#widget_sizing)
        * [Widget tooltips](#widget_tooltips)
        * [Formatting widget numbers](#widget_numbers)
        * [Display multiple time series in a single timeline](#plot_multiple_timeseries)
    * [Export / Import](#export_import)

## <a name="prerequisites"></a> Prerequisites
Similar to any Angular application, the first step to do is to install the project **dependencies**. The list of dependencies is defined in the `package.json`.

To do so, open a **Terminal** and run 

```ts
npm install
```

⚠️ You may face a problem while running the above command. This should be a node-related issue.

In such case, we recommend the use of the following 

```ts
npm install --legacy-peer-deps
```

## <a name="dataset_web_service"></a> Dataset Web service
Behind the scenes, *Usage Analytics* uses the **Dataset Web Service** to retrieve the data.
It allows getting information from indexes through multiple SQL queries. Thus, it is the best fit to build dashboard reports, 360 views and so on.

However, using the dataset web service within native Sinequa libraries requires a few simple adjustments :

- Deactivate Search for the route where you want to use Dataset web service.
- Listen to Search events and send requests to the Dataset web service, using the Query object (where we used to store parameters).

<span style="display:block;text-align:center">![DataSet Web Service](/docs/assets/dataset.PNG)</span>

This logic is implemented in the `audit.service.ts` :

- `updateAuditFilters(): void`

    This method programmatically handles the search lifecycle and brings the use of all searchService functionalities (update of breadcrumbs, extract filters from the query object, build the global query's select expression ...) in a dataset web service without the complexity of rewriting a dedicated service for this purpose.

- `getAuditTimestampFromUrl(): string | Date[] | undefined`

    This method extracts the time range filter from the navigation URL.

- `getRequestScope(facetName: string): string[]`

    This method retrieves the scope of the dataset queries (i.e: list of applications we are interested in their analytics).

- `updateDatasetsList(): string[]`

    This method specifies the list of queries, part of the dataset, that we want to execute among the whole list.

- `getParallelStreamAuditData(filters: string, start: string, end: string, apps: string[], profiles: string[], excludedDataset: string[] = []): Observable<Dataset>`

    This method triggers parallel HTTP requests among the queries defined in the dataset web service.

- `updateRangeFilter(timestamp: Date[] | string)`

    This method updates the query object with the provided time range filter.

- `updateRequestScope(field: string, value: string[] | string, facetName: string)`

    This method updates the query object with the selected list of targeted applications.

- `convertRangeFilter(timestamp?: string[] | string, parsedTimestamp?: AuditDatasetFilters)`

    This method converts date range filters to a more readable format.

- `parseAuditTimestamp(timestamp: string | Date[]): AuditDatasetFilters`

    This method converts the time range to the appropriate request parameter's format.

## <a name="dashboards"></a> Dashboards

### <a name="introduction"></a> Introduction

Dashboards of *Usage Analytics* are based on the [**angular-gridster2**](https://tiberiuzuld.github.io/angular-gridster2/) library.

The application is organized in multiple tabs. Each tab is considered as a separate dashboard.

A dashboard is basically defined by the following simplified piece of code :
```html
<gridster #gridster [options]="dashboardService.options">
    <div>
        <gridster-item [item]="item" *ngFor="let item of dashboardService.dashboard.items; index as i">
            <sq-dashboard-item
                [config]="item"
                [dataset]="auditService.data$ | async"
                [previousDataSet]="auditService.previousPeriodData$ | async"
                [width]="item.width"
                [height]="item.height">
            </sq-dashboard-item>
        </gridster-item>
    </div>
</gridster>
```
There are three levels in the above snippet:

- `<gridster>`: The main component provided by the [angular-gridster2](https://tiberiuzuld.github.io/angular-gridster2/) library, which wraps the widgets provided inside. This component takes in the **`options`** of the Gridster dashboard (of type [`GridsterConfig`](https://github.com/tiberiuzuld/angular-gridster2/blob/master/projects/angular-gridster2/src/lib/gridsterConfig.interface.ts)). These options are all detailed in the library's [online documentation](https://tiberiuzuld.github.io/angular-gridster2/).
- `<gridster-item>`: A component provided by the [angular-gridster2](https://tiberiuzuld.github.io/angular-gridster2/) library for wrapping each widget of the dashboard. This component will be responsible for managing the positioning, dragging and resizing of the widgets. The component takes in an **`item`** object (of type [`GridsterItem`](https://github.com/tiberiuzuld/angular-gridster2/blob/master/projects/angular-gridster2/src/lib/gridsterItem.interface.ts)).
- `<sq-dashboard-item>`: A Sinequa component that is defined at the app level (`app/audit/dashboard/dashboard-item.component.ts`). This component is essentially a switch to display the right component in function of the widget type. The widget type is passed via the **`config`** input. Notice that the `item` input of `<gridster-item>` is also used for this `config` input. This is because we chose to use a single object to manage both the state of the widget ([`GridsterItem`](https://github.com/tiberiuzuld/angular-gridster2/blob/master/projects/angular-gridster2/src/lib/gridsterItem.interface.ts) interface) and its configuration (`DashboardItem` interface). The `DashboardItem` interface is in fact a direct extension of [`GridsterItem`](https://github.com/tiberiuzuld/angular-gridster2/blob/master/projects/angular-gridster2/src/lib/gridsterItem.interface.ts).

Notice in the above snippet that the list of dashboard items, as well the options of the dashboard, are managed by a new `DashboardService`. This Angular service, which lives in the Usage Analytics app (`app/audit/dashboard/dashboard.service.ts`), manages the following tasks:

- Initializing dashboards.
- Storing the state of the dashboard and its global options.
- Saving, opening, deleting and sharing dashboards. Once the user saves its own customized version of dashboards, it is then persisted in the [User Settings](https://sinequa.github.io/sba-angular/tutorial/user-settings.html).
- Managing URL changes / navigation, when a dashboard is opened, saved, deleted or imported.
- Editing the dashboard (adding or removing items).
- Emitting events when the dashboard changes.

### <a name="configuration_principle"></a> Configuration principle

*Usage Analytics* is designed to support 2 types of configuration :

- Server side configuration: This is the principle way. Administrators can override the built-in configuration by updating the **Customization tab** in the administration of the application.

<span style="display:block;text-align:center">![Server side configuration](/docs/assets/server_side_architecture.png)</span>

- Built-in configuration: This is a fallback if the server side configuration is omitted. The default server side configuration is copied in the source code of the app. It can be modified there, but it requires recompiling the application.

<span style="display:block;text-align:center">![Client side configuration](/docs/assets/client_side_architecture.png)</span>

The configuration allows to set application's **params**, define the list and settings of each widget, the content of the default dashboards and the content of the widgets palette.
This can be done whether in local config file at app level `config.ts` or defined on the Sinequa server (Application > Customization (JSON)). **The configuration defined on the server overrides the one defined locally**.


`DashboardService` handles those cases while initializing the application :

- `getWidgets(): {[key: string]: DashboardItemOption}`

    This method returns the list of widgets from the configuration defined on the server (appService.app.data.widgets) or in the config.ts file (WIDGETS).

- `getPalette(): {name: string, items: DashboardItemOption[]}[]`

    This method builds the palette of widgets from the configuration defined on the server (appService.app.data.palette) or in the config.ts file (PALETTE).

- `getStandardDashboards(): {name: string, items: {item: DashboardItemOption, position: DashboardItemPosition}[]}[]`

    This method returns the list of standard dashboard from the configuration defined on the server (appService.app.data.standardDashboards) or in the config.ts file (STANDARD_DASHBOARDS).

### <a name="initialization_of_dashboards"></a> Initialization of dashboards

Starting from the 11.9.0, the application includes a smart behavior when loading dashboards. It consists of notifying users, having customized their own dashboards, of potential changes made by admins to the default configuration.

<span style="display:block;text-align:center">![Notification](/docs/assets/updates-notification.PNG)</span>

Behind the scenes, a sequence of comparisons is performed between several *Hash keys* of the default, current and local configuration of all users. The logic is implemented in the `initDashboards()` of the `DashboardService`.

<span style="display:block;text-align:center">![Initialization of dashboards](/docs/assets/dashboards_initialization.PNG)</span>



### <a name="customization"></a> Customization

Basically, two different ways of customization can be applied to the *Usage Analytics* application, depending on the user rights.

**1 - Ordinary user** <a name="ordinary_user"></a>

Ordinary users have the ability to perform several modifications on both widgets and dashboards.

On the first hand and considering the type of the widget (timeline, chart, grid ...), they can:

- Resize existing widgets
- Rename widgets
- Remove widgets from the dashboard
- Change the display of widgets
- Show/Hide timelines illustrating the previous period

<span style="display:block;text-align:center">![Dashboard actions](/docs/assets/widget-actions.PNG)</span>

- Add widgets from a palette of predefined ones
<span style="display:block;text-align:center">![Dashboard actions](/docs/assets/add-widget.PNG)</span>

On the other hand, it is also possible to apply some actions to dashboards such as create new dashboard, delete, rename,  mark as default ...
<span style="display:block;text-align:center">![Dashboard actions](/docs/assets/dashboard_actions.PNG)</span>

Notice that any saved modification leads to an update of the whole configuration in the **user settings** and, so on, it will be saved as the default version displayed to that specific user.
Users can always reset their modifications and go back to the default configuration as defined in the customization of the application or in the config.ts file .
<span style="display:block;text-align:center">![Dashboard actions](/docs/assets/reset-dashboards.PNG)</span>

**2 - Admin user** <a name="admin_user"></a>

In addition to options already provided to an ordinary user, an admin can modify several aspects from **Customization (JSON)** tab of the application. There, it is possible to override: 

- `logo: string`: (**"assets/logo.png"** by default) Path of the application logo.
- `title: string`: (**"Usage Analytics"** by default) Application name displayed in the browser tab.
- `enableUserFeedbackMenu: boolean`: (**true** by default) Show/Hide the button used to send a user's feedback.
- `enableHelpPageLink: boolean`: (**true** by default) Show/Hide the button used to navigate to the help page.
- `sq_timezone: string`: (**"UTC"** by default) Time zone name of Sinequa server to which time filters should be converted before being sent. Please refer to the [time zones database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones).
- `session_count_threshold_per_month: number`: (**2** by default) Used by “Active Users” related widgets. It allows to modify the calculation: a user is considered active when he did at least such sessions.
- `potential_total_user_count: number`: (**0** by default) Used by “User Coverage” widget. It represents the total number of users who can use the platform within the company. Notice that this parameter **must be updated** by the admin. If not, the widget will display an error message.
- `static_filters_expr: string`: (**""** by default) A filter expression appended to the **where clause** of **all queries in the dataset**. **A fielded search syntax is required**. Please refer to the [documentation](https://doc.sinequa.com/en.sinequa-es.v11/Content/en.sinequa-es.ui.searchOperators.html) for further information.

    For example, if you want to exclude a fake user, of **userid = "my-fake-user-id"**, (used in the testing phase) from all queries, you should have the following :
    ```json
    "static_filters_expr": "userid <> 'my-fake-user-id'"
    ```
    This will result in adding the following expression to the where clause of all queries:
    ```sql
    where userid <> 'my-fake-user-id'
    ```
- `custom_params: : MapOf<string>`: (**{}** by default) Set of params that could be declared and used in **a specific query statement (From clause, where clause …)**. A custom param is accessible at the query level using its key and the following syntax **{$.key}**.

    For example, if you have to manage multiple analytics applications, each corresponding to a specific Sinequa application, and assuming that you want to use different audit index for each one, you can use the following configuration to simply target a specific index from you customization tab:
    ```json
    "custom_params": {
        "audit_index": "my-audit-index"
    }
    ```
    Then, you can use the **{$.audit_index}** in the query statement as follows:
    ```sql
    select ... from {IfEmpty($.audit_index,GetIndexNames('audit,auditreplicated,auditreplicatedqueue'))} where ...
    ```
    ⚠️ Notice that the **GetIndexNames** function, used by default in all queries to resolve the index(es) in the **FROM clause**, is differently applied **only in this example** to handle the case where the **audit_index** is defined in the customization tab. Thus, if you want to have this behavior, please don't forget to update your `dataset web service`
- `default_timestamp_filter: string | Date[]`: (**""** by default) Override the default time filter (initially set to 1 month at the application level). Possible values are :
    - Members of `RelativeTimeRanges` enumeration (`["msg#dateRange.last3H", "msg#dateRange.last6H", "msg#dateRange.last12H", "msg#dateRange.last24H", "msg#dateRange.last7D", "msg#dateRange.last30D", "msg#dateRange.last90D", "msg#dateRange.last6M", "msg#dateRange.last1Y", "msg#dateRange.last2Y", "msg#dateRange.last5Y"]`).
    - Array of start and end date (`[new Date("1/1/2021"), new Date("1/1/2022")]`).
- `default_app_filter: string | string[]`: (**""** by default) Pre-filtering the scope of the queries in the dataset by the provided list of SBA applications.
- `default_profile_filter: string | string[]`: (**""** by default) Pre-filtering the scope of the queries in the dataset by the provided list of PROFILE applications.
- `mono_scope_queries: string[]`: (**[]** by default) List of widgets requiring a filter by a unique scope ( if not the case, an error message is displayed within the widget).
- `facet_filters_query: string`: (**applications** by default) Query name used by the filtering facet.
- `facet_filters_name: string`: (**Applications** by default) Name of the filtering facet.
- `facet_filters_icon: string`: (**fas fa-desktop** by default) Icon of the filtering facet.
- `facets: FacetConfig<FacetListParams>[]`: List of facet filter's configuration available on the top of dashboards. Please refer to this [documentation](https://sinequa.github.io/sba-angular/tutorial/facet-module.html) for more informations about facets.
- `widgets: MapOf<DashboardItemOption>`: Configurations of available widgets in the application.
- `standardDashboards: {name: string, items: {item: string, position: DashboardItemPosition}[]}[]`: Definition of default dashboards to be displayed for users if no customization is stored in their user settings (after saving modification(s)).
- `palette: {name: string, items: string[]}[]`: List of available widgets that could be added to a dashboard.

### <a name="tips_tricks"></a> Tips and tricks

*Usage Analytics* is meant to be customized easily, especially to let developers create new types of widgets, either generic or specific to their use cases.

Adding a widget will impact several parts of the code, and several aspects must be taken into account:

- The widget must be displayed (within its parent component `sq-dashboard-item`, as an additional switch case).
- The widget creation must be triggered somewhere in the application (upon initialization or user action).
- The widget must properly interact with other widgets and the dataset web service (query changes, ...).
- The widget might have properties needing to be persisted.
- The widget size must be adapted to the dashboard grid.

**1 - Widget creation / initialization** <a name="widget_creation"></a>

The creation of the widget can occur in different ways:

  1. By selecting a built-in widget from the palette.
  2. On initialization, when a dashboards are created / loaded.
  3. Adding custom widget in `config.ts` or at administration level.

In any case, it is necessary to create a `DashboardItemOption` object. By design, this interface is very generic and can be used to create any type of widget. It contains the following properties: 
```ts
export interface DashboardItemOption {
    id: string;
    icon: string;
    title: string;
    parameters: StrictUnion<DashboardItemParams>;
    unique?: boolean;
    info?: string;
}
```
where :
- `id` is the unique identifier of the widget.
- `icon` is the icon displayed in the palette.
- `title` is the title displayed in the palette.
- `unique` is an optional boolean indicating if the widget can be used multiple times in the same dashboard.
- `info` is an optional string displayed in the widget's tooltip.
- `parameters` is a strict union of `DashboardItemParams`, all possible parameters for all widgets. By default, it is defined as follow:

```ts
export type DashboardItemParams = TimelineParams | ChartParams | HeatmapParams | MultiLevelPieParams | StatParams | GridParams;
```

⚠️ Assuming this design, adding a new custom widget must override `DashboardItemParams` type. For example, if we want to create a new widget type called `MyWidgetType`, we must create a new interface `MyWidgetTypeParams` and add it to the `DashboardItemParams` union. The `DashboardItemParams` type will then be defined as follow:

```ts
export type DashboardItemParams = TimelineParams | ChartParams | HeatmapParams | MultiLevelPieParams | StatParams | GridParams | MyWidgetTypeParams;
```

- **i) Timeline widget**

This widget type is used to display a timeline chart. Its parameters must implement the `TimelineParams` interface:

```ts
export interface TimelineParams {
    type: "timeline";
    queries: string[];
    chartType: "Timeline" | "Grid";
    aggregationsTimeSeries?: AggregationTimeSeries | AggregationTimeSeries[];
    recordsTimeSeries?: RecordsTimeSeries;
    showPreviousPeriod?: boolean;
    enableSelection?: boolean;
}
```
where :
- `type` is the widget type fixed as "timeline".
- `queries` is the list of queries to be executed to retrieve the data.
- `chartType` is the view of chart to be displayed. It can be either "Timeline" or "Grid".
- `aggregationsTimeSeries` is an optional aggregation(s) information needed to display aggregation data on the chart. It can be either an `AggregationTimeSeries` object or a list of `AggregationTimeSeries` objects.
- `recordsTimeSeries` is an optional records information needed to display records data on the chart. It must be a `RecordsTimeSeries` object.
- `showPreviousPeriod` is an optional boolean indicating wether the previous period should be displayed/hidden on the chart.
- `enableSelection` is an optional boolean indicating wether the selection should be enabled/disabled on the grid view.

As an example, the configuration object to create a "Search count timeline" widget is as follow:

```ts
"searchCountTotalTimeline": {
    "id": "searchCountTotalTimeline",
    "title": "Search Summaries Timeline",
    "icon": "fas fa-chart-line",
    "info": "<span class='text-decoration-underline'><b>Description:</b></span> Number of Search Summaries over time. <br>      <span class='text-decoration-underline'><b>Interpretation:</b></span>  An increase in the number of Search Summaries over time is an indicator of platform adoption. <br> <span class='text-decoration-underline'><b>Calculation:</b></span>  Addition of all Search Summaries.",
    "unique": true,
    "parameters": {
        "type": "timeline",
        "queries": ["searchTotalTimeLine"],
        "aggregationsTimeSeries": {
            "name": "SearchSummaryTotal",
            "dateField": "value",
            "valueFields": [{"name": "count", "title": "Search Summaries Count", "primary": true}]
        },
        "chartType": "Timeline",
        "showPreviousPeriod": false
    }
}
```

- **ii) Chart widget**

This widget type is used to display a non-temporal chart. Its parameters must implement the `ChartParams` interface:

```ts
export interface ChartParams {
    type: "chart";
    query: string;
    chartType: "Column2D" | "Bar2D" | "Pie2D" | "doughnut2d" | "Column3D" | "Bar3D" | "Pie3D" | "doughnut3d" | "Grid";
    chartData: ChartData;
    enableSelection?: boolean;
}
```
where :
- `type` is the widget type fixed as "chart".
- `query` is the query to be executed to retrieve the data.
- `chartType` is the view of chart to be displayed. It can be either "Column2D", "Bar2D", "Pie2D", "doughnut2d", "Column3D", "Bar3D", "Pie3D", "doughnut3d" or "Grid".
- `chartData` is the information needed to load the displayed data on the chart. It must be a `ChartData` object.
- `enableSelection` is an optional boolean indicating wether the selection should be enabled/disabled on the grid view.

As an example, the configuration object to create a "Top queries" widget is as follow:

```ts
"topQueries": {
    "id": "topQueries",
    "icon": "fas fa-th-list",
    "title": "Top Full-text Queries",
    "info": "<span class='text-decoration-underline'><b>Description:</b></span> Most frequent full-text queries. <br> <span class='text-decoration-underline'><b>Interpretation:</b></span>  Understanding user searches enables levers to be activated to provide them with more relevant results. Relevance indicator. <br> <span class='text-decoration-underline'><b>Calculation:</b></span>  Distribution of the top 100 full-text queries",
    "unique": true,
    "parameters": {
        "type": "chart",
        "query": "topQueries",
        "chartData": {
            "aggregation": "query"
        },
        "chartType": "Grid"
    }
}
```

- **iii) Heatmap widget**

This widget type is used to display a heatmap chart. Its parameters must implement the `HeatmapParams` interface:

```ts
export interface HeatmapParams {
    type: "heatmap";
    query: string;
    chartType: "Heatmap" | "Grid";
    chartData: HeatmapData;
    enableSelection?: boolean;
}
```
where :
- `type` is the widget type fixed as "heatmap".
- `query` is the query to be executed to retrieve the data.
- `chartType` is the view of chart to be displayed. It can be either "Heatmap" or "Grid".
- `chartData` is the information needed to load the displayed data on the chart. It must be a `HeatmapData` object.
- `enableSelection` is an optional boolean indicating wether the selection should be enabled/disabled on the grid view.

As an example, the configuration object to create a "Indexing sources / file extensions Success" widget is as follow:

```ts
"sourceFileExtensionsSuccess": {
    "id": "sourceFileExtensionsSuccess",
    "icon": "fas fa-th fa-fw",
    "title": "Indexing sources / file extensions Success",
    "info": "<span class='text-decoration-underline'><b>Description:</b></span>Allows to locate the most successfully indexed documents mixing a source with a type of file extension.. ",
    "unique": true,
    "parameters": {
        "type": "heatmap",
        "query": "indexingSourceFileExtensionsSuccess",
        "chartData": {
            "aggregation": "SourceFileExtensionsSuccess"
        },
        "chartType": "Heatmap"
    }
}
```

- **iv) Stat widget**

This widget type is used to display a statistic. Its parameters must implement the `StatParams` interface:

```ts
export interface StatParams {
    type: "stat";
    query: string;
    asc: boolean;
    valueLocation?: StatValueLocation;
    valueField?: StatValueField;
    operation?: StatOperation;
    relatedQuery?: string;
    relatedValueLocation?: StatValueLocation;
    relatedValueField?: StatValueField;
    relatedOperation?: StatOperation;
    computation?: StatOperation;
    numberFormatOptions?: Intl.NumberFormatOptions;
}
```
where :
- `type` is the widget type fixed as "stat".
- `query` is the query to be executed to retrieve the data.
- `asc` is a boolean indicating wether the positive evaluation is at increase or decrease trend.
- `valueLocation` is an optional `StatValueLocation` object indicating where to find the value field.
- `valueField` is an optional `StatValueField` object indicating how to access value field.
- `operation` is an optional `StatOperation` object indicating the operation to compute the value.
- `relatedQuery` is an optional string containing the query containing the second leg of the stat operands.
- `relatedValueLocation` is an optional `StatValueLocation` object indicating where to find the value field of the second stat operands.
- `relatedValueField` is an optional `StatValueField` object indicating how to access value field of the second stat operands.
- `relatedOperation` is an optional `StatOperation` object indicating the operation to compute the value of the second stat operands.
- `computation` is an optional `StatOperation` object indicating the operation to get the global value of the stat.
- `numberFormatOptions` is an optional `Intl.NumberFormatOptions` object indicating the options of formatting numbers.

As an example, the configuration object to create a "Search count" widget is as follow:

```ts
"searchCountTotal": {
    "id": "searchCountTotal",
    "icon": "fas fa-balance-scale",
    "title": "Search summaries",
    "info": "<span class='text-decoration-underline'><b>Description:</b></span> Number of all Search Summaries. <br> <span class='text-decoration-underline'><b>Interpretation:</b></span>  Adoption indicator. <br> <span class='text-decoration-underline'><b>Calculation:</b></span>  Addition of all Search Summaries",
    "unique": true,
    "parameters": {
        "type": "stat",
        "query": "searchTotal",
        "valueLocation": "totalrecordcount",
        "asc": true
    }
}
```

- **v) Grid widget**

This widget type is used to display a grid. Its parameters must implement the `GridParams` interface:

```ts
export interface GridParams {
    type: "grid"
    query: string;
    columns: GridColDef[];
    aggregation?: string;
    showTooltip?: boolean;
    enableSelection?: boolean;
}
```
where :
- `type` is the widget type fixed as "grid".
- `query` is the query to be executed to retrieve the data.
- `columns` is an array of `GridColDef` objects indicating the columns to be displayed on the grid.
- `aggregation` is an optional string indicating that this aggregation data will be applied on the grid, if not `Results.records` will be used.
- `showTooltip` is an optional boolean indicating wether the tooltip should be displayed on the grid.
- `enableSelection` is an optional boolean indicating wether the selection should be enabled/disabled on the grid.

As an example, the configuration object to create a "User feedback grid" widget is as follow:

```ts
"userFeedbackGrid": {
        "id": "userFeedbackGrid",
        "title": "User Feedback",
        "icon": "fas fa-th-list",
        "info": "<span class='text-decoration-underline'><b>Description:</b></span> User messages sent via the Feedback widget",
        "unique": true,
        "parameters": {
            "type": "grid",
            "query": "userFeedback",
            "columns": [
                {
                    "field": "app",
                    "headerName": "Appl",
                    "filterType": "text",
                    "formatterType": "text"
                },
                {
                    "field": "message",
                    "headerName": "Message",
                    "filterType": "text",
                    "formatterType": "text"
                },
                {
                    "field": "detail",
                    "headerName": "Detail",
                    "filterType": "text",
                    "formatterType": "text",
                    "multiLineCell": true
                }
            ],
            "showTooltip": true
        }
    }
```

- **vi) Multi Level Pie widget**

This widget type is used to display a multi level pie. Its parameters must implement the `MultiLevelPieParams` interface:

```ts
export interface MultiLevelPieParams {
    type: "multiLevelPie";
    multiLevelPieQueries: MultiLevelPieQuery[];
    multiLevelPieData: MultiLevelPieConfig[];
}
```
where :
- `type` is the widget type fixed as "multiLevelPie".
- `multiLevelPieQueries` is an array of `MultiLevelPieQuery` objects indicating all the queries needing to be executed to retrieve the data and the location of the concerning data.
- `multiLevelPieData` is an array of `MultiLevelPieConfig` objects indicating the representational tree configuration of the multi level pie.

As an example, the configuration object to create a "Users Repartition" widget is as follow:

```ts
"usersRepartition": {
    "id": "usersRepartition",
    "title": "Taxonomy of users",
    "info": "",
    "unique": true,
    "parameters": {
        "type": "multiLevelPie",
        "multiLevelPieQueries": [
            {
                "query": "totalUsers",
                "valueLocation": "totalrecordcount"
            },
            {
                "query": "userCountTotal",
                "valueLocation": "totalrecordcount"
            },
            {
                "query": "newUsers",
                "valueLocation": "totalrecordcount"
            },
            {
                "query": "activeNewUsers",
                "valueLocation": "totalrecordcount"
            },
            {
                "query": "inactiveNewUsers",
                "valueLocation": "totalrecordcount"
            },
            {
                "query": "existingUsers",
                "valueLocation": "totalrecordcount"
            },
            {
                "query": "activeExistingUsers",
                "valueLocation": "totalrecordcount"
            },
            {
                "query": "inactiveExistingUsers",
                "valueLocation": "totalrecordcount"
            }
        ],
        "multiLevelPieData": [
            {
                "label": "Potential users",
                "valueExpr": "totalUsers",
                "category": [
                    {
                        "label": "Unique users",
                        "valueExpr": "userCountTotal",
                        "category": [
                            {
                                "label": "New users",
                                "valueExpr": "newUsers",
                                "category": [
                                    {
                                        "label": "Active new users",
                                        "valueExpr": "activeNewUsers"
                                    },
                                    {
                                        "label": "Inactive new users",
                                        "valueExpr": "inactiveNewUsers"
                                    },
                                    {
                                        "label": "Zero search",
                                        "valueExpr": "newUsers - activeNewUsers - inactiveNewUsers"
                                    }
                                ]
                            },
                            {
                                "label": "Existing users",
                                "valueExpr": "existingUsers",
                                "category": [
                                    {
                                        "label": "Active existing users",
                                        "valueExpr": "activeExistingUsers"
                                    },
                                    {
                                        "label": "Inactive existing users",
                                        "valueExpr": "inactiveExistingUsers"
                                    },
                                    {
                                        "label": "Zero search",
                                        "valueExpr": "existingUsers - activeExistingUsers - inactiveExistingUsers"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "label": "Never connected users",
                        "valueExpr": "totalUsers - userCountTotal"
                    }
                ]
            }
        ]
    }
}
```
⚠️ Notice that the queries name are used in the `valueExpr` as operands in order to calculate the value of each node of the tree. The corresponding value is resolved by the method `resolveValue` in the `multi-level-pie-provider.ts` component (`src/app/audit/dashboard/providers/multi-level-pie-provider`)

Once the configuration object of the widget is ready, it can be included to the **Palette**, simply add it to the list :

```ts
export const PALETTE: {name: string, items: string[]}[] = [
  {
      name: "...",
      items: [
          ...
          "my-new-widget",
          ...
      ]
  }
]
```

To include this new widget on initialization of a standard dashboard, simply add it to the list of its items:

```ts
// The position of the widget inside the dashboard can be set by default, using "position".
// Otherwise, Gridster library will automatically put it in first empty position  
export const  STANDARD_DASHBOARDS: {name: string, items: {item: string, position: DashboardItemPosition}[]}[] = [
    {
        name: "...",
        items: [
            {item: "my-new-widget", position: {x: 0, y: 0}}
        ]
    }
]
```

Finally, if you want to add a widget programmatically, just pass your dashboard option to the `addWidget()` method:

```ts
// This adds a new widget with default size to the current dashboard (optional arguments can be passed to set the size and other settings)
this.dashboardService.addWidget(MY_NEW_WIDGET);
```

This method returns the `item` object (of type `DashboardItem`) that will be passed to the `sq-dashboard-item` component. You can add or modify properties of this `item`: This is useful if your widget expects specific types of inputs.

**2 - Widget display** <a name="widget_display"></a>

The widget's display must be implemented in the `sq-dashboard-item` component (`src/app/audit/dashboard/dashboard-item.component`). The template of this component is composed of a `sq-facet-card` (see [facets](https://sinequa.github.io/sba-angular/tutorial/facet-module.html)) wrapping a Switch-Case directive to display the desired component (either a chart, stat, timeline, etc.). Therefore, adding a new component means simply adding a new "case" such as:

```html
<my-custom-widget *ngSwitchCase="'my-custom-type'" [results]="results">
</my-custom-widget>
```

Your widget might require other input parameters, that you can create and manage inside `dashboard-item.component.ts` (generally, binding the global `results`, `dataset` or `data` as an input of your component is needed to refresh the widget upon new dataset web service changes). The component might also generate events, which you will want to handle in the controller as well.

**3 - Widget synchronization** <a name="widget_synchronization"></a>

The way the built-in widgets are designed is actually to **avoid explicit synchronization**, that is: to do nothing and keep the components independent from each other.

However, it is clear when using *Usage Analytics* that *some form of synchronization happens* when the user interacts with a component. For example, if I use the timeline to update the time range filter.

The way it works is that the widgets **respond only to an update of the global dataset web service response**. **Widgets cannot talk to each other directly**, but some user interactions (like selecting a portion on the chart) can trigger a refresh of the global dataset web service response (which itself triggers a refresh of the widgets).

**4 - Widget persistence** <a name="widget_persistence"></a>

The *state* of your widget can be defined in three locations:

- The internal state of the component. This state is not persisted: If you refresh the page, or if you select another dashboard and come back, this internal state is reset to its defaults.
- The inputs passed to the component from its parent (`sq-dashboard-item`). These inputs often consist of the **`Results` / `dataset` ...** object (or a subset of these results, like a `Record` or an `Aggregation`). This state is not persisted either: If you refresh the page, new global dataset web service response is obtained, transformed and passed to your component.
- The inputs stored in the `DashboardItem` object. These inputs *are* persisted, because (by definition) the state of the dashboard that is persisted is essentially the list of `DashboardItem`. When you refresh the page, the dashboard items are downloaded from the user settings, allowing to display the widgets in the same state as you left them. When you share a dashboard with a colleague, the URL contains the serialized list of items.

In the standard components, the items that are persisted are for example:

- For all widgets: Widget query, size and position in the dashboard.
- For the **timeline** widget: aggregationsTimeSeries...
- For the **chart** widget: chart data and chart type...
- For the **stat** widget: valueLocation, operation, relatedQuery...
- For the **grid** widget: row data, columns, grid options...
- For the **multi level pie** widget: tree data, queries ...

If your custom widget needs to have a part of the state persisted, a few things need to be considered:

- In your component, that state must exist as an *optional* input (typically with a default value, to manage the case when the component is first created):

    ```ts
    @Input() myParam = false;
    ```

- When your component changes that state, it should emit an event:

    ```ts
    @Output() myParamChange = new EventEmitter<boolean>();

    ...
    this.myParam = !this.myParam;
    this.myParamChange.next(myParam);
    ```

- In the template of `sq-dashboard-item`, bind the `myParam` input to its value in the `config` object and listen to the event to call an event handler:

    ```html
    <my-custom-widget
        [myParam]="config['myParam']"
        (myParamChange)="onMyParamChange($event)">
    </my-custom-widget>
    ```

- In the controller of `sq-dashboard-item`, implement the following handler:

    ```ts
    onMyParamChange(myParamValue: boolean) {
        this.config['myParam'] = myParamValue;
        this.dashboardService.notifyItemChange(this.config);
    }
    ```

    It is important to notify the `DashboardService` of the change in the dashboard, so users notice that changes are not yet saved and the state can be immediately persisted if clicking on save button.

Note that you can greatly simplify the above if your component directly has access to the `DashboardItem` and `DashboardService` (but that means your component won't be reusable outside of the context of a dashboard).

**5 - Widget sizing** <a name="widget_sizing"></a>

One difficulty of building widgets is that their size is strongly constrained by the dashboard, so the components cannot take their ideal size: they must adapt to any size (for example by forcing a width and height of 100% or by scrolling vertically or horizontally) or conform to an explicit size provided by the parent (`sq-dashboard-item`).

The built-in components behave differently in that respect:

- The charts are explicitly resized when the dashboard is initialized or resized.
- The stats are explicitly resized (the width automatically takes 100%).
- The timelines are svg-based and are redrawn when resized: the `width` and `height` are therefore bound explicitly.

If your component must be redrawn when its size changes, it is likely to need an interface similar to the timeline components. Concretely, it will probably require explicit width and height inputs (probably with default values). The `ngOnChange()` will then catch any change of dimension from the parent, and trigger the redrawing:

```ts
@Input() width = 600;
@Input() height = 400;

ngOnChanges(changes: SimpleChanges) {
    if(changes['width'] || changes['height']) {
        redraw();
    }
}
```

The `width` and `height` inputs may also be used in the template. For example:

```html
<svg width="{{width}}+'px'" height="{{height}}+'px'">
   ...
</svg>
```

Note that in the parent `sq-dashboard-item` component, the width and height of the item are inputs of the component and are automatically refreshed when the dashboard is modified. However, an `innerheight` parameter is computed in `ngOnChanges()` to account for the height of the facet header.

**6 - Widget tooltips** <a name="widget_tooltips"></a>

Tooltips in *Usage Analytics* use the feature provided by Sinequa libraries. It is mainly about the [tooltip directive](https://sinequa.github.io/sba-angular/components/directives/TooltipDirective.html) and the [pipe message](https://sinequa.github.io/sba-angular/core/pipes/MessagePipe.html).

It is almost the common use case in different Sinequa's projects. What comes new with *Usage Analytics*, is the ability to dynamically map parameters and variables, at both level: application code and administration customization, to the tooltip text. 

The tooltip of widget's info is a good example :

- First, in `sq-dashboard-item.ts` check if the parameter already exists in `messageParams` of `infoAction`. By default, all the customization parameters are taken into account, so nothing to do in this case. If it is an attribute of the application code, then you need to define it :

```ts
messageParams: {
    values: {
                // Params processed within the app code
                sessionCountThreshold: this.auditService.sessionCountParam,
                myParam: myValue,
                start: this.auditService.startDate,
                // Params retrieved from the app customization json / config.ts file
                ...this.auditService.params,
                ...this.auditService.customParams
            }
}
```

- Next step is to define your tooltip text. For example, in `src/locales/messages/en.json`:

```ts
"widgets": {
        "my-custom-widget": {
            "info": "test myParam = {myParam}"
        }
    }
```

- Finally, thanks to the following syntax in the [action button template](https://sinequa.github.io/sba-angular/components/components/BsActionButtons.html):

```html
<a ... sqTooltip="{{item.title | sqMessage:item.messageParams}}"></a>
```
You should be able to display `myValue` in your tooltip text.

**7 - Formatting widget numbers** <a name="widget_numbers"></a>

Often in any analytics dashboards, you may need to display numbers in different format. Within *Usage Analytics*, this has been integrated with a very simple and customizable way :

- In a widget configuration object which implement the `DashboardItemOption` interface, the optional property `numberFormatOptions` defines the format. For further informations about available formats, please refer to [Intl.NumberFormatOptions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat). For example : 

```ts
"my-custom-widget": {
    ...,
    "parameters": {
        ...,
        "numberFormatOptions": {"style": "decimal", "maximumFractionDigits": 2}
    }
}
```

- The provided format is then used by `sq-audit-stat` template as inputs to [pipe number](https://sinequa.github.io/sba-angular/components/pipes/NumberPipe.html):
```html
<span class="stat-value">{{value | sqNumber: (config?.numberFormatOptions || numberFormatOptions)}}</span>
```

**8 - Display multiple time series in a single timeline** <a name="plot_multiple_timeseries"></a>

Displaying multiple time series is a common use case in analytics dashboards and it is handled by the application.

This depends on the data itself. For example, assuming you want to plot 2 time series related to 2 different aggregations: "Toto" and "Foo". Those aggregations could be returned from the same query or from 2 different queries.

- If they are returned from the same query "dummyQuery", you need to define the 2 aggregations in the `aggregationsTimeSeries` parameter of the widget configuration. For example :

```ts
{
    "id": "my-custom-timeline",
    "title": "my-custom-timeline title",
    "icon": "fas fa-chart-line",
    "info": "....",
    "unique": true,
    "parameters": {
        "type": "timeline",
        "queries": ["dummyQuery"],
        "aggregationsTimeSeries": [
            {
                "name": "Toto",
                "dateField": "....",
                "valueFields": [{"name": "...", "title": "....", "primary": true}]
            },
            {
                "name": "Foo",
                "dateField": "....",
                "valueFields": [{"name": "...", "title": "....", "primary": true}]
            }
        ],
        "chartType": "Timeline"
    }
}
```

- In the other case where the 2 aggregations are returned from 2 different queries "dummyQuery1" and "dummyQuery2", you need simply to define the both queries in the `queries` parameter of the widget configuration. For example :

```ts
{
    "id": "my-custom-timeline",
    "title": "my-custom-timeline title",
    "icon": "fas fa-chart-line",
    "info": "....",
    "unique": true,
    "parameters": {
        "type": "timeline",
        "queries": ["dummyQuery1", "dummyQuery2"],
        "aggregationsTimeSeries": [
            {
                "name": "Toto",
                "dateField": "....",
                "valueFields": [{"name": "...", "title": "....", "primary": true}]
            },
            {
                "name": "Foo",
                "dateField": "....",
                "valueFields": [{"name": "...", "title": "....", "primary": true}]
            }
        ],
        "chartType": "Timeline"
    }
}
```

### <a name="export_import"></a> Export / Import

<span style="display:block;text-align:center">![Export Dashboard](/docs/assets/export_import.PNG)</span>

Dashboards are exportable as Excel, CSV, XML or image files. This feature is useful when data should be injected in other systems or visualized in demos.

`ExportService` handles the export workflow from data extraction till file generation and its download :

- `exportToPNG(filename: string, element: ElementRef)`

    This method creates an .png image from a specific HTML element and save it.

- `exportToCsv(filename:string, items: DashboardItemComponent[])`

    This method exports all widgets of a given dashboard to a .csv file.

- `exportToXML(filename:string, items: DashboardItemComponent[])`

    This method exports all widgets of a given dashboard to a Open XML format file.

- `exportXLSX(filename:string, items: DashboardItemComponent[])`

    This method exports all widgets of a given dashboard to a XLSX file.

- `objectToCsv(filename: string, rows: object[]): string[]`

    This method converts a array of object to csv rows.

- `csvToXML(tables: {title:string, tables:string[]}[], filename: string)`

    This method converts csv array in a XML Workbook representation.

- `extractStatRow(item: DashboardItemComponent) : any`

    This method extracts row data from a given stat widget.

- `extractStats(filename: string, items: DashboardItemComponent[]): ExtractModel | undefined`

    This method creates a list of rows for stat widgets.

- `extractCharts(filename: string, items: DashboardItemComponent[]): ExtractModel[]`

    This method extracts data from chart widgets.

- `extractTimelines(filename: string, items: DashboardItemComponent[]): ExtractModel[]`

    This method extracts data from timeline widgets.

- `extractGrids(filename: string, items: DashboardItemComponent[]): ExtractModel[]`

    This method extracts data from grid widgets.

Next to that, *Usage Analytics* offers utilities to manage the configuration of the application via input/output files : 

- `Export layout as JSON`: Exports the layout of all dashboards. This is useful especially for admins if they need to adjust the list of **standardDashboards** with respect to their own version.

- `Export definition as JSON`: Exports the whole configuration of all dashboards. It can be useful to share different dashboards with others.

- `Import definition as JSON`: Overrides the current configuration with the one provided in the imported file.





