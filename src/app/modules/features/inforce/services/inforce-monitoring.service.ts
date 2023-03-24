import { Injectable } from "@angular/core";
import { ThresholdRange } from "@core/models/UIModels/InforceMonitoring.model";
import { AlarmDefinitionDataUIModel } from "@core/models/webModels/AlarmDefinitionDataUI.model";
import { Store } from "@ngrx/store";
import { IInforceDeviceState } from "@store/state/inforcedevices.state";
import { StateUtilities } from "@store/state/IState";
import { Observable, Subscription } from "rxjs";
import { InforceUICommon, INFORCE_GAUGE_THRESHOLD_CONFIG } from "../common/InforceUICommon";
import { InforceModule } from "../inforce.module";

import * as INFACTIONS from '@store/actions/inforcedevices.action';
import * as ACTIONS from '@store/actions/alarms.action';

import { InforceDeviceDataModel } from "@core/models/webModels/InforceDeviceData.model";
import { IAlarmsState } from "@store/state/alarms.state";
import { AlarmService } from "@core/services/alarm.service";
import { DeviceIdIndexValue } from "@core/models/webModels/PointTemplate.model";
import { HyrdraulicPowerUnitPointIndex, OperationMode } from "../common/InForceModbusRegisterIndex";
import { RealTimeDataSignalRService } from "@core/services/realTimeDataSignalR.service";
import { GwFeatureModuleService } from "@core/services/gw-feature-module.service";

@Injectable({
  providedIn: InforceModule
})
export class InforceMonitoringService {

  AlarmsState$: Observable<IAlarmsState>;
  InforceDeviceState$: Observable<IInforceDeviceState>;

  private inforcedevices: InforceDeviceDataModel[] = [];
  private deviceIdIndexValue: DeviceIdIndexValue[] = [];
  private isSetOperationModeIdle: boolean;

  private arrSubscriptions: Subscription[] = [];
  private dataSubscriptions: Subscription[] = [];
  private handle: number;

  constructor(protected store: Store,
    private alarmService: AlarmService,
    private gwFeatureModuleService: GwFeatureModuleService,
    private realtimeService: RealTimeDataSignalRService) {
    this.AlarmsState$ = this.store.select<any>((state: any) => state.alarmsState);
    this.InforceDeviceState$ = this.store.select<any>((state: any) => state.inforcedevicesState);
    this.initAlarms();
  }

  initAlarms(): void {
    this.subscribeToInforceDevices();
  }

  private getHPUID(): number {
    if (this.inforcedevices.length > 0) {
      let inforceDevice: InforceDeviceDataModel = this.inforcedevices.find(c => c.DeviceName == "HPU");
      return inforceDevice.DeviceId;
    }
    else
      return 2;//need to be removed,  from 1.3
  }

  private subscribeToInFORCEsetOperationMode(): void {
    const subscription = this.realtimeService.GetRealtimeData(this.getHPUID(), HyrdraulicPowerUnitPointIndex.SetOperationMode).subscribe(d => {
      if (d != undefined && d != null) {
        // this.IsConfigSaved = UICommon.IsConfigSaved;
        this.isSetOperationModeIdle = d.Value != -999 && d.Value == OperationMode.Idle ? true : false;
        this.gwFeatureModuleService.updateOperationMode(this.isSetOperationModeIdle);
      }
    });

    this.arrSubscriptions.push(subscription);
  }

  private subscribeToInforceDevices(): void {
    const subscription = this.InforceDeviceState$.subscribe(
      (state: IInforceDeviceState) => {
        if (state !== undefined) {
          if (state.isLoaded === false && !StateUtilities.hasErrors(state)) {
            this.store.dispatch(INFACTIONS.INFORCEDEVICES_LOAD());
          }
          else {
            Object.assign(this.inforcedevices, state.inforcedevices);
            this.subscribeToInFORCEsetOperationMode();
            this.subscribeToAlarms();
            this.subscribeToResetAlarms();
          }
        }
      }
    );
    this.arrSubscriptions.push(subscription);
  }

  private subscribeToResetAlarms() {
    const subscription = this.alarmService.subscribeToResetAlarms().subscribe(reset => {
      if (reset) {
        this.resetAlarms();
      }
    })
    this.arrSubscriptions.push(subscription);
  }

  private resetAlarms(): void {
    this.alarmService.updateAlarmDescription([]);
    this.alarmService.updateRealtimeAlarms([]);
    this.alarmService.AlarmsCleared();
  }

  private subscribeToAlarms(): void {
    const subscription = this.AlarmsState$.subscribe(
      (state: IAlarmsState) => {
        if (state !== undefined) {
          if (state.isLoaded === false && !StateUtilities.hasErrors(state)) {
            this.store.dispatch(ACTIONS.ALARMS_LOAD());
          }
          else {
            if (state.alarmsui != undefined) {
              this.alarmService.updateAlarmDescription(state.alarmsui);
              this.startAlarmAquasition();
            }
          }
        }
      }
    );
    this.arrSubscriptions.push(subscription);
  }

  private startAlarmAquasition(): void {
    this.createDeviceIdAndIndexArray();
  }

  private createDeviceIdAndIndexArray() {
    let hpuId = this.getHPUID();

    this.deviceIdIndexValue = [];
    this.deviceIdIndexValue.push(new DeviceIdIndexValue(hpuId, HyrdraulicPowerUnitPointIndex.SystemAlarmStatusWord, 0, ''));
    this.deviceIdIndexValue.push(new DeviceIdIndexValue(hpuId, HyrdraulicPowerUnitPointIndex.OutputPressureAlarmStatusWord, 0, ''));
    this.subScribeToRealTimeData();

    this.handle = window.setInterval(() => this.getAlarmStatus(), 10);
  }

  private getAlarmStatus(): void {
    if (this.deviceIdIndexValue[0].value >= 0 && this.deviceIdIndexValue[1].value >= 0) {
      let systemAlarmbitNumberArray: string[] = (parseInt(this.deviceIdIndexValue[0].value.toString(), 10).toString(2)).split("");

      let outputPressureAlarmbitNumberArray: string[] = parseInt(this.deviceIdIndexValue[1].value.toString(), 10).toString(2).split("");
      let totalactiveAlarmIds = new Array();
      for (let i = 0; i < systemAlarmbitNumberArray.length; i++) {
        if (systemAlarmbitNumberArray[i] == "1")
          totalactiveAlarmIds.push(systemAlarmbitNumberArray.length - (i + 1));//Alarm Id will be the position of 1 bit
      }
      for (let i = 0; i < outputPressureAlarmbitNumberArray.length; i++) {
        if (outputPressureAlarmbitNumberArray[i] == "1")
          totalactiveAlarmIds.push((outputPressureAlarmbitNumberArray.length - (i + 1)) + 32);//Alarm Id will be the position of 1 bit +31 for output pressures
      }

      this.alarmService.updateRealtimeAlarms(totalactiveAlarmIds);
    }
  }

  private subScribeToRealTimeData() {
    this.dataSubscriptions = [];
    let deviceSubs = null;

    if (this.deviceIdIndexValue != undefined && this.deviceIdIndexValue != null) {
      this.deviceIdIndexValue.forEach(e => {
        deviceSubs = this.realtimeService.GetRealtimeData(e.deviceId, e.pointIndex).subscribe(d => {
          if (d != undefined && d != null)
            e.match(d);
        });
        this.dataSubscriptions.push(deviceSubs);
      });
    }
  }

  // Gauge threshold level - color codes
  defineGaugeThresholdLevel(alarmRecords: AlarmDefinitionDataUIModel[], activeAlarmList: AlarmDefinitionDataUIModel[], unitSymbol: string) {
    const warning = { color: INFORCE_GAUGE_THRESHOLD_CONFIG.warning.color };
    const critical = { color: INFORCE_GAUGE_THRESHOLD_CONFIG.critical.color };
    const thresholdRange = this.getThresholdRange(alarmRecords, activeAlarmList, unitSymbol);
    const thresholdRangeObj = {};
    if (thresholdRange.ValidHighLimit) {
      thresholdRangeObj[`${thresholdRange.ValidHighLimit}`] = { color: INFORCE_GAUGE_THRESHOLD_CONFIG.valid.color };
    }
    if (thresholdRange.WarningLowLimit && thresholdRange.WarningLowLimit === thresholdRange.ValidHighLimit) {
      thresholdRangeObj[`${thresholdRange.WarningLowLimit + 0.01}`] = warning;
    }
    if (thresholdRange.WarningHighLimit) {
      if (thresholdRange.WarningHighLimit === thresholdRange.ValidLowLimit) {
        thresholdRangeObj['0'] = warning;
        thresholdRangeObj[`${thresholdRange.WarningHighLimit - 0.01}`] = warning;
        thresholdRangeObj[`${thresholdRange.ValidLowLimit}`] = { color: INFORCE_GAUGE_THRESHOLD_CONFIG.valid.color };
      } else {
        thresholdRangeObj[`${thresholdRange.WarningHighLimit}`] = warning;
      }
    }
    if (thresholdRange.CriticalLowLimit && thresholdRange.CriticalLowLimit === thresholdRange.ValidHighLimit) {
      thresholdRangeObj[`${thresholdRange.CriticalLowLimit + 0.01}`] = critical;
    }
    if (thresholdRange.CriticalHighLimit) {
      thresholdRangeObj[`${thresholdRange.CriticalHighLimit}`] = critical;
    }
    if (thresholdRange.FatalHighLimit) {
      thresholdRangeObj[`${thresholdRange.FatalHighLimit}`] = { color: INFORCE_GAUGE_THRESHOLD_CONFIG.fatal.color };
    }
    // console.log('threshold Level', thresholdRangeObj);
    return thresholdRangeObj;
  }

  getThresholdRange(alarmRecords: AlarmDefinitionDataUIModel[], activeAlarmList: AlarmDefinitionDataUIModel[], unitSymbol): ThresholdRange {
    let warningLowLimit: number = 0;
    let warningHighLimit: number = 0;
    let criticalLowLimit: number = 0;
    let criticalHighLimit: number = 0;
    let fatalLowLimit: number = 0;
    let fatalHighLimit: number = 0;
    let validLowLimit: number = 0;
    let validHighLimit: number = 0;
    let highdeadbandvalue: number = 0;
    let lowdeadbandvalue: number = 0;
    let activerecord: AlarmDefinitionDataUIModel;
    for (let i = 0; i < alarmRecords.length; i++) {
      //verify is alarm active     
      if (activeAlarmList.length > 0) {
        activerecord = activeAlarmList.find(c => c.DeviceId == alarmRecords[i].DeviceId && c.DataPointIndex == alarmRecords[i].DataPointIndex);
        //if index is non zero then alarm is active .consider deadband
        if (activerecord != null) {
          if ((activerecord.LimitType == 3 || activerecord.LimitType == 4))//high highhigh type
            highdeadbandvalue = InforceUICommon.convertPressure(activerecord.Deadband * -1, unitSymbol);
          if (activerecord.LimitType == 1 || activerecord.LimitType == 2)//low lowlow type
            lowdeadbandvalue = InforceUICommon.convertPressure(activerecord.Deadband, unitSymbol);
          break;
        }
      }
    }
    if (activerecord == null)
      activerecord = new AlarmDefinitionDataUIModel();
    //valid range
    let lowerlimitrecord = alarmRecords.find(c => c.LimitType == 1 || c.LimitType == 2);
    let upperlimitRecord = alarmRecords.find(c => c.LimitType == 3 || c.LimitType == 4);

    if (lowerlimitrecord == null)
      validLowLimit = 0;
    else
      validLowLimit = lowerlimitrecord.LimitValue + lowdeadbandvalue;
    if (upperlimitRecord == null)
      validHighLimit = InforceUICommon.getGaugeMaxLimit(unitSymbol);
    else
      validHighLimit = upperlimitRecord.LimitValue + highdeadbandvalue;
    //warning low and high limits
    let warningRecord = alarmRecords.find(c => c.SeverityType == 3);
    if (warningRecord != null) {
      if (warningRecord.LimitType == 1 || warningRecord.LimitType == 2)//low warning type records
      {
        warningLowLimit = 0;
        warningHighLimit = activerecord.SeverityType == 3 ? (warningRecord.LimitValue + lowdeadbandvalue) : warningRecord.LimitValue;
      }
      else {
        warningLowLimit = activerecord.SeverityType == 3 ? (warningRecord.LimitValue + highdeadbandvalue) : warningRecord.LimitValue;
        warningHighLimit = InforceUICommon.getGaugeMaxLimit(unitSymbol);
      }
    }
    //fatal low and high limits
    let fatalRecord = alarmRecords.find(c => c.SeverityType == 1);
    if (fatalRecord != null) {
      if (fatalRecord.LimitType == 1 || fatalRecord.LimitType == 2)//low fatal type records
      {
        fatalLowLimit = 0;
        fatalHighLimit = activerecord.SeverityType == 1 ? (fatalRecord.LimitValue + lowdeadbandvalue) : fatalRecord.LimitValue;
      }
      else {
        fatalLowLimit = activerecord.SeverityType == 1 ? (fatalRecord.LimitValue + highdeadbandvalue) : fatalRecord.LimitValue;
        fatalHighLimit = InforceUICommon.getGaugeMaxLimit(unitSymbol);
      }
    }

    let criticalRecord = alarmRecords.find(c => c.SeverityType == 2);
    if (criticalRecord != null) {
      if (criticalRecord.LimitType == 1 || criticalRecord.LimitType == 2)//low critical type records
      {
        criticalLowLimit = 0;
        criticalHighLimit = activerecord.SeverityType == 2 ? (criticalRecord.LimitValue + lowdeadbandvalue) : criticalRecord.LimitValue;
      }
      else {
        criticalLowLimit = activerecord.SeverityType == 2 ? (criticalRecord.LimitValue + highdeadbandvalue) : criticalRecord.LimitValue;
        criticalHighLimit = InforceUICommon.getGaugeMaxLimit(unitSymbol);
      }
    }

    let thresholdRange: ThresholdRange = {
      ValidLowLimit: validLowLimit,
      ValidHighLimit: validHighLimit,
      WarningLowLimit: warningLowLimit,
      WarningHighLimit: warningHighLimit,
      CriticalHighLimit: criticalHighLimit,
      CriticalLowLimit: criticalLowLimit,
      FatalLowLimit: fatalLowLimit,
      FatalHighLimit: fatalHighLimit
    }
    return thresholdRange;
  }

  UnSubscribePointSubscriptions(): void {
    if (this.dataSubscriptions != null) {
      this.dataSubscriptions.forEach(sb => {
        if (sb != null)
          sb.unsubscribe();
      });

      this.dataSubscriptions = [];
    }
  }
}