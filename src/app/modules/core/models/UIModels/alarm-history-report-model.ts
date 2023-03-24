export interface AlarmHistoryReportModel {
    Report: IReport,
    AlarmHistory: Array<IAlarmtHistory | IMultiNodeAlarmHistory>
}

//Report General Info
interface IReport {

    Name: string,
    CreatedBy: string,
    Build: string,
    PanelType: string
}

//Alarm History
export interface IAlarmtHistory {

    EventDateTime: string,
    Name: string,
    Description: string,
    Status: string,
    Severity: string
}


export interface IMultiNodeAlarmHistory {
    AlarmState: string,
    AlarmType: string,
    EquipmentName: string,
    EventDateTime: string,
    ParentEquipmentName: string,
    Start_UTC_DateTime: string
}
