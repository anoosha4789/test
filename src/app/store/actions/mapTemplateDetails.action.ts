
import { RegisteredModbusMap } from '@core/models/UIModels/RegisteredModbusMap.model';
import { createAction, props } from '@ngrx/store';

// ACTIONS
export const MAPTEMPLATES_LOAD = createAction('MAPTEMPLATES LOAD');
export const MAPTEMPLATES_LOAD_SUCCESS = createAction('MAPTEMPLATES LOAD SUCCESS', props<{ templates: RegisteredModbusMap[] }>());
export const MAPTEMPLATES_LOAD_FAILURE = createAction('MAPTEMPLATES LOAD FAILURE', props<{ error: any }>());

export const MAPTEMPLATES_AFTER_SAVE = createAction('MAPTEMPLATES AFTER SAVE');
export const MAPTEMPLATES_AFTER_SAVE_SUCCESS = createAction('MAPTEMPLATES AFTER SAVE SUCCESS', props<{ templates: RegisteredModbusMap[] }>());
export const MAPTEMPLATES_CONFIG_SAVED = createAction('MAPTEMPLATES_SAVED_CONFIG');

export const MAPTEMPLATES_CLEARERRORS = createAction('MAPTEMPLATES CLEARERRORS');
export const MAPTEMPLATES_RESET = createAction('MAPTEMPLATES_RESET');