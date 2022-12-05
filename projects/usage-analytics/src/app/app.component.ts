import { Component } from "@angular/core";
import { ComponentWithLogin } from "@sinequa/core/login";

@Component({
    selector: "sq-app",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"]
})
export class AppComponent extends ComponentWithLogin {}
