import { Injectable } from "@angular/core";
import { SearchService } from "@sinequa/components/search";
import { AppService, Expr, ExprBuilder } from "@sinequa/core/app-utils";
import { JsonObject, MapOf, Utils } from "@sinequa/core/base";
import {IntlService} from "@sinequa/core/intl";
import {
    Dataset,
    DatasetWebService,
    PrincipalWebService,
    Results,
} from "@sinequa/core/web-services";
import { from, Observable, of, ReplaySubject } from "rxjs";
import { catchError, mergeMap } from "rxjs/operators";
import moment from "moment-timezone";
import { DashboardService } from "./dashboard/dashboard.service";
import {
    static_filters_expr,
    default_app_filter,
    default_profile_filter,
    default_timestamp_filter,
    potential_total_user_count,
    session_count_threshold_per_month,
    sq_timezone,
    custom_params,
    mono_scope_queries
} from "./config";

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
    localPrevious: string;
    localStart: string;
    localEnd: string;
}

@Injectable({
    providedIn: "root"
})
export class AuditService {

    private readonly defaultDatasets:  string[] = ["applications"];

    public data$ = new ReplaySubject<Dataset>(1);
    public previousPeriodData$ = new ReplaySubject<Dataset>(1);

    public currentAuditDataLoading = false;
    public previousAuditDataLoading = false;

    /** Reference period for trends calculation. If not set, this period is inferred from the main period automatically */
    public previousRange: Date[] | undefined;

    public mask: string = "YYYY-MM-DD";
    public sessionCountParam: number;

    // used by stats component tooltip
    public currentFilter: string | undefined;
    public previousFilter: string | undefined;

    // used as tooltips
    public infoCurrentFilter: string | undefined;
    public infoPreviousFilter: string | undefined;
    public startDate: string | undefined;

    constructor(
        public datasetWebService: DatasetWebService,
        public searchService: SearchService,
        public exprBuilder: ExprBuilder,
        public appService: AppService,
        public principalService: PrincipalWebService,
        private intl: IntlService,
        public dashboardService: DashboardService
    ) {
        this.intl.events.subscribe(() => this.convertRangeFilter())
    }

    get webServiceName(): string | undefined {
        if(this.appService.app && this.appService.app.webServices){
            for (const webService of Object.keys(this.appService.app.webServices)) {
                if (this.appService.getWebService(webService)?.webServiceType === 'DataSet') {
                    return webService;
                }
            }
        }
        return undefined;
    }

    get params(): JsonObject {
        return this.appService.app?.data?.params as JsonObject;
    }

    get defaultTimestampFilter(): string | Date[] {
        return ((this.appService.app?.data?.params as JsonObject)?.default_timestamp_filter || default_timestamp_filter) as string | Date[];
    }

    get defaultAppFilter(): string | string[] {
        return ((this.appService.app?.data?.params as JsonObject)?.default_app_filter || default_app_filter) as string | string[];
    }

    get defaultProfileFilter(): string | string[] {
        return ((this.appService.app?.data?.params as JsonObject)?.default_profile_filter || default_profile_filter) as string | string[];
    }

    get serverTimezone(): string {
        return ((this.appService.app?.data?.params as JsonObject)?.sq_timezone || sq_timezone) as string;
    }

    get totalUserCount(): number {
        return ((this.appService.app?.data?.params as JsonObject)?.potential_total_user_count || potential_total_user_count) as number;
    }

    get sessionCountThreshold(): number {
        return ((this.appService.app?.data?.params as JsonObject)?.session_count_threshold_per_month || session_count_threshold_per_month) as number;
    }

    get staticFiltersExpr(): string {
        return ((this.appService.app?.data?.params as JsonObject)?.static_filters_expr || static_filters_expr) as string;
    }

    get customParams(): MapOf<string> {
        return ((this.appService.app?.data?.params as JsonObject)?.custom_params || custom_params) as MapOf<string>;
    }

    get monoScopeQueries(): string[] {
        return ((this.appService.app?.data?.params as JsonObject)?.mono_scope_queries || mono_scope_queries) as string[];
    }

    public updateAuditFilters() {
        /**
         * Reset current dashboard data
         */
        this.data$.next({} as Dataset);
        this.previousPeriodData$.next({} as Dataset);

        /**
         * Programmatically handle the dummy search query with respect to audit requirements
         * This will bring the use of all searchService functionalities in a dataset web service context,
         * without the nightmare of rewriting a dedicated service for this purpose
         *
         * This will ensure a timestamp filter always in the query (default config value OR customized value in the application customization json)
         */
        if (!this.searchService.query.findSelect("audit_timestamp")) {
            this.updateRangeFilter(this.defaultTimestampFilter?.length > 0 ? this.defaultTimestampFilter : RelativeTimeRanges.Last30Days);
        }

        /**
         * If the scope(s) of the analytics data needs to be pre-filtered by a default value(s),
         * then update the query accordingly
         */
        if (!this.searchService.query.findSelect("SBA") && this.defaultAppFilter?.length > 0) {
            this.updateRequestScope("app", this.defaultAppFilter, "SBA");
        }
        if (!this.searchService.query.findSelect("Profile") && this.defaultProfileFilter?.length > 0) {
            this.updateRequestScope("profile", this.defaultProfileFilter, "Profile");
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

        // convert range filters to something more readable
        // used by stats component tooltip
        this.convertRangeFilter(timestamp!, parsedTimestamp);

        /** Update the scope of the dataset web service (app/profile), if filtering by applications is used */
        const apps = this.getRequestScope("SBA");
        const profiles = this.getRequestScope("Profile");

        /**
         *  Update the audit dashboard data (previous and current period)
         */
        let currentPeriodData = {};
        let previousPeriodData = {};

        // Ensure that admin provide the value of potential_total_user_count. If not, an error message is displayed into widgets using this information
        if (this.totalUserCount === 0) {
            currentPeriodData["totalUsers"] = {errorCode: 500, errorMessage: "The parameter potential_total_user_count must be initialized"}
        } else {
            currentPeriodData["totalUsers"] = {"totalrecordcount": this.totalUserCount};
            previousPeriodData["totalUsers"] = {"totalrecordcount": this.totalUserCount};
        }
        this.data$.next(currentPeriodData);
        this.previousPeriodData$.next(previousPeriodData);

        // Specific widgets require a pre-filtering by a unique app in order to have relevant data. If not, an error message is displayed
        this.getParallelStreamAuditData(currentFilters, parsedTimestamp.start, parsedTimestamp.end, apps, profiles, (apps.concat(profiles).length === 1) ? [] : this.monoScopeQueries)
            .subscribe(
                (data) => {
                    currentPeriodData = {...currentPeriodData, ...data};
                    this.data$.next(currentPeriodData);
                },
                () => {},
                () => {
                    if (apps.concat(profiles).length !== 1) {
                        for (const query of this.monoScopeQueries) {
                            currentPeriodData[query] = {errorCode: 500, errorMessage: "This widget requires filtering by a unique application"};
                        }
                        this.data$.next(currentPeriodData);
                    }
                    this.currentAuditDataLoading = false;
                }
            )

        this.getParallelStreamAuditData(previousFilters, parsedTimestamp.previous, parsedTimestamp.start, apps, profiles, (apps.concat(profiles).length === 1) ? [] : this.monoScopeQueries)
            .subscribe(
                (data) => {
                    previousPeriodData = {...previousPeriodData, ...data};
                    this.previousPeriodData$.next(previousPeriodData);
                },
                () => {},
                () => {
                    if (apps.concat(profiles).length !== 1) {
                        for (const query of this.monoScopeQueries) {
                            previousPeriodData[query] = {errorCode: 500, errorMessage: "This widget requires filtering by a unique application"};
                        }
                        this.previousPeriodData$.next(previousPeriodData);
                    }
                    this.previousAuditDataLoading = false;
                }
            )
    }

    public getAuditTimestampFromUrl(): string | string[] | undefined {
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
    protected getRequestScope(facetName: string): string[] {
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

    /**
     *
     * @returns list of queries used by the current displayed dashboard
     */
    private updateDatasetsList(): string[] {
        const datasets: string[] = [];
        this.dashboardService.dashboard.items.forEach(
            (item) => {
                datasets.push(item.query);
                if (item.relatedQuery) {
                    datasets.push(item.relatedQuery);
                }
            }
        );
        return datasets;
    }

    protected getParallelStreamAuditData(
        filters: string,
        start: string,
        end: string,
        apps: string[],
        profiles: string[],
        excludedDataset: string[] = []): Observable<Dataset> {

            let params = {
                select: !!this.staticFiltersExpr ? (`((${this.staticFiltersExpr})` + " AND " + `(${filters}))`) : filters,
                start,
                end,
                mask: this.mask,
                apps,
                profiles,
                sessionCountThreshold: this.sessionCountParam
            };
            // IF a list of custom filters is provided, then include it to the params object
            if (Object.keys(this.customParams).length > 0) {
                params = {...params, ...this.customParams}
            }

            if (this.webServiceName) {
                this.currentAuditDataLoading = true;
                this.previousAuditDataLoading = true;
                const datasets = this.defaultDatasets.concat(this.updateDatasetsList()).filter((datasetName) => (datasetName !== "totalUsers" && !excludedDataset.includes(datasetName))); // Exclude manual added datasets Or datasets pre-requiring extra input (a config param, an app filter ...)
                return from(Array.from(new Set(datasets)))
                        .pipe(
                            mergeMap(
                                (datasetName: string) => this.datasetWebService.get(this.webServiceName!, datasetName, params).pipe(
                                    catchError(err => { // Catch 500 errors thrown when a query does not exist...
                                        const error = {};
                                        error[datasetName] = {errorCode: 500, errorMessage: "Could not find query "+datasetName};
                                        return of(error);
                                    })
                                )
                            )
                        );
            } else {
                console.error("No DataSet found")
                return of({} as Dataset)
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

    public updateRequestScope(field: string, value: string[] | string, facetName: string) {
        let expr: string;
        if (Utils.isString(value)) {
            expr = this.exprBuilder.makeExpr(field, value);
        } else {
            expr = this.exprBuilder.makeListExpr(field, value);
        }
        this.searchService.query.removeSelect(facetName);
        this.searchService.query.addSelect(expr, facetName);
        this.searchService.search();
    }

    public updatePreviousRangeFilter(range: Date[] | undefined) {
        this.previousRange = range;
        this.updateAuditFilters();
    }

    private convertRangeFilter(timestamp?: string[] | string, parsedTimestamp?: AuditDatasetFilters) {
        if (!timestamp || !parsedTimestamp) {
            timestamp = this.getAuditTimestampFromUrl();
            parsedTimestamp = this.parseAuditTimestamp(timestamp!);
        }

        if(Array.isArray(timestamp)) {
            this.currentFilter = `[${this.intl.formatDate(timestamp[0])} - ${this.intl.formatDate(timestamp[1])}]`;
            this.previousFilter =  this.previousRange
                                    ? `[${this.intl.formatDate(this.previousRange[0])} - ${this.intl.formatDate(this.previousRange[1])}]`
                                    : `[${this.intl.formatDate(parsedTimestamp.localPrevious)} - ${this.intl.formatDate(parsedTimestamp.localStart)}]`;
        } else {
            this.currentFilter = timestamp;
            this.previousFilter =  this.previousRange
                                    ? `[${this.intl.formatDate(this.previousRange[0])} - ${this.intl.formatDate(this.previousRange[1])}]`
                                    : timestamp;
        }

        this.startDate = this.intl.formatDate(parsedTimestamp.localStart, {day: "numeric", month: "short", year: "numeric"});
        this.infoCurrentFilter = `${this.intl.formatMessage('msg#dateRange.from')} ${this.startDate} ${this.intl.formatMessage('msg#dateRange.to')} ${this.intl.formatDate(parsedTimestamp.localEnd, {day: "numeric", month: "short", year: "numeric"})}`;
        this.infoPreviousFilter =  this.previousRange
                                    ? `${this.intl.formatMessage('msg#dateRange.from')}  ${this.intl.formatDate(this.previousRange[0], {day: "numeric", month: "short", year: "numeric"})} ${this.intl.formatMessage('msg#dateRange.to')} ${this.intl.formatDate(this.previousRange[1], {day: "numeric", month: "short", year: "numeric"})}`
                                    : `${this.intl.formatMessage('msg#dateRange.from')} ${this.intl.formatDate(parsedTimestamp.localPrevious, {day: "numeric", month: "short", year: "numeric"})} ${this.intl.formatMessage('msg#dateRange.to')} ${this.intl.formatDate(parsedTimestamp.localStart, {day: "numeric", month: "short", year: "numeric"})}`;
    }

    private getTimestampValueFromExpr(expr: Expr): string | string[] {
        if (Utils.isString(expr.value) && expr.value.indexOf("[") > -1) {
            return JSON.parse(expr.value.replace(/`/g, '"'));
        } else {
            return expr.value!;
        }
    }

    protected parseAuditTimestamp(timestamp: string | string[]): AuditDatasetFilters {
        let previous: Date;
        let start: Date;
        let end: Date;
        if (!Utils.isString(timestamp)) {
            // If the timestamp misses the time information ("2020-01-01"), set it to the beginning and the end of day (so it is included)
            start = moment(timestamp[0]).toDate();
            if(timestamp[0].length <= 10) {
                start.setHours(0);
                start.setMinutes(0);
                start.setSeconds(0);
            }
            end = moment(timestamp[1]).toDate();
            if(timestamp[1].length <= 10) {
                end.setHours(23);
                end.setMinutes(59);
                end.setSeconds(59);
            }
            // One day in milliseconds
            const oneDay = 1000 * 60 * 60 * 24;
            // One month in milliseconds
            const oneMonth = 30 * oneDay;
            // One year in milliseconds
            const oneYear = 12 * oneMonth;
            // Calculating the time difference between the two dates
            const diffInTime = end.getTime() - start.getTime();
            // Calculating the number of days between the two dates
            const diffInDays = Math.round(diffInTime / oneDay);
            // Calculating the number of months between the two dates
            const diffInMonths = Math.round(diffInTime / oneMonth);
            // Calculating the number of years between the two dates
            const diffInYears = Math.round(diffInTime / oneYear);

            if (diffInDays <= 7) {
                this.mask = "YYYY-MM-DD-hh";
            } else if (diffInMonths <= 6) {
                this.mask = "YYYY-MM-DD";
            } else {
                if (diffInYears > 2) {
                    this.mask = "YYYY-MM";
                } else {
                    this.mask = "YYYY-WW";
                }
            }

            this.sessionCountParam = (Math.round(this.sessionCountThreshold * diffInMonths) > 1) ? Math.round(this.sessionCountThreshold * diffInMonths) : 1;

            const temp = Utils.copy(start); // Need to use different copy of start to not override it
            previous = new Date(temp.setDate(temp.getDate() - diffInDays));
        } else {
            const now = new Date();
            end = new Date();
            switch (timestamp) {
                case RelativeTimeRanges.Last3H:
                    start = new Date(now.setHours(now.getHours() - 3));
                    previous = new Date(now.setHours(now.getHours() - 3));
                    this.mask = "YYYY-MM-DD-hh-mm";
                    this.sessionCountParam = 1;
                    break;
                case RelativeTimeRanges.Last6H:
                    start = new Date(now.setHours(now.getHours() - 6));
                    previous = new Date(now.setHours(now.getHours() - 6));
                    this.mask = "YYYY-MM-DD-hh-mm";
                    this.sessionCountParam = 1;
                    break;
                case RelativeTimeRanges.Last12H:
                    start = new Date(now.setHours(now.getHours() - 12));
                    previous = new Date(now.setHours(now.getHours() - 12));
                    this.mask = "YYYY-MM-DD-hh";
                    this.sessionCountParam = 1;
                    break;
                case RelativeTimeRanges.Last24H:
                    start = new Date(now.setHours(now.getHours() - 24));
                    previous = new Date(now.setHours(now.getHours() - 24));
                    this.mask = "YYYY-MM-DD-hh";
                    this.sessionCountParam = (Math.round(this.sessionCountThreshold / 30) > 1) ? Math.round(this.sessionCountThreshold / 30) : 1;
                    break;
                case RelativeTimeRanges.Last7Days:
                    start = new Date(now.setDate(now.getDate() - 7));
                    previous = new Date(now.setDate(now.getDate() - 7));
                    this.mask = "YYYY-MM-DD-hh";
                    this.sessionCountParam = (Math.round(this.sessionCountThreshold / 4) > 1) ? Math.round(this.sessionCountThreshold / 4) : 1;
                    break;
                case RelativeTimeRanges.Last30Days:
                    start = new Date(now.setDate(now.getDate() - 30));
                    previous = new Date(now.setDate(now.getDate() - 30));
                    this.mask = "YYYY-MM-DD";
                    this.sessionCountParam = this.sessionCountThreshold;
                    break;
                case RelativeTimeRanges.Last90Days:
                    start = new Date(now.setDate(now.getDate() - 90));
                    previous = new Date(now.setDate(now.getDate() - 90));
                    this.mask = "YYYY-MM-DD";
                    this.sessionCountParam = this.sessionCountThreshold * 3;
                    break;
                case RelativeTimeRanges.Last6M:
                    start = new Date(now.setMonth(now.getMonth() - 6));
                    previous = new Date(now.setMonth(now.getMonth() - 6));
                    this.mask = "YYYY-MM-DD";
                    this.sessionCountParam = this.sessionCountThreshold * 6;
                    break;
                case RelativeTimeRanges.Last1Y:
                    start = new Date(now.setFullYear(now.getFullYear() - 1));
                    previous = new Date(now.setFullYear(now.getFullYear() - 1));
                    this.mask = "YYYY-WW";
                    this.sessionCountParam = this.sessionCountThreshold * 12;
                    break;
                case RelativeTimeRanges.Last2Y:
                    start = new Date(now.setFullYear(now.getFullYear() - 2));
                    previous = new Date(now.setFullYear(now.getFullYear() - 2));
                    this.mask = "YYYY-WW";
                    this.sessionCountParam = this.sessionCountThreshold * 24;
                    break;
                case RelativeTimeRanges.Last5Y:
                    start = new Date(now.setFullYear(now.getFullYear() - 5));
                    previous = new Date(now.setFullYear(now.getFullYear() - 5));
                    this.mask = "YYYY-MM";
                    this.sessionCountParam = this.sessionCountThreshold * 60;
                    break;
                default:
                    start = new Date(now.setDate(now.getDate() - 30));
                    previous = new Date(now.setDate(now.getDate() - 30));
                    this.mask = "YYYY-MM-DD";
                    this.sessionCountParam = this.sessionCountThreshold;
                    break;
            }
        }
        // Override the previous date if the previous range is set
        previous = this.previousRange?.[0] || previous;
        const previousEnd = this.previousRange?.[1] || start;

        // Convert Dates to the given server timezone
        const startToServerTimeZone = this.convertTimeZone(start);
        const endToServerTimeZone = this.convertTimeZone(end);
        const previousToServerTimeZone = this.convertTimeZone(previous);
        const previousEndToServerTimeZone = this.convertTimeZone(previousEnd);

        return {
            currentRange: this.exprBuilder.makeRangeExpr("timestamp", startToServerTimeZone, endToServerTimeZone),
            previousRange: this.exprBuilder.makeRangeExpr("timestamp", previousToServerTimeZone, previousEndToServerTimeZone),
            previous: Utils.toSqlValue(previousToServerTimeZone),
            start: Utils.toSqlValue(startToServerTimeZone),
            end: Utils.toSqlValue(endToServerTimeZone),
            localPrevious: Utils.toSqlValue(previous),
            localStart: Utils.toSqlValue(start),
            localEnd: Utils.toSqlValue(end)
        }
    }

    convertTimeZone(date: string | Date, tzName = this.serverTimezone) {
        return moment.tz(date, tzName).format('YYYY-MM-DD HH:mm:ss');
    }
}
