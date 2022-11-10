import { FacetConfig, FacetListParams } from "@sinequa/components/facet";
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
export const mono_scope_queries: string[] = ["newUsersTimeLine", "newUsers"];

/** Filters */
export const FACETS: FacetConfig<FacetListParams>[] = [
    {
        name: "SBA",
        title: "SBA",
        type: "list",
        icon: "fas fa-globe-americas",
        parameters: {
            aggregation: "sba",
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
        type: "list",
        icon: "fas fa-building",
        parameters: {
            aggregation: "profile",
            showCount: true,
            searchable: false,
            allowExclude: true,
            allowOr: true,
            allowAnd: false,
            displayEmptyDistributionIntervals: false
        }
    }
];

/** Widgets */
export const WIDGETS: {[key: string]: DashboardItemOption} = {
    "queryCountTotalTimeline": {
        "type": "timeline",
        "query": "queryTotalTimeLine",
        "text": "Full-text Queries Timeline",
        "icon": "fas fa-chart-line",
        "info": "&lt;span class='text-decoration-underline'&gt;&lt;b&gt;Description:&lt;/b&gt;&lt;/span&gt; Number of full-text queries over time.&lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Interpretation:&lt;/b&gt;&lt;/span&gt; An increase in the number of full-text queries over time is an indicator of platform adoption.&lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Calculation:&lt;/b&gt;&lt;/span&gt; Addition of all Full-text Queries",
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
        "type": "timeline",
        "query": "userCountTotalTimeLine",
        "text": "Total Unique Users Timeline",
        "icon": "fas fa-chart-line",
        "info": "&lt;span class='text-decoration-underline'&gt;&lt;b&gt;Description:&lt;/b&gt;&lt;/span&gt; Number of unique user-ids logged per day in over time. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Interpretation:&lt;/b&gt;&lt;/span&gt;  Adoption indicator. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Calculation:&lt;/b&gt;&lt;/span&gt;  Based on session-summary. Addition of all unique user-ids who did sessions during the day.",
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
        "type": "timeline",
        "query": "sessionTotalTimeLine",
        "text": "Sessions Timeline",
        "icon": "fas fa-chart-line",
        "info": "&lt;span class='text-decoration-underline'&gt;&lt;b&gt;Description:&lt;/b&gt;&lt;/span&gt; Number of unique sessions displayed over time. ⚠️ WARNING ⚠️: If a user occurs between 11:49 pm to 0:10, we will consider these 2 different sessions. This simplifies the calculation by day. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Interpretation:&lt;/b&gt;&lt;/span&gt;  An increase in the number of sessions over time indicates better adoption of the platform. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Calculation:&lt;/b&gt;&lt;/span&gt;  Addition of all unique session-summary realized during a day over time.",
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
        "type": "timeline",
        "query": "avgClicksBySearchTimeLine",
        "text": "Average Document Clicks By Search-Summary",
        "icon": "fas fa-chart-line",
        "info": "&lt;span class='text-decoration-underline'&gt;&lt;b&gt;Description:&lt;/b&gt;&lt;/span&gt; Average number of clicked documents by search summary displayed over time. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Interpretation:&lt;/b&gt;&lt;/span&gt;  Relevance indicator. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Calculation:&lt;/b&gt;&lt;/span&gt;  Average number of clicked documents by search summary",
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

    "avgEngineResponseTimeline": {
        "type": "timeline",
        "query": "engineResponseTimeTimeLine",
        "text": "Average Engine Response Timeline",
        "icon": "fas fa-chart-line",
        "info": "&lt;span class='text-decoration-underline'&gt;&lt;b&gt;Description:&lt;/b&gt;&lt;/span&gt; Average engine response time (in ms) displayed over time. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Interpretation:&lt;/b&gt;&lt;/span&gt;  Performance indicator. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Calculation:&lt;/b&gt;&lt;/span&gt;  Average of all durationExecution filtered on full-text queries.",
        "unique": true,
        "parameters": {
            "aggregationsTimeSeries": {
                "name": "EngineResponseTime",
                "dateField": "value",
                "valueFields": [{"operatorResults": true, "name": "avg", "title": "Average Engine Response", "primary": true}]
            },
            "chartType": "Timeline"
        }
    },

    "maxEngineResponseTimeline": {
        "type": "timeline",
        "query": "engineResponseTimeTimeLine",
        "text": "Maximum Engine Response Timeline",
        "icon": "fas fa-chart-line",
        "info": "&lt;span class='text-decoration-underline'&gt;&lt;b&gt;Description:&lt;/b&gt;&lt;/span&gt; Maximum engine response time (in ms) displayed over time. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Interpretation:&lt;/b&gt;&lt;/span&gt;  Performance indicator. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Calculation:&lt;/b&gt;&lt;/span&gt;  Maximum value of all durationExecution filtered on refinement events",
        "unique": true,
        "parameters": {
            "aggregationsTimeSeries": {
                "name": "EngineResponseTime",
                "dateField": "value",
                "valueFields": [{"operatorResults": true, "name": "max", "title": "Maximum Engine Response", "primary": true}]
            },
            "chartType": "Timeline"
        }
    },

    "mrrTimeline": {
        "type": "timeline",
        "query": "avgMRRTimeLine",
        "text": "Average Mean Reciprocal Rank (MRR) of Search Summary Timeline",
        "icon": "fas fa-chart-line",
        "info": "&lt;span class='text-decoration-underline'&gt;&lt;b&gt;Description:&lt;/b&gt;&lt;/span&gt; Captures the rank of clicked document by users: &lt;br&gt; &lt;ul&gt; &lt;li&gt;first doc = 1&lt;/li&gt; &lt;li&gt;second doc = 1/2&lt;/li&gt; &lt;li&gt;third doc = 1/3&lt;/li&gt;&lt;li&gt;...&lt;/li&gt;&lt;/ul&gt; and zero if there is no click. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Interpretation:&lt;/b&gt;&lt;/span&gt;  Relevance indicator. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Calculation:&lt;/b&gt;&lt;/span&gt;  Based on search-summary. Average of all Mean Reciprocal Rank (MRR) events.",
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
        "type": "timeline",
        "query": "avgQueriesBySessionTimeLine",
        "text": "Average Full-Text Queries by Session Summary Timeline",
        "icon": "fas fa-chart-line",
        "info": "&lt;span class='text-decoration-underline'&gt;&lt;b&gt;Description:&lt;/b&gt;&lt;/span&gt; Average number of Full-Text Queries per session displayed over time. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Interpretation:&lt;/b&gt;&lt;/span&gt;  Adoption indicator. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Calculation:&lt;/b&gt;&lt;/span&gt;  Addition of all Full-Text Queries DIVIDED BY Total number of Session Summary.",
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

    "avgResponseTimeTimeline": {
        "type": "timeline",
        "query": "responseTimeTimeLine",
        "text": "Average Web App Response Timeline",
        "icon": "fas fa-chart-line",
        "info": "&lt;span class='text-decoration-underline'&gt;&lt;b&gt;Description:&lt;/b&gt;&lt;/span&gt; Average WebApp Response time (in ms) incl. platform &amp; engine displayed over time. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Interpretation:&lt;/b&gt;&lt;/span&gt;  Performance indicator. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Calculation:&lt;/b&gt;&lt;/span&gt;  Average of all duration event filtered on Full-Text Queries.",
        "unique": true,
        "parameters": {
            "aggregationsTimeSeries": {
                "name": "ResponseTime",
                "dateField": "value",
                "valueFields": [{"operatorResults": true, "name": "avg", "title": "Average Response Time", "primary": true}]
            },
            "chartType": "Timeline"
        }
    },

    "maxResponseTimeTimeline": {
        "type": "timeline",
        "query": "responseTimeTimeLine",
        "text": "Maximum Web App Response Time Timeline",
        "icon": "fas fa-chart-line",
        "info": "&lt;span class='text-decoration-underline'&gt;&lt;b&gt;Description:&lt;/b&gt;&lt;/span&gt; Maximum Web App Response time (in ms) incl. platform &amp; engine displayed over time. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Interpretation:&lt;/b&gt;&lt;/span&gt;  Performance indicator. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Calculation:&lt;/b&gt;&lt;/span&gt;  Maximum value of durations events filtered on full-text queries.",
        "unique": true,
        "parameters": {
            "aggregationsTimeSeries": {
                "name": "ResponseTime",
                "dateField": "value",
                "valueFields": [
                    {"operatorResults": true, "name": "max", "title": "Maximum Response Time", "primary": true}
                ]
            },
            "chartType": "Timeline"
        }
    },

    "sessionDurationTimeline": {
        "type": "timeline",
        "query": "avgSessionDurationTimeLine",
        "text": "Average Session Duration (in sec) Timeline",
        "icon": "fas fa-chart-line",
        "info": "&lt;span class='text-decoration-underline'&gt;&lt;b&gt;Description:&lt;/b&gt;&lt;/span&gt; The average session summary duration calculated in seconds. The duration corresponds to the time between the first and the last action of the same session. If there is one user event then the session duration will be 0. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Interpretation:&lt;/b&gt;&lt;/span&gt;  Analysis of the time spent by a user to find a relevant result. Relevance indicator. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Calculation:&lt;/b&gt;&lt;/span&gt;  Addition of all durations event of session summary DIVIDED BY Total number of session summary.",
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
        "type": "timeline",
        "query": "clickTotalTimeLine",
        "text": "Total Documents Clicked Timeline",
        "icon": "fas fa-chart-line",
        "info": "&lt;span class='text-decoration-underline'&gt;&lt;b&gt;Description:&lt;/b&gt;&lt;/span&gt; Total number of clicked documents displayed over time. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Interpretation:&lt;/b&gt;&lt;/span&gt;  Indicator to be compared with other information (number of users, searches, etc.). Relevance indicator. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Calculation:&lt;/b&gt;&lt;/span&gt;  Addition of all clicked documents",
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
        "type": "timeline",
        "query": "queryBounceTimeLine",
        "text": "Bounce Timeline",
        "icon": "fas fa-chart-line",
        "info": "&lt;span class='text-decoration-underline'&gt;&lt;b&gt;Description:&lt;/b&gt;&lt;/span&gt; Number of bounces displayed over time. A bounce is when a user opens a document and quickly comes back (&lt;10s). &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Interpretation:&lt;/b&gt;&lt;/span&gt;  This suggests that the result was irrelevant or incomplete. Relevance indicator. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Calculation:&lt;/b&gt;&lt;/span&gt;  Addition of all bounce events calculated on search summary. A bounce is generated with clicked document events.",
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
        "type": "timeline",
        "query": "queryRefineTimeLine",
        "text": "Refinement Timeline",
        "icon": "fas fa-chart-line",
        "info": "&lt;span class='text-decoration-underline'&gt;&lt;b&gt;Description:&lt;/b&gt;&lt;/span&gt; Number of search summary where the user has refined displayed over time. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Interpretation:&lt;/b&gt;&lt;/span&gt;  This suggests that relevance can be improved. Relevance indicator. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Calculation:&lt;/b&gt;&lt;/span&gt;  Addition of all search summary where there are searchrefinements.",
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
        "type": "timeline",
        "query": "queryZeroTimeLine",
        "text": "Zero Result Search Timeline",
        "icon": "fas fa-chart-line",
        "info": "&lt;span class='text-decoration-underline'&gt;&lt;b&gt;Description:&lt;/b&gt;&lt;/span&gt; Number of full-text queries without any results displayed over time. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Interpretation:&lt;/b&gt;&lt;/span&gt;  Relevance indicator. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Calculation:&lt;/b&gt;&lt;/span&gt;  Addition of all fullt-text queries where resultcount=0.",
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
        "type": "timeline",
        "query": "searchExitTimeLine",
        "text": "Search Summary With Exit Timeline",
        "icon": "fas fa-chart-line",
        "info": "&lt;span class='text-decoration-underline'&gt;&lt;b&gt;Description:&lt;/b&gt;&lt;/span&gt; Number of search summary where the user does nothing after viewing the results page displayed over time. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Interpretation:&lt;/b&gt;&lt;/span&gt;  Suggests that a user does not consider the results provided to be relevant. Relevance indicator. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Calculation:&lt;/b&gt;&lt;/span&gt;  Based on search summary. Addition of all search.exit.timeout and search.exit.logout result events.",
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
        "type": "stat",
        "query": "queryTotal",
        "icon": "fas fa-balance-scale",
        "text": "Average number of Full-Text queries per user",
        "info": "&lt;span class='text-decoration-underline'&gt;&lt;b&gt;Description:&lt;/b&gt;&lt;/span&gt; Allows you to follow the adoption of the platform by monitoring usage over the concerned period. When a user conducts more and more Full-Text Queries, this suggests successful adoption. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Interpretation:&lt;/b&gt;&lt;/span&gt;  Adoption indicator. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Calculation:&lt;/b&gt;&lt;/span&gt;  Addition of all Full-Text Queries DIVIDED BY Total number of unique user-id.",
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
        "type": "chart",
        "query": "topQueries",
        "icon": "fas fa-th-list",
        "text": "Top Full-text Queries",
        "info": "&lt;span class='text-decoration-underline'&gt;&lt;b&gt;Description:&lt;/b&gt;&lt;/span&gt; Most frequent full-text queries. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Interpretation:&lt;/b&gt;&lt;/span&gt;  Understanding user searches enables levers to be activated to provide them with more relevant results. Relevance indicator. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Calculation:&lt;/b&gt;&lt;/span&gt;  Distribution of the top 100 full-text queries",
        "unique": true,
        "parameters": {
            "chartData": {
                "aggregation": "query"
            },
            "chartType": "grid"
        }
    },

    "topNoResultsQueries": {
        "type": "chart",
        "query": "topNoResultQueries",
        "icon": "fas fa-th-list",
        "text": "Top No Result Full-text Queries",
        "info": "&lt;span class='text-decoration-underline'&gt;&lt;b&gt;Description:&lt;/b&gt;&lt;/span&gt; Most frequent full-text queries without any results. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Interpretation:&lt;/b&gt;&lt;/span&gt;  Suggests action is needed to ensure that these searches return results. Relevance indicator. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Calculation:&lt;/b&gt;&lt;/span&gt;  Distribution of the top 100 full-text queries that have a result-count=0",
        "unique": true,
        "parameters": {
            "chartData": {
                "aggregation": "query"
            },
            "chartType": "grid"
        }
    },

    "topSources": {
        "type": "chart",
        "query": "topSources",
        "icon": "fas fa-chart-pie",
        "text": "Top Sources",
        "info": "&lt;span class='text-decoration-underline'&gt;&lt;b&gt;Description:&lt;/b&gt;&lt;/span&gt; Sources where the most clicked documents are found. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Interpretation:&lt;/b&gt;&lt;/span&gt;  May suggest review of the content-type weighting for the most clicked sources. Relevance indicator. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Calculation:&lt;/b&gt;&lt;/span&gt;  Distribution of the 100 most frequent sources generated by clicked document events",
        "unique": true,
        "parameters": {
            "chartData": {
                "aggregation": "source"
            },
            "chartType": "Pie3D"
        }
    },

    "topCollections": {
        "type": "chart",
        "query": "topCollections",
        "icon": "fas fa-chart-pie",
        "text": "Top Collections",
        "info": "&lt;span class='text-decoration-underline'&gt;&lt;b&gt;Description:&lt;/b&gt;&lt;/span&gt; Collections where most clicked documents are found. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Interpretation:&lt;/b&gt;&lt;/span&gt;  May suggest review of the content-type weighting for the most clicked collections. Relevance indicator. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Calculation:&lt;/b&gt;&lt;/span&gt;  Distribution of the 100 most frequent collections generated by clicked document events",
        "unique": true,
        "parameters": {
            "chartData": {
                "aggregation": "collection"
            },
            "chartType": "Pie3D"
        }
    },

    "topFacets": {
        "type": "chart",
        "query": "topFacets",
        "icon": "fas fa-chart-pie",
        "text": "Most Used Facets",
        "info": "&lt;span class='text-decoration-underline'&gt;&lt;b&gt;Description:&lt;/b&gt;&lt;/span&gt; Most used facets. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Interpretation:&lt;/b&gt;&lt;/span&gt;  Analysis of user behavior to identify actions to improve the relevance of search results. Relevance indicator. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Calculation:&lt;/b&gt;&lt;/span&gt;  Distribution of the 100 most frequent facets (all events where itemboxes is not null).",
        "unique": true,
        "parameters": {
            "chartData": {
                "aggregation": "box"
            },
            "chartType": "Pie3D"
        }
    },

    "resultTypes": {
        "type": "chart",
        "query": "queryByResult",
        "icon": "fas fa-chart-pie",
        "text": "Last Event After A Search",
        "info": "&lt;span class='text-decoration-underline'&gt;&lt;b&gt;Description:&lt;/b&gt;&lt;/span&gt; Last event after a search: &lt;br&gt; &lt;ul&gt; &lt;li&gt;'search.exit.logout': User runs a full-text query and does not click on any document but instead logs out.&lt;/li&gt; &lt;li&gt; 'search.exit.timeout': User runs a full-text query and does nothing before the timeout of the session.&lt;/li&gt; &lt;li&gt; 'search.with.click': User runs a full-text query, can do refinement and then clicks on a document. &lt;/li&gt;&lt;li&gt; 'search.with.no.click': User runs a full-text query, can do refinement but doesn't click on a document.&lt;/li&gt;&lt;/ul&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Interpretation:&lt;/b&gt;&lt;/span&gt;  Relevance indicator. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Calculation:&lt;/b&gt;&lt;/span&gt;  Distribution of values of “Results” event within search summary.",
        "unique": true,
        "parameters": {
            "chartData": {
                "aggregation": "result"
            },
            "chartType": "Pie3D"
        }
    },

    "userCountTotal": {
        "type": "stat",
        "query": "userCountTotal",
        "icon": "fas fa-balance-scale",
        "text": "Total Unique Users",
        "info": "&lt;span class='text-decoration-underline'&gt;&lt;b&gt;Description:&lt;/b&gt;&lt;/span&gt; Number of unique user-ids logged in over time. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Interpretation:&lt;/b&gt;&lt;/span&gt;  Adoption indicator. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Calculation:&lt;/b&gt;&lt;/span&gt;  Addition of all unique user-ids based on session summary",
        "unique": true,
        "parameters": {
            "statLayout": "standard",
            "valueLocation": "totalrecordcount",
            "asc": true
        }
    },

    "sessionCountTotal": {
        "type": "stat",
        "query": "sessionTotal",
        "icon": "fas fa-balance-scale",
        "text": "Sessions",
        "info": "&lt;span class='text-decoration-underline'&gt;&lt;b&gt;Description:&lt;/b&gt;&lt;/span&gt; Number of unique sessions displayed over time. WARNING: If a user session occurs between 11:49 pm and 00:10 am, we will consider these 2 different sessions. This simplifies the calculation by day. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Interpretation:&lt;/b&gt;&lt;/span&gt;  Adoption indicator. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Calculation:&lt;/b&gt;&lt;/span&gt;  Addition of all session summary",
        "unique": true,
        "parameters": {
            "statLayout": "standard",
            "valueLocation": "totalrecordcount",
            "asc": true
        }
    },

    "queryCountTotal": {
        "type": "stat",
        "query": "queryTotal",
        "icon": "fas fa-balance-scale",
        "text": "Full-text Queries",
        "info": "&lt;span class='text-decoration-underline'&gt;&lt;b&gt;Description:&lt;/b&gt;&lt;/span&gt; Number of all full-text queries. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Interpretation:&lt;/b&gt;&lt;/span&gt;  Adoption indicator. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Calculation:&lt;/b&gt;&lt;/span&gt;  Addition of all Full-Text Queries",
        "unique": true,
        "parameters": {
            "statLayout": "standard",
            "valueLocation": "totalrecordcount",
            "asc": true
        }
    },

    "sessionsByUser": {
        "type": "stat",
        "query": "sessionsByUser",
        "icon": "fas fa-balance-scale",
        "text": "Average Sessions By User",
        "info": "&lt;span class='text-decoration-underline'&gt;&lt;b&gt;Description:&lt;/b&gt;&lt;/span&gt; Average number of sessions per user. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Interpretation:&lt;/b&gt;&lt;/span&gt;  Adoption indicator. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Calculation:&lt;/b&gt;&lt;/span&gt;  Total number of session summary DIVIDED BY total number of unique user-ids",
        "unique": true,
        "parameters": {
            "statLayout": "standard",
            "valueLocation": "aggregations",
            "operation": "avg",
            "asc": true
        }
    },

    "searchBySession": {
        "type": "stat",
        "query": "avgQueriesBySession",
        "icon": "fas fa-balance-scale",
        "text": "Average Full-Text Queries By Session Summary",
        "info": "&lt;span class='text-decoration-underline'&gt;&lt;b&gt;Description:&lt;/b&gt;&lt;/span&gt; Average number of Full-Text Queries per session summary. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Interpretation:&lt;/b&gt;&lt;/span&gt;  The more searches per session the greater the adoption. Adoption indicator. Be careful, if all the searches are linked, this may on the contrary demonstrate too many reformulations and therefore a problem of relevance of the results. Relevance indicator. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Calculation:&lt;/b&gt;&lt;/span&gt;  Average of all Full-Text Queries within a session summary",
        "unique": true,
        "parameters": {
            "statLayout": "standard",
            "valueLocation": "records",
            "asc": true
        }
    },

    "clickBySearch": {
        "type": "stat",
        "query": "avgClicksBySearch",
        "icon": "fas fa-balance-scale",
        "text": "Average Clicked Documents By Search Summary",
        "info": "&lt;span class='text-decoration-underline'&gt;&lt;b&gt;Description:&lt;/b&gt;&lt;/span&gt; Average number of clicked documents per search summary. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Interpretation:&lt;/b&gt;&lt;/span&gt;  Clicking on several documents following a Full-Text Query may demonstrate a greater effort to access the expected result. Relevance indicator. It can also demonstrate that the user enjoys browsing the results (adoption indicator). &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Calculation:&lt;/b&gt;&lt;/span&gt;  Average of all clicked documents within a search summary",
        "unique": true,
        "parameters": {
            "statLayout": "standard",
            "valueLocation": "records",
            "asc": true
        }
    },

    "viewedDocPerSearch": {
        "type": "stat",
        "query": "docViewsBySession",
        "icon": "fas fa-balance-scale",
        "text": "Average Viewed Documents Per Session",
        "info": "&lt;span class='text-decoration-underline'&gt;&lt;b&gt;Description:&lt;/b&gt;&lt;/span&gt; Average number of viewed documents (Document Navigator) per session. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Interpretation:&lt;/b&gt;&lt;/span&gt;  Seeing fewer documents during a search suggests that the answer may have been found in the first results. Relevance indicator. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Calculation:&lt;/b&gt;&lt;/span&gt;  Addition of all clicked documents DIVIDED BY Total number of sessions",
        "unique": true,
        "parameters": {
            "statLayout": "standard",
            "valueLocation": "aggregations",
            "operation": "avg",
            "asc": true
        }
    },

    "sessionDuration": {
        "type": "stat",
        "query": "avgSessionDuration",
        "icon": "fas fa-balance-scale",
        "text": "Average Session Duration (in sec)",
        "info": "&lt;span class='text-decoration-underline'&gt;&lt;b&gt;Description:&lt;/b&gt;&lt;/span&gt; The average session duration calculated in seconds. A session starts when a user logs into the platform and ends when he logs out or a timeout occurs. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Interpretation:&lt;/b&gt;&lt;/span&gt;  Analysis of the time spent by a user to find his result. Relevance Indicator. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Calculation:&lt;/b&gt;&lt;/span&gt;  Average of all durations within a session summary",
        "unique": true,
        "parameters": {
            "statLayout": "standard",
            "valueLocation": "records",
            "asc": true
        }
    },

    "newUsers": {
        "type": "stat",
        "query": "newUsers",
        "icon": "fas fa-balance-scale",
        "text": "New Users",
        "info": "&lt;span class='text-decoration-underline'&gt;&lt;b&gt;Description:&lt;/b&gt;&lt;/span&gt; Users that have logged in for the first time during the current period. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Interpretation:&lt;/b&gt;&lt;/span&gt;  Adoption indicator. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Calculation:&lt;/b&gt;&lt;/span&gt;  Total number of users who completed their first login on a later date than the start of the range. Based on session summary",
        "unique": true,
        "parameters": {
            "statLayout": "standard",
            "valueLocation": "totalrecordcount",
            "asc": true
        }
    },

    "newUsersRate": {
        "type": "stat",
        "query": "newUsers",
        "icon": "fas fa-balance-scale",
        "text": "New Users Rate",
        "info": "&lt;span class='text-decoration-underline'&gt;&lt;b&gt;Description:&lt;/b&gt;&lt;/span&gt; Percentage of new users among all users. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Interpretation:&lt;/b&gt;&lt;/span&gt;  Adoption indicator. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Calculation:&lt;/b&gt;&lt;/span&gt;  Total number of new users DIVIDED BY Total number of unique users.",
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
        "type": "stat",
        "query": "clickRank1AfterSearch",
        "icon": "fas fa-balance-scale",
        "text": "First Clicked Document Rate",
        "info": "&lt;span class='text-decoration-underline'&gt;&lt;b&gt;Description:&lt;/b&gt;&lt;/span&gt; Number of search summary where the user clicks on the first document out of the total number of search summary. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Interpretation:&lt;/b&gt;&lt;/span&gt;  Search results may be considered relevant when there are a maximum number of clicks on the first document. Relevance indicator. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Calculation:&lt;/b&gt;&lt;/span&gt;  Total number of search summary where there are clicks of rank = 0 DIVIDED BY Total number of search summary",
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
        "type": "timeline",
        "query": "clickRank1AfterSearchTimeline",
        "text": "First Clicked Document Timeline",
        "icon": "fas fa-chart-line",
        "info": "&lt;span class='text-decoration-underline'&gt;&lt;b&gt;Description:&lt;/b&gt;&lt;/span&gt; Number of search summary where the user clicks on the first document displayed over time. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Interpretation:&lt;/b&gt;&lt;/span&gt;  Search results may be considered relevant when there are a maximum number of clicks on the first document. Relevance indicator. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Calculation:&lt;/b&gt;&lt;/span&gt;  Addition of all search.summary where there are clicks of rank = 1.",
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
        "type": "stat",
        "query": "clickRank3AfterSearch",
        "icon": "fas fa-balance-scale",
        "text": "First Three Clicked Documents Rate",
        "info": "&lt;span class='text-decoration-underline'&gt;&lt;b&gt;Description:&lt;/b&gt;&lt;/span&gt; Number of search summary where the user clicks on the first three documents out of the total number of search summary. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Interpretation:&lt;/b&gt;&lt;/span&gt;  Search results may be considered relevant when there are a maximum number of clicks on the first three documents. Relevance indicator. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Calculation:&lt;/b&gt;&lt;/span&gt;  Total number of search.summary where there are clicks of rank = (0,1,2) DIVIDED BY Total number of search summary",
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
        "type": "timeline",
        "query": "clickRank3AfterSearchTimeline",
        "text": "First Three Clicked Documents Timeline",
        "icon": "fas fa-chart-line",
        "info": "&lt;span class='text-decoration-underline'&gt;&lt;b&gt;Description:&lt;/b&gt;&lt;/span&gt; Number of search summary where the user clicks on the first three document displayed over time. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Interpretation:&lt;/b&gt;&lt;/span&gt;  Search summary results may be considered relevant when there are a maximum number of clicks on the first three documents. Relevance indicator. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Calculation:&lt;/b&gt;&lt;/span&gt;  Addition of all search summary where there are clicks of rank = (0,1,2).",
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
        "type": "stat",
        "query": "clickAfterSearch",
        "icon": "fas fa-balance-scale",
        "text": "Search Summary With Clicks",
        "info": "&lt;span class='text-decoration-underline'&gt;&lt;b&gt;Description:&lt;/b&gt;&lt;/span&gt; Total number of search summary where the user has clicked on a document at least once. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Interpretation:&lt;/b&gt;&lt;/span&gt;  Measures the likely success of a search. Relevance indicator. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Calculation:&lt;/b&gt;&lt;/span&gt;  Total number of search summary where there are at least one clicked documents",
        "unique": true,
        "parameters": {
            "statLayout": "standard",
            "valueLocation": "totalrecordcount",
            "asc": true
        }
    },

    "clickAfterSearchRate": {
        "type": "stat",
        "query": "clickAfterSearch",
        "icon": "fas fa-balance-scale",
        "text": "Search Summary With Click(s) Rate",
        "info": "&lt;span class='text-decoration-underline'&gt;&lt;b&gt;Description:&lt;/b&gt;&lt;/span&gt; Number of search summary where the user clicks at least on one document out of the total number of search summary. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Interpretation:&lt;/b&gt;&lt;/span&gt;  Measures the likely success of a search. Relevance indicator. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Calculation:&lt;/b&gt;&lt;/span&gt;  Total number of search summary where there are at least one clicked document DIVIDED BY Total number of search summary",
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
        "type": "timeline",
        "query": "clickAfterSearchTimeline",
        "text": "Search Summary With Click(s) Timeline",
        "icon": "fas fa-chart-line",
        "info": "&lt;span class='text-decoration-underline'&gt;&lt;b&gt;Description:&lt;/b&gt;&lt;/span&gt; Number of search summary where the user clicks at least on one document displayed over time. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Interpretation:&lt;/b&gt;&lt;/span&gt;  Measures the likely success of a search. Relevance indicator. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Calculation:&lt;/b&gt;&lt;/span&gt;  Addition of all search summary where there are at least one click.",
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
        "type": "stat",
        "query": "avgMRR",
        "icon": "fas fa-balance-scale",
        "text": "Mean Reciprocal Rank (MRR)",
        "info": "&lt;span class='text-decoration-underline'&gt;&lt;b&gt;Description:&lt;/b&gt;&lt;/span&gt; Captures the rank of a clicked document by users displayed over time: first doc = 1, second doc = 1/2, third doc = 1/3...  and zero if there is no click. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Interpretation:&lt;/b&gt;&lt;/span&gt;  Evaluation of the relevance of the results page. MRR = 1 is the best. Relevance indicator. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Calculation:&lt;/b&gt;&lt;/span&gt;  Based on search-summary. Average of all Mean Reciprocal Rank (MRR) events.",
        "unique": true,
        "parameters": {
            "statLayout": "standard",
            "valueLocation": "records",
            "asc": true,
            "numberFormatOptions": {"style": "decimal", "maximumFractionDigits": 2}
        }
    },

    "refinement": {
        "type": "stat",
        "query": "queryRefine",
        "icon": "fas fa-balance-scale",
        "text": "Refinement",
        "info": "&lt;span class='text-decoration-underline'&gt;&lt;b&gt;Description:&lt;/b&gt;&lt;/span&gt; Total number of search summary where the user has refined the search. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Interpretation:&lt;/b&gt;&lt;/span&gt;  After a search, the user must refine the results before clicking on a document. This demonstrates that relevance can be improved. Relevance indicator. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Calculation:&lt;/b&gt;&lt;/span&gt;  Addition of all search summary where there are searchrefinements",
        "unique": true,
        "parameters": {
            "valueLocation": "totalrecordcount",
            "statLayout": "standard",
            "asc": true
        }
    },

    "refinementRate": {
        "type": "stat",
        "query": "queryRefine",
        "icon": "fas fa-balance-scale",
        "text": "Refinement Rate",
        "info": "&lt;span class='text-decoration-underline'&gt;&lt;b&gt;Description:&lt;/b&gt;&lt;/span&gt; Number of search summary where the user has refined the search compared to the total number of search summary. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Interpretation:&lt;/b&gt;&lt;/span&gt;  After a search, the user must refine the results before clicking on a document. This demonstrates that relevance can be improved. Relevance indicator. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Calculation:&lt;/b&gt;&lt;/span&gt;  Addition of all search summary where there are searchrefinements DIVIDED BY Total number of search summary",
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
        "type": "stat",
        "query": "queryZero",
        "icon": "fas fa-balance-scale",
        "text": "Zero Result Search",
        "info": "&lt;span class='text-decoration-underline'&gt;&lt;b&gt;Description:&lt;/b&gt;&lt;/span&gt; Total number of Full-Text Queries without any results. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Interpretation:&lt;/b&gt;&lt;/span&gt;  Detects that the Full-Text Query does not provide results in order to suggest solutions to solve this problem. Relevance indicator. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Calculation:&lt;/b&gt;&lt;/span&gt;  Addition of all Full-Text Queries where resultcount=0",
        "unique": true,
        "parameters": {
            "valueLocation": "totalrecordcount",
            "statLayout": "standard",
            "asc": false
        }
    },

    "zeroSearchRate": {
        "type": "stat",
        "query": "queryZero",
        "icon": "fas fa-balance-scale",
        "text": "Zero Result Search Rate",
        "info": "&lt;span class='text-decoration-underline'&gt;&lt;b&gt;Description:&lt;/b&gt;&lt;/span&gt; Number of Full-Text Queries without any results compared to the total number of searches queries. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Interpretation:&lt;/b&gt;&lt;/span&gt;  Relevance indicator. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Calculation:&lt;/b&gt;&lt;/span&gt;  Total number of Full-Text Queries where resultcount=0 DIVIDED BY Total number of Full-Text Queries",
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
        "type": "stat",
        "query": "searchExit",
        "icon": "fas fa-balance-scale",
        "text": "Search Summary With Exit",
        "info": "&lt;span class='text-decoration-underline'&gt;&lt;b&gt;Description:&lt;/b&gt;&lt;/span&gt; Total number of search summary where the user does nothing after viewing the results page. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Interpretation:&lt;/b&gt;&lt;/span&gt;  If the user does a search and then does not act, this may demonstrate that he does not consider the results provided to be relevant. Relevance indicator. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Calculation:&lt;/b&gt;&lt;/span&gt;  Addition of all search summary where the result event values is search.exit.timeout or search.exit.logout",
        "unique": true,
        "parameters": {
            "statLayout": "standard",
            "valueLocation": "totalrecordcount",
            "asc": false
        }
    },

    "searchExitRate": {
        "type": "stat",
        "query": "searchExit",
        "icon": "fas fa-balance-scale",
        "text": "Search Summary With Exit Rate",
        "info": "&lt;span class='text-decoration-underline'&gt;&lt;b&gt;Description:&lt;/b&gt;&lt;/span&gt; Number of search summary where the user does nothing after viewing the results page compared to the total number of search summary. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Interpretation:&lt;/b&gt;&lt;/span&gt;  If the user does a full-text query and then does not act, this may demonstrate that he does not consider the results provided to be relevant. Relevance indicator. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Calculation:&lt;/b&gt;&lt;/span&gt;  Total number of search exits (timeout and logout) DIVIDED BY Total number of search summary.",
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
        "type": "stat",
        "query": "queryBounce",
        "icon": "fas fa-balance-scale",
        "text": "Bounce",
        "info": "&lt;span class='text-decoration-underline'&gt;&lt;b&gt;Description:&lt;/b&gt;&lt;/span&gt; Total number of bounces. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Interpretation:&lt;/b&gt;&lt;/span&gt;  This suggests that the result was irrelevant or incomplete. Relevance indicator. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Calculation:&lt;/b&gt;&lt;/span&gt;  Addition of all bounce events",
        "unique": true,
        "parameters": {
            "valueLocation": "totalrecordcount",
            "statLayout": "standard",
            "asc": true,
            "numberFormatOptions": {"style": "decimal", "maximumFractionDigits": 2}
        }
    },

    "queryBounceRate": {
        "type": "stat",
        "query": "queryBounce",
        "icon": "fas fa-balance-scale",
        "text": "Bounce By Search Summary",
        "info": "&lt;span class='text-decoration-underline'&gt;&lt;b&gt;Description:&lt;/b&gt;&lt;/span&gt; Number of bounces compared to the total number of search summary. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Interpretation:&lt;/b&gt;&lt;/span&gt;  This suggests that the result was likely irrelevant or incomplete. Relevance indicator. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Calculation:&lt;/b&gt;&lt;/span&gt;  Total bounces DIVIDED BY Total number of search summary.",
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

    "avgResponseTime": {
        "type": "stat",
        "query": "avgResponseTime",
        "icon": "fas fa-balance-scale",
        "text": "Average Web App Response Time",
        "info": "&lt;span class='text-decoration-underline'&gt;&lt;b&gt;Description:&lt;/b&gt;&lt;/span&gt; Average response time (in ms) incl. platform &amp; engine. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Interpretation:&lt;/b&gt;&lt;/span&gt;  Evaluation of the response speed following a full-text queries. Performance indicator. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Calculation:&lt;/b&gt;&lt;/span&gt;  Average of all durations filtered on Full Text Queries",
        "unique": true,
        "parameters": {
            "statLayout": "standard",
            "valueLocation": "aggregations",
            "valueField": {
                "name": "avg",
                "operatorResults": true
            },
            "asc": false
        }

    },

    "avgEngineResponseTime": {
        "type": "stat",
        "query": "avgEngineResponseTime",
        "icon": "fas fa-balance-scale",
        "text": "Average Engine Response Time",
        "info": "&lt;span class='text-decoration-underline'&gt;&lt;b&gt;Description:&lt;/b&gt;&lt;/span&gt; Average engine response time (in ms). &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Interpretation:&lt;/b&gt;&lt;/span&gt;  Evaluation of the response speed following a full-text queries. Performance indicator. &lt;br&gt; &lt;span class='text-decoration-underline'&gt;&lt;b&gt;Calculation:&lt;/b&gt;&lt;/span&gt;  Average of all duration executions filtered on full-text queries.",
        "unique": true,
        "parameters": {
            "statLayout": "standard",
            "valueLocation": "aggregations",
            "valueField": {
                "name": "avg",
                "operatorResults": true
            },
            "asc": false
        }
    },

    "userFeedbackGrid": {
        "type": "grid",
        "query": "userFeedback",
        "text": "User Feedback",
        "icon": "fas fa-th-list",
        "info": "&lt;span class='text-decoration-underline'&gt;&lt;b&gt;Description:&lt;/b&gt;&lt;/span&gt; User messages sent via the Feedback widget",
        "unique": true,
        "parameters": {
            "columns": [
                {
                    "field": "app",
                    "headerName": "App",
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
        "name": "User Adoption",
        "items": [
            {"item": "userCountTotalTimeline", "position": {"x": 0, "y": 0}},
            {"item": "newUsers", "position": {"x": 3, "y": 0}},
            {"item": "activeUsers", "position": {"x": 4, "y": 0}},
            {"item": "userCountTotal", "position": {"x": 3, "y": 6}},
            {"item": "sessionsByUser", "position": {"x": 4, "y": 8}},
            {"item": "sessionCountTotal", "position": {"x": 4, "y": 2}},
            {"item": "searchBySession", "position": {"x": 6, "y": 8}},
            {"item": "queryCountTotal", "position": {"x": 4, "y": 6}},
            {"item": "viewedDocPerSearch", "position": {"x": 5, "y": 8}},
            {"item": "queryCountTotalTimeline", "position": {"x": 0, "y": 4}},
            {"item": "sessionCountTotalTimeline", "position": {"x": 0, "y": 8}},
            {"item": "clickBySearch", "position": {"x": 4, "y": 4}},
            {"item": "userCoverage", "position": {"x" : 3, "y" : 2, "rows" : 4}},
            {"item": "sessionDuration", "position": {"x" : 3, "y" : 8}},
            {"item": "topCollections", "position": {"x": 5, "y": 0}},
            {"item": "topFacets", "position": {"x": 5, "y": 4}},
            {"item": "userFeedbackGrid", "position": {"x": 3, "y": 10, "rows" : 6,"cols" : 5}}
        ]
    },
    {
        "name": "Relevancy",
        "items": [
            {"item": "topQueries", "position": {"x": 0, "y": 0}},
            {"item": "topNoResultsQueries", "position": {"x": 0, "y": 4}},
            {"item": "clickRank3AfterSearchRate", "position": {"x": 4, "y": 0}},
            {"item": "queryBounceRate", "position": {"x": 4, "y": 4}},
            {"item": "searchExitRate", "position": {"x": 5, "y": 4, "rows" : 4}},
            {"item": "zeroSearchRate", "position": {"x": 3, "y": 4}},
            {"item": "refinementRate", "position": {"x": 3, "y": 6}},
            {"item": "mrr", "position": {"x": 3, "y": 2}},
            {"item": "clickRank1AfterSearchRate", "position": {"x": 3, "y": 0}},
            {"item": "resultTypes", "position": {"x": 5, "y": 0}},
            {"item": "clickAfterSearchRate", "position": {"x": 4, "y": 2}}
        ]
    },
    {
        "name": "Performance",
        "items": [
            {"item": "avgResponseTimeTimeline", "position": {"x": 0, "y": 0}},
            {"item": "avgEngineResponseTimeline", "position": {"x": 0, "y": 4}}
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
            "queryBounceRate"
        ]
    },
    {
        "name": "Search/Click",
        "items": [
            "clickRank1AfterSearchRate",
            "clickTotalTimeline",
            "topSources",
            "topCollections",
            "clickRank1AfterSearchTimeline",
            "clickRank3AfterSearchRate",
            "clickRank3AfterSearchTimeline",
            "mrr",
            "queryBounceTimeline",
            "queryBounce"
        ]
    },
    {
        "name": "Search/Refinement",
        "items": [
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
            "userCountTotalTimeline",
            "newUsersTimeline",
            "userCountTotal",
            "sessionsByUser",
            "newUsers",
            "newUsersRate",
            "activeUsers",
            "activeUsersRate",
            "userCoverage",
            "userFeedbackGrid"
        ]
    },
    {
        "name": "Response time",
        "items": [
            "avgEngineResponseTimeline",
            "maxEngineResponseTimeline",
            "avgResponseTimeTimeline",
            "maxResponseTimeTimeline",
            "avgResponseTime",
            "avgEngineResponseTime"
        ]
    }
]
