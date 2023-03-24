import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Observable, Subject, Subscription } from 'rxjs';
import { throttleTime } from 'rxjs/operators';

import { BhAlertService } from 'bh-theme';
import { Store } from '@ngrx/store';
import { IPanelConfigurationCommonState } from '@store/state/panelConfigurationCommon.state';
import { PANELCONFIG_COMMON_LOAD } from '@store/actions/panelConfigurationCommon.action';

import { userSchema } from '@core/models/schemaModels/LoginModel.schema';
import { LoginModel } from '@core/models/webModels/Login.model';
import { PanelTypeList, UICommon } from '@core/data/UICommon';
import { UserService } from '@core/services/user.service';
import { NavigationService } from '@core/services/navigation.service';
import { ValidationService } from '@core/services/validation.service';
import { GatewayPanelConfigurationService } from '@core/services/gateway-panel-configuration.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {

  hide = true;
  panelTypeId: number;
  private route: ActivatedRouteSnapshot;
  loginFormGroup: FormGroup;

  userNameErrMssg: string = null;
  passwordErrMssg: string = null;

  private panelConfigurationModels$: Observable<IPanelConfigurationCommonState>;
  private arrSubscriptions: Subscription[] = [];
  private buttonClicked = new Subject<Object>();

  constructor(private store: Store,
    private router: Router,
    private userService: UserService,
    private gwPanelService: GatewayPanelConfigurationService,
    private headerNavigationService: NavigationService,
    private validationService: ValidationService,
    private bhAlertService: BhAlertService,
  ) {
    this.panelConfigurationModels$ = this.store.select<IPanelConfigurationCommonState>((state: any) => state.panelConfigCommonState);
  }

  private validateControls(ctlId: string) {
    const loginFormCtrl = this.loginFormGroup.get(ctlId);
    switch (ctlId) {
      case 'Name':
        this.userNameErrMssg = null;
        if (loginFormCtrl && loginFormCtrl.touched && loginFormCtrl.invalid)
          this.userNameErrMssg = this.validationService.getValidationErrorMessage(loginFormCtrl.errors, 'Username');
        break;

      case 'Password':
        this.passwordErrMssg = null;
        if (loginFormCtrl && loginFormCtrl.touched && loginFormCtrl.invalid)
          this.passwordErrMssg = this.validationService.getValidationErrorMessage(loginFormCtrl.errors, ctlId);
        break;
    }
  }

  validate(event) {
    this.validateControls(event.currentTarget.id);
  }

  private createFormGroup(): void {
    this.loginFormGroup = new FormGroup({
      Name: new FormControl('', [Validators.required, Validators.maxLength(userSchema.properties.Name.maxLength)]),
      Password: new FormControl('', Validators.required),
    });
  }

  private getNavigationURL(): string {
    let url = UICommon.HomeURL;
    switch (this.panelTypeId) {
      case PanelTypeList.SURESENS:
        url = 'suresens/monitoring';
        break;
      case PanelTypeList.InCHARGE:
        url = 'incharge/monitoring';
        break;
    }

    return url;
  }

  private inValidUserAlert(user: LoginModel) {
    this.bhAlertService.showAlert(
      "info",
      "top",
      5000,
      "Admin privilege required to configure."
    );
    this.userService.LogOut().then(() => console.log("User logged out..."));
  }

  private onSubmit(): void {
    const logInFormData: LoginModel = this.loginFormGroup.value;
    if (this.loginFormGroup.valid === true) {
      UICommon.isBusyWaiting = true; //GATE-1791 Set wating status to true
      this.userService.LoginAsNewUser(logInFormData).subscribe(loginUser => {
        let isAdminUser = this.userService.isAdminUser(logInFormData);

        // check if Admin user is trying to import new configuration
        if (UICommon.IsImportConfig && !isAdminUser) {
          this.inValidUserAlert(logInFormData);
          return;
        }

        // check if Admin user is trying to configure new configuration
        if (!UICommon.IsConfigSaved && !isAdminUser) {
          this.inValidUserAlert(logInFormData);
          return;
        }
        const nextPage = UICommon.LogInRouteURL != null && UICommon.LogInRouteURL !== '' ? UICommon.LogInRouteURL : this.getNavigationURL();
        if (nextPage !== "" && nextPage !== UICommon.HomeURL && !UICommon.IsImportConfig)
          this.gwPanelService.ForceReloadConfiguration(loginUser.AccessLevel, UICommon.IsConfigSaved);  // Reload only when not importing

        this.headerNavigationService.setHeaderLinksByUserRoles(loginUser);

        UICommon.LogInRouteURL = '';  // Reset LoginRouteURL
        this.headerNavigationService.selectHeaderLink(nextPage);
        UICommon.isBusyWaiting = false; //GATE-1791 Set wating status to false
        this.router.navigateByUrl(nextPage);
      },
        (error) => {
          UICommon.isBusyWaiting = false; //GATE-1791 Set wating status to false
        });
    } else {
      this.loginFormGroup.markAllAsTouched();
      this.validateControls('Name');
      this.validateControls('Password');
    }
  }

  onSubmitBtnClick() {
    this.buttonClicked.next();
  }

  private subscribeToPanelConfigurationState(): void {
    let subscription = this.panelConfigurationModels$.subscribe(
      (state: IPanelConfigurationCommonState) => {
        if (state !== undefined) {
          if (state.isLoaded === false) {
            // Dispatch Action if not loaded
            this.store.dispatch(PANELCONFIG_COMMON_LOAD());
          } else {
            this.panelTypeId = state.panelConfigurationCommon.PanelTypeId;
          }
        }
      }
    );
    this.arrSubscriptions.push(subscription);
  }

  ngOnDestroy(): void {
    if (this.arrSubscriptions != null && this.arrSubscriptions.length > 0) {
      this.arrSubscriptions.forEach(subscription => {
        if (subscription != null) {
          subscription.unsubscribe();
          subscription = null;
        }
      });
    }
    this.arrSubscriptions = [];
  }

  ngOnInit(): void {
    this.subscribeToPanelConfigurationState();
    this.createFormGroup();
    this.buttonClicked.pipe(throttleTime(1000)).subscribe(() => this.onSubmit());
  }

}
