import { Injectable } from "@angular/core";
import { Utils } from "@sinequa/core/base";
import { Aggregation, DatasetError, Record, Results } from "@sinequa/core/web-services";
import { ColDef } from "ag-grid-community";

export interface ChartData {
    aggregation: string;
    valueField?: string;
    weightField?: string;
    displayedValueName?: string;
    displayedWeightName?: string;
}

@Injectable()
export class ChartProvider {

    constructor() {}

    public getChartData(data: Results | DatasetError, config: ChartData): Results {
        if (data && !(data as DatasetError).errorMessage && (data as Results).aggregations) {
            const aggregation = (data as Results).aggregations.find((aggr: Aggregation) => Utils.eqNC(aggr.name, config.aggregation));
            if (aggregation) {
                aggregation.items!.forEach((element: any) => {
                    element.value = element.display = element[config.valueField || 'value'];
                    element.count = element[config.weightField || 'count'];
                });
            }
            return data as Results;
        }
        return {
            records: [] as Record[],
            aggregations: [{name: config.aggregation, column: "", items: []}] as Aggregation[]
        } as  Results;

    }

    public getGridColumnDefs(config: ChartData): ColDef[] {
        return [
            {
                headerName: config.displayedValueName || 'Label',
                field: config.valueField || 'value',
            },
            {
                headerName: config.displayedWeightName || 'Count',
                field: config.weightField || 'count',
                filter: 'agNumberColumnFilter'
            }
        ];
    }

}