import { FacetConfig, FacetListParams } from "@sinequa/components/facet";
import { HelpFolderOptions } from "@sinequa/components/user-settings";
import { MapOf } from "@sinequa/core/base";
import { DashboardItemOption, DashboardItemPosition } from "./dashboard/dashboard.service";

/** Server TimeZone */
export const sq_timezone: string = "UTC";

/** Minimum sessions count to be considered as "Active user" */
export const session_count_threshold_per_month: number = 2;

/** Potential current number of users interacting with the platform */
export const potential_total_user_count: number = 0;

/** Filters expression to be added in the WHERE clause of ALL DATASETS */
export const static_filters_expr: string = "";

/** Set of params that could be used as input in A SPECIFIC DATASET ( WHERE clause, FROM clause ...)*/
export const custom_params: MapOf<string> = {};

/** Default time period used on init */
export const default_timestamp_filter: string | Date[] = "";

/** Default scope, on sba, used on init */
export const default_app_filter: string | string[] = "";

/** Default scope, on profile, used on init */
export const default_profile_filter: string | string[] = "";

/** Queries requiring filtering by a unique application to display correct data */
export const mono_scope_queries: string[] = [];

/** Show/Hide the user-feedback menu */
export const enableUserFeedbackMenu: boolean = true;

/** Predefined period filters */
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

/** Filters */
export const FACETS: FacetConfig<FacetListParams>[] = [
    {
        name: "SBA",
        title: "SBA",
        aggregation: "sba",
        type: "list",
        icon: "fas fa-globe-americas",
        parameters: {
            showCount: true,
            searchable: false,
            allowExclude: true,
            allowOr: true,
            allowAnd: false,
            displayEmptyDistributionIntervals: false
        }
    },
    {
        name: "Profile",
        title: "Profile",
        aggregation: "profile",
        type: "list",
        icon: "fas fa-building",
        parameters: {
            showCount: true,
            searchable: false,
            allowExclude: true,
            allowOr: true,
            allowAnd: false,
            displayEmptyDistributionIntervals: false
        }
    }
];
export const facet_filters_query: string = "applications";
export const facet_filters_name: string = "Applications";
export const facet_filters_icon: string = "fas fa-desktop";

/** Widgets */
export const WIDGETS: {[key: string]: DashboardItemOption} = {
    "usersRepartition": {
        "id": "usersRepartition",
        "type": "multiLevelPie",
        "query": "totalUsers",
        "icon": "fas fa-chart-pie",
        "text": "Users Repartition",
        "info": "<span class='text-decoration-underline'><b>Description:</b></span> <br> <span class='text-decoration-underline'><b>Interpretation:</b></span>  Adoption indicator. <br> <span class='text-decoration-underline'><b>Calculation:</b></span> ",
        "unique": true,
        "parameters": {
            "extraQueries": ["userCountTotal", "newUsers", "activeUsers"]
        }
    },
    "searchCountTotal": {
        "id": "searchCountTotal",
        "type": "stat",
        "query": "searchTotal",
        "icon": "fas fa-balance-scale",
        "text": "Search summaries",
        "info": "<span class='text-decoration-underline'><b>Description:</b></span> Number of all Search Summaries. <br> <span class='text-decoration-underline'><b>Interpretation:</b></span>  Adoption indicator. <br> <span class='text-decoration-underline'><b>Calculation:</b></span>  Addition of all Search Summaries",
        "unique": true,
        "parameters": {
            "statLayout": "standard",
            "valueLocation": "totalrecordcount",
            "asc": true
        }
    },
    "searchCountTotalTimeline": {
        "id": "searchCountTotalTimeline",
        "type": "timeline",
        "query": "searchTotalTimeLine",
        "text": "Search Summaries Timeline",
        "icon": "fas fa-chart-line",
        "info": "<span class='text-decoration-underline'><b>Description:</b></span> Number of Search Summaries over time. <br> <span class='text-decoration-underline'><b>Interpretation:</b></span>  An increase in the number of Search Summaries over time is an indicator of platform adoption. <br> <span class='text-decoration-underline'><b>Calculation:</b></span>  Addition of all Search Summaries.",
        "unique": true,
        "parameters": {
            "aggregationsTimeSeries": {
                "name": "SearchSummaryTotal",
                "dateField": "value",
                "valueFields": [{"name": "count", "title": "Search Summaries Count", "primary": true}]
            },
            "chartType": "Timeline"
        }
    },
    "usersActivitiesTimeline": {
        "id": "usersActivitiesTimeline",
        "type": "timeline",
        "query": "queryTotalTimeLine",
        "text": "Users Activities Timeline",
        "icon": "fas fa-chart-line",
        "info": "<span class='text-decoration-underline'><b>Description:</b></span> Number of full-text queries over time.<br> <span class='text-decoration-underline'><b>Interpretation:</b></span> An increase in the number of full-text queries over time is an indicator of platform adoption.<br> <span class='text-decoration-underline'><b>Calculation:</b></span> Addition of all Full-text Queries",
        "unique": true,
        "parameters": {
            "extraQueries": ["sessionTotalTimeLine"],
            "aggregationsTimeSeries": [
                {
                    "name": "QueryTotal",
                    "dateField": "value",
                    "valueFields": [{"displayedName": "Query Count", "name": "count", "title": "Query Count Total", "primary": true}]
                },
                {
                    "name": "SessionTotal",
                    "dateField": "value",
                    "valueFields": [{"displayedName": "Session Count", "name": "count", "title": "Session Count Total", "primary": true}]
                }
            ],
            "chartType": "Timeline"
        }
    },
    "queryCountTotalTimeline": {
        "id": "queryCountTotalTimeline",
        "type": "timeline",
        "query": "queryTotalTimeLine",
        "text": "Full-text Queries Timeline",
        "icon": "fas fa-chart-line",
        "info": "<span class='text-decoration-underline'><b>Description:</b></span> Number of full-text queries over time.<br> <span class='text-decoration-underline'><b>Interpretation:</b></span> An increase in the number of full-text queries over time is an indicator of platform adoption.<br> <span class='text-decoration-underline'><b>Calculation:</b></span> Addition of all Full-text Queries",
        "unique": true,
        "parameters": {
            "aggregationsTimeSeries": {
                "name": "QueryTotal",
                "dateField": "value",
                "valueFields": [{"name": "count", "title": "Query Count Total", "primary": true}]
            },
            "chartType": "Timeline"
        }
    },
    "userCountTotalTimeline": {
        "id": "userCountTotalTimeline",
        "type": "timeline",
        "query": "userCountTotalTimeLine",
        "text": "Total Unique Users Timeline",
        "icon": "fas fa-chart-line",
        "info": "<span class='text-decoration-underline'><b>Description:</b></span> Number of unique user-ids logged per day in over time. <br> <span class='text-decoration-underline'><b>Interpretation:</b></span>  Adoption indicator. <br> <span class='text-decoration-underline'><b>Calculation:</b></span>  Based on session-summary. Addition of all unique user-ids who did sessions during the day.",
        "unique": true,
        "parameters": {
            "aggregationsTimeSeries": {
                "name": "UserCountTotal",
                "dateField": "value",
                "valueFields": [{"name": "count", "title": "User Count Total", "primary": true}]
            },
            "chartType": "Timeline"
        }
    },
    "sessionCountTotalTimeline": {
        "id": "sessionCountTotalTimeline",
        "type": "timeline",
        "query": "sessionTotalTimeLine",
        "text": "Sessions Timeline",
        "icon": "fas fa-chart-line",
        "info": "<span class='text-decoration-underline'><b>Description:</b></span> Number of unique sessions displayed over time. ⚠️ WARNING ⚠️: If a user occurs between 11:49 pm to 0:10, we will consider these 2 different sessions. This simplifies the calculation by day. <br> <span class='text-decoration-underline'><b>Interpretation:</b></span>  An increase in the number of sessions over time indicates better adoption of the platform. <br> <span class='text-decoration-underline'><b>Calculation:</b></span>  Addition of all unique session-summary realized during a day over time.",
        "unique": true,
        "parameters": {
            "aggregationsTimeSeries": {
                "name": "SessionTotal",
                "dateField": "value",
                "valueFields": [{"name": "count", "title": "Session Count Total", "primary": true}]
            },
            "chartType": "Timeline"
        }
    },
    "clickBySearchTimeline": {
        "id": "clickBySearchTimeline",
        "type": "timeline",
        "query": "avgClicksBySearchTimeLine",
        "text": "Clicked Documents Per Search Summary Timeline (Avg)",
        "icon": "fas fa-chart-line",
        "info": "<span class='text-decoration-underline'><b>Description:</b></span> Average number of clicked documents per search summary displayed over time. <br> <span class='text-decoration-underline'><b>Interpretation:</b></span>  Relevance indicator. <br> <span class='text-decoration-underline'><b>Calculation:</b></span>  Average number of clicked documents per search summary",
        "unique": true,
        "parameters": {
            "aggregationsTimeSeries": {
                "name": "AvgClicksByQuery",
                "dateField": "value",
                "valueFields": [{"operatorResults": true, "name": "avg", "title": "Average Click By Search", "primary": true}]
            },
            "chartType": "Timeline"
        }
    },
    "mrrTimeline": {
        "id": "mrrTimeline",
        "type": "timeline",
        "query": "avgMRRTimeLine",
        "text": "Mean Reciprocal Rank (MRR) of Search Summary Timeline (Avg)",
        "icon": "fas fa-chart-line",
        "info": "<span class='text-decoration-underline'><b>Description:</b></span> Captures the rank of clicked document by users: <br> <ul> <li>first doc = 1</li> <li>second doc = 1/2</li> <li>third doc = 1/3</li><li>...</li></ul> and zero if there is no click. <br> <span class='text-decoration-underline'><b>Interpretation:</b></span>  Relevance indicator. <br> <span class='text-decoration-underline'><b>Calculation:</b></span>  Based on search summary. Average of all Mean Reciprocal Rank (MRR) events.",
        "unique": true,
        "parameters": {
            "aggregationsTimeSeries": {
                "name": "AvgMRR",
                "dateField": "value",
                "valueFields": [{"operatorResults": true, "name": "avg", "title": "Average MRR", "primary": true}]
            },
            "chartType": "Timeline"
        }
    },
    "searchBySessionTimeline": {
        "id": "searchBySessionTimeline",
        "type": "timeline",
        "query": "avgQueriesBySessionTimeLine",
        "text": "Full-Text Queries by Session Summary Timeline (Avg)",
        "icon": "fas fa-chart-line",
        "info": "<span class='text-decoration-underline'><b>Description:</b></span> Average number of Full-Text Queries per session displayed over time. <br> <span class='text-decoration-underline'><b>Interpretation:</b></span>  Adoption indicator. <br> <span class='text-decoration-underline'><b>Calculation:</b></span>  Addition of all Full-Text Queries DIVIDED BY Total number of Session Summary.",
        "unique": true,
        "parameters": {
            "aggregationsTimeSeries": {
                "name": "AvgQueriesBySession",
                "dateField": "value",
                "valueFields": [{"operatorResults": true, "name": "avg", "title": "Average Search By Session", "primary": true}]
            },
            "chartType": "Timeline"
        }
    },
    "sessionDurationTimeline": {
        "id": "sessionDurationTimeline",
        "type": "timeline",
        "query": "avgSessionDurationTimeLine",
        "text": "Session Duration (in sec) Timeline (Avg)",
        "icon": "fas fa-chart-line",
        "info": "<span class='text-decoration-underline'><b>Description:</b></span> The average session summary duration calculated in seconds. The duration corresponds to the time between the first and the last action of the same session. If there is one user event then the session duration will be 0. <br> <span class='text-decoration-underline'><b>Interpretation:</b></span>  Analysis of the time spent by a user by session. Relevance indicator. <br> <span class='text-decoration-underline'><b>Calculation:</b></span>  Addition of all durations event of session summary DIVIDED BY Total number of session summary.",
        "unique": true,
        "parameters": {
            "aggregationsTimeSeries": {
                "name": "AvgSessionDuration",
                "dateField": "value",
                "valueFields": [{"operatorResults": true, "name": "avg", "title": "Average Session Duration", "primary": true}]
            },
            "chartType": "Timeline"
        }
    },
    "clickTotalTimeline": {
        "id": "clickTotalTimeline",
        "type": "timeline",
        "query": "clickTotalTimeLine",
        "text": "Total Clicked Documents Timeline",
        "icon": "fas fa-chart-line",
        "info": "<span class='text-decoration-underline'><b>Description:</b></span> Total number of clicked documents displayed over time. <br> <span class='text-decoration-underline'><b>Interpretation:</b></span>  Indicator to be compared with other information (number of users, searches, etc.). Relevance indicator. <br> <span class='text-decoration-underline'><b>Calculation:</b></span>  Addition of all clicked documents",
        "unique": true,
        "parameters": {
            "aggregationsTimeSeries": {
                "name": "ClickTotal",
                "dateField": "value",
                "valueFields": [{"name": "count", "title": "Click Total", "primary": true}]
            },
            "chartType": "Timeline"
        }
    },
    "newUsersTimeline": {
        "id": "newUsersTimeline",
        "type": "timeline",
        "query": "newUsersTimeLine",
        "text": "New Users Timeline",
        "icon": "fas fa-chart-line",
        "info": "msg#widgets.newUsersTimeline.info",
        "unique": true,
        "parameters": {
            "aggregationsTimeSeries": {
                "name": "NewUsers",
                "dateField": "value",
                "valueFields": [{"name": "count", "title": "New Users", "primary": true}]
            },
            "chartType": "Timeline"
        }
    },
    "queryBounceTimeline": {
        "id": "queryBounceTimeline",
        "type": "timeline",
        "query": "queryBounceTimeLine",
        "text": "Bounce Timeline",
        "icon": "fas fa-chart-line",
        "info": "<span class='text-decoration-underline'><b>Description:</b></span> Number of bounces displayed over time. A bounce is when a user opens a document and quickly comes back (<10s). <br> <span class='text-decoration-underline'><b>Interpretation:</b></span>  This suggests that the result was irrelevant or incomplete. Relevance indicator. <br> <span class='text-decoration-underline'><b>Calculation:</b></span>  Addition of all bounce events calculated on search summary. A bounce is generated with clicked document events.",
        "unique": true,
        "parameters": {
            "aggregationsTimeSeries": {
                "name": "QueryBounce",
                "dateField": "value",
                "valueFields": [{"name": "count", "title": "Query Bounce", "primary": true}]
            },
            "chartType": "Timeline"
        }
    },
    "refinementTimeline": {
        "id": "refinementTimeline",
        "type": "timeline",
        "query": "queryRefineTimeLine",
        "text": "Refinement Timeline",
        "icon": "fas fa-chart-line",
        "info": "<span class='text-decoration-underline'><b>Description:</b></span> Number of search summaries where the user has refined displayed over time. <br> <span class='text-decoration-underline'><b>Interpretation:</b></span>  This suggests that relevance can be improved. Relevance indicator. <br> <span class='text-decoration-underline'><b>Calculation:</b></span>  Addition of all search summaries where there are search refinements.",
        "unique": true,
        "parameters": {
            "aggregationsTimeSeries": {
                "name": "QueryRefine",
                "dateField": "value",
                "valueFields": [{"name": "count", "title": "Refinement", "primary": true}]
            },
            "chartType": "Timeline"
        }
    },
    "zeroSearchTimeline": {
        "id": "zeroSearchTimeline",
        "type": "timeline",
        "query": "queryZeroTimeLine",
        "text": "Zero Result Search Timeline",
        "icon": "fas fa-chart-line",
        "info": "<span class='text-decoration-underline'><b>Description:</b></span> Number of full-text queries without any results displayed over time. <br> <span class='text-decoration-underline'><b>Interpretation:</b></span>  Relevance indicator. <br> <span class='text-decoration-underline'><b>Calculation:</b></span>  Addition of all fullt-text queries where resultcount=0.",
        "unique": true,
        "parameters": {
            "aggregationsTimeSeries": {
                "name": "QueryZero",
                "dateField": "value",
                "valueFields": [{"name": "count", "title": "Zero Search", "primary": true}]
            },
            "chartType": "Timeline"
        }
    },
    "searchExitTimeline": {
        "id": "searchExitTimeline",
        "type": "timeline",
        "query": "searchExitTimeLine",
        "text": "Search Summaries With Exit Timeline",
        "icon": "fas fa-chart-line",
        "info": "<span class='text-decoration-underline'><b>Description:</b></span> Number of search summaries where the user does nothing after viewing the results page displayed over time. <br> <span class='text-decoration-underline'><b>Interpretation:</b></span>  Suggests that a user does not consider the results provided to be relevant. Relevance indicator. <br> <span class='text-decoration-underline'><b>Calculation:</b></span>  Based on search summary. Addition of all search.exit.timeout and search.exit.logout result events.",
        "unique": true,
        "parameters": {
            "aggregationsTimeSeries": {
                "name": "SearchExit",
                "dateField": "value",
                "valueFields": [{"name": "count", "title": "Search Exit", "primary": true}]
            },
            "chartType": "Timeline"
        }
    },
    "queryCountPerUser": {
        "id": "queryCountPerUser",
        "type": "stat",
        "query": "queryTotal",
        "icon": "fas fa-balance-scale",
        "text": "Number of Full-Text queries per user (Avg)",
        "info": "<span class='text-decoration-underline'><b>Description:</b></span> Allows you to follow the adoption of the platform by monitoring usage over the concerned period. When a user conducts more and more Full-Text Queries, this suggests successful adoption. <br> <span class='text-decoration-underline'><b>Interpretation:</b></span>  Adoption indicator. <br> <span class='text-decoration-underline'><b>Calculation:</b></span>  Addition of all Full-Text Queries DIVIDED BY Total number of unique user-id.",
        "unique": true,
        "parameters": {
            "statLayout": "standard",
            "valueLocation": "totalrecordcount",
            "relatedQuery": "userCountTotal",
            "relatedValueLocation": "totalrecordcount",
            "computation": "percentage",
            "asc": true,
            "numberFormatOptions": {"style": "decimal", "maximumFractionDigits": 2}
        }
    },
    "topQueries": {
        "id": "topQueries",
        "type": "chart",
        "query": "topQueries",
        "icon": "fas fa-th-list",
        "text": "Top Full-text Queries",
        "info": "<span class='text-decoration-underline'><b>Description:</b></span> Most frequent full-text queries. <br> <span class='text-decoration-underline'><b>Interpretation:</b></span>  Understanding user searches enables levers to be activated to provide them with more relevant results. Relevance indicator. <br> <span class='text-decoration-underline'><b>Calculation:</b></span>  Distribution of the top 100 full-text queries",
        "unique": true,
        "parameters": {
            "chartData": {
                "aggregation": "query"
            },
            "chartType": "grid"
        }
    },
    "topNoResultsQueries": {
        "id": "topNoResultsQueries",
        "type": "chart",
        "query": "topNoResultQueries",
        "icon": "fas fa-th-list",
        "text": "Top No Result Full-text Queries",
        "info": "<span class='text-decoration-underline'><b>Description:</b></span> Most frequent full-text queries without any results. <br> <span class='text-decoration-underline'><b>Interpretation:</b></span>  Suggests action is needed to ensure that these searches return results. Relevance indicator. <br> <span class='text-decoration-underline'><b>Calculation:</b></span>  Distribution of the top 100 full-text queries that have a result-count=0",
        "unique": true,
        "parameters": {
            "chartData": {
                "aggregation": "query"
            },
            "chartType": "grid"
        }
    },
    "topSources": {
        "id": "topSources",
        "type": "chart",
        "query": "topSources",
        "icon": "fas fa-chart-pie",
        "text": "Top Sources",
        "info": "<span class='text-decoration-underline'><b>Description:</b></span> Sources where the most clicked documents are found. <br> <span class='text-decoration-underline'><b>Interpretation:</b></span>  May suggest review of the content-type weighting for the most clicked sources. Relevance indicator. <br> <span class='text-decoration-underline'><b>Calculation:</b></span>  Distribution of the 100 most frequent sources generated by clicked document events",
        "unique": true,
        "parameters": {
            "chartData": {
                "aggregation": "source"
            },
            "chartType": "Pie3D"
        }
    },
    "topCollections": {
        "id": "topCollections",
        "type": "chart",
        "query": "topCollections",
        "icon": "fas fa-chart-pie",
        "text": "Top Collections",
        "info": "<span class='text-decoration-underline'><b>Description:</b></span> Collections where most clicked documents are found. <br> <span class='text-decoration-underline'><b>Interpretation:</b></span>  May suggest review of the content-type weighting for the most clicked collections. Relevance indicator. <br> <span class='text-decoration-underline'><b>Calculation:</b></span>  Distribution of the 100 most frequent collections generated by clicked document events",
        "unique": true,
        "parameters": {
            "chartData": {
                "aggregation": "collection"
            },
            "chartType": "Pie3D"
        }
    },
    "topFacets": {
        "id": "topFacets",
        "type": "chart",
        "query": "topFacets",
        "icon": "fas fa-chart-pie",
        "text": "Most Used Facets",
        "info": "<span class='text-decoration-underline'><b>Description:</b></span> Most used facets. <br> <span class='text-decoration-underline'><b>Interpretation:</b></span>  Analysis of user behavior to identify actions to improve the relevance of search results. Relevance indicator. <br> <span class='text-decoration-underline'><b>Calculation:</b></span>  Distribution of the 100 most frequent facets (all events where itemboxes is not null).",
        "unique": true,
        "parameters": {
            "chartData": {
                "aggregation": "box"
            },
            "chartType": "Pie3D"
        }
    },
    "resultTypes": {
        "id": "resultTypes",
        "type": "chart",
        "query": "queryByResult",
        "icon": "fas fa-chart-pie",
        "text": "End Of A Search",
        "info": "<span class='text-decoration-underline'><b>Description:</b></span> Last event after a search: <br> <ul> <li>'search.exit.logout': User runs a full-text query and does not click on any document but instead logs out.</li> <li> 'search.exit.timeout': User runs a full-text query and does nothing before the timeout of the session.</li> <li> 'search.with.click': User runs a full-text query, can do refinement and then clicks on a document. </li><li> 'search.with.no.click': User runs a full-text query, can do refinement but doesn't click on a document.</li></ul> <span class='text-decoration-underline'><b>Interpretation:</b></span>  Relevance indicator. <br> <span class='text-decoration-underline'><b>Calculation:</b></span>  Distribution of values of “Results” event within search summary.",
        "unique": true,
        "parameters": {
            "chartData": {
                "aggregation": "result"
            },
            "chartType": "Pie3D"
        }
    },
    "userCountTotal": {
        "id": "userCountTotal",
        "type": "stat",
        "query": "userCountTotal",
        "icon": "fas fa-balance-scale",
        "text": "Total Unique Users",
        "info": "<span class='text-decoration-underline'><b>Description:</b></span> Number of unique user-ids logged in over time. <br> <span class='text-decoration-underline'><b>Interpretation:</b></span>  Adoption indicator. <br> <span class='text-decoration-underline'><b>Calculation:</b></span>  Addition of all unique user-ids based on session summary",
        "unique": true,
        "parameters": {
            "statLayout": "standard",
            "valueLocation": "totalrecordcount",
            "asc": true
        }
    },
    "sessionCountTotal": {
        "id": "sessionCountTotal",
        "type": "stat",
        "query": "sessionTotal",
        "icon": "fas fa-balance-scale",
        "text": "Sessions",
        "info": "<span class='text-decoration-underline'><b>Description:</b></span> Number of unique sessions displayed over time. WARNING: If a user session occurs between 11:49 pm and 00:10 am, we will consider these 2 different sessions. This simplifies the calculation by day. <br> <span class='text-decoration-underline'><b>Interpretation:</b></span>  Adoption indicator. <br> <span class='text-decoration-underline'><b>Calculation:</b></span>  Addition of all session summary",
        "unique": true,
        "parameters": {
            "statLayout": "standard",
            "valueLocation": "totalrecordcount",
            "asc": true
        }
    },
    "queryCountTotal": {
        "id": "queryCountTotal",
        "type": "stat",
        "query": "queryTotal",
        "icon": "fas fa-balance-scale",
        "text": "Full-text Queries",
        "info": "<span class='text-decoration-underline'><b>Description:</b></span> Number of all full-text queries. <br> <span class='text-decoration-underline'><b>Interpretation:</b></span>  Adoption indicator. <br> <span class='text-decoration-underline'><b>Calculation:</b></span>  Addition of all Full-Text Queries",
        "unique": true,
        "parameters": {
            "statLayout": "standard",
            "valueLocation": "totalrecordcount",
            "asc": true
        }
    },
    "sessionsByUser": {
        "id": "sessionsByUser",
        "type": "stat",
        "query": "sessionsByUser",
        "icon": "fas fa-balance-scale",
        "text": "Sessions Per User (Avg)",
        "info": "<span class='text-decoration-underline'><b>Description:</b></span> Average number of sessions per user. <br> <span class='text-decoration-underline'><b>Interpretation:</b></span>  Adoption indicator. <br> <span class='text-decoration-underline'><b>Calculation:</b></span>  Total number of session summary DIVIDED BY total number of unique user-ids",
        "unique": true,
        "parameters": {
            "statLayout": "standard",
            "valueLocation": "aggregations",
            "operation": "avg",
            "asc": true
        }
    },
    "searchBySession": {
        "id": "searchBySession",
        "type": "stat",
        "query": "avgQueriesBySession",
        "icon": "fas fa-balance-scale",
        "text": "Full-Text Queries Per Session Summary (Avg)",
        "info": "<span class='text-decoration-underline'><b>Description:</b></span> Average number of Full-Text Queries per session summary. <br> <span class='text-decoration-underline'><b>Interpretation:</b></span>  The more searches per session the greater the adoption. Adoption indicator. Be careful, if all the searches are linked, this may on the contrary demonstrate too many reformulations and therefore a problem of relevance of the results. Relevance indicator. <br> <span class='text-decoration-underline'><b>Calculation:</b></span>  Average of all Full-Text Queries within a session summary",
        "unique": true,
        "parameters": {
            "statLayout": "standard",
            "valueLocation": "records",
            "asc": true
        }
    },
    "clickBySearch": {
        "id": "clickBySearch",
        "type": "stat",
        "query": "avgClicksBySearch",
        "icon": "fas fa-balance-scale",
        "text": "Clicked Documents Per Search Summary (Avg)",
        "info": "<span class='text-decoration-underline'><b>Description:</b></span> Average number of clicked documents per search summary. <br> <span class='text-decoration-underline'><b>Interpretation:</b></span>  Clicking on several documents following a Full-Text Query may demonstrate a greater effort to access the expected result. Relevance indicator. It can also demonstrate that the user enjoys browsing the results (adoption indicator). <br> <span class='text-decoration-underline'><b>Calculation:</b></span>  Average of all clicked documents within a search summary",
        "unique": true,
        "parameters": {
            "statLayout": "standard",
            "valueLocation": "records",
            "asc": true
        }
    },
    "viewedDocPerSearch": {
        "id": "viewedDocPerSearch",
        "type": "stat",
        "query": "docViewsBySession",
        "icon": "fas fa-balance-scale",
        "text": "Clicked Documents Per Session (Avg)",
        "info": "<span class='text-decoration-underline'><b>Description:</b></span> Average number of clicked documents (Document Navigator) per session. <br> <span class='text-decoration-underline'><b>Interpretation:</b></span>  Seeing fewer documents during a search suggests that the answer may have been found in the first results. Relevance indicator. <br> <span class='text-decoration-underline'><b>Calculation:</b></span>  Addition of all clicked documents DIVIDED BY Total number of sessions",
        "unique": true,
        "parameters": {
            "statLayout": "standard",
            "valueLocation": "aggregations",
            "operation": "avg",
            "asc": true
        }
    },
    "sessionDuration": {
        "id": "sessionDuration",
        "type": "stat",
        "query": "avgSessionDuration",
        "icon": "fas fa-balance-scale",
        "text": "Session Duration (Avg in sec)",
        "info": "<span class='text-decoration-underline'><b>Description:</b></span> The average session duration calculated in seconds. A session starts when a user logs into the platform and ends when he logs out or a timeout occurs. <br> <span class='text-decoration-underline'><b>Interpretation:</b></span>  Analysis of the time spent by a user per session. Relevance Indicator. <br> <span class='text-decoration-underline'><b>Calculation:</b></span>  Average of all durations within a session summary",
        "unique": true,
        "parameters": {
            "statLayout": "standard",
            "valueLocation": "records",
            "asc": true
        }
    },
    "newUsers": {
        "id": "newUsers",
        "type": "stat",
        "query": "newUsers",
        "icon": "fas fa-balance-scale",
        "text": "New Users",
        "info": "<span class='text-decoration-underline'><b>Description:</b></span> Users that have logged in for the first time during the current period. <br> <span class='text-decoration-underline'><b>Interpretation:</b></span>  Adoption indicator. <br> <span class='text-decoration-underline'><b>Calculation:</b></span>  Total number of users who completed their first login on a later date than the start of the range. Based on session summary",
        "unique": true,
        "parameters": {
            "statLayout": "standard",
            "valueLocation": "totalrecordcount",
            "asc": true
        }
    },
    "newUsersRate": {
        "id": "newUsersRate",
        "type": "stat",
        "query": "newUsers",
        "icon": "fas fa-balance-scale",
        "text": "New Users Rate",
        "info": "<span class='text-decoration-underline'><b>Description:</b></span> Percentage of new users among all users. <br> <span class='text-decoration-underline'><b>Interpretation:</b></span>  Adoption indicator. <br> <span class='text-decoration-underline'><b>Calculation:</b></span>  Total number of new users DIVIDED BY Total number of unique users.",
        "unique": true,
        "parameters": {
            "statLayout": "standard",
            "valueLocation": "totalrecordcount",
            "relatedQuery": "userCountTotal",
            "relatedValueLocation": "totalrecordcount",
            "computation": "percentage",
            "asc": true,
            "numberFormatOptions": {"style": "percent", "maximumFractionDigits": 1}
        }
    },
    "activeUsers": {
        "id": "activeUsers",
        "type": "stat",
        "query": "activeUsers",
        "icon": "fas fa-balance-scale",
        "text": "Active Users",
        "info": "msg#widgets.activeUsers.info",
        "unique": true,
        "parameters": {
            "statLayout": "standard",
            "valueLocation": "totalrecordcount",
            "asc": true
        }
    },
    "activeUsersRate": {
        "id": "activeUsersRate",
        "type": "stat",
        "query": "activeUsers",
        "icon": "fas fa-balance-scale",
        "text": "Active Users Rate",
        "info": "msg#widgets.activeUsersRate.info",
        "unique": true,
        "parameters": {
            "statLayout": "standard",
            "valueLocation": "totalrecordcount",
            "relatedQuery": "userCountTotal",
            "relatedValueLocation": "totalrecordcount",
            "computation": "percentage",
            "asc": true,
            "numberFormatOptions": {"style": "percent", "maximumFractionDigits": 1}
        }
    },
    "userCoverage": {
        "id": "userCoverage",
        "type": "stat",
        "query": "activeUsers",
        "icon": "fas fa-balance-scale",
        "text": "User Coverage",
        "info": "msg#widgets.userCoverage.info",
        "unique": true,
        "parameters": {
            "statLayout": "standard",
            "valueLocation": "totalrecordcount",
            "relatedQuery": "totalUsers",
            "relatedValueLocation": "totalrecordcount",
            "computation": "percentage",
            "asc": true,
            "numberFormatOptions": {"style": "percent", "maximumFractionDigits": 2}
        }
    },
    "clickRank1AfterSearchRate": {
        "id": "clickRank1AfterSearchRate",
        "type": "stat",
        "query": "clickRank1AfterSearch",
        "icon": "fas fa-balance-scale",
        "text": "First Clicked Document Rate",
        "info": "<span class='text-decoration-underline'><b>Description:</b></span> Number of search summaries where the user clicks on the first document out of the total number of search summaries. <br> <span class='text-decoration-underline'><b>Interpretation:</b></span>  Search results may be considered relevant when there are a maximum number of clicks on the first document. Relevance indicator. <br> <span class='text-decoration-underline'><b>Calculation:</b></span>  Total number of search summaries where there are clicks of rank = 0 DIVIDED BY Total number of search summaries",
        "unique": true,
        "parameters": {
            "statLayout": "standard",
            "valueLocation": "totalrecordcount",
            "relatedQuery": "searchSummaryTotal",
            "relatedValueLocation": "totalrecordcount",
            "computation": "percentage",
            "asc": true,
            "numberFormatOptions": {"style": "percent", "maximumFractionDigits": 1}
        }
    },
    "clickRank1AfterSearchTimeline": {
        "id": "clickRank1AfterSearchTimeline",
        "type": "timeline",
        "query": "clickRank1AfterSearchTimeline",
        "text": "First Clicked Document Timeline",
        "icon": "fas fa-chart-line",
        "info": "<span class='text-decoration-underline'><b>Description:</b></span> Number of search summaries where the user clicks on the first document displayed over time. <br> <span class='text-decoration-underline'><b>Interpretation:</b></span>  Search results may be considered relevant when there are a maximum number of clicks on the first document. Relevance indicator. <br> <span class='text-decoration-underline'><b>Calculation:</b></span>  Addition of all search.summary where there are clicks of rank = 1.",
        "unique": true,
        "parameters": {
            "aggregationsTimeSeries": {
                "name": "ClickRank1Timeline",
                "dateField": "value",
                "valueFields": [{"name": "count", "title": "First Click", "primary": true}]
            },
            "chartType": "Timeline"
        }
    },
    "clickRank3AfterSearchRate": {
        "id": "clickRank3AfterSearchRate",
        "type": "stat",
        "query": "clickRank3AfterSearch",
        "icon": "fas fa-balance-scale",
        "text": "First Three Clicked Documents Rate",
        "info": "<span class='text-decoration-underline'><b>Description:</b></span> Number of search summaries where the user clicks on the first three documents out of the total number of search summaries. <br> <span class='text-decoration-underline'><b>Interpretation:</b></span>  Search results may be considered relevant when there are a maximum number of clicks on the first three documents. Relevance indicator. <br> <span class='text-decoration-underline'><b>Calculation:</b></span>  Total number of search.summary where there are clicks of rank = (0,1,2) DIVIDED BY Total number of search summaries",
        "unique": true,
        "parameters": {
            "valueLocation": "totalrecordcount",
            "relatedQuery": "searchSummaryTotal",
            "relatedValueLocation": "totalrecordcount",
            "computation": "percentage",
            "statLayout": "standard",
            "asc": true,
            "numberFormatOptions": {"style": "percent", "maximumFractionDigits": 1}
        }
    },
    "clickRank3AfterSearchTimeline": {
        "id": "clickRank3AfterSearchTimeline",
        "type": "timeline",
        "query": "clickRank3AfterSearchTimeline",
        "text": "First Three Clicked Documents Timeline",
        "icon": "fas fa-chart-line",
        "info": "<span class='text-decoration-underline'><b>Description:</b></span> Number of search summaries where the user clicks on the first three document displayed over time. <br> <span class='text-decoration-underline'><b>Interpretation:</b></span>  Search summaries results may be considered relevant when there are a maximum number of clicks on the first three documents. Relevance indicator. <br> <span class='text-decoration-underline'><b>Calculation:</b></span>  Addition of all search summaries where there are clicks of rank = (0,1,2).",
        "unique": true,
        "parameters": {
            "aggregationsTimeSeries": {
                "name": "ClickRank3Timeline",
                "dateField": "value",
                "valueFields": [{"name": "count", "title": "First Three Documents Clicked Timeline", "primary": true}]
            },
            "chartType": "Timeline"
        }
    },
    "clickAfterSearch": {
        "id": "clickAfterSearch",
        "type": "stat",
        "query": "clickAfterSearch",
        "icon": "fas fa-balance-scale",
        "text": "Search Summaries With Clicks",
        "info": "<span class='text-decoration-underline'><b>Description:</b></span> Total number of search summaries where the user has clicked on a document at least once. <br> <span class='text-decoration-underline'><b>Interpretation:</b></span>  Measures the likely success of a search. Relevance indicator. <br> <span class='text-decoration-underline'><b>Calculation:</b></span>  Total number of search summaries where there are at least one clicked documents",
        "unique": true,
        "parameters": {
            "statLayout": "standard",
            "valueLocation": "totalrecordcount",
            "asc": true
        }
    },
    "clickAfterSearchRate": {
        "id": "clickAfterSearchRate",
        "type": "stat",
        "query": "clickAfterSearch",
        "icon": "fas fa-balance-scale",
        "text": "Search Summaries With Click(s) Rate",
        "info": "<span class='text-decoration-underline'><b>Description:</b></span> Number of search summaries where the user clicks at least on one document out of the total number of search summaries. <br> <span class='text-decoration-underline'><b>Interpretation:</b></span>  Measures the likely success of a search. Relevance indicator. <br> <span class='text-decoration-underline'><b>Calculation:</b></span>  Total number of search summaries where there are at least one clicked document DIVIDED BY Total number of search summaries",
        "unique": true,
        "parameters": {
            "valueLocation": "totalrecordcount",
            "relatedQuery": "searchSummaryTotal",
            "relatedValueLocation": "totalrecordcount",
            "computation": "percentage",
            "statLayout": "standard",
            "asc": true,
            "numberFormatOptions": {"style": "percent", "maximumFractionDigits": 1}
        }
    },
    "clickAfterSearchTimeline": {
        "id": "clickAfterSearchTimeline",
        "type": "timeline",
        "query": "clickAfterSearchTimeline",
        "text": "Search Summaries With Click(s) Timeline",
        "icon": "fas fa-chart-line",
        "info": "<span class='text-decoration-underline'><b>Description:</b></span> Number of search summaries where the user clicks at least on one document displayed over time. <br> <span class='text-decoration-underline'><b>Interpretation:</b></span>  Measures the likely success of a search. Relevance indicator. <br> <span class='text-decoration-underline'><b>Calculation:</b></span>  Addition of all search summaries where there are at least one click.",
        "unique": true,
        "parameters": {
            "aggregationsTimeSeries": {
                "name": "ClickTimeline",
                "dateField": "value",
                "valueFields": [{"name": "count", "title": "Search With Clicks Timeline", "primary": true}]
            },
            "chartType": "Timeline"
        }
    },
    "mrr": {
        "id": "mrr",
        "type": "stat",
        "query": "avgMRR",
        "icon": "fas fa-balance-scale",
        "text": "Mean Reciprocal Rank (MRR)",
        "info": "<span class='text-decoration-underline'><b>Description:</b></span> Captures the rank of a clicked document by users displayed over time: first doc = 1, second doc = 1/2, third doc = 1/3...  and zero if there is no click. <br> <span class='text-decoration-underline'><b>Interpretation:</b></span>  Evaluation of the relevance of the results page. MRR = 1 is the best. Relevance indicator. <br> <span class='text-decoration-underline'><b>Calculation:</b></span>  Based on search summary. Average of all Mean Reciprocal Rank (MRR) events.",
        "unique": true,
        "parameters": {
            "statLayout": "standard",
            "valueLocation": "records",
            "asc": true,
            "numberFormatOptions": {"style": "decimal", "maximumFractionDigits": 2}
        }
    },
    "refinement": {
        "id": "refinement",
        "type": "stat",
        "query": "queryRefine",
        "icon": "fas fa-balance-scale",
        "text": "Refinement",
        "info": "<span class='text-decoration-underline'><b>Description:</b></span> Total number of search summaries where the user has refined the search. <br> <span class='text-decoration-underline'><b>Interpretation:</b></span>  After a search, the user must refine the results before clicking on a document. This demonstrates that relevance can be improved. Relevance indicator. <br> <span class='text-decoration-underline'><b>Calculation:</b></span>  Addition of all search summaries where there are searchrefinements",
        "unique": true,
        "parameters": {
            "valueLocation": "totalrecordcount",
            "statLayout": "standard",
            "asc": true
        }
    },
    "refinementRate": {
        "id": "refinementRate",
        "type": "stat",
        "query": "queryRefine",
        "icon": "fas fa-balance-scale",
        "text": "Refinement Rate",
        "info": "<span class='text-decoration-underline'><b>Description:</b></span> Number of search summaries where the user has refined the search compared to the total number of search summaries. <br> <span class='text-decoration-underline'><b>Interpretation:</b></span>  After a search, the user must refine the results before clicking on a document. This demonstrates that relevance can be improved. Relevance indicator. <br> <span class='text-decoration-underline'><b>Calculation:</b></span>  Addition of all search summaries where there are searchrefinements DIVIDED BY Total number of search summaries",
        "unique": true,
        "parameters": {
            "valueLocation": "totalrecordcount",
            "relatedQuery": "searchSummaryTotal",
            "relatedValueLocation": "totalrecordcount",
            "computation": "percentage",
            "statLayout": "standard",
            "asc": true,
            "numberFormatOptions": {"style": "percent", "maximumFractionDigits": 2}
        }
    },
    "zeroSearch": {
        "id": "zeroSearch",
        "type": "stat",
        "query": "queryZero",
        "icon": "fas fa-balance-scale",
        "text": "Zero Result Search",
        "info": "<span class='text-decoration-underline'><b>Description:</b></span> Total number of Full-Text Queries without any results. <br> <span class='text-decoration-underline'><b>Interpretation:</b></span>  Detects that the Full-Text Query does not provide results in order to suggest solutions to solve this problem. Relevance indicator. <br> <span class='text-decoration-underline'><b>Calculation:</b></span>  Addition of all Full-Text Queries where resultcount=0",
        "unique": true,
        "parameters": {
            "valueLocation": "totalrecordcount",
            "statLayout": "standard",
            "asc": false
        }
    },
    "zeroSearchRate": {
        "id": "zeroSearchRate",
        "type": "stat",
        "query": "queryZero",
        "icon": "fas fa-balance-scale",
        "text": "Zero Result Search Rate",
        "info": "<span class='text-decoration-underline'><b>Description:</b></span> Number of Full-Text Queries without any results compared to the total number of queries. <br> <span class='text-decoration-underline'><b>Interpretation:</b></span>  Relevance indicator. <br> <span class='text-decoration-underline'><b>Calculation:</b></span>  Total number of Full-Text Queries where resultcount=0 DIVIDED BY Total number of Full-Text Queries",
        "unique": true,
        "parameters": {
            "valueLocation": "totalrecordcount",
            "relatedQuery": "queryTotal",
            "relatedValueLocation": "totalrecordcount",
            "computation": "percentage",
            "statLayout": "standard",
            "asc": false,
            "numberFormatOptions": {"style": "percent", "maximumFractionDigits": 2}
        }
    },
    "searchExit": {
        "id": "searchExit",
        "type": "stat",
        "query": "searchExit",
        "icon": "fas fa-balance-scale",
        "text": "Search Summaries With Exit",
        "info": "<span class='text-decoration-underline'><b>Description:</b></span> Total number of search summaries where the user does nothing after viewing the results page. <br> <span class='text-decoration-underline'><b>Interpretation:</b></span>  If the user does a search and then does not act, this may demonstrate that he does not consider the results provided to be relevant. Relevance indicator. <br> <span class='text-decoration-underline'><b>Calculation:</b></span>  Addition of all search summaries where the result event values is search.exit.timeout or search.exit.logout",
        "unique": true,
        "parameters": {
            "statLayout": "standard",
            "valueLocation": "totalrecordcount",
            "asc": false
        }
    },
    "searchExitRate": {
        "id": "searchExitRate",
        "type": "stat",
        "query": "searchExit",
        "icon": "fas fa-balance-scale",
        "text": "Search Summaries With Exit Rate",
        "info": "<span class='text-decoration-underline'><b>Description:</b></span> Number of search summaries where the user does nothing after viewing the results page compared to the total number of search summaries. <br> <span class='text-decoration-underline'><b>Interpretation:</b></span>  If the user does a full-text query and then does not act, this may demonstrate that he does not consider the results provided to be relevant. Relevance indicator. <br> <span class='text-decoration-underline'><b>Calculation:</b></span>  Total number of search exits (timeout and logout) DIVIDED BY Total number of search summaries.",
        "unique": true,
        "parameters": {
            "valueLocation": "totalrecordcount",
            "relatedQuery": "searchSummaryTotal",
            "relatedValueLocation": "totalrecordcount",
            "computation": "percentage",
            "statLayout": "standard",
            "asc": false,
            "numberFormatOptions": {"style": "percent", "maximumFractionDigits": 1}
        }
    },
    "queryBounce": {
        "id": "queryBounce",
        "type": "stat",
        "query": "queryBounce",
        "icon": "fas fa-balance-scale",
        "text": "Bounce",
        "info": "<span class='text-decoration-underline'><b>Description:</b></span> Total number of bounces. <br> <span class='text-decoration-underline'><b>Interpretation:</b></span>  This suggests that the result was irrelevant or incomplete. Relevance indicator. <br> <span class='text-decoration-underline'><b>Calculation:</b></span>  Addition of all bounce events",
        "unique": true,
        "parameters": {
            "valueLocation": "totalrecordcount",
            "statLayout": "standard",
            "asc": true,
            "numberFormatOptions": {"style": "decimal", "maximumFractionDigits": 2}
        }
    },
    "queryBounceRate": {
        "id": "queryBounceRate",
        "type": "stat",
        "query": "queryBounce",
        "icon": "fas fa-balance-scale",
        "text": "Bounce Per Search Summary",
        "info": "<span class='text-decoration-underline'><b>Description:</b></span> Number of bounces compared to the total number of search summaries. <br> <span class='text-decoration-underline'><b>Interpretation:</b></span>  This suggests that the result was likely irrelevant or incomplete. Relevance indicator. <br> <span class='text-decoration-underline'><b>Calculation:</b></span> Percentage of total bounces among the total number of search summaries.",
        "unique": true,
        "parameters": {
            "valueLocation": "totalrecordcount",
            "relatedQuery": "searchSummaryTotal",
            "relatedValueLocation": "totalrecordcount",
            "computation": "percentage",
            "statLayout": "standard",
            "asc": true,
            "numberFormatOptions": {"style": "percent", "maximumFractionDigits": 2}
        }
    },
    "userFeedbackGrid": {
        "id": "userFeedbackGrid",
        "type": "grid",
        "query": "userFeedback",
        "text": "User Feedback",
        "icon": "fas fa-th-list",
        "info": "<span class='text-decoration-underline'><b>Description:</b></span> User messages sent via the Feedback widget",
        "unique": true,
        "parameters": {
            "columns": [
                {
                    "field": "app",
                    "headerName": "Appl",
                    "filterType": "text",
                    "formatterType": "text"
                },
                {
                    "field": "message",
                    "headerName": "Message",
                    "filterType": "text",
                    "formatterType": "text"
                },
                {
                    "field": "detail",
                    "headerName": "Detail",
                    "filterType": "text",
                    "formatterType": "text",
                    "multiLineCell": true
                }
            ],
            "showTooltip": true
        }
    }

};

/** Dashboards */
export const  STANDARD_DASHBOARDS: {name: string, items: {item: string, position: DashboardItemPosition}[]}[] = [
    {
        "name": "Users",
        "items": [
            { "item": "userCountTotalTimeline", "position": { "x": 0, "y": 0, "rows": 4, "cols": 4 } },
            { "item": "newUsersTimeline", "position": { "x": 4, "y": 0, "rows": 4, "cols": 4 } },
            { "item": "userCoverage", "position": { "x": 0, "y": 4, "rows": 2, "cols": 2 } },
            { "item": "userCountTotal", "position": { "x": 2, "y": 4, "rows": 2, "cols": 2 } },
            { "item": "newUsers", "position": { "x": 4, "y": 4, "rows": 2, "cols": 2 } },
            { "item": "newUsersRate", "position": { "x": 4, "y": 6, "rows": 2, "cols": 2 } },
            { "item": "activeUsers", "position": { "x": 6, "y": 4, "rows": 2, "cols": 2 } },
            { "item": "activeUsersRate", "position": { "x": 6, "y": 6, "rows": 2, "cols": 2 } }
        ]
    },
    {
        "name": "Users Activities",
        "items": [
            { "item": "usersActivitiesTimeline", "position": { "x": 0, "y": 0, "rows": 4, "cols": 3 } },
            { "item": "sessionCountTotal", "position": { "x": 3, "y": 0, "rows": 2, "cols": 2 } },
            { "item": "searchBySession", "position": { "x": 5, "y": 6, "rows": 2, "cols": 3 } },
            { "item": "searchBySessionTimeline", "position": { "x": 5, "y": 2, "rows": 4, "cols": 3 } },
            { "item": "clickBySearch", "position": { "x": 3, "y": 8, "rows": 2, "cols": 2 } },
            { "item": "sessionDuration", "position": { "x": 3, "y": 4, "rows": 2, "cols": 2 } },
            { "item": "queryCountTotal", "position": { "x": 5, "y": 0, "rows": 2, "cols": 3 } },
            { "item": "sessionsByUser", "position": { "x": 3, "y": 2, "rows": 2, "cols": 2 } },
            { "item": "userCountTotalTimeline", "position": { "x": 0, "y": 4, "rows": 4, "cols": 3 } },
            { "item": "viewedDocPerSearch", "position": { "x": 3, "y": 6, "rows": 2, "cols": 2 } }
        ]
    },
    {
        "name": "Features Usage",
        "items": [
            { "item": "topCollections", "position": { "x": 0, "y": 0, "rows": 8, "cols": 3 } },
            { "item": "topSources", "position": { "x": 3, "y": 0, "rows": 8, "cols": 3 } },
            { "item": "topFacets", "position": { "x": 6, "y": 0, "rows": 8, "cols": 2 } }
        ]
    },
    {
        "name": "Queries",
        "items": [
            { "item": "topQueries", "position": { "x": 0, "y": 0, "rows": 5, "cols": 4 } },
            { "item": "topNoResultsQueries", "position": { "x": 4, "y": 0, "rows": 5, "cols": 4 } },
            { "item": "queryCountTotalTimeline", "position": { "x": 0, "y": 5, "rows": 3, "cols": 3 } },
            { "item": "queryCountTotal", "position": { "x": 3, "y": 5, "rows": 3, "cols": 1 } },
            { "item": "zeroSearchTimeline", "position": { "x": 4, "y": 5, "rows": 3, "cols": 2 } },
            { "item": "zeroSearch", "position": { "x": 6, "y": 5, "rows": 3, "cols": 1 } },
            { "item": "zeroSearchRate", "position": { "x": 7, "y": 5, "rows": 3, "cols": 1 } }
        ]
    },
    {
        "name": "Results",
        "items": [
            { "item": "mrrTimeline", "position": { "x": 0, "y": 0, "rows": 6, "cols": 3 } },
            { "item": "mrr", "position": { "x": 0, "y": 6, "rows": 2, "cols": 2 } },
            { "item": "resultTypes", "position": { "x": 5, "y": 0, "rows": 4, "cols": 3 } },
            { "item": "clickRank1AfterSearchRate", "position": { "x": 3, "y": 0, "rows": 2, "cols": 2 } },
            { "item": "clickRank3AfterSearchRate", "position": { "x": 3, "y": 2, "rows": 2, "cols": 2 } },
            { "item": "clickAfterSearchRate", "position": { "x": 6, "y": 4, "rows": 2, "cols": 2 } },
            { "item": "searchExitRate", "position": { "x": 6, "y": 6, "rows": 2, "cols": 2 } },
            { "item": "queryBounceRate", "position": { "x": 6, "y": 8, "rows": 2, "cols": 2 } },
            { "item": "refinementRate", "position": { "x": 0, "y": 8, "rows": 2, "cols": 2 } },
            { "item": "clickBySearch", "position": { "x": 3, "y": 4, "rows": 2, "cols": 3 } },
            { "item": "clickBySearchTimeline", "position": { "x": 2, "y": 6, "rows": 4, "cols": 4 } }
        ]
    },
    {
        "name": "Feedback",
        "items": [
            { "item": "userFeedbackGrid", "position": { "x": 0, "y": 0, "rows": 8, "cols": 8 } }
        ]
    }
]

/** Palette */
export const PALETTE: {name: string, items: string[]}[] = [
    {
        "name": "Search",
        "items": [
            "clickBySearchTimeline",
            "mrrTimeline",
            "searchExitTimeline",
            "clickBySearch",
            "clickAfterSearch",
            "clickAfterSearchRate",
            "clickAfterSearchTimeline",
            "searchExit",
            "searchExitRate",
            "queryBounceRate",
            "searchCountTotalTimeline",
            "searchCountTotal",
            "clickRank1AfterSearchRate",
            "clickTotalTimeline",
            "topSources",
            "topCollections",
            "clickRank1AfterSearchTimeline",
            "clickRank3AfterSearchRate",
            "clickRank3AfterSearchTimeline",
            "mrr",
            "queryBounceTimeline",
            "queryBounce",
            "refinementTimeline",
            "topFacets",
            "refinement",
            "refinementRate"
        ]
    },
    {
        "name": "Session",
        "items": [
            "sessionCountTotalTimeline",
            "searchBySessionTimeline",
            "sessionDurationTimeline",
            "sessionCountTotal",
            "searchBySession",
            "viewedDocPerSearch",
            "sessionDuration"
        ]
    },
    {
        "name": "Query",
        "items": [
            "queryCountTotalTimeline",
            "queryCountPerUser",
            "topQueries",
            "topNoResultsQueries",
            "queryCountTotal",
            "zeroSearchTimeline",
            "zeroSearch",
            "zeroSearchRate",
            "resultTypes"
        ]
    },
    {
        "name": "User",
        "items": [
            "usersRepartition",
            "userCountTotalTimeline",
            "newUsersTimeline",
            "userCountTotal",
            "sessionsByUser",
            "newUsers",
            "newUsersRate",
            "activeUsers",
            "activeUsersRate",
            "userCoverage",
            "usersActivitiesTimeline",
            "userFeedbackGrid"
        ]
    }
]

/** Help page repo */
export const HELP_DEFAULT_FOLDER_OPTIONS: HelpFolderOptions = {
    folder: 'usage-analytics',
    path: '/r/_sinequa/webpackages/help',
    indexFile: 'olh-index.html',
    useLocale: false,
    useLocaleAsPrefix: false
}
