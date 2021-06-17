import { Component, EventEmitter, Input, Output, OnDestroy } from "@angular/core";
import { MonacoEditorConstructionOptions } from "@materia-ui/ngx-monaco-editor";
import { SQLQuery, SQLWebService } from "../sql.service";
import { UserPreferences } from "@sinequa/components/user-settings";
import { LoginService } from "@sinequa/core/login";
import { Subscription } from "rxjs";

@Component({
    selector: 'sql-editor',
    templateUrl: './sql-editor.component.html',
    styleUrls: ['./sql-editor.component.scss', '../tab-styling.scss']
})
export class SQLEditorComponent implements OnDestroy {

    @Input() engine: string;
    @Input() searchInProgress = false;
    @Output() queryChanged = new EventEmitter<SQLQuery>();

    // Saved SQL query tabs

    editedTab?: number;
    editedTabName?: string;

    
    // Code editor (Monaco)
    
    editorOptions: MonacoEditorConstructionOptions = {
        theme: 'vs',
        language: 'sql',
        contextmenu: true,
        minimap: {
            enabled: false
        },
        wordWrap: "on",
        fontSize: 12
    };
    editor: monaco.editor.ICodeEditor

    editorMinHeight = 100;
    editorMaxHeight = 500;
    editorHeight = this.editorMinHeight;
    collapsing = false;

    sqlValue: string = '';
    
    // Misc
    subscriptions: Subscription[] = [];

    constructor(
        public sqlService: SQLWebService,
        public loginService: LoginService,
        public prefs: UserPreferences
    ){

        if(this.loginService.complete) {
            this.selectTab(this.selectedTab);
        }
        else {
            this.subscriptions.push(this.loginService.events.subscribe(event => {
                if(event.type === "session-start") {
                    this.selectTab(this.selectedTab);
                }
            }));
        }
    }

    /**
     * Returns the SQL command currently edited by the user (based on the cursor)
     * within the text in the editor.
     * This method is called by the parent component.
     */
    public getCurrentSQL(): string {

        let pos = this.editor?.getPosition();
        const model = this.editor?.getModel();

        // If the editor is not ready/available, just work with the raw content
        if(!pos || !model) {
            return this.sqlValue.trim();
        }

        // Take the end of the selection (if any) and use the following algorithm instead of the cursor position
        const selection = this.editor.getSelection();
        if(selection && !selection.isEmpty()) {
            pos = selection.getEndPosition();
        }

        // Iterate through the content lines to build the SQL commands (separated by empty lines), until we find the cursor position
        const content = model.getLinesContent();
        let currentSQL = "";
        let resetSQL = false;
        for(let i=0; i<content.length; i++) {
            const line = content[i];
            const hasContent = line.trim().length > 0;
            if(hasContent) {
                if(resetSQL) {
                    currentSQL = ""; // Reset current SQL
                    resetSQL = false;
                }
                currentSQL += " "+line; // Append to current SQL
            }
            else {
                if(i >= pos.lineNumber-1 && currentSQL) {
                    break;
                }
                resetSQL = true;
            }
        }

        return currentSQL;
    }

    /**
     * Collapse the editor to its minimum height.
     * This method is called by the parent component.
     */
    collapse() {
        this.editorHeight = this.editorMinHeight;
        this.collapsing = true;
        setTimeout(() => this.collapsing = false, 600); // let the CSS transition the height
    }

    /**
     * Insert code on a new line in the editor
     * @param code 
     */
    insertCode(code: string) {
        const selection = this.editor.getSelection();
        this.editor.executeEdits(undefined, [
            {range: selection!, text: code}
        ])
    }

    
    // Query tabs management

    get selectedTab(): number {
        return this.prefs.get("sql-console-selected-tab") || 0;
    }

    /**
     * Returns the currently edited SQLQuery object.
     * This method is called by the parent component.
     */
    public getQuery(): SQLQuery | undefined {
        return this.sqlService.queries[this.selectedTab];
    }

    selectTab(i: number) {
        this.prefs.set("sql-console-selected-tab", i);
        this.sqlValue = this.sqlService.queries[i].query;
        this.queryChanged.next(this.sqlService.queries[i]);
        setTimeout(() => this.updateEditorHeight());
        return false;
    }

    editTab(i: number) {
        this.editedTab = i;
        this.editedTabName = this.sqlService.queries[i].name;
    }

    endEditTab() {
        if(this.editedTab !== undefined && this.editedTabName && this.sqlService.queries[this.editedTab]) {
            this.sqlService.queries[this.editedTab].name = this.editedTabName;
            this.sqlService.updateQuery(this.sqlService.queries[this.editedTab], this.editedTab);
        }
        this.editedTab = undefined;
        this.editedTabName = undefined;
    }

    createTab() {
        this.sqlService.createQuery({
            name: "Query "+((this.getHighestTabIndex("Query ") || 0)+1),
            query: "",
            engine: this.engine || ""
        });
        this.selectTab(this.sqlService.queries.length-1);
        return false;
    }

    deleteTab(i: number, event: Event) {
        this.sqlService.deleteQuery(i);
        if(this.selectedTab > i) {
            this.selectTab(this.selectedTab-1);
        }
        else if(this.selectedTab === i) {
            if(this.selectedTab < this.sqlService.queries.length){
                this.selectTab(this.selectedTab);
            }
            else if(this.sqlService.queries.length > 0) {
                this.selectTab(this.selectedTab-1);
            }
            else {
                this.prefs.set("sql-console-selected-tab", 0);
                this.sqlValue = "";
            }
        }
        event.stopPropagation();
        return false;
    }

    updateTab() {
        // Update query data stored in user settings
        const query = this.getQuery();
        if(query) {
            query.query = this.sqlValue;
            query.engine = this.engine || "";
            this.sqlService.updateQuery(query, this.selectedTab);
        }
    }

    private getHighestTabIndex(prefix: string): number {
        return this.sqlService.queries
            .filter(q => q.name.startsWith(prefix))
            .map(q => parseInt(q.name.slice(prefix.length)))
            .filter(val => !isNaN(val))
            .sort((a,b)=>b-a)[0];
    }

    
    // MONACO EDITOR events

    onEditorInit(editor: monaco.editor.ICodeEditor) {
        this.editor = editor;
        editor.onDidContentSizeChange(() => this.updateEditorHeight());
        editor.onDidFocusEditorWidget(() => this.updateEditorHeight());
        this.updateEditorHeight();
    }

    updateEditorHeight() {
        if(!this.editor || this.collapsing) {
            return;
        }
        this.editorHeight = Math.min(this.editorMaxHeight, Math.max(this.editorMinHeight, this.editor.getContentHeight()));
        const width = this.editor.getContainerDomNode().clientWidth;
        this.editor.layout({ width, height: this.editorHeight });
    }


    // Misc

    ngOnDestroy() {
        this.subscriptions.forEach(s => s.unsubscribe());
    }
}