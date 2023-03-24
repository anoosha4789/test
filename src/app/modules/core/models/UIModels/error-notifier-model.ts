export class ErrorNotifierModel {
    path: string;
    tabName?: string;
    tabIndex?: number;
    errors: error[];
}

class error {
    name: string;
    value: string;
}

export class WellErrorNotifierModel extends ErrorNotifierModel {
    wellId:number;
    wellName: string;
    zoneId?: number;
}

export class PublishingErrorNotifierModel extends ErrorNotifierModel {
    pubId: number;
    fieldName: string;
}

export class DataSourceErrorNotifierModel extends ErrorNotifierModel {
    channelId: number;
    fieldName: string;
}

export class ChannelErrorNotifierModel extends ErrorNotifierModel {
    channelId: number;
    hasChildren?:false;
}

export class CardErrorNotifierModel extends ErrorNotifierModel {
    channelId: number;
    fieldName: string;
    deviceId:number;
    cardName?: string;
}