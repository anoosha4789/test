import { Injectable } from '@angular/core';

import { ESP_TOOL_TYPES, ESP_VIBE_TOOL_TYPES, ReportService, TOOL_TYPES } from '@core/services/report.service';
import { CommunicationChannelType, DATA_LOGGER_TYPE, PanelTypeList } from '@core/data/UICommon';

import * as reportUIModel from '@core/models/UIModels/report.model'
import { SuresensReportModel, ISuresensPanlConfiguration } from '@core/models/UIModels/suresens-report-model';
import { DataSourceUIModel } from '@core/models/UIModels/dataSource.model';
import { PublishingDataUIModel } from '@core/models/UIModels/dataPublishing.model';
import { ToolConnectionUIModel } from '@core/models/UIModels/tool-connection.model';
import { SerialPortCommunicationChannelDataUIModel } from '@core/models/webModels/SerialPortCommunicationChannelDataUIModel.model';
import { SuresensPanelConfigurationCommonUIModel } from '@core/models/UIModels/suresens-panel-config-common.model';
import { PanelConfigurationCommonUIModel } from '@core/models/UIModels/panel-configuration-common.model';
import { SuresensWellUIModel } from '@core/models/UIModels/suresens.well.model';
import { ErrorHandlingUIModel } from '@core/models/webModels/ErrorHandlingUI.model';
import { FlowMeterTypes, SureFLOFlowMeterUIModel, WellFlowTypes } from '@core/models/UIModels/sureflo.model';
import { UnitSystemModel } from '@core/models/webModels/UnitSystem.model';
import { TcpIpCommunicationChannelDataUIModel } from '@core/models/webModels/TcpIpCommunicationChannelDataUIModel.model';
import { DataLoggerUIModel } from '@core/models/UIModels/dataLogger.model';

@Injectable({
  providedIn: 'root'
})


export class SuresensReportService {

  unitSystem: any;
  protocolList: any[];
  panelConfiguration: PanelConfigurationCommonUIModel;
  wellList: any[];
  datasourceList: DataSourceUIModel[];
  toolConnectionList: ToolConnectionUIModel[];
  publishingList: PublishingDataUIModel[];
  flowMeterList: SureFLOFlowMeterUIModel[];
  dataLoggerEntity: DataLoggerUIModel[];
  public IPAddress: string;

  constructor(
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
    dataLoggerEntity: DataLoggerUIModel[]): SuresensReportModel {

    // Configuration
    this.panelConfiguration = panelConfiguration;
    this.wellList = wellEnity;
    this.datasourceList = dataSourceEntity;
    this.toolConnectionList = toolConnectionList;
    this.publishingList = publishingEntity;
    this.flowMeterList = surefloEnity;
    this.dataLoggerEntity = dataLoggerEntity;

    this.protocolList = protocolList;
    this.unitSystem = unitSystem;

    let reportModel: SuresensReportModel = {

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
      DataPublishing: this.reportService.getPublishingDetails(this.publishingList),
      // Data Logger iField/Custom
      DataLogger: this.reportService.getDataLoggerDetails(this.dataLoggerEntity, this.wellList)
    };
    return reportModel;

  }

  // Get Panel Information
  getPanelInfo() {

    let panelConfig: SuresensPanelConfigurationCommonUIModel = this.panelConfiguration as SuresensPanelConfigurationCommonUIModel;

    let data: ISuresensPanlConfiguration = {
      PanelType: 'SureSENS',
      SerialNumber: panelConfig.SerialNumber,
      CustomerName: panelConfig.CustomerName,
      FieldName: panelConfig.FieldName,
      ToggleWells: panelConfig.ToggleEnabled ? "Enabled" : "Disabled",
      ToggleInterval: panelConfig.ToggleIntervalInSec
    };
    return data;
  }

  // Get Unit Systems
  getUnitSystems() {
    let units: reportUIModel.IUnit[] = [];

    if (this.unitSystem && this.unitSystem.UnitQuantities.length > 0) {
      this.unitSystem.UnitQuantities.forEach(unit => {
        const unitObj: reportUIModel.IUnit = {
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

    let wells: SuresensWellUIModel[] = this.wellList;

    if (wells && wells.length > 0) {

      const wellList = Array<reportUIModel.IWell>();
      for (const well of wells) {
        const wellObj: reportUIModel.IWell = {
          WellId: well.WellId,
          ControlArchitecture: 'SureSENS',
          WellName: well.WellName,
          ToolConnections: this.getWellToolConection(well),
          FlowMeters: this.getFlowMeterList(well)
        }
        wellList.push(wellObj);
      }
      return wellList;
    } else return [];

  }


  getWellToolConection(well): Array<reportUIModel.IToolConnection> {

    const toolConnectionList = this.toolConnectionList.filter(tc => tc.WellId === well.WellId);

    if (toolConnectionList.length > 0) {
      const channelId = toolConnectionList[0].ChannelId;
      const datasource = this.datasourceList.find(ds => ds.Channel.IdCommConfig === channelId);
      if (datasource && datasource.Cards) {

        const toolsList = Array<reportUIModel.IToolConnection>();

        for (const card of datasource.Cards) {

          if (card.Gauges) {

            for (const gauge of card.Gauges) {

              const tool = this.toolConnectionList.find(tool => tool.DeviceId == gauge.DeviceId);

              if (tool.WellId == well.WellId) {

                const toolObj: reportUIModel.IToolConnection = {
                  Description: gauge.Description,
                  GaugeType: gauge.GaugeType === 0 ? ESP_TOOL_TYPES[gauge.EspGaugeType] : (gauge.GaugeType === 1 ? ESP_VIBE_TOOL_TYPES[gauge.EspGaugeType] : TOOL_TYPES[gauge.GaugeType]),
                  SerialNumber: gauge.SerialNumber,
                  ToolAddress: gauge.ToolAddress,
                  WellName: well.WellName
                }

                toolsList.push(toolObj);
              }
            }
          }

        }
        return toolsList;
      }

    } else return [];

  }

  getFlowMeterList(well): Array<reportUIModel.IFlowMeter> {

    const data = this.flowMeterList.filter(fm => fm.WellId === well.WellId);

    if (data.length > 0) {
      const flowMeterList = Array<reportUIModel.IFlowMeter>();
      data.forEach(flowMeter => {
        const flowMeterObj: reportUIModel.IFlowMeter = {
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


  // Get Data Source Details
  getDataSourceDetails() {
    if (this.datasourceList && this.datasourceList.length > 0) {
      const dsList = Array<reportUIModel.IDataSource>();
      for (const datasource of this.datasourceList) {
        const isSerialType = datasource.Channel.channelType == CommunicationChannelType.SERIAL;
        const dataSourceObj: reportUIModel.IDataSource = {
          ComPort: isSerialType ?
            (datasource.Channel as SerialPortCommunicationChannelDataUIModel).ComPort : null,
          BaudRate: isSerialType ?
            (datasource.Channel as SerialPortCommunicationChannelDataUIModel).BaudRate : null,
          PollRateInMs: (datasource.Channel as SerialPortCommunicationChannelDataUIModel).PollRateInMs,
          PortNamePath: isSerialType ?
            (datasource.Channel as SerialPortCommunicationChannelDataUIModel).Description : null, // Description property to be used
          Protocol: this.reportService.getModbusProtocolName(datasource.Channel.Protocol, datasource.Channel.channelType),
          IpPortNumber: isSerialType ?
            null : (datasource.Channel as TcpIpCommunicationChannelDataUIModel).IpPortNumber,
          IpAddress: isSerialType ?
            null : (datasource.Channel as TcpIpCommunicationChannelDataUIModel).IpAddress,
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

    const cardsList = Array<reportUIModel.ICard>();
    cards.forEach(card => {
      const cardObj: reportUIModel.ICard = {
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

    const tool = this.toolConnectionList.find(tc => tc.CardDeviceId === cardDeviceId);
    const gaugeList = Array<reportUIModel.IGauge>();
    gauges.forEach(gauge => {

      const tool = this.toolConnectionList.find(tc => tc.CardDeviceId === cardDeviceId && tc.DeviceId === gauge.DeviceId);
      const cardObj: reportUIModel.IGauge = {
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

// List Values
enum parityList {
  None = 0,
  Odd,
  Even,
  Mark,
  Space
}
