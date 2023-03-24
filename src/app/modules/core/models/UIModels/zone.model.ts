import { InchargeToolUIModel } from './incharge.tool.model';

export class ZoneUIModel {
    ZoneId: number;
    ZoneName: string;
    MeasuredDepth: number;
    ZoneType: number;
    ZoneDeviceId: number;
    ValveSize?: string;
    ValveType?: string;
    Tools?: InchargeToolUIModel[];
}
