import { Component, Inject } from "@angular/core";
import { Action } from "@sinequa/components/action";
import { ModalButton, ModalResult, MODAL_MODEL } from "@sinequa/core/modal";
import { SesameService } from "../../sesame.service";

@Component({
    selector: 'sql-data-modal',
    templateUrl: './sql-data-modal.component.html',
    styles: [`
::ng-deep .modal-body {
    max-height: 70vh;
    overflow: auto;
}
pre {
    overflow: unset;
    font-size: 12px;
}
    `]
})
export class SQLDataModalComponent {

    buttons: ModalButton[];
    copyAction: Action;

    constructor(
        @Inject(MODAL_MODEL) public model: {cell: string, row: any, column: string},
        public sesameService: SesameService
    ){

    }

    ngOnInit() {
        // A "fake" button is needed to display the custom footer
        this.buttons = [
            new ModalButton({
                result: ModalResult.Ignore,
                visible: false
            })
        ];

        this.copyAction = new Action({
            icon: "far fa-copy",
            title: "Copy to Clipboard",
            action: () => {
                this.sesameService.copyToClipboard(this.model.cell);
            }
        });
    }
}