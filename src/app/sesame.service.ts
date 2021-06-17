import { Injectable } from "@angular/core";
import { NotificationsService } from "@sinequa/core/notification";
import { BehaviorSubject } from "rxjs";
import { Clipboard } from '@angular/cdk/clipboard';

@Injectable({
    providedIn: 'root'
})
export class SesameService {
    public inputText = new BehaviorSubject<string>("");

    constructor(
        private clipboard: Clipboard,
        private notificationService: NotificationsService
    ) {

    }

    copyToClipboard(data: string, maxLength = 30) {
        if (!navigator?.clipboard) {
            // Note: CDK seems to struggle with large chunks of text
            this.copyToClipboardCdk(data, maxLength);
            return;
        }
        navigator.clipboard.writeText(data).then(() => {
            this.notificationService.success("\""+(data.length>maxLength? (data.slice(0,maxLength) + "...") : data)+"\" copied to the clipboard");
        }, err => {
            this.notificationService.warning("Clipboard error");
        });
    }

    copyToClipboardCdk(data: string, maxLength = 30) {
        const pending = this.clipboard.beginCopy(data);
        let remainingAttempts = 3;
        const attempt = () => {
            const result = pending.copy();
            if (!result && --remainingAttempts) {
                setTimeout(attempt);
            } else {
                // Remember to destroy when you're done!
                pending.destroy();
                if(result) {
                    this.notificationService.success("\""+(data.length>maxLength? (data.slice(0,maxLength) + "...") : data)+"\" copied to the clipboard");
                }
                else {
                    this.notificationService.warning("Clipboard error");
                }
            }
        };
        attempt();
    }
}