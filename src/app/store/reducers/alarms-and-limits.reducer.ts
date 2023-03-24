import { createReducer, on, Action } from '@ngrx/store';

import * as ACTIONS from '../actions/alarms-and-limits.action';
import { IAlarmsAndLimitsState, initialAlarmsAndLimitsState } from '@store/state/alarms-and-limits.state';

const _alarmsAndLimitsReducer = createReducer(
  initialAlarmsAndLimitsState,
  on(ACTIONS.LOAD_ALARMS_AND_LIMITS_SUCCESS, (state, { alarmsAndLimits }) => ({
    ...state,
    isLoaded: true,
    isLoading: false,
    isDirty: false,
    alarmsAndLimits,
  })),
  on(ACTIONS.LOAD_ALARMS_AND_LIMITS_FAILURE, (state, { error }) => ({
    ...state,
    isLoaded: true,
    isLoading: false,
    error,
  })),
  on(ACTIONS.UPDATE_ALARMS_AND_LIMITS, (state, { alarmsAndLimitsState }) => ({
    ...state,
    isLoaded: alarmsAndLimitsState.isLoaded,
    isDirty: alarmsAndLimitsState.isDirty,
    isValid: alarmsAndLimitsState.isValid,
    alarmsAndLimits: alarmsAndLimitsState.alarmsAndLimits,
    error: alarmsAndLimitsState.error
  })),
  on(ACTIONS.UPDATE_ALARMS_AND_LIMITS_SUCCESS, (state, {}) => ({
    ...state,
    isLoaded: true,
    isDirty: false,
    isValid: true,
    error: ''
  })),
  on(ACTIONS.UPDATE_ALARMS_AND_LIMITS_FAILURE, (state, { error }) => ({
    ...state,
    isLoaded: true,
    isLoading: false,
    isDirty: false,
    isValid: true,
    error
  })),
  on(ACTIONS.RESET_ALARMS_AND_LIMITS, (state) => ({
    ...state = initialAlarmsAndLimitsState
  })),
);
export function AlarmsAndLimitsReducer(state: IAlarmsAndLimitsState, action: Action) {
  return _alarmsAndLimitsReducer(state, action);
}
