export class DataPointModbusRegisterConfigurationModel {
    public StartRegisterAddress: number;
    public DeviceId: number;
    public DataPointIndex: number;
    public SlaveDataType: number; //DataPointValueType;
    public ConversionFormat: number; //ModbusValueConversionFormatType;
    public UnitSymbol: string;
    public TagName: string;
    public ReadWriteFlag: number; //RegisterReadWriteType;
}