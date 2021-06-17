import { Component, Input } from "@angular/core";
import { Record } from "@sinequa/core/web-services";

@Component({
    selector: 'ses-result-item',
    template: `
<div class="record d-flex">
    <div class="flex-grow-1 overflow-hidden">
        <div class="d-flex align-items-center">
            <sq-result-title [record]="record"></sq-result-title>
        </div>
        <sq-result-source [record]="record" [displayTreepath]="true"></sq-result-source>
        <sq-result-extracts [record]="record"></sq-result-extracts>
        <sq-result-missing-terms [record]="record"></sq-result-missing-terms>
    </div>
    <sq-result-thumbnail [record]="record" [thumbnailColumn]="'sourcevarchar4'" [linkBehavior]="'action'" class="align-self-center">
    </sq-result-thumbnail>
</div>
    `,
    styles: [`
::ng-deep sq-result-thumbnail img {
    max-width: 100px;
    max-height: 150px;
    border-radius: 3px;
}
    `]
})
export class ResultItemComponent {
    @Input() record: Record;
}