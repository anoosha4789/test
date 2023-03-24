import { Injectable } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { CommunicationChannelType, DATA_LOGGER_TYPE, DEFAULT_eFCV_POSITIONS, DEFAULT_eFCV_POSITIONS_STAGES, DeleteObject, PanelTypeList, UICommon, WELL_ARCHITECTURE_LIST, ZONE_VALVE_TYPE_LIST } from '@core/data/UICommon';
import { Store } from '@ngrx/store';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { String } from 'typescript-string-operations';

import { StateUtilities } from '@store/state/IState';
import { IPanelConfigurationCommonState } from '@store/state/panelConfigurationCommon.state';
import { IErrorHandlingSettingsState } from '@store/state/errorHandlingSettings.state';
import { IUnitSystemState } from '@store/state/unit-system.state';
import { IPanelDefaultState } from '@store/state/panel-default.state';
import { IShiftDefaultState } from '@store/state/shift-default.state';
import { IWellEntityState } from '@store/state/well.state';
import { ISerialChannelPropertiesState } from '@store/state/serialChannelProperties.state';
import { IDataSourceEntityState } from '@store/state/dataSources.state';
import { IRegisteredModbusMapState } from '@store/state/mapTemplateDetails.state';
import { IToolConnecionState } from '@store/state/tool-connection.state';
import { IPublishingEntityState } from '@store/state/publishing.state';
import { IToolTypeState } from '@store/state/toolType.state';
import { ISurefloEntityState } from '@store/state/sureflo.state';

import * as PANELCONFIG_COMMON_ACTIONS from '@store/actions/panelConfigurationCommon.action';
import * as ERROR_HANDLING_SETTINGS_STATE_ACTIONS from '@store/actions/errorHandlingSettings.action';
import * as UNITSYSTEM_ACTIONS from '@store/actions/unit-system.action';
import * as PANEL_DEFAULT_ACTIONS from '@store/actions/panel-default.action';
import * as ALARMS_AND_LIMITS_ACTIONS from '@store/actions/alarms-and-limits.action';
import * as SHIFT_DEFAULT_ACTIONS from '@store/actions/shift-default.action';
import * as SERIALCHANNELPROPERTIES_ACTIONS from '@store/actions/serialChannelProperties.action';
import * as WELL_ACTIONS from '@store/actions/well.entity.action';
import * as DATA_SOURCES_ACTIONS from '@store/actions/dataSources.entity.action';
import * as TOOLTYPE_ACTIONS from '@store/actions/toolType.action';
import * as TOOL_CONNECTIONS_ACTIONS from '@store/actions/tool-connection.entity.action';
import * as PUBLISHING_ACTIONS from '@store/actions/publishing.entity.action';
import * as MODBUS_PROTOCOL_ACTIONS from '@store/actions/modbusProtocol.action';
import * as MAPTEMPLATE_DETAILS_ACTIONS from '@store/actions/mapTemplateDetails.action';
import * as SUREFLO_ACTIONS from '@store/actions/sureflo.entity.action';
import * as FLOWMETER_TRASMITTER_ACTIONS from '@store/actions/flowmeterTransmitter.action';
import * as DATA_LOGGER_ACTIONS from '@store/actions/dataLogger.entity.action';
import * as LOGGER_TYPE_ACTIONS from '@store/actions/dataLoggerTypes.action';
import * as SIE_ACTIONS from '@store/actions/sie.entity.action';
import * as eFCV_POSITION_SETTINGS_STATE_ACTIONS from '@store/actions/efcvPositionSettings.action';

import { selectAllWells, selectWellState } from '@store/reducers/well.entity.reducer';
import { selectAllDataSources, selectDataSourcesState } from '@store/reducers/dataSources.entity.reducer';
import { selectAllToolConnections, selectToolConnetionState } from '@store/reducers/tool-connection.entity.reducer';
import { selectAllPublishings, selectPublishingState } from '@store/reducers/publishing.entity.reducer';
import { selectAllflowMeters, selectflowMetersState } from '@store/reducers/sureflo.entity.reducer';

import { DeleteObjectTypesEnum } from '@core/models/webModels/DeleteObjectTypesEnum';

import { ConfigurationService } from '@core/services/configurationService.service';
import { PanelConfigurationService } from '@core/services/panelConfiguration.service';
import { INFORCE_WELL_ARCHITECTURE, IWellArchitecture, WellService, ZONE_VALVE_TYPE } from '@core/services/well.service';
import { CommunicationChannelService } from '@core/services/communicationChannel.service';
import { ToolConnectionService } from '@core/services/tool-connection.service';
import { PublishingChannelService } from '@core/services/publishingChannel.service';
import { SurefloService } from '@core/services/sureflo.service';

import { SerialChannelProperty } from '@core/models/UIModels/SerialChannel.model';
import { ToolConnectionUIModel } from '@core/models/UIModels/tool-connection.model';
import { ErrorHandlingUIModel } from '@core/models/webModels/ErrorHandlingUI.model';
import { UnitSystemModel } from '@core/models/webModels/UnitSystem.model';
import { SureSENSGaugeDataModel } from '@core/models/webModels/SureSENSGaugeDataModel.model';
import { InCHARGEGaugeDataUIModel } from '@core/models/webModels/InCHARGEGaugeDataUIModel.model';
import { SureSENSGaugeDataUIModel } from '@core/models/webModels/SureSENSGaugeDataUIModel.model';
import { InterfaceCardDataUIModel } from '@core/models/webModels/InterfaceCardDataUIModell.model';
import { DataSourceUIModel } from '@core/models/UIModels/dataSource.model';
import { InchargeWellUIModel } from '@core/models/UIModels/Incharge.well.model';
import { InchargeZoneUIModel } from '@core/models/UIModels/incharge.zone.model';
import { SerialPortCommunicationChannelDataUIModel } from '@core/models/webModels/SerialPortCommunicationChannelDataUIModel.model';
import { GaugeTypeUIModel } from '@core/models/UIModels/models.model';
import { TcpIpCommunicationChannelDataUIModel } from '@core/models/webModels/TcpIpCommunicationChannelDataUIModel.model';
import { PublishingDataUIModel } from '@core/models/UIModels/dataPublishing.model';
import { IModbusProtocolState } from '@store/state/modbusProtocol.state';
import { ModbusProtocolModel } from '@core/models/UIModels/ModbusProtocol.model';
import { ModbusMapTemplateUIModel } from '@core/models/UIModels/modbusTemplate.model';
import { PanelConfigurationCommonModel, SureSENSPanelModel } from '@core/models/webModels/PanelConfigurationCommon.model';

import { PanelConfigurationCommonUIModel } from '@core/models/UIModels/panel-configuration-common.model';
import { SureFLOFlowMeterUIModel, WellFlowTypes } from '@core/models/UIModels/sureflo.model';
import { FlowMeterTypes, SureFLOFlowMeter } from '@core/models/webModels/SureFLODataModel.model';
import { SureFLO298UIFlowMeterUIModel } from '@core/models/UIModels/sureflo-flowmeter-model';
import { SureFLO298ExUIFlowMeterUIModel } from '@core/models/UIModels/sureflo-ex-flowmeter-model';
import { InforceWellUIModel } from '@core/models/UIModels/InforceWell.model';
import { IZoneValveType } from '@core/models/UIModels/ValveType.model';
import { InforcePanelUIModel } from '@core/models/UIModels/inforce-panel-config-common.model';
import { AlarmsAndLimitsUIModel, FlowmeterTransmitterUIModel, PanelDefaultUIModel } from '@core/models/UIModels/panel-default.model';
import { ShiftDefaultUIModel } from '@core/models/UIModels/shift-default.model';
import { PanelDefaultService } from '@core/services/panel-default.service';
import { ShiftDefaultService } from '@core/services/shift-default.service';
import { InforceZoneUIModel } from '@core/models/UIModels/InforceZone.model';
import { ReturnsBasedShiftDefaultsModel } from '@core/models/webModels/ReturnsBasedShiftDefaults.model';
import { TimeBasedShiftDefaultsModel } from '@core/models/webModels/TimeBasedShiftDefaults.model';
import { IAlarmsAndLimitsState } from '@store/state/alarms-and-limits.state';
import { AlarmService } from '@core/services/alarm.service';
import { IFlowmeterTransmitterState } from '@store/state/flowmeterTransmitter.state';
import { selectAllDataLoggers, selectDataLoggerState } from '@store/reducers/dataLogger.entity.reducer';
import { IDataLoggerEntityState } from '@store/state/dataLogger.entity.state';
import { DataLoggerUIModel } from '@core/models/UIModels/dataLogger.model';
import { ILoggerTypeState } from '@store/state/dataLoggerTypes.state';
import { DataLoggerTypesDataModel } from '@core/models/UIModels/dataLoggerTypes.model';
import { DataLoggerService } from '@core/services/dataLogger.service';
import { selectAllSie, selectSieState } from '@store/reducers/sie.entity.reducer';
import { ISieEntityState } from '@store/state/sie.state';
import { SieUIModel } from '@core/models/UIModels/sie.model';
import { SieService } from '@core/services/sie.service';
import { MultiNodeWellUIModel } from '@core/models/UIModels/MultinodeWell.model';
import { eFCVDataModel } from '@core/models/webModels/eFCVDataModel.model';
import { IeFCVPositionSettingsState } from '@store/state/efcvPositionSettings.state';
import { eFCVPositionUIModel } from '@core/models/UIModels/eFCVPosition.model';
import { MultiNodePositionDefaultsDataUIModel } from '@core/models/UIModels/MultiNodePositionDefaultsDataUI.model';
@Injectable({
  providedIn: 'root'
})
export class ConfigurationSummaryService {
  panelSettingChanges: SaveConfigurationChanges[] = [];
  errorHandlingChanges: SaveConfigurationChanges[] = [];
  unitSystemChanges: SaveConfigurationChanges[] = [];
  alarmsAndLimitsChanges: SaveConfigurationChanges[] = [];
  panelDefaultChanges: SaveConfigurationChanges[] = [];
  shiftDefaultChanges: SaveConfigurationChanges[] = [];
  wellChanges: SaveConfigurationChanges[] = [];
  devicesChanges: SaveConfigurationChanges[] = [];
  publishingChanges: SaveConfigurationChanges[] = [];
  surefloChanges: SaveConfigurationChanges[] = [];
  dataLoggerChanges: SaveConfigurationChanges[] = [];
  sieChanges: SaveConfigurationChanges[] = [];
  eFCVPositionsChanges: SaveConfigurationChanges[] = [];
  wellArchList: IWellArchitecture[] = [];
  zoneValveTypeList: IZoneValveType[] = [];

  private panelConfigurationCommon$: Observable<IPanelConfigurationCommonState>;
  private IErrorHandlingSettingsState$: Observable<IErrorHandlingSettingsState>;
  private unitSystemModel$: Observable<IUnitSystemState>;
  private panelDefaultState$: Observable<IPanelDefaultState>;
  private alarmsAndLimitsState$: Observable<IAlarmsAndLimitsState>;
  private shiftDefaultState$: Observable<IShiftDefaultState>;
  serialCannelProperties$: Observable<ISerialChannelPropertiesState>;
  private toolTypesModel$: Observable<IToolTypeState>;
  private modbusProtocols$: Observable<IModbusProtocolState>;
  private modbusTemplateDetails$: Observable<IRegisteredModbusMapState>;
  private flowmeterTransmitterTypesState$: Observable<IFlowmeterTransmitterState>;
  private loggerTypesState$: Observable<ILoggerTypeState>;
  private IeFCVPositionSettingsState$: Observable<IeFCVPositionSettingsState>;

  eFCVPositionSettings: MultiNodePositionDefaultsDataUIModel;
  flowmeterList: FlowmeterTransmitterUIModel[] = [];
  loggerTypes: DataLoggerTypesDataModel[] = [];

  errorHandlingSettings: ErrorHandlingUIModel;
  unitSystem: UnitSystemModel;
  alarmsAndLimits: AlarmsAndLimitsUIModel;
  panelDefault: PanelDefaultUIModel;
  shiftDefault: ShiftDefaultUIModel;
  serialChannelProperty: SerialChannelProperty;
  pollModes: string[] = UICommon.PollModes;
  cardTypes: string[] = UICommon.CardAppTypes;
  toolConnections: ToolConnectionUIModel[];
  toolTypesStore: GaugeTypeUIModel[] = [];
  toolConnectionEntity: ToolConnectionUIModel[] = [];
  private modbusProtocols: ModbusProtocolModel[] = [];
  private modbusTemplateDetails: ModbusMapTemplateUIModel[] = [];
  private panelConfigurationCommon: PanelConfigurationCommonUIModel;
  private arrSubscriptions: Subscription[] = [];
  private bIsConfigSaved: boolean = false;

  constructor(private store: Store<any>,
    private configurationService: ConfigurationService,
    private panelConfigurationService: PanelConfigurationService,
    private wellService: WellService,
    private communicationChannelService: CommunicationChannelService,
    private toolConnectionService: ToolConnectionService,
    private publishingService: PublishingChannelService,
    private surefloService: SurefloService,
    private panelDefaultService: PanelDefaultService,
    private shiftDefaultService: ShiftDefaultService,
    private alarmsService: AlarmService,
    private dataLoggerService: DataLoggerService,
    private sieService: SieService,
    private titlecasePipe: TitleCasePipe) {
    this.serialCannelProperties$ = store.select<any>((state: any) => state.serialChannelPropertiesState);
    this.panelConfigurationCommon$ = this.store.select<any>((state: any) => state.panelConfigCommonState);
    this.IErrorHandlingSettingsState$ = this.store.select<IErrorHandlingSettingsState>((state: any) => state.errorHandlingSettingsState);
    this.unitSystemModel$ = store.select<IUnitSystemState>((state: any) => state.unitSystemState);
    this.toolTypesModel$ = this.store.select<IToolTypeState>((state: any) => state.toolTypesState);
    this.modbusProtocols$ = this.store.select<any>((state: any) => state.modbusProtocolState);
    this.modbusTemplateDetails$ = this.store.select<any>((state: any) => state.mapTemplateDetailsState);
    this.panelDefaultState$ = this.store.select<IPanelDefaultState>((state: any) => state.panelDefaultState);
    this.alarmsAndLimitsState$ = this.store.select<IAlarmsAndLimitsState>((state: any) => state.alarmsAndLimitsState);
    this.shiftDefaultState$ = this.store.select<IShiftDefaultState>((state: any) => state.shiftDefaultState);
    this.flowmeterTransmitterTypesState$ = this.store.select<IFlowmeterTransmitterState>((state: any) => state.flowmeterTransmitterState);
    this.loggerTypesState$ = this.store.select<ILoggerTypeState>((state: any) => state.loggerTypeState);
    this.IeFCVPositionSettingsState$ = this.store.select<IeFCVPositionSettingsState>((state: any) => state.eFCVPositionSettingsState);
    this.wellArchList = WELL_ARCHITECTURE_LIST;
    this.zoneValveTypeList = ZONE_VALVE_TYPE_LIST;
  }

  private addDeletedZone(delZone: DeleteObject): void {
    this.wellChanges.push({ page: delZone.name, fieldName: "Zone Name", originalValue: delZone.name, newValue: "-" });
    if (delZone.data)
      this.wellChanges.push({ page: '', fieldName: "Measured Depth", originalValue: delZone.data.MeasuredDepth, newValue: "-" });
  }
  private addDeletedeFCV(delZone: DeleteObject): void {
    const zone = delZone.data as eFCVDataModel;
    if (zone) {
      // eFCV Name   
      this.wellChanges.push({ page: delZone.name, fieldName: "eFCV Name", originalValue: zone.ZoneName, newValue: "-" });
      // eFCV Address
      this.wellChanges.push({ page: '', fieldName: 'eFCV Address', originalValue: zone.Address, newValue: "-" });
      // Unique Address
      this.wellChanges.push({ page: '', fieldName: 'Unique Address', originalValue: zone.UId, newValue: "-" });
      // Serial Number
      this.wellChanges.push({ page: '', fieldName: 'Serial Number', originalValue: zone.SerialNumber, newValue: "-" });
      // Measured Depth
      this.wellChanges.push({ page: '', fieldName: 'Measured Depth', originalValue: zone.MeasuredDepth.toString(), newValue: "-" });
      if (zone.MotorSettings) {
        this.wellChanges.push(
          { page: `${delZone.name}- Motor Settings`, fieldName: 'Max Voltage', originalValue: zone.MotorSettings.MaxVoltage.toString(), newValue: "-" },
          { page: '', fieldName: 'Max Current', originalValue: zone.MotorSettings.MaxCurrent.toString(), newValue: "-" },
          { page: '', fieldName: 'Target Voltage', originalValue: zone.MotorSettings.TargetVoltage.toString(), newValue: "-" },
          { page: '', fieldName: 'Over Current Threshold', originalValue: zone.MotorSettings.OverCurrentThreshold.toString(), newValue: "-" },
          { page: '', fieldName: 'Over Current Override', originalValue: zone.MotorSettings.OverCurrentOverrideFlag ? "Yes" : "No", newValue: "-" },
          { page: '', fieldName: 'Duty Cycle', originalValue: zone.MotorSettings.DutyCycle.toString(), newValue: "-" }
        );
      }
    }
  }
  private addDeletedChannel(delChannel: DeleteObject): void {
    if (delChannel.data.channelType === CommunicationChannelType.SERIAL) {
      let deviceInfo = delChannel.data as SerialPortCommunicationChannelDataUIModel;
      if (deviceInfo) {
        this.devicesChanges.push({
          page: deviceInfo.Description,
          fieldName: 'Protocol Name',
          originalValue: this.serialChannelProperty.Protocol[0],
          newValue: "-"
        });
        this.devicesChanges.push({ page: '', fieldName: 'Serial Port', originalValue: deviceInfo.Description, newValue: "-" });
        this.devicesChanges.push({ page: '', fieldName: 'Baud Rate', originalValue: deviceInfo.BaudRate.toString(), newValue: "-" });
        this.devicesChanges.push({ page: '', fieldName: 'Poll Rate', originalValue: deviceInfo.PollRateInMs.toString(), newValue: "-" });
        let pollMode = deviceInfo.SinglePollRateMode ? this.pollModes[1] : this.pollModes[0];
        this.devicesChanges.push({ page: '', fieldName: 'Poll Mode', originalValue: pollMode, newValue: "-" });
        this.devicesChanges.push({ page: '', fieldName: 'Modbus Timeout', originalValue: deviceInfo.TimeoutInMs.toString(), newValue: "-" });
      }
      else
        this.devicesChanges.push({ page: delChannel.name, fieldName: '', originalValue: delChannel.name, newValue: "-" });
    } else {
      let deviceInfo = delChannel.data as TcpIpCommunicationChannelDataUIModel;
      if (deviceInfo) {
        this.devicesChanges.push({
          page: deviceInfo.Description,
          fieldName: 'Protocol Name',
          originalValue: deviceInfo.Protocol === 1 ? "Modbus RTU Over TCP/IP" : "Modbus TCP/IP",
          newValue: "-"
        });
        this.devicesChanges.push({ page: '', fieldName: 'IP Address', originalValue: deviceInfo.IpAddress, newValue: "-" });
        this.devicesChanges.push({ page: '', fieldName: 'Port', originalValue: deviceInfo.IpPortNumber.toString(), newValue: "-" });
        this.devicesChanges.push({ page: '', fieldName: 'Poll Rate', originalValue: deviceInfo.PollRateInMs.toString(), newValue: "-" });
        let pollMode = deviceInfo.SinglePollRateMode ? this.pollModes[1] : this.pollModes[0];
        this.devicesChanges.push({ page: '', fieldName: 'Poll Mode', originalValue: pollMode, newValue: "-" });
        this.devicesChanges.push({ page: '', fieldName: 'Modbus Timeout', originalValue: deviceInfo.TimeoutInMs.toString(), newValue: "-" });
      }
      else
        this.devicesChanges.push({ page: delChannel.name, fieldName: '', originalValue: delChannel.name, newValue: "-" });
    }
  }

  private addDeletedCard(delCard: DeleteObject): void {
    let cardInfo = delCard.data as InterfaceCardDataUIModel;
    if (cardInfo) {
      this.devicesChanges.push({
        page: delCard.name,
        fieldName: 'Card Type',
        originalValue: cardInfo.SupportInChargePowerSupplyModule ? this.cardTypes[0] : this.cardTypes[1],
        newValue: "-"
      });
      this.devicesChanges.push({ page: '', fieldName: 'Card Name', originalValue: cardInfo.Description, newValue: "-" });
      this.devicesChanges.push({ page: '', fieldName: 'Card Address', originalValue: cardInfo.CardAddress.toString(), newValue: "-" });
    }
    else
      this.devicesChanges.push({ page: delCard.name, fieldName: '', originalValue: delCard.name, newValue: "-" });
  }

  private addDeletedGauge(delGauge: DeleteObject): void {
    let gaugeInfo = delGauge.data as SureSENSGaugeDataUIModel;
    if (gaugeInfo) {
      let toolType = this.toolTypesStore.find(t => t.GaugeType === gaugeInfo.GaugeType && t.ESPGaugeType === gaugeInfo.EspGaugeType)?.TypeName;
      this.devicesChanges.push({ page: delGauge.name, fieldName: 'Tool Type', originalValue: toolType, newValue: "-" });
      this.devicesChanges.push({ page: '', fieldName: 'Tool Name', originalValue: gaugeInfo.Description, newValue: "-" });
      this.devicesChanges.push({ page: '', fieldName: 'Tool Address', originalValue: gaugeInfo.ToolAddress.toString(), newValue: "-" });

      let delToolConnection = UICommon.deletedObjects.find(t => t.parentId === gaugeInfo.DeviceId && t.objectType === DeleteObjectTypesEnum.ToolConnections);
      if (delToolConnection && delToolConnection.data) {
        let toolConnection = delToolConnection.data;
        this.devicesChanges.push({ page: '', fieldName: 'Well Name', originalValue: toolConnection.WellName, newValue: "-" });
        if (this.panelConfigurationCommon.PanelTypeId !== PanelTypeList.SURESENS) {
          const zoneFieldName = this.panelConfigurationCommon.PanelTypeId === PanelTypeList.MultiNode ? "eFCV Name" : "Zone Name";
          this.devicesChanges.push({ page: '', fieldName: zoneFieldName, originalValue: toolConnection.ZoneName, newValue: "-" });
        }
        if (toolConnection.PortingId != -1) {
          this.devicesChanges.push({ page: '', fieldName: 'Porting', originalValue: toolConnection.Porting, newValue: "-" });
        }
        this.devicesChanges.push({ page: '', fieldName: 'Transducer Serial Number', originalValue: toolConnection.SerialNumber, newValue: "-" });
      }

      if (gaugeInfo.GaugeType == 5) {
        let inchargeGauge = gaugeInfo as InCHARGEGaugeDataUIModel;
        this.devicesChanges.push({ page: '', fieldName: 'Valve Initial Open %', originalValue: inchargeGauge.InCHARGEOpeningPercentage.toString(), newValue: "-" });
        this.devicesChanges.push({ page: '', fieldName: 'Calibration File', originalValue: inchargeGauge.InCHARGECoefficientFileName, newValue: "-" });
      }
      else {
        let sureSensGauge = gaugeInfo as SureSENSGaugeDataUIModel;
        this.devicesChanges.push({ page: '', fieldName: 'CRF Calibration File', originalValue: sureSensGauge.PressureCoefficientFileName, newValue: "-" });
        this.devicesChanges.push({ page: '', fieldName: 'CRT Calibration File', originalValue: sureSensGauge.TemperatureCoefficientFileName, newValue: "-" });
      }
    }
    else
      this.devicesChanges.push({ page: delGauge.name, fieldName: '', originalValue: delGauge.name, newValue: "-" });
  }

  private addDeleteDevice(delDevice: DeleteObject): void {
    switch (delDevice.objectType) {
      case DeleteObjectTypesEnum.Channel:
        this.addDeletedChannel(delDevice);
        break;

      case DeleteObjectTypesEnum.InterfaceCard:
        this.addDeletedCard(delDevice);
        break;

      case DeleteObjectTypesEnum.Gauge:
        this.addDeletedGauge(delDevice);
        break;
    }

    if (delDevice.children && delDevice.children.length > 0) {
      delDevice.children.forEach(child => {
        this.addDeleteDevice(child);
      });
    }
  }

  private addDeletedPublishing(delPublishing: DeleteObject): void {
    let publishing = delPublishing.data as PublishingDataUIModel;
    if (publishing) {
      let publishingName = "";
      if (publishing.Channel.channelType === CommunicationChannelType.SERIAL) {
        let delChannel = publishing.Channel as SerialPortCommunicationChannelDataUIModel;
        publishingName = delChannel.Description;
        // Protocol
        this.publishingChanges.push({
          page: delChannel.Description,
          fieldName: 'Protocol Name',
          originalValue: this.modbusProtocols[0].Name,
          newValue: "-"
        });
        // COM Port
        this.publishingChanges.push({ page: '', fieldName: 'Serial Port', originalValue: delChannel.Description, newValue: "-" });
        // Baud Rate
        this.publishingChanges.push({ page: '', fieldName: 'Baud Rate', originalValue: delChannel.BaudRate.toString(), newValue: "-" });
        // Data Bits
        this.publishingChanges.push({ page: '', fieldName: 'Data Bits', originalValue: delChannel.DataBits.toString(), newValue: "-" });
        // Parity
        if (this.serialChannelProperty)
          this.publishingChanges.push({ page: '', fieldName: 'Parity', originalValue: this.serialChannelProperty.Parity[delChannel.Parity], newValue: "-" });
        // Stop Bits
        this.publishingChanges.push({ page: '', fieldName: 'Stop Bits', originalValue: delChannel.StopBits, newValue: "-" });
      }
      else {
        let delChannel = publishing.Channel as TcpIpCommunicationChannelDataUIModel;
        publishingName = String.Format("{0}:{1}", delChannel.IpAddress, delChannel.IpPortNumber);
        // Protocol
        this.publishingChanges.push({
          page: String.Format("{0} - Overview", publishingName),
          fieldName: 'Protocol Name',
          originalValue: this.modbusProtocols[delChannel.Protocol].Name,
          newValue: "-"
        });
        this.publishingChanges.push({ page: '', fieldName: 'Port Number', originalValue: delChannel.IpPortNumber.toString(), newValue: "-" });
      }

      // Slave Settings Section
      // Connection To
      this.publishingChanges.push({
        page: String.Format("{0} - Slave Settings", publishingName),
        fieldName: 'Connection To',
        originalValue: publishing.ConnectionTo,
        newValue: "-"
      });
      // Word Order
      this.publishingChanges.push({ page: '', fieldName: 'Word Order', originalValue: publishing.WordOrder, newValue: "-" });
      // Byte Order
      this.publishingChanges.push({ page: '', fieldName: 'Byte Order', originalValue: publishing.ByteOrder, newValue: "-" });
      // Map Template
      let mapName = this.modbusTemplateDetails.find(m => m.Id === publishing.RegisteredModbusMapId)?.MapName;
      this.publishingChanges.push({ page: '', fieldName: 'Map Template', originalValue: mapName, newValue: "-" });
      // Slave ID
      this.publishingChanges.push({ page: '', fieldName: 'Slave ID', originalValue: publishing.SlaveId.toString(), newValue: "-" });
    }
    else
      this.devicesChanges.push({ page: delPublishing.name, fieldName: '', originalValue: delPublishing.name, newValue: "-" });
  }

  private showDeletedObjects(deletedObjectsType: DeleteObjectTypesEnum): void {
    if (UICommon.deletedObjects === undefined || UICommon.deletedObjects == null || UICommon.deletedObjects.length == 0)
      return;

    switch (deletedObjectsType) {
      case DeleteObjectTypesEnum.Well:
        // Wells
        let deletedWells = UICommon.deletedObjects.filter(w => w.objectType === DeleteObjectTypesEnum.Well) ?? [];
        deletedWells.forEach(element => {
          this.wellChanges.push({ page: element.name, fieldName: "Well Name", originalValue: element.name, newValue: "-" });
          const multinodeWell = element.data;
          if (multinodeWell) {
            if (multinodeWell?.TEC?.PowerSupplySettings) {
              this.wellChanges.push(
                { page: `${element.name} - TEC Power Supply`, fieldName: 'Max Voltage', originalValue: multinodeWell.TEC.PowerSupplySettings.MaxVoltage.toString(), newValue: "-" },
                { page: '', fieldName: 'Max Current', originalValue: multinodeWell.TEC.PowerSupplySettings.MaxCurrent.toString(), newValue: "-" },
                { page: '', fieldName: 'Target Voltage', originalValue: multinodeWell.TEC.PowerSupplySettings.TargetVoltage.toString(), newValue: "-" },
                { page: '', fieldName: 'Ramp Rate', originalValue: multinodeWell.TEC.PowerSupplySettings.RampRate.toString(), newValue: "-" },
                { page: '', fieldName: 'Settle Voltage', originalValue: multinodeWell.TEC.PowerSupplySettings.SettleVoltage.toString(), newValue: "-" },
                { page: '', fieldName: 'Settle Ramp Rate', originalValue: multinodeWell.TEC.PowerSupplySettings.SettleRampRate.toString(), newValue: "-" }
              );
            }
            if (multinodeWell?.PositionDescriptionData) {
              this.eFCVPositionSettings?.PositionStagesData?.forEach((positionStagesData, index) => {
                if (positionStagesData.PositionStage !== DEFAULT_eFCV_POSITIONS_STAGES.STAGE_NOTSET) {
                  let pageName = index === 0 ? `${element.name} - eFCV Positions` : "";
                  this.wellChanges.push({ page: pageName, fieldName: positionStagesData.PositionStageDesc, originalValue: this.getEFCVPositionDescriptionData(positionStagesData.PositionStage, multinodeWell.PositionDescriptionData), newValue: "-" });
                }
              });
            }
          }
          if (element.children && element.children.length > 0) {
            element.children.forEach(child => {
              if (child.objectType === DeleteObjectTypesEnum.eFCV) {
                this.addDeletedeFCV(child);
              } else {
                this.addDeletedZone(child);
              }
            });
          }
        });

        // Zones
        let deletedZones = UICommon.deletedObjects.filter(w => w.objectType === DeleteObjectTypesEnum.Zone) ?? [];
        deletedZones.forEach(element => {
          this.addDeletedZone(element);
        });

        // eFCVs
        let deletedeFCV = UICommon.deletedObjects.filter(w => w.objectType === DeleteObjectTypesEnum.eFCV) ?? [];
        deletedeFCV.forEach(element => {
          this.addDeletedeFCV(element);
        });
        break;

      case DeleteObjectTypesEnum.Channel:
        let deletedChannels = UICommon.deletedObjects.filter(w => w.objectType === DeleteObjectTypesEnum.Channel
          || w.objectType === DeleteObjectTypesEnum.InterfaceCard
          || w.objectType === DeleteObjectTypesEnum.Gauge) ?? [];

        deletedChannels.forEach(element => {
          this.addDeleteDevice(element);
        });
        break;

      case DeleteObjectTypesEnum.ModbusConfiguration:
        let deletedPublishings = UICommon.deletedObjects.filter(w => w.objectType === DeleteObjectTypesEnum.ModbusConfiguration) ?? [];
        deletedPublishings.forEach(element => {
          this.addDeletedPublishing(element);
        });
        break;
      case DeleteObjectTypesEnum.DataLogger:
        let deletedDataLogger = UICommon.deletedObjects.filter(w => w.objectType === DeleteObjectTypesEnum.DataLogger) ?? [];
        deletedDataLogger.forEach(element => {
          const data = element.data as DataLoggerUIModel;
          this.dataLoggerChanges.push({
            page: String.Format("{0} - Overview", data.Name),
            fieldName: 'Logger Name',
            originalValue: data.Name,
            newValue: "-"
          });
          this.dataLoggerChanges.push({ page: '', fieldName: 'Logger Format', originalValue: this.getLoggerName(data.DataLoggerType), newValue: "-" });
          if (data.DataLoggerType === DATA_LOGGER_TYPE.Saudi_Aramco_iField) {
            this.dataLoggerChanges.push({ page: '', fieldName: 'Well Name', originalValue: this.getWellName(data.WellId), newValue: "-" });
          } else {
            this.dataLoggerChanges.push({ page: '', fieldName: 'Logging Rate (s)', originalValue: data.ScanRate.toString(), newValue: "-" });
          }
        });
        break;
      case DeleteObjectTypesEnum.SureFLOFlowMeter:
        // FlowMeters
        let deletedFlowMeters = UICommon.deletedObjects.filter(w => w.objectType === DeleteObjectTypesEnum.SureFLOFlowMeter) ?? [];
        deletedFlowMeters.forEach(element => {
          const data = element.data as SureFLOFlowMeter;
          this.surefloChanges.push({ page: element.name, fieldName: "FlowMeter Name", originalValue: element.name, newValue: "-" });
          this.surefloChanges.push({ page: '', fieldName: 'Serial Number', originalValue: data.Serial, newValue: "-" });
          this.surefloChanges.push({ page: '', fieldName: 'Technology', originalValue: FlowMeterTypes[data.Technology], newValue: "-" });
          this.surefloChanges.push({ page: '', fieldName: 'Well Type', originalValue: WellFlowTypes[data.FluidType], newValue: "-" });
        });
        break;
      case DeleteObjectTypesEnum.Sie:
        // FlowMeters
        let deletedeFCVs = UICommon.deletedObjects.filter(w => w.objectType === DeleteObjectTypesEnum.Sie) ?? [];
        deletedeFCVs.forEach(element => {
          const data = element.data as SieUIModel;
          this.sieChanges.push({ page: String.Format("{0} - SIU Overview", data.Name), fieldName: 'SIU Name', originalValue: data.Name, newValue: "-" });
          this.sieChanges.push({ page: '', fieldName: 'SIU IP Address', originalValue: data.IpAddress, newValue: "-" });
          this.sieChanges.push({ page: '', fieldName: 'SIU Port Number', originalValue: data.PortNumber.toString(), newValue: "-" });
          this.sieChanges.push({ page: '', fieldName: 'MSMP MAC Address', originalValue: data.MacAddress, newValue: "-" });
        });
        break;
    }
  }

  private showNewPanelConfiguration(panelConfigurationCommon: PanelConfigurationCommonModel) {
    this.panelSettingChanges.push({ page: 'General', fieldName: 'Customer Name', originalValue: "-", newValue: panelConfigurationCommon.CustomerName });
    this.panelSettingChanges.push({ page: '', fieldName: 'Field Name', originalValue: "-", newValue: panelConfigurationCommon.FieldName });
    this.panelSettingChanges.push({ page: '', fieldName: 'Serial Number', originalValue: "-", newValue: panelConfigurationCommon.SerialNumber });
    if (panelConfigurationCommon.PanelTypeId === PanelTypeList.SURESENS) {
      let suresensPanel = panelConfigurationCommon as SureSENSPanelModel;
      this.panelSettingChanges.push({ page: '', fieldName: 'Toggle Home Wells', originalValue: "-", newValue: suresensPanel.ToggleEnabled ? "Enabled" : "Disabled" });
      this.panelSettingChanges.push({ page: '', fieldName: 'Toggle Interval(s)', originalValue: "-", newValue: suresensPanel.ToggleIntervalInSec.toString() });
    }
    if (panelConfigurationCommon.PanelTypeId === PanelTypeList.INFORCE) {
      this.panelSettingChanges.push({ page: '', fieldName: 'Hydraulic Outputs', originalValue: "-", newValue: (panelConfigurationCommon as InforcePanelUIModel).HydraulicOutputs.toString() });
    }
  }

  private initPanelConfiguration() {
    return new Promise((resolve, reject) => {
      let subscription = this.panelConfigurationCommon$.subscribe(
        (state: IPanelConfigurationCommonState) => {
          if (state !== undefined) {
            if (state.isLoaded === false) {
              // Dispatch Action if not loaded
              this.store.dispatch(
                PANELCONFIG_COMMON_ACTIONS.PANELCONFIG_COMMON_LOAD()
              );
            } else {
              this.panelSettingChanges = [];
              this.panelConfigurationCommon = state.panelConfigurationCommon;
              if (UICommon.IsImportConfig) {
                this.showNewPanelConfiguration(this.panelConfigurationCommon);
                resolve(true);
              }
              if (!state.isDirty) {
                resolve(true);
              }
              if (state.isDirty) {
                let panelConfiguration = state.panelConfigurationCommon;
                this.panelConfigurationService.getPanelConfigurationCommon().subscribe(panelConfigCommon => {
                  let pageName = 'General';
                  if (panelConfiguration.CustomerName != panelConfigCommon.CustomerName) {
                    this.panelSettingChanges.push({ page: pageName, fieldName: 'Customer Name', originalValue: panelConfigCommon.CustomerName ?? '-', newValue: panelConfiguration.CustomerName });
                    pageName = "";
                  }
                  if (panelConfiguration.FieldName != panelConfigCommon.FieldName) {
                    this.panelSettingChanges.push({ page: pageName, fieldName: 'Field Name', originalValue: panelConfigCommon.FieldName ?? '-', newValue: panelConfiguration.FieldName });
                    pageName = "";
                  }
                  if (panelConfiguration.SerialNumber != panelConfigCommon.SerialNumber) {
                    this.panelSettingChanges.push({ page: pageName, fieldName: 'Serial Number', originalValue: panelConfigCommon.SerialNumber ?? '-', newValue: panelConfiguration.SerialNumber });
                    pageName = "";
                  }

                  if (panelConfiguration.PanelTypeId === PanelTypeList.SURESENS) {
                    let sureSENSPanel = panelConfigCommon as SureSENSPanelModel;
                    let sureSENSPanelModified = panelConfiguration as SureSENSPanelModel;
                    if (sureSENSPanelModified.ToggleEnabled != sureSENSPanel.ToggleEnabled) {
                      this.panelSettingChanges.push({
                        page: pageName,
                        fieldName: 'Toggle Home Wells',
                        originalValue: sureSENSPanel.ToggleEnabled === undefined ? "-" : sureSENSPanel.ToggleEnabled ? "Enabled" : "Disabled",
                        newValue: sureSENSPanelModified.ToggleEnabled ? "Enabled" : "Disabled"
                      });
                      pageName = "";
                    }
                    if (sureSENSPanelModified.ToggleIntervalInSec != sureSENSPanel.ToggleIntervalInSec) {
                      this.panelSettingChanges.push({
                        page: pageName, fieldName: 'Toggle Interval(s)',
                        originalValue: sureSENSPanel.ToggleIntervalInSec === undefined ? "-" : sureSENSPanel.ToggleIntervalInSec.toString(),
                        newValue: sureSENSPanelModified.ToggleIntervalInSec.toString()
                      });
                      pageName = "";
                    }
                  }
                  // InFORCE
                  if (panelConfiguration.PanelTypeId === PanelTypeList.INFORCE) {
                    let inforcePanel = panelConfigCommon as InforcePanelUIModel;
                    let inforcePanelModified = panelConfiguration as InforcePanelUIModel;
                    if (inforcePanel.HydraulicOutputs != inforcePanelModified.HydraulicOutputs) {
                      this.panelSettingChanges.push({
                        page: pageName,
                        fieldName: 'Hydraulic Outputs',
                        originalValue: inforcePanel?.HydraulicOutputs?.toString() ?? '-',
                        newValue: inforcePanelModified.HydraulicOutputs.toString()
                      });
                      pageName = "";
                    }
                  }
                  resolve(true);
                });
              }
            }
          }
        }
      );
      this.arrSubscriptions.push(subscription);
    });
  }

  private showNewErrorHandling(): void {
    this.errorHandlingChanges.push({ page: 'Error Handling', fieldName: 'Decimal Value', originalValue: "-", newValue: this.errorHandlingSettings.BadDataValue.toString() });
    this.errorHandlingChanges.push({ page: '', fieldName: 'Integer Value', originalValue: "-", newValue: this.errorHandlingSettings.BadDataValueInteger.toString() });
    this.errorHandlingChanges.push({ page: '', fieldName: 'Unsigned Integer', originalValue: "-", newValue: this.errorHandlingSettings.BadDataValueUnsignedInteger.toString() });
    this.errorHandlingChanges.push({ page: '', fieldName: 'Absent Value Delay', originalValue: "-", newValue: this.errorHandlingSettings.BadDataTimeout.toString() });
  }

  private getErrorHandlingChanges(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.configurationService.getErrorHandlingSettings().subscribe(errorHandling => {
        let pageName = 'Error Handling';
        // Decimal Value
        if (this.errorHandlingSettings.BadDataValue != errorHandling.BadDataValue) {
          this.errorHandlingChanges.push({ page: pageName, fieldName: 'Decimal Value', originalValue: errorHandling.BadDataValue.toString(), newValue: this.errorHandlingSettings.BadDataValue.toString() });
          pageName = "";
        }
        // Integer Value
        if (this.errorHandlingSettings.BadDataValueInteger != errorHandling.BadDataValueInteger) {
          this.errorHandlingChanges.push({ page: pageName, fieldName: 'Integer Value', originalValue: errorHandling.BadDataValueInteger.toString(), newValue: this.errorHandlingSettings.BadDataValueInteger.toString() });
          pageName = "";
        }
        // UnsignedInt Value
        if (this.errorHandlingSettings.BadDataValueUnsignedInteger != errorHandling.BadDataValueUnsignedInteger) {
          this.errorHandlingChanges.push({ page: pageName, fieldName: 'Unsigned Integer', originalValue: errorHandling.BadDataValueUnsignedInteger.toString(), newValue: this.errorHandlingSettings.BadDataValueUnsignedInteger.toString() });
          pageName = "";
        }
        // Absent Data Value
        if (this.errorHandlingSettings.BadDataTimeout != errorHandling.BadDataTimeout) {
          this.errorHandlingChanges.push({ page: pageName, fieldName: 'Absent Value Delay', originalValue: errorHandling.BadDataTimeout.toString(), newValue: this.errorHandlingSettings.BadDataTimeout.toString() });
          pageName = "";
        }

        resolve(true);
      },
        error => {
          console.log(error);
          resolve(true);  // return true - error Handling will still be empty.
        });
    });
  }

  private initErrorHandlingSettingState() {
    return new Promise((resolve, reject) => {
      let subscription = this.IErrorHandlingSettingsState$.subscribe(
        (state: IErrorHandlingSettingsState) => {
          if (state !== undefined) {
            if (state.isLoaded === false) {
              // Dispatch Action if not loaded
              this.store.dispatch(
                ERROR_HANDLING_SETTINGS_STATE_ACTIONS.LOAD_ERROR_HANDLING_SETTINGS()
              );
            } else {
              this.errorHandlingSettings = new ErrorHandlingUIModel();
              Object.assign(this.errorHandlingSettings, state.errorHandlingSettings);

              this.errorHandlingChanges = [];
              if (UICommon.IsImportConfig || !this.bIsConfigSaved) {
                this.showNewErrorHandling();
                resolve(true);
                return;
              }

              if (!state.isDirty) {
                resolve(true);
              }

              this.getErrorHandlingChanges().finally(() => resolve(true));
            }
          }
        }
      );

      this.arrSubscriptions.push(subscription);
    });
  }

  private getEFCVPositionDescriptionData(PositionStage, PositionDescriptionData) {
    return PositionDescriptionData?.find(PositionDescriptionData => PositionDescriptionData.PositionStage === PositionStage)?.Description ?? "";
  }

  private showNeweFCVPositions(): void {
    this.eFCVPositionSettings?.PositionStagesData?.forEach((positionStagesData, index) => {
      if (positionStagesData.PositionStage !== DEFAULT_eFCV_POSITIONS_STAGES.STAGE_NOTSET) {
        let pageName = index === 0 ? 'eFCV Positions' : "";
        this.eFCVPositionsChanges.push({ page: pageName, fieldName: positionStagesData.PositionStageDesc, originalValue: "-", newValue: this.getEFCVPositionDescriptionData(positionStagesData.PositionStage, this.eFCVPositionSettings.PositionDescriptionData) });
      }
    });
  }

  private geteFCVPositionChanges(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.configurationService.geteFCVPositionSettings().subscribe(eFCVPosition => {
        let pageName = 'eFCV Positions';
        eFCVPosition.PositionStagesData.forEach((positionStagesData, index) => {
          if (positionStagesData.PositionStage !== DEFAULT_eFCV_POSITIONS_STAGES.STAGE_NOTSET) {
            let origPosition = this.getEFCVPositionDescriptionData(positionStagesData.PositionStage, eFCVPosition.PositionDescriptionData);
            let newPosition = this.getEFCVPositionDescriptionData(positionStagesData.PositionStage, this.eFCVPositionSettings.PositionDescriptionData);
            if (origPosition != newPosition) {
              this.eFCVPositionsChanges.push({ page: pageName, fieldName: positionStagesData.PositionStageDesc, originalValue: origPosition, newValue: newPosition });
              pageName = "";
            }
          }
        });
        resolve(true);
      },
        error => {
          console.log(error);
          resolve(true);  // return true - error Handling will still be empty.
        });
    });
  }


  private initeFCVPositionSettingState() {
    return new Promise((resolve, reject) => {
      let subscription = this.IeFCVPositionSettingsState$.subscribe(
        (state: IeFCVPositionSettingsState) => {
          if (state !== undefined) {
            if (state.isLoaded === false) {
              // Dispatch Action if not loaded
              this.store.dispatch(
                eFCV_POSITION_SETTINGS_STATE_ACTIONS.LOAD_eFCV_POSITION_SETTINGS()
              );
            } else {
              this.eFCVPositionSettings = new MultiNodePositionDefaultsDataUIModel();
              Object.assign(this.eFCVPositionSettings, state.eFCVPositionSettings);

              this.eFCVPositionsChanges = [];
              if (UICommon.IsImportConfig || !this.bIsConfigSaved) {
                this.showNeweFCVPositions();
                resolve(true);
                return;
              }

              if (!state.isDirty) {
                resolve(true);
              }

              this.geteFCVPositionChanges().finally(() => resolve(true));
            }
          }
        }
      );

      this.arrSubscriptions.push(subscription);
    });
  }

  private showNewUnitSystemChanges(): void {
    let pageName = 'Unit System';
    this.unitSystem.UnitQuantities.forEach(modifiedQuantity => {
      if (modifiedQuantity.SupportedUnitSymbols.length > 1)
        this.unitSystemChanges.push({ page: pageName, fieldName: modifiedQuantity.UnitQuantityDisplayLabel, originalValue: "-", newValue: modifiedQuantity.SelectedDisplayUnitSymbol });
      pageName = "";
    });
  }

  private getUnitSystemChanges(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.configurationService.getUnitSystem().subscribe(origUnitSystem => {
        let pageName = 'Unit System';
        origUnitSystem.UnitQuantities.forEach(unitQuantity => {
          let modifiedQuantity = this.unitSystem.UnitQuantities.find(q => q.UnitQuantityName === unitQuantity.UnitQuantityName);
          if (modifiedQuantity && modifiedQuantity.SelectedUnitSymbol != unitQuantity.SelectedUnitSymbol) {
            this.unitSystemChanges.push({ page: pageName, fieldName: modifiedQuantity.UnitQuantityDisplayLabel, originalValue: unitQuantity.SelectedDisplayUnitSymbol, newValue: modifiedQuantity.SelectedDisplayUnitSymbol });
            pageName = "";
          }
        });
        resolve(true);
      },
        error => {
          console.log(error);
          resolve(true);  // return true - unit systems will still be empty.
        });
    });
  }

  private initUnitSystem() {
    return new Promise((resolve, reject) => {
      let subscription = this.unitSystemModel$.subscribe((state: IUnitSystemState) => {
        if (state !== undefined) {
          if (state.isLoaded === false) {
            // Dispatch Action if not loaded
            this.store.dispatch(UNITSYSTEM_ACTIONS.UNITSYSTEM_LOAD());
          } else {

            this.unitSystem = state.unitSystem;
            this.unitSystemChanges = [];

            if (UICommon.IsImportConfig || !this.bIsConfigSaved) {
              this.showNewUnitSystemChanges();
              resolve(true);
              return;
            }

            if (!state.isDirty) {
              resolve(true);
            }

            this.getUnitSystemChanges().finally(() => resolve(true));
          }
        }
      });

      this.arrSubscriptions.push(subscription);
    });
  }

  private initPanelDefaultState() {
    return new Promise((resolve, reject) => {
      let subscription = this.panelDefaultState$.subscribe(
        (state: IPanelDefaultState) => {
          if (state !== undefined) {
            if (state.isLoaded === false) {
              // Dispatch Action if not loaded
              this.store.dispatch(PANEL_DEFAULT_ACTIONS.LOAD_PANEL_DEFAULTS());
            } else {
              this.panelDefault = new PanelDefaultUIModel();
              Object.assign(this.panelDefault, state.panelDefaults);
              this.panelDefaultChanges = [];
              if (UICommon.IsImportConfig || !this.bIsConfigSaved) {
                this.showNewPanelDefault();
                resolve(true);
                return;
              }
              if (!state.isDirty) {
                resolve(true);
              }
              this.getPanelDefaultChanges().finally(() => resolve(true));
            }
          }
        }
      );

      this.arrSubscriptions.push(subscription);
    });
  }

  private initAlarmsAndLimitsState() {
    return new Promise((resolve, reject) => {
      let subscription = this.alarmsAndLimitsState$.subscribe(
        (state: IAlarmsAndLimitsState) => {
          if (state !== undefined) {
            if (state.isLoaded === false) {
              // Dispatch Action if not loaded
              this.store.dispatch(ALARMS_AND_LIMITS_ACTIONS.LOAD_ALARMS_AND_LIMITS());
            } else {
              this.alarmsAndLimits = new AlarmsAndLimitsUIModel();
              Object.assign(this.alarmsAndLimits, state.alarmsAndLimits);
              this.alarmsAndLimitsChanges = [];
              if (UICommon.IsImportConfig || !this.bIsConfigSaved) {
                if (state.alarmsAndLimits) {
                  this.showNewAlarmsAndLimits();
                }
                resolve(true);
                return;
              }
              if (!state.isDirty) {
                resolve(true);
              }
              this.getAlarmsAndLimitsChanges().finally(() => resolve(true));
            }
          }
        }
      );

      this.arrSubscriptions.push(subscription);
    });
  }

  private showNewPanelDefault(): void {
    this.panelDefaultChanges.push({ page: 'Panel Defaults', fieldName: 'Delay before measuring Returns', originalValue: "-", newValue: this.panelDefault.DelayBeforeMeasuringReturns.toString() });
    this.panelDefaultChanges.push({ page: '', fieldName: 'Passive Mode', originalValue: "-", newValue: this.panelDefault.HPUPassiveModeEnabled ? 'Enabled' : 'Disabled' });
    this.panelDefaultChanges.push({ page: '', fieldName: 'Passive Mode Timeout', originalValue: "-", newValue: this.panelDefault.HPUPassiveModeTimeout.toString() });
    this.panelDefaultChanges.push({ page: '', fieldName: 'Pre-Pressurization Settings', originalValue: "-", newValue: this.panelDefault.EnableLinePrePressurization ? 'Enabled' : 'Disabled' });
    this.panelDefaultChanges.push({ page: '', fieldName: 'Hold Pressure Time', originalValue: "-", newValue: this.panelDefault.DurationInSecondsToHoldPressure.toString() });
    this.panelDefaultChanges.push({ page: '', fieldName: 'Waiting hours to apply Pressurization again', originalValue: "-", newValue: this.panelDefault.TimeIntervalInHoursToApplyPrePressurizationAgain.toString() });
    this.panelDefaultChanges.push({ page: '', fieldName: 'Flowmeter Transmitter Type', originalValue: "-", newValue: this.getFlowmeterTransmitterTypeName(this.panelDefault.FlowMeterTransmitterType) });
  }

  private getFlowmeterTransmitterTypeName(type): string {
    if (this.flowmeterList.length === 0) {
      if (type === 0) return "Precision-Digital";
      if (type === 1) return "FluidWell";
      if (type === 2) return "None";
    }
    const selectedFlowmeter = this.flowmeterList.find((flowmeter) => flowmeter.Id === type);
    return selectedFlowmeter ? selectedFlowmeter.FlowMeterTransmitterTypeDesc : "";
  }

  private getPanelDefaultChanges(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.panelDefaultService.getPanelDefault().subscribe(panelDefault => {
        let pageName = 'Panel Defaults';
        // Delay before measuring Returns
        if (this.panelDefault.DelayBeforeMeasuringReturns != panelDefault.DelayBeforeMeasuringReturns) {
          this.panelDefaultChanges.push({ page: pageName, fieldName: 'Delay before measuring Returns', originalValue: panelDefault.DelayBeforeMeasuringReturns.toString(), newValue: this.panelDefault.DelayBeforeMeasuringReturns.toString() });
          pageName = "";
        }
        // Passive Mode
        if (this.panelDefault.HPUPassiveModeEnabled != panelDefault.HPUPassiveModeEnabled) {
          this.panelDefaultChanges.push({ page: pageName, fieldName: 'Passive Mode', originalValue: panelDefault.HPUPassiveModeEnabled ? 'Enabled' : 'Disabled', newValue: this.panelDefault.HPUPassiveModeEnabled ? 'Enabled' : 'Disabled' });
          pageName = "";
        }
        // Passive Mode Timeout
        if (this.panelDefault.HPUPassiveModeTimeout != panelDefault.HPUPassiveModeTimeout) {
          this.panelDefaultChanges.push({ page: pageName, fieldName: 'Passive Mode Timeout', originalValue: panelDefault.HPUPassiveModeTimeout.toString(), newValue: this.panelDefault.HPUPassiveModeTimeout.toString() });
          pageName = "";
        }
        // Pre-Pressurization Settings
        if (this.panelDefault.EnableLinePrePressurization != panelDefault.EnableLinePrePressurization) {
          this.panelDefaultChanges.push({ page: pageName, fieldName: 'Pre-Pressurization Settings', originalValue: panelDefault.EnableLinePrePressurization ? 'Enabled' : 'Disabled', newValue: this.panelDefault.EnableLinePrePressurization ? 'Enabled' : 'Disabled' });
          pageName = "";
        }
        // Hold Pressure Time
        if (this.panelDefault.DurationInSecondsToHoldPressure != panelDefault.DurationInSecondsToHoldPressure) {
          this.panelDefaultChanges.push({ page: pageName, fieldName: 'Hold Pressure Time', originalValue: panelDefault.DurationInSecondsToHoldPressure.toString(), newValue: this.panelDefault.DurationInSecondsToHoldPressure.toString() });
          pageName = "";
        }
        // Waiting hours to apply Pressurization again
        if (this.panelDefault.TimeIntervalInHoursToApplyPrePressurizationAgain != panelDefault.TimeIntervalInHoursToApplyPrePressurizationAgain) {
          this.panelDefaultChanges.push({ page: pageName, fieldName: 'Waiting hours to apply Pressurization again', originalValue: panelDefault.TimeIntervalInHoursToApplyPrePressurizationAgain.toString(), newValue: this.panelDefault.TimeIntervalInHoursToApplyPrePressurizationAgain.toString() });
          pageName = "";
        }
        // Flowmeter Transmitter Type
        if (this.panelDefault.FlowMeterTransmitterType != panelDefault.FlowMeterTransmitterType) {
          this.panelDefaultChanges.push({ page: pageName, fieldName: 'Flowmeter Transmitter Type', originalValue: this.getFlowmeterTransmitterTypeName(panelDefault.FlowMeterTransmitterType), newValue: this.getFlowmeterTransmitterTypeName(this.panelDefault.FlowMeterTransmitterType) });
          pageName = "";
        }
        resolve(true);
      },
        error => {
          console.log(error);
          resolve(true);  // return true - error Handling will still be empty.
        });
    });
  }

  private showNewAlarmsAndLimits(): void {
    this.alarmsAndLimitsChanges.push({ page: 'Alarms and Limits', fieldName: 'Start Pump Pressure', originalValue: "-", newValue: this.alarmsAndLimits.StartPumpPressure?.LimitValue.toString() });
    this.alarmsAndLimitsChanges.push({ page: '', fieldName: 'Stop Pump Pressure', originalValue: "-", newValue: this.alarmsAndLimits.StopPumpPressure?.LimitValue.toString() });
    this.alarmsAndLimitsChanges.push({ page: '', fieldName: 'High Pump Pressure', originalValue: "-", newValue: this.alarmsAndLimits.HighPumpPressure?.LimitValue.toString() });
    this.alarmsAndLimitsChanges.push({ page: '', fieldName: 'High Output Pressure', originalValue: "-", newValue: this.alarmsAndLimits.HighOutputXPressure?.LimitValue.toString() });
    this.alarmsAndLimitsChanges.push({ page: '', fieldName: 'High Supply Pressure', originalValue: "-", newValue: this.alarmsAndLimits.HighSupplyPressure?.LimitValue.toString() });
    this.alarmsAndLimitsChanges.push({ page: '', fieldName: 'Low Reservoir Level', originalValue: "-", newValue: this.alarmsAndLimits.LowReservoirLevel?.LimitValue.toString() });
  }

  private getAlarmsAndLimitsChanges(): Promise<boolean> {
    if (this.panelConfigurationCommon?.Id !== undefined && this.panelConfigurationCommon?.Id !== -1 && UICommon.IsConfigSaved) {
      return new Promise((resolve, reject) => {
        this.alarmsService.getAlarmsAndLimits().subscribe(alarmsAndLimits => {
          let pageName = 'Alarms and Limits';
          // Start Pump Pressure
          if (this.alarmsAndLimits.StartPumpPressure?.LimitValue != alarmsAndLimits.StartPumpPressure?.LimitValue) {
            this.alarmsAndLimitsChanges.push({ page: pageName, fieldName: 'Start Pump Pressure', originalValue: alarmsAndLimits.StartPumpPressure?.LimitValue.toString(), newValue: this.alarmsAndLimits.StartPumpPressure?.LimitValue.toString() });
            pageName = "";
          }
          // Stop Pump Pressure
          if (this.alarmsAndLimits.StopPumpPressure?.LimitValue != alarmsAndLimits.StopPumpPressure?.LimitValue) {
            this.alarmsAndLimitsChanges.push({ page: pageName, fieldName: 'Stop Pump Pressure', originalValue: alarmsAndLimits.StopPumpPressure?.LimitValue.toString(), newValue: this.alarmsAndLimits.StopPumpPressure?.LimitValue.toString() });
            pageName = "";
          }
          // High Pump Pressure
          if (this.alarmsAndLimits.HighPumpPressure?.LimitValue != alarmsAndLimits.HighPumpPressure?.LimitValue) {
            this.alarmsAndLimitsChanges.push({ page: pageName, fieldName: 'High Pump Pressure', originalValue: alarmsAndLimits.HighPumpPressure?.LimitValue.toString(), newValue: this.alarmsAndLimits.HighPumpPressure?.LimitValue.toString() });
            pageName = "";
          }
          // High Output Pressure
          if (this.alarmsAndLimits.HighOutputXPressure?.LimitValue != alarmsAndLimits.HighOutputXPressure?.LimitValue) {
            this.alarmsAndLimitsChanges.push({ page: pageName, fieldName: 'High Output Pressure', originalValue: alarmsAndLimits.HighOutputXPressure?.LimitValue.toString(), newValue: this.alarmsAndLimits.HighOutputXPressure?.LimitValue.toString() });
            pageName = "";
          }
          // High Supply Pressure
          if (this.alarmsAndLimits.HighSupplyPressure?.LimitValue != alarmsAndLimits.HighSupplyPressure?.LimitValue) {
            this.alarmsAndLimitsChanges.push({ page: pageName, fieldName: 'High Supply Pressure', originalValue: alarmsAndLimits.HighSupplyPressure?.LimitValue.toString(), newValue: this.alarmsAndLimits.HighSupplyPressure?.LimitValue.toString() });
            pageName = "";
          }
          // Low Reservoir Level
          if (this.alarmsAndLimits.LowReservoirLevel?.LimitValue != alarmsAndLimits.LowReservoirLevel?.LimitValue) {
            this.alarmsAndLimitsChanges.push({ page: pageName, fieldName: 'Low Reservoir Level', originalValue: alarmsAndLimits.LowReservoirLevel?.LimitValue.toString(), newValue: this.alarmsAndLimits.LowReservoirLevel?.LimitValue.toString() });
            pageName = "";
          }

          resolve(true);
        },
          error => {
            console.log(error);
            resolve(true);  // return true - error Handling will still be empty.
          });
      });
    } else {
      return Promise.resolve(true);
    }
  }

  private initShiftDefaultState() {
    return new Promise((resolve, reject) => {
      let subscription = this.shiftDefaultState$.subscribe(
        (state: IShiftDefaultState) => {
          if (state !== undefined) {
            if (state.isLoaded === false) {
              // Dispatch Action if not loaded
              this.store.dispatch(SHIFT_DEFAULT_ACTIONS.LOAD_SHIFT_DEFAULTS());
            } else {
              this.shiftDefault = new ShiftDefaultUIModel();
              Object.assign(this.shiftDefault, state.shiftDefaults);
              this.shiftDefaultChanges = [];
              if (UICommon.IsImportConfig || !this.bIsConfigSaved) {
                this.showNewShiftDefault();
                resolve(true);
                return;
              }
              if (!state.isDirty) {
                resolve(true);
              }
              this.getShiftDefaultChanges().finally(() => resolve(true));
            }
          }
        }
      );

      this.arrSubscriptions.push(subscription);
    });
  }

  private showNewShiftDefault(): void {
    this.shiftDefaultChanges.push({ page: 'Shift Defaults', fieldName: 'Preferred Shift Method', originalValue: "-", newValue: this.shiftDefault.ShiftMethod });
    // Returns Based
    this.shiftDefaultChanges.push({ page: 'Shift Defaults - Returns Based', fieldName: 'Tolerance High', originalValue: "-", newValue: this.shiftDefault.ReturnsBasedShiftDefaults.ToleranceHigh.toString() });
    this.shiftDefaultChanges.push({ page: '', fieldName: 'Tolerance Low', originalValue: "-", newValue: this.shiftDefault.ReturnsBasedShiftDefaults.ToleranceLow.toString() });
    this.shiftDefaultChanges.push({ page: '', fieldName: 'Stabilization Interval', originalValue: "-", newValue: this.shiftDefault.ReturnsBasedShiftDefaults.ReturnFlowStabilizationCheckingPeriodInSeconds.toString() });
    this.shiftDefaultChanges.push({ page: '', fieldName: 'Stabilization Flow Rate', originalValue: "-", newValue: this.shiftDefault.ReturnsBasedShiftDefaults.MinimumReturnsFlowRateForStabilization.toString() });
    this.shiftDefaultChanges.push({ page: '', fieldName: 'Pressure Lock Time', originalValue: "-", newValue: this.shiftDefault.ReturnsBasedShiftDefaults.PressureLockTime.toString() });
    this.shiftDefaultChanges.push({ page: '', fieldName: 'Vent Time', originalValue: "-", newValue: this.shiftDefault.ReturnsBasedShiftDefaults.VentTime.toString() });
    this.shiftDefaultChanges.push({ page: '', fieldName: 'Minimum Shift Time', originalValue: "-", newValue: this.shiftDefault.ReturnsBasedShiftDefaults.MinShiftTime.toString() });
    this.shiftDefaultChanges.push({ page: '', fieldName: 'Maximum Shift Time', originalValue: "-", newValue: this.shiftDefault.ReturnsBasedShiftDefaults.MaxShiftTime.toString() });
    this.shiftDefaultChanges.push({ page: '', fieldName: 'Minimum Reset Time', originalValue: "-", newValue: this.shiftDefault.ReturnsBasedShiftDefaults.MinimumResetTime.toString() });
    //Time based
    this.shiftDefaultChanges.push({ page: 'Shift Defaults - Time Based', fieldName: 'Pressure Lock Time', originalValue: "-", newValue: this.shiftDefault.TimeBasedShiftDefaults.PressureLockTime.toString() });
    this.shiftDefaultChanges.push({ page: '', fieldName: 'Vent Time', originalValue: "-", newValue: this.shiftDefault.TimeBasedShiftDefaults.VentTime.toString() });
    this.shiftDefaultChanges.push({ page: '', fieldName: 'Shift Time', originalValue: "-", newValue: this.shiftDefault.TimeBasedShiftDefaults.ShiftTime.toString() });
    this.shiftDefaultChanges.push({ page: '', fieldName: 'Minimum Reset Time', originalValue: "-", newValue: this.shiftDefault.TimeBasedShiftDefaults.MinimumResetTime.toString() });
  }

  private getShiftDefaultChanges(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.shiftDefaultService.getShiftDefault().subscribe(shiftDefault => {
        let pageName = 'Shift Defaults';
        // Shift Method
        if (this.shiftDefault.ShiftMethod != shiftDefault.ShiftMethod) {
          this.shiftDefaultChanges.push({ page: pageName, fieldName: 'Preferred Shift Method', originalValue: shiftDefault.ShiftMethod, newValue: this.shiftDefault.ShiftMethod });
          pageName = "";
        }

        // Returns Based
        const returnShiftChanges = this.getReturnBasedChanges(this.shiftDefault.ReturnsBasedShiftDefaults, shiftDefault.ReturnsBasedShiftDefaults, true);
        if (returnShiftChanges.length > 0) {
          returnShiftChanges.forEach(changes => this.shiftDefaultChanges.push(changes));
        }

        // Time Based
        const timeShiftChanges = this.getTimeBasedChanges(this.shiftDefault.TimeBasedShiftDefaults, shiftDefault.TimeBasedShiftDefaults);
        if (timeShiftChanges.length > 0) {
          timeShiftChanges.forEach(changes => this.shiftDefaultChanges.push(changes));
        }

        // if (this.shiftDefault.ShiftMethod == shiftDefault.ShiftMethod && this.shiftDefaultChanges.length > 0) {
        //   this.shiftDefaultChanges.unshift({ page: 'Shift Defaults', fieldName: 'Preferred Shift Method', originalValue: shiftDefault.ShiftMethod, newValue: "" });
        //   pageName = "";
        // }

        resolve(true);
      },
        error => {
          console.log(error);
          resolve(true);  // return true - error Handling will still be empty.
        });
    });
  }

  private getReturnBasedChanges(returnsBasedShiftDefault: ReturnsBasedShiftDefaultsModel, dbReturnsBasedShiftDefault: ReturnsBasedShiftDefaultsModel, isPanelDefault?: boolean) {
    let shiftDefaultChanges: SaveConfigurationChanges[] = [];
    //let pageName = isPanelDefault ? (this.shiftDefaultChanges.length == 0 ? "Returns Based" : '') : (this.wellChanges.length == 0 ? "Returns Based" : '');
    let pageName = "Shift Defaults - Returns Based";
    // Tolerance High
    if (returnsBasedShiftDefault.ToleranceHigh != dbReturnsBasedShiftDefault.ToleranceHigh) {
      shiftDefaultChanges.push({ page: `${pageName}`, fieldName: 'Tolerance High', originalValue: dbReturnsBasedShiftDefault.ToleranceHigh.toString(), newValue: returnsBasedShiftDefault.ToleranceHigh.toString() });
      pageName = "";
    }
    // Tolerance Low
    if (returnsBasedShiftDefault.ToleranceLow != dbReturnsBasedShiftDefault.ToleranceLow) {
      shiftDefaultChanges.push({ page: `${pageName}`, fieldName: 'Tolerance Low', originalValue: dbReturnsBasedShiftDefault.ToleranceLow.toString(), newValue: returnsBasedShiftDefault.ToleranceLow.toString() });
      pageName = "";
    }
    // Stabilization Interval
    if (returnsBasedShiftDefault.ReturnFlowStabilizationCheckingPeriodInSeconds != dbReturnsBasedShiftDefault.ReturnFlowStabilizationCheckingPeriodInSeconds) {
      shiftDefaultChanges.push({ page: `${pageName}`, fieldName: 'Stabilization Interval', originalValue: dbReturnsBasedShiftDefault.ReturnFlowStabilizationCheckingPeriodInSeconds.toString(), newValue: returnsBasedShiftDefault.ReturnFlowStabilizationCheckingPeriodInSeconds.toString() });
      pageName = "";
    }
    // Stabilization Flow Rate
    if (returnsBasedShiftDefault.MinimumReturnsFlowRateForStabilization != dbReturnsBasedShiftDefault.MinimumReturnsFlowRateForStabilization) {
      shiftDefaultChanges.push({ page: `${pageName}`, fieldName: 'Stabilization Flow Rate', originalValue: dbReturnsBasedShiftDefault.MinimumReturnsFlowRateForStabilization.toString(), newValue: returnsBasedShiftDefault.MinimumReturnsFlowRateForStabilization.toString() });
      pageName = "";
    }
    // Pressure Lock Time
    if (returnsBasedShiftDefault.PressureLockTime != dbReturnsBasedShiftDefault.PressureLockTime) {
      shiftDefaultChanges.push({ page: `${pageName}`, fieldName: 'Pressure Lock Time', originalValue: dbReturnsBasedShiftDefault.PressureLockTime.toString(), newValue: returnsBasedShiftDefault.PressureLockTime.toString() });
      pageName = "";
    }
    // Vent Time
    if (returnsBasedShiftDefault.VentTime != dbReturnsBasedShiftDefault.VentTime) {
      shiftDefaultChanges.push({ page: `${pageName}`, fieldName: 'Vent Time', originalValue: dbReturnsBasedShiftDefault.VentTime.toString(), newValue: returnsBasedShiftDefault.VentTime.toString() });
      pageName = "";
    }
    // Minimum Shift Time
    if (returnsBasedShiftDefault.MinShiftTime != dbReturnsBasedShiftDefault.MinShiftTime) {
      shiftDefaultChanges.push({ page: `${pageName}`, fieldName: 'Minimum Shift Time', originalValue: dbReturnsBasedShiftDefault.MinShiftTime.toString(), newValue: returnsBasedShiftDefault.MinShiftTime.toString() });
      pageName = "";
    }
    // Maximum Shift Time
    if (returnsBasedShiftDefault.MaxShiftTime != dbReturnsBasedShiftDefault.MaxShiftTime) {
      shiftDefaultChanges.push({ page: `${pageName}`, fieldName: 'Maximum Shift Time', originalValue: dbReturnsBasedShiftDefault.MaxShiftTime.toString(), newValue: returnsBasedShiftDefault.MaxShiftTime.toString() });
      pageName = "";
    }
    // Minimum Reset Time
    if (returnsBasedShiftDefault.MinimumResetTime != dbReturnsBasedShiftDefault.MinimumResetTime) {
      shiftDefaultChanges.push({ page: `${pageName}`, fieldName: 'Minimum Reset Time', originalValue: (dbReturnsBasedShiftDefault.MinimumResetTime / 60).toString(), newValue: (returnsBasedShiftDefault.MinimumResetTime / 60).toString() });
      pageName = "";
    }
    return shiftDefaultChanges;
  }

  private getTimeBasedChanges(timeBasedShiftDefaultsModel: TimeBasedShiftDefaultsModel, dbTimeBasedShiftDefaultsModel: TimeBasedShiftDefaultsModel) {
    let shiftDefaultChanges: SaveConfigurationChanges[] = [];
    let pageName = "Shift Defaults - Time Based";
    // Pressure Lock Time
    if (timeBasedShiftDefaultsModel.PressureLockTime != dbTimeBasedShiftDefaultsModel.PressureLockTime) {
      shiftDefaultChanges.push({ page: `${pageName}`, fieldName: 'Pressure Lock Time', originalValue: dbTimeBasedShiftDefaultsModel.PressureLockTime.toString(), newValue: timeBasedShiftDefaultsModel.PressureLockTime.toString() });
      pageName = "";
    }

    // Vent Time
    if (timeBasedShiftDefaultsModel.VentTime != dbTimeBasedShiftDefaultsModel.VentTime) {
      shiftDefaultChanges.push({ page: `${pageName}`, fieldName: 'Vent Time', originalValue: dbTimeBasedShiftDefaultsModel.VentTime.toString(), newValue: timeBasedShiftDefaultsModel.VentTime.toString() });
      pageName = "";
    }
    // Minimum Shift Time
    if (timeBasedShiftDefaultsModel.ShiftTime != dbTimeBasedShiftDefaultsModel.ShiftTime) {
      shiftDefaultChanges.push({ page: `${pageName}`, fieldName: 'Shift Time', originalValue: dbTimeBasedShiftDefaultsModel.ShiftTime.toString(), newValue: timeBasedShiftDefaultsModel.ShiftTime.toString() });
      pageName = "";
    }
    // Maximum Shift Time
    if (timeBasedShiftDefaultsModel.MinimumResetTime != dbTimeBasedShiftDefaultsModel.MinimumResetTime) {
      shiftDefaultChanges.push({ page: `${pageName}`, fieldName: 'Minimum Reset Time', originalValue: (dbTimeBasedShiftDefaultsModel.MinimumResetTime / 60).toString(), newValue: (timeBasedShiftDefaultsModel.MinimumResetTime / 60).toString() });
      pageName = "";
    }
    return shiftDefaultChanges;
  }

  private showMultinodeWelleFCVPosition(well: MultiNodeWellUIModel) {
    this.eFCVPositionSettings?.PositionStagesData?.forEach((positionStagesData, index) => {
      if (positionStagesData.PositionStage !== DEFAULT_eFCV_POSITIONS_STAGES.STAGE_NOTSET) {
        let pageName = index === 0 ? `${well.WellName} - eFCV Positions` : "";
        this.wellChanges.push({ page: pageName, fieldName: positionStagesData.PositionStageDesc, originalValue: "-", newValue: this.getEFCVPositionDescriptionData(positionStagesData.PositionStage, well.PositionDescriptionData) });
      }
    });
  }

  private showMultinodeWell(well: MultiNodeWellUIModel): void {
    this.wellChanges.push({ page: String.Format("{0} - Well Overview", well.WellName), fieldName: 'Well Name', originalValue: "-", newValue: well.WellName });
    if (well?.TEC?.PowerSupplySettings) {
      this.wellChanges.push(
        { page: `${well.WellName} - TEC Power Supply`, fieldName: 'Max Voltage', originalValue: "-", newValue: well.TEC.PowerSupplySettings.MaxVoltage.toString() },
        { page: '', fieldName: 'Max Current', originalValue: "-", newValue: well.TEC.PowerSupplySettings.MaxCurrent.toString() },
        { page: '', fieldName: 'Target Voltage', originalValue: "-", newValue: well.TEC.PowerSupplySettings.TargetVoltage.toString() },
        { page: '', fieldName: 'Ramp Rate', originalValue: "-", newValue: well.TEC.PowerSupplySettings.RampRate.toString() },
        { page: '', fieldName: 'Settle Voltage', originalValue: "-", newValue: well.TEC.PowerSupplySettings.SettleVoltage.toString() },
        { page: '', fieldName: 'Settle Ramp Rate', originalValue: "-", newValue: well.TEC.PowerSupplySettings.SettleRampRate.toString() }
      );
    }
    if (well?.PositionDescriptionData) {
      this.showMultinodeWelleFCVPosition(well);
      /* this.wellChanges.push(
        { page: `${well.WellName} - eFCV Positions`, fieldName: 'OPEN', originalValue: "-", newValue: well.eFCVPositions.OPEN },
        { page: '', fieldName: 'STAGE_1', originalValue: "-", newValue: well.eFCVPositions.STAGE_1 },
        { page: '', fieldName: 'STAGE_2', originalValue: "-", newValue: well.eFCVPositions.STAGE_2 },
        { page: '', fieldName: 'STAGE_3', originalValue: "-", newValue: well.eFCVPositions.STAGE_3 },
        { page: '', fieldName: 'STAGE_4', originalValue: "-", newValue: well.eFCVPositions.STAGE_4 },
        { page: '', fieldName: 'CLOSED', originalValue: "-", newValue: well.eFCVPositions.CLOSED }
      ); */
    }
    well?.Zones?.forEach(zone => {
      this.showMultinodeZone(well.WellName, zone);
    });
  }

  private showMultinodeZone(wellName, zone: eFCVDataModel): void {
    // eFCV Name   
    this.wellChanges.push({ page: String.Format("{0} - {1}", wellName, zone.ZoneName), fieldName: 'eFCV Name', originalValue: "-", newValue: zone.ZoneName });
    // eFCV Address
    this.wellChanges.push({ page: '', fieldName: 'eFCV Address', originalValue: "-", newValue: zone.Address });
    // Unique Address
    this.wellChanges.push({ page: '', fieldName: 'Unique Address', originalValue: "-", newValue: zone.UId });
    // Serial Number
    this.wellChanges.push({ page: '', fieldName: 'Serial Number', originalValue: "-", newValue: zone.SerialNumber });
    // Measured Depth
    this.wellChanges.push({ page: '', fieldName: 'Measured Depth', originalValue: "-", newValue: zone.MeasuredDepth.toString() });
    if (zone.MotorSettings) {
      this.wellChanges.push(
        { page: `${wellName}- ${zone.ZoneName}- Motor Settings`, fieldName: 'Max Voltage', originalValue: "-", newValue: zone.MotorSettings.MaxVoltage.toString() },
        { page: '', fieldName: 'Max Current', originalValue: "-", newValue: zone.MotorSettings.MaxCurrent.toString() },
        { page: '', fieldName: 'Target Voltage', originalValue: "-", newValue: zone.MotorSettings.TargetVoltage.toString() },
        { page: '', fieldName: 'Over Current Threshold', originalValue: "-", newValue: zone.MotorSettings.OverCurrentThreshold.toString() },
        { page: '', fieldName: 'Over Current Override', originalValue: "-", newValue: zone.MotorSettings.OverCurrentOverrideFlag ? "Yes" : "No" },
        { page: '', fieldName: 'Duty Cycle', originalValue: "-", newValue: zone.MotorSettings.DutyCycle.toString() }
      );
    }
  }

  private showNewWell(well: InchargeWellUIModel): void {
    this.wellChanges.push({ page: String.Format("{0} - Well Overview", well.WellName), fieldName: 'Well Name', originalValue: "-", newValue: well.WellName });
    well?.Zones?.forEach(zone => {
      this.showNewZone(well.WellName, zone);
    });
  }

  private showNewZone(wellName, zone: InchargeZoneUIModel): void {
    // Zone Name
    this.wellChanges.push({ page: String.Format("{0} - {1}", wellName, zone.ZoneName), fieldName: 'Zone Name', originalValue: "-", newValue: zone.ZoneName });
    // Measured Depth
    this.wellChanges.push({ page: '', fieldName: 'Measured Depth', originalValue: "-", newValue: zone.MeasuredDepth.toString() });
  }

  private getTECPowerSupplyChanges(well: MultiNodeWellUIModel, origWell: MultiNodeWellUIModel) {
    let PowerSupplySettings = well?.TEC?.PowerSupplySettings;
    let origPowerSupplySettings = origWell?.TEC?.PowerSupplySettings;
    if (PowerSupplySettings && origPowerSupplySettings) {
      let pageName = `${well?.WellName} - TEC Power Supply`;
      if (PowerSupplySettings.MaxVoltage != origPowerSupplySettings.MaxVoltage) {
        this.wellChanges.push({ page: pageName, fieldName: 'Max Voltage', originalValue: origPowerSupplySettings.MaxVoltage.toString(), newValue: PowerSupplySettings.MaxVoltage.toString() });
        pageName = "";
      }
      if (PowerSupplySettings.MaxCurrent != origPowerSupplySettings.MaxCurrent) {
        this.wellChanges.push({ page: pageName, fieldName: 'Max Current', originalValue: origPowerSupplySettings.MaxCurrent.toString(), newValue: PowerSupplySettings.MaxCurrent.toString() });
        pageName = "";
      }
      if (PowerSupplySettings.TargetVoltage != origPowerSupplySettings.TargetVoltage) {
        this.wellChanges.push({ page: pageName, fieldName: 'Target Voltage', originalValue: origPowerSupplySettings.TargetVoltage.toString(), newValue: PowerSupplySettings.TargetVoltage.toString() });
        pageName = "";
      }
      if (PowerSupplySettings.RampRate != origPowerSupplySettings.RampRate) {
        this.wellChanges.push({ page: pageName, fieldName: 'Ramp Rate', originalValue: origPowerSupplySettings.RampRate.toString(), newValue: PowerSupplySettings.RampRate.toString() });
        pageName = "";
      }
      if (PowerSupplySettings.SettleVoltage != origPowerSupplySettings.SettleVoltage) {
        this.wellChanges.push({ page: pageName, fieldName: 'Settle Voltage', originalValue: origPowerSupplySettings.SettleVoltage.toString(), newValue: PowerSupplySettings.SettleVoltage.toString() });
        pageName = "";
      }
      if (PowerSupplySettings.SettleRampRate != origPowerSupplySettings.SettleRampRate) {
        this.wellChanges.push({ page: pageName, fieldName: 'Settle Ramp Rate', originalValue: origPowerSupplySettings.SettleRampRate.toString(), newValue: PowerSupplySettings.SettleRampRate.toString() });
        pageName = "";
      }
    }
  }

  private getWelleFCVPositionsChanges(well: MultiNodeWellUIModel, origWell: MultiNodeWellUIModel) {
    let eFCVPositions = well?.PositionDescriptionData;
    let origeFCVPostions = origWell?.PositionDescriptionData;
    if (eFCVPositions && origeFCVPostions) {
      let pageName = `${well?.WellName} - eFCV Positions`;
      this.eFCVPositionSettings?.PositionStagesData?.forEach((positionStagesData, index) => {
        if (positionStagesData.PositionStage !== DEFAULT_eFCV_POSITIONS_STAGES.STAGE_NOTSET) {
          let origPosition = this.getEFCVPositionDescriptionData(positionStagesData.PositionStage, origeFCVPostions);
          let newPosition = this.getEFCVPositionDescriptionData(positionStagesData.PositionStage, eFCVPositions);
          if (origPosition != newPosition) {
            this.wellChanges.push({ page: pageName, fieldName: positionStagesData.PositionStageDesc, originalValue: origPosition, newValue: newPosition });
            pageName = "";
          }
        }
      });
      /* let pageName = `${well?.WellName} - eFCV Positions`;
       if (eFCVPositions.OPEN != origeFCVPostions.OPEN) {
        this.wellChanges.push({ page: pageName, fieldName: 'OPEN', originalValue: origeFCVPostions.OPEN, newValue: eFCVPositions.OPEN });
        pageName = "";
      }
      if (eFCVPositions.STAGE_1 != origeFCVPostions.STAGE_1) {
        this.wellChanges.push({ page: pageName, fieldName: 'STAGE_1', originalValue: origeFCVPostions.STAGE_1, newValue: eFCVPositions.STAGE_1 });
        pageName = "";
      }
      if (eFCVPositions.STAGE_2 != origeFCVPostions.STAGE_2) {
        this.wellChanges.push({ page: pageName, fieldName: 'STAGE_2', originalValue: origeFCVPostions.STAGE_2, newValue: eFCVPositions.STAGE_2 });
        pageName = "";
      }
      if (eFCVPositions.STAGE_3 != origeFCVPostions.STAGE_3) {
        this.wellChanges.push({ page: pageName, fieldName: 'STAGE_3', originalValue: origeFCVPostions.STAGE_3, newValue: eFCVPositions.STAGE_3 });
        pageName = "";
      }
      if (eFCVPositions.STAGE_4 != origeFCVPostions.STAGE_4) {
        this.wellChanges.push({ page: pageName, fieldName: 'STAGE_4', originalValue: origeFCVPostions.STAGE_4, newValue: eFCVPositions.STAGE_4 });
        pageName = "";
      }
      if (eFCVPositions.CLOSED != origeFCVPostions.CLOSED) {
        this.wellChanges.push({ page: pageName, fieldName: 'CLOSED', originalValue: origeFCVPostions.CLOSED, newValue: eFCVPositions.CLOSED });
        pageName = "";
      } */
    }
  }

  private getMultinodeWellChanges(well): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.wellService.getWell(well.WellId).subscribe(origWell => {
        let pageName = String.Format("{0} - Well Overview", well.WellName);
        // Well Name
        if (well.WellName != origWell.WellName) {
          this.wellChanges.push({ page: pageName, fieldName: 'Well Name', originalValue: origWell.WellName, newValue: well.WellName });
          pageName = "";
        }
        if (this.panelConfigurationCommon.PanelTypeId === PanelTypeList.MultiNode) {
          this.getTECPowerSupplyChanges(well, origWell as MultiNodeWellUIModel);
          this.getWelleFCVPositionsChanges(well, origWell as MultiNodeWellUIModel);

          well.Zones.forEach(zone => {
            if (zone.ZoneId < 0)  // new Zone
              this.showMultinodeZone(well.WellName, zone);
            else {
              pageName = String.Format("{0} - {1}", well.WellName, zone.ZoneName);
              let origZone = (origWell as MultiNodeWellUIModel).Zones?.find(z => z.ZoneId === zone.ZoneId);
              // eFCV Name
              if (origZone && zone.ZoneName != origZone.ZoneName) {
                this.wellChanges.push({ page: pageName, fieldName: 'eFCV Name', originalValue: origZone.ZoneName, newValue: zone.ZoneName });
                pageName = "";
              }
              // eFCV Address
              if (origZone && zone.Address != origZone.Address) {
                this.wellChanges.push({ page: pageName, fieldName: 'eFCV Address', originalValue: origZone.Address, newValue: zone.Address });
                pageName = "";
              }
              // Unique Address
              if (origZone && zone.UId != origZone.UId) {
                this.wellChanges.push({ page: pageName, fieldName: 'Unique Address', originalValue: origZone.UId, newValue: zone.UId });
                pageName = "";
              }
              // Serial Number
              if (origZone && zone.SerialNumber != origZone.SerialNumber) {
                this.wellChanges.push({ page: pageName, fieldName: 'Serial Number', originalValue: origZone.SerialNumber, newValue: zone.SerialNumber });
                pageName = "";
              }
              // Measured Depth
              if (origZone && zone.MeasuredDepth != origZone.MeasuredDepth) {
                this.wellChanges.push({ page: pageName, fieldName: 'Measured Depth', originalValue: origZone.MeasuredDepth.toString(), newValue: zone.MeasuredDepth.toString() });
                pageName = "";
              }
              if (zone.MotorSettings) {
                pageName = String.Format("{0} - {1} - Motor Settings", well.WellName, zone.ZoneName);
                if (origZone && zone.MotorSettings.MaxVoltage != origZone.MotorSettings.MaxVoltage) {
                  this.wellChanges.push({ page: pageName, fieldName: 'Max Voltage', originalValue: origZone.MotorSettings.MaxVoltage.toString(), newValue: zone.MotorSettings.MaxVoltage.toString() });
                  pageName = "";
                }
                if (origZone && zone.MotorSettings.MaxCurrent != origZone.MotorSettings.MaxCurrent) {
                  this.wellChanges.push({ page: pageName, fieldName: 'Max Current', originalValue: origZone.MotorSettings.MaxCurrent.toString(), newValue: zone.MotorSettings.MaxCurrent.toString() });
                  pageName = "";
                }
                if (origZone && zone.MotorSettings.TargetVoltage != origZone.MotorSettings.TargetVoltage) {
                  this.wellChanges.push({ page: pageName, fieldName: 'Target Voltage', originalValue: origZone.MotorSettings.TargetVoltage.toString(), newValue: zone.MotorSettings.TargetVoltage.toString() });
                  pageName = "";
                }
                if (origZone && zone.MotorSettings.OverCurrentThreshold != origZone.MotorSettings.OverCurrentThreshold) {
                  this.wellChanges.push({ page: pageName, fieldName: 'Over Current Threshold', originalValue: origZone.MotorSettings.OverCurrentThreshold.toString(), newValue: zone.MotorSettings.OverCurrentThreshold.toString() });
                  pageName = "";
                }
                if (origZone) {
                  const OverCurrentOverrideFlag = zone.MotorSettings.OverCurrentOverrideFlag ? 'Yes' : 'No';
                  const OverCurrentOverrideFlagDb = origZone.MotorSettings.OverCurrentOverrideFlag ? 'Yes' : 'No';
                  if (OverCurrentOverrideFlag != OverCurrentOverrideFlagDb) {
                    this.wellChanges.push({ page: pageName, fieldName: 'Over Current Override', originalValue: OverCurrentOverrideFlagDb, newValue: OverCurrentOverrideFlag });
                    pageName = "";
                  }
                }
                if (origZone && zone.MotorSettings.DutyCycle != origZone.MotorSettings.DutyCycle) {
                  this.wellChanges.push({ page: pageName, fieldName: 'Duty Cycle', originalValue: origZone.MotorSettings.DutyCycle.toString(), newValue: zone.MotorSettings.DutyCycle.toString() });
                  pageName = "";
                }
              }
            }
          });
        }
        resolve(true);
      },
        error => {
          console.log(error);
          resolve(true);  // return true -well changes will still be empty.
        });
    });
  }

  private getWellChanges(well): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.wellService.getWell(well.WellId).subscribe(origWell => {
        let pageName = String.Format("{0} - Well Overview", well.WellName);
        // Well Name
        if (well.WellName != origWell.WellName) {
          this.wellChanges.push({ page: pageName, fieldName: 'Well Name', originalValue: origWell.WellName, newValue: well.WellName });
          pageName = "";
        }
        if (this.panelConfigurationCommon.PanelTypeId !== PanelTypeList.SURESENS) {
          well.Zones.forEach(zone => {
            if (zone.ZoneId < 0)  // new Zone
              this.showNewZone(well.WellName, zone);
            else {
              pageName = String.Format("{0} - {1}", well.WellName, zone.ZoneName);
              let origZone = (origWell as InchargeWellUIModel).Zones?.find(z => z.ZoneId === zone.ZoneId);
              // Zone Name
              if (this.panelConfigurationCommon.PanelTypeId !== PanelTypeList.SURESENS && origZone && zone.ZoneName != origZone.ZoneName) {
                this.wellChanges.push({ page: pageName, fieldName: 'Zone Name', originalValue: origZone.ZoneName, newValue: zone.ZoneName });
                pageName = "";
              }
              // Measured Depth
              if (origZone && zone.MeasuredDepth != origZone.MeasuredDepth) {
                this.wellChanges.push({ page: pageName, fieldName: 'Measured Depth', originalValue: origZone.MeasuredDepth.toString(), newValue: zone.MeasuredDepth.toString() });
                pageName = "";
              }
            }
          });
        }
        resolve(true);
      },
        error => {
          console.log(error);
          resolve(true);  // return true -well changes will still be empty.
        });
    });
  }

  private getInforceWellChanges(well: InforceWellUIModel): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.wellService.getWell(well.WellId).subscribe(origWell => {
        let pageName = `${well.WellName} - Well Overview`;
        // Well Name
        if (well.WellName != origWell.WellName) {
          this.wellChanges.push({ page: pageName, fieldName: 'Well Name', originalValue: origWell.WellName, newValue: well.WellName });
          pageName = "";
        }

        if (well.ControlArchitectureId !== INFORCE_WELL_ARCHITECTURE.SURESENS) {
          if (origWell?.WellId > 0) {
            // Well Shift Settings
            this.getWellShiftSettingChanges(well, origWell as InforceWellUIModel);

            // Output Mapping
            this.getOutputMappingChanges(well, origWell as InforceWellUIModel);

            // Zone Mapping
            this.getZoneMappingChanges(well, origWell as InforceWellUIModel);
          }

          // Zone details
          well?.Zones?.forEach((zone) => {
            if (zone.ZoneId < 0) {
              this.showNewInforceZone(well, zone);
            } else {
              let pageName = `${well.WellName}- ${zone.ZoneName}`;
              let origZone = (origWell as InforceWellUIModel).Zones?.find(z => z.ZoneId === zone.ZoneId);
              if (origZone?.ZoneId > 0) {
                // zone Name
                if (zone.ZoneName !== origZone.ZoneName) {
                  this.wellChanges.push(
                    { page: `${pageName}`, fieldName: 'Zone Name', originalValue: origZone.ZoneName, newValue: zone.ZoneName }
                  );
                  pageName = "";
                }
                if (zone.ValveType !== ZONE_VALVE_TYPE.Monitoring) {
                  const valveTypeName = this.zoneValveTypeList.find(v => v.Id === zone.ValveType).ValveName;
                  const orgValveTypeName = this.zoneValveTypeList.find(v => v.Id === origZone.ValveType).ValveName;
                  // Zone Shift Settings
                  this.getZoneShiftSettingChanges(zone, origZone, well.WellName);

                  // valve Type
                  if (zone.ValveType !== origZone.ValveType) {
                    this.wellChanges.push(
                      { page: `${pageName}`, fieldName: 'Valve Type', originalValue: orgValveTypeName, newValue: valveTypeName }
                    );
                    pageName = "";
                  }
                  // Number of Positions
                  if (zone.NumberOfPositions !== origZone.NumberOfPositions) {
                    this.wellChanges.push(
                      { page: `${pageName}`, fieldName: 'Number of Positions', originalValue: origZone.NumberOfPositions.toString(), newValue: zone.NumberOfPositions.toString() }
                    );
                    pageName = "";
                  }
                }
                // Measured Depth
                if (origZone && zone.MeasuredDepth != origZone.MeasuredDepth) {
                  this.wellChanges.push({ page: `${pageName}`, fieldName: 'Measured Depth', originalValue: origZone.MeasuredDepth.toString(), newValue: zone.MeasuredDepth.toString() });
                  pageName = "";
                }
                if (zone.ValveType !== ZONE_VALVE_TYPE.Monitoring) {
                  const valveTypeName = this.zoneValveTypeList.find(v => v.Id === zone.ValveType).ValveName;
                  this.getZoneValPosReturnChanges(zone, origZone, `${well.WellName}- ${zone.ZoneName}- ${valveTypeName}`);
                }
              }
            }
          });
          resolve(true);
        } else {
          resolve(true);
        }

      },
        error => {
          console.log(error);
          resolve(true);  // return true -well changes will still be empty.
        });
    });
  }

  showWellShiftSetting(well: InforceWellUIModel) {
    this.wellChanges.push({ page: '', fieldName: 'Preferred Shift Method', originalValue: "-", newValue: well.ShiftMethod });
    // Returns Based
    this.wellChanges.push({ page: 'Returns Based', fieldName: 'Tolerance High', originalValue: "-", newValue: well.ReturnsBasedShiftDefaults.ToleranceHigh.toString(), subHeader: true });
    this.wellChanges.push({ page: '', fieldName: 'Tolerance Low', originalValue: "-", newValue: well.ReturnsBasedShiftDefaults.ToleranceLow.toString() });
    this.wellChanges.push({ page: '', fieldName: 'Stabilization Interval', originalValue: "-", newValue: well.ReturnsBasedShiftDefaults.ReturnFlowStabilizationCheckingPeriodInSeconds.toString() });
    this.wellChanges.push({ page: '', fieldName: 'Stabilization Flow Rate', originalValue: "-", newValue: well.ReturnsBasedShiftDefaults.MinimumReturnsFlowRateForStabilization.toString() });
    this.wellChanges.push({ page: '', fieldName: 'Pressure Lock Time', originalValue: "-", newValue: well.ReturnsBasedShiftDefaults.PressureLockTime.toString() });
    this.wellChanges.push({ page: '', fieldName: 'Vent Time', originalValue: "-", newValue: well.ReturnsBasedShiftDefaults.VentTime.toString() });
    this.wellChanges.push({ page: '', fieldName: 'Minimum Shift Time', originalValue: "-", newValue: well.ReturnsBasedShiftDefaults.MinShiftTime.toString() });
    this.wellChanges.push({ page: '', fieldName: 'Maximum Shift Time', originalValue: "-", newValue: well.ReturnsBasedShiftDefaults.MaxShiftTime.toString() });
    if (well.ControlArchitectureId !== INFORCE_WELL_ARCHITECTURE.N_PlUS_ONE) {
      this.wellChanges.push({ page: '', fieldName: 'Minimum Reset Time', originalValue: "-", newValue: well.ReturnsBasedShiftDefaults.MinimumResetTime.toString() });
    }
    //Time based
    this.wellChanges.push({ page: 'Time Based', fieldName: 'Pressure Lock Time', originalValue: "-", newValue: well.TimeBasedShiftDefaults.PressureLockTime.toString(), subHeader: true });
    this.wellChanges.push({ page: '', fieldName: 'Vent Time', originalValue: "-", newValue: well.TimeBasedShiftDefaults.VentTime.toString() });
    this.wellChanges.push({ page: '', fieldName: 'Shift Time', originalValue: "-", newValue: well.TimeBasedShiftDefaults.ShiftTime.toString() });
    if (well.ControlArchitectureId !== INFORCE_WELL_ARCHITECTURE.N_PlUS_ONE) {
      this.wellChanges.push({ page: '', fieldName: 'Minimum Reset Time', originalValue: "-", newValue: well.TimeBasedShiftDefaults.MinimumResetTime.toString() });
    }
  }

  getWellShiftSettingChanges(well: InforceWellUIModel, wellInDb: InforceWellUIModel) {

    if (well.IsPanelLevelShiftDefaultApplied !== wellInDb.IsPanelLevelShiftDefaultApplied) {
      this.wellChanges.push({
        page: `${well.WellName} - Shift Settings`,
        fieldName: 'Preferred Shift Settings',
        originalValue: wellInDb.IsPanelLevelShiftDefaultApplied ? 'Panel Level Shift Settings' : 'Custom Well Level Shift Settings',
        newValue: well.IsPanelLevelShiftDefaultApplied ? 'Panel Level Shift Settings' : 'Custom Well Level Shift Settings'
      });
      this.wellChanges.push({
        page: '',
        fieldName: 'Preferred Shift Method',
        originalValue: wellInDb.ShiftMethod,
        newValue: well.ShiftMethod
      });
    } else if (well.ShiftMethod !== wellInDb.ShiftMethod) {
      this.wellChanges.push({
        page: `${well.WellName} - Shift Settings`,
        fieldName: 'Preferred Shift Method',
        originalValue: wellInDb.ShiftMethod,
        newValue: well.ShiftMethod
      });
    }
    if (wellInDb) this.getWellReturnTimebasedChanges(well, wellInDb);
  }

  getWellReturnTimebasedChanges(well: InforceWellUIModel, wellInDb: InforceWellUIModel) {
    const returnShiftChanges = wellInDb ? this.getReturnBasedChanges(well.ReturnsBasedShiftDefaults, wellInDb.ReturnsBasedShiftDefaults) : [];
    if (returnShiftChanges.length > 0) {
      returnShiftChanges.forEach(changes => {
        if (this.wellChanges.length > 0) {
          this.wellChanges.push(changes);
        } else {
          this.wellChanges.unshift({
            page: `${well.WellName}- Shift Settings`,
            fieldName: 'Preferred Shift Method',
            originalValue: wellInDb.ShiftMethod,
            newValue: well.ShiftMethod
          });
          this.wellChanges.push(changes);
        }
      });
    }
    const timeShiftChanges = wellInDb ? this.getTimeBasedChanges(well.TimeBasedShiftDefaults, wellInDb.TimeBasedShiftDefaults) : [];
    if (timeShiftChanges.length > 0) {
      timeShiftChanges.forEach(changes => {
        if (this.wellChanges.length > 0) {
          this.wellChanges.push(changes);
        } else {
          this.wellChanges.unshift({
            page: `${well.WellName}- Shift Settings`,
            fieldName: 'Preferred Shift Method',
            originalValue: wellInDb.ShiftMethod,
            newValue: well.ShiftMethod
          });
          this.wellChanges.push(changes);
        }
      });
    }
  }

  getOutputMappingChanges(well: InforceWellUIModel, wellInDb: InforceWellUIModel) {
    let pageName = `${well.WellName}- Output Mapping`;
    well?.PanelToLineMappings?.forEach((panelToLineMapping, index) => {
      let orgPanelToLineMapping = wellInDb.PanelToLineMappings.find(plm => plm.PanelToLineMappingsId === panelToLineMapping.PanelToLineMappingsId);
      if (orgPanelToLineMapping) {
        if (index === 0) {
          if (panelToLineMapping.PanelConnection !== orgPanelToLineMapping.PanelConnection) {
            this.wellChanges.push(
              { page: `${pageName}`, fieldName: 'Panel Connection', originalValue: orgPanelToLineMapping.PanelConnection, newValue: panelToLineMapping.PanelConnection }
            );
            pageName = "";
          }
          if (panelToLineMapping.DownholeLine !== orgPanelToLineMapping.DownholeLine) {
            this.wellChanges.push(
              { page: `${pageName}`, fieldName: 'Downhole Line', originalValue: orgPanelToLineMapping.DownholeLine, newValue: panelToLineMapping.DownholeLine }
            );
            pageName = "";
          }
        } else {
          if (panelToLineMapping.PanelConnection !== orgPanelToLineMapping.PanelConnection) {
            this.wellChanges.push(
              { page: `${pageName}`, fieldName: 'Panel Connection', originalValue: orgPanelToLineMapping.PanelConnection, newValue: panelToLineMapping.PanelConnection }
            );
            pageName = "";
          }
          if (panelToLineMapping.DownholeLine !== orgPanelToLineMapping.DownholeLine) {
            this.wellChanges.push(
              { page: `${pageName}`, fieldName: 'Downhole Line', originalValue: orgPanelToLineMapping.DownholeLine, newValue: panelToLineMapping.DownholeLine }
            );
            pageName = "";
          }
        }
      }
    });
  }

  getZoneMappingChanges(well: InforceWellUIModel, wellInDb: InforceWellUIModel) {
    let pageName = `${well.WellName}- Zone Mapping`;
    well?.LineToZoneMapping?.forEach((lineToZoneMapping) => {
      let orgLinetoZoneMapping = wellInDb.LineToZoneMapping.find(lzm => lzm.Id === lineToZoneMapping.Id);
      if (orgLinetoZoneMapping) {
        if (lineToZoneMapping.OpenLine !== orgLinetoZoneMapping.OpenLine) {
          this.wellChanges.push(
            { page: `${pageName}`, fieldName: 'Open Line', originalValue: orgLinetoZoneMapping.OpenLine, newValue: lineToZoneMapping.OpenLine }
          );
          pageName = "";
        }
        if (lineToZoneMapping.CloseLine !== orgLinetoZoneMapping.CloseLine) {
          this.wellChanges.push(
            { page: `${pageName}`, fieldName: 'Close Line', originalValue: orgLinetoZoneMapping.CloseLine, newValue: lineToZoneMapping.CloseLine }
          );
          pageName = "";
        }
      }
    });
  }

  getZoneValPosReturnChanges(zone: InforceZoneUIModel, zoneInDb: InforceZoneUIModel, pageName) {
    // Current Position
    if (zone.CurrentPosition != zoneInDb.CurrentPosition) {
      this.wellChanges.push(
        { page: `${pageName}`, fieldName: 'Current Position', originalValue: zoneInDb.CurrentPosition.toString(), newValue: zone.CurrentPosition.toString() },
      );
      pageName = '';
    }
    const ValPosReturnCount = zoneInDb.ValvePositionsAndReturns.length;
    zone.ValvePositionsAndReturns?.forEach((valPosAndReturn, index) => {
      const valPosReturnIdx = zoneInDb.ValvePositionsAndReturns.findIndex(vp => vp.Id === valPosAndReturn.Id);
      let valPosAndReturnInDb = valPosReturnIdx !== -1 ? zoneInDb.ValvePositionsAndReturns[valPosReturnIdx] : zoneInDb.ValvePositionsAndReturns[index];
      if ((index + 1) <= ValPosReturnCount) {
        // From Position
        if (valPosAndReturn.FromPosition != valPosAndReturnInDb.FromPosition) {
          this.wellChanges.push(
            { page: `${pageName}`, fieldName: 'From Position', originalValue: valPosAndReturnInDb.FromPosition.toString(), newValue: valPosAndReturn.FromPosition.toString() },
          );
          pageName = '';
        }
        // To Position
        if (valPosAndReturn.ToPosition != valPosAndReturnInDb.ToPosition) {
          this.wellChanges.push(
            { page: `${pageName}`, fieldName: 'To Position', originalValue: valPosAndReturnInDb.ToPosition.toString(), newValue: valPosAndReturn.ToPosition.toString() },
          );
          pageName = '';
        }

        // Position Description
        if (valPosAndReturn.Description != valPosAndReturnInDb.Description) {
          this.wellChanges.push(
            { page: `${pageName}`, fieldName: 'Position Description', originalValue: valPosAndReturnInDb.Description, newValue: valPosAndReturn.Description },
          );
          pageName = '';
        }
        // Return Volume
        if (valPosAndReturn.ReturnVolume.toFixed(2) != valPosAndReturnInDb.ReturnVolume.toFixed(2)) {
          this.wellChanges.push(
            { page: `${pageName}`, fieldName: 'Return Volume', originalValue: valPosAndReturnInDb.ReturnVolume.toFixed(2).toString(), newValue: valPosAndReturn.ReturnVolume.toString() },
          );
          pageName = '';
        }
        // User Selectable
        const userSelectable = valPosAndReturn.UserSelectable ? 'Yes' : 'No';
        const userSelectableDb = valPosAndReturnInDb.UserSelectable ? 'Yes' : 'No';
        if (userSelectable != userSelectableDb) {
          this.wellChanges.push(
            { page: `${pageName}`, fieldName: 'User Selectable', originalValue: userSelectableDb, newValue: userSelectable },
          );
          pageName = '';
        }
      } else {
        this.wellChanges.push(
          { page: `${pageName}`, fieldName: 'From Position', originalValue: "-", newValue: valPosAndReturn.FromPosition.toString() },
          { page: '', fieldName: 'To Position', originalValue: "-", newValue: valPosAndReturn.ToPosition.toString() },
          { page: '', fieldName: 'Current Position', originalValue: "-", newValue: zone.CurrentPosition.toString() },
          { page: '', fieldName: 'Position Description', originalValue: "-", newValue: valPosAndReturn.Description },
          { page: '', fieldName: 'Return Volume', originalValue: "-", newValue: valPosAndReturn.ReturnVolume.toString() },
          { page: '', fieldName: 'User Selectable', originalValue: "-", newValue: valPosAndReturn.UserSelectable ? 'Yes' : 'No' }
        );
      }
    });
  }

  showZoneShiftSetting(wellArchId: number, zone: InforceZoneUIModel) {
    this.wellChanges.push({ page: '', fieldName: 'Preferred Shift Method', originalValue: "-", newValue: zone.ShiftMethod });
    // Returns Based
    this.wellChanges.push({ page: 'Returns Based', fieldName: 'Tolerance High', originalValue: "-", newValue: zone.ReturnsBasedShiftDefaults.ToleranceHigh.toString(), subHeader: true });
    this.wellChanges.push({ page: '', fieldName: 'Tolerance Low', originalValue: "-", newValue: zone.ReturnsBasedShiftDefaults.ToleranceLow.toString() });
    this.wellChanges.push({ page: '', fieldName: 'Stabilization Interval', originalValue: "-", newValue: zone.ReturnsBasedShiftDefaults.ReturnFlowStabilizationCheckingPeriodInSeconds.toString() });
    this.wellChanges.push({ page: '', fieldName: 'Stabilization Flow Rate', originalValue: "-", newValue: zone.ReturnsBasedShiftDefaults.MinimumReturnsFlowRateForStabilization.toString() });
    this.wellChanges.push({ page: '', fieldName: 'Pressure Lock Time', originalValue: "-", newValue: zone.ReturnsBasedShiftDefaults.PressureLockTime.toString() });
    this.wellChanges.push({ page: '', fieldName: 'Vent Time', originalValue: "-", newValue: zone.ReturnsBasedShiftDefaults.VentTime.toString() });
    this.wellChanges.push({ page: '', fieldName: 'Minimum Shift Time', originalValue: "-", newValue: zone.ReturnsBasedShiftDefaults.MinShiftTime.toString() });
    this.wellChanges.push({ page: '', fieldName: 'Maximum Shift Time', originalValue: "-", newValue: zone.ReturnsBasedShiftDefaults.MaxShiftTime.toString() });
    if (wellArchId !== INFORCE_WELL_ARCHITECTURE.N_PlUS_ONE) {
      this.wellChanges.push({ page: '', fieldName: 'Minimum Reset Time', originalValue: "-", newValue: zone.ReturnsBasedShiftDefaults.MinimumResetTime.toString() });
    }
    //Time based
    this.wellChanges.push({ page: 'Time Based', fieldName: 'Pressure Lock Time', originalValue: "-", newValue: zone.TimeBasedShiftDefaults.PressureLockTime.toString(), subHeader: true });
    this.wellChanges.push({ page: '', fieldName: 'Vent Time', originalValue: "-", newValue: zone.TimeBasedShiftDefaults.VentTime.toString() });
    this.wellChanges.push({ page: '', fieldName: 'Shift Time', originalValue: "-", newValue: zone.TimeBasedShiftDefaults.ShiftTime.toString() });
    if (wellArchId !== INFORCE_WELL_ARCHITECTURE.N_PlUS_ONE) {
      this.wellChanges.push({ page: '', fieldName: 'Minimum Reset Time', originalValue: "-", newValue: zone.TimeBasedShiftDefaults.MinimumResetTime.toString() });
    }
  }

  getZoneShiftSettingChanges(zone: InforceZoneUIModel, zoneinDb: InforceZoneUIModel, wellName: string) {
    if (zone.IsWellLevelShiftDefaultApplied !== zoneinDb.IsWellLevelShiftDefaultApplied) {
      this.wellChanges.push({
        page: `${wellName}- ${zone.ZoneName} - Shift Settings`,
        fieldName: 'Preferred Shift Settings',
        originalValue: zoneinDb.IsWellLevelShiftDefaultApplied ? 'Well Level Shift Settings' : 'Custom Zone Level Shift Settings',
        newValue: zone.IsWellLevelShiftDefaultApplied ? 'Well Level Shift Settings' : 'Custom Zone Level Shift Settings'
      });

      this.wellChanges.push({
        page: '',
        fieldName: 'Preferred Shift Method',
        originalValue: zoneinDb.ShiftMethod,
        newValue: zone.ShiftMethod
      });

    } else if (zone.ShiftMethod !== zoneinDb.ShiftMethod) {
      this.wellChanges.push({
        page: `${wellName}- ${zone.ZoneName} - Shift Settings`,
        fieldName: 'Preferred Shift Method',
        originalValue: zoneinDb.ShiftMethod,
        newValue: zone.ShiftMethod
      });

    }
    if (!zone.IsWellLevelShiftDefaultApplied) this.getZoneReturnTimebasedChanges(zone, zoneinDb, wellName);
  }

  getZoneReturnTimebasedChanges(zone: InforceZoneUIModel, zoneinDb: InforceZoneUIModel, wellName) {
    const returnShiftChanges = zoneinDb ? this.getReturnBasedChanges(zone.ReturnsBasedShiftDefaults, zoneinDb.ReturnsBasedShiftDefaults) : [];
    if (returnShiftChanges.length > 0) {
      returnShiftChanges.forEach(changes => {
        if (this.wellChanges.length > 0) {
          const zoneChangesIdx = this.wellChanges.findIndex(wc => wc.fieldName === 'Preferred Shift Settings' || wc.fieldName === 'Preferred Shift Method');
          if (zoneChangesIdx !== -1) {
            this.wellChanges.push(changes);
          } else {
            this.appendZoneShiftSettingHeader(wellName, zone, zoneinDb);
            this.wellChanges.push(changes);
          }
        } else {
          this.appendZoneShiftSettingHeader(wellName, zone, zoneinDb);
          this.wellChanges.push(changes);
        }
      });
    }
    const timeShiftChanges = zoneinDb ? this.getTimeBasedChanges(zone.TimeBasedShiftDefaults, zoneinDb.TimeBasedShiftDefaults) : [];
    if (timeShiftChanges.length > 0) {
      timeShiftChanges.forEach(changes => {
        if (this.wellChanges.length > 0) {
          const zoneChangesIdx = this.wellChanges.findIndex(wc => wc.fieldName === 'Preferred Shift Settings' || wc.fieldName === 'Preferred Shift Method');
          if (zoneChangesIdx !== -1) {
            this.wellChanges.push(changes);
          } else {
            this.appendZoneShiftSettingHeader(wellName, zone, zoneinDb);
            this.wellChanges.push(changes);
          }
        } else {
          this.appendZoneShiftSettingHeader(wellName, zone, zoneinDb);
          this.wellChanges.push(changes);
        }
      });
    }
  }

  appendZoneShiftSettingHeader(wellName, zone, zoneinDb) {
    this.wellChanges.push({
      page: `${wellName}- ${zone.ZoneName} - Shift Settings`,
      fieldName: 'Preferred Shift Method',
      originalValue: zoneinDb.ShiftMethod,
      newValue: zone.ShiftMethod
    });
  }

  showNewInforceZone(well: InforceWellUIModel, zone: InforceZoneUIModel): void {

    const valveTypeName = this.zoneValveTypeList.find(v => v.Id === zone.ValveType).ValveName;
    this.wellChanges.push(
      { page: `${well.WellName}- ${zone.ZoneName}`, fieldName: 'Zone Name', originalValue: "-", newValue: zone.ZoneName }
    );
    if (zone.ValveType !== ZONE_VALVE_TYPE.Monitoring) {
      this.wellChanges.push(
        { page: '', fieldName: 'Valve Type', originalValue: "-", newValue: valveTypeName },
        { page: '', fieldName: 'Number of Positions', originalValue: "-", newValue: zone.NumberOfPositions.toString() }
      );
    }
    this.wellChanges.push(
      { page: '', fieldName: 'Measured Depth', originalValue: "-", newValue: zone.MeasuredDepth.toString() }
    );
    if (zone.ValveType !== ZONE_VALVE_TYPE.Monitoring) {
      zone.ValvePositionsAndReturns?.forEach((valPosAndReturn, index) => {
        this.wellChanges.push(
          { page: `${well.WellName}- ${zone.ZoneName}- ${valveTypeName}`, fieldName: 'From Position', originalValue: "-", newValue: valPosAndReturn.FromPosition.toString() },
          { page: '', fieldName: 'To Position', originalValue: "-", newValue: valPosAndReturn.ToPosition.toString() },
          { page: '', fieldName: 'Current Position', originalValue: "-", newValue: zone.CurrentPosition.toString() },
          { page: '', fieldName: 'Position Description', originalValue: "-", newValue: valPosAndReturn.Description },
          { page: '', fieldName: 'Return Volume', originalValue: "-", newValue: valPosAndReturn.ReturnVolume.toString() },
          { page: '', fieldName: 'User Selectable', originalValue: "-", newValue: valPosAndReturn.UserSelectable ? 'Yes' : 'No' }
        );
      });
    }
    // Zone Shift Setting
    if (zone.ValveType !== ZONE_VALVE_TYPE.Monitoring) {
      if (zone.IsWellLevelShiftDefaultApplied) {
        this.wellChanges.push({ page: `${well.WellName}- ${zone.ZoneName}- Shift Settings`, fieldName: 'Preferred Shift Settings', originalValue: "-", newValue: 'Well Level Shift Settings' });
      } else {
        this.wellChanges.push({ page: `${well.WellName}- ${zone.ZoneName}- Shift Settings`, fieldName: 'Preferred Shift Settings', originalValue: "-", newValue: 'Custom Zone Level Shift Settings' });
        this.showZoneShiftSetting(well.ControlArchitectureId, zone);
      }
    }
  }

  showInForceWell(well: InforceWellUIModel): void {
    // Well Informaion
    this.wellChanges.push(
      { page: `${well.WellName}- Well Overview`, fieldName: 'Well Name', originalValue: "-", newValue: well.WellName },
      { page: '', fieldName: 'Well Architecture', originalValue: "-", newValue: this.wellArchList.find(arch => arch.Id === well.ControlArchitectureId).ArchitectureName }
    );

    if (well.ControlArchitectureId !== INFORCE_WELL_ARCHITECTURE.SURESENS) {
      this.wellChanges.push({ page: '', fieldName: 'Number of Outputs', originalValue: "-", newValue: well.NumberOfOutputs.toString() })
      // Shift Settings
      if (well.IsPanelLevelShiftDefaultApplied) {
        this.wellChanges.push({ page: `${well.WellName}- Shift Settings`, fieldName: 'Preferred Shift Settings', originalValue: "-", newValue: 'Panel Level Shift Settings' });
      } else {
        this.wellChanges.push({ page: `${well.WellName}- Shift Settings`, fieldName: 'Preferred Shift Settings', originalValue: "-", newValue: 'Custom Well Level Shift Settings' });
        this.showWellShiftSetting(well);
      }
    }

    // Output Mapping
    well?.PanelToLineMappings?.forEach((panelToLineMapping, index) => {
      if (index === 0) {
        this.wellChanges.push(
          { page: `${well.WellName}- Output Mapping`, fieldName: 'Panel Connection', originalValue: "-", newValue: panelToLineMapping.PanelConnection },
          { page: '', fieldName: 'Downhole Line', originalValue: "-", newValue: panelToLineMapping.DownholeLine });
      } else {
        this.wellChanges.push(
          { page: '', fieldName: 'Panel Connection', originalValue: "-", newValue: panelToLineMapping.PanelConnection },
          { page: '', fieldName: 'Downhole Line', originalValue: "-", newValue: panelToLineMapping.DownholeLine }
        );
      }
    });

    // Zone Mapping
    if (well.ControlArchitectureId !== INFORCE_WELL_ARCHITECTURE.SURESENS) {
      well?.LineToZoneMapping?.forEach((lineToZoneMapping, index) => {
        if (index === 0) {
          this.wellChanges.push(
            { page: `${well.WellName}- Zone Mapping`, fieldName: 'Open Line', originalValue: "-", newValue: lineToZoneMapping.OpenLine },
            { page: '', fieldName: 'Close Line', originalValue: "-", newValue: lineToZoneMapping.CloseLine }
          );
        } else {
          this.wellChanges.push(
            { page: '', fieldName: 'Open Line', originalValue: "-", newValue: lineToZoneMapping.OpenLine },
            { page: '', fieldName: 'Close Line', originalValue: "-", newValue: lineToZoneMapping.CloseLine }
          );
        }
      });
    }

    // Zone details
    well?.Zones?.forEach((zone) => {
      this.showNewInforceZone(well, zone);
    });
  }

  private showNewSie(sie: SieUIModel): void {
    this.sieChanges.push({ page: String.Format("{0} - SIU Overview", sie.Name), fieldName: 'SIU Name', originalValue: "-", newValue: sie.Name });
    this.sieChanges.push({ page: '', fieldName: 'SIU IP Address', originalValue: "-", newValue: sie.IpAddress });
    this.sieChanges.push({ page: '', fieldName: 'SIU Port Number', originalValue: "-", newValue: sie.PortNumber.toString() });
    this.sieChanges.push({ page: '', fieldName: 'MSMP MAC Address', originalValue: "-", newValue: sie.MacAddress });
  }

  private getSieChanges(sie: SieUIModel): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.sieService.getSieById(sie.Id).subscribe(origSie => {
        let pageName = String.Format("{0} - SIU Overview", sie.Name);
        // Sie Name
        if (sie.Name != origSie.Name) {
          this.sieChanges.push({ page: pageName, fieldName: 'SIU Name', originalValue: origSie.Name, newValue: sie.Name });
          pageName = "";
        }
        // IP Address
        if (sie.IpAddress != origSie.IpAddress) {
          this.sieChanges.push({ page: pageName, fieldName: 'SIU IP Address', originalValue: origSie.IpAddress, newValue: sie.IpAddress });
          pageName = "";
        }
        //Port Number
        if (sie.PortNumber != origSie.PortNumber) {
          this.sieChanges.push({ page: pageName, fieldName: 'SIU Port Number', originalValue: origSie.PortNumber.toString(), newValue: sie.PortNumber.toString() });
          pageName = "";
        }
        //MSMP MAC Address
        if (sie.MacAddress != origSie.MacAddress) {
          this.sieChanges.push({ page: pageName, fieldName: 'MSMP MAC Address', originalValue: origSie.MacAddress, newValue: sie.MacAddress });
          pageName = "";
        }
        resolve(true);
      },
        error => {
          console.log(error);
          resolve(true);  // return true -sie changes will still be empty.
        });
    });
  }

  private initSie() {
    return new Promise((resolve, reject) => {
      let subscription = this.store.select<any>(selectSieState).subscribe((state: ISieEntityState) => {
        if (state && !state.isLoaded) {
          this.store.dispatch(SIE_ACTIONS.SIE_LOAD());
        }
        else {
          let sieSubscription = this.store.select<any>(selectAllSie).subscribe(sieData => {
            this.sieChanges = [];
            if (UICommon.IsImportConfig) { // Imported Configuration
              sieData.forEach(sie => {
                this.showNewSie(sie)
              });
              resolve(true);
            }
            this.showDeletedObjects(DeleteObjectTypesEnum.Sie);
            let changedSies = sieData.filter(w => w.IsDirty === true) ?? [];
            if (changedSies.length == 0) // No changes detected
              resolve(true);

            let changedSieAPI: any[] = [];
            changedSies.forEach(changedSie => {
              if (changedSie.Id < 0) {
                if (!UICommon.IsImportConfig) { // New Configuration
                  this.showNewSie(changedSie)
                }
              }
              else {
                changedSieAPI.push(this.getSieChanges(changedSie));
              }
            });

            if (changedSieAPI.length == 0)
              resolve(true);

            forkJoin(changedSieAPI).subscribe(() => {
              resolve(true);
            });
          },
            error => reject(error)
          );
          this.arrSubscriptions.push(sieSubscription);
        }
      });

      this.arrSubscriptions.push(subscription);
    });
  }

  private initWells() {

    return new Promise((resolve, reject) => {
      let subscription = this.store.select<any>(selectWellState).subscribe((state: IWellEntityState) => {
        if (state && !state.isLoaded) {
          this.store.dispatch(WELL_ACTIONS.WELL_LOAD());
        }
        else {
          let wellSubscription = this.store.select<any>(selectAllWells).subscribe(wellData => {
            this.wellChanges = [];
            if (UICommon.IsImportConfig) { // Imported Configuration
              wellData.forEach(well => {
                if (this.panelConfigurationCommon.PanelTypeId === PanelTypeList.MultiNode) {
                  this.showMultinodeWell(well);
                }
                else if (this.panelConfigurationCommon.PanelTypeId === PanelTypeList.INFORCE) {
                  this.showInForceWell(well);
                } else {
                  this.showNewWell(well);
                }
              });
              resolve(true);
            }
            this.showDeletedObjects(DeleteObjectTypesEnum.Well);
            let changedWells = wellData.filter(w => w.IsDirty === true) ?? [];
            if (changedWells.length == 0) // No changes detected
              resolve(true);

            let changedWellAPI: any[] = [];
            changedWells.forEach(changedWell => {
              if (changedWell.WellId < 0) {
                if (!UICommon.IsImportConfig) { // New Configuration
                  if (this.panelConfigurationCommon.PanelTypeId === PanelTypeList.MultiNode) {
                    this.showMultinodeWell(changedWell);
                  }
                  else if (this.panelConfigurationCommon.PanelTypeId === PanelTypeList.INFORCE) {
                    this.showInForceWell(changedWell);
                  } else {
                    this.showNewWell(changedWell);
                  }
                }
              }
              else {
                if (this.panelConfigurationCommon.PanelTypeId === PanelTypeList.MultiNode) {
                  changedWellAPI.push(this.getMultinodeWellChanges(changedWell));
                } else if (this.panelConfigurationCommon.PanelTypeId === PanelTypeList.INFORCE) {
                  changedWellAPI.push(this.getInforceWellChanges(changedWell));
                } else {
                  changedWellAPI.push(this.getWellChanges(changedWell));
                }
              }
            });

            if (changedWellAPI.length == 0)
              resolve(true);

            forkJoin(changedWellAPI).subscribe(() => {
              resolve(true);
            });
          },
            error => reject(error)
          );
          this.arrSubscriptions.push(wellSubscription);
        }
      });

      this.arrSubscriptions.push(subscription);
    });
  }

  private subscribeSerialSettings(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const subscription = this.serialCannelProperties$.subscribe((state: ISerialChannelPropertiesState) => {
        if (state) {
          if (!state.isLoaded && !StateUtilities.hasErrors(state)) {   // Dispatch Action if not loaded
            this.store.dispatch(SERIALCHANNELPROPERTIES_ACTIONS.SERIALCHANNELPROPERTIES_LOAD());
          } else {
            this.serialChannelProperty = state.serialChannelProperties;
            resolve(true);
          }
        }
      });

      this.arrSubscriptions.push(subscription);
    });
  }

  private subscribeToFlowmeterTransmitterTypes(): void {
    const subscription = this.flowmeterTransmitterTypesState$.subscribe(
      (state: IFlowmeterTransmitterState) => {
        if (state !== undefined) {
          if (state.isLoaded === false && !StateUtilities.hasErrors(state)) {
            this.store.dispatch(FLOWMETER_TRASMITTER_ACTIONS.LOAD_FLOWMETER_TRANSMITTER_TYPES());
          } else {
            this.flowmeterList = [];
            Object.assign(this.flowmeterList, state.flowmeterTransmitterTypes);
          }
        }
      }
    );
    this.arrSubscriptions.push(subscription);
  }

  private subscribeToLoggerTypes(): void {
    const subscription = this.loggerTypesState$.subscribe(
      (state: ILoggerTypeState) => {
        if (state !== undefined) {
          if (state.isLoaded === false && !StateUtilities.hasErrors(state)) {
            this.store.dispatch(LOGGER_TYPE_ACTIONS.LOAD_DATA_LOGGER_TYPES());
          } else {
            this.loggerTypes = [];
            Object.assign(this.loggerTypes, state.loggerTypes);
          }
        }
      }
    );
    this.arrSubscriptions.push(subscription);
  }

  private subscribeToToolTypes(): void {
    let subscription = this.toolTypesModel$.subscribe((state: IToolTypeState) => {
      if (state !== undefined) {
        if (state.isLoaded === false && !StateUtilities.hasErrors(state))   // Dispatch Action if not loaded
          this.store.dispatch(TOOLTYPE_ACTIONS.TOOLTYPES_LOAD());
        else {
          this.toolTypesStore = state.toolTypes;
        }
      }
    });

    this.arrSubscriptions.push(subscription);
  }

  private subscribeToModbusProtocols(): void {
    let subscription = this.modbusProtocols$.subscribe((state: IModbusProtocolState) => {
      if (state !== undefined) {
        if (state.isLoaded === false && !StateUtilities.hasErrors(state))   // Dispatch Action if not loaded
          this.store.dispatch(MODBUS_PROTOCOL_ACTIONS.MODBUSPROTOCOL_LOAD());
        else {
          this.modbusProtocols = state.protocols;
        }
      }
    });
    this.arrSubscriptions.push(subscription);
  }

  private subscribeToMapTemplateDetails(): void {
    let subscription = this.modbusTemplateDetails$.subscribe((state: IRegisteredModbusMapState) => {
      if (state !== undefined) {
        if (state.isLoaded === false && !StateUtilities.hasErrors(state))   // Dispatch Action if not loaded
          this.store.dispatch(MAPTEMPLATE_DETAILS_ACTIONS.MAPTEMPLATES_LOAD());
        else {
          this.modbusTemplateDetails = state.templates;
        }
      }
    });
    this.arrSubscriptions.push(subscription);
  }

  private showNewGaugeorTool(toolInfo: ToolInfo, gaugeInfo: SureSENSGaugeDataModel): void {
    let toolType = this.toolTypesStore.find(t => t.GaugeType === gaugeInfo.GaugeType && t.ESPGaugeType == gaugeInfo.EspGaugeType)?.TypeName;
    this.devicesChanges.push({
      page: String.Format("{0} - {1} - {2}", toolInfo.deviceName, toolInfo.cardName, gaugeInfo.Description),
      fieldName: 'Tool Type',
      originalValue: "-",
      newValue: toolType
    });
    this.devicesChanges.push({ page: '', fieldName: 'Tool Name', originalValue: "-", newValue: gaugeInfo.Description });
    this.devicesChanges.push({ page: '', fieldName: 'Tool Address', originalValue: "-", newValue: gaugeInfo.ToolAddress.toString() });

    if (this.toolConnectionEntity && this.toolConnectionEntity.length > 0) {
      let toolConnection = this.toolConnectionEntity.find(t => t.ChannelId === toolInfo.deviceIdCommConfig && t.CardDeviceId === toolInfo.cardDeviceId && t.DeviceId === gaugeInfo.DeviceId);
      if (toolConnection) {
        this.devicesChanges.push({ page: '', fieldName: 'Well Name', originalValue: "-", newValue: toolConnection.WellName });
        if (this.panelConfigurationCommon.PanelTypeId !== PanelTypeList.SURESENS) {
          const zoneFieldName = this.panelConfigurationCommon.PanelTypeId === PanelTypeList.MultiNode ? "eFCV Name" : "Zone Name";
          this.devicesChanges.push({ page: '', fieldName: zoneFieldName, originalValue: "-", newValue: toolConnection.ZoneName });
        }
        if (toolConnection.PortingId != -1) {
          this.devicesChanges.push({ page: '', fieldName: 'Porting', originalValue: "-", newValue: toolConnection.Porting });
        }
        this.devicesChanges.push({ page: '', fieldName: 'Transducer Serial Number', originalValue: "-", newValue: toolConnection.SerialNumber });
      }
    }

    if (toolInfo.isInChargeTool) {
      let inchargeGauge = gaugeInfo as InCHARGEGaugeDataUIModel;
      this.devicesChanges.push({ page: '', fieldName: 'Valve Initial Open %', originalValue: "-", newValue: inchargeGauge.InCHARGEOpeningPercentage.toString() });
      this.devicesChanges.push({ page: '', fieldName: 'Calibration File', originalValue: "-", newValue: inchargeGauge.InCHARGECoefficientFileName });
    }
    else {
      let sureSensGauge = gaugeInfo as SureSENSGaugeDataUIModel;
      this.devicesChanges.push({ page: '', fieldName: 'CRF Calibration File', originalValue: "-", newValue: sureSensGauge.PressureCoefficientFileName });
      this.devicesChanges.push({ page: '', fieldName: 'CRT Calibration File', originalValue: "-", newValue: sureSensGauge.TemperatureCoefficientFileName });
    }
  }

  private showNewCard(deviceName: string, deviceIdCommConfig: number, cardInfo: InterfaceCardDataUIModel): void {
    this.devicesChanges.push({
      page: String.Format("{0} - {1} - Overview", deviceName, cardInfo.Description),
      fieldName: 'Card Type',
      originalValue: "-",
      newValue: cardInfo.SupportInChargePowerSupplyModule ? this.cardTypes[0] : this.cardTypes[1]
    });
    this.devicesChanges.push({ page: '', fieldName: 'Card Name', originalValue: "-", newValue: cardInfo.Description });
    this.devicesChanges.push({ page: '', fieldName: 'Card Address', originalValue: "-", newValue: cardInfo.CardAddress.toString() });

    cardInfo.Gauges.forEach(gaugeInfo => {
      let toolInfo: ToolInfo = {
        deviceIdCommConfig: deviceIdCommConfig,
        cardDeviceId: cardInfo.DeviceId,
        deviceName: deviceName,
        cardName: cardInfo.Description,
        isInChargeTool: cardInfo.SupportInChargePowerSupplyModule
      };
      this.showNewGaugeorTool(toolInfo, gaugeInfo);
    });
  }

  private showNewDevice(device: DataSourceUIModel): void {
    // let isSerialChannelType = device.Channel.channelType === CommunicationChannelType.SERIAL;
    // let modifiedDevice = isSerialChannelType ? device.Channel as SerialPortCommunicationChannelDataUIModel : device.Channel as TcpIpCommunicationChannelDataUIModel;

    if (device.Channel.channelType === CommunicationChannelType.SERIAL) {
      let modifiedDevice = device.Channel as SerialPortCommunicationChannelDataUIModel;
      this.devicesChanges.push({
        page: String.Format("{0} - Overview", modifiedDevice.Description),
        fieldName: 'Protocol Name',
        originalValue: "-",
        newValue: this.modbusProtocols[0].Name
      });
      this.devicesChanges.push({ page: '', fieldName: 'Serial Port', originalValue: "-", newValue: modifiedDevice.Description });
      this.devicesChanges.push({ page: '', fieldName: 'Baud Rate', originalValue: "-", newValue: modifiedDevice.BaudRate.toString() });
      this.devicesChanges.push({ page: '', fieldName: 'Poll Rate', originalValue: "-", newValue: modifiedDevice.PollRateInMs.toString() });
      let pollMode = modifiedDevice.SinglePollRateMode ? this.pollModes[1] : this.pollModes[0];
      this.devicesChanges.push({ page: '', fieldName: 'Poll Mode', originalValue: "-", newValue: pollMode });
      this.devicesChanges.push({ page: '', fieldName: 'Modbus Timeout', originalValue: "-", newValue: modifiedDevice.TimeoutInMs.toString() });

      // Cards
      device.Cards.forEach(cardInfo => {
        this.showNewCard(modifiedDevice.Description, modifiedDevice.IdCommConfig, cardInfo);
      });
    } else {
      let modifiedDevice = device.Channel as TcpIpCommunicationChannelDataUIModel;
      let publishingName = String.Format("{0}:{1}", modifiedDevice.IpAddress, modifiedDevice.IpPortNumber);
      this.devicesChanges.push({
        page: String.Format("{0} - Overview", publishingName),
        fieldName: 'Protocol Name',
        originalValue: "-",
        newValue: this.modbusProtocols[modifiedDevice.Protocol].Name
      });
      this.devicesChanges.push({ page: '', fieldName: 'IP Address', originalValue: "-", newValue: modifiedDevice.IpAddress });
      this.devicesChanges.push({ page: '', fieldName: 'Port', originalValue: "-", newValue: modifiedDevice.IpPortNumber.toString() });
      this.devicesChanges.push({ page: '', fieldName: 'Poll Rate', originalValue: "-", newValue: modifiedDevice.PollRateInMs.toString() });
      let pollMode = modifiedDevice.SinglePollRateMode ? this.pollModes[1] : this.pollModes[0];
      this.devicesChanges.push({ page: '', fieldName: 'Poll Mode', originalValue: "-", newValue: pollMode });
      this.devicesChanges.push({ page: '', fieldName: 'Modbus Timeout', originalValue: "-", newValue: modifiedDevice.TimeoutInMs.toString() });

      // Cards
      device.Cards.forEach(cardInfo => {
        this.showNewCard(publishingName, modifiedDevice.IdCommConfig, cardInfo);
      });
    }

  }

  private getDeviceChanges(device: DataSourceUIModel): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.communicationChannelService.getDataSourcesByCommId(device.Channel.IdCommConfig).subscribe(deviceData => {
        let modifiedDevice = device.Channel as SerialPortCommunicationChannelDataUIModel;
        let origDevice = deviceData.Channel as SerialPortCommunicationChannelDataUIModel;

        let pageName = String.Format("{0} - Overview", modifiedDevice.Description);
        if (device.Channel.channelType === CommunicationChannelType.SERIAL) {
          let modifiedDevice = device.Channel as SerialPortCommunicationChannelDataUIModel;
          let origDevice = deviceData.Channel as SerialPortCommunicationChannelDataUIModel;
          // COM Port
          if (origDevice.ComPort !== modifiedDevice.ComPort) {
            this.devicesChanges.push({ page: pageName, fieldName: 'Serial Port', originalValue: origDevice.Description, newValue: modifiedDevice.Description });
            pageName = "";
          }
          // Baud Rate
          if (origDevice.BaudRate !== modifiedDevice.BaudRate) {
            this.devicesChanges.push({ page: pageName, fieldName: 'Baud Rate', originalValue: origDevice.BaudRate.toString(), newValue: modifiedDevice.BaudRate.toString() });
            pageName = "";
          }
        } else {
          let modifiedDevice = device.Channel as TcpIpCommunicationChannelDataUIModel;
          let origDevice = deviceData.Channel as TcpIpCommunicationChannelDataUIModel;
          // Ip Address
          if (origDevice.IpAddress !== modifiedDevice.IpAddress) {
            this.devicesChanges.push({ page: pageName, fieldName: 'IP Address', originalValue: origDevice.IpAddress, newValue: modifiedDevice.IpAddress });
            pageName = "";
          }
          // Port
          if (origDevice.IpPortNumber !== modifiedDevice.IpPortNumber) {
            this.devicesChanges.push({ page: pageName, fieldName: 'Port', originalValue: origDevice.IpPortNumber.toString(), newValue: modifiedDevice.IpPortNumber.toString() });
            pageName = "";
          }
        }
        // Poll Rate
        if (origDevice.PollRateInMs !== modifiedDevice.PollRateInMs) {
          this.devicesChanges.push({ page: pageName, fieldName: 'Poll Rate', originalValue: origDevice.PollRateInMs.toString(), newValue: modifiedDevice.PollRateInMs.toString() });
          pageName = "";
        }
        // Poll Mode
        if (origDevice.SinglePollRateMode !== modifiedDevice.SinglePollRateMode) {
          let origPollMode = origDevice.SinglePollRateMode ? this.pollModes[1] : this.pollModes[0];
          let pollMode = modifiedDevice.SinglePollRateMode ? this.pollModes[1] : this.pollModes[0];
          this.devicesChanges.push({ page: pageName, fieldName: 'Poll Mode', originalValue: origPollMode, newValue: pollMode });
          pageName = "";
        }
        // Modbus Timeout
        if (origDevice.TimeoutInMs !== modifiedDevice.TimeoutInMs) {
          this.devicesChanges.push({ page: pageName, fieldName: 'Modbus Timeout', originalValue: origDevice.TimeoutInMs.toString(), newValue: modifiedDevice.TimeoutInMs.toString() });
          pageName = "";
        }
        // Cards
        device.Cards.forEach(cardInfo => {
          if (cardInfo.DeviceId < 0) {
            this.showNewCard(modifiedDevice.Description, modifiedDevice.IdCommConfig, cardInfo);
          }
          else {
            let origCard = deviceData.Cards.find(c => c.DeviceId === cardInfo.DeviceId);
            if (origCard) {
              pageName = String.Format("{0} - {1} - Overview", modifiedDevice.Description, cardInfo.Description);
              if (cardInfo.Description !== origCard.Description) {
                this.devicesChanges.push({ page: pageName, fieldName: 'Card Name', originalValue: origCard.Description, newValue: cardInfo.Description });
                pageName = "";
              }
              if (cardInfo.CardAddress !== origCard.CardAddress) {
                this.devicesChanges.push({ page: pageName, fieldName: 'Card Address', originalValue: origCard.CardAddress.toString(), newValue: cardInfo.CardAddress.toString() });
                pageName = "";
              }

              cardInfo.Gauges.forEach(gaugeInfo => {
                if (gaugeInfo.DeviceId < 0) {
                  let toolInfo: ToolInfo = {
                    deviceIdCommConfig: modifiedDevice.IdCommConfig,
                    cardDeviceId: cardInfo.DeviceId,
                    deviceName: modifiedDevice.Description,
                    cardName: cardInfo.Description,
                    isInChargeTool: cardInfo.SupportInChargePowerSupplyModule
                  };
                  this.showNewGaugeorTool(toolInfo, gaugeInfo);
                }
                else {
                  let origGauge = origCard.Gauges.find(g => g.DeviceId === gaugeInfo.DeviceId);
                  if (origGauge) {
                    pageName = String.Format("{0} - {1} - {2}", modifiedDevice.Description, cardInfo.Description, gaugeInfo.Description);
                    if (gaugeInfo.GaugeType !== origGauge.GaugeType) {
                      this.devicesChanges.push({
                        page: pageName,
                        fieldName: 'Tool Type',
                        originalValue: this.toolTypesStore.find(t => t.GaugeType === origGauge.GaugeType && t.ESPGaugeType == origGauge.EspGaugeType)?.TypeName,
                        newValue: this.toolTypesStore.find(t => t.GaugeType === gaugeInfo.GaugeType)?.TypeName
                      });
                      pageName = "";
                    }
                    if (gaugeInfo.Description !== origGauge.Description) {
                      this.devicesChanges.push({ page: pageName, fieldName: 'Tool Name', originalValue: origGauge.Description, newValue: gaugeInfo.Description });
                      pageName = "";
                    }
                    if (gaugeInfo.ToolAddress !== origGauge.ToolAddress) {
                      this.devicesChanges.push({ page: pageName, fieldName: 'Tool Address', originalValue: origGauge.ToolAddress.toString(), newValue: gaugeInfo.ToolAddress.toString() });
                      pageName = "";
                    }

                    if (this.toolConnectionEntity && this.toolConnectionEntity.length > 0) {
                      let origToolConnection = this.toolConnections.find(t => t.ChannelId === modifiedDevice.IdCommConfig && t.CardDeviceId === cardInfo.DeviceId && t.DeviceId === origGauge.DeviceId)
                      let toolConnection = this.toolConnectionEntity.find(t => t.ChannelId === modifiedDevice.IdCommConfig && t.CardDeviceId === cardInfo.DeviceId && t.DeviceId === gaugeInfo.DeviceId);
                      if (origToolConnection && toolConnection) {
                        // Well Name
                        if (toolConnection.WellId != origToolConnection.WellId) {
                          this.devicesChanges.push({ page: pageName, fieldName: 'Well Name', originalValue: origToolConnection.WellName, newValue: toolConnection.WellName });
                          pageName = "";
                        }
                        // Zone Name
                        if (this.panelConfigurationCommon.PanelTypeId !== PanelTypeList.SURESENS && toolConnection.ZoneId != origToolConnection.ZoneId) {
                          const zoneFieldName = this.panelConfigurationCommon.PanelTypeId === PanelTypeList.MultiNode ? "eFCV Name" : "Zone Name";
                          this.devicesChanges.push({ page: pageName, fieldName: zoneFieldName, originalValue: origToolConnection.ZoneName, newValue: toolConnection.ZoneName });
                          pageName = "";
                        }
                        // Porting
                        if (toolConnection.PortingId != origToolConnection.PortingId) {
                          this.devicesChanges.push({ page: pageName, fieldName: 'Porting', originalValue: origToolConnection.Porting, newValue: toolConnection.Porting });
                          pageName = "";
                        }
                        // Serial Number
                        if (toolConnection.SerialNumber != origToolConnection.SerialNumber) {
                          this.devicesChanges.push({ page: pageName, fieldName: 'Transducer Serial Number', originalValue: origToolConnection.SerialNumber, newValue: toolConnection.SerialNumber });
                          pageName = "";
                        }
                      }
                    }

                    if (cardInfo.SupportInChargePowerSupplyModule) {
                      let inchargeGauge = gaugeInfo as InCHARGEGaugeDataUIModel;
                      let origInChargeGauge = origGauge as InCHARGEGaugeDataUIModel;
                      // Initial Valve Open %
                      if (inchargeGauge.InCHARGEOpeningPercentage != origInChargeGauge.InCHARGEOpeningPercentage) {
                        this.devicesChanges.push({ page: pageName, fieldName: 'Valve Initial Open %', originalValue: origInChargeGauge.InCHARGEOpeningPercentage.toString(), newValue: inchargeGauge.InCHARGEOpeningPercentage.toString() });
                        pageName = "";
                      }
                      // Calibration File
                      if (inchargeGauge.InCHARGECoefficientFileName != origInChargeGauge.InCHARGECoefficientFileName) {
                        this.devicesChanges.push({ page: pageName, fieldName: 'Calibration File', originalValue: origInChargeGauge.InCHARGECoefficientFileName, newValue: inchargeGauge.InCHARGECoefficientFileName });
                        pageName = "";
                      }
                    }
                    else {
                      let sureSensGauge = gaugeInfo as SureSENSGaugeDataUIModel;
                      let origSureSensGauge = origGauge as SureSENSGaugeDataUIModel;
                      // CRF Calibration File
                      if (sureSensGauge.PressureCoefficientFileName != origSureSensGauge.PressureCoefficientFileName) {
                        this.devicesChanges.push({ page: pageName, fieldName: 'CRF Calibration File', originalValue: origSureSensGauge.PressureCoefficientFileName, newValue: sureSensGauge.PressureCoefficientFileName });
                        pageName = "";
                      }
                      // Temprature Calibration File
                      if (sureSensGauge.TemperatureCoefficientFileName != origSureSensGauge.TemperatureCoefficientFileName) {
                        this.devicesChanges.push({ page: pageName, fieldName: 'CRT Calibration File', originalValue: origSureSensGauge.TemperatureCoefficientFileName, newValue: sureSensGauge.TemperatureCoefficientFileName });
                        pageName = "";
                      }
                    }
                  }
                }
              });
            }
          }
        });
        resolve(true);
      },
        error => {
          console.log(error);
          resolve(true);  // return true -datasources changes will still be empty.
        });
    });
  }

  private getLoggerName(type) {
    return this.loggerTypes.find(logger => logger.Key === type)?.Value ?? "";
  }

  private getWellName(wellId) {
    return this.toolConnectionEntity.find(tool => tool.WellId === wellId)?.WellName ?? "";
  }

  private showNewDataLogger(dataLogger: DataLoggerUIModel): void {
    this.dataLoggerChanges.push({
      page: String.Format("{0} - Overview", dataLogger.Name),
      fieldName: 'Logger Name',
      originalValue: "-",
      newValue: dataLogger.Name
    });
    this.dataLoggerChanges.push({ page: '', fieldName: 'Logger Format', originalValue: "-", newValue: this.getLoggerName(dataLogger.DataLoggerType) });
    if (dataLogger.DataLoggerType === DATA_LOGGER_TYPE.Saudi_Aramco_iField) {
      this.dataLoggerChanges.push({ page: '', fieldName: 'Well Name', originalValue: "-", newValue: this.getWellName(dataLogger.WellId) });
    } else {
      this.dataLoggerChanges.push({ page: '', fieldName: 'Logging Rate (s)', originalValue: "-", newValue: dataLogger.ScanRate.toString() });
    }
  }

  private getDataLoggerChanges(dataLogger: DataLoggerUIModel): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.dataLoggerService.getDataLogger().subscribe(dataLoggersList => {
        const orgDataLogger: DataLoggerUIModel = dataLoggersList.find(logger => logger.Id === dataLogger.Id);
        let pageName = String.Format("{0} - Overview", dataLogger.Name);
        // Logger Name
        if (dataLogger.Name != orgDataLogger.Name) {
          this.dataLoggerChanges.push({ page: pageName, fieldName: 'Logger Name', originalValue: orgDataLogger.Name, newValue: dataLogger.Name });
          pageName = "";
        }
        // Logger Format
        if (dataLogger.DataLoggerType != orgDataLogger.DataLoggerType) {
          this.dataLoggerChanges.push({ page: pageName, fieldName: 'Logger Format', originalValue: this.getLoggerName(orgDataLogger.DataLoggerType), newValue: this.getLoggerName(dataLogger.DataLoggerType) });
          pageName = "";
        }
        if (dataLogger.DataLoggerType === DATA_LOGGER_TYPE.Saudi_Aramco_iField) {
          // Well Name
          if (dataLogger.WellId != orgDataLogger.WellId) {
            this.dataLoggerChanges.push({ page: pageName, fieldName: 'Well Name', originalValue: this.getWellName(orgDataLogger.WellId), newValue: this.getWellName(dataLogger.WellId) });
            pageName = "";
          }
        } else {
          // Logger Name
          if (dataLogger.ScanRate != orgDataLogger.ScanRate) {
            this.dataLoggerChanges.push({ page: pageName, fieldName: 'Logging Rate (s)', originalValue: orgDataLogger.ScanRate.toString(), newValue: dataLogger.ScanRate.toString() });
            pageName = "";
          }
          let addedDataPoints = [];
          let deletedDatapoints = [];
          deletedDatapoints = orgDataLogger.customDataLoggerDataPoints.filter(function (o1) {
            return !dataLogger.customDataLoggerDataPoints.some(function (o2) {
                return o1.Id === o2.Id; 
              });
           });
           addedDataPoints = dataLogger.customDataLoggerDataPoints.filter(function (o1) {
            return !orgDataLogger.customDataLoggerDataPoints.some(function (o2) {
                return o1.Id === o2.Id; 
              });
           });
          
          if( addedDataPoints.length > 0 || deletedDatapoints.length > 0 ){
            let newValueMsg = "Custom Data Points Modified";
            // addedDataPoints.length > 0 ? 
            // deletedDatapoints.length > 0? "Added "+addedDataPoints.length.toString()+" data points, Deleted "+deletedDatapoints.length.toString()+" data points": "Added "+addedDataPoints.length.toString()+" data points" 
            // : "Deleted "+deletedDatapoints.length.toString()+" data points";
            this.dataLoggerChanges.push({ page: pageName, fieldName: 'Custom Data Point', originalValue: orgDataLogger.customDataLoggerDataPoints.length > 1 ? "Custom Data Points = "+ orgDataLogger.customDataLoggerDataPoints.length : "Custom Data Point = "+ orgDataLogger.customDataLoggerDataPoints.length, newValue: newValueMsg });
            pageName = "";
          }
        }

        resolve(true);
      },
        error => {
          console.log(error);
          resolve(true);  // return true -well changes will still be empty.
        });
    });
  }

  private fetchToolConnections(dataSources: DataSourceUIModel[]): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.toolConnectionService.getToolConnectionList().subscribe(toolConnections => {
        this.toolConnections = toolConnections;
        let changedDevices = dataSources.filter(d => d.IsDirty === true) ?? [];
        if (changedDevices.length == 0)
          resolve(true);

        let arrDevicesAPI: any[] = [];
        changedDevices.forEach(device => {
          if (device.Channel.IdCommConfig < 0) {// New Device
            if (!UICommon.IsImportConfig) // Already done
              this.showNewDevice(device);
          }
          else
            if (!UICommon.IsImportConfig) arrDevicesAPI.push(this.getDeviceChanges(device));
        });

        if (arrDevicesAPI.length == 0)
          resolve(true);

        forkJoin(arrDevicesAPI).subscribe(() => resolve(true));
      },
        error => resolve(true));
    });
  }

  private initToolConnections() {
    return new Promise((resolve, reject) => {
      let subscription = this.store.select<any>(selectToolConnetionState).subscribe((state: IToolConnecionState) => {
        if (!state.isLoaded) {
          this.store.dispatch(TOOL_CONNECTIONS_ACTIONS.TOOL_CONNECTIONS_LOAD());
        }
        else {
          let toolConnectionSubscription = this.store.select<any>(selectAllToolConnections).subscribe(toolConnections => {
            this.toolConnectionEntity = toolConnections;
            resolve(true);
          },
            error => reject(error)
          );
          this.arrSubscriptions.push(toolConnectionSubscription);
        }
      });

      this.arrSubscriptions.push(subscription);
    });
  }

  private initDataLoggers() {
    return new Promise((resolve, reject) => {
      let subscription = this.store.select<any>(selectDataLoggerState).subscribe((state: IDataLoggerEntityState) => {
        if (state && !state.isLoaded) {
          this.store.dispatch(DATA_LOGGER_ACTIONS.DATALOGGER_LOAD());
        } else {
          let loggerSubscription = this.store.select<any>(selectAllDataLoggers).subscribe(loggerData => {
            this.dataLoggerChanges = [];
            if (UICommon.IsImportConfig) { // Imported Configuration
              loggerData.forEach(logger => {
                this.showNewDataLogger(logger);
              });
              resolve(true);
            }
            this.showDeletedObjects(DeleteObjectTypesEnum.DataLogger);
            let changedDataLoggers = loggerData.filter(w => w.IsDirty === true) ?? [];
            if (changedDataLoggers.length == 0) // No changes detected
              resolve(true);
            let changedDataLoggerAPI: any[] = [];
            changedDataLoggers.forEach(changedDataLogger => {
              if (changedDataLogger.Id < 0) {
                if (!UICommon.IsImportConfig) { // New Configuration
                  this.showNewDataLogger(changedDataLogger);
                }
              }
              else {
                changedDataLoggerAPI.push(this.getDataLoggerChanges(changedDataLogger));
              }
            });

            if (changedDataLoggerAPI.length == 0)
              resolve(true);

            forkJoin(changedDataLoggerAPI).subscribe(() => {
              resolve(true);
            });
          },
            error => reject(error));
          this.arrSubscriptions.push(loggerSubscription);
        }
      });

      this.arrSubscriptions.push(subscription);
    });
  }

  private initDataSources() {
    return new Promise((resolve, reject) => {
      let subscription = this.store.select<any>(selectDataSourcesState).subscribe((state: IDataSourceEntityState) => {
        if (!state.isLoaded) {
          this.store.dispatch(DATA_SOURCES_ACTIONS.DATASOURCES_LOAD());
        }
        else {
          let deviceSubscription = this.store.select<any>(selectAllDataSources).subscribe(dataSources => {
            this.devicesChanges = [];
            if (UICommon.IsImportConfig) {
              dataSources.forEach(device => {
                this.showNewDevice(device);
              });
              resolve(true);
            }

            this.showDeletedObjects(DeleteObjectTypesEnum.Channel);
            let changedDevices = dataSources.filter(d => d.IsDirty === true) ?? [];
            if (changedDevices.length == 0)
              resolve(true);

            this.fetchToolConnections(dataSources).finally(() => resolve(true));
          },
            error => reject(error)
          );
          this.arrSubscriptions.push(deviceSubscription);
        }
      });

      this.arrSubscriptions.push(subscription);
    });
  }

  private showNewPublishing(publishing: PublishingDataUIModel): void {
    let publishingName = "";
    if (publishing.Channel.channelType === CommunicationChannelType.SERIAL) {
      let modifiedChannel = publishing.Channel as SerialPortCommunicationChannelDataUIModel;
      publishingName = modifiedChannel.Description;
      // Protocol
      this.publishingChanges.push({
        page: String.Format("{0} - Overview", modifiedChannel.Description),
        fieldName: 'Protocol Name',
        originalValue: "-",
        newValue: this.modbusProtocols[0].Name
      });
      // COM Port
      this.publishingChanges.push({ page: '', fieldName: 'Serial Port', originalValue: "-", newValue: modifiedChannel.Description });
      // Baud Rate
      this.publishingChanges.push({ page: '', fieldName: 'Baud Rate', originalValue: "-", newValue: modifiedChannel.BaudRate.toString() });
      // Data Bits
      this.publishingChanges.push({ page: '', fieldName: 'Data Bits', originalValue: "-", newValue: modifiedChannel.DataBits.toString() });
      // Parity
      if (this.serialChannelProperty)
        this.publishingChanges.push({ page: '', fieldName: 'Parity', originalValue: "-", newValue: this.serialChannelProperty.Parity[modifiedChannel.Parity] });
      // Stop Bits
      this.publishingChanges.push({ page: '', fieldName: 'Stop Bits', originalValue: "-", newValue: modifiedChannel.StopBits });
    }
    else {
      let modifiedChannel = publishing.Channel as TcpIpCommunicationChannelDataUIModel;
      publishingName = String.Format("{0}:{1}", modifiedChannel.IpAddress, modifiedChannel.IpPortNumber);
      // Protocol
      this.publishingChanges.push({
        page: String.Format("{0} - Overview", publishingName),
        fieldName: 'Protocol Name',
        originalValue: "-",
        newValue: this.modbusProtocols[modifiedChannel.Protocol].Name
      });
      this.publishingChanges.push({ page: '', fieldName: 'Port Number', originalValue: "-", newValue: modifiedChannel.IpPortNumber.toString() });
    }

    // Slave Settings Section
    // Connection To
    this.publishingChanges.push({
      page: String.Format("{0} - Slave Settings", publishingName),
      fieldName: 'Connection To',
      originalValue: "-",
      newValue: publishing.ConnectionTo
    });
    // Word Order
    this.publishingChanges.push({ page: '', fieldName: 'Word Order', originalValue: "-", newValue: publishing.WordOrder });
    // Byte Order
    this.publishingChanges.push({ page: '', fieldName: 'Byte Order', originalValue: "-", newValue: publishing.ByteOrder });
    // Map Template
    let mapName = this.modbusTemplateDetails.find(m => m.Id === publishing.RegisteredModbusMapId)?.MapName;
    this.publishingChanges.push({ page: '', fieldName: 'Map Template', originalValue: "-", newValue: mapName });
    // Slave ID
    this.publishingChanges.push({ page: '', fieldName: 'Slave ID', originalValue: "-", newValue: publishing.SlaveId.toString() });
  }

  private getPublishingChanges(publishingEntity: PublishingDataUIModel[]): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.publishingService.getPublishing().subscribe(publishings => {
        let origPublishings = this.publishingService.getPublishing_UIModel(publishings);
        let changedPublishing = publishingEntity.filter(p => p.IsDirty === true) ?? [];
        changedPublishing.forEach(modifiedPublishing => {
          if (modifiedPublishing.Id < 0) {
            if (!UICommon.IsImportConfig) // Already done
              this.showNewPublishing(modifiedPublishing);
          }
          else {
            let origPublishing = origPublishings.find(p => p.Id === modifiedPublishing.Id);
            if (origPublishing) {
              let channelName = "";
              let pageName = "";
              if (origPublishing.Channel.channelType === CommunicationChannelType.SERIAL) {
                let channel = origPublishing.Channel as SerialPortCommunicationChannelDataUIModel;
                let modifiedChannel = modifiedPublishing.Channel as SerialPortCommunicationChannelDataUIModel;

                channelName = modifiedChannel.Description;
                pageName = String.Format("{0} - Overview", modifiedChannel.Description);
                // COM Port
                if (modifiedChannel.ComPort != channel.ComPort) {
                  this.publishingChanges.push({ page: pageName, fieldName: 'Serial Port', originalValue: channel.Description, newValue: modifiedChannel.Description });
                  pageName = "";
                }
                // Baud Rate
                if (modifiedChannel.BaudRate != channel.BaudRate) {
                  this.publishingChanges.push({ page: pageName, fieldName: 'Baud Rate', originalValue: channel.BaudRate.toString(), newValue: modifiedChannel.BaudRate.toString() });
                  pageName = "";
                }
                // Data Bits
                if (modifiedChannel.DataBits != channel.DataBits) {
                  this.publishingChanges.push({ page: pageName, fieldName: 'Data Bits', originalValue: channel.DataBits.toString(), newValue: modifiedChannel.DataBits.toString() });
                  pageName = "";
                }
                // Parity
                if (modifiedChannel.Parity != channel.Parity) {
                  this.publishingChanges.push({ page: pageName, fieldName: 'Parity', originalValue: this.serialChannelProperty.Parity[channel.Parity], newValue: this.serialChannelProperty.Parity[modifiedChannel.Parity] });
                  pageName = "";
                }
                // Stop Bits
                if (modifiedChannel.StopBits != channel.StopBits) {
                  this.publishingChanges.push({ page: pageName, fieldName: 'Stop Bits', originalValue: channel.StopBits, newValue: modifiedChannel.StopBits });
                  pageName = "";
                }
              }
              else {
                let channel = origPublishing.Channel as TcpIpCommunicationChannelDataUIModel;
                let modifiedChannel = modifiedPublishing.Channel as TcpIpCommunicationChannelDataUIModel;

                channelName = String.Format("{0}:{1}", modifiedChannel.IpAddress, modifiedChannel.IpPortNumber);
                pageName = String.Format("{0} - Overview", channelName);
                if (modifiedChannel.IpPortNumber != channel.IpPortNumber) {
                  this.publishingChanges.push({ page: pageName, fieldName: 'Port Number', originalValue: channel.IpPortNumber.toString(), newValue: modifiedChannel.IpPortNumber.toString() });
                  pageName = "";
                }
              }

              // Slave Settings
              pageName = String.Format("{0} - Slave Settings", channelName)
              // Connection To
              if (modifiedPublishing.ConnectionTo != origPublishing.ConnectionTo) {
                this.publishingChanges.push({ page: pageName, fieldName: 'Connection To', originalValue: origPublishing.ConnectionTo, newValue: modifiedPublishing.ConnectionTo });
                pageName = "";
              }
              // Word Order
              if (modifiedPublishing.WordOrder != origPublishing.WordOrder) {
                this.publishingChanges.push({ page: pageName, fieldName: 'Word Order', originalValue: origPublishing.WordOrder, newValue: modifiedPublishing.WordOrder });
                pageName = "";
              }
              // Byte Order
              if (modifiedPublishing.ByteOrder != origPublishing.ByteOrder) {
                this.publishingChanges.push({ page: pageName, fieldName: 'Byte Order', originalValue: origPublishing.ByteOrder, newValue: modifiedPublishing.ByteOrder });
                pageName = "";
              }
              // Map Template
              if (modifiedPublishing.RegisteredModbusMapId != origPublishing.RegisteredModbusMapId) {
                let origMapName = this.modbusTemplateDetails.find(m => m.Id === origPublishing.RegisteredModbusMapId)?.MapName;
                let mapName = this.modbusTemplateDetails.find(m => m.Id === modifiedPublishing.RegisteredModbusMapId)?.MapName;
                this.publishingChanges.push({ page: pageName, fieldName: 'Map Template', originalValue: origMapName, newValue: mapName });
                pageName = "";
              }
              // Slave ID
              if (modifiedPublishing.SlaveId != origPublishing.SlaveId) {
                this.publishingChanges.push({ page: pageName, fieldName: 'Slave ID', originalValue: origPublishing.SlaveId.toString(), newValue: modifiedPublishing.SlaveId.toString() });
                pageName = "";
              }
            }
          }
        });
        resolve(true);
      },
        error => {
          console.log(error);
          resolve(true);  // return true -publishings changes will still be empty.
        });
    });
  }

  private initDataPublishing() {
    return new Promise((resolve, reject) => {
      let subscription = this.store.select<any>(selectPublishingState).subscribe((state: IPublishingEntityState) => {
        if (!state.isLoaded) {
          this.store.dispatch(PUBLISHING_ACTIONS.PUBLISHING_LOAD());
        }
        else {
          let publishingSubscription = this.store.select<any>(selectAllPublishings).subscribe(publishing => {
            this.publishingChanges = [];

            if (UICommon.IsImportConfig) {
              publishing.forEach(publishing => {
                this.showNewPublishing(publishing);
              });
              resolve(true);
            }

            this.showDeletedObjects(DeleteObjectTypesEnum.ModbusConfiguration);
            let changedPublishing = publishing.filter(p => p.IsDirty === true) ?? [];
            if (changedPublishing.length == 0)
              resolve(true);

            this.getPublishingChanges(publishing).finally(() => resolve(true));
          },
            error => reject(error)
          );
          this.arrSubscriptions.push(publishingSubscription);
        }
      });

      this.arrSubscriptions.push(subscription);
    });
  }

  private showNewFloMeter(floMeter: SureFLOFlowMeterUIModel): void {
    const isOilProducer = WellFlowTypes[floMeter.FluidType] === WellFlowTypes[1] ? true : false;

    this.surefloChanges.push({
      page: String.Format("{0} - Overview", floMeter.DeviceName),
      fieldName: 'Name',
      originalValue: "-",
      newValue: floMeter.DeviceName
    });

    this.surefloChanges.push({ page: '', fieldName: 'Serial Number', originalValue: "-", newValue: floMeter.Serial });

    this.surefloChanges.push({ page: '', fieldName: 'Technology', originalValue: "-", newValue: FlowMeterTypes[floMeter.Technology] });

    this.surefloChanges.push({ page: '', fieldName: 'Well Type', originalValue: "-", newValue: WellFlowTypes[floMeter.FluidType] });

    this.surefloChanges.push({
      page: String.Format("{0} - Gauge Data", floMeter.DeviceName),
      fieldName: 'Inlet Pressure',
      originalValue: "-",
      newValue: FlowMeterTypes[floMeter.Technology] === FlowMeterTypes.SureFLO298 ? (floMeter as SureFLO298UIFlowMeterUIModel).flowMeterPTMapping.InletPressureSource.TagName : (floMeter as SureFLO298ExUIFlowMeterUIModel).flowMeterPTMapping.InletPressureSource.TagName
    });

    // 298 
    if (parseInt(floMeter.Technology) === FlowMeterTypes.SureFLO298) {
      this.surefloChanges.push({
        page: '', fieldName: 'Throat Pressure', originalValue: "-",
        newValue: (floMeter as SureFLO298UIFlowMeterUIModel).flowMeterPTMapping.ThroatPressureSource.TagName
      });
      this.surefloChanges.push({ page: '', fieldName: 'Reservoir Temperature', originalValue: "-", newValue: (floMeter as SureFLO298UIFlowMeterUIModel).flowMeterPTMapping.TemperatureSource.TagName });
    }

    // 298 Oil Producer Remote Gauge
    if (parseInt(floMeter.Technology) === FlowMeterTypes.SureFLO298 && isOilProducer) {
      this.surefloChanges.push({ page: '', fieldName: 'Use Remote Gauge', originalValue: "-", newValue: this.titlecasePipe.transform((floMeter as SureFLO298UIFlowMeterUIModel).flowMeterPTMapping.UseRemoteGauge.toString()) });
      if ((floMeter as SureFLO298UIFlowMeterUIModel).flowMeterPTMapping.UseRemoteGauge) {
        this.surefloChanges.push({ page: '', fieldName: 'Remote Pressure', originalValue: "-", newValue: (floMeter as SureFLO298UIFlowMeterUIModel).flowMeterPTMapping.RemotePressureSource.TagName });
      }
    }

    // 298EX 
    if (parseInt(floMeter.Technology) !== FlowMeterTypes.SureFLO298) {
      this.surefloChanges.push({
        page: '', fieldName: 'Outlet Pressure', originalValue: "-",
        newValue: (floMeter as SureFLO298ExUIFlowMeterUIModel).flowMeterPTMapping.OutletPressureSource.TagName
      });
      this.surefloChanges.push({ page: '', fieldName: 'Inlet Temperature', originalValue: "-", newValue: (floMeter as SureFLO298ExUIFlowMeterUIModel).flowMeterPTMapping.InletTemperatureSource.TagName });
      this.surefloChanges.push({ page: '', fieldName: 'Outlet Temperature', originalValue: "-", newValue: (floMeter as SureFLO298ExUIFlowMeterUIModel).flowMeterPTMapping.OutletTemperatureSource.TagName });
    }

    // 298EX Oil Producer Remote Gauge
    if (parseInt(floMeter.Technology) !== FlowMeterTypes.SureFLO298 && isOilProducer) {
      this.surefloChanges.push({ page: '', fieldName: 'Use Remote Gauge', originalValue: "-", newValue: this.titlecasePipe.transform((floMeter as SureFLO298ExUIFlowMeterUIModel).flowMeterPTMapping.UseRemoteGauge.toString()) });
      if ((floMeter as SureFLO298ExUIFlowMeterUIModel).flowMeterPTMapping.UseRemoteGauge) {
        this.surefloChanges.push({ page: '', fieldName: 'Remote Pressure', originalValue: "-", newValue: (floMeter as SureFLO298ExUIFlowMeterUIModel).flowMeterPTMapping.RemotePressureSource.TagName });
        this.surefloChanges.push({ page: '', fieldName: 'Remote Temperature', originalValue: "-", newValue: (floMeter as SureFLO298ExUIFlowMeterUIModel).flowMeterPTMapping.RemoteTemperatureSource.TagName });
      }
    }

    this.surefloChanges.push({ page: '', fieldName: 'Calibration File', originalValue: "-", newValue: floMeter.CalibrationFileName });
  }

  private getSurefloChanges(flowmeters: SureFLOFlowMeterUIModel[]): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.surefloService.getFlowMeterList().subscribe(origflowmeters => {
        let changedFloMeters = flowmeters.filter(p => p.IsDirty === true) ?? [];
        changedFloMeters.forEach((modifiedFloMeter) => {
          if (modifiedFloMeter.DeviceId < 0) {
            this.showNewFloMeter(modifiedFloMeter);
          }
          else {
            let origFloMeter = origflowmeters.find(f => f.DeviceId === modifiedFloMeter.DeviceId);
            if (origFloMeter) {
              let channelName = "";
              let pageName = String.Format("{0} - Overview", modifiedFloMeter.DeviceName);
              // COM Port
              if (modifiedFloMeter.DeviceName != origFloMeter.DeviceName) {
                this.surefloChanges.push({ page: pageName, fieldName: 'Name', originalValue: origFloMeter.DeviceName, newValue: modifiedFloMeter.DeviceName });
                pageName = "";
              }

              if (modifiedFloMeter.Serial != origFloMeter.Serial) {
                this.surefloChanges.push({ page: pageName, fieldName: 'Serial Number', originalValue: origFloMeter.Serial, newValue: modifiedFloMeter.Serial });
                pageName = "";
              }

              pageName = String.Format("{0} - Gauge Data", modifiedFloMeter.DeviceName)

              if (parseInt(origFloMeter.Technology) === FlowMeterTypes.SureFLO298) {
                this.getSureflo298Changes(pageName, origFloMeter as SureFLO298UIFlowMeterUIModel, modifiedFloMeter as SureFLO298UIFlowMeterUIModel);
              } else {
                this.getSureflo298EXChanges(pageName, origFloMeter as SureFLO298ExUIFlowMeterUIModel, modifiedFloMeter as SureFLO298ExUIFlowMeterUIModel);
              }

              if (modifiedFloMeter.CalibrationFileName != origFloMeter.CalibrationFileName) {
                this.surefloChanges.push({ page: pageName, fieldName: 'Calibration File', originalValue: origFloMeter.CalibrationFileName, newValue: modifiedFloMeter.CalibrationFileName });
                pageName = "";
              }
            }
          }
        });
        resolve(true);
      },
        error => {
          console.log(error);
          resolve(true);  // return true -publishings changes will still be empty.
        });
    });
  }

  getSureflo298Changes(pageName, origFloMeter: SureFLO298UIFlowMeterUIModel, modifiedFloMeter: SureFLO298UIFlowMeterUIModel) {
    if (modifiedFloMeter.flowMeterPTMapping.InletPressureSource.DeviceId != origFloMeter.flowMeterPTMapping.InletPressureSource.DeviceId) {
      this.surefloChanges.push({
        page: pageName,
        fieldName: 'Inlet Pressure',
        originalValue: origFloMeter.flowMeterPTMapping.InletPressureSource.TagName,
        newValue: modifiedFloMeter.flowMeterPTMapping.InletPressureSource.TagName
      });
      pageName = "";
    }

    if (modifiedFloMeter.flowMeterPTMapping.ThroatPressureSource.DeviceId != origFloMeter.flowMeterPTMapping.ThroatPressureSource.DeviceId) {
      this.surefloChanges.push({
        page: pageName,
        fieldName: 'Throat Pressure',
        originalValue: origFloMeter.flowMeterPTMapping.ThroatPressureSource.TagName,
        newValue: modifiedFloMeter.flowMeterPTMapping.ThroatPressureSource.TagName
      });
      pageName = "";
    }

    if (modifiedFloMeter.flowMeterPTMapping.TemperatureSource.DeviceId != origFloMeter.flowMeterPTMapping.TemperatureSource.DeviceId) {
      this.surefloChanges.push({
        page: pageName,
        fieldName: 'Reservoir Temperature',
        originalValue: origFloMeter.flowMeterPTMapping.TemperatureSource.TagName,
        newValue: modifiedFloMeter.flowMeterPTMapping.TemperatureSource.TagName
      });
      pageName = "";
    }

    if (modifiedFloMeter.flowMeterPTMapping.UseRemoteGauge != origFloMeter.flowMeterPTMapping.UseRemoteGauge) {
      this.surefloChanges.push({
        page: pageName,
        fieldName: 'Use Remote Gauge',
        originalValue: this.titlecasePipe.transform(origFloMeter.flowMeterPTMapping.UseRemoteGauge.toString()),
        newValue: this.titlecasePipe.transform(modifiedFloMeter.flowMeterPTMapping.UseRemoteGauge.toString())
      });
      pageName = "";

      if (modifiedFloMeter.flowMeterPTMapping.UseRemoteGauge) {
        this.surefloChanges.push({ page: '', fieldName: 'Remote Pressure', originalValue: "-", newValue: modifiedFloMeter.flowMeterPTMapping.RemotePressureSource.TagName });
      }
      else {
        this.surefloChanges.push({ page: '', fieldName: 'Remote Pressure', originalValue: origFloMeter.flowMeterPTMapping.RemotePressureSource.TagName, newValue: "-" });
      }
    }
    else {  // if no change in Use Remote Gauge
      if (modifiedFloMeter.flowMeterPTMapping.UseRemoteGauge) {
        if (modifiedFloMeter.flowMeterPTMapping.RemotePressureSource.DeviceId != origFloMeter.flowMeterPTMapping.RemotePressureSource.DeviceId) {
          this.surefloChanges.push({
            page: pageName,
            fieldName: 'Remote Pressure',
            originalValue: origFloMeter.flowMeterPTMapping.RemotePressureSource.TagName,
            newValue: modifiedFloMeter.flowMeterPTMapping.RemotePressureSource.TagName
          });
          pageName = "";
        }
      }
    }

  }

  getSureflo298EXChanges(pageName, origFloMeter: SureFLO298ExUIFlowMeterUIModel, modifiedFloMeter: SureFLO298ExUIFlowMeterUIModel) {
    if (modifiedFloMeter.flowMeterPTMapping.InletPressureSource.DeviceId != origFloMeter.flowMeterPTMapping.InletPressureSource.DeviceId) {
      this.surefloChanges.push({
        page: pageName,
        fieldName: 'Inlet Pressure',
        originalValue: origFloMeter.flowMeterPTMapping.InletPressureSource.TagName,
        newValue: modifiedFloMeter.flowMeterPTMapping.InletPressureSource.TagName
      });
      pageName = "";
    }

    if (modifiedFloMeter.flowMeterPTMapping.OutletPressureSource.DeviceId != origFloMeter.flowMeterPTMapping.OutletPressureSource.DeviceId) {
      this.surefloChanges.push({
        page: pageName,
        fieldName: 'Outlet Pressure',
        originalValue: origFloMeter.flowMeterPTMapping.OutletPressureSource.TagName,
        newValue: modifiedFloMeter.flowMeterPTMapping.OutletPressureSource.TagName
      });
      pageName = "";
    }

    if (modifiedFloMeter.flowMeterPTMapping.InletTemperatureSource.DeviceId != origFloMeter.flowMeterPTMapping.InletTemperatureSource.DeviceId) {
      this.surefloChanges.push({
        page: pageName,
        fieldName: 'Inlet Temperature',
        originalValue: origFloMeter.flowMeterPTMapping.InletTemperatureSource.TagName,
        newValue: modifiedFloMeter.flowMeterPTMapping.InletTemperatureSource.TagName
      });
      pageName = "";
    }

    if (modifiedFloMeter.flowMeterPTMapping.OutletTemperatureSource.DeviceId != origFloMeter.flowMeterPTMapping.OutletTemperatureSource.DeviceId) {
      this.surefloChanges.push({
        page: pageName,
        fieldName: 'Outlet Temperature',
        originalValue: origFloMeter.flowMeterPTMapping.OutletTemperatureSource.TagName,
        newValue: modifiedFloMeter.flowMeterPTMapping.OutletTemperatureSource.TagName
      });
      pageName = "";
    }

    if (modifiedFloMeter.flowMeterPTMapping.UseRemoteGauge != origFloMeter.flowMeterPTMapping.UseRemoteGauge) {
      this.surefloChanges.push({
        page: pageName,
        fieldName: 'Use Remote Gauge',
        originalValue: this.titlecasePipe.transform(origFloMeter.flowMeterPTMapping.UseRemoteGauge.toString()),
        newValue: this.titlecasePipe.transform(modifiedFloMeter.flowMeterPTMapping.UseRemoteGauge.toString())
      });
      pageName = "";

      if (modifiedFloMeter.flowMeterPTMapping.UseRemoteGauge) {
        this.surefloChanges.push({ page: '', fieldName: 'Remote Pressure', originalValue: "-", newValue: modifiedFloMeter.flowMeterPTMapping.RemotePressureSource.TagName });
        this.surefloChanges.push({ page: '', fieldName: 'Remote Temperature', originalValue: "-", newValue: modifiedFloMeter.flowMeterPTMapping.RemoteTemperatureSource.TagName });
      }
      else {
        this.surefloChanges.push({ page: '', fieldName: 'Remote Pressure', originalValue: origFloMeter.flowMeterPTMapping.RemotePressureSource.TagName, newValue: "-" });
        this.surefloChanges.push({ page: '', fieldName: 'Remote Temperature', originalValue: origFloMeter.flowMeterPTMapping.RemoteTemperatureSource.TagName, newValue: "-" });
      }
    }
    else {  // if no change in Use Remote Gauge
      if (modifiedFloMeter.flowMeterPTMapping.UseRemoteGauge) {
        if (modifiedFloMeter.flowMeterPTMapping.RemotePressureSource.DeviceId != origFloMeter.flowMeterPTMapping.RemotePressureSource.DeviceId) {
          this.surefloChanges.push({
            page: pageName,
            fieldName: 'Remote Pressure',
            originalValue: origFloMeter.flowMeterPTMapping.RemotePressureSource.TagName,
            newValue: modifiedFloMeter.flowMeterPTMapping.RemotePressureSource.TagName
          });
          pageName = "";
        }
        if (modifiedFloMeter.flowMeterPTMapping.RemoteTemperatureSource.DeviceId != origFloMeter.flowMeterPTMapping.RemoteTemperatureSource.DeviceId) {
          this.surefloChanges.push({
            page: pageName,
            fieldName: 'Remote Temperature',
            originalValue: origFloMeter.flowMeterPTMapping.RemoteTemperatureSource.TagName,
            newValue: modifiedFloMeter.flowMeterPTMapping.RemoteTemperatureSource.TagName
          });
          pageName = "";
        }
      }
    }

  }

  private initFlowMeters() {

    return new Promise((resolve, reject) => {
      let subscription = this.store.select<any>(selectflowMetersState).subscribe((state: ISurefloEntityState) => {
        if (!state.isLoaded) {
          this.store.dispatch(SUREFLO_ACTIONS.FLOWMETERS_LOAD());
        }
        else {
          let flowMeterSubscription = this.store.select<any>(selectAllflowMeters).subscribe(flowmeters => {
            this.surefloChanges = [];

            if (UICommon.IsImportConfig) {
              flowmeters.forEach(floMeter => {
                this.showNewFloMeter(floMeter);
              });
              resolve(true);
            }

            this.showDeletedObjects(DeleteObjectTypesEnum.SureFLOFlowMeter);
            let changedPublishing = flowmeters.filter(p => p.IsDirty === true) ?? [];
            if (changedPublishing.length == 0)
              resolve(true);

            this.getSurefloChanges(flowmeters).finally(() => resolve(true));
          },
            error => reject(error)
          );
          this.arrSubscriptions.push(flowMeterSubscription);
        }
      });

      this.arrSubscriptions.push(subscription);
    });

  }

  private unsubscribeStoreSubscriptions(): void {
    this.arrSubscriptions.forEach(sub => {
      if (sub != null) {
        sub.unsubscribe();
        sub = null;
      }
    })
    this.arrSubscriptions = [];
  }

  getConfigurationSummary(bIsConfigSaved: boolean): Promise<ConfigurationSummaryData> {
    this.bIsConfigSaved = bIsConfigSaved;
    //this.subscribeSerialSettings();
    this.subscribeToToolTypes();
    this.subscribeToModbusProtocols();
    this.subscribeToMapTemplateDetails();
    if (this.panelConfigurationCommon && this.panelConfigurationCommon.PanelTypeId === PanelTypeList.INFORCE) {
      this.subscribeToFlowmeterTransmitterTypes();
    }
    this.subscribeToLoggerTypes();
    this.initToolConnections();

    let configSummaryData: ConfigurationSummaryData = {
      panelSettingChanges: [],
      errorHandlingChanges: [],
      unitSystemChanges: [],
      wellChanges: [],
      devicesChanges: [],
      publishingChanges: [],
      surefloChanges: [],
      alarmsAndLimitsChanges: [],
      panelDefaultChanges: [],
      shiftDefaultChanges: [],
      dataLoggerChanges: [],
      sieChanges: [],
      eFCVPositionsChanges: []
    };

    return this.subscribeSerialSettings().then(() => {
      const promises: Promise<any>[] = [];
      promises.push(this.initPanelConfiguration());
      promises.push(this.initErrorHandlingSettingState());
      promises.push(this.initUnitSystem());
      if (this.panelConfigurationCommon.PanelTypeId === PanelTypeList.INFORCE) {
        promises.push(this.initShiftDefaultState());
        promises.push(this.initPanelDefaultState());
        if (this.panelConfigurationCommon?.Id !== undefined && this.panelConfigurationCommon?.Id !== -1 && UICommon.IsConfigSaved) {
          promises.push(this.initAlarmsAndLimitsState());
        }
      }
      if (this.panelConfigurationCommon.PanelTypeId === PanelTypeList.MultiNode) {
        promises.push(this.initeFCVPositionSettingState());
        promises.push(this.initSie());
      }
      promises.push(this.initWells());
      promises.push(this.initDataSources());
      promises.push(this.initDataPublishing());
      promises.push(this.initFlowMeters());
      promises.push(this.initDataLoggers());
      return Promise.all(promises).then((result) => {
        this.unsubscribeStoreSubscriptions();

        configSummaryData.panelSettingChanges = this.panelSettingChanges;
        configSummaryData.errorHandlingChanges = this.errorHandlingChanges;
        configSummaryData.unitSystemChanges = this.unitSystemChanges;
        configSummaryData.wellChanges = this.wellChanges;
        configSummaryData.devicesChanges = this.devicesChanges;
        configSummaryData.publishingChanges = this.publishingChanges;
        configSummaryData.surefloChanges = this.surefloChanges;
        // Inforce
        if (this.panelConfigurationCommon.PanelTypeId === PanelTypeList.INFORCE) {
          configSummaryData.shiftDefaultChanges = this.shiftDefaultChanges;
          configSummaryData.panelDefaultChanges = this.panelDefaultChanges;
          if (this.panelConfigurationCommon?.Id !== undefined && this.panelConfigurationCommon?.Id !== -1 && UICommon.IsConfigSaved) {
            configSummaryData.alarmsAndLimitsChanges = this.alarmsAndLimitsChanges;
          }
        }
        if (this.panelConfigurationCommon.PanelTypeId === PanelTypeList.MultiNode) {
          configSummaryData.eFCVPositionsChanges = this.eFCVPositionsChanges;
          configSummaryData.sieChanges = this.sieChanges;
        }
        configSummaryData.dataLoggerChanges = this.dataLoggerChanges;
        return configSummaryData;
      })
        .catch(reason => {
          console.log(reason);
          this.unsubscribeStoreSubscriptions();  // Unsubscribe Init*** state subscriptions
          return Promise.reject(reason);
        }).finally(() => {
          console.log("finally...");
        });
    });
  }
}

export class ConfigurationSummaryData {
  panelSettingChanges: SaveConfigurationChanges[];
  errorHandlingChanges: SaveConfigurationChanges[];
  unitSystemChanges: SaveConfigurationChanges[];
  wellChanges: SaveConfigurationChanges[];
  devicesChanges: SaveConfigurationChanges[];
  publishingChanges: SaveConfigurationChanges[];
  surefloChanges: SaveConfigurationChanges[];
  shiftDefaultChanges?: SaveConfigurationChanges[];
  panelDefaultChanges?: SaveConfigurationChanges[];
  alarmsAndLimitsChanges?: SaveConfigurationChanges[];
  dataLoggerChanges?: SaveConfigurationChanges[];
  sieChanges?: SaveConfigurationChanges[];
  eFCVPositionsChanges?: SaveConfigurationChanges[];
}

export class SaveConfigurationChanges {
  page: string;
  fieldName: string;
  originalValue: string;
  newValue: string;
  subHeader?: boolean = false;
}

export class ToolInfo {
  deviceIdCommConfig: number;
  cardDeviceId: number;
  deviceName: string;
  cardName: string;
  isInChargeTool: boolean
}
