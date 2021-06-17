import { Component } from "@angular/core";
import { SearchService } from "@sinequa/components/search";
import { AppService } from "@sinequa/core/app-utils";
import { Utils } from "@sinequa/core/base";
import { LoginService } from "@sinequa/core/login";
import { SuggestFieldWebService, Suggestion, SuggestQueryWebService } from "@sinequa/core/web-services";
import { Observable, of, Subscription } from "rxjs";
import { SesameService } from "../sesame.service";

@Component({
    selector: 'ses-suggests',
    templateUrl: './suggests.component.html'
})
export class SuggestsComponent {

    suggestQuery: string;
    suggestFields: string[] = [];
    suggestsField$: Observable<Suggestion[]>;
    suggestsQuery$: Observable<Suggestion[]>;

    subscriptions: Subscription[] = [];
    
    constructor(
        public loginService: LoginService,
        public appService: AppService,
        public searchService: SearchService,
        public suggestQueryWebService: SuggestQueryWebService,
        public suggestFieldWebService: SuggestFieldWebService,
        public sesameService: SesameService
    ){
        
        this.subscriptions.push(this.sesameService.inputText.subscribe(value => {
            if(value) {
                this.suggest(value);
            }
            else {
                this.suggestsQuery$ = of([]);
                this.suggestsField$ = of([]);
            }
        }));
        

        if(this.loginService.complete) {
            this.suggestQuery = this.appService.suggestQueries[0];
        }
        else {
            this.subscriptions.push(this.loginService.events.subscribe(event => {
                if(event.type === "session-start") {
                    this.suggestQuery = this.appService.suggestQueries[0];
                }
            }));
        }
    }

    
    suggest = Utils.debounce(() => {
        if(this.suggestFields.length > 0) {
            this.suggestsField$ = this.suggestFieldWebService.get(this.sesameService.inputText.value, this.suggestFields, this.searchService.query);
        }
        this.suggestsQuery$ = this.suggestQueryWebService.get(this.suggestQuery, this.sesameService.inputText.value, this.appService.ccquery!.name, this.suggestFields);
    }, 200);
    
    clearSuggestFields() {
        this.suggestFields = [];
        this.suggest();
        this.suggestsField$ = of([]);
        return false;
    }

    ngOnDestroy() {
        this.subscriptions.forEach(s => s.unsubscribe());
    }

}