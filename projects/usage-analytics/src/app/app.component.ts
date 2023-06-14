import { Component, Inject, InjectionToken, OnInit, Optional } from "@angular/core";
import { AppService } from "@sinequa/core/app-utils";
import { ComponentWithLogin } from "@sinequa/core/login";
import { FACETS, enableUserFeedbackMenu, facet_filters_icon, facet_filters_name } from "./audit/config";
import { FacetConfig, FacetListParams } from "@sinequa/components/facet";
import { AuditService } from "./audit/audit.service";
import { BsUserMenuComponent, HelpFolderOptions } from "@sinequa/components/user-settings";
import { IntlService } from "@sinequa/core/intl";
import { Dataset, DatasetError, Results } from "@sinequa/core/web-services";

/** A token that is used to inject the help folder options.
 * Expects a {@link HelpFolderOptions} object.
*/
export const APP_HELP_FOLDER_OPTIONS = new InjectionToken<HelpFolderOptions>('APP_HELP_FOLDER_OPTIONS');

@Component({
    selector: "sq-app",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"]
})
export class AppComponent extends ComponentWithLogin implements OnInit {

    filterData: Results | DatasetError;

    constructor(
        public appService: AppService,
        public auditService: AuditService,
        public intlService: IntlService,
        @Optional() @Inject(APP_HELP_FOLDER_OPTIONS) private helpDefaultFolderOptions: HelpFolderOptions | null | undefined)
    {
        super();
    }

    ngOnInit() {
        // This is needed to fix the issue of ExpressionChangedAfterItHasBeenCheckedError on app startup
        // caused by the use of (auditService.data$ | async)?.[auditService.facetFiltersQuery] directly in the template
        this.auditService.data$.subscribe((dataset: Dataset) => {
            this.filterData = dataset[this.auditService.facetFiltersQuery];
        })
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

    openHelpPage() {
        // "options" could be undefined
        // "helpDefaultFolderOptions" could be null, in this case map it to undefined
        const options = this.appService.app?.data["help-folder-options"] as HelpFolderOptions;
        const defaults = this.helpDefaultFolderOptions ?? undefined;

        if (options || defaults) {
            const { name } = this.intlService.currentLocale;
            const helpFolderOptions = {
                ...defaults,
                ...options,
            };
            const url = this.appService.helpUrl(BsUserMenuComponent.getHelpIndexUrl(name, helpFolderOptions));
            window.open(url, "_blank");
        }
    }
}
