import { createReducer, Action, on } from '@ngrx/store';
import { IPanelConfigurationCommonState, initialPanelConfigurationCommon } from '../state/panelConfigurationCommon.state';

import * as ACTIONS from '../actions/panelConfigurationCommon.action';

const _panelConfigurationCommonReducer = createReducer(
  initialPanelConfigurationCommon,
  on(ACTIONS.PANELCONFIG_COMMON_LOAD_SUCCESS, (state, { panelConfigurationCommon }) => ({
    ...state,
    isLoaded: true,
    isLoading: false,
    isDirty: false,
    error: '',
    panelConfigurationCommon: panelConfigurationCommon,
  })),
  on(ACTIONS.PANELCONFIG_COMMON_LOAD_FAILURE, (state, { error }) => ({
    ...state,
    isLoaded: false,
    isLoading: false,
    error: error
  })),
  on(ACTIONS.PANELCONFIG_COMMON_UPDATE, (state, { panelState }) => ({
    ...state,
    isDirty: panelState.isDirty,
    isValid: panelState.isValid,
    panelConfigurationCommon: panelState.panelConfigurationCommon,
    error: panelState.error
  })),
  on(ACTIONS.PANELCONFIG_COMMON_UPDATE_SUCCESS, (state, {}) => ({
    ...state,
    isDirty: false,
    isValid: true,
    error: ''
  })),
  on(ACTIONS.PANELCONFIG_COMMON_UPDATE_FAILURE, (state, { error }) => ({
    ...state,
    isLoaded: true,
    isLoading: false,
    isDirty: true,
    error: error
  })),
  on(ACTIONS.PANELCONFIG_COMMON_CLEARERRORS, (state, { }) => ({
    ...state,
    isLoaded: state.error == null ? true: false,
    isLoading: false,
    error: ''
  })),
  on(ACTIONS.PANELCONFIG_COMMON_RESET, (state) => ({
    ...state = initialPanelConfigurationCommon
  }))
);

export function panelConfigurationCommonReducer(state: IPanelConfigurationCommonState, action: Action) {
  return _panelConfigurationCommonReducer(state, action);
}