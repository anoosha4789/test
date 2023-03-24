import { InChargeWellDataUIModel } from '../webModels/WellDataUIModel.model';
import { WellErrorNotifierModel } from './error-notifier-model';
import { InchargeZoneUIModel } from './incharge.zone.model';

export class InchargeWellUIModel extends InChargeWellDataUIModel{
    Zones: InchargeZoneUIModel[];
    IsValid: boolean;
    IsDirty: boolean;
    currentWellName?: string;
    Error?: WellErrorNotifierModel[];
}


