import { Injectable } from "@angular/core";
import { SearchService } from "@sinequa/components/search";
import { ConfirmType, ModalButton, ModalResult, ModalService } from "@sinequa/core/modal";
import { NotificationsService } from "@sinequa/core/notification";
import { UserSettingsWebService } from "@sinequa/core/web-services";
import { Subject } from "rxjs";


@Injectable({
    providedIn: 'root',
})
export class ImportService {

    importedData$  = new Subject<string | ArrayBuffer | null>();

    constructor(
        private modalService: ModalService,
        private userSettingsService: UserSettingsWebService,
        private searchService: SearchService,
        private notificationService: NotificationsService
    ) {}

    dashboardsDefFromJson() {
        this.modalService.confirm({
            title: "Import definition",
            message: "You are about to reset ALL your dashboards definition. Do you want to continue?",
            buttons: [
                new ModalButton({result: ModalResult.OK, text: "Confirm"}),
                new ModalButton({result: ModalResult.Cancel, primary: true})
            ],
            confirmType: ConfirmType.Warning
        }).then(res => {
            if(res === ModalResult.OK) {
                this.importedData$.subscribe(
                    (data) => {
                        if (this.isValidJSON(data as string)) {
                            const dashboards = JSON.parse(data as string);
                            this.userSettingsService
                            .patch({dashboards: dashboards})
                            .subscribe(
                                () => {
                                    delete this.searchService.queryStringParams.dashboard;
                                    this.searchService.navigate({skipSearch: true}).then(
                                        () => window.location.reload()
                                    )
                                },
                                (error) => {
                                    this.notificationService.error("Could not update dashboards definition !");
                                    console.error("Could not update dashboards definition !", error);
                                },
                                () => {
                                }
                            );
                        } else {
                            this.notificationService.error("Not a valid JSON file !");
                        }
                    },
                    () => this.notificationService.error("Could not read dashboards definition !")
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

