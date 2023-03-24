import { CommunicationChannelDataModel } from './CommunicationChannelData.model';
import { SureSENSGaugeDataModel } from './SureSENSGaugeData.model';
import { SerialPortCommunicationChannelDataModel } from './SerialPortCommunicationChannelData.model';
import { TcpIpCommunicationChannelDataModel } from './TcpIpCommunicationChannelData.model';
export class SureSENSInterfaceCardDataModel {
    public DeviceId: number;
    public Active: boolean;
    public CardAddress: number;
    public Channel: CommunicationChannelDataModel;
    public Gauges: SureSENSGaugeDataModel[];
    public CardType: any; //InterfaceCardType;
    public Description: string;
    public Serial: SerialPortCommunicationChannelDataModel;
    public Tcp: TcpIpCommunicationChannelDataModel;
}
