import { createReducer, on, Action } from '@ngrx/store';

import * as ACTIONS from '../actions/errorHandlingSettings.action';
import {IErrorHandlingSettingsState, initialErrorHandlingSettings} from '@store/state/errorHandlingSettings.state';

const errorHandlingSettingsReducer = createReducer(
    initialErrorHandlingSettings,
  on(ACTIONS.LOAD_ERROR_HANDLING_SETTINGS_SUCCESS, (state, { errorHandlingSettings }) => ({
    ...state,
    isLoaded: true,
    isLoading: false,
    isDirty: false,
    errorHandlingSettings,
  })),
  on(ACTIONS.LOAD_ERROR_HANDLING_SETTINGS_FAILURE, (state, { error }) => ({
    ...state,
    isLoaded: true,
    isLoading: false,
    error,
  })),
  on(ACTIONS.UPDATE_ERROR_HANDLING_SETTINGS, (state, { errorHandlingState }) => ({
    ...state,
    isLoaded: errorHandlingState.isLoaded,
    isDirty: errorHandlingState.isDirty,
    isValid: errorHandlingState.isValid,
    errorHandlingSettings: errorHandlingState.errorHandlingSettings,
    error: errorHandlingState.error
  })),
  on(ACTIONS.UPDATE_ERROR_HANDLING_SETTINGS_SUCCESS, (state, {}) => ({
    ...state,
    isLoaded: true,
    isDirty: false,
    isValid: true,
    error: ''
  })),
  on(ACTIONS.UPDATE_ERROR_HANDLING_SETTINGS_FAILURE, (state, { error }) => ({
    ...state,
    isLoaded: true,
    isLoading: false,
    isDirty: false,
    isValid: true,
    error
  })),
  on(ACTIONS.RESET_ERROR_HANDLING_SETTINGS, (state) => ({
    ...state = initialErrorHandlingSettings
  })),
);
export function ErrorHandlingSettingsReducer(state: IErrorHandlingSettingsState, action: Action) {
  return errorHandlingSettingsReducer(state, action);
}
