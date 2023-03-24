import { Injectable } from '@angular/core';

import { PanelConfigurationCommonModel } from '@core/models/webModels/PanelConfigurationCommon.model';

import { ESP_TOOL_TYPES, ESP_VIBE_TOOL_TYPES, ReportService, TOOL_TYPES } from '@core/services/report.service';
import { DataSourceFacade } from '@core/facade/dataSourceFacade.service';
import { DataSourceUIModel } from '@core/models/UIModels/dataSource.model';
import { PublishingDataUIModel } from '@core/models/UIModels/dataPublishing.model';
import { ToolConnectionUIModel } from '@core/models/UIModels/tool-connection.model';
import { ErrorHandlingUIModel } from '@core/models/webModels/ErrorHandlingUI.model';
import { PanelConfigurationCommonUIModel } from '@core/models/UIModels/panel-configuration-common.model';
import { FlowMeterTypes, SureFLOFlowMeterUIModel, WellFlowTypes } from '@core/models/UIModels/sureflo.model';
import { UnitSystemModel } from '@core/models/webModels/UnitSystem.model';
import { IShiftDefaultState } from '@store/state/shift-default.state';
import { ShiftDefaultUIModel } from '@core/models/UIModels/shift-default.model';
import { AlarmsAndLimitsUIModel, FlowmeterTransmitterUIModel, PanelDefaultUIModel } from '@core/models/UIModels/panel-default.model';
import { SerialPortCommunicationChannelDataUIModel } from '@core/models/webModels/SerialPortCommunicationChannelDataUIModel.model';
import { CommunicationChannelType, DATA_LOGGER_TYPE, DEFAULT_eFCV_POSITIONS, DEFAULT_eFCV_POSITIONS_STAGES, PanelTypeList } from '@core/data/UICommon';
import { INFORCE_WELL_ARCHITECTURE } from './well.service';
import { TcpIpCommunicationChannelDataUIModel } from '@core/models/webModels/TcpIpCommunicationChannelDataUIModel.model';
import { DataLoggerUIModel } from '@core/models/UIModels/dataLogger.model';
import * as MultinodeModel from '@core/models/UIModels/multinode-report-model';
import { MultiNodePositionDefaultsDataUIModel } from '@core/models/UIModels/MultiNodePositionDefaultsDataUI.model';
import { PositionStagesDataModel } from '@core/models/webModels/PositionStagesDataModel.model';
import { SieUIModel } from '@core/models/UIModels/sie.model';

@Injectable({
  providedIn: 'root'
})


export class MultinodeReportService {

  unitSystem: any;
  protocolList: any[];
  public IPAddress: string;
  panelConfiguration: PanelConfigurationCommonUIModel;
  wellEntity: any[];
  datasourceEntity: DataSourceUIModel[];
  toolConnectionEntity: ToolConnectionUIModel[];
  publishingEntity: PublishingDataUIModel[];
  dataLoggerEntity: DataLoggerUIModel[];
  eFCVPositionSettings: MultiNodePositionDefaultsDataUIModel;
  sieEntity: SieUIModel[];

  constructor(
    private dataSourceFacade: DataSourceFacade,
    private reportService: ReportService) {
  }

  generateReportData(report: any,
    errorHandlingSettings: ErrorHandlingUIModel,
    protocolList,
    unitSystem: UnitSystemModel,
    panelConfiguration: PanelConfigurationCommonUIModel,
    wellEnity,
    dataSourceEntity: DataSourceUIModel[],
    toolConnectionList: ToolConnectionUIModel[],
    publishingEntity: PublishingDataUIModel[],
    dataLoggerEntity: DataLoggerUIModel[],
    eFCVPositionSettings: MultiNodePositionDefaultsDataUIModel,
    sieEntity): MultinodeModel.MultinodeReportModel {

    this.protocolList = protocolList;
    this.unitSystem = unitSystem;
    // Configuration
    this.panelConfiguration = panelConfiguration;
    this.wellEntity = wellEnity;
    this.datasourceEntity = dataSourceEntity;
    this.toolConnectionEntity = toolConnectionList;
    this.publishingEntity = publishingEntity;
    this.dataLoggerEntity = dataLoggerEntity;
    this.eFCVPositionSettings = eFCVPositionSettings;
    this.sieEntity = sieEntity;

    let reportModel: MultinodeModel.MultinodeReportModel = {
      // Report
      Report: {

        Name: "SureFIELD™ Gateway Configuration Report",
        CreatedBy: report.createdBy,
        Build: report.buildNumber
      },

      // Panel Configuration
      PanelConfiguration: this.getPanelInfo(),
      //eFCV Positions
      eFCVPositions: this.geteFCVPositions(eFCVPositionSettings?.PositionDescriptionData, eFCVPositionSettings?.PositionStagesData),
      // Units
      Units: this.getUnitSystems(),
      // Error Handling
      ErrorHandling: errorHandlingSettings,
      // SIEs
      SIEs: this.getSIEDetails(),
      // Wells
      // Wells: this.mapWellData(wellEnity),
      // Data Sources
      DataSource: this.getDataSourceDetails(),
      // Data Publishing
      DataPublishing: this.reportService.getPublishingDetails(this.publishingEntity),
      // Data Logger iField/Custom
      DataLogger: this.reportService.getDataLoggerDetails(this.dataLoggerEntity, this.wellEntity)
    };
    return reportModel;
  }

  // Get Panel Information
  getPanelInfo() {

    let panelConfig: PanelConfigurationCommonUIModel = this.panelConfiguration as PanelConfigurationCommonUIModel;
    let data: MultinodeModel.IPanelConfiguration = {
      PanelType: PanelTypeList[panelConfig.PanelTypeId],
      SerialNumber: panelConfig.SerialNumber,
      CustomerName: panelConfig.CustomerName,
      FieldName: panelConfig.FieldName
    };
    return data;
  }

  // Get Unit Systems
  getUnitSystems() {
    let units: MultinodeModel.IUnits[] = [];

    if (this.unitSystem && this.unitSystem.UnitQuantities.length > 0) {
      this.unitSystem.UnitQuantities.forEach(unit => {
        const unitObj: MultinodeModel.IUnits = {
          label: unit.UnitQuantityDisplayLabel,
          symbol: unit.SelectedDisplayUnitSymbol
        }
        units.push(unitObj);
      });
      return units;
    } else {
      return [];
    }

  }

  // Get eFCV Positions
  geteFCVPositions(PositionDescriptionData, PositionStagesData) {
    let eFCVPositions: MultinodeModel.IeFCVPositions[] = [];
    if (PositionStagesData?.length > 0 && PositionDescriptionData?.length > 0) {
      PositionStagesData.forEach((positionStagesData: PositionStagesDataModel, index) => {
        if (positionStagesData.PositionStage !== DEFAULT_eFCV_POSITIONS_STAGES.STAGE_NOTSET) {
          const posObj: MultinodeModel.IeFCVPositions = {
            position: positionStagesData.PositionStageDesc,
            description: PositionDescriptionData.find(posDes => posDes.PositionStage === positionStagesData.PositionStage)?.Description
          }
          eFCVPositions.push(posObj);
        }
      });
      return eFCVPositions;
    } else {
      return [];
    }

  }

  // Get SIE details
  getSIEDetails(): MultinodeModel.ISie[] {
    let sies: MultinodeModel.ISie[] = [];
    if (this.sieEntity && this.sieEntity.length > 0) {
      this.sieEntity.forEach(sie => {
        let wellEnity = [];
        sie.SIEWellLinks?.forEach(wellLink => {
          const wellData = this.wellEntity?.find(well => well.WellId === wellLink.WellId);
          if (wellData)
            wellEnity.push(wellData);
        })
        const sieData: MultinodeModel.ISie = {
          Name: sie.Name,
          IpAddress: sie.IpAddress,
          PortNumber: sie.PortNumber,
          MacAddress: sie.MacAddress,
          Wells: this.mapWellData(wellEnity)
        }
        sies.push(sieData);
      });
    }
    return sies;
  }

  // Map well Data
  mapWellData(wells): Array<MultinodeModel.IWell> {

    if (wells) {

      const wellList = Array<MultinodeModel.IWell>();
      for (const well of wells) {
        const wellObj: MultinodeModel.IWell = {
          WellId: well.WellId,
          WellName: well.WellName,
          ZoneGaugesVisbility: false,
          TecPowerSupply: well.TEC.PowerSupplySettings,
          eFCVPositions: this.geteFCVPositions(well.PositionDescriptionData, this.eFCVPositionSettings?.PositionStagesData),
          Zones: this.mapZones(well.Zones, well.WellId)
        }
        wellList.push(wellObj);
      }

      return wellList;
    }
    else return [];
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


  // Well Zone Mapping
  mapZones(zones, wellId): Array<MultinodeModel.IZone> {

    if (zones) {
      const zonesList = Array<MultinodeModel.IZone>();
      for (const zone of zones) {
        const zoneObj: MultinodeModel.IZone = {
          ZoneName: zone.ZoneName,
          Depth: zone.MeasuredDepth,
          eFCVAddress: zone.Address,
          SerialNumber: zone.SerialNumber,
          UniqueAddress: zone.UId,
          MaxVoltage: zone.MotorSettings.MaxVoltage,
          MaxCurrent: zone.MotorSettings.MaxCurrent,
          TargetVoltage: zone.MotorSettings.TargetVoltage,
          OverCurrentThreshold: zone.MotorSettings.OverCurrentThreshold,
          OverCurrentOverride: zone.MotorSettings.OverCurrentOverrideFlag ? "Yes" : "No",
          DutyCycle: zone.MotorSettings.DutyCycle,
          Gauges: this.mapZoneGaugeData(wellId, zone.ZoneId),
          ZoneGaugesVisbility: false
        }
        if (zoneObj.Gauges?.length > 0) {
          zoneObj.ZoneGaugesVisbility = true;
        }
        zonesList.push(zoneObj);
      }
      return zonesList;

    } else return [];
  }

  // Map Zone level gauge/tool connection data
  mapZoneGaugeData(wellId, zoneId): Array<MultinodeModel.IGauge> {

    const gaugeList = Array<MultinodeModel.IGauge>();
    const toolConnectionList = this.toolConnectionEntity.filter(tc => tc.WellId === wellId && tc.ZoneId === zoneId);

    if (toolConnectionList.length > 0) {

      const channelId = toolConnectionList[0].ChannelId;
      const datasource = this.datasourceEntity.find(ds => ds.Channel.IdCommConfig === channelId);

      datasource?.Cards.forEach(card => {

        if (card.Gauges) {

          for (const gauge of card.Gauges) {

            const tool = toolConnectionList.find(tool => tool.DeviceId == gauge.DeviceId);

            if (tool && tool.ZoneId == zoneId) {

              const gaugeObj: MultinodeModel.IGauge = {
                Description: gauge.Description,
                ToolAddress: gauge.ToolAddress,
                ToolType: gauge.GaugeType === 0 ? ESP_TOOL_TYPES[gauge.EspGaugeType] : (gauge.GaugeType === 1 ? ESP_VIBE_TOOL_TYPES[gauge.EspGaugeType] : TOOL_TYPES[gauge.GaugeType]),
                SerialNumber: gauge.SerialNumber,
                Porting: tool.Porting
              }
              gaugeList.push(gaugeObj);
            }
          }
        }
      });
      return gaugeList;
    } else return [];

  }

  // Get Data Source Details
  getDataSourceDetails() {
    if (this.datasourceEntity && this.datasourceEntity.length > 0) {
      const dsList = Array<MultinodeModel.IDataSource>();
      for (const datasource of this.datasourceEntity) {
        const isSerialType = datasource.Channel.channelType == CommunicationChannelType.SERIAL;
        const dataSourceObj: MultinodeModel.IDataSource = {
          ComPort: isSerialType ? (datasource.Channel as SerialPortCommunicationChannelDataUIModel).ComPort : null,
          BaudRate: isSerialType ? (datasource.Channel as SerialPortCommunicationChannelDataUIModel).BaudRate : null,
          PollRateInMs: (datasource.Channel as SerialPortCommunicationChannelDataUIModel).PollRateInMs,
          PortNamePath: isSerialType ? (datasource.Channel as SerialPortCommunicationChannelDataUIModel).Description : null,   // Description property to be used
          Protocol: this.reportService.getModbusProtocolName(datasource.Channel.Protocol, datasource.Channel.channelType),
          IpPortNumber: isSerialType ? null : (datasource.Channel as TcpIpCommunicationChannelDataUIModel).IpPortNumber,
          IpAddress: isSerialType ? null : (datasource.Channel as TcpIpCommunicationChannelDataUIModel).IpAddress,
          PollMode: datasource.Channel.SinglePollRateMode ? "Continuous" : "Burst",
          TimeoutInMs: datasource.Channel.TimeoutInMs,
          Cards: datasource.Cards ? this.getCardDetails(datasource.Cards, isSerialType) : []
        }
        dsList.push(dataSourceObj);
      }
      return dsList;
    } else return [];
  }

  getProtocolName(protocolId) {
    let protocolName = null;
    if (protocolId) {
      const protocol = this.protocolList.find((protocol) => protocol.Id === protocolId);
      protocolName = protocol ? protocol.Name : null;
    }
    return protocolName;
  }

  getCardDetails(cards: any[], isSerialType: boolean) {
    const cardsList = Array<MultinodeModel.ICard>();
    cards.forEach(card => {
      const cardObj: MultinodeModel.ICard = {
        CardType: "SureSENS",
        CardName: card.Description,
        CardAddress: isSerialType ? card.CardAddress : null,
        Gauges: this.getCardGaugeDetails(card.DeviceId, card.Gauges)
      }
      cardsList.push(cardObj);
    });
    return cardsList;
  }

  getCardGaugeDetails(cardDeviceId, gauges: any[]) {
    const gaugeList = Array<MultinodeModel.IGauge>();
    gauges.forEach(gauge => {

      const tool = this.toolConnectionEntity.find(tc => tc.CardDeviceId === cardDeviceId && tc.DeviceId === gauge.DeviceId);
      const cardObj: MultinodeModel.IGauge = {
        Description: gauge.Description,
        ToolAddress: gauge.ToolAddress,
        ToolType: gauge.GaugeType === 0 ? ESP_TOOL_TYPES[gauge.EspGaugeType] : (gauge.GaugeType === 1 ? ESP_VIBE_TOOL_TYPES[gauge.EspGaugeType] : TOOL_TYPES[gauge.GaugeType]),
        WellName: tool.WellName,
        ZoneName: tool.ZoneName,
        SerialNumber: gauge.SerialNumber
      }
      gaugeList.push(cardObj);
    });
    return gaugeList;
  }
}

