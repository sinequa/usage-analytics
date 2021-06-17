import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, AbstractControl, ValidationErrors } from '@angular/forms';
import { SearchService } from '@sinequa/components/search';
import { AppService } from '@sinequa/core/app-utils';
import { Utils } from '@sinequa/core/base';
import { LoginService } from '@sinequa/core/login';
import { ValidationService } from '@sinequa/core/validation';
import { Select } from '@sinequa/core/web-services';
import { Subscription } from 'rxjs';

@Component({
    selector: 'sq-query-editor',
    templateUrl: './query-editor.component.html',
    styles: [`
.select:hover {
    background-color: #eee;
}
    `]
})
export class QueryEditorComponent implements OnDestroy {

    @ViewChild("selectInput") selectInput: ElementRef;

    public queryForm: FormGroup;

    subscriptions: Subscription[] = [];
    
    constructor(
        public searchService: SearchService,
        public appService: AppService,
        public formBuilder: FormBuilder,
        public loginService: LoginService,
        public validationService: ValidationService) {

        this.queryForm = this.formBuilder.group({
            queryName: '',
            tab: '',
            scope: '',
            page: new FormControl('', [this.validationService.integerValidator(), this.validationService.minValidator(1)]),
            pageSize: new FormControl('', [this.validationService.integerValidator(), this.validationService.minValidator(0)]),
            sort: '',
            select: new FormControl('', (control: AbstractControl) => this.parseExpr(control.value))
        });
        
        if(this.appService.ccquery) {
            this.queryForm.get('queryName')?.setValue(this.appService.ccquery.name);
        }
        else {
            this.subscriptions.push(this.loginService.events.subscribe(event => {
                if(event.type === "session-start") {
                    this.queryForm.get('queryName')?.setValue(this.appService.ccquery!.name);
                }
            }));
        }

        this.subscriptions.push(this.searchService.queryStream.subscribe(query => {
            if(this.appService.ccquery?.tabSearch.isActive){
                this.queryForm.get('tab')?.enable();
            }
            else {
                this.queryForm.get('tab')?.disable();
            }
            if(this.appService.ccquery?.scopesActive){
                this.queryForm.get('scope')?.enable();
            }
            else {
                this.queryForm.get('scope')?.disable();
            }
            this.queryForm.get('tab')?.setValue(query?.tab || '');
            this.queryForm.get('scope')?.setValue(query?.scope || '');
            this.queryForm.get('page')?.setValue(query?.page || '');
            this.queryForm.get('pageSize')?.setValue(query?.pageSize || '');
            this.queryForm.get('sort')?.setValue(query?.sort || '');
        }));
    }

    onSubmit(formValue: {[key: string]: string}){

        if (!this.queryForm.valid) {
            return;
        }

        let needsSearch = false;

        if(formValue.queryName && formValue.queryName !== this.appService.ccquery?.name) {
            const query = this.searchService.query;
            if(this.appService.setCCQuery(formValue.queryName)) { // the search service resets the query via a listener
                query.name = formValue.queryName;
                this.searchService.setQuery(query);
                needsSearch = true;
            }
        }

        needsSearch = this.setQueryProperty(formValue.tab, "tab") || needsSearch;
        needsSearch = this.setQueryProperty(formValue.scope, "scope") || needsSearch;
        needsSearch = this.setQueryProperty(formValue.page, "page", true) || needsSearch;
        needsSearch = this.setQueryProperty(formValue.pageSize, "pageSize", true) || needsSearch;
        needsSearch = this.setQueryProperty(formValue.sort, "sort") || needsSearch;

        if(formValue.select !== '') {
            this.searchService.query.addSelect(formValue.select);
            this.queryForm.get('select')?.setValue('');
            needsSearch = true;
        }

        if(needsSearch) {
            this.searchService.navigate();
            this.queryForm.markAsPristine();
            this.queryForm.markAsUntouched();
            this.queryForm.updateValueAndValidity();
        }
    }

    private setQueryProperty(value: string, property: string, asNumber = false): boolean {        
        if((!value && this.searchService.query[property]) || (value && value !== this.searchService.query[property])) {
            if(!value) {
                delete this.searchService.query[property];
            }
            else {
                this.searchService.query[property] = asNumber? +value : value;
            }
            return true;
        }
        return false;
    }

    // Clear everything but the query text
    clearQuery() {
        const text = this.searchService.query.text;
        this.searchService.clearQuery();
        if(text) {
            this.searchService.query.text = text;
        }
        this.searchService.search();
    }

    editSelect(select: Select) {
        this.removeSelect(select);        
        this.queryForm.get('select')?.setValue(select.expression);
        this.selectInput.nativeElement.focus();
    }

    removeSelect(select: Select) {
        if(this.searchService.query.select) {
            const i = this.searchService.query.select.indexOf(select);
            this.searchService.query.select.splice(i,1);
            if(this.searchService.query.select.length === 0) {
                delete this.searchService.query.select;
            }
            this.searchService.navigate();
        }
    }

    parseExpr(value: string): ValidationErrors | null {
        if(value) {
            const expr = this.appService.parseExpr(value);
            if(Utils.isString(expr)) {
                return {error: {exprError: expr}};
            }
        }
        return null;
    }

    ngOnDestroy(){
        this.subscriptions.forEach(s => s.unsubscribe());
    }
}