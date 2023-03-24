import { ErrorNotifierModel } from "../UIModels/error-notifier-model";

export class CommunicationChannelDataUIModel {
    public IdCommConfig: number;
    public Description: string;
    public channelType: number;
    public TimeoutInMs: number;
    public Retries: number;
    public PollRateInMs: number;
    public Protocol: number;
    public SinglePollRateMode: boolean;
    public  Purpose?: number;
}
