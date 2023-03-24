export interface ModbusReportModel {

    Report: IReport,
    DataPublishing?: IDataPublishing,
    CoilDiscretes?: Array<ICoilDiscretes>,
    InputDiscretes? : Array<IInputDiscretes>,
    InputRegisters?: Array<IInputRegisters>,
    HoldingRegisters?: Array<IHoldingRegisters>

}

// Report General Info
interface IReport {

    Name: string,
    CreatedBy: string,
    Build: string
}

// Data Publishing
export interface IDataPublishing {

    Protocol: string,
    Port: string,
    BaudRate: number,
    DataBits: number,
    StopBits: number,
    Parity: string,
    IpPortNumber: any,
    IpAddress: any,
    ConnectionTo: string,
    MapType: string,
    WordOrder: string,
    ByteOrder: string,
    SlaveId: number
}


// Coils - 0 Series
export interface ICoilDiscretes {

    Address: number,
    DataType: string,
    DataFormat: string,
    Description: string,
    Unit?: string
}


// Discrete Inputs - 10000 Series
export interface IInputDiscretes {

    Address: number,
    DataType: string,
    DataFormat: string,
    Description: string,
    Unit?: string
}

// Input Registers - 30000 Series
export interface IInputRegisters {
    Address: number,
    DataType: string,
    DataFormat: string,
    Description: string,
    Unit?: string
}

// Holding Registers - 40000 Series
export interface IHoldingRegisters {

    Address: number,
    DataType: string,
    DataFormat: string,
    Description: string,
    Unit?: string
}


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
    String,
}

export enum ModbusValueConversionFormatType  {
    
    INT_16_AB = 0, //Big-Endian
    
    INT_16_BA,    //Little-Endian
    
    INT_32_AB_CD, //4 bytes Integer: Big-Endian
    
    INT_32_CD_AB, //4 bytes Integer: Little-Endian byte swap
    
    INT_32_BA_DC, //4 bytes Integer: Big-Endian byte swap
    
    INT_32_DC_BA, //4 bytes Integer: Little-Endian
    
    FLOAT_32_AB_CD,//4 bytes Float: Big-Endian
    
    FLOAT_32_CD_AB,//4 bytes Float: Little-Endian byte swap
    
    FLOAT_32_BA_DC,//4 bytes Float: Big-Endian byte swap
    
    FLOAT_32_DC_BA,//4 bytes Float: Little-Endian
    
    INT_64_AB_CD_EF_GH,//8 bytes Integer: Big-Endian
    
    INT_64_GH_EF_CD_AB,//8 bytes Integer: Little-Endian byte swap
    
    INT_64_BA_DC_FE_HG,//8 bytes Integer: Big-Endian byte swap
    
    INT_64_HG_FE_DC_BA,//8 bytes Integer: Little-Endian
    
    DOUBLE_64_AB_CD_EF_GH,//8 bytes Double: Big-Endian
    
    DOUBLE_64_GH_EF_CD_AB,//8 bytes Double: Little-Endian byte swap
    
    DOUBLE_64_BA_DC_FE_HG,//8 bytes Double: Big-Endian byte swap
    
    DOUBLE_64_HG_FE_DC_BA,//8 bytes Double: Little-Endian
}

