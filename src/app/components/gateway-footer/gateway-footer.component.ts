import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UICommon } from '@core/data/UICommon';
import { ConfigurationService } from '@core/services/configurationService.service';
import { RealTimeDataSignalRService } from '@core/services/realTimeDataSignalR.service';
import { SystemClockService } from '@core/services/system-clock.service';
import { Store } from '@ngrx/store';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { IServerRunningStatusState } from '@store/state/serverRunningStatus.state';
import { Observable, Subscription } from 'rxjs';

import { PANELCONFIG_COMMON_LOAD } from '@store/actions/panelConfigurationCommon.action';
import { LOAD_DATAPOINTDEF, LOAD_DEVICES } from '@store/actions/deviceDataPoints.action';

import { AboutComponent, AboutComponentData } from '@comp/about/about.component';
import { IPanelConfigurationCommonState } from '@store/state/panelConfigurationCommon.state';
import { StateUtilities } from '@store/state/IState';
import { UtilityService } from '@core/services/utility.service';
import { UserService } from '@core/services/user.service';
import { Router } from '@angular/router';
import { GatewayPanelConfigurationService } from '@core/services/gateway-panel-configuration.service';
import { FooterProperties, GwFooterService, ShiftWell } from '@core/services/gw-footer-service.service';

@Component({
  selector: 'gateway-footer',
  templateUrl: './gateway-footer.component.html',
  styleUrls: ['./gateway-footer.component.scss']
})
export class GatewayFooterComponent implements OnInit, OnDestroy {

  systemClockTime = new Date();
  saveInProgress: boolean;
  bIsValidClock: boolean = true;
  showHelp: boolean = false;

  systemStatus: number;
  systemStatusText: string = "Connected";
  systemStatusIcon: string = "check_circle";
  isPanelIdle: boolean = true;
  showPanelStatus: boolean = false;
  footerPanelStatus: FooterProperties[] = [];
  resetDone: boolean = false;

  private panelConfigurationCommon$: Observable<IPanelConfigurationCommonState>;
  private serverRunningStatusState$: Observable<IServerRunningStatusState>;

  private panelConfigState: IPanelConfigurationCommonState;
  private shiftWell: ShiftWell;

  private SystemClockSubscription: Subscription;
  private dataSubscriptions: Subscription[] = [];
  private dialogRef: any;
  private bConfigSavedEvent: boolean = false;

  constructor(protected store: Store<{ serverRunningStatusState: IServerRunningStatusState }>,
    private router: Router,
    private mdDialog: MatDialog,
    private realTimeDataSignalRService: RealTimeDataSignalRService,
    private gwModalService: GatewayModalService,
    private configurationService: ConfigurationService,
    private gwPanelService: GatewayPanelConfigurationService,
    private systemClockService: SystemClockService,
    private gwFooterService: GwFooterService,
    private userService: UserService,
    private utilityService: UtilityService) {
    this.panelConfigurationCommon$ = this.store.select<any>((state: any) => state.panelConfigCommonState);
    this.serverRunningStatusState$ = this.store.select<any>((state: any) => state.serverRunningStatusState);
  }

  // Launch dialog direction without using gwModalService
  showAboutModal(): void {

    this.configurationService.getBuildAndFirmwareversionNumber().subscribe((buildNumber) => {
      const aboutComponentData: AboutComponentData =  buildNumber; // this object will be passed in the dialog and returned
      this.dialogRef = this.mdDialog.open(AboutComponent, { data: aboutComponentData, disableClose: true });
      // this.dialogRef.afterClosed().subscribe(result => {});
    });
  }

  private upDateSystemStatus(status: SystemStatus) {
    this.systemStatus = status;

    // check if valid clock
    this.bIsValidClock = this.systemClockTime.getFullYear() > 1970;
    if (!this.bIsValidClock) {
      this.systemStatus = SystemStatus.Connecting;
    }

    switch (this.systemStatus) {
      case SystemStatus.Connected:
        this.systemStatusText = "Connected";
        this.systemStatusIcon = "check_circle";
        break;

      case SystemStatus.Connecting:
        this.systemStatusText = "Connecting";
        this.systemStatusIcon = "wifi_tethering";
        break;

      case SystemStatus.Disconnected:
        this.systemStatusText = "Disconnected";
        this.systemStatusIcon = "error";
        break;

      case SystemStatus.WaitingForAcquistion:
        this.systemStatusText = "Waiting for Acquisition";
        this.systemStatusIcon = "wifi_tethering";
        break;

      case SystemStatus.Warning:
        this.systemStatusText = "Warning";
        this.systemStatusIcon = "warning";
        break;

      default:
        this.systemStatusIcon = "";
        break;
    }
  }

  private checkServerStatus() {
    // if (this.systemStatus === SystemStatus.ShiftInProgress)
    //   return;

    if (this.saveInProgress) {
      this.upDateSystemStatus(SystemStatus.WaitingForAcquistion);
      // this.saveInProgress = false;
      return;
    }
    this.upDateSystemStatus(SystemStatus.Connected);
  }

  private subscribeToSystemClock(): void {
    this.SystemClockSubscription = this.systemClockService.SystemClockTime$.subscribe(dt => {
      if (dt) {
        this.systemClockTime = dt;
        this.checkServerStatus();
      }
    }, error => {
      this.upDateSystemStatus(SystemStatus.Disconnected);
    });
  }

  private subscribeToRealtimeStatus(): void {
    this.realTimeDataSignalRService.IsRealtimeUp().subscribe(x => {
      if (!x)
        this.upDateSystemStatus(SystemStatus.Connecting);
    });
  }

  private subscribeToServerRunningStatus(): void {
    this.serverRunningStatusState$.subscribe(
      (state: IServerRunningStatusState) => {
        console.log('response the serverRunningStatusState updated');
        if (state) {                   
          if (this.saveInProgress && !state.ConfigurationSavingInProgress) {
            this.store.dispatch(LOAD_DEVICES());          // Load Devices after server reacqusition finished
            this.store.dispatch(LOAD_DATAPOINTDEF());     // Load Data Points after server reacqusition finished     
            this.gwFooterService.isLoadApiCalled = false;       
          }          
          this.saveInProgress = state.ConfigurationSavingInProgress;
          this.upDateSystemStatus(this.saveInProgress ? SystemStatus.Connecting : SystemStatus.Connected);
        }
      }
    );
  }

  showViewShift(): void {
    if (this.shiftWell) {
      let address = this.shiftWell.navigateAddress;
      this.userService.GetCurrentLoginUser().then((user) => {
        if (user && user?.Name !== UICommon.OPENUSER_NAME) {
          this.router.navigate([address]);
        }
        else {
          UICommon.LogInRouteURL = address;
          this.router.navigate(['/Login']);
        }
      });
    }
  }

  private initPanelConfigurationCommon(): void {
    let panelConfigSubscription = this.panelConfigurationCommon$.subscribe(
      (state: IPanelConfigurationCommonState) => {
        if (state !== undefined) {
          if (state.isLoaded === false && !StateUtilities.hasErrors(state)) {
            // Dispatch Action if not loaded
            this.store.dispatch(PANELCONFIG_COMMON_LOAD());
          } else {
            this.panelConfigState = state;
            if (this.bConfigSavedEvent) {
              this.navToMonitorPage();
              this.bConfigSavedEvent = false;
            }
          }
        }
      }
    );
    this.dataSubscriptions.push(panelConfigSubscription);
  }

  private navToMonitorPage() {
    const panelInfo = UICommon.getPanelType(this.panelConfigState.panelConfigurationCommon.PanelTypeId);
    this.router.navigate([`../${panelInfo.name}/monitoring`],);
  }

  private subscribeToConfigurationUpdatedEvent(): void {
    this.realTimeDataSignalRService.GetConfigurationUpdatedEventFlag().subscribe(isConfigSaved => {
      this.realTimeDataSignalRService.ResetEventNotifiedEvent = false;  // reset to false, if set via reset event
      this.resetDone = false;
      if (!this.realTimeDataSignalRService.SaveEventNotifiedEvent) {
        this.userService.GetCurrentLoginUser().then(currentUser => {
          this.realTimeDataSignalRService.SaveEventNotifiedEvent = false; // reset to false, for subsequent save operations
          const accessLevel = parseInt(currentUser.AccessLevel.toString());
          this.gwPanelService.ForceReloadConfiguration(accessLevel, isConfigSaved);
          this.bConfigSavedEvent = true;
        });
      }
    });
  }

  private subscribeToConfigurationResetEvent(): void {
    this.realTimeDataSignalRService.GetConfigurationResetEventFlag().subscribe(() => {
      this.realTimeDataSignalRService.SaveEventNotifiedEvent = false; // reset to false, if set via save config event
      this.resetDone = true;
      if (!this.realTimeDataSignalRService.ResetEventNotifiedEvent) {
        this.gwPanelService.ResetStateConfiguration();
        this.realTimeDataSignalRService.ResetData();        
        this.userService.LogOut().then(() => {
          UICommon.isBusyWaiting = false;
        },
          (error) => {
            UICommon.isBusyWaiting = false;
          })
          .finally(() => {
            UICommon.isBusyWaiting = false;
            this.realTimeDataSignalRService.ResetEventNotifiedEvent = true;
            this.router.navigate(['Home']);
            this.systemClockService.restartClock();
          });
      }
    });
  }

  ngOnDestroy(): void {
    this.SystemClockSubscription.unsubscribe();
    this.SystemClockSubscription = null;
  }

  ngOnInit(): void {
    this.upDateSystemStatus(SystemStatus.Connecting);
    this.initPanelConfigurationCommon();
    this.subscribeToSystemClock();
    this.subscribeToRealtimeStatus();
    this.subscribeToServerRunningStatus();
    this.subscribeToConfigurationUpdatedEvent();
    this.subscribeToConfigurationResetEvent();
    // Subscribe to Footer status events here
    this.gwFooterService.subscribeToFooterPanelStatus().subscribe(footerStatus => {
      this.footerPanelStatus = [];
      this.showPanelStatus = footerStatus.showPanelStatus;
      this.isPanelIdle = !footerStatus.shifting;
      this.shiftWell = footerStatus.shiftWell;
      this.footerPanelStatus = footerStatus.footerProperties;
    });    
  }
}

enum SystemStatus {
  Connected = 1,
  Disconnected,
  ShiftInProgress,
  Connecting,
  WaitingForAcquistion,
  Warning
}
