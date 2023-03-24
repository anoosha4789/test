import { IState } from './IState';
import { PanelType } from '@core/models/UIModels/PanelType.model';

export interface IPanelTypeState extends IState {
  panels: PanelType[];
}

export const initialPanelTypes: IPanelTypeState = {
  panels: [],
  isLoaded: false,
  isLoading: false,
  isDirty: false,
  isValid: false,
  error: '',
};