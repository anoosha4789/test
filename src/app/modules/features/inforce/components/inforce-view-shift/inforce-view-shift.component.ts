import { Component, HostListener, Inject, LOCALE_ID, OnDestroy, OnInit } from '@angular/core';
import { formatNumber } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { interval, Observable, Subscription, timer } from 'rxjs';
import { Store } from '@ngrx/store';

import { IInforceDeviceState } from '@store/state/inforcedevices.state';
import { StateUtilities } from '@store/state/IState';
import * as WELL_ACTIONS from '@store/actions/well.entity.action';
import * as INFACTIONS from '@store/actions/inforcedevices.action';
import { UNITSYSTEM_LOAD } from '@store/actions/unit-system.action';

import { GatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { DataSourceFacade } from '@core/facade/dataSourceFacade.service';
import { DeviceDataPointsFacade } from '@core/facade/deviceDataPointsFacade.service';
import { PanelConfigurationFacade } from '@core/facade/panelConfigFacade.service';
import { PointTemplatesFacade } from '@core/facade/pointTemplatesFacade.service';
import { WellFacade } from '@core/facade/wellFacade.service';
import { InforceDeviceDetail, InforceGaugeOptionUIModel, InforceGaugeUIModel } from '@core/models/UIModels/InforceMonitoring.model';
import { DataPointDefinitionModel } from '@core/models/webModels/DataPointDefinition.model';
import { ConfigurationService } from '@core/services/configurationService.service';
import { RealTimeDataSignalRService } from '@core/services/realTimeDataSignalR.service';
import { InforceShiftStatus, InforceUICommon, INFORCE_GAUGE_CONFIG, INFORCE_GAUGE_THRESHOLD_CONFIG } from '@features/inforce/common/InforceUICommon';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { UtilityService } from '@core/services/utility.service';
import { ChartOptions } from '@shared/gateway-chart/multiaxis-chart/multiaxis-chart.model';
import { UIChartColors, UICommon } from '@core/data/UICommon';
import * as _ from 'lodash';
import { InforceWellUIModel } from '@core/models/UIModels/InforceWell.model';
import { InforceDeviceDataModel } from '@core/models/webModels/InforceDeviceData.model';
import { HyrdraulicPowerUnitPointIndex, InFORCEZone_HCM_PointIndex, Module2542PointIndex, OperationMode, OutputPressureSensors, OutputSensorDetail, SHIFT_STATUS_MESSAGE } from '@features/inforce/common/InForceModbusRegisterIndex';
import { UnitSystemUIModel } from '@core/models/UIModels/unit-system.model';
import { InforceWellShiftUIModel, InforceZoneShiftRecordUIModel } from '@core/models/UIModels/inforce.well.shift.model';
import { InforcePanelUIModel } from '@core/models/UIModels/inforce-panel-config-common.model';
import { ngxLoadingAnimationTypes } from 'ngx-loading';
import { AlarmDefinitionDataUIModel } from '@core/models/webModels/AlarmDefinitionDataUI.model';
import { ButtonActions } from '@shared/gateway-dialogs/components/gateway-advanced-dialog/gateway-advanced-dialog.component';
import { InfoceAbortShiftDialogComponent } from '../infoce-abort-shift-dialog/infoce-abort-shift-dialog.component';
import { WriteToServerDataModel } from '@core/models/webModels/WriteToServerData.model';
import { InforceUserInterventionComponent } from '@features/inforce/components/inforce-user-intervention/inforce-user-intervention.component';
import { IUnitSystemState } from '@store/state/unit-system.state';
import { INFORCE_WELL_ARCHITECTURE } from '@core/services/well.service';
import { InforceMonitoringService } from '@features/inforce/services/inforce-monitoring.service';

@Component({
  selector: 'gw-inforce-view-shift',
  templateUrl: './inforce-view-shift.component.html',
  styleUrls: ['./inforce-view-shift.component.scss']
})
export class InforceViewShiftComponent extends GatewayPanelBase implements OnInit, OnDestroy {

  isShiftInProgress = false;
  shiftAbortInProgress = false;
  initialLoad = true;
  progress = 0;
  monitoringRoute: string = "/inforce/monitoring";
  commonCloseName: string;
  loadconfig = { animationType: ngxLoadingAnimationTypes.threeBounce, backdropBorderRadius: '3px' };
  selectedUnitSystem: UnitSystemUIModel;
  well: InforceWellUIModel;
  wellInShift: InforceWellShiftUIModel;
  activeZone: InforceZoneShiftRecordUIModel;
  supplyPressure: InforceGaugeUIModel;
  commonClose: InforceGaugeUIModel;
  openLine: InforceGaugeUIModel;
  panelDetail: InforceDeviceDetail;
  hpuDevice: IViewShiftData;
  commonCloseSensor: OutputSensorDetail;
  openLineSensor: OutputSensorDetail;
  private panelOutputSensorList: OutputSensorDetail[];
  private outputLineList: OutputSensorDetail[];
  private inforcedevices: InforceDeviceDataModel[] = [];
  deviceIndexArray: DataPointDefinitionModel[] = [];
  alarmList: AlarmDefinitionDataUIModel[] = [];
  activeAlarmList: AlarmDefinitionDataUIModel[] = [];
  parameterList: Parameter[];
  public chartId: string = "inforceshift";
  multi_axis_series: ChartOptions;
  toleranceData: IToleranceData = { ToleranceUnitInPercentage: [], ReturnsToleranceHigh: [], ReturnsToleranceLow: [] };
  minReturns: number = 0;
  maxReturns: number = 0;
  currentPosition: string;
  targetPosition: string;
  showChart = false;

  private unitSystemState$: Observable<IUnitSystemState>;
  private InforceDeviceState$: Observable<IInforceDeviceState>;
  private dataSubscriptions: Subscription[] = [];

  private inFORCEShiftStatus: number;
  private userInterventionDlgVisible: boolean = false;
  private isLastShiftZone: boolean = false;
  constructor(@Inject(LOCALE_ID) private locale: string,
    protected router: Router,
    protected activatedRoute: ActivatedRoute,
    protected store: Store<{ inforcedevicesState: IInforceDeviceState; }>,
    private panelConfigFacade: PanelConfigurationFacade,
    private wellDataFacade: WellFacade,
    private dataSourceFacade: DataSourceFacade,
    private dataPointFacade: DeviceDataPointsFacade,
    private pointTemplateFacade: PointTemplatesFacade,
    private configService: ConfigurationService,
    private realTimeService: RealTimeDataSignalRService,
    private gwModalService: GatewayModalService,
    private inforceMonitoringService: InforceMonitoringService,) {
    super(store, panelConfigFacade, wellDataFacade, dataSourceFacade, null, dataPointFacade, pointTemplateFacade);
    this.unitSystemState$ = this.store.select<IUnitSystemState>((state: any) => state.unitSystemState);
    this.InforceDeviceState$ = this.store.select<IInforceDeviceState>((state) => state.inforcedevicesState);
  }

  getParamterList() {
    this.parameterList = [
      {
        key: 'Current Step',
        value: this.hpuDevice.CurrentRecipeControlTypeInExecution
      },
      {
        key: 'Step Time',
        value: this.hpuDevice.TimeInSecondsRemainingToFinishCurrentRecipeStep
      },
      {
        key: 'Expected Returns (mL)',
        value: this.hpuDevice.ExpectedReturnVolume,
        showDigit: true
      },
      {
        key: 'Actual Returns (mL)',
        value: this.hpuDevice.ReturnsFlowmeterTotal,
        showDigit: true
      },
      {
        key: 'Flow Rate (mL/min)',
        value: this.hpuDevice.ReturnFlowRate,
        showDigit: true
      },
      {
        key: `Pump Pressure (${this.selectedUnitSystem.SelectedDisplayUnitSymbol})`,
        value: this.hpuDevice.PumpDischargePressure
      },
      {
        key: `Supply Pressure (${this.selectedUnitSystem.SelectedDisplayUnitSymbol})`,
        value: this.hpuDevice.SupplyPressure
      }
    ];

    this.appendPanelOutputData();
  }

  appendPanelOutputData() {
    this.outputLineList.forEach((outputLine) => {
      this.parameterList.push({
        key: `${outputLine.SensorName} (${this.selectedUnitSystem.SelectedDisplayUnitSymbol})`,
        value: this.getDeviceByPointIndex(this.panelDetail.HPUID, outputLine?.OutputPressurePointIndex)
      });
    });
    this.setUpRealtimeSubscription();
  }

  abortShiftProcess() {
    this.gwModalService.openAdvancedDialog(
      'Confirm Abort Sequence',
      ButtonActions.None,
      InfoceAbortShiftDialogComponent,
      this.activeZone,
      (result) => {
        if (result) {
          if (this.hpuDevice.ExecuteOperationMode?.RawValue === 1) {
            this.writeToServer(this.panelDetail.HPUID, HyrdraulicPowerUnitPointIndex.ExecuteOperationMode, 'StartStopShift', 0);
          } else {
            this.writeToServer(this.panelDetail.HPUID, HyrdraulicPowerUnitPointIndex.SetOperationModeInternal, 'ExecuteOperationMode', 0);
          }
        }
        this.gwModalService.closeModal();
      },
      '350px'
    );
  }

  writeToServer(deviceId: number, pointIndex: number, pointName: string, value?: number, writeToServerCommandEnum?: number): void {
    const writeVar = new WriteToServerDataModel();
    writeVar.DeviceId = deviceId;
    writeVar.PointIndex = pointIndex;
    writeVar.PointName = pointName;
    writeVar.Value = value;
    writeVar.WriteToServerCommandEnum = 1;
    this.configService.WriteToServer(writeVar).subscribe((res) => {
      this.shiftAbortInProgress = true;
    })
  }

  // Panel Gauge & Output 
  getPanelGaugeConfig(desc: string): InforceGaugeOptionUIModel {
    return {
      type: 'semi',
      thick: 10,
      size: 70,
      backgroundColor: INFORCE_GAUGE_CONFIG.bgFillColor,
      foregroundColor: INFORCE_GAUGE_CONFIG.fgFillColor,
      min: 0,
      max: InforceUICommon.getGaugeMaxLimit(this.selectedUnitSystem.SelectedUnitSymbol),
      threshold: this.inforceMonitoringService.defineGaugeThresholdLevel(this.alarmList, this.activeAlarmList, this.selectedUnitSystem.SelectedUnitSymbol)
    }
  }

  @HostListener("window:resize", [])
  public onResize() {
    this.detectScreenSize();
  }

  ngAfterViewInit(): void {
    // setInterval(() => {
    this.detectScreenSize();
    // }, 200);
  }

  resizeTimer = null;
  private detectScreenSize() {
    if (this.resizeTimer) clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      if (window.innerWidth <= 370) {
        this.supplyPressure.options.size = 70;
        this.supplyPressure.options.thick = 10;
        this.commonClose.options.size = 70;
        this.commonClose.options.thick = 10;
        this.openLine.options.size = 70;
        this.openLine.options.thick = 10;
      } else if (window.innerWidth <= 375) {
        this.supplyPressure.options.size = 80;
        this.supplyPressure.options.thick = 10;
        this.commonClose.options.size = 80;
        this.commonClose.options.thick = 10;
        this.openLine.options.size = 80;
        this.openLine.options.thick = 10;
      } else if (window.innerWidth <= 390) {
        this.supplyPressure.options.size = 90;
        this.supplyPressure.options.thick = 15;
        this.commonClose.options.size = 90;
        this.commonClose.options.thick = 15;
        this.openLine.options.size = 90;
        this.openLine.options.thick = 15;
      } else if (window.innerWidth <= 414) {
        this.supplyPressure.options.size = 98;
        this.supplyPressure.options.thick = 15;
        this.commonClose.options.size = 98;
        this.commonClose.options.thick = 15;
        this.openLine.options.size = 98;
        this.openLine.options.thick = 15;
      } else {
        this.supplyPressure.options.size = 130;
        this.supplyPressure.options.thick = 20;
        this.commonClose.options.size = 130;
        this.commonClose.options.thick = 20;
        this.openLine.options.size = 130;
        this.openLine.options.thick = 20;
      }
    }, 500);
  }

  private setUpChart(): void {
    let chartOptions = new ChartOptions();
    let points = _.cloneDeep(this.pointTemplatesEnity.find(pt => pt.deviceTypeId === this.well.WellDeviceId));
    let yAxes: any[] = [];
    let dataSeries: any[] = [];
    // const activeZone = this.well.Zones[0];
    yAxes.push(
      {
        label: "Return Volume(mL)", unit: 'mL'
      });
    dataSeries.push(
      {
        deviceId: this.panelDetail.HPUID,
        pointIndex: HyrdraulicPowerUnitPointIndex.ReturnsFlowmeterTotal,
        label: `Actual Returns(mL)`,
        unit: 'mL',
        decimalPoints: 2,
        brush: UIChartColors.getChartBrush(0)
      },
      {
        deviceId: this.activeZone?.HcmId,
        pointIndex: InFORCEZone_HCM_PointIndex.ReturnsToleranceLow,
        label: 'Min',
        unit: 'mL',
        decimalPoints: 2,
        brush: UIChartColors.getChartBrush(1)
      },
      {
        deviceId: this.activeZone?.HcmId,
        pointIndex: InFORCEZone_HCM_PointIndex.ReturnsToleranceHigh,
        label: 'Max',
        unit: 'mL',
        decimalPoints: 2,
        brush: UIChartColors.getChartBrush(2)
      }
    )

    //if (yAxes.length > 0 && dataSeries.length > 0) {
    chartOptions.yAxes = yAxes;
    chartOptions.dataSeries = dataSeries;
    //}
    chartOptions.chartStartTime = this.wellInShift.shiftStartTime;
    this.multi_axis_series = chartOptions;
    setTimeout(() => {
      this.showChart = true;
    }, 1000);
  }
  getValueFromToleranceData(toleranceArray, activZone) {
    let value = null;
    if (toleranceArray && activZone)
      toleranceArray.forEach(data => {
        if (data?.DeviceId === activZone.HcmId) {
          value = data.RawValue;
        }
      });
    return value;
  }
  getZoneToleranceUnit(): number {
    return this.toleranceData ? this.getValueFromToleranceData(this.toleranceData.ToleranceUnitInPercentage, this.activeZone) : null;
  }
  getZoneToleranceHighValue(): number {
    return this.toleranceData ? this.getValueFromToleranceData(this.toleranceData.ReturnsToleranceHigh, this.activeZone) : null;
  }
  getZoneToleranceLowvalue(): number {
    return this.toleranceData ? this.getValueFromToleranceData(this.toleranceData.ReturnsToleranceLow, this.activeZone) : null;
  }
  getExpectedReturnVolumeValue(): number {
    return this.hpuDevice.ExpectedReturnVolume.RawValue;
  }

  getMinExpectedReturnVolume(): number {
    if (this.getZoneToleranceUnit() == 1) {
      let value = this.getExpectedReturnVolumeValue() * (1 - this.getZoneToleranceLowvalue() / 100);
      if (value < 0)
        value = 0;
      return value;
    }
    else {
      let value = this.getExpectedReturnVolumeValue() - this.getZoneToleranceLowvalue();
      if (value < 0)
        value = 0;
      return value;
    }
  }

  getMaxExpectedReturnVolume(): number {
    if (this.getZoneToleranceUnit() == 1) {
      return this.getExpectedReturnVolumeValue() * (1 + this.getZoneToleranceHighValue() / 100);
    }
    else {
      return this.getExpectedReturnVolumeValue() + this.getZoneToleranceHighValue();
    }
  }

  // Get Inforce Device Details
  private getHPUDeviceDetail() {
    if (this.inforcedevices.length > 0) {
      const deviceInfo: InforceDeviceDetail = {
        HPUID: this.inforcedevices.find(c => c.DeviceName == "HPU").DeviceId,
        Module2542ID: this.inforcedevices.find(c => c.DeviceName == "Module2542").DeviceId,
        ModuleE1260ID: this.inforcedevices.find(c => c.DeviceName == "ModuleE1260").DeviceId
      }
      return deviceInfo;
    }
  }

  setDataPointList() {
    // HPU Device Details
    this.hpuDevice = {
      SupplyPressure: this.getDeviceByPointIndex(this.panelDetail.HPUID, HyrdraulicPowerUnitPointIndex.SupplyPressure),
      PumpDischargePressure: this.getDeviceByPointIndex(this.panelDetail.Module2542ID, Module2542PointIndex.PumpDischargePressure),// Module2542Id
      TotalTimeRequiredInSeconds: this.getDeviceByPointIndex(this.panelDetail.HPUID, HyrdraulicPowerUnitPointIndex.TotalExecutionTimeRequiredInSeconds),
      TotalTimeRemainingInSeconds: this.getDeviceByPointIndex(this.panelDetail.HPUID, HyrdraulicPowerUnitPointIndex.TotalRemainingExecutionTimeInSeconds),
      CurrentOperationMode: this.getDeviceByPointIndex(this.panelDetail.HPUID, HyrdraulicPowerUnitPointIndex.CurrentOperationMode),
      ReturnsFlowmeterTotal: this.getDeviceByPointIndex(this.panelDetail.HPUID, HyrdraulicPowerUnitPointIndex.ReturnsFlowmeterTotal),
      OperationAbortingInProgress: this.getDeviceByPointIndex(this.panelDetail.HPUID, HyrdraulicPowerUnitPointIndex.OperationAbortingInProgress),
      CurrentRecipeControlTypeInExecution: this.getDeviceByPointIndex(this.panelDetail.HPUID, HyrdraulicPowerUnitPointIndex.CurrentRecipeControlTypeInExecution),
      ExpectedReturnVolume: this.getDeviceByPointIndex(this.panelDetail.HPUID, HyrdraulicPowerUnitPointIndex.ExpectedReturnVolume),
      OperationModeAlarmStatus: this.getDeviceByPointIndex(this.panelDetail.HPUID, HyrdraulicPowerUnitPointIndex.OperationModeAlarmStatus),
      TimeInSecondsRemainingToFinishCurrentRecipeStep: this.getDeviceByPointIndex(this.panelDetail.HPUID, HyrdraulicPowerUnitPointIndex.TimeInSecondsRemainingToFinishCurrentRecipeStep),
      ReturnFlowRate: this.getDeviceByPointIndex(this.panelDetail.HPUID, HyrdraulicPowerUnitPointIndex.ReturnsFlowRate),
      ExecuteOperationMode: this.getDeviceByPointIndex(this.panelDetail.HPUID, HyrdraulicPowerUnitPointIndex.ExecuteOperationMode)
    };
  }

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

    return null;
  }

  private updateLastZoneStatus(): void {
    let zonesInShift = this.wellInShift.wellZoneShiftRecords.filter(z => z.shiftStatus === null) ?? [];
    if (zonesInShift.length > 0) {
      zonesInShift.forEach((shiftZone, index) => {
        let subscription = this.realTimeService.GetRealtimeData(shiftZone.HcmId, InFORCEZone_HCM_PointIndex.ShiftStatus).subscribe(value => {
          if (value.Value === InforceShiftStatus.InProgress) {
            this.isLastShiftZone = index === (zonesInShift.length - 1) ? true : false;
          }
        });
        this.dataSubscriptions.push(subscription);
      });
    }
  }

  private getWellInShiftData() {
    const subscription = this.configService.getAutoShiftWellObject().subscribe((well: InforceWellShiftUIModel) => {
      this.wellInShift = well;
      this.updateLastZoneStatus();
      this.subscribeToOperationModeStatus();
      if (this.wellInShift && this.wellInShift.wellZoneShiftRecords) {
        for (let i = 0; i < this.wellInShift.wellZoneShiftRecords.length; i++) {//Each zone Tolerance  Unit
          this.toleranceData.ToleranceUnitInPercentage.push(this.getDeviceByPointIndex(this.wellInShift.wellZoneShiftRecords[i].HcmId, InFORCEZone_HCM_PointIndex.ToleranceUnitInPercentage));
        }
        this.setUpToleranceDataRealtimeSubscription(this.toleranceData.ToleranceUnitInPercentage);
        for (let i = 0; i < this.wellInShift.wellZoneShiftRecords.length; i++) {//Each zone returns tolerance high
          this.toleranceData.ReturnsToleranceHigh.push(this.getDeviceByPointIndex(this.wellInShift.wellZoneShiftRecords[i].HcmId, InFORCEZone_HCM_PointIndex.ReturnsToleranceHigh));
        }
        this.setUpToleranceDataRealtimeSubscription(this.toleranceData.ReturnsToleranceHigh);
        for (let i = 0; i < this.wellInShift.wellZoneShiftRecords.length; i++) {//Each zone returns tolerance low
          this.toleranceData.ReturnsToleranceLow.push(this.getDeviceByPointIndex(this.wellInShift.wellZoneShiftRecords[i].HcmId, InFORCEZone_HCM_PointIndex.ReturnsToleranceLow));
        }
        this.setUpToleranceDataRealtimeSubscription(this.toleranceData.ReturnsToleranceLow);
      }
      this.setUpChart();
    });
    this.dataSubscriptions.push(subscription);
  }

  private setUpToleranceDataRealtimeSubscription(toleranceArray): void {
    if (toleranceArray.length > 0) {
      toleranceArray.forEach((element) => {
        let deviceSubs = null;
        if (element) {
          deviceSubs = this.realTimeService
            .GetRealtimeData(element?.DeviceId, element?.DataPointIndex)
            .subscribe((d) => {
              if (d !== undefined && d !== null) {
                element.RawValue = d.Value;
              }
              this.dataSubscriptions.push(deviceSubs);
            });
        }
      });
    }
  }
  updateMinMaxReturns() {
    if (this.getExpectedReturnVolumeValue() > 0) {
      this.minReturns = this.getMinExpectedReturnVolume();
      this.maxReturns = this.getMaxExpectedReturnVolume();
    } else {
      this.minReturns = 0;
      this.maxReturns = 0;
    }
  }
  updateProgressBar() {
    const percentage = ((this.hpuDevice.TotalTimeRequiredInSeconds?.RawValue - this.hpuDevice.TotalTimeRemainingInSeconds?.RawValue) / this.hpuDevice.TotalTimeRequiredInSeconds?.RawValue) * 100;
    this.progress = percentage > 100 ? 100 : (percentage < 0 ? 0 : percentage);
  }

  setCommonClose() {
    const commonClose = this.well.LineToZoneMapping[0].CloseLine;
    this.commonCloseSensor = this.outputLineList.find(ol => ol.SensorName === commonClose);
  }

  getAllOutputLine() {
    this.outputLineList = [];
    this.well.PanelToLineMappings.forEach(Plm => {
      for (let i = 0; i < this.panelOutputSensorList.length; i++) {
        const outputLine = this.panelOutputSensorList[i];
        if (outputLine.SensorName === Plm.PanelConnection) {
          this.outputLineList.push({
            SensorName: Plm.DownholeLine,
            OutputPressurePointIndex: outputLine?.OutputPressurePointIndex,
            OutputSolenoidPointIndex: outputLine?.OutputSolenoidPointIndex
          });
        }
      }
    });
    if (this.outputLineList.length > 0) {
      this.setCommonClose();
    }
  }

  updateActiveZone(shiftingZoneId: number) {
    this.activeZone = this.wellInShift.wellZoneShiftRecords.find(zone => zone.zoneId === shiftingZoneId);
    this.openLineSensor = this.outputLineList.find(ol => ol.SensorName === this.activeZone.downholeLine);
    this.openLine = {
      device: this.getDeviceByPointIndex(this.panelDetail.HPUID, this.openLineSensor?.OutputPressurePointIndex),
      options: this.getPanelGaugeConfig(this.openLineSensor.SensorName)
    }
    if (this.well.ControlArchitectureId === INFORCE_WELL_ARCHITECTURE.TWO_N) {
      const closeLineIdx = this.well.LineToZoneMapping.findIndex(ol => ol.OpenLine === this.openLineSensor.SensorName);
      const closeLine = this.well.LineToZoneMapping[closeLineIdx].CloseLine;
      this.commonCloseSensor = this.outputLineList.find(ol => ol.SensorName === closeLine);
      this.commonClose = {
        device: this.getDeviceByPointIndex(this.panelDetail.HPUID, this.commonCloseSensor?.OutputPressurePointIndex),
        options: this.getPanelGaugeConfig(this.commonCloseSensor?.SensorName)
      };
    }
    this.detectScreenSize();
    this.setUpRealtimeSubscription();
  }

  updateCurrentValvePosition(currentValvePosition: any) {
    this.currentPosition = currentValvePosition?.current;
    this.targetPosition = currentValvePosition?.target;
  }

  // Reload well state
  reloadWellState() {
    this.store.dispatch(WELL_ACTIONS.WELL_LOAD());
  }

  fillInterventionMessage(operationModeAlarmStatus: number) {
    let inForceShiftRemaingTime = this.hpuDevice?.TotalTimeRemainingInSeconds?.RawValue;
    //refer hpu-80 for description
    let interventionMessageType: string = "";
    let interventionMessage: string = "";
    let interventionMessageActionTobeTaken: string = "";
    if ((operationModeAlarmStatus & 2) > 0) {
      interventionMessageType = "Error:";
      if (inForceShiftRemaingTime > 0)
        interventionMessage = "The return volume is above the <b>Tolerance High</b> set point.";
      else
        interventionMessage = "The <b>Maximum Shift Time</b> has expired and the return volume is above the <b>Tolerance High</b> set point.";
      interventionMessageActionTobeTaken = "Select from the following.";
    }
    else if ((operationModeAlarmStatus & 4) > 0) {
      interventionMessageType = "Warning:";
      if (inForceShiftRemaingTime > 0)
        interventionMessage = "The return volume is below the <b>Tolerance Low</b> set point.";
      else
        interventionMessage = "The <b>Maximum Shift Time</b> has expired and the return volume is below the <b>Tolerance Low</b> set point.";
      interventionMessageActionTobeTaken = "Wait for additional returns or select from the following.";
    }
    else if ((operationModeAlarmStatus & 8) > 0) {
      interventionMessageType = "Warning:";
      if (inForceShiftRemaingTime > 0)
        interventionMessage = "The rate of returns is above the <b>Stabilization Flow Rate</b> set point.";
      else
        interventionMessage = "The <b>Maximum Shift Time</b> has expired and rate of returns is above the <b>Stabilization Flow Rate</b> set point."
      interventionMessageActionTobeTaken = "Wait for additional returns or select from the following.";
    }

    return {
      interventionMessageType: interventionMessageType,
      interventionMessage: interventionMessage == "" ? "InFORCE Shifting input value required." : interventionMessage,
      actionTobeTaken: interventionMessageActionTobeTaken,
      showNextSequenceBtn: !this.isLastShiftZone
    };
  }

  private setupKeyIndicators() {
    this.supplyPressure = {
      device: this.getDeviceByPointIndex(this.panelDetail.HPUID, HyrdraulicPowerUnitPointIndex.SupplyPressure),
      options: this.getPanelGaugeConfig('Supply Pressure')
    };
    this.openLine = {
      device: this.getDeviceByPointIndex(this.panelDetail.HPUID, this.openLineSensor?.OutputPressurePointIndex),
      options: this.getPanelGaugeConfig(this.commonCloseSensor?.SensorName)
    };
    this.commonClose = {
      device: this.getDeviceByPointIndex(this.panelDetail.HPUID, this.commonCloseSensor?.OutputPressurePointIndex),
      options: this.getPanelGaugeConfig(this.commonCloseSensor?.SensorName)
    };
  }

  private doUserIntervention(deviceId: number, userIntervention: number): void {
    const wellWriteVar = new WriteToServerDataModel();
    wellWriteVar.DeviceId = deviceId;
    wellWriteVar.PointIndex = HyrdraulicPowerUnitPointIndex.AutoShiftUserIntervationCommand;
    wellWriteVar.PointName = '';
    wellWriteVar.Value = userIntervention;
    wellWriteVar.WriteToServerCommandEnum = 1;
    this.configService.WriteToServer(wellWriteVar).subscribe();
  }
  private OperationModeAlarmLast: number = 0;
  private subscribeToOperationModeStatus(): void {
    let hpuDeviceId = this.inforcedevices.find(d => d.DeviceName === "HPU")?.DeviceId;
    let subscription = this.realTimeService.GetRealtimeData(hpuDeviceId, HyrdraulicPowerUnitPointIndex.OperationModeAlarmStatus).subscribe(value => {

      if (this.inFORCEShiftStatus === OperationMode.AutoShift) {
        if (value != null && ((value.Value & 2) > 0 || (value.Value & 4) > 0 || (value.Value & 8) > 0)) {

          if (this.OperationModeAlarmLast != 0 && this.OperationModeAlarmLast != value.Value) {
            this.userInterventionDlgVisible = false;
            this.gwModalService.closeModal();
          }

          // Show message here
          if (!this.userInterventionDlgVisible) {
            const interventionMessgae = this.fillInterventionMessage(value.Value);
            this.gwModalService.openAdvancedDialog(
              "User Intervention",
              ButtonActions.None,
              InforceUserInterventionComponent,
              interventionMessgae,
              (result) => {
                if (result && result != null) {
                  this.doUserIntervention(hpuDeviceId, result);
                  this.userInterventionDlgVisible = false;
                  this.gwModalService.closeModal();
                }
              },
              '350px'
            );
            this.OperationModeAlarmLast = value.Value;
            this.userInterventionDlgVisible = true;
          }
        }
        else if (value != null && value.Value == 0) {
          this.gwModalService.dialog.closeAll();
          this.userInterventionDlgVisible = false;
        }
      }
    });
    this.dataSubscriptions.push(subscription);
  }

  private subscribeToInforceShiftStatus() {
    const subscription = this.realTimeService.GetRealtimeData(this.panelDetail.HPUID, HyrdraulicPowerUnitPointIndex.CurrentOperationMode).subscribe(dataPoint => {
      if (dataPoint != undefined && dataPoint != null) {
        this.inFORCEShiftStatus = dataPoint.Value;
        this.isShiftInProgress = (dataPoint.Value !== InforceShiftStatus.Idle) ? true : false;
        if (!this.well) {
          this.router.navigate(['/Home']);
        } else {
          if (!this.isShiftInProgress && !this.initialLoad) {
            this.shiftAbortInProgress = false;
            this.reloadWellState();
            this.router.navigate(['/Home']);
          } else {
            // this.setUpChart();
            this.getParamterList();
            this.initialLoad = false;
          }
        }
      }
    });
    this.dataSubscriptions.push(subscription);
  }


  private setUpRealtimeSubscription(): void {
    if (this.deviceIndexArray.length > 0) {
      this.deviceIndexArray.forEach((element) => {
        let deviceSubs = null;
        deviceSubs = this.realTimeService
          .GetRealtimeData(element.DeviceId, element.DataPointIndex)
          .subscribe((d) => {
            if (d !== undefined && d !== null) {
              element.RawValue = d.Value;
              if (element.DataPointIndex === HyrdraulicPowerUnitPointIndex.ExpectedReturnVolume) {
                this.updateMinMaxReturns();
              }
            }
            this.dataSubscriptions.push(deviceSubs);
          });
      });
    }
  }

  private subscribeToInforceDevices(): void {
    const subscription = this.InforceDeviceState$.subscribe(
      (state: IInforceDeviceState) => {
        if (state !== undefined) {
          if (state.isLoaded === false && !StateUtilities.hasErrors(state)) {
            this.store.dispatch(INFACTIONS.INFORCEDEVICES_LOAD());
          } else {
            Object.assign(this.inforcedevices, state.inforcedevices);
            this.panelDetail = this.getHPUDeviceDetail();
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
            this.initWells();
            this.initDeviceDataPoints();
            this.getWellInShiftData();
            //this.initDataSources();
          }
        }
      }
    );

    this.dataSubscriptions.push(subscription);
  }

  postCallDeviceDataPoints(): void {
    if (this.panelDetail) {
      this.setupKeyIndicators();
      this.detectScreenSize();
      this.setDataPointList();
      this.subscribeToInforceShiftStatus();
      this.setUpRealtimeSubscription();
      let progressBarSubscription = interval(1000).subscribe(() => {
        if (this.hpuDevice) {
          this.updateProgressBar();
        }
      });
      this.dataSubscriptions.push(progressBarSubscription);
    }
  }

  postCallGetPointTemplates(): void {
    if (this.panelDetail) {
      this.getDeviceByPointIndex(this.panelDetail.HPUID, HyrdraulicPowerUnitPointIndex.ReturnsFlowmeterTotal);
      this.setUpRealtimeSubscription();
    }
  }

  postCallGetWells(): void {
    this.activatedRoute.params.subscribe(param => {
      if (param) {
        this.well = this.wellEnity.find(w => w.WellId === parseInt(param.wellId));
        if (this.well) {
          this.initPointTemplates(this.well.WellDeviceId);
          this.getAllOutputLine();
        }
      }
    });
  }

  postCallGetPanelConfigurationCommon(): void {
    const numberOfOutputs = (this.panelConfigurationCommonState.panelConfigurationCommon as InforcePanelUIModel).HydraulicOutputs;
    this.panelOutputSensorList = OutputPressureSensors.slice(0, numberOfOutputs);
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
    super.ngOnInit();
    window.scroll(0, 0);
    this.initPanelConfigurationCommon();
    this.subscribeToInforceDevices();
    this.subscribeToUnitSystems();
  }


}

interface IViewShiftData {
  SupplyPressure: DataPointDefinitionModel;
  PumpDischargePressure: DataPointDefinitionModel; // Module2542Id
  TotalTimeRequiredInSeconds: DataPointDefinitionModel;
  TotalTimeRemainingInSeconds: DataPointDefinitionModel;
  CurrentOperationMode: DataPointDefinitionModel;
  ReturnsFlowmeterTotal: DataPointDefinitionModel;
  OperationAbortingInProgress: DataPointDefinitionModel;
  CurrentRecipeControlTypeInExecution: DataPointDefinitionModel;
  ExpectedReturnVolume: DataPointDefinitionModel;
  OperationModeAlarmStatus: DataPointDefinitionModel;
  TimeInSecondsRemainingToFinishCurrentRecipeStep: DataPointDefinitionModel;
  ReturnFlowRate: DataPointDefinitionModel;
  ExecuteOperationMode: DataPointDefinitionModel;

}

interface IToleranceData {
  ToleranceUnitInPercentage: DataPointDefinitionModel[];
  ReturnsToleranceHigh: DataPointDefinitionModel[];
  ReturnsToleranceLow: DataPointDefinitionModel[];
}

interface Parameter {
  key: string,
  value: DataPointDefinitionModel,
  showDigit?: boolean
}

