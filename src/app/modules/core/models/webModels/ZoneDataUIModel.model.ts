import { LineToZoneMappingModel } from "./LineToZoneMapping.model";
import { ReturnsBasedShiftDefaultsModel } from "./ReturnsBasedShiftDefaults.model";
import { TimeBasedShiftDefaultsModel } from "./TimeBasedShiftDefaults.model";
import { ValvePositionsAndReturnsModel } from "./ValvePositionsAndReturns.model";

export enum ZoneTypeEnum {
    InCHARGE = 1,
    Monitoring
}

export class BaseToolDataModel {
    ToolId: number;
    ToolType: number;
}

export class ZoneDataUIModel {
    ZoneId: number;
    ZoneName: string;
    MeasuredDepth: number;
    ZoneTypeEnum: number;
    Tools: BaseToolDataModel[];
    ZoneDeviceId: number;
}

export class InFORCEZoneDataUIModel {
    ZoneId: number;
    ZoneName: string;
    ValveType: number;
    NumberOfPositions: number;
    CurrentPosition: number;
    MeasuredDepth: number;
    ShiftMethod: string;
    ReturnsBasedShiftDefaults: ReturnsBasedShiftDefaultsModel;
    TimeBasedShiftDefaults: TimeBasedShiftDefaultsModel;
    LineToZoneMapping: LineToZoneMappingModel;
    ValvePositionsAndReturns: ValvePositionsAndReturnsModel[];
    HcmId: number;
    IsWellLevelShiftDefaultApplied: boolean;
    CurrentPositionStateUnknownFlag: boolean;
    WellId: number;
}