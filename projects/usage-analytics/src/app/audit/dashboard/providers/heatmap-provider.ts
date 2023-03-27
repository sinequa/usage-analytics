import { Injectable } from "@angular/core";
import { Utils } from "@sinequa/core/base";
import { HeatmapItem } from "@sinequa/analytics/heatmap";
import { IntlService } from "@sinequa/core/intl";
import { Aggregation, AggregationItem, DatasetError, Results } from "@sinequa/core/web-services";
import { ColDef } from "ag-grid-community";
import { customComparator } from "./grid-provider";

export interface HeatmapData {
    aggregation: string;
    displayedFirstColumnName?: string;
    displayedSecondColumnName?: string;
}

@Injectable()
export class HeatmapProvider {

    constructor(public intlService: IntlService) {}

    public getHeatMapData(data: Results | DatasetError, config: HeatmapData): HeatmapItem[] {
        if (data && !(data as DatasetError).errorMessage && (data as Results).aggregations) {
            const aggregation = (data as Results).aggregations.find((aggr: Aggregation) => Utils.eqNC(aggr.name, config.aggregation));
            if (aggregation) {
                return aggregation.items!.map((item: AggregationItem) => this._parseCrossDistributionItem(aggregation.column, item));
            }
        }
        return [];
    }

    public getGridColumnDefs(config: HeatmapData, fieldX: string | undefined, fieldY: string | undefined): ColDef[] {
        const columnDefs = [
            {
                headerName: config.displayedFirstColumnName || fieldX || 'Column 1',
                field: 'x',
                filter: 'agTextColumnFilter',
                comparator: customComparator
            },
            {
                headerName: config.displayedSecondColumnName || fieldY || 'Column 2',
                field: 'y',
                filter: 'agTextColumnFilter',
                comparator: customComparator
            },
            {
                headerName: 'Count',
                field: 'count',
                filter: "agNumberColumnFilter",
                cellRenderer: (params: any): HTMLElement | string => this.intlService.formatNumber(params.value)
            }
        ] as ColDef[];
        return columnDefs;
    }

    private _parseCrossDistributionItem(column: string, item: AggregationItem): HeatmapItem {
        const fields = column.split('/')
        const parts = item.value!.toString().split("/");
        if(parts.length < 2){
            throw new Error(`Can not parse '${item.value}'`);
        }
        return {
            x: parts[0],
            y: parts[1],
            count: item.count,
            display: item.value!.toString(),
            value: item.value as string,
            fieldX: fields[0],
            fieldY: fields[1]
        } as HeatmapItem;
    }
}
