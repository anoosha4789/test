import { CommunicationChannelDataModel } from './CommunicationChannelData.model';
export class SerialPortCommunicationChannelDataModel extends CommunicationChannelDataModel {
    public ComPort: number;
    public BaudRate: number;
    public DataBits: number;
    public StopBits: any; //StopBits;
    public Parity: any; //Parity;
    public PortNamePrefix: string;
    public SupportSoftwareFlowControl: boolean;
    public FlowControlTimeIntervalInMs: number;
}
