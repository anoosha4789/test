import { ErrorNotifierModel } from "../UIModels/error-notifier-model";

export class PowerSupplySettingsDataModel {
    MaxVoltage: number;
    MaxCurrent: number;
    TargetVoltage: number;
    RampRate: number;
    SettleVoltage: number;
    SettleRampRate: number;
    error?: ErrorNotifierModel[];
}

export class TECDataModel {
    Id: number;
    TECGuid: string;
    WellId: number;
    TecNumber: number;
    PowerSupplySettings: PowerSupplySettingsDataModel;
}