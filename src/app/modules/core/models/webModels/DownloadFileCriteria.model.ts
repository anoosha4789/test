export class DownloadFileCriteriaModel {
    public BeginDateTime: string;
    public EndDateTime: string;
    public LoggerType: number;
    public LoggerSubType: string;
}

export enum LoggerTypeEnum {
    GaugeData = 1,   // /mnt/gateway-storage/AcqData/Card{}
    Diagnostics = 2, // /mnt/gateway-storage/AppLog/{}
    InForce = 3,
    ModbusMaps = 4,     // /mnt/gateway-storage/AcqData/HPU/{}
}