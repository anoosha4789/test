import { AfterViewInit, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';

import { StateUtilities } from '@store/state/IState';
import * as ERROR_HANDLING_SETTINGS_STATE_ACTIONS from '@store/actions/errorHandlingSettings.action';
import * as ALARM_ACTIONS from '@store/actions/alarms.action';
import * as INFACTIONS from '@store/actions/inforcedevices.action';
import { IErrorHandlingSettingsState } from '@store/state/errorHandlingSettings.state';
import { IInforceDeviceState } from '@store/state/inforcedevices.state';

import { InforcePanelUIModel } from '@core/models/UIModels/inforce-panel-config-common.model';
import { DataPointDefinitionModel, DataPointValueDataType } from '@core/models/webModels/DataPointDefinition.model';
import { InforceDeviceDataModel } from '@core/models/webModels/InforceDeviceData.model';

import { ConfigurationService } from '@core/services/configurationService.service';
import { DeviceDataPointsFacade } from '@core/facade/deviceDataPointsFacade.service';
import { PanelConfigurationFacade } from '@core/facade/panelConfigFacade.service';
import { RealTimeDataSignalRService } from '@core/services/realTimeDataSignalR.service';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { GatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { HyrdraulicPowerUnitPointIndex, Module2542PointIndex, OutputPressureSensors, OutputSensorDetail } from '@features/inforce/common/InForceModbusRegisterIndex';
import { IAlarmsState } from '@store/state/alarms.state';
import { AlarmDefinitionDataUIModel } from '@core/models/webModels/AlarmDefinitionDataUI.model';
import { IUnitSystemState } from '@store/state/unit-system.state';
import { UnitSystemUIModel } from '@core/models/UIModels/unit-system.model';
import { AlarmService } from '@core/services/alarm.service';
import { UNITSYSTEM_LOAD } from '@store/actions/unit-system.action'
import { IServerRunningStatusState } from '@store/state/serverRunningStatus.state';
import { InforceUICommon, INFORCE_GAUGE_CONFIG, INFORCE_GAUGE_THRESHOLD_CONFIG, INFORCE_RESERVIOR_CONFIG } from '@features/inforce/common/InforceUICommon';
import { InforceDeviceDetail, InforceGaugeOptions, InforceGaugeOptionUIModel, InforceGaugeUIModel, InforceReserviorUIModel, ThresholdRange } from '@core/models/UIModels/InforceMonitoring.model';
import { UtilityService } from '@core/services/utility.service';
import { ErrorHandlingUIModel } from '@core/models/webModels/ErrorHandlingUI.model';
import { InforceMonitoringService } from '@features/inforce/services/inforce-monitoring.service';

@Component({
  selector: 'gw-inforce-monitoring',
  templateUrl: './inforce-monitoring.component.html',
  styleUrls: ['./inforce-monitoring.component.scss']
})
export class InforceMonitoringComponent extends GatewayPanelBase implements OnInit, AfterViewInit, OnDestroy {

  bIsMobileView: boolean = false;
  hydraulicOutput: number;
  reserviorAlarmLimit: number;
  reserviorBoxConfig: any;
  panelOutputOption: InforceGaugeOptions;
  deviceDetail: InforceDeviceDetail;
  selectedUnitSystem: UnitSystemUIModel;
  private inforcedevices: InforceDeviceDataModel[] = [];
  alarmList: AlarmDefinitionDataUIModel[] = [];
  activeAlarmList: AlarmDefinitionDataUIModel[] = [];
  gaugeList: any[] = [];
  errorHandlingSettings: ErrorHandlingUIModel;
  pumpPressure: InforceGaugeUIModel;
  supplyPressure: InforceGaugeUIModel;
  reserviorLevel: DataPointDefinitionModel;
  deviceIndexArray: DataPointDefinitionModel[] = [];

  private errorHandlingSettingsState$: Observable<IErrorHandlingSettingsState>;
  private unitSystemState$: Observable<IUnitSystemState>;
  private serverRunningStatusState$: Observable<IServerRunningStatusState>;
  private InforceDeviceState$: Observable<IInforceDeviceState>;
  private AlarmState$: Observable<IAlarmsState>;
  private dataSubscriptions: Subscription[] = [];

  constructor(private router: Router,
    protected store: Store<{ 
      errorHandlingSettingsState: IErrorHandlingSettingsState;
      serverRunningStatusState: IServerRunningStatusState; 
      inforcedevicesState: IInforceDeviceState; 
      alarmsState: IAlarmsState 
    }>,
    private panelConfigFacade: PanelConfigurationFacade,
    private configurationService: ConfigurationService,
    private dataPointFacade: DeviceDataPointsFacade,
    private realTimeService: RealTimeDataSignalRService,
    private alarmService: AlarmService,
    private inforceMonitoringService: InforceMonitoringService,
    private gwModalService: GatewayModalService) {
    super(store, panelConfigFacade, null, null, null, dataPointFacade, null);
    this.errorHandlingSettingsState$ = this.store.select<any>((state: any) => state.errorHandlingSettingsState);
    this.unitSystemState$ = this.store.select<IUnitSystemState>((state: any) => state.unitSystemState);
    this.serverRunningStatusState$ = this.store.select<IServerRunningStatusState>((state: any) => state.serverRunningStatusState);
    this.InforceDeviceState$ = this.store.select<IInforceDeviceState>((state: any) => state.inforcedevicesState);
    this.AlarmState$ = this.store.select<any>((state: any) => state.alarmsState);
  }

  // Realtime data fetching
  private setUpRealtimeSubscription(): void {
    if (this.deviceIndexArray.length > 0) {
      this.deviceIndexArray.forEach((device) => {
        let deviceSubs = null;
        deviceSubs = this.realTimeService
          .GetRealtimeData(device.DeviceId, device.DataPointIndex)
          .subscribe((data) => {
            if (data) {
              device.RawValue = parseFloat(data.Value.toFixed(2));
            }
            this.dataSubscriptions.push(deviceSubs);
          });
      });
    }
  }

  // Fetch realtime data by relevant data point
  private getDeviceByPointIndex(deviceId: number, pointIndex: number): DataPointDefinitionModel {

    let index = this.datapointdefinitions.findIndex(d => d.DeviceId === deviceId && d.DataPointIndex == pointIndex) ?? -1;
    if (index !== -1) {
      const dp = new DataPointDefinitionModel();
      dp.DataPointIndex = this.datapointdefinitions[index].DataPointIndex;
      dp.DataType = this.datapointdefinitions[index].DataType;
      dp.DeviceId = this.datapointdefinitions[index].DeviceId;
      dp.RawValue = -999;
      dp.ReadOnly = this.datapointdefinitions[index].ReadOnly;
      dp.TagName = this.datapointdefinitions[index].TagName;
      dp.UnitQuantityType = this.datapointdefinitions[index].UnitQuantityType;
      dp.UnitSymbol = this.datapointdefinitions[index].UnitSymbol;
      this.deviceIndexArray.push(dp);
      return dp;
    }

    return new DataPointDefinitionModel();  // return empty DataPointDefinitionModel
  }

  // Get Inforce Device Details
  private getInforceDeviceDetail() {
    if (this.inforcedevices.length > 0) {
      let inforceDevice: InforceDeviceDataModel = this.inforcedevices.find(c => c.DeviceName == "HPU");
      const deviceInfo: InforceDeviceDetail = {
        HPUID: this.inforcedevices.find(c => c.DeviceName == "HPU").DeviceId,
        Module2542ID: this.inforcedevices.find(c => c.DeviceName == "Module2542").DeviceId,
        ModuleE1260ID: this.inforcedevices.find(c => c.DeviceName == "ModuleE1260").DeviceId
      }
      return deviceInfo;
    }
  }

  // Get Tool / Gauge Realtime data
  private updateGaugeRealTimeData(): void {
    if (this.datapointdefinitions && this.datapointdefinitions.length > 0) {
      this.setUpRealtimeSubscription();
    }
  }

  // Default configuration
  setGaugeConfiguration() {

    // Panel Output
    this.panelOutputOption = {
      type: 'semi',
      thick: 15,
      size: 102,
      backgroundColor: INFORCE_GAUGE_CONFIG.bgFillColor,
      foregroundColor: INFORCE_GAUGE_CONFIG.fgFillColor
    };

    // Reservior Liquid box 
    this.reserviorBoxConfig = {
      bgFillColor: INFORCE_RESERVIOR_CONFIG.bgFillColor,
      fillColor: INFORCE_RESERVIOR_CONFIG.valid,
      with: '148px',
      height: '66px',
      border: '12px'
    }
  }

  // Panel Gauge & Output 
  getPanelGaugeConfig(desc: string): InforceGaugeOptionUIModel {
    let alarmRecords = this.alarmList.filter(alarm => alarm.Descripiton.includes(`${desc}`) && alarm.SeverityType !== 4);
    return {
      type: 'semi',
      thick: 20,
      size: 148,
      backgroundColor: INFORCE_GAUGE_CONFIG.bgFillColor,
      foregroundColor: INFORCE_GAUGE_CONFIG.fgFillColor,
      min: 0,
      max: InforceUICommon.getGaugeMaxLimit(this.selectedUnitSystem.SelectedUnitSymbol),
      threshold: this.inforceMonitoringService.defineGaugeThresholdLevel(alarmRecords, this.activeAlarmList, this.selectedUnitSystem.SelectedUnitSymbol)
    }
  }

  // Reservior Level Threshold - Color
  defineReserviorThresholdLevel() {
    let reserviorLevel = this.reserviorLevel?.RawValue;
    let reserviorDeadBand: number = 0;
    let reserviorAlarmRecord = this.alarmList.find(c => c.Descripiton.includes("Low Reservoir Level"));
    if (this.activeAlarmList.length > 0 && reserviorAlarmRecord) {
      let activeReserviorRecord = this.activeAlarmList.find(c => c.DeviceId == reserviorAlarmRecord.DeviceId && c.DataPointIndex == reserviorAlarmRecord.DataPointIndex);
      reserviorDeadBand = activeReserviorRecord != null ? activeReserviorRecord.Deadband : reserviorDeadBand;
    }
    if (reserviorAlarmRecord) {
      this.reserviorAlarmLimit = reserviorAlarmRecord.LimitValue + reserviorDeadBand;
    } else {
      this.reserviorAlarmLimit = 5;
    }
    if (reserviorLevel) {
      if (reserviorLevel >= this.reserviorAlarmLimit && reserviorLevel <= 100) {
        this.reserviorBoxConfig.fillColor = INFORCE_RESERVIOR_CONFIG.valid;
      } else if ((reserviorLevel < this.reserviorAlarmLimit && reserviorLevel >= 0) || reserviorLevel > 100) {
        this.reserviorBoxConfig.fillColor = INFORCE_RESERVIOR_CONFIG.critical;
      } else if (reserviorLevel < 0) {
        this.reserviorBoxConfig.fillColor = INFORCE_RESERVIOR_CONFIG.fatal;
      } else {
        this.reserviorBoxConfig.fillColor = INFORCE_RESERVIOR_CONFIG.valid;
      }
    }
  }

  // Page Resize
  @HostListener("window:resize", [])
  public onResize() {
    this.detectScreenSize();
  }

  private detectScreenSize() {
    this.bIsMobileView = window.innerWidth < 480 ? true : false;
    if (window.innerWidth > 1400) {
      // Panel Output
      this.panelOutputOption.thick = 16;
      this.panelOutputOption.size = 112;
    } else {
      // Panel Output
      this.panelOutputOption.thick = 15;
      this.panelOutputOption.size = 102;
    }
  }

  getGaugeRealTimeData() {
    this.deviceIndexArray = [];
    this.gaugeList = [];
    this.deviceDetail = this.getInforceDeviceDetail();
    if (this.deviceDetail) {
      // Pump Pressure
      this.pumpPressure = {
        device: this.getDeviceByPointIndex(this.deviceDetail.Module2542ID, Module2542PointIndex.PumpDischargePressure),
        options: this.getPanelGaugeConfig('Pump Pressure')
      }
      // Reservior Level 
      this.defineReserviorThresholdLevel();
      // Supply Pressure
      this.supplyPressure = {
        device: this.getDeviceByPointIndex(this.deviceDetail.HPUID, HyrdraulicPowerUnitPointIndex.SupplyPressure),
        options: this.getPanelGaugeConfig('Supply Pressure')
      }
      this.reserviorLevel = this.getDeviceByPointIndex(this.deviceDetail.Module2542ID, Module2542PointIndex.ReserviorLevel);

      for (let i = 0; i < this.hydraulicOutput; i++) {
        const alarmRecords = this.alarmList.filter(alarm => alarm.DeviceId === this.deviceDetail.HPUID && alarm.DataPointIndex === OutputPressureSensors[i].OutputPressurePointIndex);
        const gauge: InforceReserviorUIModel = {
          name: OutputPressureSensors[i].SensorName,
          device: this.getDeviceByPointIndex(this.deviceDetail.HPUID, OutputPressureSensors[i].OutputPressurePointIndex),
          min: 0,
          max: InforceUICommon.getGaugeMaxLimit(this.selectedUnitSystem.SelectedUnitSymbol),
          threshold: this.inforceMonitoringService.defineGaugeThresholdLevel(alarmRecords, this.activeAlarmList, this.selectedUnitSystem.SelectedUnitSymbol)
        }
        this.gaugeList.push(gauge);
      }
    }
    this.updateGaugeRealTimeData();
  }

  private subscribeErrorHandling(): void {
    const subscription =  this.configurationService.getErrorHandlingSettings().subscribe((data) => {            
      this.errorHandlingSettings = data;
    });
    this.dataSubscriptions.push(subscription);
}

  postCallGetPanelConfigurationCommon(): void {
    this.hydraulicOutput = (this.panelConfigurationCommonState.panelConfigurationCommon as InforcePanelUIModel).HydraulicOutputs;
  }

  postCallDeviceDataPoints(): void {
    this.getGaugeRealTimeData();
  }

  private subscribeToInforceDevices(): void {
    const subscription = this.InforceDeviceState$.subscribe(
      (state: IInforceDeviceState) => {
        if (state !== undefined) {
          if (state.isLoaded === false && !StateUtilities.hasErrors(state)) {
            this.store.dispatch(INFACTIONS.INFORCEDEVICES_LOAD());
          } else {
            Object.assign(this.inforcedevices, state.inforcedevices);
          }
        }
      }
    );    
    this.subscribeToAlarms();
    this.dataSubscriptions.push(subscription);
  }

  private subscribeToAlarms(): void {
    const subscription = this.AlarmState$.subscribe(
      (state: IAlarmsState) => {
        if (state !== undefined) {
          if (state.isLoaded === false && !StateUtilities.hasErrors(state)) {
            this.store.dispatch(ALARM_ACTIONS.ALARMS_LOAD());
          }
          else {
            if (state.alarmsui != undefined) {
              this.alarmList = state.alarmsui;
            }
          }
        }
      }
    );    
    this.getActiveAlarmList();
    this.dataSubscriptions.push(subscription);
  }

  private getActiveAlarmList() {
    const subscription = this.alarmService.subscribeToActiveAlarms().subscribe(alarmDesc => {
      this.activeAlarmList = alarmDesc ?? [];
    });
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
            this.initPanelConfigurationCommon();
            this.subscribeToInforceDevices();
            this.initDeviceDataPoints();
          }
        }
      }
    );

    this.dataSubscriptions.push(subscription);
  }

  public ngAfterViewInit() {
    this.detectScreenSize();
  }

  ngOnDestroy(): void {
    if (this.dataSubscriptions != null && this.dataSubscriptions.length > 0) {
      this.dataSubscriptions.forEach(subscription => {
        if (subscription != null)
          subscription.unsubscribe();
      });
    }

    this.dataSubscriptions = [];
    super.ngOnDestroy();
  }

  ngOnInit(): void {
    this.subscribeErrorHandling();
    this.subscribeToUnitSystems();   
    this.setGaugeConfiguration();
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;     
  }

}

