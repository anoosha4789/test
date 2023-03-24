import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { Store } from '@ngrx/store';
import { selectAllWells, selectWellState } from '@store/reducers/well.entity.reducer';
import { IWellEntityState } from '@store/state/well.state';
import { forkJoin, observable, Observable, Subscription } from 'rxjs';
import * as ALARMS_AND_LIMITS_ACTIONS from '@store/actions/alarms-and-limits.action';
import * as WELL_ACTIONS from '@store/actions/well.entity.action';
import * as _ from 'lodash';
import * as DEVICEPOINTS_ACTIONS from '@store/actions/deviceDataPoints.action';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { PumpPressureDialogComponent } from '../pump-pressure-dialog/pump-pressure-dialog.component';
import { ButtonActions } from '@shared/gateway-dialogs/components/gateway-advanced-dialog/gateway-advanced-dialog.component';
import { DownholeValvePositionDialogComponent } from '../downhole-valve-position-dialog/downhole-valve-position-dialog.component';
import { InforceWellUIModel } from '@core/models/UIModels/InforceWell.model';
import { RealTimeDataSignalRService } from '@core/services/realTimeDataSignalR.service';
import { ExecutionMode, HyrdraulicPowerUnitPointIndex, InforceWellDevicePointIndex, InFORCEZone_HCM_PointIndex, Module2542PointIndex, OperationMode, OutputPressureSensors } from '@features/inforce/common/InForceModbusRegisterIndex';
import { IInforceDeviceState } from '@store/state/inforcedevices.state';
import { InforceDeviceDataModel } from '@core/models/webModels/InforceDeviceData.model';
import { INFORCEDEVICES_LOAD } from '@store/actions/inforcedevices.action';
import { StateUtilities } from '@store/state/IState';
import { WriteToServerDataModel } from '@core/models/webModels/WriteToServerData.model';
import { ConfigurationService } from '@core/services/configurationService.service';
import { DataPointDefinitionModel } from '@core/models/webModels/DataPointDefinition.model';
import { DeviceIdIndexValue } from '@core/models/webModels/PointTemplate.model';
import { DeviceDataPointsFacade } from '@core/facade/deviceDataPointsFacade.service';
import { IDeviceDataPoints } from '@store/state/deviceDataPoints.state';
import { PanelToLineMappingModel } from '@core/models/webModels/PanelToLineMapping.model';
import { ManualModeGraphDialogComponent } from '../manual-mode-graph-dialog/manual-mode-graph-dialog.component';
import { IConfirmShiftDialogData } from '../inforce-confirm-shift-dialog/inforce-confirm-shift-dialog.component';
import { UserService } from '@core/services/user.service';
import { Router } from '@angular/router';
import { INFORCE_WELL_ARCHITECTURE } from '@core/services/well.service';

@Component({
  selector: 'app-manual-mode',
  templateUrl: './manual-mode.component.html',
  styleUrls: ['./manual-mode.component.scss']
})
export class ManualModeComponent implements OnInit, OnDestroy {
  isPanelinManualMode: boolean = false;
  toggleConfig = {
    color: 'primary',
    checked: false,
    disabled: false
  }
  manualModeText = "Off";
  toolboxRoute: string = "/inforce/toolbox";
  wellState$: Observable<IWellEntityState>;
  // Store Entity objects
  wellEntity: any[];
  activeTabIndex = 0;

  pumpPressure: HPURealtimeDataPoint;
  changePumpPressure: HPURealtimeDataPoint;
  supplyRecirculate: HPURealtimeDataPoint;
  returnFlowMeter: HPURealtimeDataPoint;
  reservoirLevel: HPURealtimeDataPoint;

  wellOutputDataPoints: WellRealtimeDataPoint[] = [];
  isCommStatusFailed: boolean;
  isOperationExecutionInProgress: boolean;

  private deviceDataPointsModels$: Observable<IDeviceDataPoints>;
  datapointdefinitions: DataPointDefinitionModel[] = [];
  InforceDeviceState$: Observable<IInforceDeviceState>;
  private inforcedevices: InforceDeviceDataModel[] = [];
  private hpuDeviceId: number;
  private Module2542Id: number;
  private currentWell: InforceWellUIModel;
  private dataSubscriptions: Subscription[] = [];

  constructor(protected store: Store<{ wellState: IWellEntityState }>, private gatewayModalService: GatewayModalService,
    private realTimeSignalRService: RealTimeDataSignalRService, private configService: ConfigurationService, private userService: UserService, private router: Router) {
    this.wellState$ = this.store.select<any>(
      (state: any) => state.wellState
    );
    this.InforceDeviceState$ = this.store.select<any>((state: any) => state.inforcedevicesState);
    this.deviceDataPointsModels$ = this.store.select<any>(
      (state: any) => state.deviceDataPointsState
    );
  }

  toggleManualMode(event: MatSlideToggleChange): void {
    let writeVar = new WriteToServerDataModel();
    writeVar.DeviceId = this.hpuDeviceId;
    writeVar.PointIndex = HyrdraulicPowerUnitPointIndex.SetOperationModeInternal;
    writeVar.PointName = HyrdraulicPowerUnitPointIndex.SetOperationModeInternalName;
    writeVar.Value = event.checked ? OperationMode.Manual : 0;
    writeVar.WriteToServerCommandEnum = 1;
    this.configService.WriteToServer(writeVar).subscribe();
    this.store.dispatch(ALARMS_AND_LIMITS_ACTIONS.LOAD_ALARMS_AND_LIMITS());
  }

  getFormattedUnit(unit) {
    return unit ? `(${unit})` : "";
  }

  ventSupplyActionClick(panelToLineMapping: ManualModePanelToLineMappingModel): void {
    let value = panelToLineMapping.actionDataPoint.value == 0 ? 1 : 0;
    this.writeToServer(this.hpuDeviceId, panelToLineMapping.actionDataPoint.pointIndex, panelToLineMapping.PanelConnection.replace(" ", "") + "_Solenoid", value);
  }

  pumpControlActionClick(): void {
    let value = this.pumpPressure.actionDataPoint.value == 0 ? 1 : 0;
    this.writeToServer(this.hpuDeviceId, HyrdraulicPowerUnitPointIndex.StartPump, HyrdraulicPowerUnitPointIndex.StartPumpName, value);
  }

  supplyRecirculateActionClick(): void {
    let value = this.supplyRecirculate.actionDataPoint.value == 0 ? 1 : 0;
    this.writeToServer(this.hpuDeviceId, HyrdraulicPowerUnitPointIndex.OpenRecirculationValve, HyrdraulicPowerUnitPointIndex.OpenRecirculationValveName, value);
  }

  flowMeterActionClick(): void {
    let value = this.returnFlowMeter.actionDataPoint.value == 0 ? 1 : 0;
    this.writeToServer(this.hpuDeviceId, HyrdraulicPowerUnitPointIndex.TurnOnFlowmeter, HyrdraulicPowerUnitPointIndex.TurnOnFlowmeterName, value);
  }

  ResetFlowMeter(): void {
    if (this.inforcedevices.find(c => c.DeviceName == "ModuleFlowMeterFluidWell")) {
      this.writeToServer(this.hpuDeviceId, HyrdraulicPowerUnitPointIndex.ResetReturnsFlowmeterTotal, HyrdraulicPowerUnitPointIndex.ResetReturnsFlowmeterTotalName, 511);
    } else if (this.inforcedevices.find(c => c.DeviceName == "ModuleFlowMeter")) {
      this.writeToServer(this.hpuDeviceId, HyrdraulicPowerUnitPointIndex.ResetReturnsFlowmeterTotal, HyrdraulicPowerUnitPointIndex.ResetReturnsFlowmeterTotalName, 1);
    }
  }

  writeToServer(DeviceId: number, PointIndex: number, PointName: string, Value: number): void {

    if (this.isPanelinManualMode) {
      let writeVar = new WriteToServerDataModel();
      writeVar.DeviceId = DeviceId;
      writeVar.PointIndex = PointIndex;
      writeVar.PointName = PointName;
      writeVar.Value = Value;
      writeVar.WriteToServerCommandEnum = 1;
      this.configService.WriteToServer(writeVar).subscribe();
    }
  }

  onTabChanged(event) {
    this.currentWell = this.wellEntity[event.index];
  }

  setPressurePointClick() {
   
    const dialogData = { changePumpPressure: this.changePumpPressure };
    this.gatewayModalService.openAdvancedDialog(
      'Pump Pressure Set Point',
      ButtonActions.None,
      PumpPressureDialogComponent,
      dialogData,
      (result) => {
        if (result) {
          let startPressure = result.StartPumpPressure;
          let stopPressure = result.StopPumpPressure;
          if (startPressure){
            this.writeToServer(this.Module2542Id, Module2542PointIndex.PressuretoTriggerUnloadingValvetoClose, Module2542PointIndex.PressuretoTriggerUnloadingValvetoCloseName, startPressure);
          }
          if (stopPressure){
            this.writeToServer(this.Module2542Id, Module2542PointIndex.PressuretoTriggerUnloadingValvetoOpen, Module2542PointIndex.PressuretoTriggerUnloadingValvetoOpenName, stopPressure);
          }
          }
      },
      '685px',
      null,
      '325px',
      null
    );
  }

  setDownholeValvePositionClick() {
    let selectedWell = this.wellOutputDataPoints.find(well => well.WellId == this.currentWell.WellId);
    this.gatewayModalService.openAdvancedDialog(
      'Downhole Valve Positions',
      ButtonActions.None,
      DownholeValvePositionDialogComponent,
      selectedWell,
      (wellData: IConfirmShiftDialogData) => {
        if (wellData) {
          this.updateShiftOperationUser();
          let writeVar = new WriteToServerDataModel();
          writeVar.DeviceId = wellData.wellDeviceId;
          writeVar.PointIndex = InforceWellDevicePointIndex.SelectedToRunAutoShiftingIndex;
          writeVar.PointName = InforceWellDevicePointIndex.SelectedToRunAutoShiftingName;
          writeVar.Value = 1;
          writeVar.WriteToServerCommandEnum = 1;
          const observables: Observable<any>[] = [];
          this.configService.WriteToServer(writeVar).subscribe(
            c => {
              wellData.zoneList.forEach(zone => {
                this.writeToServer(zone.HcmId, InFORCEZone_HCM_PointIndex.CurrentPosition, InFORCEZone_HCM_PointIndex.CurrentPositionName,
                  zone.SelectedTargetPosition.Id);
                this.writeToServer(zone.HcmId, InFORCEZone_HCM_PointIndex.TargetPosition, InFORCEZone_HCM_PointIndex.TargetPositionName,
                  zone.SelectedTargetPosition.Id);

                let zoneToUpdate = this.currentWell.Zones.find(currentZone => currentZone.HcmId == zone.HcmId);
                zoneToUpdate.CurrentPosition = zone.SelectedTargetPosition.Id;
                // this.currentWell.Zones[inx] = zoneToUpdate;

              });
              this.store.dispatch(WELL_ACTIONS.WELL_UPDATE({ well: this.currentWell }));
            });
        }
      },
      '740px',
      null,
      '410px',
      null
    );
  }

  viewGraphClick() {
    const dialogData = {
      wells: this.wellOutputDataPoints,
      hpuId: this.hpuDeviceId,
      module2542Id: this.Module2542Id
    };
    this.gatewayModalService.openAdvancedDialog(
      'Manual Mode Graph',
      ButtonActions.None,
      ManualModeGraphDialogComponent,
      dialogData,
      (result) => {


      },
      '780px',
      null,
      '700px',
      null
    );
  }

  closeDialog() {
    this.gatewayModalService.closeModal();
  }

  getOutputSolenoidPointIndex(id) {
    return OutputPressureSensors.find(val => val.OutputPressurePointIndex == id)?.OutputSolenoidPointIndex;
  }

  updateShiftOperationUser() {
    this.userService.GetCurrentLoginUser().then(currentUser => {
      if (currentUser) {
        const subscription = this.userService.updateShiftOperationUser(currentUser.Name).subscribe(d => { });
        this.dataSubscriptions.push(subscription);
      }
    });
  }

  private getUnitofDeviceDataPoint(deviceId, pointIndex) {
    if (this.datapointdefinitions) {
      let unit = this.datapointdefinitions.find(dataPoint => dataPoint.DeviceId == deviceId && dataPoint.DataPointIndex == pointIndex)?.UnitSymbol;
      return unit ? unit : "";
    }
    return "";
  }

  private setupDevice() {
    if (this.inforcedevices.length > 0 && this.datapointdefinitions.length > 0) {
      this.hpuDeviceId = this.inforcedevices.find(c => c.DeviceName == "HPU")?.DeviceId;
      this.Module2542Id = this.inforcedevices.find(c => c.DeviceName == "Module2542")?.DeviceId;
      this.subscribeToInFORCEPanelManualMode();
      this.subscribeToHPUPoints();
      this.subscribeToWellEntityStore();
      this.subscribeToInFORCECommStatus();
      this.subscribeToInFORCEOperationExecutionInProgress();
    }
  }

  private subscribeToWellEntityStore() {
    let wellSubscription = this.store.select<any>(selectWellState).subscribe((state: IWellEntityState) => {
      if (state && !state.isLoaded) {
        this.store.dispatch(WELL_ACTIONS.WELL_LOAD());
      }
      else {
        let wellDataSubscription = this.store.select<any>(selectAllWells).subscribe(wells => {
          const filteredWells = wells.filter(well => well.ControlArchitectureId != INFORCE_WELL_ARCHITECTURE.SURESENS && well.WellDeviceId > 0);
          this.wellEntity = _.cloneDeep(filteredWells);
          this.wellOutputDataPoints = _.cloneDeep(filteredWells);
          this.wellOutputDataPoints.map((data) => {
            // data.outputPosition = Object.assign([], data.PanelToLineMappings);
            data.outputPosition = _.cloneDeep(data.PanelToLineMappings);
          })
          this.currentWell = this.wellEntity[this.activeTabIndex];
          this.subscribeToWellZones();
        });
        this.dataSubscriptions.push(wellDataSubscription);
      }
    });
    this.dataSubscriptions.push(wellSubscription);
  }

  private subscribeToInFORCEPanelManualMode(): void {
    const subscription = this.realTimeSignalRService.GetRealtimeData(this.hpuDeviceId, HyrdraulicPowerUnitPointIndex.CurrentOperationMode).subscribe(value => {
      if (value != undefined && value != null) {
        this.isPanelinManualMode = value.Value == OperationMode.Manual ? true : false;
        this.manualModeText = value.Value == OperationMode.Manual ? "On" : "Off";
      }
    });
    this.dataSubscriptions.push(subscription);
  }

  private subscribeToInFORCECommStatus(): void {
    const subscription = this.realTimeSignalRService.GetRealtimeData(this.hpuDeviceId, HyrdraulicPowerUnitPointIndex.CommStatus).subscribe(value => {
      if (value != undefined && value != null) {
        this.isCommStatusFailed = value.Value == 0 ? true : false;
        if (this.isCommStatusFailed) {
          this.router.navigate(['Home']);
        }
      }
    });
    this.dataSubscriptions.push(subscription);
  }
  private subscribeToInFORCEOperationExecutionInProgress(): void {
    const subscription = this.realTimeSignalRService.GetRealtimeData(this.hpuDeviceId, HyrdraulicPowerUnitPointIndex.OperationExecutionInProgress).subscribe(value => {
      if (value != undefined && value != null) {
        this.isOperationExecutionInProgress = value.Value == ExecutionMode.ExecutionOn ? true : false;
      }
    });
    this.dataSubscriptions.push(subscription);
  }
  private subscribeToHPUPoints(): void {
    // Pump Pressure
    this.pumpPressure = {
      hpuDataPoint: new DeviceIdIndexValue(this.Module2542Id, Module2542PointIndex.PumpDischargePressure, -999.0, ''),
      actionDataPoint: new DeviceIdIndexValue(this.hpuDeviceId, HyrdraulicPowerUnitPointIndex.StartPump, -999.0, '')
    }
    this.subscribeToRealtimeData(this.pumpPressure.hpuDataPoint);
    this.subscribeToRealtimeData(this.pumpPressure.actionDataPoint);

    // Change Pump Pressure Popup
    this.changePumpPressure = {
      hpuDataPoint: new DeviceIdIndexValue(this.Module2542Id, Module2542PointIndex.PressuretoTriggerUnloadingValvetoClose, -999.0, ''),
      hpuSubDataPoint: new DeviceIdIndexValue(this.Module2542Id, Module2542PointIndex.PressuretoTriggerUnloadingValvetoOpen, -999.0, '')
    }
    this.subscribeToRealtimeData(this.changePumpPressure.hpuDataPoint);
    this.subscribeToRealtimeData(this.changePumpPressure.hpuSubDataPoint
    );

    // Supply/Recirculate
    this.supplyRecirculate = {
      hpuDataPoint: new DeviceIdIndexValue(this.hpuDeviceId, HyrdraulicPowerUnitPointIndex.SupplyPressure, -999.0, ''),
      actionDataPoint: new DeviceIdIndexValue(this.hpuDeviceId, HyrdraulicPowerUnitPointIndex.OpenRecirculationValve, -999.0, '')
    }
    this.subscribeToRealtimeData(this.supplyRecirculate.hpuDataPoint);
    this.subscribeToRealtimeData(this.supplyRecirculate.actionDataPoint);

    // Return Flow Meter
    this.returnFlowMeter = {
      hpuDataPoint: new DeviceIdIndexValue(this.hpuDeviceId, HyrdraulicPowerUnitPointIndex.ReturnsFlowmeterTotal, -999.0, ''),
      hpuSubDataPoint: new DeviceIdIndexValue(this.hpuDeviceId, HyrdraulicPowerUnitPointIndex.ReturnsFlowRate, -999.0, ''),
      actionDataPoint: new DeviceIdIndexValue(this.hpuDeviceId, HyrdraulicPowerUnitPointIndex.TurnOnFlowmeter, -999.0, '')
    }
    this.subscribeToRealtimeData(this.returnFlowMeter.hpuDataPoint);
    this.subscribeToRealtimeData(this.returnFlowMeter.hpuSubDataPoint);
    this.subscribeToRealtimeData(this.returnFlowMeter.actionDataPoint);

    // Reservoir level
    this.reservoirLevel = {
      hpuDataPoint: new DeviceIdIndexValue(this.Module2542Id, Module2542PointIndex.ReserviorLevel, -999.0, '')
    }
    this.subscribeToRealtimeData(this.reservoirLevel.hpuDataPoint);
  }

  private subscribeToWellZones(): void {
    this.wellOutputDataPoints?.forEach((well) => {
      well.outputPosition?.forEach(panel => {
        panel.outputDataPoint = new DeviceIdIndexValue(this.hpuDeviceId, panel.PanelToLineMappingsId, -999.0, '');
        panel.actionDataPoint = new DeviceIdIndexValue(this.hpuDeviceId, this.getOutputSolenoidPointIndex(panel.PanelToLineMappingsId), -999.0, '');
        panel.isCommonClose = well.LineToZoneMapping.find(data => data.CloseLine == panel.DownholeLine) ? true : false;
        if (!panel.isCommonClose) {
          let hcmId = well.Zones.find(zone => zone?.LineToZoneMapping?.OpenLine == panel.PanelConnection)?.HcmId;
          panel.currentPositionDataPoint = new DeviceIdIndexValue(hcmId, InFORCEZone_HCM_PointIndex.CurrentPosition, -999.0, '');
          panel.currentPositionUnknownDataPoint = new DeviceIdIndexValue(hcmId, InFORCEZone_HCM_PointIndex.CurrentPositionStateUnknownFlag, -999.0, '');

          let subscription = this.realTimeSignalRService.GetRealtimeData(panel.currentPositionDataPoint.deviceId, panel.currentPositionDataPoint.pointIndex).subscribe(value => {
            if (value != undefined && value != null) {
              panel.currentPositionDataPoint.value = value.Value;
              panel.currentPositionDataPoint.unit = this.getUnitofDeviceDataPoint(panel.currentPositionDataPoint.deviceId, panel.currentPositionDataPoint.pointIndex);
              well.Zones.map(zone => {
                if (zone.HcmId == value.DeviceId) {
                  zone.CurrentPosition = value.Value;
                  panel.currentPositionName = zone.ValvePositionsAndReturns.find(position => position.ToPosition == value.Value)?.Description;
                }
              })
            }
          });

          this.dataSubscriptions.push(subscription);

          subscription = this.realTimeSignalRService.GetRealtimeData(panel.currentPositionUnknownDataPoint.deviceId, panel.currentPositionUnknownDataPoint.pointIndex).subscribe(value => {
            if (value != undefined && value != null) {
              panel.currentPositionUnknownDataPoint.value = value.Value;
              panel.currentPositionUnknownDataPoint.unit = this.getUnitofDeviceDataPoint(panel.currentPositionUnknownDataPoint.deviceId, panel.currentPositionUnknownDataPoint.pointIndex);
              well.Zones.map(zone => {
                if (zone.HcmId == value.DeviceId) {
                  zone.CurrentPositionStateUnknownFlag = value.Value == 1 ? true : false;
                }
              })
            }
          });

          this.dataSubscriptions.push(subscription);
        }
        this.subscribeToRealtimeData(panel.outputDataPoint);
        this.subscribeToRealtimeData(panel.actionDataPoint);
      });
    })
  }

  private subscribeToRealtimeData(dataPoint) {
    let subscription = this.realTimeSignalRService.GetRealtimeData(dataPoint.deviceId, dataPoint.pointIndex).subscribe(value => {
      if (value != undefined && value != null) {
        dataPoint.value = value.Value;
        dataPoint.unit = this.getUnitofDeviceDataPoint(dataPoint.deviceId, dataPoint.pointIndex);
      }
    });
    this.dataSubscriptions.push(subscription);
    return dataPoint;
  }

  private subscribeToInforceDevices(): void {
    const subscription = this.InforceDeviceState$.subscribe(
      (state: IInforceDeviceState) => {
        if (state !== undefined) {
          if (state.isLoaded === false && !StateUtilities.hasErrors(state)) {
            this.store.dispatch(INFORCEDEVICES_LOAD());
          } else {
            Object.assign(this.inforcedevices, state.inforcedevices);
            this.setupDevice();
          }
        }
      }
    );
    this.dataSubscriptions.push(subscription);
  }

  private subscribeToDeviceDataPoints() {
    let devicePointSubscription = this.deviceDataPointsModels$.subscribe((state: IDeviceDataPoints) => {
      if (state) {
        if (!state.isLoaded) {
          this.store.dispatch(DEVICEPOINTS_ACTIONS.LOAD_DEVICES());
          this.store.dispatch(DEVICEPOINTS_ACTIONS.LOAD_DATAPOINTDEF());
        }
        if (state.datapointdefinitions) {
          this.datapointdefinitions = state.datapointdefinitions;
          this.setupDevice();
        }
      }
    });
    this.dataSubscriptions.push(devicePointSubscription);
  }

  ngOnInit(): void {
    this.subscribeToDeviceDataPoints();
    this.subscribeToInforceDevices();
  }

  ngOnDestroy(): void {
    if (this.dataSubscriptions != null && this.dataSubscriptions.length > 0) {
      this.dataSubscriptions.forEach(subscription => {
        if (subscription != null)
          subscription.unsubscribe();
      });
    }
    // this.store.dispatch(WELL_ACTIONS.WELL_LOAD());
    this.store.dispatch(ALARMS_AND_LIMITS_ACTIONS.LOAD_ALARMS_AND_LIMITS());
  }

}

export class HPURealtimeDataPoint {
  hpuDataPoint: DeviceIdIndexValue;
  hpuSubDataPoint?: DeviceIdIndexValue;
  actionDataPoint?: DeviceIdIndexValue;
}

export class WellRealtimeDataPoint extends InforceWellUIModel {
  outputPosition: ManualModePanelToLineMappingModel[] = [];
}

class ManualModePanelToLineMappingModel extends PanelToLineMappingModel {
  isCommonClose?: boolean;
  outputDataPoint?: DeviceIdIndexValue;
  currentPositionDataPoint?: DeviceIdIndexValue;
  currentPositionUnknownDataPoint?: DeviceIdIndexValue;
  actionDataPoint?: DeviceIdIndexValue;
  currentPositionName?: string;
}