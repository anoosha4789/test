import { Injectable } from '@angular/core';
import { FooterStatus, footerStatusType, GwFooterService } from '@core/services/gw-footer-service.service';
import { RealTimeDataSignalRService } from '@core/services/realTimeDataSignalR.service';
import { UserService } from '@core/services/user.service';
import { Store } from '@ngrx/store';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { MultinodeModule } from '../multinode.module';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { DeviceModel } from '@core/models/webModels/DeviceInfo.model';
import { LOAD_DEVICES,LOAD_DATAPOINTDEF } from '@store/actions/deviceDataPoints.action';
import { StateUtilities } from '@store/state/IState';
import { IDeviceDataPoints } from '@store/state/deviceDataPoints.state';
import { ButtonActions } from '@shared/gateway-dialogs/components/gateway-advanced-dialog/gateway-advanced-dialog.component';
import { EndOfActuationDialogComponent } from '../components/end-of-actuation-dialog/end-of-actuation-dialog.component';
import { selectAllWells, selectWellState } from "@store/reducers/well.entity.reducer";
import { IWellEntityState } from "@store/state/well.state";
import * as WELL_ACTIONS from '@store/actions/well.entity.action';
import * as _ from "lodash";
import { MultiNodeControlDataPointIndex, MultiNodeWellDevicePointIndex, SIUDataPointIndex } from '../common/MultiNodeRegisterIndex';
import { UICommon } from '@core/data/UICommon';
import { selectAllSie, selectSieState } from '@store/reducers/sie.entity.reducer';
import { ISieEntityState } from '@store/state/sie.state';
import * as SIE_ACTIONS from '@store/actions/sie.entity.action';
import { SieUIModel } from '@core/models/UIModels/sie.model';

@Injectable({
  providedIn: MultinodeModule
})
export class MultinodeFooterService {
  private deviceDataPointsModels$: Observable<IDeviceDataPoints>;
  devices: DeviceModel[] = [];
  private multinodeDeviceId: number;
  private dataSubscriptions: Subscription[] = [];
  isCurrentStatusNotActuating: boolean = false;
  isOperatorInputNeeded: boolean = false;
  wellEntity: any[];
  wellEchoStatus: boolean[] = [];
  isEchoInProgress: boolean = false;
  sies: SieUIModel[];
  siePowerUpStatus: Map<string, boolean> = new Map<string, boolean>();
  siePowerDownStatus: Map<string, boolean> = new Map<string, boolean>();
  isPowerUpInProgress: boolean = false;
  isPowerDownInProgres: boolean = false;
  footerPanelStatus: FooterStatus = null;
  wellSubscribed: boolean = false;

  private _isOperationInProgressSubject = new BehaviorSubject<boolean>(false);
  private _isCurrentShiftInProgressSubject = new BehaviorSubject<boolean>(false);


  constructor(private store: Store<{
    deviceDataPointsState: IDeviceDataPoints;
  }>,
    private realTimeService: RealTimeDataSignalRService,
    private gwFooterService: GwFooterService,
    private gwModalService: GatewayModalService,
    private userService: UserService
  ) {
    this.deviceDataPointsModels$ = this.store.select<any>(
      (state: any) => state.deviceDataPointsState
    );
    this.initializeFooter();
  }

  initializeFooter(): void {
    this.subscribeToWellEntityStore();
    this.subscribeToSIEEntity();
    this.realTimeService.GetMultiNodePackageLoadEventFlag().subscribe(value => {
      this.footerPanelStatus.footerProperties[0].Status = value ? FooterOperation.INITIALIZE : FooterOperation.IDLE;
      this.footerPanelStatus.shifting = value;
      this.gwFooterService.updateFooterPanelStatus(this.footerPanelStatus);
      this.updateOperationInProgressStatus();
    });
  }

  private subscribeTodeviceDatapoints(): void {
    let subscription = this.deviceDataPointsModels$.subscribe(
      (state: IDeviceDataPoints) => {
        if (state !== undefined) {
          if (state.isLoaded === false && !StateUtilities.hasErrors(state)) {
            this.store.dispatch(LOAD_DEVICES());
            this.store.dispatch(LOAD_DATAPOINTDEF());     // Load Data Points 
          } else {
            Object.assign(this.devices, state.devices);
            if (this.devices.length > 0 && !this.multinodeDeviceId) {
              this.multinodeDeviceId = this.devices.find(c => c.Name == "MultiNodeControl")?.Id;
              this.subscribeToCurrentStatusRealtimeData(this.multinodeDeviceId);
            }
          }
        }
      }
    );
    this.dataSubscriptions.push(subscription);
  }

  private subscribeToWellEntityStore() {
    this.footerPanelStatus = {
      showPanelStatus: true,
      shifting: false,
      shiftWell: {
        wellId: -1,
        navigateAddress: ""
      },
      footerProperties: []
    };

    this.footerPanelStatus.footerProperties.push({ DisplayName: "Mode", Status: "Idle", statusType: footerStatusType.OperationMode });
    let subscription = this.store.select<any>(selectWellState).subscribe((state: IWellEntityState) => {
      if (state && !state.isLoaded) {
        this.store.dispatch(WELL_ACTIONS.WELL_LOAD());
      }
      else {
        this.store.select<any>(selectAllWells).subscribe(wells => {
          this.wellEntity = _.cloneDeep(wells);
        });
        if (this.wellEntity.length > 0 && !this.wellSubscribed) {
          this.wellSubscribed = true;
          this.subscribeTodeviceDatapoints();
          this.subscribeToEchoTestData();
        }
      }
    });
    this.dataSubscriptions.push(subscription);
  }

  private subscribeToSIEEntity() {
    let subscription = this.store.select<any>(selectSieState).subscribe((state: ISieEntityState) => {
      if (state && !state.isLoaded) {
        this.store.dispatch(SIE_ACTIONS.SIE_LOAD());
      } else {
        this.store.select<any>(selectAllSie).subscribe(data => {
          this.sies = data;
        })
        this.subscribeToCommunicationStatus();
      }
    });
    this.dataSubscriptions.push(subscription);
  }
  
  private subscribeToEchoTestData() {
    this.wellEchoStatus = new Array<boolean>(this.wellEntity.length);
    this.wellEntity.forEach((well, index) => {
      let subscription = this.realTimeService.GetRealtimeData(well.WellDeviceId, MultiNodeWellDevicePointIndex.EchoState).subscribe(value => {
        this.wellEchoStatus[index] = value.Value === 1 ? true: false;
        this.setUpEchoFooterStatus();
      });
      this.dataSubscriptions.push(subscription);
    });
  }

  private setUpEchoFooterStatus(): void {
    let bIsEcho = false;
    this.wellEchoStatus.forEach(echoStatus => {
      bIsEcho = bIsEcho || echoStatus;
    });
    this.isEchoInProgress = bIsEcho;

    if (bIsEcho) {
      this.footerPanelStatus.footerProperties[0].Status = FooterOperation.ECHO;
      this.footerPanelStatus.shifting = true;
      this.isEchoInProgress = true;
    }
    
    if (this.footerPanelStatus.footerProperties[0].Status === FooterOperation.ECHO && !this.isEchoInProgress) {
      this.footerPanelStatus.footerProperties[0].Status = FooterOperation.IDLE;
      this.footerPanelStatus.shifting = false;
    }
    this.gwFooterService.updateFooterPanelStatus(this.footerPanelStatus);
    this.updateOperationInProgressStatus();
  }

  private subscribeToCommunicationStatus() {
    this.siePowerUpStatus.clear();
    this.siePowerDownStatus.clear();
    for (let i = 0; i < this.sies.length; i++) {
      let subscription = this.realTimeService.GetRealtimeData(this.sies[i].SIEDeviceId, SIUDataPointIndex.CommStatus).subscribe(value => {
        if (value != undefined && value != null) {
          if (value.Value === 0) {
            this.subscribeToConnectionStatus(this.sies[i].SIEDeviceId);
          }
        }
      });
      this.dataSubscriptions.push(subscription);
    }
  }

  private subscribeToConnectionStatus(sieDeviceId) {
    let subscription = this.realTimeService.GetRealtimeData(sieDeviceId, SIUDataPointIndex.CommStatus2).subscribe(value => {
      if (value != undefined && value != null) {
        if (value.Value === 0) {
          this.subscribeToPowerDownData(sieDeviceId);
          this.subscribeToPowerupData(sieDeviceId);
        }
      }
    });
    this.dataSubscriptions.push(subscription);
  }

  private subscribeToPowerDownData(sieDeviceId) {
    let subscription = this.realTimeService.GetRealtimeData(sieDeviceId, SIUDataPointIndex.IsPowerOffInProgress).subscribe(value => {
      if (value != undefined && value != null) {
        this.siePowerDownStatus.set(sieDeviceId, value.Value == 1 ? true : false);
        this.setUpPowerDownStatus();
      }
    })
    this.dataSubscriptions.push(subscription);
  }

  private setUpPowerDownStatus(): void {
    let bIsPoweringDown = false;
    this.siePowerDownStatus.forEach((value, key) => {
      bIsPoweringDown = bIsPoweringDown || value;
    });

    this.isPowerDownInProgres = bIsPoweringDown;
    if (bIsPoweringDown && this.footerPanelStatus.footerProperties[0].Status != FooterOperation.ACTUATION) {
      this.footerPanelStatus.footerProperties[0].Status = FooterOperation.RAMPDOWN;
      this.footerPanelStatus.shifting = true;
      this.isPowerDownInProgres = true;
    }
    
    if (this.footerPanelStatus.footerProperties[0].Status == FooterOperation.RAMPDOWN && !this.isPowerDownInProgres) {
      this.footerPanelStatus.footerProperties[0].Status = FooterOperation.IDLE;
      this.footerPanelStatus.shifting = false;
    }
    this.gwFooterService.updateFooterPanelStatus(this.footerPanelStatus);
    this.updateOperationInProgressStatus();
  }

  private subscribeToPowerupData(sieDeviceId) {
    let subscription = this.realTimeService.GetRealtimeData(sieDeviceId, SIUDataPointIndex.IsPowerOnInProgress).subscribe(value => {
      if (value != undefined && value != null) {
        this.siePowerUpStatus.set(sieDeviceId, value.Value == 1 ? true : false);
        this.setUpPowerUpStatus();
      }

    });
    this.dataSubscriptions.push(subscription);
  }

  private setUpPowerUpStatus(): void {
    let bIsPoweringUp = false;
    this.siePowerUpStatus.forEach((value, key) => {
      bIsPoweringUp = bIsPoweringUp || value;
    });
    this.isPowerUpInProgress = bIsPoweringUp;

    if (bIsPoweringUp && this.footerPanelStatus.footerProperties[0].Status != FooterOperation.ACTUATION) {
      this.footerPanelStatus.footerProperties[0].Status = FooterOperation.RAMPUP;
      this.footerPanelStatus.shifting = true;
      this.isPowerUpInProgress = true;
    }
    
    if (this.footerPanelStatus.footerProperties[0].Status == FooterOperation.RAMPUP && !this.isPowerUpInProgress) {
      this.footerPanelStatus.footerProperties[0].Status = FooterOperation.IDLE;
      this.footerPanelStatus.shifting = false;
    }
    this.gwFooterService.updateFooterPanelStatus(this.footerPanelStatus);
    this.updateOperationInProgressStatus();
  }


  private subscribeToCurrentStatusRealtimeData(deviceId) {
    this.subscribeToRealtimeData(deviceId, MultiNodeControlDataPointIndex.CurrentShiftStatus, this.CurrentShiftStatusCallback);
    this.subscribeToRealtimeData(deviceId, MultiNodeControlDataPointIndex.ActuateResult, this.ActuateResultCallback);
    this.subscribeToRealtimeData(deviceId, MultiNodeControlDataPointIndex.OperatorInputNeeded, this.OperatorInputNeededCallback);
  }

  CurrentShiftStatusCallback = (data): void => {
    let bIsShifting = false;
    if (this.footerPanelStatus.footerProperties[0].Status == FooterOperation.IDLE) {
      if (data.Value === 1) {  // Actuation In Progress
        this.isCurrentStatusNotActuating = false;
        this.footerPanelStatus.footerProperties[0].Status = FooterOperation.ACTUATION;
        bIsShifting = true;
        this.footerPanelStatus.shifting = true;
      }

      this.gwFooterService.updateFooterPanelStatus(this.footerPanelStatus);
      this.updateOperationInProgressStatus();
      this.updateCurrentShiftStatus(this.footerPanelStatus.shifting)
    }
      
    if (this.footerPanelStatus.footerProperties[0].Status == FooterOperation.ACTUATION) {
      if (data.Value > 1) { // Actuation Completed
        this.isCurrentStatusNotActuating = true;
        this.footerPanelStatus.footerProperties[0].Status = FooterOperation.IDLE;
        this.footerPanelStatus.shifting = false;
        bIsShifting = false;
        this.showEndofActuationDialog();
      }

      if (!bIsShifting) {
        this.isCurrentStatusNotActuating = false;
        this.footerPanelStatus.footerProperties[0].Status = FooterOperation.IDLE;
        bIsShifting = false;
        this.footerPanelStatus.shifting = false;
      }

      this.gwFooterService.updateFooterPanelStatus(this.footerPanelStatus);
      this.updateOperationInProgressStatus();
      this.updateCurrentShiftStatus(this.footerPanelStatus.shifting)
    }
  }

  ActuateResultCallback = (value): void => {
    if (value.Value > 1) {
      this.isCurrentStatusNotActuating = true;
      this.showEndofActuationDialog();
    }
    else {
      this.isCurrentStatusNotActuating = false;
    }
  }
  OperatorInputNeededCallback = (value): void => {
    if (value.Value === 1) {
      this.isOperatorInputNeeded = true;
      this.showEndofActuationDialog();
    }
    else {
      this.isOperatorInputNeeded = false;
    }
  }
  private subscribeToRealtimeData(deviceId, pointIndex, callBack) {
    let subscription = this.realTimeService.GetRealtimeData(deviceId, pointIndex).subscribe(value => {
      if (value != undefined && value != null) {
        callBack(value);
      }
    });
    this.dataSubscriptions.push(subscription);
  }

  private showEndofActuationDialog() {
    if (this.isCurrentStatusNotActuating && this.isOperatorInputNeeded) {
      if (this.gwModalService.dialog) {
        this.gwModalService.dialog.closeAll();
      }
      const dialogData = { well: this.wellEntity, multinodeDeviceId: this.multinodeDeviceId }
      this.userService.GetCurrentLoginUser().then(user => {
        if (user && user?.Name !== UICommon.OPENUSER_NAME) {
          this.gwModalService.openAdvancedDialog(
            'End of Actuation',
            ButtonActions.None,
            EndOfActuationDialogComponent,
            dialogData,
            (result) => { },
            '750px',
            null,
            null,
            null,
            "gw-end-of-actuation-dialog"
          );
        }
      })
    }
  }

  private isOperationInProgress(): boolean {
    let bIsOperationInProgress = false;
    if (this.footerPanelStatus.footerProperties[0].Status != FooterOperation.IDLE)
      bIsOperationInProgress = true;

    return bIsOperationInProgress;
  }

  updateOperationInProgressStatus(): void {
    let bIsOperationInProgress = this.isOperationInProgress();
    this._isOperationInProgressSubject.next(bIsOperationInProgress);
    this.gwFooterService.updateOperationInProgressStatus(bIsOperationInProgress);
  }

  subscribeToMultiNodeOperation(): BehaviorSubject<boolean> {
    return this._isOperationInProgressSubject;
  }

  updateCurrentShiftStatus(isCurrentShiftInProgress: boolean): void {
    this._isCurrentShiftInProgressSubject.next(isCurrentShiftInProgress)
  }

  subscribeToCurrentShiftStatus(): BehaviorSubject<boolean> {
    return this._isCurrentShiftInProgressSubject;
  }
}

export enum FooterOperation {
  IDLE = "Idle",
  ACTUATION = "Actuating",
  RAMPUP = "Ramp Up",
  RAMPDOWN = "Ramp Down",
  ECHO = "Echo",
  INITIALIZE = "Initialize"
}
