import { Component, OnDestroy } from '@angular/core';
import { LoginService } from '@sinequa/core/login';
import { QueryIntentData } from '@sinequa/core/web-services';
import { SearchService } from '@sinequa/components/search';
import { Subscription } from 'rxjs';

@Component({
    selector: 'ses-query',
    templateUrl: './query.component.html',
    styles: [`
    :host {
        flex-direction: columns;
    }
code {
    white-space: break-spaces;
    max-height: 14rem;
    font-size: 0.9em;
}
    `]
})
export class QueryComponent implements OnDestroy {
    intentData?: QueryIntentData;
    
    sqlRaw = true;

    private subscription: Subscription;
    
    constructor(
        public loginService: LoginService,
        public searchService: SearchService
    ) {
        
        this.subscription = this.searchService.events.subscribe(event => {
            if(event.type === "make-query-intent-data") {
                this.intentData = (event as SearchService.MakeQueryIntentDataEvent).intentData;
            }
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}