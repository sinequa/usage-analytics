import { Injectable } from "@angular/core";
import { ConfirmType, ModalButton, ModalResult, ModalService } from "@sinequa/core/modal";
import { NotificationsService } from "@sinequa/core/notification";
import { Subject } from "rxjs";
import { DashboardService } from "./dashboard/dashboard.service";


@Injectable({
    providedIn: 'root',
})
export class ImportService {

    importedData$  = new Subject<string | ArrayBuffer | null>();

    constructor(
        private modalService: ModalService,
        private dashboardService: DashboardService,
        private notificationService: NotificationsService
    ) {}

    dashboardsDefFromJson() {
        this.modalService
            .confirm({
                title: "Import dashboards definition",
                message: "You are about to lose ALL your current dashboards definition. Do you want to continue?",
                buttons: [
                    new ModalButton({result: ModalResult.Cancel}),
                    new ModalButton({result: ModalResult.OK, text: "Confirm", primary: true})
                ],
                confirmType: ConfirmType.Warning
            }).then(res => {
                if(res === ModalResult.OK) {

                    this.importedData$.subscribe(
                        (data) => {
                            if (this.isValidJSON(data as string)) {
                                const dashboards = JSON.parse(data as string);
                                this.dashboardService.overrideDashboards(dashboards, "import");
                            } else {
                                this.notificationService.error("Not a valid JSON file !");
                            }
                        },
                        () => this.notificationService.error("Could not import dashboards definition !")
                    );

                    this.import("application/JSON");
                }
            });
    }

    import(fileType: string) {
        const fileInput = document.createElement('input');
        fileInput.setAttribute('type', "file");
        fileInput.setAttribute('accept', fileType);

        fileInput.addEventListener('change', () => {
            const file = fileInput.files?.[0];
            if(file) {
                const reader = new FileReader();
                reader.onload = () => {
                    this.importedData$.next(reader.result);
                }
                reader.readAsText(file);
            }
        });

        fileInput.click();
    }

    private isValidJSON(data: any) {
        try {
            JSON.parse(data);
            return true;
        } catch {
            return false;
        }
    }
}

