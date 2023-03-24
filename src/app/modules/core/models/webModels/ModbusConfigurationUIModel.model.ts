import { CommunicationChannelDataModel } from './CommunicationChannelData.model';

export class ModbusConfigurationModelUI {
    public SlaveId: number;
    public Channel: CommunicationChannelDataModel; //channel info
    public UnitSystem: string;
    public IsForModbusMaster: number;
    public Endianness: number;
    public IsBytesSwapped: number;
    public RegisteredModbusMapId: number;
    public ModbusConfigurationId: number;
    public MapType: string;
    public ConnectionTo: string;
}
