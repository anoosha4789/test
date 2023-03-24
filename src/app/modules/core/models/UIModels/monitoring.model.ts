import { DataPointDefinitionModel } from "../webModels/DataPointDefinition.model";
import { InchargeZoneUIModel } from "./incharge.zone.model";
import { ToolConnectionUIModel } from "./tool-connection.model";

export class InChargeMonitoringZone {
    zone: InchargeZoneUIModel;
    zoneDevice: DataPointDefinitionModel;
    pumpOperationModeDevice: DataPointDefinitionModel;
    inchargeTool: ToolConnectionUIModel;
    tools: InChargeMonitoringTool[];
  }
  
export class InChargeMonitoringTool {
    tool: ToolConnectionUIModel;
    pressureDevice:DataPointDefinitionModel;
    temperatureDevice: DataPointDefinitionModel;
    diagnosticsDevice: DataPointDefinitionModel;
    diagnosticsCard: DataPointDefinitionModel;
  }