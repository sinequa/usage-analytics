import { Component, OnDestroy } from "@angular/core";
import { SearchService } from "@sinequa/components/search";
import { AppService } from "@sinequa/core/app-utils";
import { LoginService } from "@sinequa/core/login";
import { Results } from "@sinequa/core/web-services";
import { Subscription } from "rxjs";

@Component({
    selector: 'ses-query-compare',
    templateUrl: './query-compare.component.html',
    styles: [`
ses-result-item {
    display: block;
    margin-bottom: 1em;
}

ses-result-item ::ng-deep .sq-relevant-extracts {
    height: 6em;
    max-height: 6em;
    overflow: hidden;
}
    `]
})
export class QueryCompareComponent implements OnDestroy {
    secQueryName: string;
    secResults?: Results;

    subscriptions: Subscription[] = [];

    constructor(
        public appService: AppService,
        public loginService: LoginService,
        public searchService: SearchService
    ){
        
        // Initiate the secondary query name (depending on whether we are already logged in or not)
        if(this.appService.ccquery) {
            this.initSecQueryName();
        }
        else {
            this.subscriptions.push(this.loginService.events.subscribe(event => {
                if(event.type === "session-start") {
                    this.initSecQueryName();
                }
            }));
        }

        // When the primary query changes, we get results for the secondary query as well
        this.subscriptions.push(this.searchService.queryStream.subscribe(query => {
            if(!query) {
                this.secResults = undefined;
            }
            else {
                this.secQueryChanged();
            }
        }));
    }

    /**
     * Try to find a query web service different from the primary one
     */
    initSecQueryName() {
        const name = Object.keys(this.appService.app!.queries)
            .find(name => name !== this.appService.ccquery!.name);
        this.secQueryName = name || this.appService.ccquery!.name;
    }

    /**
     * Fetch new results for the secondary query
     */
    secQueryChanged() {
        const secQuery = this.searchService.query.copy();
        secQuery.name = this.secQueryName;
        this.searchService.getResults(secQuery)
            .subscribe(r => this.secResults = r);
    }

    ngOnDestroy() {
        this.subscriptions.forEach(s => s.unsubscribe());
    }
}