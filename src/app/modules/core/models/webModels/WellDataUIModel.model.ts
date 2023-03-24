import { MultiNodePositionDefaultsDataUIModel } from "../UIModels/MultiNodePositionDefaultsDataUI.model";
import { eFCVDataModel } from "./eFCVDataModel.model";
import { eFCVPositionModel } from "./eFCVPosition.model";
import { LineToZoneMappingModel } from "./LineToZoneMapping.model";
import { PanelToLineMappingModel } from "./PanelToLineMapping.model";
import { PositionDescriptionDataModel } from "./PositionDescriptionDataModel.model";
import { ReturnsBasedShiftDefaultsModel } from "./ReturnsBasedShiftDefaults.model";
import { TECDataModel } from "./TECDataModel.model";
import { TimeBasedShiftDefaultsModel } from "./TimeBasedShiftDefaults.model";
import { InFORCEZoneDataUIModel, ZoneDataUIModel } from "./ZoneDataUIModel.model";

export enum WellTypeEnum {
    InCHARGE = 1,
    SureSENS,
    InFORCE,
    MultiNode
}

export class WellDataUIModel {
    WellId: number;
    WellName: string;
    WellType: number;
    WellDeviceId: number;
}

export class SureSENSWellDataUIModel extends WellDataUIModel {

}

export class InChargeWellDataUIModel extends WellDataUIModel {
    ShiftDefaultId: number;
    UserParentShiftDefault: boolean;
    Zones: ZoneDataUIModel[];
}

export class InFORCEWellDataUIModel extends WellDataUIModel {
    ControlArchitectureId: number;
    NumberOfOutputs: number;
    Zones: InFORCEZoneDataUIModel[];
    ShiftMethod: string;
    ReturnsBasedShiftDefaults: ReturnsBasedShiftDefaultsModel;
    TimeBasedShiftDefaults: TimeBasedShiftDefaultsModel;
    PanelToLineMappings: PanelToLineMappingModel[];
    LineToZoneMapping: LineToZoneMappingModel[];
    IsPanelLevelShiftDefaultApplied: boolean;
}

export class MultiNodeWellDataUIModel extends WellDataUIModel {
    TEC: TECDataModel;
    Zones!: eFCVDataModel[];
    // eFCVPositions: MultiNodePositionDefaultsDataUIModel;
    PositionDescriptionData: PositionDescriptionDataModel[];
    // sieId: number;
}