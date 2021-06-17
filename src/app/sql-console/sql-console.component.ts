import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { LoginService } from "@sinequa/core/login";
import { Subscription } from "rxjs";
import { SQLData, SQLWebService } from "./sql.service";
import { EngineService } from "./engine.service";
import { SQLEditorComponent } from "./sql-editor/sql-editor.component";
import { Action, ActionButtonsOptions } from "@sinequa/components/action";
import { samples, SQLSample } from "./sql-samples";

export interface Engine {
    name: string;
    node: string;
    running: boolean;
}

@Component({
    selector: 'sql-console',
    templateUrl: './sql-console.component.html',
    styleUrls: ['./sql-console.component.scss', './tab-styling.scss']
})
export class SQLConsoleComponent implements OnInit, OnDestroy {

    @ViewChild('editor') editor?: SQLEditorComponent;
    
    // List of engines
    engines?: Engine[];
    selectedEngine?: Engine;

    // Data
    data?: SQLData;

    // Actions
    docButtons: ActionButtonsOptions;

    // Misc
    subscriptions: Subscription[] = [];
    renderingTime?: number;
    searchInProgress = false;

    constructor(
        public loginService: LoginService,
        public sqlService: SQLWebService,
        public engineService: EngineService,
    ) {
    }

    ngOnInit() {
        
        if(this.loginService.complete) {
            this.initOnLogin();
        }
        else {
            this.subscriptions.push(this.loginService.events.subscribe(event => {
                if(event.type === "session-start") {
                    this.initOnLogin();
                }
            }));
        }

        const docAction = new Action({
            text: "Documentation",
            icon: "fas fa-fw fa-book",
            title: "Open the Sinequa documentation on SQL syntax",
            action: () => window.open("/doc/en/Content/en.sinequa-es.syntax.dialog-in-sql.html", "_blank")
        });
        const sampleAction = this.buildSampleAction(samples);
        sampleAction.title = "Insert sample SQL queries in the console";
        const logAction = new Action({
            text: "Logs",
            icon: "fas fa-fw fa-history",
            title: "Browse and insert SQL queries from the latest logs",
            children: []
        });
        this.docButtons = {
            items: [docAction, sampleAction, logAction],
            autoAdjust: true,
            rightAligned: true,
            size: 'sm'
        };
    }

    /**
     * Upon login, fetch the list of engines and build the actions
     * that depend on them
     */
    initOnLogin() {
        this.engineService.list().subscribe(list => {
            this.engines = [];
            const logActions: Action[] = this.docButtons.items[2].children;
            list.nodes.forEach(node => {
                node.engines.forEach(eng => {
                    this.engines!.push({
                        name: eng.name,
                        node: node.name,
                        running: eng.running !== 'false'
                    });
                    logActions.push(new Action({
                        text: eng.name,
                        action: () => this.browseLogs(eng.name)
                    }));
                });
            });
            list.indexes.forEach(idx => {
                logActions.push(new Action({
                    text: idx.name,
                    action: () => this.browseLogs(idx.engines[0].name, idx.name)
                }));
            });
            this.updateSelectedEngine();
        });
    }

    buildSampleAction(sample: SQLSample): Action {
        return new Action({
            icon: sample.icon,
            text: sample.name,
            children: sample.children?.map(s => this.buildSampleAction(s)),
            action: sample.code? () => this.editor?.insertCode(sample.code!) : undefined
        });
    }

    /**
     * Update the engine selected in the current SQL query
     * (callback used by the child sql-editor component)
     * @param query 
     */
    updateSelectedEngine() {
        const query = this.editor?.getQuery();
        if(query) {
            this.selectedEngine = this.engines?.find(e => query.engine === e.name);
        }
    }

    browseLogs(engine: string, index?: string) {
        this.engineService.browseLogs(engine, index).subscribe(data => {
            console.log(data);
        });
    }



    // SQL

    /**
     * Executes the current SQL query edited in the sql-editor child component (if any)
     */
    run() {
        const sql = this.editor?.getCurrentSQL();
        if(sql) {
            this.searchInProgress = true;
            this.sqlService.exec(sql, this.selectedEngine?.name || undefined)
                .subscribe(data => this.setData(data))
                .add(() => this.searchInProgress = false);
        }

        // Save the currently open tab in the user settings
        this.editor?.updateTab();
    }

    /**
     * Set the result data coming from the server and collapse the editor
     * @param data 
     */
    setData(data: SQLData) {
        this.data = data;

        // Collapse the editor to its min size upon receiving results
        this.editor?.collapse();
    }

    /**
     * When the datatable finishes processing new data, this callback computes
     * how long this processing/rendering has taken.
     * @param event 
     */
    onRowDataChanged(event: any) {
        if(this.data?.$receivedTime) {
            this.renderingTime = new Date().getTime() - this.data.$receivedTime;
            this.data.$receivedTime = 0;
        }
    }

    // Misc

    ngOnDestroy() {
        this.subscriptions.forEach(s => s.unsubscribe());
    }
}