import { DataPointModbusRegisterConfigurationModel } from '../webModels/DataPointModbusRegisterConfiguration.model';
import { ModbusDeviceConfigurationModelUI } from '../webModels/ModbusDeviceConfigurationModelUI.model';
import { ModbusSlaveRegisterMapUI } from '../webModels/ModbusSlaveRegisterMapUI.model';
import { RegisteredModbusMap } from './RegisteredModbusMap.model';

export class ModbusDeviceConfigurationModelUIExtension extends ModbusDeviceConfigurationModelUI {
    Id:number
    SlaveIDCopy: number;
}

export enum RegisterTableType  {
    CoilDiscretes = 1,       //00000
    
    InputDiscretes = 2,   //10000
    
    HoldingRegisters = 3, //40000
    
    InputRegisters = 4    //30000
}
  
export enum Endianness {
      
    Little_Endian = 1,
    
    Big_Endian
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

export enum RegisteredModbusMapTypeEnum {
    Default = 1,
    Custom,
    Diagnostic
}
  
export class DataPointModbusRegisterConfigurationUIModel extends DataPointModbusRegisterConfigurationModel {
    public UnitQuantityType: string;
    public DisplayUnitSymbol:string;
}

export class ModbusMapSaveModel {
    public Id: number;
    public Name: string;
    public MapTypeId: number = RegisteredModbusMapTypeEnum.Custom;
    public MapRecords:ModbusSlaveRegisterMapUI[];
}

export class ModbusMapTemplateUIModel extends RegisteredModbusMap {
    public MapRecords:ModbusSlaveRegisterMapUI[];
}