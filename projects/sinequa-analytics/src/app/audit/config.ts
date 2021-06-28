import { FacetConfig } from "@sinequa/components/facet";
import { DashboardItemOption } from "./dashboard/dashboard.service";
import { ChartData } from "./dashboard/providers/chart-provider";
import { AggregationTimeSeries } from "./dashboard/providers/timeline-provider";

/** Filters */
export const FACETS: FacetConfig[] = [
    {
        name: "SBA",
        title: "SBA",
        type: "list",
        aggregation: "sba",
        icon: "fas fa-globe-americas",
        showCount: true,
        searchable: true,
        allowExclude: true,
        allowOr: true,
        allowAnd: false,
        displayEmptyDistributionIntervals: false,
    },
    {
        name: "Profile",
        title: "Profile",
        type: "list",
        aggregation: "profile",
        icon: "fas fa-building",
        showCount: true,
        searchable: true,
        allowExclude: true,
        allowOr: true,
        allowAnd: false,
        displayEmptyDistributionIntervals: false,
    }
];


/** Widgets */
export const QUERY_COUNT_TOTAL_TIMELINE: DashboardItemOption = {
    type: "timeline",
    query: "queryTotalTimeLine",
    text: "msg#widgets.queryTotalTimeLine.text",
    icon: "fas fa-chart-line",
    info: "msg#widgets.queryTotalTimeLine.info",
    unique: true,
    x: 0,
    y: 4,
    parameters: {
        aggregationsTimeSeries: {
            name: "QueryTotal",
            dateField: "value",
            valueFields: [{name: "count", title: "Query Count Total", primary: true}]
        } as AggregationTimeSeries
    }
};

export const USER_COUNT_TOTAL_TIMELINE: DashboardItemOption = {
    type: "timeline",
    query: "userCountTotalTimeLine",
    text: "msg#widgets.userTotalTimeLine.text",
    icon: "fas fa-chart-line",
    info: "msg#widgets.userTotalTimeLine.info",
    unique: true,
    x: 0,
    y: 0,
    parameters: {
        aggregationsTimeSeries: {
            name: "UserCountTotal",
            dateField: "value",
            valueFields: [{name: "count", title: "User Count Total", primary: true}]
        } as AggregationTimeSeries
    }
};

export const SESSION_COUNT_TOTAL_TIMELINE: DashboardItemOption = {
    type: "timeline",
    query: "sessionTotalTimeLine",
    text: "msg#widgets.sessionTotalTimeLine.text",
    icon: "fas fa-chart-line",
    info: "msg#widgets.sessionTotalTimeLine.info",
    unique: true,
    x: 5,
    y: 0,
    parameters: {
        aggregationsTimeSeries: {
            name: "SessionTotal",
            dateField: "value",
            valueFields: [{name: "count", title: "Session Count Total", primary: true}]
        } as AggregationTimeSeries
    }
};

export const CLICK_BY_SEARCH_TIMELINE: DashboardItemOption = {
    type: "timeline",
    query: "avgClicksByQueryTimeLine",
    text: "msg#widgets.avgClicksByQueryTimeLine.text",
    icon: "fas fa-chart-line",
    info: "msg#widgets.avgClicksByQueryTimeLine.info",
    unique: true,
    parameters: {
        aggregationsTimeSeries: {
            name: "AvgClicksByQuery",
            dateField: "value",
            valueFields: [{operatorResults: true, name: "avg", title: "Average Click By Search", primary: true}]
        } as AggregationTimeSeries
    }
};

export const AVG_ENGINE_RESPONSE_TIMELINE: DashboardItemOption = {
    type: "timeline",
    query: "avgEngineResponseTimeTimeLine",
    text: "msg#widgets.avgEngineResponseTimeTimeLine.text",
    icon: "fas fa-chart-line",
    info: "msg#widgets.avgEngineResponseTimeTimeLine.info",
    unique: true,
    x: 0,
    y: 4,
    parameters: {
        aggregationsTimeSeries: {
            name: "engineresponsetime",
            dateField: "value",
            valueFields: [{operatorResults: true, name: "avg", title: "Average Engine Response", primary: true}]
        } as AggregationTimeSeries
    }
};

export const MRR_TIMELINE: DashboardItemOption = {
    type: "timeline",
    query: "avgMRRTimeLine",
    text: "msg#widgets.avgMRRTimeLine.text",
    icon: "fas fa-chart-line",
    info: "msg#widgets.avgMRRTimeLine.info",
    unique: true,
    parameters: {
        aggregationsTimeSeries: {
            name: "AvgMRR",
            dateField: "value",
            valueFields: [{operatorResults: true, name: "avg", title: "Average MRR", primary: true}]
        } as AggregationTimeSeries
    }
};

export const SEARCH_BY_SESSION_TIMELINE: DashboardItemOption = {
    type: "timeline",
    query: "avgQueriesBySessionTimeLine",
    text: "msg#widgets.avgQueriesBySessionTimeLine.text",
    icon: "fas fa-chart-line",
    info: "msg#widgets.avgQueriesBySessionTimeLine.info",
    unique: true,
    parameters: {
        aggregationsTimeSeries: {
            name: "AvgQueriesBySession",
            dateField: "value",
            valueFields: [{operatorResults: true, name: "avg", title: "Average Search By Session", primary: true}]
        } as AggregationTimeSeries
    }
};

export const AVG_RESPONSE_TIME_TIMELINE: DashboardItemOption = {
    type: "timeline",
    query: "avgResponseTimeTimeLine",
    text: "msg#widgets.avgResponseTimeTimeLine.text",
    icon: "fas fa-chart-line",
    info: "msg#widgets.avgResponseTimeTimeLine.info",
    unique: true,
    x: 0,
    y: 0,
    parameters: {
        aggregationsTimeSeries: {
            name: "engineresponsetime",
            dateField: "value",
            valueFields: [{operatorResults: true, name: "avg", title: "Average Response Time", primary: true}]
        } as AggregationTimeSeries
    }
};

export const RESPONSE_TIME_TIMELINE: DashboardItemOption = {
    type: "timeline",
    query: "responseTimeTimeLine",
    text: "msg#widgets.responseTimeTimeLine.text",
    icon: "fas fa-chart-line",
    info: "msg#widgets.responseTimeTimeLine.info",
    unique: true,
    x: 3,
    y: 0,
    parameters: {
        aggregationsTimeSeries: {
            name: "ResponseTime",
            dateField: "value",
            valueFields: [
                {operatorResults: true, name: "avg", title: "Average", primary: true},
                {operatorResults: true, name: "max", title: "Maximum", primary: true},
                {operatorResults: true, name: "min", title: "Minimum", primary: false}
            ]
        } as AggregationTimeSeries
    }
};

export const SESSION_DURATION_TIMELINE: DashboardItemOption = {
    type: "timeline",
    query: "avgSessionDurationTimeLine",
    text: "msg#widgets.avgSessionDurationTimeLine.text",
    icon: "fas fa-chart-line",
    info: "msg#widgets.avgSessionDurationTimeLine.info",
    unique: true,
    parameters: {
        aggregationsTimeSeries: {
            name: "AvgSessionDuration",
            dateField: "value",
            valueFields: [{operatorResults: true, name: "avg", title: "Average Session Duration", primary: true}]
        } as AggregationTimeSeries
    }
};

export const FIRST_CLICK_TIMELINE: DashboardItemOption = {
    type: "timeline",
    query: "clickRank1TotalTimeLine",
    text: "msg#widgets.clickRank1TotalTimeLine.text",
    icon: "fas fa-chart-line",
    info: "msg#widgets.clickRank1TotalTimeLine.info",
    unique: true,
    parameters: {
        aggregationsTimeSeries: {
            name: "ClickRank1Total",
            dateField: "value",
            valueFields: [{name: "count", title: "First Click", primary: true}]
        } as AggregationTimeSeries
    }
};

export const CLICK_FIRST_DOCS_TIMELINE: DashboardItemOption = {
    type: "timeline",
    query: "clickRank3TimeLine",
    text: "msg#widgets.clickRank3TimeLine.text",
    icon: "fas fa-chart-line",
    info: "msg#widgets.clickRank3TimeLine.info",
    unique: true,
    parameters: {
        aggregationsTimeSeries: {
            name: "ClickRank3",
            dateField: "value",
            valueFields: [{name: "count", title: "Click On First 3 Documents", primary: true}]
        } as AggregationTimeSeries
    }
};

export const CLICK_TOTAL_TIMELINE: DashboardItemOption = {
    type: "timeline",
    query: "clickTotalTimeLine",
    text: "msg#widgets.clickTotalTimeLine.text",
    icon: "fas fa-chart-line",
    info: "msg#widgets.clickTotalTimeLine.info",
    unique: true,
    parameters: {
        aggregationsTimeSeries: {
            name: "ClickTotal",
            dateField: "value",
            valueFields: [{operatorResults: true, name: "sum", title: "Click Total", primary: true}]
        } as AggregationTimeSeries
    }
};

export const NEW_USERS_TIMELINE: DashboardItemOption = {
    type: "timeline",
    query: "newUsersTimeLine",
    text: "msg#widgets.newUsersTimeLine.text",
    icon: "fas fa-chart-line",
    info: "msg#widgets.newUsersTimeLine.info",
    unique: true,
    parameters: {
        aggregationsTimeSeries: {
            name: "NewUsers",
            dateField: "value",
            valueFields: [{name: "count", title: "New Users", primary: true}]
        } as AggregationTimeSeries
    }
};

export const QUERY_BOUNCE_TIMELINE: DashboardItemOption = {
    type: "timeline",
    query: "queryBounceTimeLine",
    text: "msg#widgets.queryBounceTimeLine.text",
    icon: "fas fa-chart-line",
    info: "msg#widgets.queryBounceTimeLine.info",
    unique: true,
    parameters: {
        aggregationsTimeSeries: {
            name: "QueryBounc",
            dateField: "value",
            valueFields: [{name: "count", title: "Query Bounce", primary: true}]
        } as AggregationTimeSeries
    }
};

export const SEARCH_WITH_CLICKS_TIMELINE: DashboardItemOption = {
    type: "timeline",
    query: "queryClickTimeLine",
    text: "msg#widgets.queryClickTimeLine.text",
    icon: "fas fa-chart-line",
    info: "msg#widgets.queryClickTimeLine.info",
    unique: true,
    parameters: {
        aggregationsTimeSeries: {
            name: "QueryClick",
            dateField: "value",
            valueFields: [{name: "count", title: "Search With Clicks", primary: true}]
        } as AggregationTimeSeries
    }
};

export const REFINEMENT_TIMELINE: DashboardItemOption = {
    type: "timeline",
    query: "queryRefineTimeLine",
    text: "msg#widgets.queryRefineTimeLine.text",
    icon: "fas fa-chart-line",
    info: "msg#widgets.queryRefineTimeLine.info",
    unique: true,
    parameters: {
        aggregationsTimeSeries: {
            name: "QueryRefine",
            dateField: "value",
            valueFields: [{name: "count", title: "Refinement", primary: true}]
        } as AggregationTimeSeries
    }
};

export const ZERO_SEARCH_TIMELINE: DashboardItemOption = {
    type: "timeline",
    query: "queryZeroTimeLine",
    text: "msg#widgets.queryZeroTimeLine.text",
    icon: "fas fa-chart-line",
    info: "msg#widgets.queryZeroTimeLine.info",
    unique: true,
    parameters: {
        aggregationsTimeSeries: {
            name: "QueryZero",
            dateField: "value",
            valueFields: [{name: "count", title: "Zero Search", primary: true}]
        } as AggregationTimeSeries
    }
};

export const REGULAR_USERS_TIMELINE: DashboardItemOption = {
    type: "timeline",
    query: "regularUsersTimeLine",
    text: "msg#widgets.regularUsersTimeLine.text",
    icon: "fas fa-chart-line",
    info: "msg#widgets.regularUsersTimeLine.info",
    unique: true,
    parameters: {
        aggregationsTimeSeries: {
            name: "RegularUsers",
            dateField: "value",
            valueFields: [{name: "count", title: "Regular Users", primary: true}]
        } as AggregationTimeSeries
    }
};

export const SEARCH_EXIT_TIMELINE: DashboardItemOption = {
    type: "timeline",
    query: "searchExitTimeLine",
    text: "msg#widgets.searchExitTimeLine.text",
    icon: "fas fa-chart-line",
    info: "msg#widgets.searchExitTimeLine.info",
    unique: true,
    parameters: {
        aggregationsTimeSeries: {
            name: "SearchExit",
            dateField: "value",
            valueFields: [{name: "count", title: "Search Exit", primary: true}]
        } as AggregationTimeSeries
    }
};

export const TOP_QUERIES: DashboardItemOption = {
    type: "chart",
    query: "topQueries",
    icon: "fas fa-chart-pie",
    text: "msg#widgets.topQueries.text",
    info: "msg#widgets.topQueries.info",
    unique: true,
    x: 0,
    y: 0,
    parameters: {
        chartData: {
            aggregation: "query"
        } as ChartData,
        chartType: "Bar2D"
    }
};

export const TOP_NO_RESULTS_QUERIES: DashboardItemOption = {
    type: "chart",
    query: "topNoResultQueries",
    icon: "fas fa-chart-pie",
    text: "msg#widgets.topNoResultQueries.text",
    info: "msg#widgets.topNoResultQueries.info",
    unique: true,
    x: 0,
    y: 4,
    parameters: {
        chartData: {
            aggregation: "query"
        } as ChartData,
        chartType: "Bar2D"
    }
};

export const TOP_SOURCES: DashboardItemOption = {
    type: "chart",
    query: "topSources",
    icon: "fas fa-chart-pie",
    text: "msg#widgets.topSources.text",
    info: "msg#widgets.topSources.info",
    unique: true,
    x: 5,
    y: 4,
    parameters: {
        chartData: {
            aggregation: "source"
        } as ChartData,
        chartType: "Pie3D"
    }
};

export const TOP_FACETS: DashboardItemOption = {
    type: "chart",
    query: "topFacets",
    icon: "fas fa-chart-pie",
    text: "msg#widgets.topFacets.text",
    info: "msg#widgets.topFacets.info",
    unique: true,
    x: 5,
    y: 8,
    parameters: {
        chartData: {
            aggregation: "box"
        } as ChartData,
        chartType: "Pie3D"
    }
};

export const USER_COUNT_TOTAL: DashboardItemOption = {
    type: "stat",
    query: "userCountTotal",
    icon: "fas fa-balance-scale",
    text: "msg#widgets.userCountTotal.text",
    info: "msg#widgets.userCountTotal.info",
    unique: true,
    x: 3,
    y: 2,
    parameters: {
        statLayout: 'standard',
        valueLocation: "totalrecordcount",
        asc: true
    }
};

export const SESSION_COUNT_TOTAL: DashboardItemOption = {
    type: "stat",
    query: "sessionTotal",
    icon: "fas fa-balance-scale",
    text: "msg#widgets.sessionTotal.text",
    info: "msg#widgets.sessionTotal.info",
    unique: true,
    x: 4,
    y: 2,
    parameters: {
        statLayout: 'standard',
        valueLocation: "totalrecordcount",
        asc: true
    }
};

export const QUERY_COUNT_TOTAL: DashboardItemOption = {
    type: "stat",
    query: "queryTotal",
    icon: "fas fa-balance-scale",
    text: "msg#widgets.queryTotal.text",
    info: "msg#widgets.queryTotal.info",
    unique: true,
    x: 3,
    y: 4,
    parameters: {
        statLayout: 'standard',
        valueLocation: "records",
        asc: true
    }
};

export const SESSIONS_BY_USER: DashboardItemOption = {
    type: "stat",
    query: "sessionsByUser",
    icon: "fas fa-balance-scale",
    text: "msg#widgets.sessionsByUser.text",
    info: "msg#widgets.sessionsByUser.info",
    unique: true,
    x: 6,
    y: 4,
    parameters: {
        statLayout: 'standard',
        valueLocation: "aggregations",
        operation: "avg",
        asc: true
    }
};

export const SEARCH_BY_SESSION: DashboardItemOption = {
    type: "stat",
    query: "avgQueriesBySession",
    icon: "fas fa-balance-scale",
    text: "msg#widgets.avgQueriesBySession.text",
    info: "msg#widgets.avgQueriesBySession.info",
    unique: true,
    x: 7,
    y: 4,
    parameters: {
        statLayout: 'standard',
        valueLocation: "records",
        asc: true
    }
};

export const CLICK_BY_SEARCH: DashboardItemOption = {
    type: "stat",
    query: "avgClicksByQuery",
    icon: "fas fa-balance-scale",
    text: "msg#widgets.avgClicksByQuery.text",
    info: "msg#widgets.avgClicksByQuery.info",
    unique: true,
    parameters: {
        statLayout: 'standard',
        valueLocation: "records",
        asc: true
    }
};

export const VIEWED_DOC_PER_SEARCH: DashboardItemOption = {
    type: "stat",
    query: "docViewsBySession",
    icon: "fas fa-balance-scale",
    text: "msg#widgets.docViewsBySession.text",
    info: "msg#widgets.docViewsBySession.info",
    unique: true,
    x: 5,
    y: 4,
    parameters: {
        statLayout: 'standard',
        valueLocation: "aggregations",
        operation: "avg",
        asc: true
    }
};

export const SESSION_DURATION: DashboardItemOption = {
    type: "stat",
    query: "avgSessionDuration",
    icon: "fas fa-balance-scale",
    text: "msg#widgets.avgSessionDuration.text",
    info: "msg#widgets.avgSessionDuration.info",
    unique: true,
    parameters: {
        statLayout: 'standard',
        valueLocation: "records",
        asc: true
    }
};

export const NEW_USERS: DashboardItemOption = {
    type: "stat",
    query: "newUsers",
    icon: "fas fa-balance-scale",
    text: "msg#widgets.newUsers.text",
    info: "msg#widgets.newUsers.info",
    unique: true,
    x: 3,
    y: 0,
    parameters: {
        statLayout: 'standard',
        valueLocation: "totalrecordcount",
        asc: true
    }
};

export const REGULAR_USERS: DashboardItemOption = {
    type: "stat",
    query: "regularUsers",
    icon: "fas fa-balance-scale",
    text: "msg#widgets.regularUsers.text",
    info: "msg#widgets.regularUsers.info",
    unique: true,
    x: 4,
    y: 0,
    parameters: {
        statLayout: 'standard',
        valueLocation: "totalrecordcount",
        asc: true
    }
};

export const ADOPTION_RATE: DashboardItemOption = {
    type: "stat",
    query: "newUsers",
    icon: "fas fa-balance-scale",
    text: "msg#widgets.adoptionRate.text",
    info: "msg#widgets.adoptionRate.info",
    unique: true,
    parameters: {
        statLayout: 'standard',
        valueLocation: "totalrecordcount",
        relatedQuery: "totalUsers",
        relatedValueLocation: "totalrecordcount",
        computation: "percentage",
        asc: true
    }
};

export const REGULAR_USER_RATE: DashboardItemOption = {
    type: "stat",
    query: "regularUsers",
    icon: "fas fa-balance-scale",
    text: "msg#widgets.regularUsersRate.text",
    info: "msg#widgets.regularUsersRate.info",
    unique: true,
    parameters: {
        statLayout: 'standard',
        valueLocation: "totalrecordcount",
        relatedQuery: "totalUsers",
        relatedValueLocation: "totalrecordcount",
        computation: "percentage",
        asc: true
    }
};

export const REGULAR_NEW_USERS: DashboardItemOption = {
    type: "chart",
    query: "",
    icon: "fas fa-chart-pie",
    text: "msg#widgets.regular_newUsers.text",
    info: "msg#widgets.regular_newUsers.info",
    unique: true,
    parameters: {
        chartData: {
            aggregation: "regular-new-user"
        } as ChartData,
        chartType: "Pie3D"
    }
};

export const FIRST_CLICK: DashboardItemOption = {
    type: "stat",
    query: "clickRank1Total",
    icon: "fas fa-balance-scale",
    text: "msg#widgets.clickRank1TotalRate.text",
    info: "msg#widgets.clickRank1TotalRate.info",
    unique: true,
    x: 3,
    y: 0,
    parameters: {
        statLayout: 'standard',
        valueLocation: "totalrecordcount",
        relatedQuery: "clickTotal",
        relatedValueLocation: "records",
        computation: "percentage",
        asc: true
    }
};

export const MRR: DashboardItemOption = {
    type: "stat",
    query: "avgMRR",
    icon: "fas fa-balance-scale",
    text: "msg#widgets.avgMRR.text",
    info: "msg#widgets.avgMRR.info",
    unique: true,
    x: 3,
    y: 2,
    parameters: {
        statLayout: 'standard',
        valueLocation: "records",
        asc: true
    }
};

export const REFINEMENT: DashboardItemOption = {
    type: "stat",
    query: "queryRefine",
    icon: "fas fa-balance-scale",
    text: "msg#widgets.queryRefine.text",
    info: "msg#widgets.queryRefine.info",
    unique: true,
    x: 3,
    y: 6,
    parameters: {
        valueLocation: "totalrecordcount",
        statLayout: 'standard',
        asc: true
    }
};

export const REFINEMENT_RATE: DashboardItemOption = {
    type: "stat",
    query: "queryRefine",
    icon: "fas fa-balance-scale",
    text: "msg#widgets.queryRefineRate.text",
    info: "msg#widgets.queryRefineRate.info",
    unique: true,
    parameters: {
        valueLocation: "totalrecordcount",
        relatedQuery: "queryTotal",
        relatedValueLocation: "records",
        computation: "percentage",
        statLayout: 'standard',
        asc: true
    }
};

export const SEARCH_WITH_CLICKS: DashboardItemOption = {
    type: "stat",
    query: "queryClick",
    icon: "fas fa-balance-scale",
    text: "msg#widgets.queryClick.text",
    info: "msg#widgets.queryClick.info",
    unique: true,
    parameters: {
        statLayout: 'standard',
        valueLocation: "totalrecordcount",
        asc: true
    }
};

export const SEARCH_WITH_CLICKS_RATE: DashboardItemOption = {
    type: "stat",
    query: "queryClick",
    icon: "fas fa-balance-scale",
    text: "msg#widgets.queryClickRate.text",
    info: "msg#widgets.queryClickRate.info",
    unique: true,
    x: 4,
    y: 2,
    parameters: {
        valueLocation: "totalrecordcount",
        relatedQuery: "queryTotal",
        relatedValueLocation: "records",
        computation: "percentage",
        statLayout: 'standard',
        asc: true
    }
};

export const ZERO_SEARCH: DashboardItemOption = {
    type: "stat",
    query: "queryZero",
    icon: "fas fa-balance-scale",
    text: "msg#widgets.queryZero.text",
    info: "msg#widgets.queryZero.info",
    unique: true,
    x: 3,
    y: 4,
    parameters: {
        valueLocation: "totalrecordcount",
        statLayout: 'standard',
        asc: false
    }
};

export const ZERO_SEARCH_RATE: DashboardItemOption = {
    type: "stat",
    query: "queryZero",
    icon: "fas fa-balance-scale",
    text: "msg#widgets.queryZeroRate.text",
    info: "msg#widgets.queryZeroRate.info",
    unique: true,
    parameters: {
        valueLocation: "totalrecordcount",
        relatedQuery: "queryTotal",
        relatedValueLocation: "records",
        computation: "percentage",
        statLayout: 'standard',
        asc: false
    }
};

export const SEARCH_EXIT: DashboardItemOption = {
    type: "stat",
    query: "searchExit",
    icon: "fas fa-balance-scale",
    text: "msg#widgets.searchExit.text",
    info: "msg#widgets.searchExit.info",
    unique: true,
    parameters: {
        statLayout: 'standard',
        valueLocation: "totalrecordcount",
        asc: false
    }
};

export const SEARCH_EXIT_RATE: DashboardItemOption = {
    type: "stat",
    query: "searchExit",
    icon: "fas fa-balance-scale",
    text: "msg#widgets.searchExitRate.text",
    info: "msg#widgets.searchExitRate.info",
    unique: true,
    x: 4,
    y: 4,
    parameters: {
        valueLocation: "totalrecordcount",
        relatedQuery: "queryTotal",
        relatedValueLocation: "records",
        computation: "percentage",
        statLayout: 'standard',
        asc: false
    }
};

export const CLICK_FIRST_DOCS: DashboardItemOption = {
    type: "stat",
    query: "clickRank3",
    icon: "fas fa-balance-scale",
    text: "msg#widgets.clickRank3.text",
    info: "msg#widgets.clickRank3.info",
    unique: true,
    x: 4,
    y: 0,
    parameters: {
        valueLocation: "totalrecordcount",
        relatedQuery: "queryTotal",
        relatedValueLocation: "records",
        computation: "percentage",
        statLayout: 'standard',
        asc: true
    }
};

export const QUERY_BOUNCE: DashboardItemOption = {
    type: "stat",
    query: "queryBounce",
    icon: "fas fa-balance-scale",
    text: "msg#widgets.queryBounce.text",
    info: "msg#widgets.queryBounce.info",
    unique: true,
    parameters: {
        valueLocation: "totalrecordcount",
        statLayout: 'standard',
        asc: true
    }
};

export const QUERY_BOUNCE_RATE: DashboardItemOption = {
    type: "stat",
    query: "queryBounce",
    icon: "fas fa-balance-scale",
    text: "msg#widgets.queryBounceRate.text",
    info: "msg#widgets.queryBounceRate.info",
    unique: true,
    x: 4,
    y: 6,
    parameters: {
        valueLocation: "totalrecordcount",
        relatedQuery: "queryTotal",
        relatedValueLocation: "records",
        computation: "percentage",
        statLayout: 'standard',
        asc: true
    }
};

export const RESULT_TYPES: DashboardItemOption = {
    type: "chart",
    query: "queryByResult",
    icon: "fas fa-chart-pie",
    text: "msg#widgets.queryByResult.text",
    info: "msg#widgets.queryByResult.info",
    unique: true,
    x: 5,
    y: 0,
    parameters: {
        chartData: {
            aggregation: "result"
        } as ChartData,
        chartType: "Pie3D"
    }
};

export const AVG_RESPONSE_TIME: DashboardItemOption = {
    type: "stat",
    query: "avgResponseTime",
    icon: "fas fa-balance-scale",
    text: "msg#widgets.avgResponseTime.text",
    info: "msg#widgets.avgResponseTime.info",
    unique: true,
    parameters: {
        statLayout: 'standard',
        valueLocation: "records",
        asc: false
    }
};

export const AVG_ENGINE_RESPONSE_TIME: DashboardItemOption = {
    type: "stat",
    query: "avgEngineResponseTime",
    icon: "fas fa-balance-scale",
    text: "msg#widgets.avgEngineResponseTime.text",
    info: "msg#widgets.avgEngineResponseTime.info",
    unique: true,
    parameters: {
        statLayout: 'standard',
        valueLocation: "records",
        asc: false
    }
};

/** Dashboards */
export const  STANDARD_DASHBOARDS: {name: string, items: DashboardItemOption[]}[] = [
  {
      name: "User adoption",
      items: [
          USER_COUNT_TOTAL_TIMELINE,
          NEW_USERS,
          REGULAR_USERS,
          USER_COUNT_TOTAL,
          SESSIONS_BY_USER,
          SESSION_COUNT_TOTAL,
          SEARCH_BY_SESSION,
          QUERY_COUNT_TOTAL,
          VIEWED_DOC_PER_SEARCH,
          QUERY_COUNT_TOTAL_TIMELINE,
          SESSION_COUNT_TOTAL_TIMELINE
      ]
  },
  {
      name: "Relevancy",
      items: [
          TOP_QUERIES,
          TOP_NO_RESULTS_QUERIES,
          CLICK_FIRST_DOCS,
          QUERY_BOUNCE_RATE,
          SEARCH_EXIT_RATE,
          ZERO_SEARCH,
          REFINEMENT,
          MRR,
          FIRST_CLICK,
          TOP_SOURCES,
          RESULT_TYPES,
          SEARCH_WITH_CLICKS_RATE,
          TOP_FACETS
      ]
  },
  {
      name: "Performance",
      items: [
          AVG_RESPONSE_TIME_TIMELINE,
          RESPONSE_TIME_TIMELINE,
          AVG_ENGINE_RESPONSE_TIMELINE
      ]
  },
]

/** Panorama */
export const PANORAMA: {name: string, items: DashboardItemOption[]}[] = [
  {
      name: "Timeline",
      items: [
          QUERY_COUNT_TOTAL_TIMELINE,
          USER_COUNT_TOTAL_TIMELINE,
          SESSION_COUNT_TOTAL_TIMELINE,
          SEARCH_BY_SESSION_TIMELINE,
          CLICK_BY_SEARCH_TIMELINE,
          SESSION_DURATION_TIMELINE,
          NEW_USERS_TIMELINE,
          REGULAR_USERS_TIMELINE,
          FIRST_CLICK_TIMELINE,
          MRR_TIMELINE,
          REFINEMENT_TIMELINE,
          SEARCH_WITH_CLICKS_TIMELINE,
          SEARCH_EXIT_TIMELINE,
          ZERO_SEARCH_TIMELINE,
          CLICK_FIRST_DOCS_TIMELINE,
          QUERY_BOUNCE_TIMELINE,
          CLICK_TOTAL_TIMELINE,
          RESPONSE_TIME_TIMELINE,
          AVG_RESPONSE_TIME_TIMELINE,
          AVG_ENGINE_RESPONSE_TIMELINE

      ]
  },
  {
      name: "Chart",
      items: [
          TOP_SOURCES,
          TOP_QUERIES,
          TOP_FACETS,
          TOP_NO_RESULTS_QUERIES,
          RESULT_TYPES,
          REGULAR_NEW_USERS
      ]
  },
  {
      name: "Statistics",
      items: [
          QUERY_COUNT_TOTAL,
          USER_COUNT_TOTAL,
          SESSION_COUNT_TOTAL,
          SESSIONS_BY_USER,
          VIEWED_DOC_PER_SEARCH,
          SEARCH_BY_SESSION,
          CLICK_BY_SEARCH,
          SESSION_DURATION,
          NEW_USERS,
          REGULAR_USERS,
          ADOPTION_RATE,
          REGULAR_USER_RATE,
          FIRST_CLICK,
          MRR,
          REFINEMENT,
          SEARCH_WITH_CLICKS,
          SEARCH_WITH_CLICKS_RATE,
          ZERO_SEARCH,
          SEARCH_EXIT,
          SEARCH_EXIT_RATE,
          CLICK_FIRST_DOCS,
          QUERY_BOUNCE,
          QUERY_BOUNCE_RATE,
          AVG_RESPONSE_TIME,
          AVG_ENGINE_RESPONSE_TIME
      ]
  }
]
