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
export const default_timestamp_filter: string = "";

/** Default scope, on sba, used on init */
export const default_app_filter: string = "";

/** Default scope, on profile, used on init */
export const default_profile_filter: string = "";

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
            searchable: true,
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
            searchable: true,
            allowExclude: true,
            allowOr: true,
            allowAnd: false,
            displayEmptyDistributionIntervals: false
        }
    }
];

/** Widgets */
export const WIDGETS: {[key: string]: DashboardItemOption} = {

    queryCountTotalTimeline: {
        type: "timeline",
        query: "queryTotalTimeLine",
        text: "msg#widgets.queryTotalTimeLine.text",
        icon: "fas fa-chart-line",
        info: "msg#widgets.queryTotalTimeLine.info",
        unique: true,
        parameters: {
            aggregationsTimeSeries: {
                name: "QueryTotal",
                dateField: "value",
                valueFields: [{name: "count", title: "Query Count Total", primary: true}]
            }
        }
    },

    userCountTotalTimeline: {
        type: "timeline",
        query: "userCountTotalTimeLine",
        text: "msg#widgets.userTotalTimeLine.text",
        icon: "fas fa-chart-line",
        info: "msg#widgets.userTotalTimeLine.info",
        unique: true,
        parameters: {
            aggregationsTimeSeries: {
                name: "UserCountTotal",
                dateField: "value",
                valueFields: [{name: "count", title: "User Count Total", primary: true}]
            }
        }
    },

    sessionCountTotalTimeline: {
        type: "timeline",
        query: "sessionTotalTimeLine",
        text: "msg#widgets.sessionTotalTimeLine.text",
        icon: "fas fa-chart-line",
        info: "msg#widgets.sessionTotalTimeLine.info",
        unique: true,
        parameters: {
            aggregationsTimeSeries: {
                name: "SessionTotal",
                dateField: "value",
                valueFields: [{name: "count", title: "Session Count Total", primary: true}]
            }
        }
    },

    clickBySearchTimeline: {
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
            }
        }
    },

    avgEngineResponseTimeline: {
        type: "timeline",
        query: "engineResponseTimeTimeLine",
        text: "msg#widgets.avgEngineResponseTimeTimeLine.text",
        icon: "fas fa-chart-line",
        info: "msg#widgets.avgEngineResponseTimeTimeLine.info",
        unique: true,
        parameters: {
            aggregationsTimeSeries: {
                name: "engineresponsetime",
                dateField: "value",
                valueFields: [{operatorResults: true, name: "avg", title: "Average Engine Response", primary: true}]
            }
        }
    },

    maxEngineResponseTimeline: {
        type: "timeline",
        query: "engineResponseTimeTimeLine",
        text: "msg#widgets.maxEngineResponseTimeTimeLine.text",
        icon: "fas fa-chart-line",
        info: "msg#widgets.maxEngineResponseTimeTimeLine.info",
        unique: true,
        parameters: {
            aggregationsTimeSeries: {
                name: "engineresponsetime",
                dateField: "value",
                valueFields: [{operatorResults: true, name: "max", title: "Maximum Engine Response", primary: true}]
            }
        }
    },

    mrrTimeline: {
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
            }
        }
    },

    searchBySessionTimeline: {
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
            }
        }
    },

    avgResponseTimeTimeline: {
        type: "timeline",
        query: "responseTimeTimeLine",
        text: "msg#widgets.avgResponseTimeTimeLine.text",
        icon: "fas fa-chart-line",
        info: "msg#widgets.avgResponseTimeTimeLine.info",
        unique: true,
        parameters: {
            aggregationsTimeSeries: {
                name: "ResponseTime",
                dateField: "value",
                valueFields: [{operatorResults: true, name: "avg", title: "Average Response Time", primary: true}]
            }
        }
    },

    maxResponseTimeTimeline: {
        type: "timeline",
        query: "responseTimeTimeLine",
        text: "msg#widgets.maxResponseTimeTimeLine.text",
        icon: "fas fa-chart-line",
        info: "msg#widgets.maxResponseTimeTimeLine.info",
        unique: true,
        parameters: {
            aggregationsTimeSeries: {
                name: "ResponseTime",
                dateField: "value",
                valueFields: [
                    //{operatorResults: true, name: "avg", title: "Average", primary: true},
                    {operatorResults: true, name: "max", title: "Maximum Response Time", primary: true},
                    //{operatorResults: true, name: "min", title: "Minimum", primary: false}
                ]
            }
        }
    },

    sessionDurationTimeline: {
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
            }
        }
    },

    firstClickTimeline: {
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
            }
        }
    },

    clickFirstDocsTimeline: {
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
            }
        }
    },

    clickTotalTimeline: {
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
            }
        }
    },

    newUsersTimeline: {
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
            }
        }
    },

    queryBounceTimeline: {
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
            }
        }
    },

    searchWithClicksTimeline: {
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
            }
        }
    },

    refinementTimeline: {
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
            }
        }
    },

    zeroSearchTimeline: {
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
            }
        }
    },

    searchExitTimeline: {
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
            }
        }
    },

    topQueries: {
        type: "chart",
        query: "topQueries",
        icon: "fas fa-th-list",
        text: "msg#widgets.topQueries.text",
        info: "msg#widgets.topQueries.info",
        unique: true,
        parameters: {
            chartData: {
                aggregation: "query"
            },
            chartType: "grid"
        }
    },

    topNoResultsQueries: {
        type: "chart",
        query: "topNoResultQueries",
        icon: "fas fa-th-list",
        text: "msg#widgets.topNoResultQueries.text",
        info: "msg#widgets.topNoResultQueries.info",
        unique: true,
        parameters: {
            chartData: {
                aggregation: "query"
            },
            chartType: "grid"
        }
    },

    topSources: {
        type: "chart",
        query: "topSources",
        icon: "fas fa-chart-pie",
        text: "msg#widgets.topSources.text",
        info: "msg#widgets.topSources.info",
        unique: true,
        parameters: {
            chartData: {
                aggregation: "source"
            },
            chartType: "Pie3D"
        }
    },

    topCollections: {
        type: "chart",
        query: "topCollections",
        icon: "fas fa-chart-pie",
        text: "msg#widgets.topCollections.text",
        info: "msg#widgets.topCollections.info",
        unique: true,
        parameters: {
            chartData: {
                aggregation: "collections"
            },
            chartType: "Pie3D"
        }
    },

    topFacets: {
        type: "chart",
        query: "topFacets",
        icon: "fas fa-chart-pie",
        text: "msg#widgets.topFacets.text",
        info: "msg#widgets.topFacets.info",
        unique: true,
        parameters: {
            chartData: {
                aggregation: "box"
            },
            chartType: "Pie3D"
        }
    },

    userCountTotal: {
        type: "stat",
        query: "userCountTotal",
        icon: "fas fa-balance-scale",
        text: "msg#widgets.userCountTotal.text",
        info: "msg#widgets.userCountTotal.info",
        unique: true,
        parameters: {
            statLayout: 'standard',
            valueLocation: "totalrecordcount",
            asc: true
        }
    },

    sessionCountTotal: {
        type: "stat",
        query: "sessionTotal",
        icon: "fas fa-balance-scale",
        text: "msg#widgets.sessionTotal.text",
        info: "msg#widgets.sessionTotal.info",
        unique: true,
        parameters: {
            statLayout: 'standard',
            valueLocation: "totalrecordcount",
            asc: true
        }
    },

    queryCountTotal: {
        type: "stat",
        query: "queryTotal",
        icon: "fas fa-balance-scale",
        text: "msg#widgets.queryTotal.text",
        info: "msg#widgets.queryTotal.info",
        unique: true,
        parameters: {
            statLayout: 'standard',
            valueLocation: "totalrecordcount",
            asc: true
        }
    },

    sessionsByUser: {
        type: "stat",
        query: "sessionsByUser",
        icon: "fas fa-balance-scale",
        text: "msg#widgets.sessionsByUser.text",
        info: "msg#widgets.sessionsByUser.info",
        unique: true,
        parameters: {
            statLayout: 'standard',
            valueLocation: "aggregations",
            operation: "avg",
            asc: true
        }
    },

    searchBySession: {
        type: "stat",
        query: "avgQueriesBySession",
        icon: "fas fa-balance-scale",
        text: "msg#widgets.avgQueriesBySession.text",
        info: "msg#widgets.avgQueriesBySession.info",
        unique: true,
        parameters: {
            statLayout: 'standard',
            valueLocation: "records",
            asc: true
        }
    },

    clickBySearch: {
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
    },

    viewedDocPerSearch: {
        type: "stat",
        query: "docViewsBySession",
        icon: "fas fa-balance-scale",
        text: "msg#widgets.docViewsBySession.text",
        info: "msg#widgets.docViewsBySession.info",
        unique: true,
        parameters: {
            statLayout: 'standard',
            valueLocation: "aggregations",
            operation: "avg",
            asc: true
        }
    },

    sessionDuration: {
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
    },

    newUsers: {
        type: "stat",
        query: "newUsers",
        icon: "fas fa-balance-scale",
        text: "msg#widgets.newUsers.text",
        info: "msg#widgets.newUsers.info",
        unique: true,
        parameters: {
            statLayout: 'standard',
            valueLocation: "totalrecordcount",
            asc: true
        }
    },

    activeUsers: {
        type: "stat",
        query: "activeUsers",
        icon: "fas fa-balance-scale",
        text: "msg#widgets.activeUsers.text",
        info: "msg#widgets.activeUsers.info",
        unique: true,
        parameters: {
            statLayout: 'standard',
            valueLocation: "totalrecordcount",
            asc: true
        }
    },

    firstClick: {
        type: "stat",
        query: "clickRank1Total",
        icon: "fas fa-balance-scale",
        text: "msg#widgets.clickRank1TotalRate.text",
        info: "msg#widgets.clickRank1TotalRate.info",
        unique: true,
        parameters: {
            statLayout: 'standard',
            valueLocation: "totalrecordcount",
            relatedQuery: "clickTotal",
            relatedValueLocation: "records",
            computation: "percentage",
            asc: true
        }
    },

    mrr: {
        type: "stat",
        query: "avgMRR",
        icon: "fas fa-balance-scale",
        text: "msg#widgets.avgMRR.text",
        info: "msg#widgets.avgMRR.info",
        unique: true,
        parameters: {
            statLayout: 'standard',
            valueLocation: "records",
            asc: true
        }
    },

    refinement: {
        type: "stat",
        query: "queryRefine",
        icon: "fas fa-balance-scale",
        text: "msg#widgets.queryRefine.text",
        info: "msg#widgets.queryRefine.info",
        unique: true,
        parameters: {
            valueLocation: "totalrecordcount",
            statLayout: 'standard',
            asc: true
        }
    },

    refinementRate: {
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
    },

    searchWithClicks: {
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
    },

    searchWithClicksRate: {
        type: "stat",
        query: "queryClick",
        icon: "fas fa-balance-scale",
        text: "msg#widgets.queryClickRate.text",
        info: "msg#widgets.queryClickRate.info",
        unique: true,
        parameters: {
            valueLocation: "totalrecordcount",
            relatedQuery: "queryTotal",
            relatedValueLocation: "records",
            computation: "percentage",
            statLayout: 'standard',
            asc: true
        }
    },

    zeroSearch: {
        type: "stat",
        query: "queryZero",
        icon: "fas fa-balance-scale",
        text: "msg#widgets.queryZero.text",
        info: "msg#widgets.queryZero.info",
        unique: true,
        parameters: {
            valueLocation: "totalrecordcount",
            statLayout: 'standard',
            asc: false
        }
    },

    zeroSearchRate: {
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
    },

    searchExit: {
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
    },

    searchExitRate: {
        type: "stat",
        query: "searchExit",
        icon: "fas fa-balance-scale",
        text: "msg#widgets.searchExitRate.text",
        info: "msg#widgets.searchExitRate.info",
        unique: true,
        parameters: {
            valueLocation: "totalrecordcount",
            relatedQuery: "queryTotal",
            relatedValueLocation: "records",
            computation: "percentage",
            statLayout: 'standard',
            asc: false
        }
    },

    clickFirstDocs: {
        type: "stat",
        query: "clickRank3",
        icon: "fas fa-balance-scale",
        text: "msg#widgets.clickRank3.text",
        info: "msg#widgets.clickRank3.info",
        unique: true,
        parameters: {
            valueLocation: "totalrecordcount",
            relatedQuery: "queryTotal",
            relatedValueLocation: "records",
            computation: "percentage",
            statLayout: 'standard',
            asc: true
        }
    },

    queryBounce: {
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
    },

    queryBounceRate: {
        type: "stat",
        query: "queryBounce",
        icon: "fas fa-balance-scale",
        text: "msg#widgets.queryBounceRate.text",
        info: "msg#widgets.queryBounceRate.info",
        unique: true,
        parameters: {
            valueLocation: "totalrecordcount",
            relatedQuery: "queryTotal",
            relatedValueLocation: "records",
            computation: "percentage",
            statLayout: 'standard',
            asc: true
        }
    },

    resultTypes: {
        type: "chart",
        query: "queryByResult",
        icon: "fas fa-chart-pie",
        text: "msg#widgets.queryByResult.text",
        info: "msg#widgets.queryByResult.info",
        unique: true,
        parameters: {
            chartData: {
                aggregation: "result"
            },
            chartType: "Pie3D"
        }
    },

    avgResponseTime: {
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
    },

    avgEngineResponseTime: {
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
    },

    userFeedbackGrid: {
        type: "grid",
        query: "userFeedback",
        text: "msg#widgets.userFeedbackGrid.text",
        icon: "fas fa-th-list",
        info: "msg#widgets.userFeedbackGrid.info",
        unique: true,
        parameters: {
            columns: [
                {
                    field: "app",
                    headerName: "App",
                    filterType: "text",
                    formatterType: "text"
                },
                {
                    field: "message",
                    headerName: "Message",
                    filterType: "text",
                    formatterType: "text"
                },
                {
                    field: "detail",
                    headerName: "Detail",
                    filterType: "text",
                    formatterType: "text",
                    multiLineCell: true
                }
            ],
            showTooltip: true
        }
    },

};

/** Dashboards */
export const  STANDARD_DASHBOARDS: {name: string, items: {item: string, position: DashboardItemPosition}[]}[] = [
    {
        name: "msg#dashboards.userAdoption",
        items: [
            {item: "userCountTotalTimeline", position: {x: 0, y: 0}},
            {item: "newUsers", position: {x: 3, y: 0}},
            {item: "activeUsers", position: {x: 4, y: 0}},
            {item: "userCountTotal", position: {x: 3, y: 6}},
            {item: "sessionsByUser", position: {x: 4, y: 8}},
            {item: "sessionCountTotal", position: {x: 4, y: 2}},
            {item: "searchBySession", position: {x: 6, y: 8}},
            {item: "queryCountTotal", position: {x: 4, y: 6}},
            {item: "viewedDocPerSearch", position: {x: 5, y: 8}},
            {item: "queryCountTotalTimeline", position: {x: 0, y: 4}},
            {item: "sessionCountTotalTimeline", position: {x: 0, y: 8}},
            {item: "clickBySearch", position: {x: 4, y: 4}},
            {item: "sessionDuration", position: {x : 3, y : 8}},
            {item: "topSources", position: {x: 5, y: 0}},
            {item: "topFacets", position: {x: 5, y: 4}}
        ]
    },
    {
        name: "msg#dashboards.relevancy",
        items: [
            {item: "topQueries", position: {x: 0, y: 0}},
            {item: "topNoResultsQueries", position: {x: 0, y: 4}},
            {item: "clickFirstDocs", position: {x: 4, y: 0}},
            {item: "queryBounceRate", position: {x: 4, y: 4}},
            {item: "searchExitRate", position: {x: 5, y: 4, rows : 4}},
            {item: "zeroSearch", position: {x: 3, y: 4}},
            {item: "refinement", position: {x: 3, y: 6}},
            {item: "mrr", position: {x: 3, y: 2}},
            {item: "firstClick", position: {x: 3, y: 0}},
            {item: "resultTypes", position: {x: 5, y: 0}},
            {item: "searchWithClicksRate", position: {x: 4, y: 2}},
        ]
    },
    {
        name: "msg#dashboards.performance",
        items: [
            {item: "avgResponseTimeTimeline", position: {x: 0, y: 0}},
            {item: "maxResponseTimeTimeline", position: {x: 3, y: 0}},
            {item: "avgEngineResponseTimeline", position: {x: 0, y: 4}},
            {item: "maxEngineResponseTimeTimeline", position: {x: 3, y: 4}},
        ]
    }
]

/** Palette */
export const PALETTE: {name: string, items: string[]}[] = [
    {
        name: "msg#palette.timelines",
        items: [
            "queryCountTotalTimeline",
            "userCountTotalTimeline",
            "sessionCountTotalTimeline",
            "searchBySessionTimeline",
            "clickBySearchTimeline",
            "sessionDurationTimeline",
            "newUsersTimeline",
            "firstClickTimeline",
            "mrrTimeline",
            "refinementTimeline",
            "searchWithClicksTimeline",
            "searchExitTimeline",
            "zeroSearchTimeline",
            "clickFirstDocsTimeline",
            "queryBounceTimeline",
            "clickTotalTimeline",
            "avgResponseTimeTimeline",
            "maxResponseTimeTimeline",
            "avgEngineResponseTimeline",
            "maxEngineResponseTimeline"

        ]
    },
    {
        name: "msg#palette.charts",
        items: [
            "topSources",
            "topCollections",
            "topQueries",
            "topFacets",
            "topNoResultsQueries",
            "resultTypes"
        ]
    },
    {
        name: "msg#palette.grid",
        items: [
            "userFeedbackGrid"
        ]
    },
    {
        name: "msg#palette.statistics",
        items: [
            "queryCountTotal",
            "userCountTotal",
            "sessionCountTotal",
            "sessionsByUser",
            "viewedDocPerSearch",
            "searchBySession",
            "clickBySearch",
            "sessionDuration",
            "newUsers",
            "activeUsers",
            "firstClick",
            "mrr",
            "refinement",
            "refinementRate",
            "searchWithClicks",
            "searchWithClicksRate",
            "zeroSearch",
            "zeroSearchRate",
            "searchExit",
            "searchExitRate",
            "clickFirstDocs",
            "queryBounce",
            "queryBounceRate",
            "avgResponseTime",
            "avgEngineResponseTime"
        ]
    }
]
