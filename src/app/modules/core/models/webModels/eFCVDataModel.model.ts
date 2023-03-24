import { MultiNodePositionDefaultsDataUIModel } from "../UIModels/MultiNodePositionDefaultsDataUI.model";
import { PositionDescriptionDataModel } from "./PositionDescriptionDataModel.model";

export class MotorSettingsDataModel {
    Id?: number;
    eFCVGuid?: string;
    MaxVoltage: number;
    MaxCurrent: number;
    TargetVoltage: number;
    OverCurrentThreshold: number;
    OverCurrentOverrideFlag: boolean;
    DutyCycle: number;
}

export class eFCVDataModel {
    ZoneId: number;
    eFCVGuid: string;
    UId: string;
    TECId: number;
    Address: string;
    SerialNumber: string;
    ZoneName: string;
    MeasuredDepth: number;
    MotorSettings: MotorSettingsDataModel;
    // wellId: number;
    // eFCVPositions: MultiNodePositionDefaultsDataUIModel;
    PositionDescriptionData: PositionDescriptionDataModel[];
    HcmId: number;
}