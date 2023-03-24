import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AlarmDefinitionDataUIModel } from '@core/models/webModels/AlarmDefinitionDataUI.model';
import { AlarmService } from '@core/services/alarm.service';
import { InforceDeviceDataModel } from '@core/models/webModels/InforceDeviceData.model';
import { IAlarmsState } from '@store/state/alarms.state';
import { Store } from '@ngrx/store';
import { RealTimeDataSignalRService } from '@core/services/realTimeDataSignalR.service';
import { AlarmDefinition } from '@core/models/UIModels/alarmUIModel.model';
import { DeviceIdIndexValue } from '@core/models/webModels/PointTemplate.model';
import { Observable, Subscription } from 'rxjs';
import { UIReportUnits } from '@core/data/UICommon';

@Component({
  selector: 'app-alarm-object',
  templateUrl: './alarms-dialog.component.html',
  styleUrls: ['./alarms-dialog.component.scss']
})
export class AlarmsDialogComponent implements OnInit {
  cellStyles: any = null;
  IsMobileView: boolean = false;
  ActiveAlarmDescriptions: AlarmDefinitionDataUIModel[] = [];
  AlarmsState$: Observable<IAlarmsState>;
  inforcedevices: InforceDeviceDataModel[] = [];
  isDirty: boolean = false;
  Title: string;
  Details: string;
  public AlarmDescriptionsUI: AlarmDefinition[] = [];
  private deviceIdIndexValue: DeviceIdIndexValue[] = [];
  public handle: number;
  private predefinedIndex: number = 0;
  private realTimeSubscriptions: Subscription[] = [];
  private dataSubscriptions: Subscription[] = [];
  HasConfigurationDataLoaded: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<AlarmsDialogComponent>,
    protected alarmService: AlarmService,
    protected store: Store<{ alarmsState: IAlarmsState }>,
    private realTimeDataSignalRService: RealTimeDataSignalRService
  ) {

  }

  styles = {
    padding: '2px'
  }
  private assignAlarms() {
    let subscription = this.alarmService.subscribeToActiveAlarms().subscribe(alarmDesc => {
      this.ActiveAlarmDescriptions = alarmDesc;
      this.getData();
    });
    this.dataSubscriptions.push(subscription);
  }

  private getAlarmCount(): void {
    let subscription = this.alarmService.subscribeToActiveAlarmCount().subscribe(alarmCount => {
      this.Title = alarmCount ? "Alarms(" + alarmCount + ")" : "No active alarms";
    });
    this.dataSubscriptions.push(subscription);
  }

  private detectScreenSize() {
    this.IsMobileView = window.innerWidth < 480 ? true : false;
  }

  OnCancel() {
    this.unsubscribeSubscriptions();
    this.dialogRef.close();
  }

  getAlarmMessage(alarm: AlarmDefinitionDataUIModel): string {
    
    if (this.AlarmDescriptionsUI != null) {
      let currentalarm: AlarmDefinition = this.getCurrentAlarmDefinition(alarm);
      if (currentalarm != null) {
        let realtimeValue = this.getDeviceIndexValue(currentalarm.currentIndex);
        let alarmMessage = currentalarm.Details;
        alarmMessage = alarmMessage.replace("{0}", realtimeValue.toFixed(1) + " " + currentalarm.Unit);
        if (currentalarm.LimitType == 1 || currentalarm.LimitType == 2)//low alarm
          alarmMessage = alarmMessage.replace("{1}", (Number(currentalarm.LimitValue.toFixed(1)) + this.convertPressure(Number(currentalarm.Deadband.toFixed(1)), this.alarmService.PressureUnit)).toFixed(1).toString() + " " + currentalarm.Unit);
        else if (currentalarm.LimitType == 3 || currentalarm.LimitType == 4)//high alarm
          alarmMessage = alarmMessage.replace("{1}", (Number(currentalarm.LimitValue.toFixed(1)) - this.convertPressure(Number(currentalarm.Deadband.toFixed(1)), this.alarmService.PressureUnit)).toFixed(1).toString() + " " + currentalarm.Unit);
        else
          alarmMessage = alarmMessage.replace("{1}", Number(currentalarm.LimitValue.toFixed(1)) + " " + currentalarm.Unit);
        return alarmMessage;
      }
    }
    else {
      return null;
    }
  }

  getCurrentAlarmDefinition(alarm: AlarmDefinitionDataUIModel): AlarmDefinition {
    let currentalarm: AlarmDefinition;

    if (this.AlarmDescriptionsUI.findIndex(a => a.AlarmId == alarm.AlarmId) != -1) {

      for (let i = 0; i < this.AlarmDescriptionsUI.length; i++) {
        if (this.AlarmDescriptionsUI[i].AlarmId == alarm.AlarmId)
          currentalarm = this.AlarmDescriptionsUI[i];
      }
    }

    return currentalarm;
  }

  getDeviceIndexValue(index: number): number {
    if (this.deviceIdIndexValue != null && this.deviceIdIndexValue[index] != null)
      return this.deviceIdIndexValue[index].value;
  }

  convertPressure(pressure: number, pressureUnit: string): number {
    let convertedPressure: number = pressure;
    if (pressureUnit == UIReportUnits._UnitPSIA.Name)
      convertedPressure = pressure + 14.7;
    else if (pressureUnit == UIReportUnits._UnitKPA.Name)
      convertedPressure = pressure * 6.89476;
    else if (pressureUnit == UIReportUnits._UnitMPA.Name)
      convertedPressure = pressure * 0.00689476;
    else if (pressureUnit == UIReportUnits._Unitbara.Name)
      convertedPressure = pressure * 0.0689476;
    else if (pressureUnit == UIReportUnits._Unitbarg.Name)
      convertedPressure = pressure * 0.0689476;
    else
      convertedPressure = pressure;
    return Number(convertedPressure.toFixed(1));

  }

  subScribeToRealTimeData() {
    this.realTimeSubscriptions = [];
    let deviceSubs = null;
    if (this.deviceIdIndexValue != undefined && this.deviceIdIndexValue != null) {
      this.deviceIdIndexValue.forEach(e => {
        deviceSubs = this.realTimeDataSignalRService.GetRealtimeData(e.deviceId, e.pointIndex).subscribe(d => {
          if (d != undefined && d != null)
            e.match(d);
        });
        this.realTimeSubscriptions.push(deviceSubs);
      });
    }
  }

  createDeviceIdAndIndexArray() {
    this.deviceIdIndexValue = [];
    if (this.AlarmDescriptionsUI != null) {

      for (let i = 0; i < this.AlarmDescriptionsUI.length; i++) {

        this.AlarmDescriptionsUI[i].currentIndex = this.predefinedIndex;
        this.predefinedIndex++;
        this.deviceIdIndexValue.push(new DeviceIdIndexValue(this.AlarmDescriptionsUI[i].DeviceId, this.AlarmDescriptionsUI[i].DataPointIndex, -999.0, ''));
      }
    }
  }

  getAlarm() {
    for (let i = 0; i < this.alarmService.AllAlarmsDescription.length; i++) {
      this.AlarmDescriptionsUI.push(AlarmDefinition.CopyToAlarmDefinition(this.alarmService.AllAlarmsDescription[i]));
    }
    this.createDeviceIdAndIndexArray();
    this.subScribeToRealTimeData();
  }

  getData() {
    if (this.HasConfigurationDataLoaded == false) {
      if (this.alarmService.AllAlarmsDescription && this.alarmService.AllAlarmsDescription.length > 0) {
        this.HasConfigurationDataLoaded = true;
        this.getAlarm();
      }
    }
  }

  unsubscribeSubscriptions(): void {
    if (this.realTimeSubscriptions && this.realTimeSubscriptions.length > 0) {
      this.realTimeSubscriptions.forEach(subscription => {
        subscription.unsubscribe();
        subscription = null;
      });
    }
    this.realTimeSubscriptions = [];

    if (this.dataSubscriptions && this.dataSubscriptions.length > 0) {
      this.dataSubscriptions.forEach(subscription => {
        subscription.unsubscribe();
        subscription = null;
      });
    }
    this.dataSubscriptions = [];
  }

  @HostListener("window:resize", [])
  public onResize() {
    this.detectScreenSize();
  }

  ngOnChanges() {
  }

  ngAfterViewInit(): void {
    this.detectScreenSize();
  }

  ngOnInit(): void {
    this.assignAlarms();
    this.getAlarmCount();
  }
}
