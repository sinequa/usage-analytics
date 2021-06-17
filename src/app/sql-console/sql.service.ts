import { Inject, Injectable } from "@angular/core";
import { HttpService, SqHttpClient, StartConfig, START_CONFIG, UserSettingsWebService } from "@sinequa/core/web-services";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

export const standardAttributes = ["cachehit","rowfetchtime","processingtime","matchingrowcount","postgroupbymatchingrowcount","internalquerylog","internalqueryanalysis","searchguid"];

export interface SQLAttributes {
    cachehit: number;
    rowfetchtime: string;
    processingtime: string;
    matchingrowcount: number;
    postgroupbymatchingrowcount: number;
    internalquerylog?: string;
    internalqueryanalysis?: string;
    searchguid?: string;
}

export interface SQLData {
    attributeCount: number;
    attributes: SQLAttributes;
    columnCount: number;
    columns: string[];
    cursorId: number;
    cursorRowCount: number;
    processingTime: string;
    rowFetchTime: string;
    rows?: any[][];
    totalRowCount: number;
    $httpRoundTrip: number;
    $size: number;
    $receivedTime: number;
}

export interface SQLQuery {
    name: string;
    query: string;
    engine: string;
}

@Injectable({
    providedIn: "root"
})
export class SQLWebService extends HttpService {

    constructor(
        @Inject(START_CONFIG) startConfig: StartConfig,
        private httpClient: SqHttpClient,
        private userSettingsService: UserSettingsWebService) {
        super(startConfig);
    }

    exec(sql: string, engine?: string, index?: string): Observable<SQLData> {
        const tic = new Date().getTime();
        const engines = engine? [engine] : undefined;
        // We request text instead of JSON in order to access the length of the body (when then do the JSON.parse() ourselves)
        return this.httpClient.post<string>(
            this.makeUrl("sql"),
            {sql, engines, index},
            {responseType: 'text' as 'json'})
            .pipe(map(response => {
                const toc = new Date().getTime();
                const data = JSON.parse(response as string) as SQLData;
                data.$size = response.length;
                data.$httpRoundTrip = toc - tic;
                data.$receivedTime = toc;
                return data;
            }));
    }


    // Query storage and retrieval in User Settings

    public get queries() : SQLQuery[] {
        if(!this.userSettingsService.userSettings)
            this.userSettingsService.userSettings = {};
        if(!this.userSettingsService.userSettings["sqlqueries"])
            this.userSettingsService.userSettings["sqlqueries"] = [{name: "Query 1", query: ""}];
        return this.userSettingsService.userSettings["sqlqueries"];
    }

    public createQuery(query: SQLQuery) {
        this.queries.push(query);
        this.patchQueries();
    }

    public updateQuery(query: SQLQuery, index : number) {
        if(index < this.queries.length) {
            this.queries.splice(index, 1, query);
            this.patchQueries();
        }
    }

    public deleteQuery(index : number) {
        if(index < this.queries.length) {
            this.queries.splice(index, 1);
            this.patchQueries();
        }
    }

    private patchQueries() {
        return this.userSettingsService.patch({
            sqlqueries: this.queries
        });
    }

    
    /**
     * Rudimentary parsing of distribution to guess the column types
     * Would not be necessary if the SQL query was parsed beforehand
     */
    public guessDistributionColumns(data: string[]) {
        const columns = ["value"];

        if(data.length > 1) {

            if(this.isInt(data[1])) {
                columns.push("count");
            }
            else if(this.isFloat(data[1])) {
                columns.push("score");
                if(data.length > 2) {
                    if(this.isInt(data[2])) {
                        columns.push("count");
                    }
                }
            }
            else {                
                columns.push("label");
                if(data.length > 2) {
                    if(this.isFloat(data[2])) {
                        columns.push("score");
                        if(data.length > 3) {
                            if(this.isInt(data[3])) {
                                columns.push("count");
                            }
                        }
                    }
                    else if(this.isInt(data[2])) {
                        columns.push("count");
                    }
                }
            }
        }
        return columns;
    }

    private isInt(str) {
        return !isNaN(str) && !isNaN(parseInt(str)) && parseFloat(str) === parseInt(str);
    }

    private isFloat(str) {
        return !isNaN(str) && !isNaN(parseFloat(str)) && parseFloat(str) !== parseInt(str);
    }

}