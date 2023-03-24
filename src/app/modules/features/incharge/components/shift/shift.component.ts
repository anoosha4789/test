import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';
import { ActivatedRoute, Router } from '@angular/router';
import { GatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { CablePowerConverstion, CardDataPointIndex, UIChartColors, UICommon, ZoneDataPointIndex } from '@core/data/UICommon';
import { DataSourceFacade } from '@core/facade/dataSourceFacade.service';
import { DeviceDataPointsFacade } from '@core/facade/deviceDataPointsFacade.service';
import { PointTemplatesFacade } from '@core/facade/pointTemplatesFacade.service';
import { WellFacade } from '@core/facade/wellFacade.service';
import { DataPointDefinitionModel, DataPointValueDataType } from '@core/models/webModels/DataPointDefinition.model';
import { BuiltInDeviceType } from '@core/models/webModels/DeviceInfo.model';
import { InchargeValveCoefficientDataModel } from '@core/models/webModels/InchargeValveCoefficient.model';
import { PointTemplatesExtensionUIModel } from '@core/models/webModels/PointTemplatesExtensionUIModel.model';
import { WriteToServerDataModel } from '@core/models/webModels/WriteToServerData.model';
import { ConfigurationService } from '@core/services/configurationService.service';
import { RealTimeDataSignalRService } from '@core/services/realTimeDataSignalR.service';
import { InchargeService } from '@features/incharge/services/incharge.service';
import { Store } from '@ngrx/store';
import { ChartOptions } from '@shared/gateway-chart/multiaxis-chart/multiaxis-chart.model';
import { ButtonActions } from '@shared/gateway-dialogs/components/gateway-advanced-dialog/gateway-advanced-dialog.component';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { ServerDataType, SetServerComponentData, SetServerValueComponent } from '@shared/monitoring/components/setservervalue/setservervalue.component';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { String } from 'typescript-string-operations';

@Component({
  selector: 'gw-incharge-shift',
  templateUrl: './shift.component.html',
  styleUrls: ['./shift.component.scss']
})
export class ShiftComponent extends GatewayPanelBase implements OnInit, OnDestroy {

  @ViewChild('actuationPointsPanel')
  actuationPointsPanel: MatExpansionPanel;

  @ViewChild('pumpLimitsPanel')
  pumpLimitsPanel: MatExpansionPanel;

  @ViewChild('surfacePowerSupplyPanel')
  surfacePowerSupplyPanel: MatExpansionPanel;

  @ViewChild('calibrationPanel')
  calibrationPanel: MatExpansionPanel;

  //--------------------- CONSTANTS------------------------
  // Special Data Points for SET values
  SPECIAL_PRMCONTROL_DATAPOINT_INDEX = 10;
  SPECIAL_CABLEPOWER_CONTACT_RELAY_DATAPOINT_INDEX = 11;

  // Data Points for Shift Calibration changes
  TotalVolumePumpedDataPointIndex: number = 12;
  TotalVolumeToPumpDataPointIndex: number = 25;

  // Data Points for Surface Power Supply Unit Settings
  SPECIAL_PSU_ERRORCODE: number = 21;
  ResetPSUDataPointIndex: number = 20;

  // Data Points for Motor Status Words
  SPECIAL_MOTOR_STATUS_DURING_ACTUATION = 14;
  SPECIAL_MOTOR_EVENTS_WORD = 17;
  SPECIAL_MOTOR_ERROR_WORD = 18;

  // Data Point for Downlink Status Word
  SPECIAL_DOWNLINK_STATUS: number = 2;
  //-------------------------------------------------------

  wellId: number;
  wellZoneId: number;
  inchargeDeviceId: number;
  actuationDataPoints: DataPointDefinitionModel[];
  pumpLimitDataPoints: DataPointDefinitionModel[];
  powerSupplyDataPoints: DataPointDefinitionModel[];
  calibrationDataPoints: DataPointDefinitionModel[];
  motorControlStatusDevice: DataPointDefinitionModel;
  currentOpeningPercentgeDevice: DataPointDefinitionModel;
  targetOpeningPercentageDevice: DataPointDefinitionModel;
  pumpedVolumeDevice: DataPointDefinitionModel;
  targetPumpVolumeDevice: DataPointDefinitionModel;
  shiftStatusDevice: DataPointDefinitionModel;
  calibrationStatusDevice: DataPointDefinitionModel;
  motorEventsWordDevice: DataPointDefinitionModel;
  motorErrorWordDevice: DataPointDefinitionModel;
  resetPSUDevice: DataPointDefinitionModel;
  diagnosticCard: DataPointDefinitionModel = new DataPointDefinitionModel();

  public chartId: string = "inchargeshift";
  multi_axis_series: any;
  inChargeCoffiecients: any;
  private shiftDetailsSubscriptions: Subscription[] = [];
  private dataSubscriptions: Subscription[] = [];

  pumpOpenPercentage: number;
  pumpVolume: number;
  pumpProgress: number;
  toolTitle: string;
  shiftStatus: string = "Start";
  calibrationStaus: string = "Start Calibration";

  expandPanels: boolean[] = [];
  deviceIndexArray: DataPointDefinitionModel[];
  inchargeMonitoringTool: InChargeShiftPanel[];

  filterOpenPercentages: string[] = [];
  isInValidVolumePercentage: boolean = false;
  loadingMotorStatus = false;

  constructor(protected store: Store,
    private wellsFacade: WellFacade,
    private dataSourceFacade: DataSourceFacade,
    private dataPointFacade: DeviceDataPointsFacade,
    private pointTemplateFacade: PointTemplatesFacade,
    private inchargeService: InchargeService,
    private realTimeService: RealTimeDataSignalRService,
    private configurationService: ConfigurationService,
    private gwModalService: GatewayModalService,
    protected activatedRoute: ActivatedRoute) {
    super(store, null, wellsFacade, dataSourceFacade, null, dataPointFacade, pointTemplateFacade);
  }

  private collapsePanels(): void {
    for (let i = 0; i < this.expandPanels.length; i++)
      this.expandPanels[i] = false;
  }

  togglePanel(panel: number) {
    if (this.motorControlStatusDevice && this.motorControlStatusDevice.RawValue === 0 && panel < 3)
      return;

    // this.collapsePanels();
    this.expandPanels[panel] = true;
  }

  setPanelExpansion(): void {
    if (this.motorControlStatusDevice && this.motorControlStatusDevice.RawValue === 1)
      this.expandPanels[0] = true;
    else
      this.expandPanels[3] = true;
  }

  updateMotorControlStatus() {
    this.loadingMotorStatus = true;
    const writeVar = new WriteToServerDataModel();
    writeVar.DeviceId = this.motorControlStatusDevice.DeviceId;
    writeVar.PointIndex = this.motorControlStatusDevice.DataPointIndex;
    writeVar.PointName = this.motorControlStatusDevice.TagName;
    writeVar.Value = this.motorControlStatusDevice.RawValue == 1 ? inCHARGEToolPowerControlType.TURN_POWER_OFF : inCHARGEToolPowerControlType.TURN_POWER_ON;
    writeVar.WriteToServerCommandEnum = 1;
    writeVar.Unit = this.motorControlStatusDevice.UnitSymbol;
    this.configurationService.WriteToServer(writeVar).subscribe((d) => { });
  }

  setServerValue(dataPoint: InChargeShiftPoints) {
    let serverData: SetServerComponentData = new SetServerComponentData();
    serverData.fieldName = "Value";
    serverData.device = dataPoint.deviceDataPoint;

    switch (dataPoint.point.DevicePointIndex) {
      case this.SPECIAL_PRMCONTROL_DATAPOINT_INDEX:
        serverData.serverDataType = ServerDataType.SELECT;
        serverData.selectValues = [{ key: 0, value: "OFF" }, { key: 1, value: "ON" }];
        break;

      case this.SPECIAL_CABLEPOWER_CONTACT_RELAY_DATAPOINT_INDEX:
        serverData.serverDataType = ServerDataType.SELECT;
        serverData.selectValues = [{ key: 0, value: "OFF" }, { key: 1, value: "ON" }];
        break;

      default:
        serverData.min = dataPoint.point.MinValue;
        serverData.max = dataPoint.point.MaxValue;
        serverData.precision = 2;
        break;
    }

    let dialogSetServerValue = this.gwModalService.openDialogInsideModal(
      dataPoint.point.Description,
      ButtonActions.None,
      SetServerValueComponent,
      serverData,
      () => dialogSetServerValue.close(),
      '350px',
    );
  }

  getCalibrationDate(dataValue: number): number {
    return UICommon.convertOADate(dataValue);
  }

  private checkIfValidVolumePercentage(value: string) {
    this.isInValidVolumePercentage = (value === undefined || value.trim() === "");
    if (!this.isInValidVolumePercentage) {
      if (parseInt(value) < 0)
        this.isInValidVolumePercentage = true;
    }
  }

  filterOptions(event): void {
    this.checkIfValidVolumePercentage(event.target.value);
    this.filterOpenPercentages = this.inChargeCoffiecients.SelectableOpenPercentages
      .filter(option => option.toString().indexOf(event.target.value) === 0) ?? [];
  }

  openPercentageChanged(option): void {
    let value = parseFloat(option.value);
    if (this.targetOpeningPercentageDevice.RawValue != value) {
      const writeVar = new WriteToServerDataModel();
      writeVar.DeviceId = this.targetOpeningPercentageDevice.DeviceId;
      writeVar.PointIndex = this.targetOpeningPercentageDevice.DataPointIndex;
      writeVar.PointName = this.targetOpeningPercentageDevice.TagName;
      writeVar.Value = value;
      writeVar.WriteToServerCommandEnum = 1;
      writeVar.Unit = this.targetOpeningPercentageDevice.UnitSymbol;
      this.configurationService.WriteToServer(writeVar).subscribe((d) => { });
    }
  }

  setValve_TargetOpenPercentage(event): void {
    this.checkIfValidVolumePercentage(event.target.value);
    if (!this.isInValidVolumePercentage) {
      const writeVar = new WriteToServerDataModel();
      writeVar.DeviceId = this.targetOpeningPercentageDevice.DeviceId;
      writeVar.PointIndex = this.targetOpeningPercentageDevice.DataPointIndex;
      writeVar.PointName = this.targetOpeningPercentageDevice.TagName;
      writeVar.Value = parseFloat(event.target.value);
      writeVar.WriteToServerCommandEnum = 1;
      writeVar.Unit = this.targetOpeningPercentageDevice.UnitSymbol;
      this.configurationService.WriteToServer(writeVar).subscribe((d) => { });
    }
  }

  startStopShift(): void {
    if (this.shiftStatusDevice.RawValue == 1) {
      this.gwModalService.openDialog(
        'Do you want to abort the shift?',
        () => {
          this.doShiftOperation();
          this.gwModalService.closeModal();
        },
        () => this.gwModalService.closeModal(),
        'Info',
        null,
        true,
        "Yes",
        "No"
      );
    }
    else
      this.doShiftOperation();
  }

  private doShiftOperation(): void {
    const writeVar = new WriteToServerDataModel();
    writeVar.DeviceId = this.shiftStatusDevice.DeviceId;
    writeVar.PointIndex = this.shiftStatusDevice.DataPointIndex;
    writeVar.PointName = this.shiftStatusDevice.TagName;
    writeVar.Value = this.shiftStatusDevice.RawValue == 1 ? 0 : 1;
    writeVar.WriteToServerCommandEnum = 1;
    writeVar.Unit = this.shiftStatusDevice.UnitSymbol;
    // GATE - 1385  shift/calibration process message 
    if (this.calibrationStatusDevice.RawValue === 1) {
      this.doPumpCalibration();
    } else {
      this.configurationService.WriteToServer(writeVar).subscribe((d) => { });
    }
  }

  startStopPumpCalibration(): void {
    if (this.calibrationStatusDevice.RawValue == 1) {
      this.gwModalService.openDialog(
        'Do you want to abort the Pump Calibration?',
        () => {
          this.doPumpCalibration();
          this.gwModalService.closeModal();
        },
        () => this.gwModalService.closeModal(),
        'Info',
        null,
        true,
        "Yes",
        "No"
      );
    }
    else
      this.doPumpCalibration();
  }

  private doPumpCalibration(): void {
    const writeVar = new WriteToServerDataModel();
    writeVar.DeviceId = this.calibrationStatusDevice.DeviceId;
    writeVar.PointIndex = this.calibrationStatusDevice.DataPointIndex;
    writeVar.PointName = this.calibrationStatusDevice.TagName;
    writeVar.Value = this.calibrationStatusDevice.RawValue == 1 ? 0 : 1;
    writeVar.WriteToServerCommandEnum = 1;
    writeVar.Unit = this.calibrationStatusDevice.UnitSymbol;
    this.configurationService.WriteToServer(writeVar).subscribe((d) => { });
  }

  resetPSU(): void {
    const writeVar = new WriteToServerDataModel();
    writeVar.DeviceId = this.resetPSUDevice.DeviceId;
    writeVar.PointIndex = this.resetPSUDevice.DataPointIndex;
    writeVar.PointName = this.resetPSUDevice.TagName;
    writeVar.Value = this.resetPSUDevice.RawValue == 1 ? 0 : 1;
    writeVar.WriteToServerCommandEnum = 1;
    writeVar.Unit = this.resetPSUDevice.UnitSymbol;
    this.configurationService.WriteToServer(writeVar).subscribe((d) => { });
  }

  private getZoneDataPoint(pointIndex: number): DataPointDefinitionModel {
    let zoneDataPoint = null;
    let wellInx = this.wellEnity.findIndex(w => w.WellId === this.wellId) ?? -1;
    if (wellInx != -1) {
      let zoneIndex = this.wellEnity[wellInx].Zones.findIndex(z => z.ZoneId === this.wellZoneId) ?? -1;
      if (zoneIndex != -1) {
        let dataPointInx = this.datapointdefinitions.findIndex(d => d.DeviceId === this.wellEnity[wellInx].Zones[zoneIndex].ZoneDeviceId
          && d.DataPointIndex === pointIndex) ?? -1;
        if (dataPointInx != -1) {
          zoneDataPoint = _.cloneDeep(this.datapointdefinitions[dataPointInx]);
        }
      }
    }

    return zoneDataPoint;
  }

  private setPumpProgress(): void {
    if (this.targetPumpVolumeDevice && this.targetPumpVolumeDevice.RawValue > 0)
      this.pumpProgress = Math.floor((this.pumpedVolumeDevice.RawValue / this.targetPumpVolumeDevice.RawValue) * 100);
  }

  private setUpZoneMotorPowerMonitoring(): void {
    this.motorControlStatusDevice = this.getZoneDataPoint(ZoneDataPointIndex.MotorControlBoardRunningStatus);
    if (this.motorControlStatusDevice != null) {
      let deviceSubs = this.realTimeService.GetRealtimeData(this.motorControlStatusDevice.DeviceId, this.motorControlStatusDevice.DataPointIndex)
        .subscribe((d) => {
          if (d !== undefined && d !== null) {
            this.motorControlStatusDevice.RawValue = d.Value;
            // Set Motor button status up Expanse Panels
            this.loadingMotorStatus = false;
            this.collapsePanels();
            this.setPanelExpansion();
          }
          this.dataSubscriptions.push(deviceSubs);
        });
    }
  }

  private setUpCurrentOpeningPercentage(): void {
    this.currentOpeningPercentgeDevice = this.getZoneDataPoint(ZoneDataPointIndex.CurrentValveOpeningPercentage);
    if (this.currentOpeningPercentgeDevice != null) {
      let deviceSubs = this.realTimeService.GetRealtimeData(this.currentOpeningPercentgeDevice.DeviceId, this.currentOpeningPercentgeDevice.DataPointIndex)
        .subscribe((d) => {
          if (d !== undefined && d !== null) {
            this.currentOpeningPercentgeDevice.RawValue = d.Value;
          }
          this.dataSubscriptions.push(deviceSubs);
        });
    }
  }

  private setUpTargetOpeningPercentage(): void {
    this.targetOpeningPercentageDevice = this.getZoneDataPoint(ZoneDataPointIndex.TargetValveOpeiningPercentage);
    if (this.targetOpeningPercentageDevice != null) {
      let deviceSubs = this.realTimeService.GetRealtimeData(this.targetOpeningPercentageDevice.DeviceId, this.targetOpeningPercentageDevice.DataPointIndex)
        .subscribe((d) => {
          if (d !== undefined && d !== null) {
            this.targetOpeningPercentageDevice.RawValue = d.Value;
          }
          this.dataSubscriptions.push(deviceSubs);
        });
    }
  }

  private setUpShiftStatus(): void {
    this.shiftStatusDevice = this.getZoneDataPoint(ZoneDataPointIndex.AutoShiftStatus);
    if (this.shiftStatusDevice != null) {
      let deviceSubs = this.realTimeService.GetRealtimeData(this.shiftStatusDevice.DeviceId, this.shiftStatusDevice.DataPointIndex)
        .subscribe((d) => {
          if (d !== undefined && d !== null) {
            this.shiftStatusDevice.RawValue = d.Value;
            this.shiftStatus = d.Value == 1 ? "Stop" : "Start";
          }
          this.dataSubscriptions.push(deviceSubs);
        });
    }
  }

  private setUpCalibrationStatus(): void {
    this.calibrationStatusDevice = this.getZoneDataPoint(ZoneDataPointIndex.StartPumpCalibration);
    if (this.calibrationStatusDevice != null) {
      let deviceSubs = this.realTimeService.GetRealtimeData(this.calibrationStatusDevice.DeviceId, this.calibrationStatusDevice.DataPointIndex)
        .subscribe((d) => {
          if (d !== undefined && d !== null) {
            this.calibrationStatusDevice.RawValue = d.Value;
            this.calibrationStaus = d.Value == 1 ? "Stop Calibration" : "Start Calibration";
          }
          this.dataSubscriptions.push(deviceSubs);
        });
    }
  }

  private setUpToPumpVolume(): void {
    let dataPointInx = this.datapointdefinitions.findIndex(d => d.DeviceId === this.inchargeDeviceId && d.DataPointIndex === this.TotalVolumeToPumpDataPointIndex) ?? -1;
    if (dataPointInx != -1) {
      this.targetPumpVolumeDevice = _.cloneDeep(this.datapointdefinitions[dataPointInx]);
      let deviceSubs = this.realTimeService
        .GetRealtimeData(this.targetPumpVolumeDevice.DeviceId, this.targetPumpVolumeDevice.DataPointIndex)
        .subscribe((d) => {
          if (d !== undefined && d !== null) {
            this.targetPumpVolumeDevice.RawValue = d.Value;
          }
          this.dataSubscriptions.push(deviceSubs);
        });
    }
  }

  private setUpPumpedVolume(): void {
    let dataPointInx = this.datapointdefinitions.findIndex(d => d.DeviceId === this.inchargeDeviceId && d.DataPointIndex === this.TotalVolumePumpedDataPointIndex) ?? -1;
    if (dataPointInx != -1) {
      this.pumpedVolumeDevice = _.cloneDeep(this.datapointdefinitions[dataPointInx]);
      let deviceSubs = this.realTimeService
        .GetRealtimeData(this.pumpedVolumeDevice.DeviceId, this.pumpedVolumeDevice.DataPointIndex)
        .subscribe((d) => {
          if (d !== undefined && d !== null) {
            this.pumpedVolumeDevice.RawValue = Math.abs(d.Value);
            this.setPumpProgress();
          }
          this.dataSubscriptions.push(deviceSubs);
        });
    }
  }

  private setUpCardStatus(cardDeviceId: number): void {

    let dataPointIdx = this.datapointdefinitions.findIndex(d => d.DeviceId === cardDeviceId && d.DataPointIndex === CardDataPointIndex.CommStatus) ?? -1;
    if (dataPointIdx != -1) {
      this.diagnosticCard = _.cloneDeep(this.datapointdefinitions[dataPointIdx]);
      let deviceSubs = this.realTimeService
        .GetRealtimeData(this.diagnosticCard.DeviceId, this.diagnosticCard.DataPointIndex)
        .subscribe((d) => {
          if (d !== undefined && d !== null) {
            this.diagnosticCard.RawValue = d.Value;
          }
          this.dataSubscriptions.push(deviceSubs);
        });
    }

  }

  private setupResetPSUDevice(): void {
    let deviceIndex = this.devices.findIndex(d => d.Id === this.inchargeDeviceId) ?? -1;
    if (deviceIndex != -1) {
      let ownerDeviceId = this.devices[deviceIndex].OwnerId;
      let inxPowerSupplyInx = this.devices.findIndex(d => d.OwnerId === ownerDeviceId && d.Name === "PowerSupplyModule") ?? -1;
      if (inxPowerSupplyInx != -1) {
        this.resetPSUDevice = this.dataPointFacade.getDeviceByPoint(this.devices[inxPowerSupplyInx].Id, this.ResetPSUDataPointIndex);
        let deviceSubs = this.realTimeService.GetRealtimeData(this.resetPSUDevice.DeviceId, this.resetPSUDevice.DataPointIndex)
          .subscribe((d) => {
            if (d !== undefined && d !== null) {
              this.resetPSUDevice.RawValue = d.Value;
            }
            this.dataSubscriptions.push(deviceSubs);
          });
      }
    }
  }

  private setUpInChargeCard(): void {
    if (!this.datapointdefinitions || this.datapointdefinitions.length == 0)
      return;

    let inChargeTool = this.toolConnectionEntity.find(tc => tc.ZoneId === this.wellZoneId && tc.PortingId === -1);  // InCharge Tool
    if (inChargeTool) {
      this.wellId = inChargeTool.WellId;
      this.toolTitle = String.Format(" > {0} > {1}", inChargeTool.WellName, inChargeTool.ZoneName);
      let inxChannel = this.dataSourcesEntity.findIndex(c => c.Channel.IdCommConfig === inChargeTool.ChannelId) ?? -1;
      if (inxChannel != -1) {
        let card = this.dataSourcesEntity[inxChannel].Cards.find(c => c.DeviceId === inChargeTool.CardDeviceId);
        if (card) {
          this.setUpCardStatus(card.DeviceId); // To Get Card Status
          let gauge = card.Gauges.find(g => g.DeviceId === inChargeTool.DeviceId);
          if (gauge) {
            this.getCoefficeintFileData(gauge);
          }
        }
      }

      this.initShiftPointTemplates();  // Shift
      this.setUpZoneMotorPowerMonitoring();
      this.setUpCurrentOpeningPercentage();
      this.setUpTargetOpeningPercentage();
      this.setUpPumpedVolume();
      this.setUpToPumpVolume();
      this.setUpShiftStatus();
      this.setUpCalibrationStatus();
      this.setupResetPSUDevice();
    }
  }

  private getCoefficeintFileData(gauge) {
    if (gauge.InCHARGECoefficientFileContent) {
      this.inChargeCoffiecients = (gauge.InCHARGECoefficientFileContent) as InchargeValveCoefficientDataModel;
      this.pumpOpenPercentage = this.inChargeCoffiecients.SelectableOpenPercentages[0];
      this.filterOpenPercentages = this.inChargeCoffiecients.SelectableOpenPercentages;
    }
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
            }
            this.shiftDetailsSubscriptions.push(deviceSubs);
          });
      });
    }
  }

  private checkSpecialDataPoints(deviceTypeId: number, dataPointIndex: number): boolean {
    let bIsSpecial = false;
    switch(deviceTypeId) {
      case BuiltInDeviceType.SureSENSInChargeTool:
        if (dataPointIndex == this.SPECIAL_MOTOR_STATUS_DURING_ACTUATION
          || dataPointIndex == this.SPECIAL_MOTOR_EVENTS_WORD
          || dataPointIndex == this.SPECIAL_MOTOR_ERROR_WORD)
          bIsSpecial = true;
        break;

      case BuiltInDeviceType.InChargePowerSupplyModule:
        if (dataPointIndex == this.SPECIAL_PRMCONTROL_DATAPOINT_INDEX
          || dataPointIndex == this.SPECIAL_CABLEPOWER_CONTACT_RELAY_DATAPOINT_INDEX
          || dataPointIndex == this.SPECIAL_PSU_ERRORCODE)
          bIsSpecial = true;
        break;

      case BuiltInDeviceType.InChargeHCMP:
        break;

      case BuiltInDeviceType.InterfaceCardDownlink:
        if (dataPointIndex == this.SPECIAL_DOWNLINK_STATUS)
          bIsSpecial = true;
        break;
    }

    return bIsSpecial;
  }

  private hasToolTip(deviceTypeId: number, dataPointIndex: number): boolean {
    let bhasToolTip = false;

    switch(deviceTypeId) {
      case BuiltInDeviceType.SureSENSInChargeTool:
        if (dataPointIndex == this.SPECIAL_MOTOR_EVENTS_WORD
          || dataPointIndex == this.SPECIAL_MOTOR_ERROR_WORD)
          bhasToolTip = true;
        break;

      case BuiltInDeviceType.InChargePowerSupplyModule:
        if (dataPointIndex == this.SPECIAL_PSU_ERRORCODE)
          bhasToolTip = true;
        break;

      case BuiltInDeviceType.InChargeHCMP:
        break;

      case BuiltInDeviceType.InterfaceCardDownlink:
        if (dataPointIndex == this.SPECIAL_DOWNLINK_STATUS)
          bhasToolTip = true;
        break;
    }

    return bhasToolTip;
  }

  getSpecialPointValue(devicePointIndex: number, value: number, isToolTip: boolean = false): string {
    let retVal = "";
    if (value != null) {
      switch (devicePointIndex) {
        case this.SPECIAL_MOTOR_STATUS_DURING_ACTUATION:
          retVal = this.inchargeService.ProcessMotorStausduringActuation(value);
          break;

        case this.SPECIAL_DOWNLINK_STATUS:
          retVal = isToolTip ? this.inchargeService.ProcessDownlinkStatusWord(value) : UICommon.getHexValue(value);
          break;

        case this.SPECIAL_MOTOR_ERROR_WORD:
          retVal = isToolTip ? this.inchargeService.ProcessMotorStatusErrorMessage(value) : value.toString();
          break;

        case this.SPECIAL_MOTOR_EVENTS_WORD:
          retVal = isToolTip ? this.inchargeService.ProcessMotorStatusEventMessage(value) : value.toString();
          break;

        case this.SPECIAL_PSU_ERRORCODE:
          retVal = isToolTip ? this.inchargeService.ProcessPSUErrorCode(value) : UICommon.getHexValue(value);
          break;

        default:
          retVal = CablePowerConverstion.GetValue(value);
          break;
      }
    }
    return retVal;
  }

  private setUpShiftDataChart(): void {
    let chartOptions = new ChartOptions();
    let points = _.cloneDeep(this.pointTemplatesEnity.find(pt => pt.deviceTypeId === UICommon.SHIFT_DEVICE_TYPEID));
    if (points && points.PointTemplates.length > 0) {
      let dataPoints = points.PointTemplates.filter(pt => pt.UIChart === true) ?? [];
      let chartPoints: InChargeShiftPoints[] = [];
      dataPoints.forEach(dataPoint => {
        let dp = this.dataPointFacade.getDeviceByPoint(this.inchargeDeviceId, dataPoint.DevicePointIndex);
        if (dp != null) {
          chartPoints.push(
            {
              point: dataPoint,
              deviceDataPoint: dp,
              isFloat: undefined,
              isSpecialCase: undefined,
              hasToolTip: undefined
            }
          );
        }
      });
      let chartPointDict = _.groupBy(chartPoints, point => point.deviceDataPoint.UnitSymbol);
      let yAxes: any[] = [];
      let dataSeries: any[] = [];
      let inxColor = 0;
      for (let unitLabel in chartPointDict) {
        yAxes.push(
          {
            label: unitLabel,
            unit: unitLabel
          }
        );
        let series = chartPointDict[unitLabel];
        series.forEach(point => {
          dataSeries.push(
            {
              deviceId: this.inchargeDeviceId,
              pointIndex: point.point.DevicePointIndex,
              label: String.Format("{0} ({1})", point.point.Description, point.deviceDataPoint.UnitSymbol ?? ""),
              unit: point.deviceDataPoint.UnitSymbol,
              decimalPoints: point.point.DecimalPoints,
              brush: UIChartColors.getChartBrush(inxColor++)
            }
          );
        });
      }

      if (yAxes.length > 0 && dataSeries.length > 0) {
        chartOptions.yAxes = yAxes;
        chartOptions.dataSeries = dataSeries;
      }
    }
    this.multi_axis_series = chartOptions;
  }

  private getDeviceForShiftDetail(deviceId: number, pointIndex: number): DataPointDefinitionModel {
    let dp = this.dataPointFacade.getDeviceByPoint(deviceId, pointIndex);
    if (dp != null) {
      this.deviceIndexArray.push(dp);
      return dp;
    }

    return new DataPointDefinitionModel();  // return empty DataPointDefinitionModel
  }

  private setUpShiftDetails(): void {
    this.unSubscribeShiftSubscriptions();
    this.inchargeMonitoringTool = [];
    this.deviceIndexArray = [];

    if (this.pointTemplatesEnity && this.pointTemplatesEnity.length > 0) {
      this.expandPanels = [];
      let points = _.cloneDeep(this.pointTemplatesEnity.find(pt => pt.deviceTypeId === UICommon.SHIFT_DEVICE_TYPEID));
      if (points) {
        let pointTemplates = _.groupBy(points.PointTemplates, point => point.PropertyCategoryId);
        for (let key in pointTemplates) {
          let pointTemplatesXXX: InChargeShiftPoints[] = [];
          let dataPointsXXX = pointTemplates[key].filter(p => p.UIPropertyList === true) ?? [];
          dataPointsXXX.forEach(dataPoint => {
            let deviceDataPoint = null;
            let isDate: boolean = false;
            let isSpecial: boolean = false;
            let hasToolTip: boolean = false;
            switch (dataPoint.DeviceTypeId) {
              case BuiltInDeviceType.SureSENSInChargeTool:
                deviceDataPoint = this.getDeviceForShiftDetail(this.inchargeDeviceId, dataPoint.DevicePointIndex);
                isSpecial = this.checkSpecialDataPoints(dataPoint.DeviceTypeId, deviceDataPoint.DataPointIndex);
                hasToolTip = this.hasToolTip(dataPoint.DeviceTypeId, deviceDataPoint.DataPointIndex);
                break;

              case BuiltInDeviceType.InChargePowerSupplyModule:
                let deviceIndex = this.devices.findIndex(d => d.Id === this.inchargeDeviceId) ?? -1;
                if (deviceIndex != -1) {
                  let ownerDeviceId = this.devices[deviceIndex].OwnerId;
                  let inxPowerSupplyInx = this.devices.findIndex(d => d.OwnerId === ownerDeviceId && d.Name === "PowerSupplyModule") ?? -1;
                  if (inxPowerSupplyInx != -1) {
                    deviceDataPoint = this.getDeviceForShiftDetail(this.devices[inxPowerSupplyInx].Id, dataPoint.DevicePointIndex);
                    isSpecial = this.checkSpecialDataPoints(dataPoint.DeviceTypeId, deviceDataPoint.DataPointIndex);
                    hasToolTip = this.hasToolTip(dataPoint.DeviceTypeId, deviceDataPoint.DataPointIndex);
                  }
                }
                break;

              case BuiltInDeviceType.InChargeHCMP:
                let inChargeWell = this.wellEnity.find(z => z.WellId == this.wellId);
                if (inChargeWell) {
                  let inChargeZone = inChargeWell.Zones.find(z => z.ZoneId === this.wellZoneId);
                  if (inChargeZone) {
                    deviceDataPoint = this.getDeviceForShiftDetail(inChargeZone.ZoneDeviceId, dataPoint.DevicePointIndex);
                    isDate = dataPoint.DevicePointIndex == 15 ? true : false;
                    isSpecial = this.checkSpecialDataPoints(dataPoint.DeviceTypeId, deviceDataPoint.DataPointIndex);
                    hasToolTip = this.hasToolTip(dataPoint.DeviceTypeId, deviceDataPoint.DataPointIndex);
                  }
                }
                break;

              case BuiltInDeviceType.InterfaceCardDownlink:
                let dwnLinkDeviceIndex = this.devices.findIndex(d => d.Id === this.inchargeDeviceId) ?? -1;
                if (dwnLinkDeviceIndex != -1) {
                  let ownerDeviceId = this.devices[dwnLinkDeviceIndex].OwnerId;
                  let inxDwnLinkInx = this.devices.findIndex(d => d.OwnerId === ownerDeviceId && d.Name === "DownlinkCommands") ?? -1;
                  if (inxDwnLinkInx != -1) {
                    deviceDataPoint = this.getDeviceForShiftDetail(this.devices[inxDwnLinkInx].Id, dataPoint.DevicePointIndex);
                    isSpecial = this.checkSpecialDataPoints(dataPoint.DeviceTypeId, deviceDataPoint.DataPointIndex);
                    hasToolTip = this.hasToolTip(dataPoint.DeviceTypeId, deviceDataPoint.DataPointIndex);
                  }
                }
                break;
            }

            if (deviceDataPoint != null) {
              pointTemplatesXXX.push({
                point: dataPoint,
                deviceDataPoint: deviceDataPoint,
                isFloat: (deviceDataPoint.DataType == DataPointValueDataType.Double64Bit || deviceDataPoint.DataType == DataPointValueDataType.Float32Bit) ? true : false,
                isDate: isDate,
                isSpecialCase: isSpecial,
                hasToolTip: hasToolTip
              });
            }
          });
          if (dataPointsXXX.length > 0) {
            this.inchargeMonitoringTool.push({
              name: dataPointsXXX[0].PropertyCategoryDescription,
              dataPoints: pointTemplatesXXX
            });
            this.expandPanels.push(false);
          }
        }

        this.setPanelExpansion();
        this.setUpRealtimeSubscription();
        this.setUpShiftDataChart();
      }
    }
  }

  postCallGetDataSources(): void {
    this.setUpInChargeCard();
  }

  postCallGetToolConnections(): void {
    this.setUpInChargeCard();
  }

  postCallDeviceDataPoints(): void {
    this.setUpInChargeCard();
  }

  postCallGetPointTemplates(): void {
    this.setUpShiftDetails();
  }

  getQueryParameters() {
    this.activatedRoute.queryParams.subscribe(
      params => {
        this.inchargeDeviceId = parseInt(params['deviceId']);
        this.wellZoneId = parseInt(params['zoneId']);
        this.initDeviceDataPoints();
        this.initToolConnections();
      }
    );
  }

  private unSubscribeShiftSubscriptions(): void {
    if (this.shiftDetailsSubscriptions != null && this.shiftDetailsSubscriptions.length > 0) {
      this.shiftDetailsSubscriptions.forEach(subscription => {
        if (subscription != null) {
          subscription.unsubscribe();
          subscription = null;
        }
      });
    }

    this.shiftDetailsSubscriptions = [];
  }

  ngOnDestroy(): void {
    this.unSubscribeShiftSubscriptions();
    if (this.dataSubscriptions != null && this.dataSubscriptions.length > 0) {
      this.dataSubscriptions.forEach(subscription => {
        if (subscription != null) {
          subscription.unsubscribe();
          subscription = null;
        }
      });
    }

    this.dataSubscriptions = [];
    super.ngOnDestroy();
  }

  ngOnInit(): void {

    super.ngOnInit();
    this.initWells();
    this.initDataSources();
    this.getQueryParameters();
  }
}

class InChargeShiftPanel {
  name: string;
  dataPoints: InChargeShiftPoints[];
}

class InChargeShiftPoints {
  point: PointTemplatesExtensionUIModel;
  deviceDataPoint: DataPointDefinitionModel;
  isFloat: boolean;
  isDate?: boolean;
  isSpecialCase: boolean;
  hasToolTip: boolean;
}

enum inCHARGEToolPowerControlType {
  POWER_OFF = 0,
  POWER_ON = 1,
  TURN_POWER_ON = 2,
  TURN_POWER_OFF = 3
}
