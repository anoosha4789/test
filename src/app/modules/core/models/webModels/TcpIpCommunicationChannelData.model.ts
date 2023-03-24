import { CommunicationChannelDataModel } from './CommunicationChannelData.model';
export class TcpIpCommunicationChannelDataModel extends CommunicationChannelDataModel {
    public IpAddress: string;
    public IpPortNumber: number;
}