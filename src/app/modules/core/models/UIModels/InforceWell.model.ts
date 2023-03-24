import { InFORCEWellDataUIModel } from '../webModels/WellDataUIModel.model';
import { ErrorNotifierModel, WellErrorNotifierModel } from './error-notifier-model';

export class InforceWellUIModel extends InFORCEWellDataUIModel {
  
    IsValid: boolean;
    IsDirty: boolean;
    currentWellName?: string;
    Error?: WellErrorNotifierModel[];
    outMapErrors?: WellErrorNotifierModel[];
    zoneMapErrors?: WellErrorNotifierModel[];
    zoneErrors?: WellErrorNotifierModel[];
}


