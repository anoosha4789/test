export interface ShiftHistoryReportModel {
    Report: IReport,
    ShiftHistory: Array<IShifttHistory>
}

//Report General Info
interface IReport {

    Name: string,
    CreatedBy: string,
    Build: string,
    PanelType: string
}

//Shift History
export interface IShifttHistory {

    EventDateTime: string,
    ZoneName: string,
    WellName: string,
    FinalPosition: number,
    ExpectedReturnVolume: number,
    ActualReturnVolume: number,
    PositionDescription: string,
    OperatorName: string,
    ShiftMode: string
}