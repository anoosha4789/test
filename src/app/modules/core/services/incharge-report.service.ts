import { Injectable } from '@angular/core';

import * as inchargeModel from '@core/models/UIModels/incharge-report-model'
import { IPanelConfiguration } from '@core/models/UIModels/incharge-report-model'
import { PanelConfigurationCommonModel } from '@core/models/webModels/PanelConfigurationCommon.model';
import { InchargeWellUIModel } from '@core/models/UIModels/Incharge.well.model';

import { ESP_TOOL_TYPES, ESP_VIBE_TOOL_TYPES, ReportService, TOOL_TYPES } from '@core/services/report.service';
import { DataSourceFacade } from '@core/facade/dataSourceFacade.service';
import { DataSourceUIModel } from '@core/models/UIModels/dataSource.model';
import { PublishingDataUIModel } from '@core/models/UIModels/dataPublishing.model';
import { ToolConnectionUIModel } from '@core/models/UIModels/tool-connection.model';

import { CommunicationChannelType, DATA_LOGGER_TYPE } from '@core/data/UICommon';
import { SerialPortCommunicationChannelDataUIModel } from '@core/models/webModels/SerialPortCommunicationChannelDataUIModel.model';
import { InCHARGEGaugeDataUIModel } from '@core/models/webModels/InCHARGEGaugeDataUIModel.model';
import { ErrorHandlingUIModel } from '@core/models/webModels/ErrorHandlingUI.model';
import { PanelConfigurationCommonUIModel } from '@core/models/UIModels/panel-configuration-common.model';
import { FlowMeterTypes, SureFLOFlowMeterUIModel, WellFlowTypes } from '@core/models/UIModels/sureflo.model';
import { UnitSystemModel } from '@core/models/webModels/UnitSystem.model';
import { TcpIpCommunicationChannelDataUIModel } from '@core/models/webModels/TcpIpCommunicationChannelDataUIModel.model';
import { DataLoggerUIModel } from '@core/models/UIModels/dataLogger.model';

@Injectable({
  providedIn: 'root'
})


export class InchargeReportService {

  unitSystem: any;
  protocolList: any[];
  public IPAddress: string;
  panelConfiguration: PanelConfigurationCommonUIModel;
  wellEntity: any[];
  datasourceEntity: DataSourceUIModel[];
  toolConnectionEntity: ToolConnectionUIModel[];
  publishingEntity: PublishingDataUIModel[];
  flowMeterList: SureFLOFlowMeterUIModel[];
  dataLoggerEntity: DataLoggerUIModel[];

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
    surefloEnity: SureFLOFlowMeterUIModel[],
    dataLoggerEntity: DataLoggerUIModel[]): inchargeModel.InchargeReportModel {

    this.protocolList = protocolList;
    this.unitSystem = unitSystem;
    // Configuration
    this.panelConfiguration = panelConfiguration;
    this.wellEntity = wellEnity;
    this.datasourceEntity = dataSourceEntity;
    this.toolConnectionEntity = toolConnectionList;
    this.publishingEntity = publishingEntity;
    this.flowMeterList = surefloEnity;
    this.dataLoggerEntity = dataLoggerEntity;

    let reportModel: inchargeModel.InchargeReportModel = {

      // Report
      Report: {

        Name: "SureFIELD™ Gateway Configuration Report",
        CreatedBy: report.createdBy,
        Build: report.buildNumber
      },

      // Panel Configuration
      PanelConfiguration: this.getPanelInfo(),

      // Units
      UnitSystem: this.getUnitSystems(),

      // Error Handling
      ErrorHandling: errorHandlingSettings,

      // Wells
      Wells: this.getWellInfo(),

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

    let panelConfig: PanelConfigurationCommonModel = this.panelConfiguration;
    console.log('panel......', panelConfig)
    let data: IPanelConfiguration = {
      PanelType: panelTypes[panelConfig.PanelTypeId],
      SerialNumber: panelConfig.SerialNumber,
      CustomerName: panelConfig.CustomerName,
      FieldName: panelConfig.FieldName
    };
    return data;
  }

  // Get Unit Systems
  getUnitSystems() {
    let units: inchargeModel.IUnit[] = [];

    if (this.unitSystem && this.unitSystem.UnitQuantities.length > 0) {
      this.unitSystem.UnitQuantities.forEach(unit => {
        const unitObj: inchargeModel.IUnit = {
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

  // Get Well Info
  getWellInfo() {

    let wells: InchargeWellUIModel[] = this.wellEntity;

    if (wells && wells.length > 0) {

      const wellList = Array<inchargeModel.IWell>();
      for (const well of wells) {
        const wellObj: inchargeModel.IWell = {
          WellId: well.WellId,
          WellName: well.WellName,
          ZoneGaugesVisbility: true,
          Zones: this.getZoneDetails(well.Zones, well.WellId, well.WellName),
          Gauges: this.getWellGaugeDetails(well),
          FlowMeters: this.getFlowMeterList(well)
        }
        wellList.push(wellObj);
      }
      return wellList;
    } else return [];

  }

  // Get Data Source Details
  getDataSourceDetails() {
    if (this.datasourceEntity && this.datasourceEntity.length > 0) {
      const dsList = Array<inchargeModel.IDataSource>();
      for (const datasource of this.datasourceEntity) {
        const isSerialType = datasource.Channel.channelType == CommunicationChannelType.SERIAL;
        const dataSourceObj: inchargeModel.IDataSource = {
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

    const cardsList = Array<inchargeModel.ICard>();
    cards.forEach(card => {
      const cardObj: inchargeModel.ICard = {
        CardType: card.SupportInChargePowerSupplyModule ? "InCHARGE" : "SureSENS",
        CardName: card.Description,
        CardAddress: isSerialType ? card.CardAddress : null,
        Gauges: this.getCardGaugeDeails(card.DeviceId, card.Gauges)
      }
      cardsList.push(cardObj);
    });
    return cardsList;
  }

  getCardGaugeDeails(cardDeviceId, gauges: any[]) {

    const tool = this.toolConnectionEntity.find(tc => tc.CardDeviceId === cardDeviceId);
    const gaugeList = Array<inchargeModel.IGauge>();
    gauges.forEach(gauge => {
      const tool = this.toolConnectionEntity.find(tc => tc.CardDeviceId === cardDeviceId && tc.DeviceId === gauge.DeviceId);
      const cardObj: inchargeModel.IGauge = {
        Description: gauge.Description,
        ToolAddress: gauge.ToolAddress,
        ToolType: gauge.GaugeType === 0 ? ESP_TOOL_TYPES[gauge.EspGaugeType] : (gauge.GaugeType === 1 ? ESP_VIBE_TOOL_TYPES[gauge.EspGaugeType] : TOOL_TYPES[gauge.GaugeType]),
        WellName: tool.WellName,
        ZoneName: tool.ZoneName,
        SerialNumber: gauge.SerialNumber,
        valveInitialOpen: tool.Porting ? null : (gauge as InCHARGEGaugeDataUIModel).InCHARGEOpeningPercentage,
        Porting: tool.Porting ? tool.Porting : null
      }
      gaugeList.push(cardObj);
    });
    return gaugeList;

  }

  // Well Zone Mapping
  getZoneDetails(zones, wellId, wellName): Array<inchargeModel.IZone> {

    if (zones) {
      const zonesList = Array<inchargeModel.IZone>();
      for (const zone of zones) {
        const zoneObj: inchargeModel.IZone = {
          ZoneName: zone.ZoneName,
          WellName: wellName,
          Depth: zone.MeasuredDepth,
          ValveType: 'N/A',
          ValveSize: 'N/A',
          Gauges: this.getZoneGaugeDetails(wellId, zone.ZoneId)
        };
        this.updateZoneDetails(zone.ZoneId, zoneObj);
        zonesList.push(zoneObj);
      }
      return zonesList;

    } else return [];
  }

  updateZoneDetails(zoneId: number, zone: inchargeModel.IZone) {

    const toolConnectionList = this.toolConnectionEntity?.filter(tc => tc.ZoneId === zoneId);
    toolConnectionList?.forEach(tc => {
      this.getToolDetails(tc, zone);
    });
  }

  getFlowMeterList(well): Array<inchargeModel.IFlowMeter> {

    const data = this.flowMeterList.filter(fm => fm.WellId === well.WellId);

    if (data.length > 0) {
      const flowMeterList = Array<inchargeModel.IFlowMeter>();
      data.forEach(flowMeter => {
        const flowMeterObj: inchargeModel.IFlowMeter = {
          DeviceName: flowMeter.DeviceName,
          Serial: flowMeter.Serial,
          Technology: FlowMeterTypes[flowMeter.Technology],
          WellType: WellFlowTypes[flowMeter.FluidType]
        }
        flowMeterList.push(flowMeterObj);
      });
      return flowMeterList;

    } else return [];

  }

  getToolDetails(toolConnection, zone: inchargeModel.IZone) {

    this.dataSourceFacade.dataSourcesEntity?.forEach(ds => {
      ds.Cards?.forEach(card => {
        card.Gauges.forEach(gauge => {
          if (gauge.DeviceId === toolConnection.DeviceId) {
            this.setValveDetails(gauge, zone);
          }
        })
      });
    });
  }

  setValveDetails(gauge, zone) {
    if (gauge.InCHARGECoefficientFileContent) {
      const gaugeDetails = gauge.InCHARGECoefficientFileContent;
      zone.ValveSize = gaugeDetails.ToolSize;
      zone.ValveType = gaugeDetails.ToolType;
    }
  }

  // Map Zone level gauge/tool connection data
  getZoneGaugeDetails(wellId, zoneId): Array<inchargeModel.IGauge> {

    const gaugeList = Array<inchargeModel.IGauge>();

    const toolConnectionList = this.toolConnectionEntity.filter(tc => tc.WellId === wellId && tc.ZoneId === zoneId);

    if (toolConnectionList.length > 0) {

      const channelId = toolConnectionList[0].ChannelId;
      const datasource = this.datasourceEntity.find(ds => ds.Channel.IdCommConfig === channelId);

      datasource?.Cards.forEach(card => {

        for (const gauge of card?.Gauges) {

          const tool = toolConnectionList.find(tool => tool.DeviceId == gauge.DeviceId);

          if (tool && tool.ZoneId == zoneId) {
            const gaugeObj: inchargeModel.IGauge = {
              Description: gauge.Description,
              ToolAddress: gauge.ToolAddress,
              ToolType: gauge.GaugeType === 0 ? ESP_TOOL_TYPES[gauge.EspGaugeType] : (gauge.GaugeType === 1 ? ESP_VIBE_TOOL_TYPES[gauge.EspGaugeType] : TOOL_TYPES[gauge.GaugeType]),
              SerialNumber: gauge.SerialNumber,
            }
            gaugeList.push(gaugeObj);
          }
        }

      });

      return gaugeList;
    } else {
      return [];
    }

  }

  // Map gauges/tools without zone 
  getWellGaugeDetails(well: InchargeWellUIModel): Array<inchargeModel.IGauge> {

    const gaugeList = Array<inchargeModel.IGauge>();

    const toolConnectionList = this.toolConnectionEntity.filter(tc => tc.WellId === well.WellId);

    if (toolConnectionList.length > 0) {
      const channelId = toolConnectionList[0].ChannelId;
      const datasource = this.datasourceEntity.find(ds => ds.Channel.IdCommConfig === channelId);
    }
    return [];

  }

  getCardGaugeDetails(gaugeData, toolConList): Array<inchargeModel.IGauge> {

    const gaugeList = Array<inchargeModel.IGauge>();
    if (gaugeData) {
      for (const item of gaugeData) {
        const gauge: inchargeModel.IGauge = {
          Description: item.Description,
          ToolAddress: item.ToolAddress,
          ToolType: item.GaugeType === 0 ? ESP_TOOL_TYPES[item.EspGaugeType] : (item.GaugeType === 1 ? ESP_VIBE_TOOL_TYPES[item.EspGaugeType] : TOOL_TYPES[item.GaugeType]),
          SerialNumber: item.SerialNumber,
          WellName: toolConList.find(tool => tool.DeviceId == item.DeviceId).WellName ?? null,
          ZoneName: toolConList.find(tool => tool.DeviceId == item.DeviceId).ZoneName ?? null,
        }
        gaugeList.push(gauge);
      }

    }
    return gaugeList;
  }
}

// Panel Type
enum panelTypes {
  InCHARGE = 5
}
