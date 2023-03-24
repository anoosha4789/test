import { Component, OnDestroy, OnInit, HostListener, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { GatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { SieFacade } from '@core/facade/sieFacade.service';
import { WellFacade } from '@core/facade/wellFacade.service';
import { SieModel } from '@core/models/webModels/Sie.model';
import { MultiNodeWellDataUIModel } from '@core/models/webModels/WellDataUIModel.model';
import { Store } from '@ngrx/store';
import { ButtonActions } from '@shared/gateway-dialogs/components/gateway-advanced-dialog/gateway-advanced-dialog.component';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { Observable, Subscription } from 'rxjs';
import { ElectricalParametersDialogComponent } from '../electrical-parameters-dialog/electrical-parameters-dialog.component';
import { ActivatedRoute, Router } from '@angular/router';
import { MultinodeMonitoringZone } from '../multinode-monitoring-card/multinode-monitoring-card.component';
import { PaginationInstance } from 'ngx-pagination';
import { MatTabGroup } from '@angular/material/tabs';
import { RealTimeDataSignalRService } from '@core/services/realTimeDataSignalR.service';
import { UICommon } from '@core/data/UICommon';
import { DeviceDataPointsFacade } from '@core/facade/deviceDataPointsFacade.service';
import { eFCVDataModel } from '@core/models/webModels/eFCVDataModel.model';
import { IServerRunningStatusState } from '@store/state/serverRunningStatus.state';
import { TOOL_CONNECTIONS_LOAD } from '@store/actions/tool-connection.entity.action';
import { LOAD_DATAPOINTDEF, LOAD_DEVICES } from '@store/actions/deviceDataPoints.action';
import { UserService } from '@core/services/user.service';
import { PerformActuationDialogComponent } from '../perform-actuation-dialog/perform-actuation-dialog.component';
import { eFCVDataPointIndex, MultiNodeControlDataPointIndex, MultiNodeWellDevicePointIndex } from '@features/multinode/common/MultiNodeRegisterIndex';
import { ViewActuationDialogComponent } from '../view-actuation-dialog/view-actuation-dialog.component';
import { ActuateWellModel, MultiNodeAlarmDefinitionDataUI, MultinodeUIActuationModel } from '@core/models/webModels/MultiNodeUIDataModel.model';
import { ConfigurationService } from '@core/services/configurationService.service';
import { MultinodeFooterService } from '@features/multinode/services/multinode-footer.service';
import { MultiNodeLocalStorage } from '@features/multinode/common/MultiNodeUICommon';
import { MultiNodelocalstorageService } from '@features/multinode/services/multi-nodelocalstorage.service';
import { AlarmService } from '@core/services/alarm.service';
import { TimeAxisBreakCollection } from 'igniteui-angular-charts';

@Component({
  selector: 'app-multinode-monitoring',
  templateUrl: './multinode-monitoring.component.html',
  styleUrls: ['./multinode-monitoring.component.scss']
})
export class MultinodeMonitoringComponent extends GatewayPanelBase implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild("monitoringTabGroup", { static: false })
  public monitoringTabGroup: MatTabGroup;

  wells: MultiNodeWellDataUIModel[] = [];
  sies: SieModel[] = [];
  wellId: number;
  selectedTabIndex: number = 0;
  currentWellId: number;
  selectedWell: string = "";
  actuatingWell: string = "";
  multinodeMonitoringZones: MultinodeMonitoringZone[];
  config: PaginationInstance = {
    id: 'gw-multinode-pagination',
    itemsPerPage: 3,
    currentPage: 1,
    totalItems: 0
  };
  isMobileView: boolean = false;
  multinodeControlDeviceId: number;
  isCurrentStatusActuating: boolean = false;
  buttonText: string = "";
  isWellDisconnected: boolean = false;
  isActuatingStatus: boolean = false;
  isSIUDisconnected: boolean = true;
  defaultRoute = "/multinode/monitoring";

  private arrSubscriptions: Subscription[] = [];
  statusSubscription: Subscription = null;
  wellCommSubscription: Subscription = null;
  routeSubscription: Subscription = null;

  private serverRunningStatusState$: Observable<IServerRunningStatusState>;
  private saveInProgress: boolean = false;
  isOperationInProgress: boolean = false;

  alarmData: MultiNodeAlarmDefinitionDataUI[] = [];

  constructor(protected store: Store,
    private gatewayModalService: GatewayModalService,
    private router: Router,
    protected route: ActivatedRoute,
    private elementRef: ElementRef,
    private wellDataFacade: WellFacade,
    protected sieFacade: SieFacade,
    private userService: UserService,
    private configService: ConfigurationService,
    private dataPointFacade: DeviceDataPointsFacade,
    private realTimeService: RealTimeDataSignalRService,
    private gwFooterService: MultinodeFooterService,
    private multiNodeLocalStorageService: MultiNodelocalstorageService,
    private alarmService: AlarmService) {
    super(store, null, wellDataFacade, null, null, dataPointFacade, null, null, null, sieFacade);
    this.serverRunningStatusState$ = this.store.select<any>((state: any) => state.serverRunningStatusState);
  }

  showElectricalParametersDialog() {
    const dialogData = { wells: this.wells, sies: this.sies }
    this.gatewayModalService.openAdvancedDialog(
      'Electrical Parameters',
      ButtonActions.None,
      ElectricalParametersDialogComponent,
      dialogData,
      (result) => {
        if (result) {

          this.gatewayModalService.closeModal();
        }
      },
      "760px",
      null,
      null,
      null,
      "px-2"
    );
  }

  public onTabAnimationDone(): void {
    const inactiveTabs = this.elementRef.nativeElement.querySelectorAll(
      '.mat-tab-body-active .mat-tab-body-content > .tab-container:not(:first-child)'
    );

    inactiveTabs.forEach(tab => tab.remove());
  }

  onTabChanged(event): void {
    this.checkSIUCommunication();
    //this.selectedWell = event.tab.textLabel;
    this.selectedWell = this.wells[this.selectedTabIndex]?.WellName;
    this.currentWellId = this.wells[this.selectedTabIndex]?.WellId;
    let address = `multinode/monitoring?well=${this.wells[this.selectedTabIndex]?.WellId}`;
    this.router.navigateByUrl("/" + address);
    this.subscribeToMultinodeRealtimeData();
    //this.subscribeToWellCommunication(this.wells[this.selectedTabIndex].WellDeviceId);
  }

  private unSubscribeWellCommunication(): void {
    if (this.wellCommSubscription != null) {
      this.wellCommSubscription.unsubscribe();
      this.wellCommSubscription = null;
    }
  }

  private subscribeToWellCommunication(wellDeviceId: number) {
    this.unSubscribeWellCommunication();
    this.wellCommSubscription = this.realTimeService.GetRealtimeData(wellDeviceId, MultiNodeWellDevicePointIndex.IsCommsPowerOn).subscribe(data => {
      this.isWellDisconnected = data.Value != 1 ? true : false;
    });
  }

  private getActiveAlarmList() {
    
    const subscription = this.alarmService.subscribeToActiveAlarms().subscribe(alarmDesc => {
      this.alarmData = alarmDesc ?? [];
      this.checkSIUCommunication();
    }); 
    this.arrSubscriptions.push(subscription);
  }
  
  private checkSIUCommunication() {
    if (this.saveInProgress) return;
    if (this.alarmData.length === 0) {
      this.isSIUDisconnected = false;
      return; 
    }

    let sieWellLinks: any;

    //find SIU linked with selected WellId 
    for (var i = 0; i < this.sies.length; i++) {
      sieWellLinks = this.sies[i].SIEWellLinks.find(link => link.WellId === this.wells[this.selectedTabIndex]?.WellId);
      if (sieWellLinks != undefined) {
        break;
      }
    }

    if (sieWellLinks != undefined) {
      for (var j = 0; j < this.alarmData.length; j++) {
        if ((this.alarmData[j].AlarmType === 1001 || this.alarmData[j].AlarmType === 1000) && this.alarmData[j].AlarmState != 2) {
          if (this.alarmData[j].AlarmEquipmentId === this.sies.find(s => s.Id === sieWellLinks.SIEId).SIEGuid) {
            this.isSIUDisconnected = true;
            return;
          }              
        }
      }
    }
    this.isSIUDisconnected = false;      
  }

  onMultinodeMonitoringZoneChange(multinodeMonitoringZones) {
    this.multinodeMonitoringZones = multinodeMonitoringZones;
    if (this.routeSubscription === null) {
      this.routeSubscription = this.route.params.subscribe(
        params => {
          if (params['welId']) {
            this.setWell(parseInt(params['welId']));
            setTimeout(() => {
              if (this.isCurrentStatusActuating) {
                this.openViewActuationDialog();
              } else {
                this.openPerformShiftDialog(parseInt(params['welId']));
              }
            }, 500);
          }
        }
      );
    }
  }

  actuateWell(event): void {
    // event.stopPropagation(); /// to ignore panel collapse event
    this.userService.GetCurrentLoginUser().then((user) => {
      if (user && user?.Name !== UICommon.OPENUSER_NAME) {
        this.openPerformShiftDialog(this.currentWellId);
      } else {
        UICommon.LogInRouteURL = `${this.defaultRoute}/${this.currentWellId}`;
        this.router.navigate(['/Login']);
      }
    });
  }

  openPerformShiftDialog(wellId) {
    let well: MultiNodeWellDataUIModel = this.wellEnity.find(w => w.WellId === wellId);
    if (well) {
      const dialogData = { well: well, multinodeMonitoringZones: this.multinodeMonitoringZones, sies: this.sies };
      this.gatewayModalService.openAdvancedDialog(
        'Actuate eFCV',
        ButtonActions.None,
        PerformActuationDialogComponent,
        dialogData,
        (result) => {
          if (result) {
            this.multiNodeLocalStorageService.clearLocalStorage();
            this.viewActuation();
            this.closeModal();
          } else {
            this.closeModal();
          }
        },
        '750px',
        null,
        "280px",
        null,
        'gw-inforce-shift-dialog'
      );
    }
  }

  viewActuation() {
    this.userService.GetCurrentLoginUser().then((user) => {
      if (user && user?.Name !== UICommon.OPENUSER_NAME) {
        this.openViewActuationDialog();
      } else {
        UICommon.LogInRouteURL = `${this.defaultRoute}/${this.currentWellId}`;
        this.router.navigate(['/Login']);
      }
    });
  }

  openViewActuationDialog() {
    const dialogData = { wells: this.wellEnity, sies: this.sieEntity, dataPointDefinitions: this.datapointdefinitions };
    this.gatewayModalService.openAdvancedDialog(
      "",
      ButtonActions.None,
      ViewActuationDialogComponent,
      dialogData,
      (result) => {
        if (result) {
          this.closeModal();
        } else {
          this.closeModal();
        }
      },
      '970px',
      null,
      "620px",
      null,
      'gw-view-actuation-dialog'
    );
  }

  closeModal() {
    this.gatewayModalService.closeModal();
  }

  getQueryParameters() {
    this.route.queryParams.subscribe(
      params => {
        this.wellId = parseInt(params['well']);
      }
    );
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event) {
    this.route.queryParams.subscribe(
      params => {
        this.setWell(parseInt(params['well']));
      }
    );
  }

  setWell(wellId) {
    this.wellId = wellId;
    this.wells = this.wellEnity ?? [];
    if (this.wells && this.wells.length > 0) {
      if (this.wellId) {
        this.selectedTabIndex = this.wellEnity.findIndex(w => w.WellId === this.wellId) ?? 0;
      } else this.selectedTabIndex = 0;
      this.selectedWell = this.wells[this.selectedTabIndex].WellName;
    }
  }

  @HostListener("window:resize", [])
  public onResize() {
    this.detectScreenSize();
  }

  public ngAfterViewInit() {
    this.detectScreenSize();
  }

  private detectScreenSize() {
    this.isMobileView = window.innerWidth < 768 || window.innerHeight < 768 ? true : false;
  }

  IsBeingActuated = (value, wellName): void => {
    if (value.Value === 1) {
      this.isActuatingStatus = true;
      this.setActuatingWellName(wellName);
    }
  }

  setActuatingWellName(wellName) {
    this.actuatingWell = wellName;
  }

  private subscribeToCurrentStatusRealtimeData(deviceId) {
    if (this.statusSubscription == null) {
      this.statusSubscription = this.realTimeService.GetRealtimeData(deviceId, MultiNodeControlDataPointIndex.CurrentShiftStatus).subscribe(value => {
        if (value != undefined && value != null) {
          this.isCurrentStatusActuating = value.Value === 1;
          if (this.isCurrentStatusActuating) {
            /* const subscription = this.configService.getActuationWellObject().subscribe((well: MultinodeUIActuationModel) => {
              if (well) {
                let currentWell = this.wells.find(w => w.WellId + "" === well.WellId);
                if (currentWell) {
                  this.subscribeToRealtimeData(currentWell.WellDeviceId, MultiNodeWellDevicePointIndex.IsBeingActuated, currentWell.WellName, this.IsBeingActuated);
                }
              }
            });
            this.arrSubscriptions.push(subscription); */
            this.wellEnity.forEach(well => {
              this.subscribeToRealtimeData(well.WellDeviceId, MultiNodeWellDevicePointIndex.IsBeingActuated, well.WellName, this.IsBeingActuated);
            })
          } else {
            this.actuatingWell = "";
          }
        }
      });
      this.arrSubscriptions.push(this.statusSubscription);
    }
  }

  private subscribeToRealtimeData(deviceId, pointIndex, wellName, callBack) {
    let subscription = this.realTimeService.GetRealtimeData(deviceId, pointIndex).subscribe(value => {
      if (value != undefined && value != null) {
        callBack(value, wellName);
      }
    });
    this.arrSubscriptions.push(subscription);
  }

  public postCallDeviceDataPoints(): void {
    this.subscribeToMultinodeRealtimeData();
    //this.subscribeToWellCommunication(this.wells[this.selectedTabIndex].WellDeviceId);
  }

  subscribeToMultinodeRealtimeData() {
    this.multinodeControlDeviceId = this.devices.find(c => c.Name == "MultiNodeControl")?.Id;
    if (this.multinodeControlDeviceId)
      this.subscribeToCurrentStatusRealtimeData(this.multinodeControlDeviceId);
  }

  private subscribeToServerRunningStatus(): void {
    let subscription = this.serverRunningStatusState$.subscribe(
      (state: IServerRunningStatusState) => {
        if (state) {
          if (this.saveInProgress && !state.ConfigurationSavingInProgress) {
            console.log("Load Devices and Data Points after server reaqusition finished...");
            this.store.dispatch(TOOL_CONNECTIONS_LOAD()); // Load ToolConnections after server reacqusition finished
            this.store.dispatch(LOAD_DEVICES());          // Load Devices after server reacqusition finished
            this.store.dispatch(LOAD_DATAPOINTDEF());     // Load Data Points after server reacqusition finished
          }
          this.saveInProgress = state.ConfigurationSavingInProgress;
        }
      }
    );
    this.arrSubscriptions.push(subscription);
  }

  postCallGetWells(): void {
    this.wells = this.wellEnity.filter(Px=>Px.WellDeviceId > 0) ?? [];
    this.wells.forEach(py=>{
      let wellZones = [];
      py.Zones.forEach(pz=>{
        if(pz.HcmId>0)
          {
            wellZones.push(pz);
          }
      })
      py.Zones = wellZones;
    })
    if (this.wells && this.wells.length > 0) {
      if (this.wellId) {
        this.selectedTabIndex = this.wellEnity.findIndex(w => w.WellId === this.wellId) ?? 0;
      }
      this.selectedWell = this.wells[this.selectedTabIndex]?.WellName;
      this.currentWellId = this.wells[this.selectedTabIndex]?.WellId;
      this.initDeviceDataPoints();
    }
  }

  private subscribeToFooterStatus() {
    const subscription = this.gwFooterService.subscribeToMultiNodeOperation().subscribe(operationStatus => {
      if (this.isOperationInProgress != operationStatus)
        this.isOperationInProgress = operationStatus;
    });
    this.arrSubscriptions.push(subscription);
  }

  postCallGetSie(): void {
    Object.assign(this.sies, this.sieEntity);
    this.initWells();
  }

  ngOnDestroy(): void {
    if (this.arrSubscriptions != null && this.arrSubscriptions.length > 0) {
      this.arrSubscriptions.forEach((subscription) => {
        if (subscription != null) {
          subscription.unsubscribe();
          subscription = null;
        }
      });
      if (this.statusSubscription !== null) {
        this.statusSubscription.unsubscribe();
        this.statusSubscription = null;
      }
      if (this.routeSubscription !== null) {
        this.routeSubscription.unsubscribe();
        this.routeSubscription = null;
      }
      this.unSubscribeWellCommunication();
    }
    super.ngOnDestroy();
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.initSie();
    this.getQueryParameters();
    this.initWells();
    this.subscribeToServerRunningStatus();
    this.subscribeToFooterStatus();
    this.getActiveAlarmList();
    if (history.state && history.state.isTimeBasedActuation === true) {
      this.viewActuation();
    }
  }

}