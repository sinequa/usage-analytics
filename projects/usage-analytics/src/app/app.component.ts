import { Component } from "@angular/core";
import { AppService } from "@sinequa/core/app-utils";
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
        return (this.appService.app?.data?.enableUserFeedbackMenu ?? enableUserFeedbackMenu) as boolean;
    }
}
