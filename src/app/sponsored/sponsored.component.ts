import { Component, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppService } from '@sinequa/core/app-utils';
import { LinkResult, SponsoredLinksWebService } from '@sinequa/core/web-services';
import { SearchService } from '@sinequa/components/search';

@Component({
    selector: 'ses-sponsored',
    templateUrl: './sponsored.component.html'
})
export class SponsoredComponent implements OnDestroy {
    sponsoredLinks$: Observable<LinkResult[]>;

    subscription: Subscription;

    constructor(
        public searchService: SearchService,
        public appService: AppService,
        public sponsoredLinksWebService: SponsoredLinksWebService
    ) {
        

        this.subscription = this.searchService.queryStream.subscribe(query => {
            if(this.appService.app?.sponsoredLinks) {
                this.sponsoredLinks$ = this.sponsoredLinksWebService.getLinks(this.searchService.query, this.appService.app.sponsoredLinks)
                    .pipe(map(results => results.links));
            }
        });

    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }


}