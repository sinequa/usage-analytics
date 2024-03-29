import { Injectable } from "@angular/core";
import { Utils } from "@sinequa/core/base";
import { IntlService } from "@sinequa/core/intl";
import { Aggregation, AggregationItem, DatasetError, Record, Results } from "@sinequa/core/web-services";
import { ColDef, ITooltipParams, ValueGetterParams } from "ag-grid-community";
import { customComparator } from "./grid-provider";

export interface ChartData {
    aggregation: string;
    valueField?: string;
    weightField?: ChartWeightField;
    displayedValueName?: string;
    displayedWeightName?: string;
}

export interface ChartWeightField {
    name: string;
    operatorResults?: boolean;
}

@Injectable()
export class ChartProvider {

    constructor(public intlService: IntlService) {}

    public getChartData(data: Results | DatasetError, config: ChartData): Results {
        if (data && !(data as DatasetError).errorMessage && (data as Results).aggregations) {
            const aggregation = (data as Results).aggregations.find((aggr: Aggregation) => Utils.eqNC(aggr.name, config.aggregation));
            if (aggregation) {
                aggregation.items!.forEach((element: AggregationItem) => {
                    element.value = element.display = element[config.valueField || 'value'];
                    element.count = config.weightField ? (config.weightField.operatorResults ? element.operatorResults?.[config.weightField.name] : element[config.weightField.name]) : element['count'];
                });
            }
            return data as Results;
        }
        return {
            records: [] as Record[],
            aggregations: [{name: config.aggregation, column: "", items: [] as AggregationItem[]}] as Aggregation[]
        } as  Results;

    }

    public getGridColumnDefs(config: ChartData, showTooltip: boolean | undefined, enableSelection: boolean | undefined): ColDef[] {
        const columnDefs = [{
            headerName: config.displayedValueName || 'Label',
            field: config.valueField || 'value',
            filter: 'agTextColumnFilter',
            comparator: customComparator
        }] as ColDef[];

        const colDef: ColDef = {
            headerName: config.displayedWeightName || 'Count',
            filter: "agNumberColumnFilter",
            cellRenderer: (params: any): HTMLElement | string => this.intlService.formatNumber(params.value)
        }
        if (config.weightField) {
            colDef.valueGetter = (params: ValueGetterParams) => config.weightField?.operatorResults ? (params.data as AggregationItem).operatorResults?.[config.weightField!.name] : (params.data as AggregationItem)[config.weightField!.name];
        } else {
            colDef.field = 'count';
        }

        // if true, set the tooltip of of each cell
        if (showTooltip) {
            columnDefs[0].tooltipField = columnDefs[0].field;
            if (config.weightField) {
                colDef.tooltipValueGetter = (params: ITooltipParams) => config.weightField?.operatorResults ? (params.data as AggregationItem).operatorResults?.[config.weightField!.name] : (params.data as AggregationItem)[config.weightField!.name];
            } else {
                colDef.tooltipField = 'count';
            }
        }

        columnDefs.push(colDef);
        if (enableSelection) {
            columnDefs[0].checkboxSelection = true;
        }
        return columnDefs;
    }

}
