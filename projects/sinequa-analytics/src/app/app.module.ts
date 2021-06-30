import { NgModule/*, APP_INITIALIZER*/ } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule, Routes } from '@angular/router';
import { LocationStrategy, HashLocationStrategy } from "@angular/common";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { GridsterModule } from "angular-gridster2";

// @sinequa/core library
import { WebServicesModule, StartConfigWebService, StartConfig } from "@sinequa/core/web-services";
import { LoginModule, LoginInterceptor } from "@sinequa/core/login";
import { IntlModule } from "@sinequa/core/intl";
import { ModalModule } from "@sinequa/core/modal";
import { NotificationsInterceptor } from "@sinequa/core/notification";
import { AuditInterceptor } from "@sinequa/core/app-utils";

// @sinequa/components library
import { BsSearchModule, SearchOptions, SEARCH_OPTIONS } from "@sinequa/components/search";
import { BsNotificationModule } from '@sinequa/components/notification';
import { UtilsModule } from '@sinequa/components/utils';
import { BsUserSettingsModule } from "@sinequa/components/user-settings";
import { BsFeedbackModule } from "@sinequa/components/feedback";
import { BsFacetModule } from "@sinequa/components/facet";
import { BsAdvancedModule } from "@sinequa/components/advanced";
import { BsModalModule } from "@sinequa/components/modal";
import { BsActionModule } from "@sinequa/components/action";
import {SelectionOptions, SELECTION_OPTIONS} from "@sinequa/components/selection";

// @sinequa/analytics library
import { BsTimelineModule } from "@sinequa/analytics/timeline";
import { BsHeatmapModule } from "@sinequa/analytics/heatmap";
import { FusionChartsModule } from "@sinequa/analytics/fusioncharts";

// Components
import { AppComponent } from "./app.component";
import { AuditComponent } from "./audit/audit.component";
import { AuditRangePickerComponent } from "./audit/audit-range-picker/audit-range-picker.component";
import { DashboardItemComponent } from "./audit/dashboard/dashboard-item.component";
import { WidgetPanoramaComponent } from "./audit/widget-panorama/widget-panorama.component";
import { AuditStatComponent } from "./audit/dashboard/audit-stat/audit-stat.component";
import { IconComponent } from "./audit/icon/icon.component";

// Environment
import { environment } from "../environments/environment";

// Locales
import {LocalesConfig, Locale} from "@sinequa/core/intl";
import enLocale from "../locales/en";
import frLocale from "../locales/fr";
// import deLocale from "../locales/de";

// Initialization of @sinequa/core
// export const startConfig: StartConfig = {
//     app: "training",
//     production: environment.production,
//     autoSAMLProvider: environment.autoSAMLProvider,
//     auditEnabled: true
// };
export const startConfig: StartConfig = {
    app: "training",
    production: environment.production,
    autoSAMLProvider: environment.autoSAMLProvider,
    auditEnabled: true
};

// @sinequa/core config initializer
export function StartConfigInitializer(startConfigWebService: StartConfigWebService): () => Promise<StartConfig> {
    const init = () => startConfigWebService.fetchPreLoginAppConfig().toPromise();
    return init;
}


// Application routes (see https://angular.io/guide/router)
export const routes: Routes = [
    {path: "audit", component: AuditComponent},
    {path: "**", redirectTo: "audit"}
];


// Search options (search service)
const searchOptions: SearchOptions = {
    routes: ["audit"],
    skipSearchRoutes: ["audit"],
    homeRoute: "audit"
};


export class SesameLocalesConfig implements LocalesConfig {
    defaultLocale: Locale;
    locales?: Locale[];
    constructor(){
        this.locales = [
            { name: "en", display: "msg#locale.en", data: enLocale},
            { name: "fr", display: "msg#locale.fr", data: frLocale},
            // { name: "de", display: "msg#locale.de", data: deLocale},
        ];
        this.defaultLocale = this.locales[0];
    }
}

const selectionOptions: SelectionOptions = {
    resetOnNewQuery: false,
    resetOnNewResults: false,
    storage: "record"
}

@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        RouterModule.forRoot(routes),
        FormsModule,
        ReactiveFormsModule,

        WebServicesModule.forRoot(startConfig),
        IntlModule.forRoot(SesameLocalesConfig),
        LoginModule.forRoot(),
        ModalModule,
        BsSearchModule.forRoot(searchOptions),
        BsNotificationModule,
        UtilsModule,
        FusionChartsModule,
        BsUserSettingsModule,
        BsFeedbackModule,
        BsFacetModule,
        BsAdvancedModule,
        BsModalModule,
        BsActionModule,
        GridsterModule,
        BsTimelineModule,
        BsHeatmapModule,
    ],
    declarations: [
        AppComponent,
        AuditComponent,
        AuditRangePickerComponent,
        DashboardItemComponent,
        WidgetPanoramaComponent,
        AuditStatComponent,
        IconComponent
    ],
    providers: [
        // Provides an APP_INITIALIZER which will fetch application configuration information from the Sinequa
        // server automatically at startup using the application name specified in the URL (app[-debug]/<app-name>).
        // This allows an application to avoid hard-coding parameters in the StartConfig but requires that the application
        // be served from the an app[-debug]/<app name> URL.
        // {provide: APP_INITIALIZER, useFactory: StartConfigInitializer, deps: [StartConfigWebService], multi: true},

        // Provides the Angular LocationStrategy to be used for reading route state from the browser's URL. Currently
        // only the HashLocationStrategy is supported by Sinequa.
        {provide: LocationStrategy, useClass: HashLocationStrategy},

        // Provides an HttpInterceptor to handle user login. The LoginInterceptor handles HTTP 401 responses
        // to Sinequa web service requests and initiates the login process.
        {provide: HTTP_INTERCEPTORS, useClass: LoginInterceptor, multi: true},

        // Provides an HttpInterceptor that offers a centralized location through which all client-side
        // audit records pass. An application can replace AuditInterceptor with a subclass that overrides
        // the updateAuditRecord method to add custom audit information to the records.
        {provide: HTTP_INTERCEPTORS, useClass: AuditInterceptor, multi: true},

        // Provides an HttpInterceptor that automatically processes any notifications specified in the $notifications
        // member of the response body to any Sinequa web service requests.
        {provide: HTTP_INTERCEPTORS, useClass: NotificationsInterceptor, multi: true},

        {provide: SEARCH_OPTIONS, useValue: searchOptions},
        {provide: SELECTION_OPTIONS, useValue: selectionOptions}
    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule {
}
