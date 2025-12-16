import { Injectable } from "@angular/core";
import { Category } from "@sinequa/analytics/fusioncharts";
import { Dataset, DatasetError, isDatasetError, Results } from "@sinequa/core/web-services";
import { MayBe, StatProvider, StatValueField, StatValueLocation } from "./stat.provider";
import { Parser } from "expr-eval-fork";

export interface MultiLevelPieQuery {
    query: string;
    valueLocation: StatValueLocation;
    valueField?: StatValueField;
}

export interface MultiLevelPieConfig {
    label: string;
    valueExpr: string;
    category?: MultiLevelPieConfig[]
}

@Injectable( { providedIn: 'root'})
export class MultiLevelPieProvider {

    constructor(private statProvider: StatProvider) {}

    extractQueryValue(data: MayBe<Results | DatasetError>, queryConfig: MultiLevelPieQuery): number {
        if(!data) {
            throw new Error(`Missing data for resolving '${queryConfig.query}'`);
        }
        if(isDatasetError(data)) {
            throw new Error(data.errorMessage);
        }
        return this.statProvider.extractStatValue(data, queryConfig.valueLocation, queryConfig.valueField) || 0;
    }

    resolveData(dataset: Dataset, categoriesConfig: MayBe<MultiLevelPieConfig[]>, queries: MayBe<MultiLevelPieQuery[]>): Category[] {
        if (!categoriesConfig) {
            return [];
        }
        return categoriesConfig.map((item) => {
            const {value, error} = this.resolveValue(dataset, queries, item.valueExpr);
            return {
                ...item,
                originalLabel: item.label,
                label: item.label + (error? ` (${error})` : ''),
                value: value,
                count: value,
                category: value > 0? this.resolveData(dataset, item.category, queries) : []
            };
        }) as Category[];
    }

    /**
     *
     * @param dataset
     * @param queries
     * @param expr For example "query1 - query2 + queryX * (query5 / query6)"
     */
    resolveValue(dataset: Dataset, queries: MayBe<MultiLevelPieQuery[]>, expr: string): {value: number, error?: string} {
        try {
            const parser = new Parser();
            // Extract all query operands
            const queryOperands = parser.parse(expr).variables();
            const operands: { [key: string]: number } = {};// Define an object of all query operands with their resolved numerical values
            for(let query of queryOperands) {
                const config = queries?.find((q) => q.query === query);
                if(!config) {
                    throw new Error(`Missing query for operand '${query}'`);
                }
                operands[query] = this.extractQueryValue(dataset[query], config);
            }
            return {value: parser.evaluate(expr, operands)};
        }
        catch(e) {
            return {value: 0, error: e.message};
        }
    }

}
