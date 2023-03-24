import { MultiNodeWellDataUIModel } from '../webModels/WellDataUIModel.model';
import { WellErrorNotifierModel } from './error-notifier-model';

export class MultiNodeWellUIModel extends MultiNodeWellDataUIModel {
    IsValid: boolean;
    IsDirty: boolean;
    currentWellName?: string;
    Error?: WellErrorNotifierModel[];
}


