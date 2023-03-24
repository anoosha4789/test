import { Injectable } from '@angular/core';

import * as InForceModel from '@core/models/UIModels/inforce-report-model'
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
import { InforcePanelUIModel } from '@core/models/UIModels/inforce-panel-config-common.model';
import { IShiftDefaultState } from '@store/state/shift-default.state';
import { ShiftDefaultUIModel } from '@core/models/UIModels/shift-default.model';
import { AlarmsAndLimitsUIModel, FlowmeterTransmitterUIModel, PanelDefaultUIModel } from '@core/models/UIModels/panel-default.model';
import { SerialPortCommunicationChannelDataUIModel } from '@core/models/webModels/SerialPortCommunicationChannelDataUIModel.model';
import { CommunicationChannelType, DATA_LOGGER_TYPE } from '@core/data/UICommon';
import { INFORCE_WELL_ARCHITECTURE } from './well.service';
import { TcpIpCommunicationChannelDataUIModel } from '@core/models/webModels/TcpIpCommunicationChannelDataUIModel.model';
import { DataLoggerUIModel } from '@core/models/UIModels/dataLogger.model';

@Injectable({
  providedIn: 'root'
})


export class InForceReportService {

  unitSystem: any;
  protocolList: any[];
  public IPAddress: string;
  panelConfiguration: PanelConfigurationCommonUIModel;
  wellEntity: any[];
  datasourceEntity: DataSourceUIModel[];
  toolConnectionEntity: ToolConnectionUIModel[];
  publishingEntity: PublishingDataUIModel[];
  flowMeterList: SureFLOFlowMeterUIModel[];
  shiftDefaultData: ShiftDefaultUIModel;
  alarmsAndLimitsData: AlarmsAndLimitsUIModel;
  panelDefaultData: PanelDefaultUIModel;
  flowmeterTransmitterList: FlowmeterTransmitterUIModel[];
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
    shiftDefaultData: ShiftDefaultUIModel,
    panelDefaultData: PanelDefaultUIModel,
    alarmsAndLimitsData: AlarmsAndLimitsUIModel,
    flowmeterTransmitterList: FlowmeterTransmitterUIModel[],
    dataLoggerEntity: DataLoggerUIModel[]): InForceModel.InforceReportModel {

    this.protocolList = protocolList;
    this.unitSystem = unitSystem;
    // Configuration
    this.panelConfiguration = panelConfiguration;
    this.wellEntity = wellEnity;
    this.datasourceEntity = dataSourceEntity;
    this.toolConnectionEntity = toolConnectionList;
    this.publishingEntity = publishingEntity;
    this.flowMeterList = surefloEnity;
    this.shiftDefaultData = shiftDefaultData;
    this.panelDefaultData = panelDefaultData;
    this.alarmsAndLimitsData = alarmsAndLimitsData;
    this.flowmeterTransmitterList = flowmeterTransmitterList;
    this.dataLoggerEntity = dataLoggerEntity;

    let reportModel: InForceModel.InforceReportModel = {
      // Report
      Report: {

        Name: "SureFIELD™ Gateway Configuration Report",
        CreatedBy: report.createdBy,
        Build: report.buildNumber
      },

      // Panel Configuration
      PanelConfiguration: this.getPanelInfo(),
      // Units
      Units: this.getUnitSystems(),
      // Error Handling
      ErrorHandling: errorHandlingSettings,
      // Shift Defaults
      ShiftDefaults: this.getShiftDefaults(),
      // Panel Defaults
      PanelDefaults: this.getPanelDefaults(),
      // Wells
      Wells: this.mapWellData(wellEnity),
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

    let panelConfig: InforcePanelUIModel = this.panelConfiguration as InforcePanelUIModel;
    let data: InForceModel.IPanelConfiguration = {
      PanelType: panelTypes[panelConfig.PanelTypeId],
      SerialNumber: panelConfig.SerialNumber,
      HydraulicOutputs: panelConfig.HydraulicOutputs,
      CustomerName: panelConfig.CustomerName,
      FieldName: panelConfig.FieldName
    };
    return data;
  }

  // Get Unit Systems
  getUnitSystems() {
    let units: InForceModel.IUnits[] = [];

    if (this.unitSystem && this.unitSystem.UnitQuantities.length > 0) {
      this.unitSystem.UnitQuantities.forEach(unit => {
        const unitObj: InForceModel.IUnits = {
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

  //Shift Defaults - ReturnsBased / Time Based
  getShiftDefaults() {
    return {
      ReturnsBased: {
        ToleranceHigh: {
          Unit: this.shiftDefaultData?.ReturnsBasedShiftDefaults.IsToleranceUnitInPercentage == 0 ? "mL" : "%",
          Value: this.shiftDefaultData?.ReturnsBasedShiftDefaults.ToleranceHigh
        },
        ToleranceLow: {
          Unit: this.shiftDefaultData?.ReturnsBasedShiftDefaults.IsToleranceUnitInPercentage == 0 ? "mL" : "%",
          Value: this.shiftDefaultData?.ReturnsBasedShiftDefaults.ToleranceLow
        },
        StabilizationInterval: this.shiftDefaultData?.ReturnsBasedShiftDefaults.ReturnFlowStabilizationCheckingPeriodInSeconds,
        StabilizationFlowRate: this.shiftDefaultData?.ReturnsBasedShiftDefaults.MinimumReturnsFlowRateForStabilization,
        PressureLockTime: this.shiftDefaultData?.ReturnsBasedShiftDefaults.PressureLockTime,
        VentTime: this.shiftDefaultData?.ReturnsBasedShiftDefaults.VentTime,
        MinShiftTime: this.shiftDefaultData?.ReturnsBasedShiftDefaults.MinShiftTime,
        MaxShiftTime: this.shiftDefaultData?.ReturnsBasedShiftDefaults.MaxShiftTime,
        MinimumResetTime: this.reportService?.convertToTimeUnit("minutes", this.shiftDefaultData?.ReturnsBasedShiftDefaults.MinimumResetTime),
        Description: this.shiftDefaultData?.ShiftMethod.toString().toLowerCase() != 'timebased' ? "Preferred" : "Non-Preferred"

      },

      TimeBased: {

        PressureLockTime: this.shiftDefaultData?.TimeBasedShiftDefaults.PressureLockTime,
        VentTime: this.shiftDefaultData?.TimeBasedShiftDefaults.VentTime,
        ShiftTime: this.shiftDefaultData?.TimeBasedShiftDefaults.ShiftTime,
        MinimumResetTime: this.reportService.convertToTimeUnit("minutes", this.shiftDefaultData?.TimeBasedShiftDefaults.MinimumResetTime),
        Description: this.shiftDefaultData?.ShiftMethod.toString().toLowerCase() == 'timebased' ? "Preferred" : "Non-Preferred"

      }
    };
  }

  getPanelDefaults() {
    return {

      StartPumpPressure: {
        Unit: this.alarmsAndLimitsData?.StartPumpPressure.Unit,
        Descripiton: this.alarmsAndLimitsData?.StartPumpPressure.Descripiton,
        LimitValue: this.alarmsAndLimitsData?.StartPumpPressure.LimitValue
      },

      StopPumpPressure: {
        Unit: this.alarmsAndLimitsData?.StopPumpPressure.Unit,
        Descripiton: this.alarmsAndLimitsData?.StopPumpPressure.Descripiton,
        LimitValue: this.alarmsAndLimitsData?.StopPumpPressure.LimitValue
      },

      HighPumpPressure: {
        Unit: this.alarmsAndLimitsData?.HighPumpPressure.Unit,
        Descripiton: this.alarmsAndLimitsData?.HighPumpPressure.Descripiton,
        LimitValue: this.alarmsAndLimitsData?.HighPumpPressure.LimitValue
      },

      HighOutputPressure: {
        Unit: this.alarmsAndLimitsData?.HighOutputXPressure.Unit,
        Descripiton: this.alarmsAndLimitsData?.HighOutputXPressure.Descripiton,
        LimitValue: this.alarmsAndLimitsData?.HighOutputXPressure.LimitValue
      },

      HighSupplyPressure: {
        Unit: this.alarmsAndLimitsData?.HighSupplyPressure.Unit,
        Descripiton: this.alarmsAndLimitsData?.HighSupplyPressure.Descripiton,
        LimitValue: this.alarmsAndLimitsData?.HighSupplyPressure.LimitValue
      },

      LowReservoirLevel: {
        Unit: this.alarmsAndLimitsData?.LowReservoirLevel.Unit,
        Descripiton: this.alarmsAndLimitsData?.LowReservoirLevel.Descripiton,
        LimitValue: this.alarmsAndLimitsData?.LowReservoirLevel.LimitValue
      },

      DelayBeforeMeasuringReturns: this.panelDefaultData?.DelayBeforeMeasuringReturns,
      HPUPassiveModeEnabled: this.panelDefaultData?.HPUPassiveModeEnabled ? "Enabled" : "Disabled",
      HPUPassiveModeTimeout: this.panelDefaultData?.HPUPassiveModeTimeout,
      EnableLinePrePressurization: this.panelDefaultData?.EnableLinePrePressurization ? "Enabled" : "Disabled",
      DurationInSecondsToHoldPressure: this.panelDefaultData?.DurationInSecondsToHoldPressure,
      TimeIntervalInHoursToApplyPrePressurizationAgain: this.panelDefaultData?.TimeIntervalInHoursToApplyPrePressurizationAgain,
      FlowMeterTransmitterType: this.getFlowmeterTransmitterTypeName(this.panelDefaultData?.FlowMeterTransmitterType)

    }
  }

  private getFlowmeterTransmitterTypeName(type): string { 
    const selectedFlowmeter = this.flowmeterTransmitterList.find((flowmeter) => flowmeter.Id === type);
    return selectedFlowmeter ? selectedFlowmeter.FlowMeterTransmitterTypeDesc : "";
  }

  // Map well Data
  mapWellData(wells): Array<InForceModel.IWell> {

    if (wells) {

      const wellList = Array<InForceModel.IWell>();
      for (const well of wells) {
        const wellObj: InForceModel.IWell = {
          WellId: well.WellId,
          WellName: well.WellName,
          ControlArchitecture: this.getControlArchitecture(well.ControlArchitectureId),
          NumberOfOutputs: well.NumberOfOutputs !== 0 ? well.NumberOfOutputs.toString() : "N/A",
          ZoneGaugesVisbility: false,
          LineToZoneMapping: this.lineToZoneMapping(well),
          PanelToLineMappings: this.panelToLineMapping(well),
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


  // Line to Zone mapping 
  lineToZoneMapping(well): Array<InForceModel.ILineToZoneMapping> {

    if (well.LineToZoneMapping) {

      const lineToZoneMapList = Array<InForceModel.ILineToZoneMapping>();
      for (const lineToZoneMapping of well.LineToZoneMapping) {

        const lineToZoneMapObj: InForceModel.ILineToZoneMapping = {
          ZoneName: lineToZoneMapping.ZoneName,
          OpenLine: parseInt(lineToZoneMapping.ValveType) == 0 ? "N/A" : lineToZoneMapping.OpenLine,
          CloseLine: parseInt(lineToZoneMapping.ValveType) == 0 ? "N/A" : lineToZoneMapping.CloseLine,
          ValveType: this.reportService.getValveTypeId(lineToZoneMapping.ValveType)
        }
        lineToZoneMapList.push(lineToZoneMapObj);
      }
      this.mapMonitorValveData(well, lineToZoneMapList);
      return lineToZoneMapList;
    } else {
      //return this.mapMonitorValveData(well);
      return [];
    }
  }

  // Map Monitoring Gauge/Valve Data
  mapMonitorValveData(well, lineToZoneMapList?): Array<InForceModel.ILineToZoneMapping> {

    const monitorWellZoneMapList = Array<InForceModel.ILineToZoneMapping>();
    for (const zone of well.Zones) {
      // For monitoring 
      if (parseInt(zone.ValveType) == 0) {
        const lineToZoneMapObj: InForceModel.ILineToZoneMapping = {
          ZoneName: zone.ZoneName,
          OpenLine: "N/A",
          CloseLine: "N/A",
          ValveType: this.reportService.getValveTypeId(zone.ValveType)
        }
        if (lineToZoneMapList) lineToZoneMapList.push(lineToZoneMapObj);
        else monitorWellZoneMapList.push(lineToZoneMapObj);
      }
    }
    return lineToZoneMapList ? lineToZoneMapList : monitorWellZoneMapList;

  }

  // Panel to Line Mapping
  panelToLineMapping(well): Array<InForceModel.IPanelToLineMappings> {

    if (well.PanelToLineMappings) {

      const panelToLineMapList = Array<InForceModel.IPanelToLineMappings>();
      for (const panelToLineMap of well.PanelToLineMappings) {

        const panelToLineMapObj: InForceModel.IPanelToLineMappings = {
          PanelConnection: panelToLineMap.PanelConnection,
          DownholeLine: panelToLineMap.DownholeLine
        }

        panelToLineMapList.push(panelToLineMapObj);

      }
      return panelToLineMapList;

    } else return [];
  }
  // Well Zone Mapping
  mapZones(zones, wellId): Array<InForceModel.IZone> {

    if (zones) {
      const zonesList = Array<InForceModel.IZone>();
      for (const zone of zones) {

        const zoneObj: InForceModel.IZone = {
          ZoneName: zone.ZoneName,
          CurrentPosition: parseInt(zone.ValveType) == 0 ? "N/A" : zone.CurrentPosition.toString(),
          CurrentPositionStateUnknownFlag: zone.CurrentPositionStateUnknownFlag,
          Depth: zone.MeasuredDepth,
          NumberOfPositions: parseInt(zone.ValveType) == 0 ? "N/A" : zone.NumberOfPositions.toString(),
          ValveType: this.reportService.getValveTypeId(zone.ValveType),
          Gauges: this.mapZoneGaugeData(wellId, zone.ZoneId),
          ValvePositionsAndReturns: this.mapValvePositions(zone.ValvePositionsAndReturns)
        }
        zonesList.push(zoneObj);
      }
      return zonesList;

    } else return [];
  }

  // Map Zone level gauge/tool connection data
  mapZoneGaugeData(wellId, zoneId): Array<InForceModel.IGauge> {

    const gaugeList = Array<InForceModel.IGauge>();
    const toolConnectionList = this.toolConnectionEntity.filter(tc => tc.WellId === wellId && tc.ZoneId === zoneId);

    if (toolConnectionList.length > 0) {

      const channelId = toolConnectionList[0].ChannelId;
      const datasource = this.datasourceEntity.find(ds => ds.Channel.IdCommConfig === channelId);

      datasource?.Cards.forEach(card => {

        if (card.Gauges) {

          for (const gauge of card.Gauges) {

            const tool = toolConnectionList.find(tool => tool.DeviceId == gauge.DeviceId);

            if (tool && tool.ZoneId == zoneId) {

              const gaugeObj: InForceModel.IGauge = {
                Description: gauge.Description,
                ToolAddress: gauge.ToolAddress,
                ToolType: this.reportService.getGaugeTypeById(gauge.GaugeType),
                SerialNumber: gauge.SerialNumber,
              }
              gaugeList.push(gaugeObj);
            }
          }
        }
      });
      return gaugeList;
    } else return [];

  }

  // Map Valve Positions & Returns
  mapValvePositions(data): Array<InForceModel.IValvePositionsAndReturns> {

    if (data) {

      const valvePosList = Array<InForceModel.IValvePositionsAndReturns>();

      for (const item of data) {

        const valvePosObj: InForceModel.IValvePositionsAndReturns = {
          Description: item.Description,
          FromPosition: item.FromPosition,
          ReturnVolume: item.ReturnVolume ? parseFloat(item.ReturnVolume.toFixed(2)) : item.ReturnVolume,
          ReturnVolumeUnitType: {
            Id: 3,
            Name: "mL"
          },
          ToPosition: item.ToPosition,
          UserSelectable: item.UserSelectable ? "Yes" : "No"
        }
        valvePosList.push(valvePosObj)

      }

      return valvePosList;

    } else return [];
  }

  // Get Data Source Details
  getDataSourceDetails() {
    if (this.datasourceEntity && this.datasourceEntity.length > 0) {
      const dsList = Array<InForceModel.IDataSource>();
      for (const datasource of this.datasourceEntity) {
        const isSerialType = datasource.Channel.channelType == CommunicationChannelType.SERIAL;
        const dataSourceObj: InForceModel.IDataSource = {
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
    const cardsList = Array<InForceModel.ICard>();
    cards.forEach(card => {
      const cardObj: InForceModel.ICard = {
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
    const gaugeList = Array<InForceModel.IGauge>();
    gauges.forEach(gauge => {

      const tool = this.toolConnectionEntity.find(tc => tc.CardDeviceId === cardDeviceId && tc.DeviceId === gauge.DeviceId);
      const cardObj: InForceModel.IGauge = {
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

// Panel Type
enum panelTypes {
  InFORCE = 1
}