import { Component } from "@angular/core";
import { AppService } from "@sinequa/core/app-utils";
import { ComponentWithLogin } from "@sinequa/core/login";
import { FACETS, enableUserFeedbackMenu, facet_filters_icon, facet_filters_name } from "./audit/config";
import { FacetConfig, FacetListParams } from "@sinequa/components/facet";
import { AuditService } from "./audit/audit.service";

@Component({
    selector: "sq-app",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"]
})
export class AppComponent extends ComponentWithLogin {
    constructor(public appService: AppService, public auditService: AuditService) {
        super();
    }

    /**
     * Returns the configuration of the facets displayed.
     * The configuration from the config.ts file can be overriden by configuration from
     * the app configuration on the server
     */
    public get facets(): FacetConfig<FacetListParams>[] {
        return this.appService.app?.data?.facets as any || FACETS;
    }

    get facetFiltersName(): string {
        return (this.appService.app?.data?.facet_filters_name ?? facet_filters_name) as string;
    }

    get facetFiltersIcon(): string {
        return (this.appService.app?.data?.facet_filters_icon ?? facet_filters_icon) as string;
    }

    get enableUserFeedbackMenu(): boolean {
        return (this.appService.app?.data?.enableUserFeedbackMenu ?? enableUserFeedbackMenu) as boolean;
    }
}
