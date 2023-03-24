import { Injectable } from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { Endianness, ModbusValueConversionFormatType, RegisterTableType } from '@core/models/UIModels/modbusTemplate.model';
import { RegisteredModbusMap } from '@core/models/UIModels/RegisteredModbusMap.model';
import { DataPointValueDataType } from '@core/models/webModels/DataPointDefinition.model';
import { DataPointModbusRegisterConfigurationModel } from '@core/models/webModels/DataPointModbusRegisterConfiguration.model';
import { Validator } from 'jsonschema';
import { Subject } from 'rxjs';
import { String } from 'typescript-string-operations';

@Injectable({
  providedIn: 'root'
})
export class ModbusDataPointsService {
  private _modbusMapDataPointsToAdd = new Subject<ModbusMapDataPointsToAdd>();
  constructor() { }

  setModbusDataPointsToAdd(modbusId: number, dataPointsToAdd: DataPointModbusRegisterConfigurationModel[]) {
    let modbusMapDataPointsToAdd: ModbusMapDataPointsToAdd = {
      modbusId: modbusId,
      dataPointsToAdd: dataPointsToAdd
    };
    this._modbusMapDataPointsToAdd.next(modbusMapDataPointsToAdd);
  }

  getModbusDataPointsToAdd(): Subject<ModbusMapDataPointsToAdd> {
    return this._modbusMapDataPointsToAdd;
  }

  getDataTypesBasedOnRegisterTableType(selectedRegisterTableType): number[] {
    let dataTypesBasedOnRegistersType: number[] = [];
    if (selectedRegisterTableType == RegisterTableType.HoldingRegisters || selectedRegisterTableType == RegisterTableType.InputRegisters) {
      dataTypesBasedOnRegistersType.push(DataPointValueDataType.SignedInteger16Bit);
      dataTypesBasedOnRegistersType.push(DataPointValueDataType.UnsignedInteger16Bit);
      dataTypesBasedOnRegistersType.push(DataPointValueDataType.SignedInteger32Bit);
      dataTypesBasedOnRegistersType.push(DataPointValueDataType.UnsignedInteger32Bit);
      dataTypesBasedOnRegistersType.push(DataPointValueDataType.Float32Bit);
      dataTypesBasedOnRegistersType.push(DataPointValueDataType.SignedInteger64Bit);
      dataTypesBasedOnRegistersType.push(DataPointValueDataType.Double64Bit); 
    }
    else if (selectedRegisterTableType == RegisterTableType.InputDiscretes || selectedRegisterTableType == RegisterTableType.CoilDiscretes) {
      dataTypesBasedOnRegistersType.push(DataPointValueDataType.Boolean);             
    }

    return dataTypesBasedOnRegistersType;
  }

  getNoOfBysteUsed(slaveDataType): number {
    let noOfBytesused: number = 0;

    switch(slaveDataType) {
      case DataPointValueDataType.Boolean:
      case DataPointValueDataType.SignedInteger16Bit:
      case DataPointValueDataType.UnsignedInteger16Bit:
        noOfBytesused = 1;
        break;

      case DataPointValueDataType.UnsignedInteger32Bit:
      case DataPointValueDataType.SignedInteger32Bit:
      case DataPointValueDataType.Float32Bit:
        noOfBytesused = 2;
        break;

      case DataPointValueDataType.SignedInteger64Bit:
      case DataPointValueDataType.Double64Bit:
        noOfBytesused = 4;
        break;
    }
    return noOfBytesused;
  }

  getStartRegisterAddress(lastUsedAddress, slaveDataType) {
    let noOfBytesUsed = this.getNoOfBysteUsed(slaveDataType);
    return lastUsedAddress + noOfBytesUsed;
  }

  formatDataType(slaveDataType: number) {
    return DataPointValueDataType[slaveDataType];
  }

  formatRegisterValue(startAddress: any, selectedRegisterType: RegisterTableType) {
    if (selectedRegisterType == RegisterTableType.HoldingRegisters)
        startAddress = Number(startAddress) + 40000;
    else if (selectedRegisterType == RegisterTableType.InputRegisters)
        startAddress = Number(startAddress) + 30000;
    else if (selectedRegisterType == RegisterTableType.InputDiscretes)
        startAddress = Number(startAddress) + 10000;
    return startAddress;
  }

  getRegisterAddressFromFormat(address: number, selectedRegisterType: RegisterTableType): number {
    let addressValue = address;
    if (selectedRegisterType == RegisterTableType.HoldingRegisters)
      addressValue = Number(address) - 40000;
    else if (selectedRegisterType == RegisterTableType.InputRegisters)
      addressValue = Number(address) - 30000;
    else if (selectedRegisterType == RegisterTableType.InputDiscretes)
      addressValue = Number(address) - 10000;

    return addressValue;
  }

  private getModbusValueConversionFormatType(valueType: number, endianness: number, bBytesSwapped: boolean): number {
    let conversionFormatType: ModbusValueConversionFormatType;
    switch (valueType) {
        case DataPointValueDataType.Boolean:
        case DataPointValueDataType.Byte:
        case DataPointValueDataType.SignedInteger16Bit:
        case DataPointValueDataType.UnsignedInteger16Bit:
            //JC NOTE: Modbus 16-big register is always big-endian
            conversionFormatType = ModbusValueConversionFormatType.INT_16_AB;
            break;
        case DataPointValueDataType.SignedInteger32Bit:
        case DataPointValueDataType.UnsignedInteger32Bit:
            switch (endianness) {
                case Endianness.Little_Endian:
                    conversionFormatType = bBytesSwapped ? ModbusValueConversionFormatType.INT_32_CD_AB : ModbusValueConversionFormatType.INT_32_DC_BA;
                    break;
                case Endianness.Big_Endian:
                    conversionFormatType = bBytesSwapped ? ModbusValueConversionFormatType.INT_32_BA_DC : ModbusValueConversionFormatType.INT_32_AB_CD;
                    break;
                default:
                    break;
            }
            break;
        case DataPointValueDataType.Float32Bit:
            switch (endianness) {
                case Endianness.Little_Endian:
                    conversionFormatType = bBytesSwapped ? ModbusValueConversionFormatType.FLOAT_32_CD_AB : ModbusValueConversionFormatType.FLOAT_32_DC_BA;
                    break;
                case Endianness.Big_Endian:
                    conversionFormatType = bBytesSwapped ? ModbusValueConversionFormatType.FLOAT_32_BA_DC : ModbusValueConversionFormatType.FLOAT_32_AB_CD;
                    break;
                default:
                    break;
            }
            break;
        case DataPointValueDataType.SignedInteger64Bit:
        case DataPointValueDataType.UnsignedInteger64Bit:
            switch (endianness) {
                case Endianness.Little_Endian:
                    conversionFormatType = bBytesSwapped ? ModbusValueConversionFormatType.INT_64_GH_EF_CD_AB : ModbusValueConversionFormatType.INT_64_HG_FE_DC_BA;
                    break;
                case Endianness.Big_Endian:
                    conversionFormatType = bBytesSwapped ? ModbusValueConversionFormatType.INT_64_BA_DC_FE_HG : ModbusValueConversionFormatType.INT_64_AB_CD_EF_GH;
                    break;
                default:
                    break;
            }
            break;

        case DataPointValueDataType.Double64Bit:
            switch (endianness) {
                case Endianness.Little_Endian:
                    conversionFormatType = bBytesSwapped ? ModbusValueConversionFormatType.DOUBLE_64_GH_EF_CD_AB : ModbusValueConversionFormatType.DOUBLE_64_HG_FE_DC_BA;
                    break;
                case Endianness.Big_Endian:
                    conversionFormatType = bBytesSwapped ? ModbusValueConversionFormatType.DOUBLE_64_BA_DC_FE_HG : ModbusValueConversionFormatType.DOUBLE_64_AB_CD_EF_GH;
                    break;
                default:
                    break;
            }
            break;
        //case DataPointValueDataType.String:
        //    break;
        default:
            break;
    }

    return conversionFormatType;
  }

  getModbusValueConversionFormatType_Enum(valueType: number, endianness: number, bBytesSwapped: boolean): number {
    return this.getModbusValueConversionFormatType(valueType, endianness, bBytesSwapped);
  }

  getModbusValueConversionFormatType_Value(valueType: number, endianness: number, bBytesSwapped: boolean) {
    let conversionFormatType = this.getModbusValueConversionFormatType(valueType, endianness, bBytesSwapped);
    return ModbusValueConversionFormatType[conversionFormatType];
  }

  private isDefaultMapName(mapName: string): boolean {
    if (mapName != null) {
        if (mapName.toLowerCase() == "suresens default" || mapName.toLowerCase() == "inforce default" || mapName.toLowerCase() == "incharge default"
            || mapName.toLowerCase() == "inforce flowmeter" || mapName.toLowerCase() == "inforce master"
            || mapName.toLowerCase() == "auto") {
            return true;
        }
        else
            return false;
    }
    else
        return false;
  }

  // Custom Form Validation functions
  mapNameValidator(mapId: number, mapName: string, mapTemplateList: RegisteredModbusMap[]): ValidatorFn {
    return (c: AbstractControl): { [key: string]: any } | null => {
        if (c.value === undefined || c.value == null)
            return null;
         
        if (c.value.toLowerCase() == "new" || this.isDefaultMapName(c.value.toLowerCase()))
            return { customError: "Restricted name not allowed." };
            
        let inxMap = mapTemplateList.findIndex(m => m.Id != mapId && m.MapName.toLocaleLowerCase() === c.value.trim().toLocaleLowerCase()) ?? -1;
        let bIsValidMap = inxMap == -1 ? true : false;
        if (!bIsValidMap) {
          return { customError: "Map template already exists." };
        }

        return null;
    };
  }
}

export class ModbusMapDataPointsToAdd {
  modbusId: number;
  dataPointsToAdd: DataPointModbusRegisterConfigurationModel[];
}

export let modbusMapNameSchema = {
  "type": "object",
  "properties": {
    "Id": {
      "type": "integer"
    },
    "MapName": {
      "type": [
        "string",
        "null"
      ],
      "maxLength": 50,
      "pattern": "^[a-zA-Z0-9-_# ]*$"
    }
  },
  "required": [
    "Id",
    "MapName"
  ]
}


