import { WellDataUIModel } from '../webModels/WellDataUIModel.model';
import { WellErrorNotifierModel } from './error-notifier-model';
import { ZoneUIModel } from './zone.model';

export class WellUIModel extends WellDataUIModel {
    IsValid: boolean;
    IsDirty: boolean;
    currentWellName?: string;
    Error?: WellErrorNotifierModel[];
}


