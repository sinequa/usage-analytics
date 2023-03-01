import { Component } from "@angular/core";
import { AppService } from "@sinequa/core/app-utils";
import { Utils } from "@sinequa/core/base";
import { ComponentWithLogin } from "@sinequa/core/login";
import { enableUserFeedbackMenu } from "./audit/config";

@Component({
    selector: "sq-app",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"]
})
export class AppComponent extends ComponentWithLogin {
    constructor(public appService: AppService) {
        super();
    }

    get enableUserFeedbackMenu(): boolean {
        return (Utils.isUndefined(this.appService.app?.data?.enableUserFeedbackMenu) ? enableUserFeedbackMenu : this.appService.app?.data?.enableUserFeedbackMenu) as boolean ;
    }
}
