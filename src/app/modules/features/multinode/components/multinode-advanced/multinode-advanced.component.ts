import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { GatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { deleteUIModal, UICommon } from '@core/data/UICommon';
import { DeviceDataPointsFacade } from '@core/facade/deviceDataPointsFacade.service';
import { PanelConfigurationFacade } from '@core/facade/panelConfigFacade.service';
import { SieFacade} from '@core/facade/sieFacade.service';
import { WellFacade } from '@core/facade/wellFacade.service';
import { MultiNodeAlarmDefinitionDataUI } from '@core/models/webModels/MultiNodeUIDataModel.model';
import { SieModel } from '@core/models/webModels/Sie.model';
import { AlarmService } from '@core/services/alarm.service';
import { RealTimeDataSignalRService } from '@core/services/realTimeDataSignalR.service';
import { MultiNodeCommon, MultiNodeManualOperation } from '@features/multinode/common/multiNodeCommon';
import { MultiNodeWellDevicePointIndex } from '@features/multinode/common/MultiNodeRegisterIndex';
import { MultinodeFooterService } from '@features/multinode/services/multinode-footer.service';
import { MultinodeService } from '@features/multinode/services/multinode.service';
import { Store } from '@ngrx/store';
import { ButtonActions } from '@shared/gateway-dialogs/components/gateway-advanced-dialog/gateway-advanced-dialog.component';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { IServerRunningStatusState } from '@store/state/serverRunningStatus.state';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-multinode-advanced',
  templateUrl: './multinode-advanced.component.html',
  styleUrls: ['./multinode-advanced.component.scss']
})
export class MultinodeAdvancedComponent extends GatewayPanelBase implements OnInit, OnDestroy {

  toolboxRoute: string = "/multinode/toolbox";
  isPowerSupplySelected = false;
  selectedTabIndex = 0;
  selectedSieId: number = 0;
  selectedWellId: number = 0;
  isFormValid: boolean = false;
  manualModeOperation: MultiNodeManualOperation;
  disablePowerButton: boolean = false;
  isOperationInProgress: boolean = false;
  // wells: any;
  private arrSubscriptions: Subscription[] = [];
  alarmData: MultiNodeAlarmDefinitionDataUI[] = [];
  isSIUDisconnected: boolean = true;
  private serverRunningStatusState$: Observable<IServerRunningStatusState>;
  private saveInProgress: boolean = false;
  sieGuid: string;
  sies: SieModel[] = [];
  manualMode_wellId: number = 0;
  diagnostics_wellId: number = 0;

  private wellOperationEchoMode: Map<number, boolean> = new Map<number, boolean>();

  constructor(protected store: Store,
    private panelConfigFacade: PanelConfigurationFacade,
    private wellDataFacade: WellFacade,
    protected sieFacade: SieFacade,
    private dataPointFacade: DeviceDataPointsFacade,
    private multiNodeService: MultinodeService,
    private gwModalService: GatewayModalService,
    private realTimeService: RealTimeDataSignalRService,
    private gwFooterService: MultinodeFooterService,
    private router: Router,
    private alarmService: AlarmService) {
    super(store, panelConfigFacade, wellDataFacade, null, null, dataPointFacade, null, null, null, sieFacade);
    this.serverRunningStatusState$ = this.store.select<any>((state: any) => state.serverRunningStatusState);
  }
  onTabChanged(index): void {
    this.selectedTabIndex = index;
    if (index === 0) // manual mode
    { 
      if (this.manualMode_wellId === 0) return
      this.selectedWellId = this.manualMode_wellId;    
      if (this.isPowerSupplySelected) {
        let selectedSIE = this.sies.find(sie => sie.Id === this.selectedSieId);
        if (selectedSIE) {
          this.sieGuid = selectedSIE.SIEGuid;
        }      
      } 
      else 
      {
        this.sies.forEach(sie => {
          let wellsielink = sie.SIEWellLinks.find(sw => sw.WellId === this.selectedWellId);
          if (wellsielink) {
            this.sieGuid = sie.SIEGuid;
          }
        });    
      }         
    }
    if (index === 1) // diagnostics mode
    { 
      if (this.diagnostics_wellId === 0) return
      this.selectedWellId = this.diagnostics_wellId;   
      this.sies.forEach(sie => {
        let wellsielink = sie.SIEWellLinks.find(sw => sw.WellId === this.selectedWellId);
        if (wellsielink) {
          this.sieGuid = sie.SIEGuid;
        }
      });            
    }   

    this.checkSIUCommunication();       
  }

  isPowerSupplyTabSelected(isPowerSupplySelected) {
    this.isPowerSupplySelected = isPowerSupplySelected;
  }

  selectedSIE(selectedSieId) {
    this.selectedSieId = selectedSieId;
    let selectedSIE = this.sies.find(sie => sie.Id === selectedSieId);
    if (selectedSIE) {
      this.sieGuid = selectedSIE.SIEGuid;
    }    
    this.checkSIUCommunication();    
  }

  selectedWell(wellId) {
    this.selectedWellId = wellId;
    if (this.selectedTabIndex === 0) this.manualMode_wellId = wellId;
    if (this.selectedTabIndex === 1) this.diagnostics_wellId = wellId;    
    this.sies.forEach(sie => {
      let wellsielink = sie.SIEWellLinks.find(sw => sw.WellId === wellId);
      if (wellsielink) {
        this.sieGuid = sie.SIEGuid;
      }
    });    
    this.checkSIUCommunication();    
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

    if (this.sieGuid != undefined) {
      for (var j = 0; j < this.alarmData.length; j++) {
        if ((this.alarmData[j].AlarmType === 1001 || this.alarmData[j].AlarmType === 1000) && this.alarmData[j].AlarmState != 2 && this.alarmData[j].AlarmEquipmentId === this.sieGuid) {
          this.isSIUDisconnected = true;
          this.disablePowerButton = true;
          return;
        }
      }
    }
    this.isSIUDisconnected = false;
    this.disablePowerButton = false;
  }  

  private subscribeToServerRunningStatus(): void {
    let subscription = this.serverRunningStatusState$.subscribe(
      (state: IServerRunningStatusState) => {
        if (state) {
          this.saveInProgress = state.ConfigurationSavingInProgress;
        }
      }
    );
    this.arrSubscriptions.push(subscription);
  }

  onApplyManualMode(): void {
    if (this.manualModeOperation) {
      if (this.manualModeOperation.operationType === MultiNodeCommon.TimeBasedActuation) {
        this.multiNodeService.timebasedActuation(this.manualModeOperation.timeBasedActuation).subscribe(() => {
          this.router.navigateByUrl('/multinode/monitoring?well=' + this.selectedWellId.toString(), { state: { isTimeBasedActuation: true } });
        })
      }
      else {
        this.multiNodeService.overridePosition(this.manualModeOperation.overridePosition).subscribe(() => {
          this.gwModalService.openDialog(
            "Position Override successful",
            () => { this.gwModalService.closeModal(); },
            () => this.gwModalService.closeModal(),
            "Override Position",
            null,
            false,
            "Ok",
            null
          );
        });
      }
    }
  }
  powerDown() {
    this.disablePowerButton = true;
    this.multiNodeService.onPowerDown(this.selectedSieId).subscribe(result => {
      this.disablePowerButton = false;
      /*  this.gwModalService.openDialog(
         "Power down command sent",
         () => { this.disablePowerButton = false; this.gwModalService.closeModal(); },
         () => this.gwModalService.closeModal(),
         "Power Down",
         null,
         false,
         "Ok",
         null
       ); */
    });
  }
  onPowerDown(): void {
    this.gwModalService.openDialog(
      "Power Down Communications Power Supply?",
      () => { this.powerDown(); this.gwModalService.closeModal(); },
      () => this.gwModalService.closeModal(),
      "Power Down",
      null,
      true,
      "Power Down",
      null, null, "gw-mn-power-down-popup"
    );
  }

  powerUp() {
    this.disablePowerButton = true;
    this.multiNodeService.onPowerUp(this.selectedSieId).subscribe(result => {
      this.disablePowerButton = false;
      /*  this.gwModalService.openDialog(
         "Power up command sent",
         () => { this.disablePowerButton = false; this.gwModalService.closeModal(); },
         () => this.gwModalService.closeModal(),
         "Power Up",
         null,
         false,
         "Ok",
         null
       ); */
    });
  }
  onPowerUp(): void {
    this.gwModalService.openDialog(
      "Power Up Communications Power Supply?",
      () => { this.powerUp(); this.gwModalService.closeModal(); },
      () => this.gwModalService.closeModal(),
      "Power Up",
      null,
      true,
      "Power Up"
    );
  }

  // postCallGetWells(): void {
  //   this.wells = this.wellEnity ?? [];
  //   this.initDeviceDataPoints();
  // //  this.subscribeToEchoCommunicationStatus();
  // }


  postCallDeviceDataPoints(): void {
    //   this.subscribeToEchoStatus();
  }

  postCallGetSie(): void {
    this.sies = this.sieEntity ?? [];
  }

  manualModeOperationChanged(manualModeOperation: MultiNodeManualOperation) {
    this.isFormValid = manualModeOperation.isDataValid;
    this.manualModeOperation = manualModeOperation;
  }

  ngOnDestroy(): void {
    if (this.arrSubscriptions != null && this.arrSubscriptions.length > 0) {
      this.arrSubscriptions.forEach((subscription) => {
        if (subscription !== null) {
          subscription.unsubscribe();
          subscription = null;
        }
      });
    }
    this.arrSubscriptions = [];
    super.ngOnDestroy();
  }

  private subscribeToFooterStatus() {
    const subscription = this.gwFooterService.subscribeToMultiNodeOperation().subscribe(operationStatus => {
      if (this.isOperationInProgress != operationStatus)
        this.isOperationInProgress = operationStatus;
    });
    this.arrSubscriptions.push(subscription);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.initSie();
    this.subscribeToServerRunningStatus();
    this.getActiveAlarmList();
    this.subscribeToFooterStatus();
  }
}
