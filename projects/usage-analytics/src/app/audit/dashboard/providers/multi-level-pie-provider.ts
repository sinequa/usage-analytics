import { Injectable } from "@angular/core";
import { Category } from "@sinequa/analytics/fusioncharts";
import { Dataset, DatasetError, Results } from "@sinequa/core/web-services";
import { DashboardItem } from "../dashboard.service";
import { MayBe, StatProvider, StatValueField, StatValueLocation } from "./stat.provider";

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
        return this.statProvider.extractStatValue(data, queryConfig.valueLocation, queryConfig.valueField) || 0;
    }

    resolveData(dataset: Dataset, config: DashboardItem, categoriesConfig: MayBe<MultiLevelPieConfig[]>, queries: MayBe<MultiLevelPieQuery[]>): Category[] {
        if (!categoriesConfig) {
            return [];
        }
        return categoriesConfig.map((item) => {
            const value = this.resolveValue(dataset, config, queries, item.valueExpr);
            return {
                ...item,
                originalLabel: item.label,
                value: value,
                count: value,
                category: this.resolveData(dataset, config,  item.category, queries)
            };
        }) as Category[];
    }

    /**
     *
     * @param dataset
     * @param queries
     * @param expr For example "query1 - query2 + queryX * (query5 / query6)"
     */
    resolveValue(dataset: Dataset, config: DashboardItem, queries: MayBe<MultiLevelPieQuery[]>, expr: string): number {
        if (queries) {
            // Define the regex pattern to match word operands
            const pattern = /\b\w+\b/g;
            // Extract all query operands using the match method
            const queryOperands = expr.match(pattern);
            if (queryOperands) {
                if (queryOperands.every((query) => queries!.find((q) => q.query === query))) {
                    // Replace the query operands with their resolved numerical values
                    const resolvedExpr = expr.replace(/\b\w+\b/g, (match) => this.extractQueryValue(dataset[match], queries!.find((q) => q.query === match)!).toString());
                    return eval(resolvedExpr);
                } else {
                    console.error("Query operand(s) have been used but not defined in 'multiLevelPieQueries' parameter of the widget = " + config.id)
                    return 0;
                }
            } else {
                console.error("No query operands found to resolve values in the widget = " + config.id)
                return 0;
            }
        }
        console.error("Missing attribute 'multiLevelPieQueries' in the widget = " + config.id)
        return 0;
    }

}
