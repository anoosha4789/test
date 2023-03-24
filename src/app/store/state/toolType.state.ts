import { GaugeTypeUIModel } from '@core/models/UIModels/models.model';
import { IState } from './IState';

export interface IToolTypeState extends IState {
  toolTypes: GaugeTypeUIModel[];
}

export const initialToolTypes: IToolTypeState = {
  toolTypes: [],
  isLoaded: false,
  isLoading: false,
  isDirty: false,
  isValid: false,
  error: '',
};