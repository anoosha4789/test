export class CommunicationChannelDataModel {
    public channelType: any; //CommunicationChannelType;
    public TimeoutInMs: number;
    public Retries: number;
    public PollRateInMs: number;
    public Protocol: any; //ModbusProtocol;
    public SinglePollRateMode: boolean;
}
