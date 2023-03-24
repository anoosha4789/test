import { SureSENSWellDataUIModel } from '../webModels/WellDataUIModel.model';
import { WellErrorNotifierModel } from './error-notifier-model';

export class SuresensWellUIModel extends SureSENSWellDataUIModel{
  
    IsValid: boolean;
    IsDirty: boolean;
    currentWellName?: string;
    Error?: WellErrorNotifierModel[];
}


