import { Component, OnDestroy } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { PreviewService } from '@sinequa/components/preview';
import { SearchService } from '@sinequa/components/search';
import { PreviewData } from '@sinequa/core/web-services';
import { Subscription } from 'rxjs';

@Component({
    selector: 'ses-preview',
    templateUrl: './preview.component.html',
    styles: [`
.results-list {
    max-height: 200px;
    flex-wrap: nowrap;
    overflow: auto;
}
.preview {
    height: 500px;
}
.wrap {
    word-break: break-all;
}
    `]
})
export class PreviewComponent implements OnDestroy {

    selectedRecord = 0;

    previewData?: PreviewData;
    downloadUrl?: SafeResourceUrl;
    decodedUrl?: string;

    subscription: Subscription;

    constructor(
        public searchService: SearchService,
        public previewService: PreviewService) {

        this.subscription = this.searchService.resultsStream.subscribe(results => {
            if(results?.records?.length) {
                this.open(0);
            }
        });
    }

    open(index: number) {
        this.selectedRecord = index;
        const record = this.searchService.results?.records[index];
        if(record) {
            this.previewService.getPreviewData(record.id, this.searchService.query).subscribe(data => {
                this.previewData = data;
                this.downloadUrl = this.previewService.makeDownloadUrl(data.documentCachedContentUrl);
                this.decodedUrl = decodeURIComponent(data.documentCachedContentUrl.replace(/\+/g, ' '));
                const i = this.decodedUrl.indexOf("~")+1;
                const j = this.decodedUrl.indexOf("~", i);
                this.decodedUrl = this.decodedUrl.slice(0,i) 
                    +decodeURIComponent(this.decodedUrl.slice(i,j).replace(/\//g, ''))
                    +this.decodedUrl.slice(j);
            });
        }
        return false;
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}