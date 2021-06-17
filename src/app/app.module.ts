import { NgModule/*, APP_INITIALIZER*/ } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule, Routes } from '@angular/router';
import { LocationStrategy, HashLocationStrategy } from "@angular/common";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { HighlightModule, HIGHLIGHT_OPTIONS } from 'ngx-highlightjs';
import { AgGridModule } from 'ag-grid-angular';

// @sinequa/core library
import { WebServicesModule, StartConfigWebService, StartConfig } from "@sinequa/core/web-services";
import { LoginModule, LoginInterceptor } from "@sinequa/core/login";
import { IntlModule, Locale } from "@sinequa/core/intl";
import { ModalModule } from "@sinequa/core/modal";
import { ValidationModule } from "@sinequa/core/validation";
import { NotificationsInterceptor } from "@sinequa/core/notification";
import { AuditInterceptor } from "@sinequa/core/app-utils";

// @sinequa/components library
import { BsSearchModule, SearchOptions, SEARCH_OPTIONS } from "@sinequa/components/search";
import { BsNotificationModule } from '@sinequa/components/notification';
import { UtilsModule } from '@sinequa/components/utils';
import { BsPreviewModule } from "@sinequa/components/preview";
import { ResultModule } from "@sinequa/components/result";
import { BsUserSettingsModule } from "@sinequa/components/user-settings";
import { BsFeedbackModule } from "@sinequa/components/feedback";
import { BsFacetModule, NAVIGATION_OPTIONS_FACETS } from "@sinequa/components/facet";
import { BsAdvancedModule } from "@sinequa/components/advanced";
import { BsModalModule } from "@sinequa/components/modal";
import { BsActionModule } from "@sinequa/components/action";
import {SelectionOptions, SELECTION_OPTIONS} from "@sinequa/components/selection";

// Components
import { AppComponent } from "./app.component";
import { SponsoredComponent } from './sponsored/sponsored.component';
import { QueryComponent } from './query/query.component';
import { LoginComponent } from './login/login.component';
import { SuggestsComponent } from './suggests/suggests.component';
import { PreviewComponent } from './preview/preview.component';
import { ExplorerComponent } from './explorer/explorer.component';
import { ListExplorerComponent } from './list-explorer/list-explorer.component';
import { QueryEditorComponent } from './query/query-editor/query-editor.component';
import { SQLExplorerComponent } from './query/sql-explorer/sql-explorer.component';
import { QueryCompareComponent } from "./query-compare/query-compare.component";
import { ResultItemComponent } from "./query-compare/result-item";

// Environment
import { environment } from "../environments/environment";

// Locales
import enLocale from "../locales/en";

// Initialization of @sinequa/core
// export const startConfig: StartConfig = {
//     app: "training",
//     production: environment.production,
//     autoSAMLProvider: environment.autoSAMLProvider,
//     auditEnabled: true
// };
export const startConfig: StartConfig = {
  app: "sesame",
  url: environment.url,
  production: environment.production,
  autoOAuthProvider: environment.autoOAuthProvider,
  auditEnabled: true
};

// @sinequa/core config initializer
export function StartConfigInitializer(startConfigWebService: StartConfigWebService): () => Promise<StartConfig> {
    const init = () => startConfigWebService.fetchPreLoginAppConfig().toPromise();
    return init;
}


// Application routes (see https://angular.io/guide/router)
export const routes: Routes = [
    {path: "login", component: LoginComponent},
    {path: "query", component: QueryComponent},
    {path: "preview", component: PreviewComponent},
    {path: "suggests", component: SuggestsComponent},
    {path: "sponsored", component: SponsoredComponent},
    {path: "sql-console", loadChildren: () => import('./sql-console/sql-console.module').then(m => m.SQLConsoleModule)},
    {path: "query-compare", component: QueryCompareComponent},
    {path: "audit", loadChildren: () => import('./audit/audit.module').then(m => m.AuditModule)},
    {path: "**", redirectTo: "audit"}
];


// Search options (search service)
const searchOptions: SearchOptions = {
    routes: ["login", "query", "preview", "sponsored", "suggests", "query-compare", "sql-console"],
    hiddenRoutes: ["audit"],
    homeRoute: "audit"
};


export class SesameLocalesConfig {
    defaultLocale: Locale = { name: "en", display: "msg#locale.en", data: enLocale};
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

        HighlightModule,
        AgGridModule.withComponents([]),

        WebServicesModule.forRoot(startConfig),
        IntlModule.forRoot(SesameLocalesConfig),
        LoginModule.forRoot(),
        ModalModule,
        BsSearchModule.forRoot(searchOptions),
        BsNotificationModule,
        UtilsModule,
        ValidationModule,
        BsPreviewModule,
        ResultModule,
        BsUserSettingsModule,
        BsFeedbackModule,
        BsFacetModule,
        BsAdvancedModule,
        BsModalModule,
        BsActionModule,
    ],
    declarations: [
        AppComponent,
        LoginComponent,
        QueryComponent,
        SuggestsComponent,
        PreviewComponent,
        SponsoredComponent,
        ExplorerComponent,
        ListExplorerComponent,
        QueryEditorComponent,
        SQLExplorerComponent,
        QueryCompareComponent,
        ResultItemComponent,
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

        {
            provide: HIGHLIGHT_OPTIONS,
            useValue: {
                coreLibraryLoader: () => import('highlight.js/lib/core'),
                languages: {
                    sql: () => import('highlight.js/lib/languages/sql')
                }
            }
        },
        {provide: NAVIGATION_OPTIONS_FACETS, useValue: {skipSearch: true}},
        {provide: SELECTION_OPTIONS, useValue: selectionOptions}
    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule {
}
