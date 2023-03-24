import { OverridePositionModel, TimebasedActuateModel } from "@core/models/webModels/MultiNodeUIDataModel.model";

export class MultiNodeManualOperation {
    isDataValid: boolean;
    operationType: string;
    timeBasedActuation: TimebasedActuateModel;
    overridePosition: OverridePositionModel;
}

export class MultiNodeCommon {
    static TimeBasedActuation: string = "TimeBasedActuation";
    static Actuation_TowardClose: string = "TowardsClose";
}

export class eFCVMotorSettings_Defaults {
    static readonly MaxVoltage: number = 140;
    static readonly MaxCurrent: number = 500;
    static readonly TargetVoltage: number = 90;
    static readonly OverCurrentThreshold: number = 0;
    static readonly OverCurrentOverrideFlag: boolean = false;
    static readonly DutyCycle: number = 0;
}