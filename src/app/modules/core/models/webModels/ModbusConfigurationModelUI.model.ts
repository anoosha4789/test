import { CommunicationChannelDataModel } from './CommunicationChannelData.model';
import { SerialPortCommunicationChannelDataModel } from './SerialPortCommunicationChannelData.model';
import { TcpIpCommunicationChannelDataModel } from './TcpIpCommunicationChannelData.model';
import { ModbusDeviceMapFromUI } from './ModbusDeviceMapFromUI.model';

export class ModbusConfigurationModelUI {
    public SlaveId: number;
    public Channel: CommunicationChannelDataModel; //channel info
    public Serial: SerialPortCommunicationChannelDataModel; //serial info
    public Tcp : TcpIpCommunicationChannelDataModel; // tcp info
    public ModbusDeviceMapArray: ModbusDeviceMapFromUI[]; //map - will include com_tool_tag
    public UnitSystem: string;
    public IsForModbusMaster: number;
    public Endianness: number;
    public IsBytesSwapped: number;
    public RegisteredModbusMapId: number;
    public ModbusConfigurationId: number;
    public MapType: string;
    public ConnectionTo: string;
}
