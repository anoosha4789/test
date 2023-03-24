import { CommunicationChannelDataUIModel } from './CommunicationChannelDataUIModel.model';
export class SerialPortCommunicationChannelDataUIModel extends CommunicationChannelDataUIModel {
    public ComPort: number;
    public BaudRate: number;
    public DataBits: number;
    public StopBits: any; //StopBits;
    public Parity: any; //Parity;
    public PortNamePath: string;
    public SupportSoftwareFlowControl: boolean;
    public FlowControlTimeIntervalInMs: number;
	public Id: number;
}
