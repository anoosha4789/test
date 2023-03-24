import { ValvePositionsAndReturnsModel } from "../webModels/ValvePositionsAndReturns.model";
import { IUnitReturnVolume } from "./ValvePositionsAndReturnsUIModel.model";

export class ValvePositionsAndReturnsUIModel extends ValvePositionsAndReturnsModel {}

export class ValvePositionsShiftUIModel extends ValvePositionsAndReturnsModel {
    Id: number;
    ZoneId: number;
    ReturnVolumeUnitType: IUnitReturnVolume;
    IsEditMode: boolean;
}