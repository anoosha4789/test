export enum DataPointValueDataType {
  Boolean = 1,
  Byte,
  SignedInteger16Bit,
  SignedInteger32Bit,
  SignedInteger64Bit,
  UnsignedInteger16Bit,
  UnsignedInteger32Bit,
  UnsignedInteger64Bit,
  Float32Bit,
  Double64Bit,
}
export class DataPointDefinitionModel {
  public DeviceId: number;
  public DataPointIndex: number;
  public UnitQuantityType: string;
  public UnitSymbol: string;
  public TagName: string;
  public DataType: DataPointValueDataType;
  public ReadOnly: boolean;
  public RawValue: number;
  public DataPointType: number;
}
