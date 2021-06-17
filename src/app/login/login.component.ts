import { Component } from "@angular/core";
import { BsOverrideUser } from "@sinequa/components/modal";
import { AppService } from "@sinequa/core/app-utils";
import { Utils } from "@sinequa/core/base";
import { AuthenticationService, LoginService, UserOverride } from "@sinequa/core/login";
import { ModalResult, ModalService } from "@sinequa/core/modal";
import { NotificationsService, NotificationType } from "@sinequa/core/notification";
import { PrincipalWebService, UserSettingsWebService } from "@sinequa/core/web-services";

@Component({
    selector: 'ses-login',
    templateUrl: './login.component.html'
})
export class LoginComponent {

    constructor(
        public loginService: LoginService,
        public principalWebService: PrincipalWebService,
        public appService: AppService,
        public userSettingsWebService: UserSettingsWebService,
        public authenticationService: AuthenticationService,
        public notificationsService: NotificationsService,
        public modalService: ModalService
    ){

    }

    
    overrideUser() {
        let userOverride = this.authenticationService.userOverride ?
          Utils.copy<UserOverride>(this.authenticationService.userOverride) : undefined;
        if (!userOverride) {
          userOverride = {
            userName: "",
            domain: ""
          };
        }
        this.modalService.open(BsOverrideUser, {model: userOverride})
          .then((result) => {
            if (result === ModalResult.OK) {
              this.loginService.overrideUser(userOverride);
            }
          });
    }

    resetUserSettings() {
        this.userSettingsWebService.reset().subscribe({
          next: () => this.notificationsService.notify(NotificationType.Warning, "msg#userMenu.successResetUserSettings"),
          error: () => this.notificationsService.notify(NotificationType.Error, "msg#userMenu.errorResetUserSettings")
        });
    }

    
    logout() {
        this.loginService.logout();
    }
}