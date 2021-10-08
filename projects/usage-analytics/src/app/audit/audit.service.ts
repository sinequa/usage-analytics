import { Injectable } from "@angular/core";
import { SearchService } from "@sinequa/components/search";
import { AppService, Expr, ExprBuilder } from "@sinequa/core/app-utils";
import { Utils } from "@sinequa/core/base";
import {IntlService} from "@sinequa/core/intl";
import {
    DatasetError,
    DatasetWebService,
    PrincipalWebService,
    Results,
} from "@sinequa/core/web-services";
import { forkJoin, Observable, of, ReplaySubject } from "rxjs";

export enum RelativeTimeRanges {
    Last3H = "msg#dateRange.last3H",
    Last6H = "msg#dateRange.last6H",
    Last12H = "msg#dateRange.last12H",
    Last24H = "msg#dateRange.last24H",
    Last7Days = "msg#dateRange.last7D",
    Last30Days = "msg#dateRange.last30D",
    Last90Days = "msg#dateRange.last90D",
    Last6M = "msg#dateRange.last6M",
    Last1Y = "msg#dateRange.last1Y",
    Last2Y = "msg#dateRange.last2Y",
    Last5Y = "msg#dateRange.last5Y",
}

export interface AuditDatasetFilters {
    currentRange: string;
    previousRange: string;
    previous: string;
    start: string;
    end: string;
}

@Injectable({
    providedIn: "root"
})
export class AuditService {

    public data$ = new ReplaySubject<{ [key: string]: Results | DatasetError }>(1);
    public previousPeriodData$ = new ReplaySubject<{ [key: string]: Results | DatasetError }>(1);

    /** Reference period for trends calculation. If not set, this period is inferred from the main period automatically */
    public previousRange: Date[] | undefined;

    public mask: string = "YYYY-MM-DD";

    // used by stats component tooltip
    public currentFilter: string | undefined;
    public previousFilter: string | undefined;

    constructor(
        public datasetWebService: DatasetWebService,
        public searchService: SearchService,
        public exprBuilder: ExprBuilder,
        public appService: AppService,
        public principalService: PrincipalWebService,
        private intl: IntlService
    ) {}

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
        /**
         * Programmatically handle the dummy search query with respect to audit requirements
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

        // convert range filters to something more readable
        // used by stats component tooltip
        // here: start boundaries
        if(Array.isArray(timestamp)) {
            this.currentFilter = `[${this.intl.formatDate(timestamp[0])} - ${this.intl.formatDate(timestamp[1])}]`;
        } else {
            this.currentFilter = timestamp;
        }

        const parsedTimestamp = this.parseAuditTimestamp(timestamp!);

        const currentFilters = this.exprBuilder.concatAndExpr([...exprs, parsedTimestamp.currentRange]);
        const previousFilters = this.exprBuilder.concatAndExpr([...exprs, parsedTimestamp.previousRange]);
        /** Update the scope of the dataset web service (app/profile), if filtering by applications is used */
        const sba = this.getRequestScope("SBA");
        const profile = this.getRequestScope("Profile");

        /** Update the audit dashboard data (previous and current period) */
        const dataSources = [
            this.getAuditData(currentFilters, parsedTimestamp.start, parsedTimestamp.end, this.mask, sba, profile),
            this.getAuditData(previousFilters, parsedTimestamp.previous, parsedTimestamp.start, this.mask, sba, profile),
            this.principalService.list()
        ] as Observable<{[key: string]: Results | DatasetError;}>[];


        forkJoin(...dataSources).subscribe(
            (data) => {
                this.data$.next({...data[0], "totalUsers": {"totalrecordcount": data[2]?.pagination?.total}});
                this.previousPeriodData$.next({...data[1], "totalUsers": {"totalrecordcount": data[2]?.pagination?.total}});
            }
        )
    }

    public getAuditTimestampFromUrl(): string | Date[] | undefined {
        const expression = this.searchService.query.findSelect("audit_timestamp")?.expression;
        if (expression) {
            const expr = this.appService.parseExpr(expression);
            if (expr instanceof Expr) {
                return this.getTimestampValueFromExpr(expr);
            }
        }
        return undefined;
    }

    /**
     *
     * @param facetName
     * @returns filtered values of a given facet
     */
    private getRequestScope(facetName: string): string[] {
        const expression = this.searchService.query.findSelect(facetName)?.expression;
        if (expression) {
            const expr = this.appService.parseExpr(expression);
            if (expr instanceof Expr) {
                if (expr.operands?.length > 0) {
                    return expr.operands.map((op) => op.value!);
                }
                return expr.values!;
            }
        }
        return [];
    }

    private getAuditData(filters: string, start: string, end: string, mask: string, sba: string[], profile: string[]): Observable<{[key: string]: Results | DatasetError}> {
        const params = {
            select: filters,
            start,
            end,
            mask,
            sba,
            profile
        };
        if (this.webServiceName) {
            return this.datasetWebService.getAll(this.webServiceName, params);
        } else {
            console.error("No DataSet found")
            return of({})
        }
    }

    public updateRangeFilter(timestamp: Date[] | string) {
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
        this.searchService.search();
    }

    public updatePreviousRangeFilter(range: Date[] | undefined) {
        // convert previous range filters to something more readable
        // used by stats component tooltip
        // here: end boundaries
        if(Array.isArray(range)) {
            this.previousFilter = `[${this.intl.formatDate(range[0])} - ${this.intl.formatDate(range[1])}]`;
        } else {
            this.previousFilter = undefined;
        }

        this.previousRange = range;
        this.updateAuditFilters();
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
        // Override the previous date if the previous range is set
        previous = this.previousRange?.[0] || previous;
        const previousEnd = this.previousRange?.[1] || start;
        return {
            currentRange: this.exprBuilder.makeRangeExpr("timestamp", start, end),
            previousRange: this.exprBuilder.makeRangeExpr("timestamp", previous, previousEnd),
            previous: Utils.toSqlValue(previous),
            start: Utils.toSqlValue(start),
            end: Utils.toSqlValue(end)
        }
    }
}
