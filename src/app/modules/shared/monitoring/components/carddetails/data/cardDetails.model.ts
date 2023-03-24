import { DataPointDefinitionModel } from "@core/models/webModels/DataPointDefinition.model";
import { PointTemplatesExtensionUIModel } from "@core/models/webModels/PointTemplatesExtensionUIModel.model";

export class InChargeMonitoringToolDetails {
    deviceId: number;
    toolName: string;
    toolDiagnosticCode: number;
    toolDiagnosticStatus: number;
  }
  
  export class CardMonitoringPanel {
    panelName: string;
    deviceDataPoints: CardMonitoringDataPoint[];
  }
  
  export class CardMonitoringDataPoint {
    deviceDataPoint: DataPointDefinitionModel;
    pointTemplate: PointTemplatesExtensionUIModel;
    displayValue: string;
    toolTip: string;
    showToolTip: boolean;
    isFloat: boolean;
    isSpecialCase: boolean;
    colSpan: number;
    hide: boolean;
  }