import { ValvePositionsAndReturns } from "./ValvePositionsAndReturnsUIModel.model";

//mostly used for shift screens
export class WellShiftRecord {
    /*[DataMember(Order = 1)]*/
    public wellId: number;
    public wellName: string;
    public wellZoneShiftRecords: WellZoneShiftRecord[];
    public HcmId: number;
    public wellDeviceId: number;
    public controlArchitectureId: number;
    public tools: HOMETool[];
    public isExpand?:boolean;// for expand collapse
}

//Manual Mode DownholePopup
export class WellZoneShiftRecord {
    public zoneId: number;
    public zoneName: string;
    public downholeLine: string;
    public panelLine: string;
    public currentDownholePositionId: number;
    public currentDownholePosition: string;
    public targetDownholePositionId: number;
    public targetDownholePosition: string;
    public isFullShift:number=0;
    public valvepositionsDropDownValues: string[];
    public shiftStatus: string;
    public outputPressure: number;
    public isVentMode: boolean;
    public isCommonClose: boolean;
    public outputPressureIndex: number;
    public outputSolenoidIndex: number;
    public zoneIndex: number;
    public openLineIndexId: number;
    public HcmId: number;
    public currentPositionUnknownFlag:number;
    public ValvePositionsAndReturns: ValvePositionsAndReturns[];
    public previousCurrentPosition: string;//only used for autoshift screen to remember current position before shift starts.
    public isResetInProgress:boolean;//shares both vent progress and reset progress
}

export class HOMEWell {
    id: number;
    name: string;
    status: boolean;
    zones: HOMEZone[];
}

export class HOMEZone {
    tools: HOMETool[];
}

export class HOMETool {
    id: number;
    name: string;
    diagnosticCode: number;//diagnosticCode
    currIndex: number;
    toolType: string;
    temperature: number;
    temperatureUnit: string;
    pressure: number;
    pressureUnit: string;
}
