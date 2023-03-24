import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { StateUtilities } from '@store/state/IState';

import * as INFACTIONS from '@store/actions/inforcedevices.action';
import * as PANELCONFIG_COMMON_ACTIONS from '@store/actions/panelConfigurationCommon.action';
import { UNITSYSTEM_LOAD } from '@store/actions/unit-system.action';

import { ConfigurationService } from '@core/services/configurationService.service';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { IInforceDeviceState } from '@store/state/inforcedevices.state';
import { InforceDeviceDataModel } from '@core/models/webModels/InforceDeviceData.model';
import { WriteToServerDataModel } from '@core/models/webModels/WriteToServerData.model';
import { HyrdraulicPowerUnitPointIndex, InforceWellDevicePointIndex, InFORCEZone_HCM_PointIndex, OperationMode, OutputPressureSensors, OutputSensorDetail, SHIFT_STATUS_MESSAGE } from '@features/inforce/common/InForceModbusRegisterIndex';
import { UserService } from '@core/services/user.service';
import { WellFacade } from '@core/facade/wellFacade.service';
import { GatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { InforceWellShiftUIModel, InforceZoneShiftRecordUIModel } from '@core/models/UIModels/inforce.well.shift.model';
import { InFORCEWellDataUIModel } from '@core/models/webModels/WellDataUIModel.model';
import { INFORCE_WELL_ARCHITECTURE } from '@core/services/well.service';
import { ZONE_VALVE_TYPE } from '@core/data/UICommon';
import { IPanelConfigurationCommonState } from '@store/state/panelConfigurationCommon.state';
import { InforcePanelUIModel } from '@core/models/UIModels/inforce-panel-config-common.model';
import { UnitSystemUIModel } from '@core/models/UIModels/unit-system.model';
import { ValvePositionsAndReturnsUIModel } from '@core/models/UIModels/InforceZone.model';
import { ValvePositionsShiftUIModel } from '@core/models/UIModels/ValvePosition.model';
import { InforceZoneShiftUIModel } from '@features/inforce/common/InforceUICommon';
import { IUnitSystemState } from '@store/state/unit-system.state';

@Component({
  selector: 'gw-inforce-confirm-shift-dialog',
  templateUrl: './inforce-confirm-shift-dialog.component.html',
  styleUrls: ['./inforce-confirm-shift-dialog.component.scss']
})

export class InforceConfirmShiftDialogComponent extends GatewayPanelBase implements OnInit, OnDestroy {

  fullShiftCycleText = "Full Shift Cycle";
  private deviceDetail: InforceDeviceDetail;
  private selectedUnitSystem: UnitSystemUIModel;
  public panelOutputSensorList: OutputSensorDetail[];
  zoneToShiftList: InforceZoneShiftUIModel[] = [];
  private inforceDeviceList: InforceDeviceDataModel[] = [];
  well: InFORCEWellDataUIModel;
  selectedWell: InforceWellShiftUIModel;
  
  private unitSystemState$: Observable<IUnitSystemState>;
  private panelConfigurationCommonState$: Observable<IPanelConfigurationCommonState>;
  private InforceDeviceState$: Observable<IInforceDeviceState>;

  private dataSubscriptions: Subscription[] = [];

  constructor(protected router: Router,
    protected store: Store<{ inforcedevicesState: IInforceDeviceState; panelConfigCommonState: IPanelConfigurationCommonState }>,
    public dialogRef: MatDialogRef<InforceConfirmShiftDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IConfirmShiftDialogData,
    private wellDataFacade: WellFacade,
    private configService: ConfigurationService,
    private gwModalService: GatewayModalService,
    private userService: UserService) {
      super(store, null, wellDataFacade, null, null, null, null);
      this.unitSystemState$ = this.store.select<IUnitSystemState>((state: any) => state.unitSystemState);
      this.panelConfigurationCommonState$ = this.store.select<IPanelConfigurationCommonState>((state: any) => state.panelConfigCommonState);
      this.InforceDeviceState$ = this.store.select<IInforceDeviceState>((state) => state.inforcedevicesState);
  }

  updateShiftOperationUser() {
    this.userService.GetCurrentLoginUser().then(currentUser => {
      if (currentUser) {
        const subscription = this.userService.updateShiftOperationUser(currentUser.Name).subscribe(d => { });        
        this.dataSubscriptions.push(subscription);
      }
    });
  }

  writeToServer(deviceId: number, pointIndex: number, pointName: string, value?: number, writeToServerCommandEnum?: number): void {
    const writeVar = new WriteToServerDataModel();
    writeVar.DeviceId = deviceId;
    writeVar.PointIndex = pointIndex;
    writeVar.PointName = pointName;
    writeVar.Value = value;
    writeVar.WriteToServerCommandEnum = 1;
    this.configService.WriteToServer(writeVar).subscribe();
  }

  initiateShiftInServer() {

    const hpuWriteVar = new WriteToServerDataModel();
    hpuWriteVar.DeviceId = this.deviceDetail.HPUID;
    hpuWriteVar.PointIndex = HyrdraulicPowerUnitPointIndex.SetOperationModeInternal;
    hpuWriteVar.PointName = 'SetOpertionModeInternal';
    hpuWriteVar.Value = OperationMode.AutoShift; // set HPU-78(operation mode) to auto shift mode
    hpuWriteVar.WriteToServerCommandEnum = 1;

    this.selectedWell.shiftStartTime = new Date().getTime();
    this.configService.saveAutoShiftWellObject(this.selectedWell).subscribe(c => {

      this.configService.WriteToServer(hpuWriteVar).subscribe(d => {
        this.zoneToShiftList.forEach(zone => {
          this.updateShiftOperationUser(); // update current user name in InflexDB for Shift History Report
          //do not set the target position if current unknown flag is true.
          if (!zone.CurrentPositionStateUnknownFlag) {

            if (zone.isFullShift === 1) {
              //target position same as current position
              this.writeToServer(zone.HcmId, InFORCEZone_HCM_PointIndex.TargetPosition, "TargetPositionIndex", zone.CurrentTargetPosition.Id);
              //set round trip flag to true in server monitor
              this.writeToServer(zone.HcmId, InFORCEZone_HCM_PointIndex.SetRoundTripShift, "SetRoundTripShift", 1);
            }
            else {
              //set target valve position  
              this.writeToServer(zone.HcmId, InFORCEZone_HCM_PointIndex.TargetPosition, "TargetPositionIndex", zone.SelectedTargetPosition.Id);
              // this.configService.WriteToServer(valvePositionWriteVar).subscribe();
              //clear roundtrip flag in server 
              this.writeToServer(zone.HcmId, InFORCEZone_HCM_PointIndex.SetRoundTripShift, "SetRoundTripShift", 0);
            }
          }

        });

        //set Shift flag at well level
        const wellWriteVar = new WriteToServerDataModel();
        wellWriteVar.DeviceId = this.data.wellDeviceId;
        wellWriteVar.PointIndex = InforceWellDevicePointIndex.SelectedToRunAutoShiftingIndex;
        wellWriteVar.PointName = 'SelectedToRunAutoShifting';
        wellWriteVar.Value = OperationMode.AutoShift;
        wellWriteVar.WriteToServerCommandEnum = 1;
        this.configService.WriteToServer(wellWriteVar).subscribe(res => {
          //start the shift operation
          if (this.data.closeAllSleeve && this.data.wellType2N) {
            this.writeToServer(this.data.wellDeviceId, InforceWellDevicePointIndex.CloseAllHcmStepperSleevesIndex, "CloseAllHcmStepperSleeves", OperationMode.AutoShift);
          }
          this.writeToServer(this.deviceDetail.HPUID, HyrdraulicPowerUnitPointIndex.ExecuteOperationMode, "StartStopShift", OperationMode.AutoShift);
        });

      });

    }); 
    this.dialogRef.close('ok');     
  }

  OnShiftBtnClick() {  
    this.initiateShiftInServer();   
  }

  OnCancel() {
    this.dialogRef.close();
  }

   // Get Inforce Device Details
   private getInforceDeviceDetail() {
    if (this.inforceDeviceList.length > 0) {
      const deviceInfo: InforceDeviceDetail = {
        HPUID: this.inforceDeviceList.find(c => c.DeviceName == "HPU").DeviceId,
        Module2542ID: this.inforceDeviceList.find(c => c.DeviceName == "Module2542").DeviceId,
        ModuleE1260ID: this.inforceDeviceList.find(c => c.DeviceName == "ModuleE1260").DeviceId
      }
      this.deviceDetail = deviceInfo;
    }
  }

  getControlArchitecture(controlArchitectureId): string {
    let result = 'SureSENS';
    switch (controlArchitectureId) {
      case INFORCE_WELL_ARCHITECTURE.N_PlUS_ONE:
        result = 'N+1';
        break;
      case INFORCE_WELL_ARCHITECTURE.TWO_N:
        result = '2N';
        break;
      default:
        break;
    }
    return result;
  }

  setZoneValvePosition(zoneId, valvePositionList: ValvePositionsAndReturnsUIModel[]) {
    const valvePosList:ValvePositionsShiftUIModel[] = [];
    valvePositionList.forEach(valPos => {
      const valPosObj:ValvePositionsShiftUIModel = {
        Id: valPos.Id,
        ZoneId: zoneId,
        Description: valPos.Description,
        FromPosition: valPos.FromPosition,
        ToPosition: valPos.ToPosition,
        UserSelectable: valPos.UserSelectable,
        ReturnVolume: valPos.ReturnVolume,
        ReturnVolumeUnitType: { Id: 3, Name: "mL" },
        IsEditMode: false,
      }
      valvePosList.push(valPosObj);
    });    

    return valvePosList;
  }

  getZoneShiftData(zone, zoneIdx, outputSensor:OutputSensorDetail, zoneToShift: InforceZoneShiftUIModel) {    
    const valvePostionDdList: string[] = zone.ValvePositionsAndReturns.map(vp => vp.Description);
    valvePostionDdList.push(this.fullShiftCycleText); 
    let zoneObj: InforceZoneShiftRecordUIModel = {
      zoneId: zone.ZoneId,
      zoneName: zone.ZoneName,
      downholeLine: zone.LineToZoneMapping.OpenLine,
      panelLine: outputSensor.SensorName,
      isVentMode: false,
      currentPositionUnknownFlag: 0,
      outputPressureIndex: outputSensor.OutputPressurePointIndex,
      outputSolenoidIndex: outputSensor.OutputSolenoidPointIndex,
      currentDownholePositionId: zoneToShift.CurrentTargetPosition.Id,
      currentDownholePosition: zoneToShift.CurrentTargetPosition.Description,
      targetDownholePosition: zoneToShift.SelectedTargetPosition.Description,
      targetDownholePositionId: zoneToShift.SelectedTargetPosition.Id,      
      previousCurrentPosition: zoneToShift?.PreviousTargetPosition ? zoneToShift.PreviousTargetPosition.Description : zoneToShift.CurrentTargetPosition.Description,
      isFullShift: zoneToShift.isFullShift,
      valvepositionsDropDownValues: valvePostionDdList,
      shiftStatus: zoneToShift.CurrentTargetPosition.Description === zoneToShift.SelectedTargetPosition.Description ? SHIFT_STATUS_MESSAGE.NoShiftPlanned : null,
      isCommonClose: false,
      zoneIndex: zoneIdx,
      openLineIndexId: -1,
      outputPressure: null,
      HcmId: zone.HcmId,
      ValvePositionsAndReturns: this.setZoneValvePosition(zone.ZoneId, zone.ValvePositionsAndReturns),
      isResetInProgress: false
    };
    return zoneObj;
  }

  getZoneShiftDataByWell(well: InFORCEWellDataUIModel): InforceZoneShiftRecordUIModel[] {
    let zoneList: InforceZoneShiftRecordUIModel[] = [];
    well.Zones.forEach((zone, zoneIdx) => {
      let zoneToShift = this.data.allZoneToList.find((z) => z.ZoneId === zone.ZoneId);
      if (zone.ValveType !== ZONE_VALVE_TYPE.Monitoring && zoneToShift) {
        if (zone.LineToZoneMapping !== null) {
          let currentPanelSensor: OutputSensorDetail = null;
          well.PanelToLineMappings.forEach(lineMapping => {
            if (lineMapping.DownholeLine === zone.LineToZoneMapping.OpenLine) {
              const panelOutPutSensor = this.panelOutputSensorList.find(ps => ps.SensorName === lineMapping.PanelConnection)
              if (this.panelOutputSensorList && panelOutPutSensor) {
                currentPanelSensor = panelOutPutSensor;
              }
            }
          });
          zoneList.push(this.getZoneShiftData(zone, zoneIdx, currentPanelSensor, zoneToShift));
        }
      }
    });
    return zoneList;
  }

  private initPanelConfiguration() {
    let subscription = this.panelConfigurationCommonState$.subscribe(
      (state: IPanelConfigurationCommonState) => {
        if (state !== undefined) {
          if (state.isLoaded === false) {
            // Dispatch Action if not loaded
            this.store.dispatch(
              PANELCONFIG_COMMON_ACTIONS.PANELCONFIG_COMMON_LOAD()
            );
          } else {
            if (!StateUtilities.hasErrors(state)) {
              const numberOfOutputs = (state.panelConfigurationCommon as InforcePanelUIModel).HydraulicOutputs;
              this.panelOutputSensorList = OutputPressureSensors.slice(0, numberOfOutputs);
              this.subscribeToInforceDevices();
            }
          }
        }
      }
    );
    this.dataSubscriptions.push(subscription);
  }

  postCallGetWells(): void {
    if (this.wellEnity.length > 0) {
      this.well = this.wellEnity.find(w => w.WellId === this.data.wellId);
      if (this.well.ControlArchitectureId !== INFORCE_WELL_ARCHITECTURE.SURESENS) {
        this.selectedWell = {
          wellId: this.well.WellId,
          wellName: this.well.WellName,
          controlArchitecture: this.getControlArchitecture(this.well.ControlArchitectureId),          
          HcmId: this.well.WellDeviceId,
          tools: null,
          wellZoneShiftRecords: this.well.Zones.length > 0 ? this.getZoneShiftDataByWell(this.well) : null
        }
      }
    }
  }

  private subscribeToInforceDevices(): void {
    const subscription = this.InforceDeviceState$.subscribe(
      (state: IInforceDeviceState) => {
        if (state !== undefined) {
          if (state.isLoaded === false && !StateUtilities.hasErrors(state)) {
            this.store.dispatch(INFACTIONS.INFORCEDEVICES_LOAD());
          } else {
            Object.assign(this.inforceDeviceList, state.inforcedevices);
            this.getInforceDeviceDetail();
          }
        }
      }
    );    
    this.dataSubscriptions.push(subscription);
  }

  private subscribeToUnitSystems() {
    const subscription = this.unitSystemState$.subscribe(
      (state: IUnitSystemState) => {
        if (state !== undefined) {
          if (state.isLoaded === false || StateUtilities.hasErrors(state)) {
            // Dispatch Action if not loaded
            this.store.dispatch(UNITSYSTEM_LOAD());
          } else {
            this.selectedUnitSystem = state.unitSystem.UnitQuantities[1];
            this.initPanelConfiguration();
            this.initWells();
            this.subscribeToInforceDevices();
          }
        }
      }
    );

    this.dataSubscriptions.push(subscription);
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  ngOnInit(): void {
    this.zoneToShiftList = this.data.zoneList;    
    this.subscribeToUnitSystems();
  }

}

class InforceDeviceDetail {
  HPUID: number;
  Module2542ID: number;
  ModuleE1260ID: number;
}

export interface IConfirmShiftDialogData {
  wellId: number,
  wellName: string,
  wellDeviceId: number,
  zoneList: InforceZoneShiftUIModel[],  
  allZoneToList?: InforceZoneShiftUIModel[],
  wellType2N: boolean,
  closeAllSleeve: boolean
}


