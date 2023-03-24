import { IState } from './IState';
import { AlarmDefinitionDataUIModel } from '@core/models/webModels/AlarmDefinitionDataUI.model';

export interface IAlarmsState extends IState {
    alarmsui:AlarmDefinitionDataUIModel[];
  }
  
export const initialAlarmssState: IAlarmsState = {
    
    alarmsui:[],
    isLoaded: false,
    isLoading: false,
    isDirty: false,
    isValid: false,
    error: '',
};