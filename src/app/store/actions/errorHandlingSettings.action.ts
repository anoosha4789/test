import { createAction, props } from '@ngrx/store';
import { ErrorHandlingUIModel } from '@core/models/webModels/ErrorHandlingUI.model';
import { IErrorHandlingSettingsState } from '@store/state/errorHandlingSettings.state';

export const LOAD_ERROR_HANDLING_SETTINGS = createAction(
  'Load Error Handling Settings'
);
export const LOAD_ERROR_HANDLING_SETTINGS_SUCCESS = createAction(
  'Error Handling Settings Load Success',
  props<{ errorHandlingSettings: ErrorHandlingUIModel }>()
);
export const LOAD_ERROR_HANDLING_SETTINGS_FAILURE = createAction(
  'Error Handling Settings Load Failure',
  props<{ error: any }>()
);

export const UPDATE_ERROR_HANDLING_SETTINGS = createAction(
  'Update Local Store Error Handling Settings',
  props<{ errorHandlingState: IErrorHandlingSettingsState }>()
);

export const UPDATE_ERROR_HANDLING_SETTINGS_DB = createAction(
  'Update Store Error Handling Settings',
  props<{ errorHandlingSettings: ErrorHandlingUIModel }>()
);
export const UPDATE_ERROR_HANDLING_SETTINGS_SUCCESS = createAction(
  'Update Error Handling Settings Success'
);
export const UPDATE_ERROR_HANDLING_SETTINGS_FAILURE = createAction(
  'Update Error Handling Settings Failure',
  props<{ error: any }>()
);

export const RESET_ERROR_HANDLING_SETTINGS = createAction(
  'Reset Error Handling Settings'
);
