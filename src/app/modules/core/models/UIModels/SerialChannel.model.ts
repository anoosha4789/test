import { SerialPortSettingsModel } from '../webModels/SerialPortSettings.model';

export class SerialChannelProperty {
    CommPorts: SerialPortSettingsModel[]; 
    BaudRates: string[];
    PollModes: string[];
    StopBits: string[];
    DataBits: string[];
    Parity: string[];
    Protocol: string[];
}