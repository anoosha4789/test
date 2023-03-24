import { ModbusDeviceMapFromUI } from './ModbusDeviceMapFromUI.model';
import { CommunicationChannelDataModel } from './CommunicationChannelData.model';

export class ModbusConfigurationModel {
    public Channel: CommunicationChannelDataModel;
    public ModbusDeviceMapArray: ModbusDeviceMapFromUI[];
    public UnitSystem: string;
    public IsForModbusMaster: boolean;
    public ModbusConfigurationId: number;
}