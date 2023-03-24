import { CommunicationChannelDataUIModel } from './CommunicationChannelDataUIModel.model';

export class TcpIpCommunicationChannelDataUIModel extends CommunicationChannelDataUIModel {
    public Id: number;
    public IpAddress: string;
    public IpPortNumber: number;
    public SupportSoftwareFlowControl: boolean;
    FlowControlTimeIntervalInMs: number;

}