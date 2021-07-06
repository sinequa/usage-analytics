import { Component, ChangeDetectorRef } from "@angular/core";
import { ComponentWithLogin, LoginService } from "@sinequa/core/login";

@Component({
    selector: "app",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"]
})
export class AppComponent extends ComponentWithLogin {

    constructor(
        // These 2 services are required by the constructor of ComponentWithLogin
        public loginService: LoginService,
        cdRef: ChangeDetectorRef
    ){
        super(loginService, cdRef);

    }

}
