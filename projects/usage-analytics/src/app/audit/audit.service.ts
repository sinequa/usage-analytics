import { Injectable } from "@angular/core";
import { SearchService } from "@sinequa/components/search";
import { AppService } from "@sinequa/core/app-utils";
import { JsonObject, MapOf, Utils } from "@sinequa/core/base";
import {IntlService} from "@sinequa/core/intl";
import {
    BetweenFilter,
    BooleanFilter,
    CCWebService,
    Dataset,
    DatasetWebService,
    Filter,
    InFilter,
    isFieldFilter,
    PrincipalWebService,
    Results,
} from "@sinequa/core/web-services";
import { from, Observable, of, ReplaySubject } from "rxjs";
import { catchError, map, mergeMap } from "rxjs/operators";
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
    mono_scope_queries,
    facet_filters_query,
    RelativeTimeRanges
} from "./config";

export interface AuditDatasetFilters {
    currentRangeFilter: BetweenFilter;
    previousRangeFilter: BetweenFilter;
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

    // Calculate the diff between previous & start dates (in millisecond), used by Timeline component
    public diffPreviousAndStart: number;

    private _parsedTimestamp: AuditDatasetFilters;
    private _timestamp: string | string[] | Date[];
    private _skipParseTimestamp = false;

    constructor(
        public datasetWebService: DatasetWebService,
        public searchService: SearchService,
        public appService: AppService,
        public principalService: PrincipalWebService,
        private intl: IntlService,
        public dashboardService: DashboardService
    ) {
        this.intl.events.subscribe(() => this.convertRangeFilter())
    }

    /**
     * This methods retrieves all the web services of type "DataSet" configured within the application.
     */
    get ccDataSetWebServices(): CCWebService[] {
        return Object.values(this.appService?.app?.webServices || {})
                    .filter(ws => ws.webServiceType === "DataSet") as CCWebService[];
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

    get staticFiltersExpr(): Filter | null {
        return ((this.appService.app?.data?.params as JsonObject)?.static_filters_expr || static_filters_expr) as Filter | null;
    }

    get customParams(): MapOf<string> {
        return ((this.appService.app?.data?.params as JsonObject)?.custom_params || custom_params) as MapOf<string>;
    }

    get monoScopeQueries(): string[] {
        return ((this.appService.app?.data?.params as JsonObject)?.mono_scope_queries || mono_scope_queries) as string[];
    }

    get facetFiltersQuery(): string {
        return ((this.appService.app?.data as JsonObject)?.facet_filters_query || facet_filters_query) as string;
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
         * Otherwise, use the value present in query
         */
        if (!(this.searchService.query.findFieldFilters("timestamp").length > 0)) {
            this.updateRangeFilter(this.defaultTimestampFilter?.length > 0 ? this.defaultTimestampFilter : RelativeTimeRanges.Last30Days);
        } else {
            this._timestamp = this.getAuditTimestampFromUrl();
            if (!this._skipParseTimestamp) {
                this._parsedTimestamp = this.parseAuditTimestamp(this._timestamp);
            }
        }
        // Re-assign it to false to keep the possibility to parse the timestamp in case of an update made directly via the URL
        this._skipParseTimestamp = false;

        /**
         * If the scope(s) of the analytics data needs to be pre-filtered by a default value(s),
         * then update the query accordingly
         */
        if (!(this.searchService.query.findFieldFilters("app").length > 0) && this.defaultAppFilter?.length > 0) {
            this.updateRequestScope("app", this.defaultAppFilter);
        }
        if (!(this.searchService.query.findFieldFilters("profile").length > 0) && this.defaultProfileFilter?.length > 0) {
            this.updateRequestScope("profile", this.defaultProfileFilter);
        }

        /**
         * Rebuild the query corresponding to current/previous period. Filters on that query will be used in the WHERE clause of datasets
         */
        const query = this.searchService.query.copy();
        query.removeFieldFilters("timestamp");

        const currentQuery = query.copy();
        currentQuery.addFilter(this._parsedTimestamp.currentRangeFilter);
        const currentFilters = currentQuery.filters;

        const previousQuery = query.copy();
        previousQuery.addFilter(this._parsedTimestamp.previousRangeFilter);
        const previousFilters = previousQuery.filters;

        // convert range filters to something more readable
        // used by stats component tooltip
        this.convertRangeFilter();

        /** Update the scope of the dataset web service (app/profile), if filtering by applications is used */
        const apps = this.getRequestScope("app");
        const profiles = this.getRequestScope("profile");

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
        this.getParallelStreamAuditData(currentFilters!, this._parsedTimestamp.start, this._parsedTimestamp.end, apps, profiles, true, (apps.concat(profiles).length === 1) ? [] : this.monoScopeQueries)
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

        this.getParallelStreamAuditData(previousFilters!, this._parsedTimestamp.previous, this._parsedTimestamp.start, apps, profiles, false, (apps.concat(profiles).length === 1) ? [] : this.monoScopeQueries)
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

    public getAuditTimestampFromUrl(): string | string[] {
        const filter = this.searchService.query.findFieldFilters("timestamp")[0] as BetweenFilter | BooleanFilter;
        if (filter.operator === "between") {
            return [filter.start.toString(), filter.end.toString()];
        } else {
            return filter.value.toString();
        }
    }

    /**
     *
     * @param field
     * @returns filtered values of a given facet
     */
    protected getRequestScope(field: string): string[] {
        const filter = this.searchService.query.findFilter(f => isFieldFilter(f) && f.field === field && f.operator === "in") as InFilter;
        return filter?.values || [];
    }

    /**
     *
     * @param isCurrent used to determine if the datasets are used in the current or previous period. This is used to filter out the datasets that are not involved in the trend calculation
     * @returns list of {webService, query} used by widgets in the current displayed dashboard
     */
    protected updateDatasetsList(isCurrent: boolean): string[] {
        const datasets: string[] = isCurrent ? [this.facetFiltersQuery] : [];
        const items = isCurrent ? this.dashboardService.dashboard.items : this.dashboardService.dashboard.items.filter(item => !["chart", "grid", "heatmap", "multiLevelPie"].includes(item.parameters.type));
        items.forEach(
            (item) => {
                if (item.parameters.query) {
                    datasets.push(item.parameters.query);
                }
                if (item.parameters.relatedQuery) {
                    datasets.push(item.parameters.relatedQuery);
                }
                if (item.parameters.queries) {
                    datasets.push(...item.parameters.queries);
                }
                if (item.parameters.multiLevelPieQueries) {
                    datasets.push(...item.parameters.multiLevelPieQueries.map(item => item.query));
                }
            }
        );
        return datasets;
    }

    protected getParallelStreamAuditData(
        filters: Filter,
        start: string,
        end: string,
        apps: string[],
        profiles: string[],
        isCurrent: boolean,
        excludedDataset: string[] = []): Observable<Dataset> {

            let params = {
                select: JSON.stringify(this.staticFiltersExpr !== null ? {operator: "and", filters: [filters, this.staticFiltersExpr]} : filters),
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

            if (this.ccDataSetWebServices.length > 0) { // Make sure there is,at least, a default webService to use
                this.currentAuditDataLoading = true;
                this.previousAuditDataLoading = true;
                // Exclude manual added datasets Or datasets pre-requiring extra input (a config param, an app filter ...)
                const datasets = this.updateDatasetsList(isCurrent)
                  .filter((datasetName) => (datasetName !== "totalUsers" && !excludedDataset.includes(datasetName) && (apps.concat(profiles).length !== 1 ? !this.monoScopeQueries.includes(datasetName) : true)));

                /**
                 * Execute unique datasets pointing to different web services potentially
                 * Each query will be resolved using the last dataset in the ccDataSetWebServices list containing it
                 * Thus, we assume that always a dataset is overriding the previous dataset
                 */
                return from(Array.from(new Set(datasets)))
                        .pipe(
                            mergeMap(
                                (query: string) => {
                                    const webService = this.ccDataSetWebServices.reverse().find((config) => (<{name: string}[]>config["sQL"]).find(el => Utils.eqNC(el.name, query)));
                                    if (webService) {
                                        return this.datasetWebService.get(webService.name, query, params).pipe(
                                            map((res: Results) => {
                                                this.searchService.initializeResults(this.searchService.query, res)
                                                return {[query]: res} as Dataset
                                            }),
                                            // Catch 500 errors thrown when a query does not exist or error parsing sql query ...
                                            catchError((err) => of({[query]: {errorCode: 500, errorMessage: "An error occurs when executing the query '"+query+ "' "}} as Dataset))
                                        )
                                    } else {
                                        return of({[query]: {errorCode: 500, errorMessage: "Could not find the query '"+query+ "' "}} as Dataset)
                                    }

                                }
                            )
                        );
            } else {
                console.error("No DataSet web service found")
                return of({} as Dataset)
            }
    }

    public updateRangeFilter(timestamp: Date[] | string) {
        this._parsedTimestamp = this.parseAuditTimestamp(timestamp);
        this._skipParseTimestamp = true;

        let filter: BooleanFilter | BetweenFilter;
        if (Utils.isString(timestamp)) {
            // BooleanFilter is used here in case of string pre-defined dateRange. It will be parsed to a BetweenFilter, by parseAuditTimestamp(), right before being sent to the server
            filter = {field: "timestamp", value: timestamp, operator: "eq"} as BooleanFilter;
        } else {
            filter = {field: "timestamp", start: this._parsedTimestamp.localStart, end: this._parsedTimestamp.localEnd, operator: "between"} as BetweenFilter;
        }

        this.searchService.query.removeFieldFilters("timestamp");
        this.searchService.query.addFilter(filter);
        this.searchService.search();
    }

    public updateRequestScope(field: string, value: string[] | string) {
        value = Utils.asArray(value);
        const filter: InFilter = {field: field, values: value, operator: "in"}
        this.searchService.query.removeFieldFilters(field);
        this.searchService.query.addFilter(filter);
        this.searchService.search();
    }

    public updatePreviousRangeFilter(range: Date[] | undefined) {
        this.previousRange = range;
        this.updateAuditFilters();
    }

    protected convertRangeFilter() {
        if (!this._timestamp || !this._parsedTimestamp) {
            return;
        }

        if(Array.isArray(this._timestamp)) {
            this.currentFilter = `[${this.formatDateTime(this._timestamp[0])} - ${this.formatDateTime(this._timestamp[1])}]`;
            this.previousFilter =  this.previousRange
                                    ? `[${this.formatDateTime(this.previousRange[0])} - ${this.formatDateTime(this.previousRange[1])}]`
                                    : `[${this.formatDateTime(this._parsedTimestamp.localPrevious)} - ${this.formatDateTime(this._parsedTimestamp.localStart)}]`;
        } else {
            this.currentFilter = this._timestamp;
            this.previousFilter =  this.previousRange
                                    ? `[${this.formatDateTime(this.previousRange[0])} - ${this.formatDateTime(this.previousRange[1])}]`
                                    : this._timestamp;
        }

        this.startDate = this.formatDateTime(this._parsedTimestamp.localStart);
        this.infoCurrentFilter = `${this.intl.formatMessage('msg#dateRange.from')} ${this.startDate} ${this.intl.formatMessage('msg#dateRange.to')} ${this.formatDateTime(this._parsedTimestamp.localEnd)}`;
        this.infoPreviousFilter =  this.previousRange
                                    ? `${this.intl.formatMessage('msg#dateRange.from')}  ${this.formatDateTime(this.previousRange[0])} ${this.intl.formatMessage('msg#dateRange.to')} ${this.formatDateTime(this.previousRange[1])}`
                                    : `${this.intl.formatMessage('msg#dateRange.from')} ${this.formatDateTime(this._parsedTimestamp.localPrevious)} ${this.intl.formatMessage('msg#dateRange.to')} ${this.formatDateTime(this._parsedTimestamp.localStart)}`;
    }

    protected formatDateTime(value: string | Date): string {
        const formatFunction = (this.mask !== "YYYY-MM-DD-hh-mm" && this.mask !== "YYYY-MM-DD-hh") ? "formatDate" : "formatTime";
        return this.intl[formatFunction](value, {day: "numeric", month: "short", year: "numeric"});
    }

    protected parseAuditTimestamp(timestamp: string | string[] | Date[]): AuditDatasetFilters {
        let previous: Date;
        let start: Date;
        let end: Date;

        if (Array.isArray(timestamp)) {
            // If the timestamp misses the time information ("2020-01-01"), set it to the beginning and the end of day (so it is included)
            start = moment(timestamp[0]).toDate();
            if(Utils.isString(timestamp[0]) && timestamp[0].length <= 10) {
                this.zeroTimes(start)
            }
            end = moment(timestamp[1]).toDate();
            if(Utils.isString(timestamp[1]) && timestamp[1].length <= 10) {
                end.setHours(23);
                end.setMinutes(59);
                end.setSeconds(59);
            }
            // One hour in milliseconds
            const oneHour = 1000 * 60 * 60;
            // One day in milliseconds
            const oneDay = 1000 * 60 * 60 * 24;
            // One month in milliseconds
            const oneMonth = 30 * oneDay;
            // One year in milliseconds
            const oneYear = 12 * oneMonth;
            // Calculating the time difference between the two dates
            const diffInTime = end.getTime() - start.getTime();
            // Calculating the number of hours between the two dates
            const diffInDHours = Math.round(diffInTime / oneHour);
            // Calculating the number of days between the two dates
            const diffInDays = Math.round(diffInTime / oneDay);
            // Calculating the number of months between the two dates
            const diffInMonths = Math.round(diffInTime / oneMonth);
            // Calculating the number of years between the two dates
            const diffInYears = Math.round(diffInTime / oneYear);

            if (diffInDHours < 12) {
                this.mask = "YYYY-MM-DD-hh-mm";
            } else if (diffInDays <= 7) {
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

        // Calculate the diff between previous & start dates (in millisecond)
        this.diffPreviousAndStart = start.getTime() - previous.getTime();

        // Override the previous date if the previous range is set
        previous = this.previousRange?.[0] || previous;
        const previousEnd = this.previousRange?.[1] || start;

        // Convert Dates to the given server timezone
        const startToServerTimeZone = this.convertTimeZone(start);
        const endToServerTimeZone = this.convertTimeZone(end);
        const previousToServerTimeZone = this.convertTimeZone(previous);
        const previousEndToServerTimeZone = this.convertTimeZone(previousEnd);

        // Re-adjust displayed dates, for example hide time part if 0 or yearly mask ...
        // We use a copy in order to dissociate formatting displayed dates and the ones sent to the server
        const localPrevious = Utils.copy(previous);
        const localStart = Utils.copy(start);
        const localEnd = Utils.copy(end);
        if (this.mask !== "YYYY-MM-DD-hh-mm" && this.mask !== "YYYY-MM-DD-hh") {
            this.zeroTimes(localPrevious);
            this.zeroTimes(localStart);
            this.zeroTimes(localEnd);
        }

        return {
            currentRangeFilter: {field: "timestamp", start: Utils.toSqlValue(startToServerTimeZone), end: Utils.toSqlValue(endToServerTimeZone), operator: "between"} as BetweenFilter,
            previousRangeFilter: {field: "timestamp", start: Utils.toSqlValue(previousToServerTimeZone), end: Utils.toSqlValue(previousEndToServerTimeZone), operator: "between"} as BetweenFilter,
            previous: Utils.toSqlValue(previousToServerTimeZone),
            start: Utils.toSqlValue(startToServerTimeZone),
            end: Utils.toSqlValue(endToServerTimeZone),
            localPrevious: Utils.toSysDateStr(localPrevious),
            localStart: Utils.toSysDateStr(localStart),
            localEnd: Utils.toSysDateStr(localEnd)
        }
    }

    protected convertTimeZone(date: string | Date, tzName = this.serverTimezone): string {
        return moment.tz(date, tzName).format('YYYY-MM-DD HH:mm:ss');
    }

    protected zeroTimes(value: Date) {
        value.setHours(0);
        value.setMinutes(0);
        value.setSeconds(0);
        value.setMilliseconds(0);
    }
}
