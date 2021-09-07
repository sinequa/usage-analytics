# Usage Analytics

*Usage Analytics* is an application built on top of Sinequa libraries, as a collaborative and interactive set of dashboards.

<span style="display:block;text-align:center">![Usage Analytics](/docs/assets/app.png)</span>

For more information about Sinequa libraries, please refer to the [Sinequa documentation](https://doc.sinequa.com) and the [SBA framework documentation](https://sinequa.github.io/sba-angular).

## Dataset Web service
Behind the scenes, *Usage Analytics* uses the **Dataset Web Service** to retrieve the data.
It allows getting information from indexes through multiple SQL queries. Thus, it is the best fit to build dashboard reports, 360 view and so on.

However, using the dataset web service within native Sinequa libraries needs quite simple adjustments :

- Deactivate Search for the route where you want to use Dataset web service.
- Listen to Search events and send request to Dataset web service, using Query object to store parameters.

<span style="display:block;text-align:center">![DataSet Web Service](/docs/assets/dataset.png)</span>

This logic is implemented in the `audit.service.ts` :

- `updateAuditFilters(): void`

    This method programmatically handle the search lifecycle and bring the use of all searchService functionalities (update of breadcrumbs, extract filters from the query object, build the global query's select expression ...) in a dataset web service without the nightmare of rewriting a dedicated service for this purpose.

- `getAuditTimestampFromUrl(): string | Date[] | undefined`

    This method extracts the time range filter from the navigation URL.

- `updateDatasetsList(): string[]`

    This method specifies the list of queries, part of the dataset, that we only want to execute.

- `getAuditData(filters: string, start: string, end: string, mask: string): Observable<{[key: string]: Results | DatasetError;}>`

    This method executes HTTP requests of the dataset web service.

- `updateRangeFilter(timestamp: Date[] | string)`

    This method updates the query object with the provided time range filter.

- `parseAuditTimestamp(timestamp: string | Date[]): AuditDatasetFilters`

    This method converts the time range to request parameters.

## Dashboards

Dashboards of *Usage Analytics* are based on the [**angular-gridster2**](https://tiberiuzuld.github.io/angular-gridster2/) library.

The application comes up with most likely browser's user experience. Each tab is a dashboard that can be customized, by the users, by dragging and resizing widgets, and adding new ones from a list of predefined widget types. A developer can easily add new widget types, or configure the existing ones.

Dashboards can be saved with a name, marked as default and shared with colleagues. Users can also manage their dashboards' settings.

<span style="display:block;text-align:center">![Dashboard actions](/docs/assets/dashboard_actions.png)</span>


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

Notice in the snippet above that the list of dashboard items, as well the options of the dashboard, are managed by a new `DashboardService`. This Angular service, which lives in the Pepper app (`app/audit/dashboard/dashboard.service.ts`), manages the following tasks:

- Generating dashboards.
- Storing the state of the dashboard and its global options.
- Saving, opening, deleting and sharing dashboards. The list of dashboards is persisted in the [User Settings](https://sinequa.github.io/sba-angular/tutorial/user-settings.html).
- Managing URL changes / navigation, when a dashboard is opened, saved, deleted or imported.
- Editing the dashboard (adding or removing items).
- Emitting events when the dashboard changes.

## Architectures

*Usage Analytics* is designed to support 2 types of architecture :

- Client side configuration.
- Server side configuration.

<span style="display:block;text-align:center">![Client side configuration](/docs/assets/client_side_architecture.png)
*Client side configuration*
</span>


<span style="display:block;text-align:center">![Server side configuration](/docs/assets/server_side_architecture.png)
*Server side configuration*
</span>

Notice that the difference is quite simple. It is related to the way we are defining dashboards, widgets, palette ...
This can be done whether in local config file at app level or hosted by the Sinequa server.

`DashboardService` handles those cases while initializing the application :

- `getWidgets(): {[key: string]: DashboardItemOption}`

    This method returns the list of widgets from the configuration defined on the server (appService.app.data.widgets and appService.app.data.customWidgets) or in the config.ts file (WIDGETS).

- `getPalette(): {name: string, items: DashboardItemOption[]}[]`

    This method builds the palette of widgets from the configuration defined on the server (appService.app.data.palette) or in the config.ts file (PALETTE).

- `getStandardDashboards(): {name: string, items: {item: DashboardItemOption, position: DashboardItemPosition}[]}[]`

    This method returns the list of standard dashboard from the configuration defined on the server (appService.app.data.standardDashboards) or in the config.ts file (STANDARD_DASHBOARDS).

## Export
Dashboards are exportable as Excel, CSV or image file. This feature is very important for example in case data should be injected in other systems or visualized in demos.

<span style="display:block;text-align:center">![Export Dashboard](/docs/assets/export_dashboard.png)</span>

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


## Customizing dashboards

*Usage Analytics* is meant to be customized easily, especially to let developers create new types of widgets, either generic or specific to their use cases.

Adding a widget will impact several parts of the code, and several aspects must be taken into account:

- The widget must be displayed (within its parent component `sq-dashboard-item`).
- The widget creation must be triggered somewhere in the application (upon initialization or user action).
- The widget must be synchronized with other widgets and the dataset web service.
- The widget might have properties needing to be persisted.
- The widget size must adapt to the dashboard grid.

### Widget display

The widget's display must be implemented in the `sq-dashboard-item` component (`app/audit/dashboard/dashboard-item.component`). The template of this component is composed of a `sq-facet-card` (see [facets](https://sinequa.github.io/sba-angular/tutorial/facet-module.html)) wrapping a Switch-Case directive to display the desired component (either a chart, stat, timeline, etc.). Therefore, adding a new component means simply adding a new "case" such as:

```html
<my-custom-widget *ngSwitchCase="'my-custom-type'" [results]="results">
</my-custom-widget>
```

Your widget might require other input parameters, that you can create and manage inside `dashboard-item.component.ts` (generally, binding the global `results`, `dataset` or `data` as an input of your component is needed to refresh the widget upon new dataset web service changes). The component might also generate events, which you will want to handle in the controller as well.

### Widget creation / initialization

The creation of the widget can occur in different ways:

  1. By selecting a built-in widget from the palette.
  2. On initialization, when a dashboards are created / loaded.
  3. Adding custom widget in `config.ts` or at Sinequa server level.

In any case, it is necessary to create a `DashboardItemOption`, an object consisting of a widget's `type`, `query`, `text`, `icon` and a `unique` property (that can prevent users from creating two components of this type). 

For example, the configuration object to create a "Search by session timeline" widget is as follow:

```ts
searchBySessionTimeline: {
        type: "timeline",
        query: "avgQueriesBySessionTimeLine",
        text: "msg#widgets.avgQueriesBySessionTimeLine.text",
        icon: "fas fa-chart-line",
        info: "msg#widgets.avgQueriesBySessionTimeLine.info",
        unique: true,
        parameters: {
            aggregationsTimeSeries: {
                name: "AvgQueriesBySession",
                dateField: "value",
                valueFields: [{operatorResults: true, name: "avg", title: "Average Search By Session", primary: true}]
            }
        }
    }
```

To include a new widget via the "Palette", simply add it to the list :

```ts
// Palette is classified by type of widget
export const PALETTE: {name: string, items: string[]}[] = [
  {
      name: "msg#palette.timelines",
      items: [
          ...
          "searchBySessionTimeline",
          ...
      ]
  }
]
```

To include a new widget on initialization of a standard dashboard, add it to the list of its items:

```ts
// The position of the widget inside the dashboard can be set by default, using "position".
// Otherwise, Gridster library will automatically put it in first empty position  
export const  STANDARD_DASHBOARDS: {name: string, items: {item: string, position: DashboardItemPosition}[]}[] = [
    {
        name: "msg#dashboards.userAdoption",
        items: [
            {item: "searchBySessionTimeline", position: {x: 0, y: 0}}
        ]
    }
```

Finally, if you want to add a widget programmatically, just pass your dashboard option to the `addWidget()` method:

```ts
// This adds a new widget with default size to the current dashboard (optional arguments can be passed to set the size and other settings)
this.dashboardService.addWidget(WIDGET);
```

This method returns the `item` object (of type `DashboardItem`) that will be passed to the `sq-dashboard-item` component. You can add or modify properties of this `item`: This is useful if your widget expects specific types of inputs.

### Widget synchronization

The way the built-in widgets are designed is actually to **avoid explicit synchronization**, that is: to do nothing and keep the components independent from each other.

However, it is clear when using *Usage Analytics* that *some form of synchronization happens* when the user interacts with a component. For example, if I use the timeline to update the time range filter.

The way it works is that the widgets **respond only to an update of the global dataset web service response**. Widgets cannot talk to each other, but some user interactions (like selecting a portion on the chart) can trigger a refresh of the global dataset web service response (which itself triggers a refresh of the widgets).

### Widget persistence

The *state* of your widget can be defined in three locations:

- The internal state of the component (for example, switching to widget's grid view). This state is not persisted: If you refresh the page, or if you select another dashboard and come back, this internal state is reset to its defaults.
- The inputs passed to the component from its parent (`sq-dashboard-item`). These inputs often consist of the **`Results` / `dataset` ...** object (or a subset of these results, like a `Record` or an `Aggregation`). This state is not persisted either: If you refresh the page, new global dataset web service response is obtained, transformed and passed to your component.
- The inputs stored in the `DashboardItem` object. These inputs *are* persisted, because (by definition) the state of the dashboard that is persisted is essentially the list of `DashboardItem`. When you refresh the page, the dashboard items are downloaded from the user settings, allowing to display the widgets in the same state as you left them. When you share a dashboard with a colleague, the URL contains the serialized list of items.

In the standard components, the items that are persisted are for example:

- For all widgets: Widget query, size and position in the dashboard.
- For the **timeline** widget: aggregationsTimeSeries.
- For the **chart** widget: chart data and chart type.
- For the **stat** widget: valueLocation, operation, relatedQuery...

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

### Widget sizing

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
