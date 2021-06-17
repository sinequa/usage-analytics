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
    text: "Queries Over Time",
    icon: "fas fa-chart-line",
    unique: true,
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
    text: "Users Over Time",
    icon: "fas fa-chart-line",
    unique: true,
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
    text: "Sessions Over Time",
    icon: "fas fa-chart-line",
    unique: true,
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
    text: "Average Click By Search Over Time",
    icon: "fas fa-chart-line",
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
    text: "Average Engine Response Over Time",
    icon: "fas fa-chart-line",
    unique: true,
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
    text: "Average MRR Over Time",
    icon: "fas fa-chart-line",
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
    text: "Average Search By Session Over Time",
    icon: "fas fa-chart-line",
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
    text: "Average Response Time Over Time",
    icon: "fas fa-chart-line",
    unique: true,
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
    text: "Response Time Over Time",
    icon: "fas fa-chart-line",
    unique: true,
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
    text: "Average Session Duration Over Time",
    icon: "fas fa-chart-line",
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
    text: "First Click Over Time",
    icon: "fas fa-chart-line",
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
    text: "Click On First 3 Documents Over Time",
    icon: "fas fa-chart-line",
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
    text: "Click Total Over Time",
    icon: "fas fa-chart-line",
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
    text: "New Users Over Time",
    icon: "fas fa-chart-line",
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
    text: "Query Bounce Over Time",
    icon: "fas fa-chart-line",
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
    text: "Search With Clicks Over Time",
    icon: "fas fa-chart-line",
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
    text: "Refinement Over Time",
    icon: "fas fa-chart-line",
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
    text: "Zero Search Over Time",
    icon: "fas fa-chart-line",
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
    text: "Regular Users Over Time",
    icon: "fas fa-chart-line",
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
    text: "Search Exit Over Time",
    icon: "fas fa-chart-line",
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
    text: "Top Queries",
    unique: true,
    parameters: {
        chartData: {
            aggregation: "query"
        } as ChartData,
        chartType: "Pie3D"
    }
};

export const TOP_NO_RESULTS_QUERIES: DashboardItemOption = {
    type: "chart",
    query: "topNoResultQueries",
    icon: "fas fa-chart-pie",
    text: "Top No Results Queries",
    unique: true,
    parameters: {
        chartData: {
            aggregation: "query"
        } as ChartData,
        chartType: "Pie3D"
    }
};

export const TOP_SOURCES: DashboardItemOption = {
    type: "chart",
    query: "topSources",
    icon: "fas fa-chart-pie",
    text: "Top Sources",
    unique: true,
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
    text: "Most Used Filters",
    unique: true,
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
    text: "Users",
    unique: true,
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
    text: "Sessions",
    unique: true,
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
    text: "Queries",
    unique: true,
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
    text: "Average Sessions By User",
    unique: true,
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
    text: "Average Search By Session",
    unique: true,
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
    text: "Average Click By Search",
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
    text: "Average Viewed Documents Per Search",
    unique: true,
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
    text: "Average Session By Duration",
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
    text: "New Users",
    unique: true,
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
    text: "Regular Users",
    unique: true,
    parameters: {
        statLayout: 'standard',
        valueLocation: "totalrecordcount",
        asc: true
    }
};

// export const REGULAR_NEW_USERS: DashboardItemOption = {
//     type: "stat",
//     query: "newUsers",
//     icon: "fas fa-balance-scale",
//     text: "Regular/New Users",
//     unique: true,
//     parameters: {
//         valueLocation: "totalrecordcount",
//         relatedQuery: "regularUsers",
//         relatedValueLocation: "totalrecordcount",
//         computation: "merge",
//         statLayout: 'chart'
//     }
// };

export const FIRST_CLICK: DashboardItemOption = {
    type: "stat",
    query: "clickRank1Total",
    icon: "fas fa-balance-scale",
    text: "First Click",
    unique: true,
    parameters: {
        statLayout: 'standard',
        valueLocation: "totalrecordcount",
        relatedQuery: "clickTotal",
        relatedValueLocation: "records",
        computation: "division",
        asc: true
    }
};

export const MRR: DashboardItemOption = {
    type: "stat",
    query: "avgMRR",
    icon: "fas fa-balance-scale",
    text: "MRR",
    unique: true,
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
    text: "Refinement",
    unique: true,
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
    text: "Refinement Rate",
    unique: true,
    parameters: {
        valueLocation: "totalrecordcount",
        relatedQuery: "queryTotal",
        relatedValueLocation: "records",
        computation: "division",
        statLayout: 'standard',
        asc: true
    }
};

export const SEARCH_WITH_CLICKS: DashboardItemOption = {
    type: "stat",
    query: "queryClick",
    icon: "fas fa-balance-scale",
    text: "Search With Clicks",
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
    text: "Search With Clicks Rate",
    unique: true,
    parameters: {
        valueLocation: "totalrecordcount",
        relatedQuery: "queryTotal",
        relatedValueLocation: "records",
        computation: "division",
        statLayout: 'standard',
        asc: true
    }
};

export const ZERO_SEARCH: DashboardItemOption = {
    type: "stat",
    query: "queryZero",
    icon: "fas fa-balance-scale",
    text: "Zero Search",
    unique: true,
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
    text: "Zero Search Rate",
    unique: true,
    parameters: {
        valueLocation: "totalrecordcount",
        relatedQuery: "queryTotal",
        relatedValueLocation: "records",
        computation: "division",
        statLayout: 'standard',
        asc: false
    }
};

export const SEARCH_EXIT: DashboardItemOption = {
    type: "stat",
    query: "searchExit",
    icon: "fas fa-balance-scale",
    text: "Search Exit",
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
    text: "Search Exit Rate",
    unique: true,
    parameters: {
        valueLocation: "totalrecordcount",
        relatedQuery: "queryTotal",
        relatedValueLocation: "records",
        computation: "division",
        statLayout: 'standard',
        asc: false
    }
};

export const CLICK_FIRST_DOCS: DashboardItemOption = {
    type: "stat",
    query: "clickRank3",
    icon: "fas fa-balance-scale",
    text: "Click On First 3 Documents",
    unique: true,
    parameters: {
        valueLocation: "totalrecordcount",
        relatedQuery: "queryTotal",
        relatedValueLocation: "records",
        computation: "division",
        statLayout: 'standard',
        asc: true
    }
};

export const QUERY_BOUNCE: DashboardItemOption = {
    type: "stat",
    query: "queryBounce",
    icon: "fas fa-balance-scale",
    text: "Bounce",
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
    text: "Bounce Rate",
    unique: true,
    parameters: {
        valueLocation: "totalrecordcount",
        relatedQuery: "queryTotal",
        relatedValueLocation: "records",
        computation: "division",
        statLayout: 'standard',
        asc: true
    }
};

export const RESULT_TYPES: DashboardItemOption = {
    type: "chart",
    query: "queryByResult",
    icon: "fas fa-chart-pie",
    text: "Result Types",
    unique: true,
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
    text: "Average Response Time",
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
    text: "Average Engine Response Time",
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
            QUERY_COUNT_TOTAL_TIMELINE,
            USER_COUNT_TOTAL_TIMELINE,
            SESSION_COUNT_TOTAL_TIMELINE

        ]
    },
    {
        name: "Relevancy",
        items: [
            TOP_SOURCES,
            TOP_QUERIES,
            TOP_NO_RESULTS_QUERIES,
            TOP_FACETS
        ]
    },
    {
        name: "Performance",
        items: [
            RESPONSE_TIME_TIMELINE,
            AVG_RESPONSE_TIME_TIMELINE,
            AVG_ENGINE_RESPONSE_TIMELINE,
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
            RESULT_TYPES
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
