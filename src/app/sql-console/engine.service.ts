import { Inject, Injectable } from "@angular/core";
import { HttpService, SqHttpClient, StartConfig, START_CONFIG } from "@sinequa/core/web-services";
import { Observable } from "rxjs";

export type IndexAction = 'enable'|'disable'|'open'|'openall'|'close'|'closeall'|'delete'|'deleteall'|'pause'|'pauseall'|'resume'|'resumeall';

export interface EngineList {
    indexes: {
        name: string;
        engines: {name: string}[];
        allowedActions: IndexAction[];
        disabled: boolean;
        doctype: 0 | 1;
        indexMode: "read-write"|"read";
        metastore: boolean;
        replicated: boolean;
        replicationdisabled: boolean;
    }[];
    nodes: {
        engines: {
            name: string;
            running: 'true' | 'false';
        }[];
        excluded: 'true' | 'false';
        name: string;
        running: 'true' | 'false';
    }[];
    license: any;
}

export interface EngineDetail {
    engine: string;
    indexes: {
        indexname: string;
        allowedActions: IndexAction[];
        disabled: boolean;
        doctype: 0 | 1;
        documentcount: number;
        ghostscount: number;
        hascorruptreplicationfile: boolean;
        hasmasterreplicationlock: boolean;
        indexMode: "read-write"|"read";
        isencrypted: boolean;
        metastore: boolean;
        modificationdate: string;
        replicated: boolean;
        replicationdisabled: boolean;
        schemaok: boolean;
        status: "open";
        transactionid: number;
    }[];
    running: boolean;
    status: string;
}


@Injectable({
    providedIn: "root"
})
export class EngineService extends HttpService {

    constructor(
        @Inject(START_CONFIG) startConfig: StartConfig,
        private httpClient: SqHttpClient) {
        super(startConfig);
    }

    /**
     * Lists the engines, indexes and nodes, optionally filtered
     * by name (given some input text)
     * @param indexFilter Text to filter the index list
     * @param engineFilter Text to filter the engine list
     * @param nodeFilter Text to filter the node list
     */
    list(indexFilter = '', engineFilter = '', nodeFilter = ''): Observable<EngineList> {
        const params = {
            indexFilter, engineFilter, nodeFilter
        };
        return this.httpClient.get<EngineList>(
            this.makeUrl("engine.status"), {params}
        );
    }

    /**
     * Provides detailed information about an engine and its indexes
     * @param engine Name of the engine
     * @param index Name of the index
     */
    detail(engine: string, index: string): Observable<EngineDetail> {
        const params = {
            engine, index
        };
        return this.httpClient.get<EngineDetail>(
            this.makeUrl("engine.status"), {params}
        );
    }

    browseLogs(engine: string, index?: string, max = 20): Observable<string> {
        const params = {
            LogFile: `!${engine}`,
            LineMaxLength: "0",
            IgnoreLineTooLong: "True",
            LogAction: "match",
            LineMatcher: "selectindexer",
            Max: `${max}`,
            LogInfosN: "0"
        };
        if(index) {
            params["MustBeInFrom"] = index;
        }
        return this.httpClient.get<string>(
            "/log", {params}
        );
    }
}