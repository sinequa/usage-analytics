import { NgModule/*, APP_INITIALIZER*/ } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { RouterModule, Routes } from '@angular/router';

import { MonacoEditorModule } from '@materia-ui/ngx-monaco-editor';
import { AgGridModule } from 'ag-grid-angular';

import { BsSearchModule } from "@sinequa/components/search";
import { BsModalModule } from "@sinequa/components/modal";
import { BsActionModule } from "@sinequa/components/action";
import { UtilsModule } from '@sinequa/components/utils';

import { SQLEditorComponent } from "./sql-editor/sql-editor.component";
import { SQLConsoleComponent } from './sql-console.component';
import { SQLDataModalComponent } from './sql-data-modal/sql-data-modal.component';
import { SQLTableComponent } from './sql-table/sql-table.component';


const routes: Routes = [
    {path: '', component: SQLConsoleComponent}
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild(routes),

        MonacoEditorModule,
        AgGridModule.withComponents([]),

        BsSearchModule,
        BsModalModule,
        BsActionModule,
        UtilsModule
    ],
    declarations: [
        SQLConsoleComponent,
        SQLDataModalComponent,
        SQLEditorComponent,
        SQLTableComponent
    ],
    exports: [
        SQLConsoleComponent
    ]
})
export class SQLConsoleModule {
}