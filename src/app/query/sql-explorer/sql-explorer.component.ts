import { Component, Input, OnChanges } from '@angular/core';

interface Aggregation {
    clause: string;
    column: string;
    short?: string;
    alias?: string;
    function?: string;
    params?: string[];
    collapsed: boolean;
}
type SelectClause = Aggregation | string;

@Component({
    selector: 'sq-sql-explorer',
    templateUrl: './sql-explorer.component.html',
    styles: [`
.clause {
    overflow-wrap: anywhere;
    font-size: 0.9em;
}
.clause.collapsed {
    overflow: hidden;
    overflow-wrap: initial;
    text-overflow: ellipsis;
    max-height: 1.5em;
}
.clause:hover span {
    background-color: #eee;
    cursor: pointer;
}
.clause-list {
    max-height: 300px;
    overflow: auto;
}
    `]
})
export class SQLExplorerComponent implements OnChanges {
    @Input() statement: string;

    sqlRgx = /\s*select\s+(.+?)\s+from\s+(.+?)\s+where\s+(.+?)(\s+group by (.+?))?(\s+order by (.+?))?\s+skip\s+(\d+)\s+count\s+(\d+)(\s+forget\s+above (\d+)+)?\s*/i;
    selRgx = /(\w+)(\('?(.+?)'?\)(\s+as\s+(\w+))?)?/gi;

    selects: SelectClause[]|undefined;
    indexes: string[];
    whereClauses: string[];
    groupBy: string;
    orderBy: string[];
    skip: number;
    count: number;
    forgetAbove: number;

    ngOnChanges() {
        this.selects = undefined;
        if(this.statement) {
            const match = this.sqlRgx.exec(this.statement);
            if(match) {
                let select = this.selRgx.exec(match[1]);
                this.selects = [];
                while(select !== null) {
                    const column = select[3]? select[3]?.split(',')[0] : select[1];
                    const fct = select[3]? select[1] : undefined;
                    this.selects.push({
                        clause: select[0],
                        short: fct? fct+'('+column+')' : column,
                        column: column,
                        function: fct,
                        alias: select[5],
                        params: select[3]?.split(','),
                        collapsed: true
                    });
                    select = this.selRgx.exec(match[1]);
                }
                this.indexes = match[2].split(",");
                this.whereClauses = match[3].split(" and ");
                this.groupBy = match[5];
                this.orderBy = match[7]?.split(",");
                this.skip = +match[8];
                this.count = +match[9];
                this.forgetAbove = +match[11];
            }
        }
    }

}