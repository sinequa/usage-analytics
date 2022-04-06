import {ElementRef, Injectable} from '@angular/core';
import {IntlService} from '@sinequa/core/intl';
import {NotificationsService} from '@sinequa/core/notification';
import domtoimage from "dom-to-image";
import { saveAs } from "file-saver";

import {DashboardItemComponent} from './dashboard/dashboard-item.component';
import {StatProvider} from './dashboard/providers/stat.provider';

import {xlsx} from "./xlsx";

type XLRowType = {
  attributeStyleID: string,
  nameType: string,
  data: string,
  attributeFormula: string
}

type XLSheetType = {
  rows: string,
  nameWS: string
}

type XLWorkbookType = {
  created: number,
  worksheets: string
}

type ExtractModel = {
  title:string,
  filename: string,
  tables:string[]
}

@Injectable({
  providedIn: 'root',
})
export class ExportService {

  /**
   * returns a stringy date to append to the extract's filename
   */
  get date(): string {
    return this.translate.formatDate(Date.now());
  }

  constructor(
    private statProvider: StatProvider,
    private translate: IntlService,
    private notificationService: NotificationsService
    ) { }

  /**
   * Create an .png image from a specific HTML element and save it
   *
   * @param filename name of the file
   * @param element HTML ElementRef used to create the image. All elements included in
   * are converted into the image.
   */
  exportToPNG(filename: string, element: ElementRef) {
        // to export all the widget, including those outside the viewport,
        // we need to know the real gridster's height.
        // we use a <div> tag inside <gridster> component to export it's content.
        // we can't use <gridster> component because it's not a real HTML Element.

        // this is the gridster's height
        const height = element.nativeElement.offsetParent.scrollHeight;

        // now, as we know the height, set it to our #content div.
        element.nativeElement.style.height = `${height}px`;

        // lib used to create image from specific HTML element
        domtoimage.toBlob(element.nativeElement).then(blob => {
            saveAs(blob,  `${filename}_${this.date}.png`);
            // do not forget to remove our previous height to allow gridster to adjust automatically his height
            element.nativeElement.style = undefined;

            // notify user
            this.notifySuccess(filename)
          } );
  }

  /**
   * Export all widgets of a specific dashboard to a .csv file
   *
   * @param filename name of the file
   * @param items Array of Dashboard Item
   */
  exportToCsv(filename:string, items: DashboardItemComponent[]) {
      // export stats in one file
      const stats = this.extractStats(filename, items);
      if (stats) {
        this.saveToCsv(stats.filename, stats.tables.join('\n'));
      }

      // export each timelines in a specific file
      const timelines = this.extractTimelines(filename, items);
      timelines.forEach(timeline => this.saveToCsv(timeline.filename, timeline.tables.join('\n')));

      // export each charts in a specific file
      const charts = this.extractCharts(filename, items);
      charts.forEach(chart => this.saveToCsv(chart.filename, chart.tables.join('\n')));
    }

  /**
   * Export all widgets of a specific dashboard to a Open XML format file
   *
   * @param filename name of the file
   * @param items Array of Dashboard Items
   */
  exportToXML(filename:string, items: DashboardItemComponent[]) {
    const tables:ExtractModel[] = [];

    // export stats
    tables.push(this.extractStats(filename, items) || {} as ExtractModel);

    // export each timelines
    tables.push(...this.extractTimelines(filename, items));

    // export each charts
    tables.push(...this.extractCharts(filename, items));

    // as csv files joined in a single array, split them in their own sheet
    this.csvToXML(tables, filename);
  }

  /**
   * Export all widgets of a specific dashboard to a XLSX file
   * @param filename name of the file to save
   * @param items Array of Dashboard Items
   */
  exportXLSX(filename:string, items: DashboardItemComponent[]) {
    const tables:ExtractModel[] = [];

    // export stats
    const stats = this.extractStats(filename, items);
    if(stats) tables.push(stats);

    // export each timelines
    tables.push(...this.extractTimelines(filename, items).filter(timeline => timeline.tables.length > 0));

    // export each charts
    tables.push(...this.extractCharts(filename, items).filter(chart => chart.tables.length > 0));

    // Excel sheet's name limited to 31 characters
    const worksheets = tables.map(worksheet => ({
      data: [...worksheet.tables.map(it => it.split(","))],
      name: worksheet.title.slice(0,30)
    }));

    const file = `${filename}_${this.date}.xlsx`;

    // this object transforms all that stuff in a real Excel Workbook
    // and download it for the user
    xlsx({
      creator: 'Sinequa',
      lastModifiedBy: '',
      worksheets: worksheets
    }).then((content) => {
      saveAs(content, file);
      this.notifySuccess(file);
    });

  }

  /**
   * Convert a array of object to csv rows
   *
   * @param filename csv filename
   * @param rows array of object to convert into csv
   * @returns a csv string
   */
  objectToCsv(filename: string, rows: object[]): string[] {
    const title = this.translate.formatMessage("msg#export.title");

    if (!rows || !rows.length) {
      const msg = this.translate.formatMessage("msg#export.nothing", {filename});
      this.notificationService.warning(msg, undefined, title);
      return [];
    }
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvData =
      keys.join(separator) +
      '\n' +
      rows.map(row => keys.map(k => {
          let cell = row[k] === null || row[k] === undefined ? '' : row[k];
          cell = cell instanceof Date
            ? cell.toLocaleString()
            : cell.toString().replace(/"/g, '""');
          if (cell.search(/("|,|\n)/g) >= 0) {
            cell = `"${cell}"`;
          }
          return cell;
        }).join(separator)).join('\n');

    // split results to obtain a array of rows
    return csvData.split('\n');
  }

  private saveToCsv(filename: string, csvData: string) {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) { // IE 10+
      navigator.msSaveBlob(blob, filename);
    } else {
      const link = document.createElement('a');
      if (link.download !== undefined) {
        // Browsers that support HTML5 download attribute
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }

    this.notifySuccess(filename);
  }

  private extractStatRow(item: DashboardItemComponent) : any {
    // translate title with sqMessagePipe
    const title = this.translate.formatMessage(item.config.title);
    const {previousDataSet, dataset, config} = item;

    if(previousDataSet !== null && dataset !== null){
      // TODO: decimalsPrecision should be a parameter value
      const {value, percentageChange, trend, trendEvaluation } = this.statProvider.getvalues(previousDataSet, dataset, config, 1);
      return ({title, value, percentageChange, trend, trendEvaluation});
    }

    return ({title})
  }

  /**
   * Create a list of rows for each stat widgets
   *
   * @param filename name of the file
   * @param items array of dashboard items
   * @returns a {@link ExtractModel} object with all stats data or undefined
   */
  private extractStats(filename: string, items: DashboardItemComponent[]): ExtractModel | undefined {
    const stats = items.filter(item => item.config.type === "stat");
    if(stats.length === 0) return;

    const results = stats.reduce((acc, item) => {
      acc.push(this.extractStatRow(item));
      return acc;
    }, <any>[])

    const file = `${filename}_${this.date}.csv`;
    return {title: "stats", filename: file, tables: this.objectToCsv(file, results)};
  }

  /**
   * Extract each charts data.
   *
   * @param filename name of the file
   * @param items array of dashboard items
   * @returns Array of charts data
   */
  private extractCharts(filename: string, items: DashboardItemComponent[]): ExtractModel[] {
    const charts = items.filter(item => item.config.type === "chart").map(item => {
      const title = this.translate.formatMessage(item.config.title);

      return {title, data: item.chartResults.aggregations[0].items?.map(elem => ({value: elem.value, count: elem.count}))}
    });
    if(charts.length === 0) return [];

    // [{value, count }]
    const values:ExtractModel[] = [];
    charts.forEach(chart => {
      const results = chart.data?.map(item => item);
      const file = `${filename}_${chart.title}_${this.date}.csv`;
      const r:string[] = this.objectToCsv(file, results!);
      if(r) values.push({title: chart.title, filename: file, tables: r});
    });
    return values;

  }

  /**
   * Extract for each timeline all series used. Each serie's values are in it's specific column.
   * The result is save in a .csv file.
   *
   * @param filename name of the file
   * @param items array of dashboard items
   */
  private extractTimelines(filename: string, items: DashboardItemComponent[]): ExtractModel[] {
    // timelines components extractions
    // a timeserie could contains one or more series
    // no needs of timeline-provider here as timeseries is the final results after timeline-provider works
    const timeseries = items.filter(item => item.config.type === "timeline").map(item => {
      const title = this.translate.formatMessage(item.config.title);
      return {title, timeSeries: item.timeSeries}
    });
    if(timeseries.length === 0) return [];

    // convert series to { title, items: [series, series,...]}
    const series = timeseries.map(el => ({title: el.title, items: el.timeSeries.map(serie => serie.dates.map(item => {
        const row = {title: el.title, date: item.date.toLocaleDateString("en-US", {year: '2-digit', month: '2-digit', day: '2-digit'})};
        row[serie.name] = item.value;
        return row;
      }))
    }));

    // export each series individually
    const values:ExtractModel[] = [];
    series.forEach(serie => {
      const resultsMap = serie.items.reduce((acc, sr) => {

        sr.forEach(value => {
          // get previous value to be appended
          const p = acc.get(value.date.toString());
          acc.set(value.date.toString(), {...p, ...value});
        })


        return acc;
      }, new Map());

      // [ [K, V], [K1, V1] ... ]
      // we only need each V
      const results = Array.from(resultsMap.entries()).map(it => it[1]);
      const file = `${filename}_${serie.title}_${this.date}.csv`;
      values.push({title: serie.title, filename: file, tables: this.objectToCsv(file, results)});
    });
    return values;
  }

  /**
   * Convert csv array in a XML Workbook representation
   *
   * @param tables contains data per worksheet
   * @param filename
   */
  private csvToXML(tables: {title:string, tables:string[]}[], filename: string) {
    const uri = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,';
    const tmplWorkbookXML = '<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:excel"  xmlns:html="https://www.w3.org/TR/html401/">'
      + '<DocumentProperties xmlns="urn:schemas-microsoft-com:office:office"><Author>Sinequa R&amp;D</Author><Created>{created}</Created></DocumentProperties>'
      + '<Styles>'
      + '<Style ss:ID="Currency"><NumberFormat ss:Format="Currency"></NumberFormat></Style>'
      + '<Style ss:ID="Date"><NumberFormat ss:Format="Medium Date"></NumberFormat></Style>'
      + '</Styles>'
      + '{worksheets}</Workbook>'
    const tmplWorksheetXML = '<Worksheet ss:Name="{nameWS}"><Table>{rows}</Table></Worksheet>'
    const tmplCellXML = '<Cell{attributeStyleID}{attributeFormula}><Data ss:Type="{nameType}">{data}</Data></Cell>'
    const base64 = function(s) { return window.btoa(unescape(encodeURIComponent(s))) }
    const format = function(s, c) { return s.replace(/{(\w+)}/g, function(m, p) { return c[p]; }) }

    let workbookXML = "";
    let worksheetsXML = "";
    let rowsXML = "";

    for(const [index, values] of tables.entries()) {
      if(values.tables){
        for(const row of values.tables) {
          rowsXML += '<Row>';
          for(const cell of row.split(',')) {
              const ctx_: XLRowType = {
                attributeStyleID: '',
                nameType: 'String',
                data: cell,
                attributeFormula: ''
              };
              rowsXML += format(tmplCellXML, ctx_);
          }
          rowsXML += '</Row>'
        }

        // replace not supported characters on sheets name : \ / * ? : [ ] by an underscore
        const sheetName = values.title.replace(/[\\\/*?:\[\]]/g, '_');
        const _ctx: XLSheetType = {rows: rowsXML, nameWS: sheetName || `Sheet ${index}`};
        worksheetsXML += format(tmplWorksheetXML, _ctx);
        rowsXML = "";
      }
    }

    const ctx: XLWorkbookType = {created: (new Date()).getTime(), worksheets: worksheetsXML};
    workbookXML = format(tmplWorkbookXML, ctx);

    // saveAs()
    const link = document.createElement("a");
    link.href = uri + base64(workbookXML);
    link.download = `${filename}_${this.date}.xls` || 'Workbook.xls';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.notifySuccess(filename);
  }

  /**
   * Notify user about the download success
   *
   * @param filename name of the file downloaded with success
   */
  private notifySuccess(filename:string) {
    const title = this.translate.formatMessage("msg#export.title");
    const msg = this.translate.formatMessage("msg#export.success", {filename});
    this.notificationService.success(msg,undefined, title);
  }
}
