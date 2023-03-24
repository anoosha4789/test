import { ValvePositionsAndReturnsModel } from "../webModels/ValvePositionsAndReturns.model";

export class ValvePositionsAndReturns extends ValvePositionsAndReturnsModel {
    Id: number;
    //Additional Property
    ZoneId: number;
    ReturnVolumeUnitType: IUnitReturnVolume;
    IsEditMode: boolean;
}

export interface IUnitReturnVolume {
    Id: number;
    Name: string;
}