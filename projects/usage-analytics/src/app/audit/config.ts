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
        "info": "Number of full-text queries over time. Interpretation: An increase in the number of searches over time is an indicator of platform adoption. Calculation: Addition of all search.text, search.refine and search.didyoumean.correction",
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
        "info": "Number of unique user-ids logged in over time. Interpretation: Adoption indicator. Calculation: Addition of all unique user-ids",
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
        "info": "Number of unique sessions displayed over time. WARNING: If a user occurs between 11:49 pm to 0:10, we will consider these 2 different sessions. This simplifies the calculation by day. Interpretation: An increase in the number of sessions over time indicates better adoption of the platform.",
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
        "info": "Average number of clicked documents by search displayed over time. Interpretation: Relevance indicator. Calculation: Addition of all clickcount / Total number of search-summaries",
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
        "info": "Average engine response time (in ms) displayed over time. Interpretation: Performance indicator. Calculation: Average of all execution durations filtered on search.text.",
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
        "info": "Maximum engine response time (in ms) displayed over time. Interpretation: Performance indicator. Calculation: Maximum value of all search.text execution durations",
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
        "text": "Average Mean Reciprocal Rank (MRR) of Search-Summary Timeline",
        "icon": "fas fa-chart-line",
        "info": "Captures the rank of docs clicked by users: first doc = 1, second doc = 1/2, third doc = 1/3...  and zero if there is no click. Interpretation: Relevance indicator. Calculation: Average of all Mean Reciprocal Rank (MRR) events",
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
        "text": "Average Full-Text Queries by Session-Summary Timeline",
        "icon": "fas fa-chart-line",
        "info": "Average number of search queries per session displayed over time. Interpretation: Adoption indicator. Calculation: Addition of all searchcount / Total number of unique session-ids.",
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
        "info": "Average WebApp Response time (in ms) incl. platform & engine displayed over time. Interpretation: Performance indicator. Calculation: Average of all duration filtered on search.text.",
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
        "text": "Maximum Web App Response Timeline",
        "icon": "fas fa-chart-line",
        "info": "Maximum WebApp Response time (in ms) incl. platform & engine displayed over time. Interpretation: Performance indicator. Calculation: Maximum value of all search.text durations.",
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
        "info": "The average session duration calculated in seconds. The duration of a session corresponds to the time between the first and the last action of the same session. If there is one user event then the session duration will be 0. Interpretation: Analysis of the time spent by a user to find a relevant result. Relevance indicator. Calculation: Addition of all durations (session is not null) / Total number of unique session-ids.",
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
        "info": "Total number of documents clicked displayed over time. Interpretation: Indicator to be compared with other information (number of users, searches, etc.). Relevance indicator. Calculation: Addition of all searchcount where result=search.with.click.",
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
        "info": "Number of bounces displayed over time. A bounce is when a user opens a document and quickly comes back (<10s). Interpretation: This suggests that the result was irrelevant or incomplete. Relevance indicator. Calculation: Addition of all bounce events.",
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
        "info": "Number of search queries where the user has refined the search (through facets, for instance) displayed over time. Interpretation: This suggests that relevance can be improved. Relevance indicator. Calculation: Addition of all searchrefinement.",
        "unique": true,
        "parameters": {
            "aggregationsTimeSeries": {
                "name": "QueryRefine",
                "dateField": "value",
                "valueFields": [{"operatorResults": true, "name": "sum", "title": "Refinement", "primary": true}]
            },
            "chartType": "Timeline"
        }
    },

    "zeroSearchTimeline": {
        "type": "timeline",
        "query": "queryZeroTimeLine",
        "text": "Zero Result Search Timeline",
        "icon": "fas fa-chart-line",
        "info": "Number of search queries without any results displayed over time. Interpretation: Relevance indicator. Calculation: Addition of all searchcount where resultcount=0.",
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
        "text": "Search Exit Timeline",
        "icon": "fas fa-chart-line",
        "info": "Number of search queries where the user does nothing after viewing the results page displayed over time. Interpretation: Suggests that a user does not consider the results provided to be relevant. Relevance indicator. Calculation: Addition of all search.exit.timeout and search.exit.logout result events.",
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

    "queryCountPerUserTimeline": {
        "type": "timeline",
        "query": "QueryCountPerUser",
        "text": "Average Number of Full-Text Per User",
        "icon": "fas fa-chart-line",
        "info": "Allows you to follow the adoption of the platform by monitoring usage over the concerned period. When a user conducts more and more searches, this suggests successful adoption. Interpretation: Adoption indicator. Calculation: Addition of all searchcount / Total number of unique user-ids.",
        "unique": true,
        "parameters": {
            "aggregationsTimeSeries": {
                "name": "QueryTotal",
                "dateField": "value",
                "valueFields": [{"name": "count", "title": "Average number of searches per user", "primary": true}]
            },
            "chartType": "Timeline"
        }
    },

    "topQueries": {
        "type": "chart",
        "query": "topQueries",
        "icon": "fas fa-th-list",
        "text": "Top Full-text Queries",
        "info": "Most frequent full-text queries. Interpretation: Understanding user searches enables levers to be activated to provide them with more relevant results. Relevance indicator. Calculation: Distribution of the top 100 full-text queries from the most searched queries via search.text, search.refine and search.didyoumean.correction type events",
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
        "info": "Most frequent full-text queries without any results. Interpretation: Suggests action is needed to ensure that these searches return results. Relevance indicator. Calculation: Distribution of the top 100 full-text queries from the most searched queries via search.text, search.refine and search.didyoumean.correction type events that have a result-count =0.",
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
        "info": "Sources where the most clicked documents are found. Interpretation: May suggest review of the content-type weighting for the most clicked sources. Relevance indicator. Calculation: Distribution of the 100 most frequent sources generated by click events (doc.preview, click.resultlink, click.resultlink*).",
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
        "info": "Collections where most clicked documents are found. Interpretation: May suggest review of the content-type weighting for the most clicked collections. Relevance indicator. Calculation: Distribution of the 100 most frequent collections generated by click events (doc.preview, click.resultlink, click.resultlink*)",
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
        "info": "Most used facets. Interpretation: Analysis of user behavior to identify actions to improve the relevance of search results. Relevance indicator. Calculation: Distribution of the 100 most frequent facets (i.e., itemboxes).",
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
        "text": "Last Action After A Search",
        "info": "Last action after a search:\n - 'search.exit.logout': User runs a search and does not click on any document but instead logs out.\n - 'search.exit.timeout': User runs a search and does not click on a document but rather leaves the page.\n - 'search.with.click': User runs one or several searches and clicks on a document as a last action.\n - 'search.with.no.click': User runs one or several searches but does not click on any documents as a last action. Interpretation: Relevance indicator. Calculation: Distribution of values of “Results” event within search.summary.",
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
        "info": "Number of unique users logged in during the selected time period. Interpretation: Adoption indicator. Calculation: Addition of all unique user-ids.",
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
        "info": "Number of sessions. Interpretation: Adoption indicator. Calculation: Addition of all unique session-ids.",
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
        "info": "Number of all full-text queries. Interpretation: Adoption indicator. Calculation: Addition of all search.text, search.refine and search.didyoumean.correction",
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
        "info": "Average number of sessions per user. Interpretation: Adoption indicator. Calculation: Total number of sessions/total number of unique user_ids",
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
        "text": "Average Search By Session",
        "info": "Average number of searches per session. Interpretation: The more searches per session the greater the adoption. Adoption indicator. Be careful, if all searches are linked, this may demonstrate too many reformulations and, therefore, a problem with the relevance of the results. Relevance indicator. Calculation: Average of all searchcount within a session.summary",
        "unique": true,
        "parameters": {
            "statLayout": "standard",
            "valueLocation": "records",
            "asc": true
        }
    },

    "clickBySearch": {
        "type": "stat",
        "query": "avgClicksByQuery",
        "icon": "fas fa-balance-scale",
        "text": "Average Click By Search",
        "info": "Average number of clicked documents per search. Interpretation: Clicking on several documents following a search may demonstrate a greater effort to access the expected result. Relevance indicator. It can also demonstrate that the user enjoys browsing the results (adoption indicator). Calculation: Average of all clickcount >0 within a session.summary",
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
        "info": "Average number of viewed documents (Document Navigator) per session. Interpretation: Seeing fewer documents during a search suggests that the answer may have been found in the first results. Relevance indicator. Calculation: Addition of all click.* or doc.preview /Total number of sessions",
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
        "info": "The average session duration calculated in seconds. A session starts when a user logs into the platform and ends when he logs out or a timeout occurs. Interpretation: Analysis of the time spent by a user to find his result. Relevance Indicator. Calculation: Average of all durations within a session.summary",
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
        "info": "Users that have logged in for the first time during the current period. Interpretation: Adoption indicator. Calculation: Total number of users who completed their first login on a later date than the start of the range",
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
        "info": "Percentage of new users among all users. Interpretation: Adoption indicator. Calculation: Total number of new users/Total number of unique users.",
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
        "query": "userCountTotal",
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
        "text": "Rate of First Document Clicked",
        "info": "Number of searches where the user clicks on the first document out of the total number of searches. Interpretation: Search results may be considered relevant when there are a maximum number of clicks on the first document. Relevance indicator. Calculation: Total number of search.summary where there are clicks of rank = 1 there is a rank 1 click / Total number of search.summary.",
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
        "query": "clickRank1AfterSearchTimeLine",
        "text": "First Document Clicked Timeline",
        "icon": "fas fa-chart-line",
        "info": "Number of searches where the user clicks on the first document displayed over time. Interpretation: Search results may be considered relevant when there are a maximum number of clicks on the first document. Relevance indicator. Calculation: Addition of all search.summary where there are clicks of rank = 1.",
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
        "text": "Rate of First Three Documents Clicked",
        "info": "Number of searches where the user clicks on the first three documents out of the total number of searches. Interpretation: Search results may be considered relevant when there are a maximum number of clicks on the first three documents. Relevance indicator. Calculation: Total number of search.summary where there are clicks of rank = (1,2,3) / Total number of search.summary.",
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

    "clickRank3AfterSearchTimeLine": {
        "type": "timeline",
        "query": "clickRank3AfterSearchTimeLine",
        "text": "First Three Documents Clicked Timeline",
        "icon": "fas fa-chart-line",
        "info": "Number of searches queries where the user clicks on the first three document displayed over time. Interpretation: Search results may be considered relevant when there are a maximum number of clicks on the first three documents. Relevance indicator. Calculation: Addition of all search.summary where there are clicks of rank = (1,2,3).",
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
        "text": "Search With Clicks",
        "info": "Total number of searches where the user has clicked on a document at least once. Interpretation: Measures the likely success of a search. Relevance indicator. Calculation: Total number of search.summary where there are at least one click",
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
        "text": "Rate of Search With Clicks",
        "info": "Number of searches where the user clicks at least on one document out of the total number of searches. Interpretation: Measures the likely success of a search. Relevance indicator. Calculation: Total number of search.summary where there are at least one click / Total number of search.summary.",
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
        "query": "clickAfterSearchTimeLine",
        "text": "Search With Clicks Timeline",
        "icon": "fas fa-chart-line",
        "info": "Number of searches queries where the user clicks at least on one document displayed over time. Interpretation: Measures the likely success of a search. Relevance indicator. Calculation: Addition of all search.summary where there are at least one click.",
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
        "info": "Captures the rank of a doc clicked by users displayed over time: first doc = 1, second doc = 1/2, third doc = 1/3...  and zero if there is no click. Interpretation: Evaluation of the relevance of the results page. MRR = 1 is the best. Relevance indicator. Calculation: Average of all mrr events",
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
        "info": "Total number of search queries where the user has refined the search (through facets, for instance). Interpretation: After a search, the user must refine the results before clicking on a document. This demonstrates that relevance can be improved. Relevance indicator. Calculation: Addition of all searchrefinements",
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
        "info": "Number of search queries where the user has refined the search compared to the total number of searches. Interpretation: After a search, the user must refine the results before clicking on a document. This demonstrates that relevance can be improved. Relevance indicator. Calculation: Addition of all searchrefinements/Total number of searches",
        "unique": true,
        "parameters": {
            "valueLocation": "totalrecordcount",
            "relatedQuery": "queryTotal",
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
        "info": "Total number of search queries without any results. Interpretation: Detects searches that do not provide results in order to suggest solutions to solve this problem. Relevance indicator. Calculation: Addition of all searchcounts where resultcount=0",
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
        "info": "Number of search queries without any results compared to the total number of searches queries. Interpretation: Relevance indicator. Calculation: Total number of searchcounts where resultcount=0 / Total number of queries",
        "unique": true,
        "parameters": {
            "valueLocation": "totalrecordcount",
            "relatedQuery": "queryTotal",
            "relatedValueLocation": "totalrecordcount",
            "computation": "percentage",
            "statLayout": "standard",
            "asc": false,
            "numberFormatOptions": {"style": "percent", "maximumFractionDigits": 1}
        }
    },

    "searchExit": {
        "type": "stat",
        "query": "searchExit",
        "icon": "fas fa-balance-scale",
        "text": "Search Exit",
        "info": "Total number of search queries where the user does nothing after viewing the results page. Interpretation: If the user does a search and then does not act, this may demonstrate that he does not consider the results provided to be relevant. Relevance indicator. Calculation: Addition of all searchcount within a search.summary where the result event values is search.exit.timeout or search.exit.logout",
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
        "text": "Search Exit Rate",
        "info": "Number of search queries where the user does nothing after viewing the results page compared to the total number of search queries. Interpretation: If the user does a search and then does not act, this may demonstrate that he does not consider the results provided to be relevant. Relevance indicator. Calculation: Total number of search exits (timeout and logout) / Total number of queries.",
        "unique": true,
        "parameters": {
            "valueLocation": "totalrecordcount",
            "relatedQuery": "queryTotal",
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
        "info": "Total number of bounces. A bounce is when a user opens a document and quickly returns back to where they started (<10s). Interpretation: This suggests that the result was irrelevant or incomplete. Relevance indicator. Calculation: Addition of all bounce event",
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
        "text": "Bounce Rate",
        "info": "Number of bounces compared to the total number of search queries. Interpretation: This suggests that the result was likely irrelevant or incomplete. Relevance indicator. Calculation: Total bounce/Total number of queries.",
        "unique": true,
        "parameters": {
            "valueLocation": "totalrecordcount",
            "relatedQuery": "queryTotal",
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
        "info": "Average response time (in ms) incl. platform & engine. Interpretation: Evaluation of the response speed following a search. Performance indicator. Calculation: Average of all durations filtered on search.text",
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
        "info": "Average engine response time (in ms). Interpretation: Evaluation of the response speed following a search. Performance indicator. Calculation: Average of all duration executions filtered on search.text",
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
        "info": "User messages sent via the Feedback widget",
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
        "name": "Timelines",
        "items": [
            "queryCountTotalTimeline",
            "userCountTotalTimeline",
            "sessionCountTotalTimeline",
            "searchBySessionTimeline",
            "clickBySearchTimeline",
            "sessionDurationTimeline",
            "newUsersTimeline",
            "clickRank1AfterSearchTimeline",
            "mrrTimeline",
            "refinementTimeline",
            "clickAfterSearchTimeline",
            "searchExitTimeline",
            "zeroSearchTimeline",
            "clickRank3AfterSearchTimeLine",
            "queryBounceTimeline",
            "clickTotalTimeline",
            "avgResponseTimeTimeline",
            "avgEngineResponseTimeline",
            "maxEngineResponseTimeline",
            "maxResponseTimeTimeline"
        ]
    },
    {
        "name": "Charts",
        "items": [
            "topSources",
            "topFacets",
            "topCollections",
            "topQueries",
            "topNoResultsQueries",
            "resultTypes"
        ]
    },
    {
        "name": "Grid",
        "items": [
            "userFeedbackGrid"
        ]
    },
    {
        "name": "Statistics",
        "items": [
            "queryCountTotal",
            "userCountTotal",
            "sessionCountTotal",
            "sessionsByUser",
            "viewedDocPerSearch",
            "searchBySession",
            "clickBySearch",
            "sessionDuration",
            "newUsers",
            "newUsersRate",
            "activeUsers",
            "activeUsersRate",
            "userCoverage",
            "clickRank1AfterSearchRate",
            "mrr",
            "refinementRate",
            "refinement",
            "clickAfterSearch",
            "clickAfterSearchRate",
            "zeroSearch",
            "searchExit",
            "searchExitRate",
            "clickRank3AfterSearchRate",
            "queryBounce",
            "queryBounceRate",
            "avgResponseTime",
            "zeroSearchRate",
            "avgEngineResponseTime"
        ]
    }
]
