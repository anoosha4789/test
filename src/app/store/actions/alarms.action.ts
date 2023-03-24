import { createAction, props } from '@ngrx/store';
import { AlarmDefinitionDataUIModel } from '@core/models/webModels/AlarmDefinitionDataUI.model';
// ACTIONS

export const ALARMS_LOAD = createAction('[core module] Load Alarms');
export const ALARMS_LOAD_SUCCESS = createAction('[getInforcedevices/API] Alarms Loaded Success', props<{ alarmsui: AlarmDefinitionDataUIModel[] }>());
export const ALARMS_LOAD_FAILURE = createAction('[getInforcedevices/API] Alarms Loaded Failure', props<{ error: any }>());

export const ALARMS_RESET = createAction('[core module] Reset Alarms');