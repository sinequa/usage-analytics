import { Component, ChangeDetectorRef } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { NavigationEnd, Router } from "@angular/router";
import { SearchService } from "@sinequa/components/search";
import { ComponentWithLogin, LoginService } from "@sinequa/core/login";
import { SesameService } from "./sesame.service";

@Component({
    selector: "app",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"]
})
export class AppComponent extends ComponentWithLogin {
    searchControl: FormControl;
    form: FormGroup;
    showMenu = false;
    showSearchForm = true;

    skipSearch = {navigationOptions:{skipSearch: true}};

    constructor(
        // These 2 services are required by the constructor of ComponentWithLogin
        public loginService: LoginService,
        cdRef: ChangeDetectorRef,
        public sesameService: SesameService,
        public searchService: SearchService,
        public formBuilder: FormBuilder,
        public router: Router
    ){
        super(loginService, cdRef);

        this.searchControl = new FormControl("");
        this.form = this.formBuilder.group({
            search: this.searchControl,
            clearOnSearch: new FormControl(true)
        });

        this.searchControl.valueChanges.subscribe(text =>
            this.sesameService.inputText.next(text)
        );

        this.searchService.queryStream.subscribe(query =>
            this.searchControl.setValue((query && query.text) || '')
        );

        this.router.events.subscribe((val) => {
            if (val instanceof NavigationEnd) {
                const routeName = val.url.substr(1).split('?')[0]; // Extract route name
                this.showSearchForm = !['login', 'sql-console', 'audit'].includes(routeName);
            }
        });
    }

    search() {
        if(this.form.get('clearOnSearch')!.value) {
            this.searchService.clearQuery();
        }
        this.searchService.query.text = this.searchControl.value || '';
        this.searchService.searchText();
    }

    clear() {
        this.searchService.clear();
    }

}
