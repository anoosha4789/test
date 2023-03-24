import { ValvePositionsAndReturns } from "./ValvePositionsAndReturnsUIModel.model";

export class InforceWellShiftUIModel {
    public wellId: number;
    public wellName: string;
    public wellZoneShiftRecords: InforceZoneShiftRecordUIModel[];
    public HcmId: number;
    public controlArchitecture: string;
    public shiftStartTime?: number;
    tools: any;
}

export class InforceZoneShiftRecordUIModel {
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