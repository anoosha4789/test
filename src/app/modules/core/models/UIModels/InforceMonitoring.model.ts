import { DataPointDefinitionModel } from "../webModels/DataPointDefinition.model";
import { InforceMonitoringZoneUIModel } from "./InforceZone.model";

export class InforceReserviorUIModel {
  name: string;
  device: DataPointDefinitionModel;
  min: number;
  max: number;
  threshold: object;
}

export class InforceGaugeOptions {
  type: string;
  thick: number;
  size: number;
  backgroundColor: string;
  foregroundColor: string;
}

export class InforceDeviceDetail {
  HPUID: number;
  Module2542ID: number;
  ModuleE1260ID: number;
}

export class InforceGaugeOptionUIModel extends InforceGaugeOptions {
  min: number;
  max: number;
  threshold: object;
}

export class InforceGaugeUIModel {
  device: DataPointDefinitionModel;
  options: InforceGaugeOptionUIModel
}

export class ThresholdRange {
  WarningLowLimit: number = 0;
  WarningHighLimit: number = 0;
  CriticalLowLimit: number = 0;
  CriticalHighLimit: number = 0;
  FatalLowLimit: number = 0;
  FatalHighLimit: number = 0;
  ValidLowLimit: number = 0;
  ValidHighLimit: number = 0;
}

export class InforceMonitoringWellUIModel {
  WellId: number;
  WellName: string;
  ControlArchitectureId: number;
  WellType: number;
  WellDeviceId: number;
  IsSuresensWell: boolean;
  Zones: InforceMonitoringZoneUIModel[];
  Expanded: boolean;
  SelectedToRunShift?: DataPointDefinitionModel;
}

export interface IHPUDeviceDetail {
  Connected: DataPointDefinitionModel;
  ShiftStatus: DataPointDefinitionModel;
  OperationMode: DataPointDefinitionModel;
  SetOperationMode: DataPointDefinitionModel; // To identify idle or not 
  ControlReciepeType: DataPointDefinitionModel;
}




