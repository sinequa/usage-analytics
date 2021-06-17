import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormatService } from "@sinequa/core/app-utils";
import { ModalService } from "@sinequa/core/modal";
import { ColDef, GridApi, ColumnApi, GridReadyEvent, RowDataChangedEvent, CellDoubleClickedEvent, CsvExportParams, SelectionChangedEvent } from 'ag-grid-community';
import { SesameService } from "../../sesame.service";
import { SQLDataModalComponent } from "../sql-data-modal/sql-data-modal.component";
import { SQLAttributes, SQLData, SQLWebService, standardAttributes } from "../sql.service";

export interface ResultTab {
    name: string;
    type: string;
    selected?: boolean;
}

@Component({
    selector: 'sql-table',
    templateUrl: './sql-table.component.html',
    styleUrls: ['./sql-table.component.scss', '../tab-styling.scss']
})
export class SQLTableComponent {
    
    @Input() data: SQLData;
    @Output() rowDataChanged = new EventEmitter<RowDataChangedEvent>();

    // Data Table

    defaultColDef: ColDef = {
        sortable: true,
        filter: true,
        resizable: true
    }
    
    resultTabs?: ResultTab[];
    columns: ColDef[] = [];
    rows: any[] = [];

    hideEmptyColumns = true;
    selectedRows = 0;

    gridApi: GridApi | null | undefined;
    gridColumnApi: ColumnApi | null | undefined;

    constructor(
        public sesameService: SesameService,
        public modalService: ModalService,
        public formatService: FormatService,
        public sqlService: SQLWebService,

    ){

    }

    ngOnChanges() {
        
        this.resultTabs = [];

        // data is undefined on initialization
        if(this.data) {
            if(this.data.rows) {
                this.resultTabs.push({name: "Rows", type: "records"});
            }
    
            this.resultTabs.push({name: "Attributes", type: "attributes"});
    
            Object.keys(this.data.attributes).forEach(prop => {
                if(standardAttributes.indexOf(prop) === -1) {
                    this.resultTabs!.push({name: prop, type: "distribution"});
                }
            });
    
            this.selectResultTab(this.resultTabs[0]);
        }

    }

    // Result tabs management

    selectResultTab(tab: {name: string, type: string, selected?: boolean}) {
        // Update tabs state
        this.resultTabs?.forEach(t => t.selected = t === tab);

        // Avoid wrong column order
        this.resetTableData();  

        // Update table data
        if(this.data) {
            switch(tab.type){
                case "records": this.setRecordList(this.data.columns, this.data.rows!); break;
                case "attributes": this.setAttributes(this.data.attributes); break;
                case "distribution": this.setDistribution(this.data.attributes[tab.name]); break;
            }
        }
        return false;
    }
    
    setRecordList(columns: string[], rows: any[][]) {
        // Note: for a standard search query, this method runs in 5-10ms (going through each cell of the table)

        this.columns = columns.map(column => {
            return { field: column, tooltipField: column, headerName: column, headerTooltip: column }
        });

        const columnStats = this.columns.map(str => {
            return {
                isEmpty: true,
                maxLength: str.headerName!.length,
                totalLength: 0
            }
        });

        this.rows = rows.map(row => {
            const _row = {};
            for(let i=0; i<columns.length; i++) {
                let val = row[i];
                const isEmpty = val === "" || val === 0 || val === false;
                val = ""+val;
                _row[columns[i]] = val;
                const length = val.length;
                const stat = columnStats[i];
                stat.isEmpty &&= isEmpty;
                if(length > stat.maxLength) {
                    stat.maxLength = length;
                }
                stat.totalLength += length;
            }
            return _row;
        });

        const totalSize = columnStats.reduce((p,c) => p+c.totalLength, 0);

        this.columns.forEach((c,i) => {
            const stats = columnStats[i];
            if(stats.isEmpty && this.hideEmptyColumns) {
                c.hide = true;
            }
            else {
                c.width = Math.min(Math.max(stats.maxLength * 5 + 50, 60), 250);
            }
            c.headerTooltip += " (" + this.formatService.formatMemorySize(stats.totalLength) + " / " + Math.ceil(1000*stats.totalLength/totalSize)/10+ "%)";
        });
    }

    setAttributes(attributes: SQLAttributes) {
        const columns = ["attribute", "value"];
        
        this.columns = columns.map(column => {
            return { field: column, tooltipField: column }
        });

        this.rows = standardAttributes
            .filter(attr => !!attributes[attr])
            .map(row => {
                return {
                    attribute: row,
                    value: attributes[row]
                };
            });
    }

    setDistribution(dist: string) {
        const data = dist.split(';');
        const columns = this.sqlService.guessDistributionColumns(data);

        this.columns = columns.map(column => {
            return { field: column, tooltipField: column }
        });

        this.rows = [];
        for(let i=0; i<data.length; i+=columns.length) {
            const row = {};
            row[columns[0]] = data[i];
            row[columns[1]] = data[i+1];
            row[columns[2]] = data[i+2];
            row[columns[3]] = data[i+3];
            this.rows.push(row);
        }        
    }

    
    resetTableData() {
        this.gridApi?.setRowData([]);
        this.gridApi?.setColumnDefs([]);
        this.selectedRows = 0;
    }

    // Data actions

    getExportParams(): CsvExportParams {
        const params: CsvExportParams = {};
        if(this.selectedRows) {
            params.onlySelected = true;
        }
        return params;
    }

    downloadCsv() {
        this.gridApi?.exportDataAsCsv(this.getExportParams());
    }

    copyToClipboard() {
        const data = this.gridApi?.getDataAsCsv(this.getExportParams());
        if(data) {
            this.sesameService.copyToClipboard(data);
        }
    }

    selectRows() {
        this.gridApi?.selectAll();
    }

    unselectRows() {
        this.gridApi?.deselectAll();
    }

    toggleHideEmptyColumns() {
        const tab = this.resultTabs?.find(t => t.selected);
        if(tab) {
            this.selectResultTab(tab);
        }
    }


    // AG-GRID events

    onGridReady(event: GridReadyEvent) {
        this.gridApi = event.api;
        this.gridColumnApi = event.columnApi;
    }

    onRowDataChanged(event: RowDataChangedEvent) {
        this.rowDataChanged.next(event); // Forward the event to the parent
        //event.columnApi.autoSizeColumns(this.columns.map(c => c.field));
    }

    onCellDoubleClicked(event: CellDoubleClickedEvent) {
        this.modalService.open(SQLDataModalComponent, {
            model: {
                row: event.data,
                column: event.colDef.headerName || event.colDef.field,
                cell: event.value
            }
        })
    }

    onSelectionChanged(event: SelectionChangedEvent) {
        this.selectedRows = this.gridApi?.getSelectedRows()?.length || 0;
    }



}