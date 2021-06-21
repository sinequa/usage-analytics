import { Injectable } from "@angular/core";
import { SearchService } from "@sinequa/components/search";
import { AppService, Expr, ExprBuilder } from "@sinequa/core/app-utils";
import { Utils } from "@sinequa/core/base";
import {
    DatasetError,
    DatasetWebService,
    Results,
} from "@sinequa/core/web-services";
import { forkJoin, Observable, of, ReplaySubject, Subject } from "rxjs";

export enum RelativeTimeRanges {
    Last30Mins = "Last 30 minutes",
    Last1H = "Last 1 hour",
    Last3H = "Last 3 hours",
    Last6H = "Last 6 hours",
    Last12H = "Last 12 hours",
    Last24H = "Last 24 hours",
    Last7Days = "Last 7 days",
    Last30Days = "Last 30 days",
    Last90Days = "Last 90 days",
    Last6M = "Last 6 months",
    Last1Y = "Last 1 year",
    Last2Y = "Last 2 years",
    Last5Y = "Last 5 years",
}

export interface AuditDatasetFilters {
    currentRange: string;
    previousRange: string;
    previous: string;
    start: string;
    end: string;
}

@Injectable({
    providedIn: "root",
})
export class AuditService {
    //private readonly webServiceName = "insight_audit";

    public auditRange$ = new Subject<string | Date[]>();
    public data$ = new ReplaySubject<{ [key: string]: Results | DatasetError }>(1);
    public previousPeriodData$ = new ReplaySubject<{ [key: string]: Results | DatasetError }>(1);

    constructor(
        public datasetWebService: DatasetWebService,
        public searchService: SearchService,
        public exprBuilder: ExprBuilder,
        public appService: AppService
    ) {
        this.auditRange$.subscribe((range) => {
            this.updateRangeFilter(range);
        });
    }

    get webServiceName(): string | undefined{
        if(this.appService.app && this.appService.app.webServices){
            for (const webService of Object.keys(this.appService.app.webServices)) {
                if (this.appService.getWebService(webService)?.webServiceType === 'DataSet') {
                    return webService;
                }
            }
        }
        return undefined;
    }

    public updateAuditFilters() {
        /** Programmatically handle the dummy search query with respect to audit requirements
         * This will bring the use of all searchService functionalities in a dataset web service context,
         * without the nightmare of rewriting a dedicated service for this purpose
        */
        if (!this.searchService.query.findSelect("audit_timestamp")) {
            this.updateRangeFilter(RelativeTimeRanges.Last30Days);
        }

        /**
         * Trigger the update of breadcrumbs to allow widgets have the same behavior as for query web services
         */
        this.searchService.updateBreadcrumbs({} as Results, {})

        /** Extract audit filters from the query in the URL and build the whole audit WHERE clause*/
        const exprs = this.searchService.query
            .select!.filter((item) => item.facet !== "audit_timestamp")
            .map((item) => item.expression);
        const timestamp = this.getAuditTimestampFromUrl();
        const parsedTimestamp = this.parseAuditTimestamp(timestamp!);

        const currentFilters = this.exprBuilder.concatAndExpr([...exprs, parsedTimestamp.currentRange]);
        const previousFilters = this.exprBuilder.concatAndExpr([...exprs, parsedTimestamp.previousRange]);

        /** Update the audit dashboard data (previous and current period) */
        const dataSources = [
            this.getAuditData(currentFilters, parsedTimestamp.start, parsedTimestamp.end),
            this.getAuditData(previousFilters, parsedTimestamp.previous, parsedTimestamp.start)
        ] as Observable<{[key: string]: Results | DatasetError;}>[];


        forkJoin(...dataSources).subscribe(
            (data) => {
                console.log(data);
                this.data$.next(data[0]);
                this.previousPeriodData$.next(data[1]);
            }
        )
    }

    public getAuditTimestampFromUrl(): string | Date[] | undefined {
        const expression = this.searchService.query.findSelect(
            "audit_timestamp"
        )?.expression;
        if (expression) {
            const expr = this.appService.parseExpr(expression);
            if (expr instanceof Expr) {
                return this.getTimestampValueFromExpr(expr);
            }
        }
        return undefined;
    }

    private getAuditData(filters: string, start: string, end: string): Observable<{[key: string]: Results | DatasetError;}> {
        const params = {
            select: filters,
            start: start,
            end: end
        };
        if (this.webServiceName) {
            return this.datasetWebService.getAll(this.webServiceName, params);
        } else {
            console.error("No DataSet found")
            return of({})
        }
    }

    private updateRangeFilter(timestamp: Date[] | string, search = true) {
        let expr: string;
        if (Utils.isString(timestamp)) {
            expr = this.exprBuilder.makeExpr("timestamp", timestamp);
        } else {
            expr = this.exprBuilder.makeListExpr(
                "timestamp",
                timestamp.map((e) => Utils.toSysDateStr(e))
            );
        }
        this.searchService.query.removeSelect("audit_timestamp");
        this.searchService.query.addSelect(expr, "audit_timestamp");
        if (search) {
            this.searchService.search();
        }
    }

    private getTimestampValueFromExpr(expr: Expr): string | Date[] {
        if (Utils.isString(expr.value) && expr.value.indexOf("[") > -1) {
            return JSON.parse(expr.value.replace(/`/g, '"'));
        } else {
            return expr.value!;
        }
    }

    private parseAuditTimestamp(timestamp: string | Date[]): AuditDatasetFilters {
        const now = new Date();
        let previous: Date;
        let start: Date;
        let end: Date;
        if (!Utils.isString(timestamp)) {
            start = new Date(timestamp[0]);
            end = new Date(timestamp[1]);
            // One day in milliseconds
            const oneDay = 1000 * 60 * 60 * 24;
            // Calculating the time difference between the two dates
            const diffInTime = end.getTime() - start.getTime();
            // Calculating the number of days between the two dates
            const diffInDays = Math.round(diffInTime / oneDay);

            const temp = new Date(timestamp[0]); // Need to use different copy of start to not override it
            previous = new Date(temp.setDate(temp.getDate() - diffInDays));
        } else {
            end = new Date();
            switch (timestamp) {
                case RelativeTimeRanges.Last30Mins:
                    start = new Date(now.setMinutes(now.getMinutes() - 30));
                    previous = new Date(now.setMinutes(now.getMinutes() - 30));
                    break;
                case RelativeTimeRanges.Last1H:
                    start = new Date(now.setHours(now.getHours() - 1));
                    previous = new Date(now.setHours(now.getHours() - 1));
                    break;
                case RelativeTimeRanges.Last3H:
                    start = new Date(now.setHours(now.getHours() - 3));
                    previous = new Date(now.setHours(now.getHours() - 3));
                    break;
                case RelativeTimeRanges.Last6H:
                    start = new Date(now.setHours(now.getHours() - 6));
                    previous = new Date(now.setHours(now.getHours() - 6));
                    break;
                case RelativeTimeRanges.Last12H:
                    start = new Date(now.setHours(now.getHours() - 12));
                    previous = new Date(now.setHours(now.getHours() - 12));
                    break;
                case RelativeTimeRanges.Last24H:
                    start = new Date(now.setHours(now.getHours() - 24));
                    previous = new Date(now.setHours(now.getHours() - 24));
                    break;
                case RelativeTimeRanges.Last7Days:
                    start = new Date(now.setDate(now.getDate() - 7));
                    previous = new Date(now.setDate(now.getDate() - 7));
                    break;
                case RelativeTimeRanges.Last30Days:
                    start = new Date(now.setDate(now.getDate() - 30));
                    previous = new Date(now.setDate(now.getDate() - 30));
                    break;
                case RelativeTimeRanges.Last90Days:
                    start = new Date(now.setDate(now.getDate() - 90));
                    previous = new Date(now.setDate(now.getDate() - 90));
                    break;
                case RelativeTimeRanges.Last6M:
                    start = new Date(now.setMonth(now.getMonth() - 6));
                    previous = new Date(now.setMonth(now.getMonth() - 6));
                    break;
                case RelativeTimeRanges.Last1Y:
                    start = new Date(now.setFullYear(now.getFullYear() - 1));
                    previous = new Date(now.setFullYear(now.getFullYear() - 1));
                    break;
                case RelativeTimeRanges.Last2Y:
                    start = new Date(now.setFullYear(now.getFullYear() - 2));
                    previous = new Date(now.setFullYear(now.getFullYear() - 2));
                    break;
                case RelativeTimeRanges.Last5Y:
                    start = new Date(now.setFullYear(now.getFullYear() - 5));
                    previous = new Date(now.setFullYear(now.getFullYear() - 5));
                    break;
                default:
                    start = new Date(now.setDate(now.getDate() - 30));
                    previous = new Date(now.setDate(now.getDate() - 30));
                    break;
            }
        }
        return {
            currentRange: this.exprBuilder.makeRangeExpr("timestamp", start, end),
            previousRange: this.exprBuilder.makeRangeExpr("timestamp", previous, start),
            previous: Utils.toSqlValue(previous),
            start: Utils.toSqlValue(start),
            end: Utils.toSqlValue(end)
        }
    }
}
