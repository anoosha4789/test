export class CustomDataLoggerConfiguration {
    Id: number;
    Name: string;
    DataLoggerType: number;
    ScanRate: number;
    IsDeleted: number;
    WellId: number;
    customDataLoggerDataPoints: CustomDataLoggerDataPointUIModel[];
}

export class CustomDataLoggerDataPointUIModel {
    Id: number;
    DeviceId: number;
    IdDataLogger: number;
    DataPointIndex: number;
    TagName: string;
    UnitQuantityType: string;
    UnitSymbol: string;
    Precision: number;
}