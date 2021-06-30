import {ElementRef, Injectable} from '@angular/core';
import {IntlService} from '@sinequa/core/intl';
import {NotificationsService} from '@sinequa/core/notification';
import domtoimage from "dom-to-image";
import { saveAs } from "file-saver";

import {DashboardItemComponent} from './dashboard/dashboard-item.component';
import {StatProvider} from './dashboard/providers/stat.provider';

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
            const title = this.translate.formatMessage("msg#export.title");
            const msg = this.translate.formatMessage("msg#export.success", {filename});
            this.notificationService.success(msg,undefined, title);        
          } );
  }
  
  /**
   * Export all widgets of a specific dashboard to a .csv file
   * 
   * @param filename name of the file
   * @param items Array of Dashboard Item
   */
  export(filename:string, items: DashboardItemComponent[]) {
    // export stats in one file
    this.extractStats(filename, items);
    
    // export each timelines in a specific file
    this.extractTimelines(filename, items);
    
    // export each charts in a specific file
    this.extractCharts(filename, items);
  }
  
  exportToCsv(filename: string, rows: object[]) {
    const title = this.translate.formatMessage("msg#export.title");

    if (!rows || !rows.length) {
      const msg = this.translate.formatMessage("msg#export.nothing", {filename});
      this.notificationService.warning(msg, undefined, title);
      return;
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
    
    const msg = this.translate.formatMessage("msg#export.success", {filename});
    this.notificationService.success(msg,undefined, title);
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
   * Create a list of rows for each stat widgets and save the results in a .csv file
   * 
   * @param filename name of the file
   * @param items array of dashboard items
   */
  private extractStats(filename: string, items: DashboardItemComponent[]) {
    const stats = items.filter(item => item.config.type === "stat");
    if(stats.length === 0) return;
    
    const results = stats.reduce((acc, item) => {
      acc.push(this.extractStatRow(item));
      return acc;
    }, <any>[])
    this.exportToCsv(`${filename}_${this.date}.csv`, results);
  }
  
  /**
   * save each charts data in is own .csv file.
   * 
   * @param filename name of the file
   * @param items array of dashboard items
   */
  private extractCharts(filename: string, items: DashboardItemComponent[]) {
    const charts = items.filter(item => item.config.type === "chart").map(item => {
      const title = this.translate.formatMessage(item.config.title);
      
      return {title, data: item.chartResults.aggregations[0].items?.map(item => ({value: `'${item.value}`, count: item.count}))}
    });
    if(charts.length === 0) return;
    
    // [{value, count }]
    charts.forEach(chart => {
      const results = chart.data?.map(item => item);
      this.exportToCsv(`${filename}_${chart.title}_${this.date}.csv`, results!);
    })

  }
  
  /**
   * Extract for each timeline all series used. Each serie's values are in it's specific column.
   * The result is save in a .csv file.
   * 
   * @param filename name of the file
   * @param items array of dashboard items
   */
  private extractTimelines(filename: string, items: DashboardItemComponent[]) {
    // timelines components extractions
    // a timeserie could contains one or more series
    // no needs of timeline-provider here as timeseries is the final results after timeline-provider works
    const timeseries = items.filter(item => item.config.type === "timeline").map(item => {
      const title = this.translate.formatMessage(item.config.title);
      return {title, timeSeries: item.timeSeries}
    });
    if(timeseries.length === 0) return;

    // convert series to { title, items: [series, series,...]}
    const series = timeseries.map(series => ({title: series.title, items: series.timeSeries.map(serie => serie.dates.map(item => {
        const row = {title: series.title, date: item.date.toLocaleDateString("en-US", {year: '2-digit', month: '2-digit', day: '2-digit'})};
        row[serie.name] = item.value;
        return row;
      }))
    }));
    
    // export each series individually
    series.forEach(series => {
      const resultsMap = series.items.reduce((acc, serie) => {

        serie.forEach(value => {
          // get previous value to be appended
          const p = acc.get(value.date.toString());
          acc.set(value.date.toString(), {...p, ...value});
        })
        
        
        return acc;
      }, new Map());
      
      // [ [K, V], [K1, V1] ... ]
      // we only need each V
      const results = Array.from(resultsMap.entries()).map(it => it[1]);
      this.exportToCsv(`${filename}_${series.title}_${this.date}.csv`, results);
    })
  }
}