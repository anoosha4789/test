import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { BnNgIdleService } from 'bn-ng-idle';

import { NavItem } from 'bh-theme';
import { ValidationService } from '@core/services/validation.service';
import { UserService } from '@core/services/user.service';
import { PanelTypeList, UICommon } from '@core/data/UICommon';
import { GatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { Store } from '@ngrx/store';
import { PanelConfigurationFacade } from '@core/facade/panelConfigFacade.service';
import { UtilityService } from '@core/services/utility.service';
import { ngxLoadingAnimationTypes } from 'ngx-loading';
import { MatDialog } from '@angular/material/dialog';
import { SureSENSPanelModel } from '@core/models/webModels/PanelConfigurationCommon.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS, useValue: { displayDefaultIndicatorType: false, showError: true }
  }],
  encapsulation: ViewEncapsulation.None
})

export class AppComponent extends GatewayPanelBase implements OnInit, OnDestroy {

  title = 'MCW-app';
  navItems: NavItem[] = null;
  stepperNavItems: NavItem[] = null;
  idleTime: number = 0;
  config = { animationType: ngxLoadingAnimationTypes.threeBounce, backdropBorderRadius: '3px' };
  browserRefresh = false;
  shiftStatus: number;
  panelTypeId: number;

  subscription: Subscription;

  public ngxLoadingAnimationTypes = ngxLoadingAnimationTypes;

  constructor(protected store: Store, 
    private panelConfigFacade: PanelConfigurationFacade,
    private userService: UserService, 
    private idleService: BnNgIdleService,
    private router: Router,
    private utilityService: UtilityService,
    private matDialog: MatDialog) {
      super(store, panelConfigFacade, null, null, null, null, null);
      this.subscription = router.events.subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.browserRefresh = !router.navigated;
        }
    });
  }

  get loading() {
    return UICommon.isBusyWaiting;
  }

  get loadingMessage() {
    this.config.animationType = UICommon.loadingMssg ? ngxLoadingAnimationTypes.none : ngxLoadingAnimationTypes.threeBounce;
    return UICommon.loadingMssg ? UICommon.loadingMssg : "";
  }

  // IGatewayPanelBase methods
  postCallGetPanelConfigurationCommon(): void {
    this.panelTypeId = this.panelConfigurationCommonState.panelConfigurationCommon.PanelTypeId;
    const panelId = this.panelConfigurationCommonState.panelConfigurationCommon.Id;
    const isConfigSaved = this.utilityService.getConfigStatus();
    UICommon.IsConfigSaved = isConfigSaved;
    if (!isConfigSaved && panelId > 0 && !UICommon.IsImportConfig) {
      this.utilityService.setHeaderLinksByUser(true);
      UICommon.IsConfigSaved = true;
    }

    if(this.browserRefresh && panelId < 0) this.router.navigate(['/home']);
  }

  private subscribeToShiftStatus(): void {
    this.utilityService.getShiftStatus().subscribe(status => {
      this.shiftStatus = status;
    });
  }

  ngOnInit() {
    this.initPanelConfigurationCommon();
    this.subscribeToShiftStatus();
    this.idleService.startWatching(UICommon.LOGIN_IDLE_TIMEOUT).subscribe((isPageIdle: boolean) => {
      if (isPageIdle) {
        console.clear();
        console.log('No user interaction for 20 minutes. Session time out - User Idle!');
        this.userService.GetCurrentLoginUser().then(user =>{
          if (user) {
            let bTimeOut = true;
            if (user.Name === "Open" && this.idleTime <= UICommon.OPENUSER_IDLE_TIMEOUT) {
              this.idleTime += UICommon.LOGIN_IDLE_TIMEOUT;
              bTimeOut = this.idleTime >= UICommon.OPENUSER_IDLE_TIMEOUT ? true : false;
            }

            // Reload for SureSENS toggling memory issue            
            if (user.Name === "Open" && this.panelTypeId === PanelTypeList.SURESENS) {
              const panelConfigaration = this.panelConfigurationCommonState.panelConfigurationCommon as SureSENSPanelModel;
              if (panelConfigaration.ToggleEnabled) {
                window.location.reload();
              }           
            }

            if (bTimeOut && this.shiftStatus == 0) {  // Shift Status = 0 means idle
              console.log(user.Name + ' is idle. Logged out!');
              this.idleTime = 0;  // reset time
              this.matDialog.closeAll();    // close all opened dialogs here
              this.userService.LogOut();
              this.router.navigate(["Home"]);
            } 
          }
        }); 
      }
    });
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

}
