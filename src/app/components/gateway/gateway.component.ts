import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '@core/services/user.service';
import { NavigationService } from '@core/services/navigation.service';
import { PanelTypeList, UICommon } from '@core/data/UICommon';
import { BrowseFileDialogComponentData } from '@shared/gateway-dialogs/components/browse-file-dialog/browse-file-dialog.component';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { GatewayPanelConfigurationService } from '@core/services/gateway-panel-configuration.service';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { IPanelConfigurationCommonState } from '@store/state/panelConfigurationCommon.state';

import * as PANELCONFIG_COMMON_ACTIONS from '@store/actions/panelConfigurationCommon.action';
import { StateUtilities } from '@store/state/IState';
import { PanelConfigurationService } from '@core/services/panelConfiguration.service';
import { UtilityService } from '@core/services/utility.service';
import { ngxLoadingAnimationTypes } from 'ngx-loading';

@Component({
  selector: 'app-gateway',
  templateUrl: './gateway.component.html',
  styleUrls: ['./gateway.component.scss'],
})
export class GatewayComponent implements OnInit, AfterViewInit, OnDestroy {

  private panelConfigurationCommon$: Observable<IPanelConfigurationCommonState>;
  private panelConfigSubscription: Subscription = null;
  bImportDisabled: boolean = true;
  panelTypeId: number;

  config = { animationType: ngxLoadingAnimationTypes.threeBounce, backdropBorderRadius: '3px' };

  constructor(
    protected store: Store,
    private router: Router,
    private panelConfigurationService: PanelConfigurationService,
    private userService: UserService,
    private gatewayModalService: GatewayModalService,
    private gatewayPanelConfigurationService: GatewayPanelConfigurationService,
    private headerNavigationService: NavigationService,
    private utilityService: UtilityService
  ) {
    this.panelConfigurationCommon$ = this.store.select<any>((state: any) => state.panelConfigCommonState);
  }

  navigate(address: string) {
    this.userService.GetCurrentLoginUser().then((x) => {
      if (x !== undefined && x != null && x.Name !== UICommon.OPENUSER_NAME) {
        this.router.navigate(['/' + address]);
        this.headerNavigationService.selectHeaderLink('Configuration');
      } else {
        UICommon.LogInRouteURL = address;
        this.router.navigate(['/Login']);
      }
    });
  }

  loginUser() {
    const panelInfo = UICommon.getPanelType(this.panelTypeId, true);
    const address = `${panelInfo.name}/dashboard`;
    this.userService.GetCurrentLoginUser().then((x) => {
      if (x !== undefined && x != null && x.Name !== UICommon.OPENUSER_NAME) {
        this.router.navigate(['/' + address]);
        this.headerNavigationService.selectHeaderLink('Configuration');
      } else {
        UICommon.LogInRouteURL = address;
        this.router.navigate(['/Login']);
      }
    });
  }

  ImportConfiguration(): void {
    const browseFileDialogComponentData: BrowseFileDialogComponentData = {
      Title: 'Import System Configuration',
      ForImportFile: true, // if this dialog is for export file, set it to false.
      FileExtensions: '.dat', // set the file extension for file selection filter
      SelectedFileName: '', // returned file name
      SelectedFile: {}, // return file object
      PrimaryBtnText: "Import"
    };

    this.gatewayModalService.openBrowseFileDialog(
      browseFileDialogComponentData
    );
    this.gatewayModalService.confirmed().subscribe((result) => {
      if (result) {
        this.gatewayPanelConfigurationService.ImportConfiguration(result.SelectedFile)
          .then(result => {
            if (result)
              this.loginUser();
          },
            error => {
              console.log("Error importing configuration..." + error);
            })
          .catch(error => console.log("Error importing configuration..." + error));
      }
    });
  }

  private navToMonitorPage(panelTypeId: number) {
    const panelInfo = UICommon.getPanelType(panelTypeId);
    this.router.navigate([`${panelInfo.name}/monitoring`]);
  }

  get isLoading() {
    return this.panelTypeId > 0;
  }

  ngOnDestroy(): void {
    if (this.panelConfigSubscription != null)
      this.panelConfigSubscription.unsubscribe();
  }

  private getPanelConfigurationCommon(): void {
    this.panelConfigurationService.getPanelConfigurationCommon().subscribe(panelConfigCommon => {
      this.panelTypeId = panelConfigCommon.PanelTypeId;
      if(this.panelTypeId<=0){
        if(window.localStorage.getItem('pointTrendCharts')){
          window.localStorage.removeItem("pointTrendCharts");
         }
         if(window.localStorage.getItem('historianTrendData')){
          window.localStorage.removeItem("historianTrendData");
         }
      }
      this.bImportDisabled = !(panelConfigCommon.Id <= 0 || UICommon.IsImportConfig);
      if (this.bImportDisabled) {
        this.navToMonitorPage(this.panelTypeId);
      }
      else
        this.utilityService.setHeaderLinksByUser(false);
    },
      error => {
        console.log(error);
    });
  }

  ngAfterViewInit(): void {
    this.panelConfigSubscription = this.panelConfigurationCommon$.subscribe(
      (state: IPanelConfigurationCommonState) => {
        if (state !== undefined) {
          if (state.isLoaded === false && !StateUtilities.hasErrors(state)) {
            this.store.dispatch(PANELCONFIG_COMMON_ACTIONS.PANELCONFIG_COMMON_LOAD());  // Dispatch Action if not loaded
          } else {
            this.panelTypeId = state.panelConfigurationCommon.PanelTypeId;
          }
        }
      }
    );
  }

  ngOnInit(): void {
    this.getPanelConfigurationCommon(); // this is required to directly call api because we don't want to rely on state object here
  }
}
