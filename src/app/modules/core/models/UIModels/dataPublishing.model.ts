import { CommunicationChannelDataModel } from '../webModels/CommunicationChannelData.model';
import { CommunicationChannelDataUIModel } from '../webModels/CommunicationChannelDataUIModel.model';
import { SerialPortCommunicationChannelDataModel } from '../webModels/SerialPortCommunicationChannelData.model';
import { SerialPortCommunicationChannelDataUIModel } from '../webModels/SerialPortCommunicationChannelDataUIModel.model';
import { TcpIpCommunicationChannelDataModel } from '../webModels/TcpIpCommunicationChannelData.model';
import { TcpIpCommunicationChannelDataUIModel } from '../webModels/TcpIpCommunicationChannelDataUIModel.model';
import { PublishingErrorNotifierModel } from './error-notifier-model';

export class DataFormat {
    Integer16Bit: string;
    Integer32Bit: string;
    Integer64Bit: string;
    Float32Bit: string;
    Float64Bit: string;
    TimeFormatId: number;
    UnitSystemId: number;
}

export class ModbusConfigurationModelUI2 {
    public SlaveId: number;
    public Channel: CommunicationChannelDataModel; //channel info
    public Serial: SerialPortCommunicationChannelDataUIModel; //serial info
    public Tcp : TcpIpCommunicationChannelDataUIModel; // tcp info
    public ModbusDeviceMap: any;
    public UnitSystem: string;
    public IsForModbusMaster: boolean;
    public Endianness: number;
    public IsBytesSwapped: number;
    public RegisteredModbusMapId: number;
    public ModbusConfigurationId: number;
    public MapType: string;
    public ConnectionTo: string;
    public WordOrder: string;
    public ByteOrder: string;
}

export class ModbusConfigurationModelsUI {
    public Configurations: any; //dictionary object
}

export class PublishingDataUIModel {
    Id: number;
    Name: string;
    // Channel
    public Channel: CommunicationChannelDataUIModel;
    // ModbusConfiguration properties
    public SlaveId: number;
    public Serial: SerialPortCommunicationChannelDataUIModel; //serial info
    public Tcp : TcpIpCommunicationChannelDataUIModel; // tcp info
    public ModbusDeviceMap: any;
    public UnitSystem: string;
    public IsForModbusMaster: boolean;
    public Endianness: number;
    public IsBytesSwapped: number;
    public RegisteredModbusMapId: number;
    public ModbusConfigurationId: number;
    public MapType: string;
    public ConnectionTo: string;
    public WordOrder: string;
    public ByteOrder: string;
    // UI State management properties
    public IsValid: boolean;
    public IsDirty: boolean;
    Error?: PublishingErrorNotifierModel[];
}
