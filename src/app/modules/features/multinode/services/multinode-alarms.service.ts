import { Injectable } from '@angular/core';
import { SieUIModel } from '@core/models/UIModels/sie.model';
import { AlarmService } from '@core/services/alarm.service';
import { RealTimeDataSignalRService } from '@core/services/realTimeDataSignalR.service';
import { Store } from '@ngrx/store';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { selectAllSie, selectSieState } from '@store/reducers/sie.entity.reducer';
import { selectAllWells, selectWellState } from '@store/reducers/well.entity.reducer';
import { ISieEntityState } from '@store/state/sie.state';
import { IWellEntityState } from '@store/state/well.state';
import * as _ from 'lodash';
import { String } from 'typescript-string-operations';
import { MultinodeModule } from '../multinode.module';

import { WELL_LOAD } from '@store/actions/well.entity.action';
import { SIE_LOAD } from '@store/actions/sie.entity.action';
import { MultiNodeWellDevicePointIndex } from '../common/MultiNodeRegisterIndex';
import { HealthState } from '../common/MultiNodeUICommon';
import { AlarmDefinitionDataUIModel } from '@core/models/webModels/AlarmDefinitionDataUI.model';
import { ButtonActions } from '@shared/gateway-dialogs/components/gateway-advanced-dialog/gateway-advanced-dialog.component';
import { GatewayAlarmsDialogComponent } from '@shared/gateway-dialogs/components/gateway-alarms-dialog/gateway-alarms-dialog.component';
import { WellTypeEnum } from '@core/models/webModels/WellDataUIModel.model';
import { Subscription } from 'rxjs';
import { MultiNodeAlarmDefinitionDataUI, MultiNodeAlarmState, MultiNodeAlarmType, MultiNodeEquipmentAlarm } from '@core/models/webModels/MultiNodeUIDataModel.model';
import { UICommon } from '@core/data/UICommon';

@Injectable({
  providedIn: MultinodeModule
})
export class MultinodeAlarmsService {

  wellEntity: any[];
  Zones: any[] = [];
  wellEchoStatus: boolean[] = [];
  sies: SieUIModel[];

  //alarms: AlarmDefinitionDataUIModel[] = [];
  multiNodeAlarms: MultiNodeAlarmDefinitionDataUI[] = [];
  SIEErrors: any[] = [MultiNodeAlarmType.INVALID_CONNECTION, MultiNodeAlarmType.SURFACE_COMMUNICATION_ERROR];

  SIEErrorMap = new Map<number, string>([
    [MultiNodeAlarmType.INVALID_CONNECTION, 'Invalid_Connection'],
    [MultiNodeAlarmType.SURFACE_COMMUNICATION_ERROR, 'Surface_Communication_Error']
  ]);

  WellErrorMap = new Map<number, string>([
    [MultiNodeAlarmType.TEC_COMMS_ENGAGE_ERROR, 'Tec_Comms_Engage_Error'],
    [MultiNodeAlarmType.TEC_COMMS_DISENGAGE_ERROR, 'Tec_Comms_Disengage_Error'],
    [MultiNodeAlarmType.TEC_MOTOR_ENGAGE_ERROR, 'Tec_Motor_Engage_Error'],
    [MultiNodeAlarmType.TEC_MOTOR_DISENGAGE_ERROR, 'Tec_Motor_Disengage_Error'],
    [MultiNodeAlarmType.POWERUP_ERROR, 'Powerup_Error']
  ]);

  eFECVErrorMap = new Map<number, string>([
    [MultiNodeAlarmType.MOTOR_ENGAGE_ERROR, 'Motor_Engage_Error'],
    [MultiNodeAlarmType.MOTOR_DISENGAGE_ERROR, 'Motor_Disengage_Error'],
    [MultiNodeAlarmType.MOTOR_ENCODER_COMMS_ERROR, 'Motor_Encoder_Comms_Error'],
    [MultiNodeAlarmType.MOTOR_ENCODER_STALLING, 'Motor_Encoder_Stalling'],
    [MultiNodeAlarmType.MOTOR_SURFACE_OVERCURRENT, 'Motor_Surface_Overcurrent'],
    [MultiNodeAlarmType.MOTOR_DOWNHOLE_OVERCURRENT_DETECTED_BY_SURFACE, 'Motor_Downhole_Overcurrent_Detected_By_Surface'],
    [MultiNodeAlarmType.MOTOR_DOWNHOLE_OVERCURRENT_DETECTED_BY_FIRMWARE, 'Motor_Downhole_Overcurrent_Detected_By_Firmware'],
    [MultiNodeAlarmType.MOTOR_START_ERROR, 'Motor_Start_Error'],
    [MultiNodeAlarmType.MOTOR_DIRECTION_ERROR, 'Motor_Direction_Error'],
    [MultiNodeAlarmType.MOTOR_TIMEDOUT_ERROR, 'Motor_Timedout_Error'],  
    [MultiNodeAlarmType.MOTOR_CURRENT_OUT_OF_SPEC, 'Motor_Current_Out_Of_Spec'],
    [MultiNodeAlarmType.MOTOR_18V_OUT_OF_SPEC, 'Motor_18v_Out_Of_Spec'],
    [MultiNodeAlarmType.MOTOR_5_0V_OUT_OF_SPEC, 'Motor_5_0v_Out_Of_Spec'],
    [MultiNodeAlarmType.MOTOR_3_3V_OUT_OF_SPEC, 'Motor_3_3v_Out_Of_Spec'],  
    [MultiNodeAlarmType.AFCD_INVALID_POSITION, 'eFCV_Invalid_Position'],
    [MultiNodeAlarmType.AFCD_COMMUNICATION_ERROR, 'eFCV_Communication_Error'],
    [MultiNodeAlarmType.AFCD_ECHO_ERROR, 'eFCV_Echo_Error']  
  ]);

  private alarmSubscriptionsMap: Map<number, Subscription> = new Map<number, Subscription>();

  constructor(private store: Store,
    private realTimeService: RealTimeDataSignalRService,
    private gwAlarmService: AlarmService,
    private gwModalService: GatewayModalService) {
    this.initializeAlarms();
  }


  private initializeAlarms(): void {
    this.subscribeToSIEEntity(null);    
    this.subscribeToWellEntityStore(null);
    this.subscribeToAlarms();
    this.subscribeToResetAlarms();    
    this.realTimeService.GetMultiNodeEquipmentAlarmUpdate().subscribe(alarm => {
      let siedesc = this.SIEErrorMap.get(alarm.AlarmType);
      if (siedesc !== undefined && siedesc != null) { //it is SIE Alarm
        this.subscribeToSIEEntity(alarm);
      }
      let welldesc = this.WellErrorMap.get(alarm.AlarmType);
      if (welldesc !== undefined && welldesc != null) { //it is Well Alarm
        this.subscribeToWellEntityStore(alarm);
      }
      let efcvdesc = this.eFECVErrorMap.get(alarm.AlarmType);
      if (efcvdesc !== undefined && efcvdesc != null) { //it is eFCV Alarm
        this.subscribeToWellZones(alarm);
      }
    });
    this.realTimeService.GetMultiNodePackageLoadEventFlag().subscribe(value => {
      this.resetAlarms();
    });        
  }

  private subscribeToResetAlarms() {
    this.gwAlarmService.subscribeToResetAlarms().subscribe(x => {
      if (x) {
        this.resetAlarms();
      }
    });
  }

  private subscribeToAlarms(): void {
    this.gwAlarmService.subscribeToAlarmsClicked().subscribe(x => {
      if (x) {
        this.gwModalService.openAdvancedDialog(
          "",
          ButtonActions.None,
          GatewayAlarmsDialogComponent,
          null,
          (result) => {
            if (result) {
              this.closeDialog();
            } else {
              this.closeDialog();
            }
          },
          '1200px',
          null,
          null,
          null,
          'gw-alarm-dialog-box'
        );
      }
    })
  }

  closeDialog() {
    this.gwModalService.closeModal();
  }

  private subscribeToWellEntityStore(multiNodeEquipmentAlarm: MultiNodeEquipmentAlarm) {
    this.store.select<any>(selectWellState).subscribe((state: IWellEntityState) => {
      if (state && !state.isLoaded) {
        this.store.dispatch(WELL_LOAD());
      }
      else {
        this.store.select<any>(selectAllWells).subscribe(wells => {
          this.wellEntity = _.cloneDeep(wells);
        });
        if (this.wellEntity.length > 0 && multiNodeEquipmentAlarm != null) {
          this.subscribeToWellAlarms(multiNodeEquipmentAlarm);
        }
      }
    });
  }

  private subscribeToWellAlarms(multiNodeEquipmentAlarm: MultiNodeEquipmentAlarm): void {
    let wellIdx = this.wellEntity.findIndex(well => well.WellId.toString() === multiNodeEquipmentAlarm.EquipmentId && well.WellId > 0) ?? -1;
    if (wellIdx != -1) {
      //Get SIE Name
      let sieName = '';
      if (this.sies != undefined) {
        sieName = this.getSIENameByWellId(this.wellEntity[wellIdx].WellId);
      }
      //Set alarmId
      let alarmId = this.wellEntity[wellIdx].WellId * 10000 + multiNodeEquipmentAlarm.AlarmType;
      //Check if alarm exists, then update, else create
      let inx = this.multiNodeAlarms.findIndex(a => a.AlarmId === alarmId) ?? -1;
      let alarmDesc = multiNodeEquipmentAlarm.AlarmDescription;
      alarmDesc = String.Format(alarmDesc, this.wellEntity[wellIdx].TEC.TecNumber);
      if (inx != -1) {
        //this.multiNodeAlarms.splice(inx, 1);
        this.multiNodeAlarms[inx] = this.SetAlarmProperties(alarmId, multiNodeEquipmentAlarm, alarmDesc, this.wellEntity[wellIdx].WellName, sieName);
        if (multiNodeEquipmentAlarm.AlarmState === 3) {
          this.multiNodeAlarms.splice(inx, 1);
          this.updateAlarms();
          return;
        }
      } else {
        if (multiNodeEquipmentAlarm.AlarmState === 3) return;
        let multiNodeAlarm =  this.SetAlarmProperties(alarmId, multiNodeEquipmentAlarm, alarmDesc, this.wellEntity[wellIdx].WellName, sieName);
        this.multiNodeAlarms.push(multiNodeAlarm);  
      }

      this.updateAlarms();
    } else {
      let alarmIdx = this.multiNodeAlarms.findIndex(alarm => alarm.AlarmEquipmentId === multiNodeEquipmentAlarm.EquipmentId) ?? -1;
      if (alarmIdx != -1) {
        this.multiNodeAlarms.splice(alarmIdx, 1);
        this.updateAlarms();
      }
    }
  }

  private subscribeToWellZones(multiNodeEquipmentAlarm: MultiNodeEquipmentAlarm) {
    this.store.select<any>(selectWellState).subscribe((state: IWellEntityState) => {
      if (state && !state.isLoaded) {
        this.store.dispatch(WELL_LOAD());
      }
      else {
        this.store.select<any>(selectAllWells).subscribe(wells => {
          this.wellEntity = _.cloneDeep(wells);
        });
        if (this.wellEntity.length > 0 && multiNodeEquipmentAlarm != null) {
          this.subscribeToeFCVAlarms(multiNodeEquipmentAlarm);
        }
      }
    });
  }

  private subscribeToeFCVAlarms(multiNodeEquipmentAlarm: MultiNodeEquipmentAlarm): void {
    let Zones: any[] = [];
    this.wellEntity.forEach(well => {
      well.Zones.forEach(zone => {Zones.push(zone);});      
    });
    let zoneIdx = Zones.findIndex(z => z.eFCVGuid === multiNodeEquipmentAlarm.EquipmentId && z.ZoneId > 0) ?? -1;
    if (zoneIdx != -1) {
      //Get Well Name
      let wellName = '';
      if (this.wellEntity != undefined) {
        wellName = this.getWellNameByZoneId(Zones[zoneIdx].eFCVGuid);
      }      
      //Set alarmId
      let alarmId = Zones[zoneIdx].ZoneId * 10000 + multiNodeEquipmentAlarm.AlarmType;
      //Check if alarm exists, then update, else create
      let inx = this.multiNodeAlarms.findIndex(a => a.AlarmId === alarmId) ?? -1;
      let alarmDesc = multiNodeEquipmentAlarm.AlarmDescription;
      alarmDesc = String.Format(alarmDesc, Zones[zoneIdx].Address);      
      if (inx != -1) {
        //this.multiNodeAlarms.splice(inx, 1);
        this.multiNodeAlarms[inx] = this.SetAlarmProperties(alarmId, multiNodeEquipmentAlarm, alarmDesc, Zones[zoneIdx].ZoneName, wellName);
        if (multiNodeEquipmentAlarm.AlarmState === 3) {
          this.multiNodeAlarms.splice(inx, 1);
          this.updateAlarms();
          return;
        }
      } else {
        if (multiNodeEquipmentAlarm.AlarmState === 3) return;
        let multiNodeAlarm =  this.SetAlarmProperties(alarmId, multiNodeEquipmentAlarm, alarmDesc, Zones[zoneIdx].ZoneName, wellName);
        this.multiNodeAlarms.push(multiNodeAlarm);  
      }

      this.updateAlarms();
    } else {
      let alarmIdx = this.multiNodeAlarms.findIndex(alarm => alarm.AlarmEquipmentId === multiNodeEquipmentAlarm.EquipmentId) ?? -1;
      if (alarmIdx != -1) {
        this.multiNodeAlarms.splice(alarmIdx, 1);
        this.updateAlarms();
      }
    }
  }

  private subscribeToSIEEntity(multiNodeEquipmentAlarm: MultiNodeEquipmentAlarm) {
    let saved = UICommon.IsConfigSaved;
    this.store.select<any>(selectSieState).subscribe((state: ISieEntityState) => {
      if (state && !state.isLoaded) {
        this.store.dispatch(SIE_LOAD());
      } else {
        this.store.select<any>(selectAllSie).subscribe(data => {
          this.sies = data;
        });
        if (this.sies.length > 0 && multiNodeEquipmentAlarm != null)
          this.subscribeToSIEAlarms(multiNodeEquipmentAlarm);
      }
    });
  }

  private subscribeToSIEAlarms(multiNodeEquipmentAlarm: MultiNodeEquipmentAlarm): void {
    let sieIdx = this.sies.findIndex(sie => sie.SIEGuid === multiNodeEquipmentAlarm.EquipmentId && sie.SIEDeviceId > 0) ?? -1;
    if (sieIdx != -1) {
      //Set alarmId
      let alarmId = this.sies[sieIdx].SIEDeviceId * 10000 + multiNodeEquipmentAlarm.AlarmType;
      //Check if alarm exists, then update, else create
      let inx = this.multiNodeAlarms.findIndex(a => a.AlarmId === alarmId) ?? -1;
      let alarmDesc = multiNodeEquipmentAlarm.AlarmDescription;
      if (inx != -1) {
        this.multiNodeAlarms[inx] = this.SetAlarmProperties(alarmId, multiNodeEquipmentAlarm, alarmDesc, this.sies[sieIdx].Name, "N/A");
        if (multiNodeEquipmentAlarm.AlarmState === 3) {
          this.multiNodeAlarms.splice(inx, 1);
          this.updateAlarms();
          return;
        }        
      } else {
        if (multiNodeEquipmentAlarm.AlarmState === 3) return;
        let multiNodeAlarm = this.SetAlarmProperties(alarmId, multiNodeEquipmentAlarm, alarmDesc, this.sies[sieIdx].Name, "N/A");
        this.multiNodeAlarms.push(multiNodeAlarm);  
      }

      this.updateAlarms();
    } else {
      let alarmIdx = this.multiNodeAlarms.findIndex(alarm => alarm.AlarmEquipmentId === multiNodeEquipmentAlarm.EquipmentId) ?? -1;
      if (alarmIdx != -1) {
        this.multiNodeAlarms.splice(alarmIdx, 1);
        this.updateAlarms();
      }
    }
  }  

  private updateAlarms(): void {
    let totalactiveAlarmIds = [];
    this.multiNodeAlarms.forEach(alarm => {
      if (alarm.AlarmState === MultiNodeAlarmState.ACTIVE)
      totalactiveAlarmIds.push(alarm.AlarmId);
    });


      //Sorting
      let actGrp:MultiNodeAlarmDefinitionDataUI[] = [];  //active alarms
      let ackGrp:MultiNodeAlarmDefinitionDataUI[] = [];  //acknowledged alarms
      let othGrp:MultiNodeAlarmDefinitionDataUI[] = [];  //other alarms
      for (let m = 0; m < this.multiNodeAlarms.length; m++) {
        if (this.multiNodeAlarms[m].AlarmState === 0) {  //active
          actGrp.push(this.multiNodeAlarms[m]);
        } else if (this.multiNodeAlarms[m].AlarmState === 1) {  //acknowledged
          ackGrp.push(this.multiNodeAlarms[m]);
        } else {  //others
          othGrp.push(this.multiNodeAlarms[m]);
        }
      }

      let multiNodeAlarmDef: MultiNodeAlarmDefinitionDataUI[] = [];
      if (actGrp.length > 0) {
        actGrp.sort((a, b) => b.AlarmStartTime.toString().localeCompare(a.AlarmStartTime.toString()));
        for (let i = 0; i < actGrp.length; i++) { multiNodeAlarmDef.push(actGrp[i]); }
      }
      if (ackGrp.length > 0) {
        ackGrp.sort((a, b) => b.AlarmStartTime.toString().localeCompare(a.AlarmStartTime.toString()));
        for (let i = 0; i < ackGrp.length; i++) { multiNodeAlarmDef.push(ackGrp[i]); } 
      }
      if (othGrp.length > 0) {
        othGrp.sort((a, b) => b.AlarmStartTime.toString().localeCompare(a.AlarmStartTime.toString()));
        for (let i = 0; i < othGrp.length; i++) { multiNodeAlarmDef.push(othGrp[i]); }      
      }          
  

    this.gwAlarmService.updateAlarmDescription(multiNodeAlarmDef);
    this.gwAlarmService.updateRealtimeAlarms(totalactiveAlarmIds, false);
  }

  private SetAlarmProperties(alarmId: number, multiNodeEquipmentAlarm: MultiNodeEquipmentAlarm, desc: string, equipmentName: string, parentName: string): MultiNodeAlarmDefinitionDataUI {
    let multiNodeAlarm = new MultiNodeAlarmDefinitionDataUI();
    multiNodeAlarm.AlarmId = alarmId;
    multiNodeAlarm.SeverityType = multiNodeEquipmentAlarm.AlarmState === MultiNodeAlarmState.ACTIVE ? 1 : 3;
    multiNodeAlarm.Status = true;
    multiNodeAlarm.Descripiton = desc;
    multiNodeAlarm.AlarmStartTime = multiNodeEquipmentAlarm.Start_UTC_DateTime;
    multiNodeAlarm.AlarmType = multiNodeEquipmentAlarm.AlarmType;
    multiNodeAlarm.AlarmState = multiNodeEquipmentAlarm.AlarmState;
    multiNodeAlarm.AlarmCount = multiNodeEquipmentAlarm.ActiveAlarmCount;
    multiNodeAlarm.AlarmEquipmentId = multiNodeEquipmentAlarm.EquipmentId;
    multiNodeAlarm.AlarmEquipmentName = equipmentName;
    multiNodeAlarm.AlarmParentId = multiNodeEquipmentAlarm.ParentEquipmentId;
    multiNodeAlarm.AlarmParentName = parentName;

    return multiNodeAlarm;

  }

  // unsubscribeAlarmSubscription(deviceId: number): void {
  //   let sub = this.alarmSubscriptionsMap.get(deviceId);
  //   if (sub != null) {
  //     sub.unsubscribe();
  //     sub = null;
  //     this.alarmSubscriptionsMap.delete(deviceId);
  //   }
  // }

  private getHealthStateStatus(statusCode: number) {
    let status = "INACTIVE";
    switch (statusCode) {
      case HealthState.ILL:
        status = "ILL";
        break;

      case HealthState.INACTIVE:
        status = "INACTIVE";
        break;

      case HealthState.REVIEW:
        status = "REVIEW";
        break;

      case HealthState.STALE:
        status = "STALE";
        break;
    }
    return status;
  }

  private resetAlarms(): void {
    this.clearAlarms();
  }

  private clearAlarms(): void {
    this.multiNodeAlarms = [];
    this.gwAlarmService.updateAlarmDescription(this.multiNodeAlarms);
    this.gwAlarmService.updateRealtimeAlarms([], false);
    this.gwAlarmService.AlarmsCleared();
  }
  
  private getSIENameByWellId(wellId: number): string {
    if (this.sies.length <= 0) return '';
    for (var sie of this.sies) {
      for (var link of sie.SIEWellLinks) {
        if (link.WellId === wellId) {
          return link.SIEName;
        }
      }
    }
    return '';
  }

  private getWellNameByZoneId(zoneGuid: string): string {
    if (this.wellEntity.length <= 0) return '';
    for (var well of this.wellEntity) {
      for (var zone of well.Zones) {
        if (zone.eFCVGuid === zoneGuid) {
          return well.WellName;
        }
      }
    }    return '';
  }
}
