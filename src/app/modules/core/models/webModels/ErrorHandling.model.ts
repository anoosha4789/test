export class ErrorHandlingModel {
    public Id: number;
    public ModbusTimeout: number;
    public EnableBadData: boolean;
    public BadDataValue: number;
    public BadDataTimeout: number;
    public CommConfigId: number;
    public SerialCommPort: number;
    public IpAddress: string;
    public IpPortNumber: number;
    public BadDataValueInteger: number;
    public BadDataValueUnsignedInteger: number;
}