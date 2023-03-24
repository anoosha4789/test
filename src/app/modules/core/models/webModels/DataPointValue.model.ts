export enum DataPointValueType {
    RealTimeAcqData = 0,
    AbsentValue = 1,
    LinearConvertedValue = 2,
}
export class DataPointValueModel {
    public ValueType: DataPointValueType;
    public DeviceId: number;
    public DataPointIndex: number;
    public RawValue: number;
}

