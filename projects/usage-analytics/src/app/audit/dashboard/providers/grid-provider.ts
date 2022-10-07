import { Injectable } from "@angular/core";
import { ColDef, ITooltipParams, ValueGetterParams } from "ag-grid-community";
import { IntlService } from "@sinequa/core/intl";
import { Aggregation, AggregationItem, DatasetError, Results } from "@sinequa/core/web-services";
import { Utils } from "@sinequa/core/base";

export interface GridColDef extends ColDef {
    formatterType?: 'date' | 'number' | 'text' | 'time';
    filterType?: 'date' | 'number' | 'text';
    multiLineCell?: boolean;
    operatorResults?: boolean;
}

export const customComparator = (valueA, valueB) => {
  return valueA.toLowerCase().localeCompare(valueB.toLowerCase());
};

@Injectable()
export class GridProvider {

    constructor(public intlService: IntlService) {}

    public getGridColumnDefs(configs: GridColDef[] | undefined, showTooltip: boolean | undefined): ColDef[] {
        if (!configs) return [];

        const columnDefs = [] as ColDef[];
        for (const config of configs) {
            if (config.field) {

                // Basic columns definition
                const colDef: ColDef = {
                    headerName: config.headerName || config.field,
                    cellRenderer: (params: any): HTMLElement | string => {
                        switch (config.formatterType) {
                            case 'date':
                                return this.intlService.formatDate(new Date(params.value));
                            case 'number':
                                return this.intlService.formatNumber(params.value);
                            case 'text':
                                return this.intlService.formatText(params.value);
                            case 'time':
                                return this.intlService.formatTime(params.value);
                            default:
                                return params.value;
                        }
                    }
                }

                // Define field/valueGetter based on data (records / aggregation)
                if (config.operatorResults) {
                    colDef.valueGetter = (params: ValueGetterParams) => (params.data as AggregationItem).operatorResults?.[config.field!];
                } else {
                    colDef.field = config.field;
                }

                // set appropriate filter according to field data type
                switch (config.filterType) {
                    case 'date':
                        colDef.filter = 'agDateColumnFilter'
                        break;
                    case 'number':
                        colDef.filter = 'agNumberColumnFilter'
                        break;
                    case 'text':
                        colDef.filter = 'agTextColumnFilter'
                        break;
                    default:
                        break;
                }

                // if true, set the tooltip of each cell
                if (showTooltip) {
                    if (config.operatorResults) {
                        colDef.tooltipValueGetter = (params: ITooltipParams) => (params.data as AggregationItem).operatorResults?.[config.field!];
                    } else {
                        colDef.tooltipField = config.field;
                    }
                }

                // if true, display cell value on multiple line
                if (config.multiLineCell) {
                    colDef.flex = 1;
                    colDef.wrapText = true;
                    colDef.autoHeight = true;
                    colDef.cellStyle = {'white-space': 'normal', wordBreak: "normal"};
                }

                if (config.formatterType === 'text' || config.filterType === 'text') {
                  colDef.comparator = customComparator;
                }

                columnDefs.push(colDef);
            }
        }
        return columnDefs;
    }

    public getAggregationRowData(data: Results | DatasetError, aggregationName: string): AggregationItem[] {
        if (data && !(data as DatasetError).errorMessage && (data as Results).aggregations) {
            const aggregation = (data as Results).aggregations.find((aggr: Aggregation) => Utils.eqNC(aggr.name, aggregationName));
            return aggregation?.items || [];
        }
        return [];
    }
}
