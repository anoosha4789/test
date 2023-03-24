import { createReducer, on, Action } from '@ngrx/store';

import * as ACTIONS from '../actions/shift-default.action';
import {IShiftDefaultState, initialShiftDefaultState} from '@store/state/shift-default.state';

const _shiftDefaultReducer = createReducer(
  initialShiftDefaultState,
  on(ACTIONS.LOAD_SHIFT_DEFAULTS_SUCCESS, (state, { shiftDefaults }) => ({
    ...state,
    isLoaded: true,
    isLoading: false,
    isDirty: false,
    shiftDefaults,
  })),
  on(ACTIONS.LOAD_SHIFT_DEFAULTS_FAILURE, (state, { error }) => ({
    ...state,
    isLoaded: true,
    isLoading: false,
    error,
  })),
  on(ACTIONS.UPDATE_SHIFT_DEFAULTS, (state, { shiftDefaultState }) => ({
    ...state,
    isLoaded: shiftDefaultState.isLoaded,
    isDirty: shiftDefaultState.isDirty,
    isValid: shiftDefaultState.isValid,
    shiftDefaults: shiftDefaultState.shiftDefaults,
    error: shiftDefaultState.error
  })),
  on(ACTIONS.UPDATE_SHIFT_DEFAULTS_SUCCESS, (state, { shiftDefaults }) => ({
    ...state,
    isLoaded: true,
    isDirty: false,
    isValid: true,
    error: ''
  })),
  on(ACTIONS.UPDATE_SHIFT_DEFAULTS_FAILURE, (state, { error }) => ({
    ...state,
    isLoaded: true,
    isLoading: false,
    isDirty: false,
    isValid: true,
    error
  })),
  on(ACTIONS.RESET_SHIFT_DEFAULTS, (state) => ({
    ...state = initialShiftDefaultState
  })),
);
export function ShiftDefaultReducer(state: IShiftDefaultState, action: Action) {
  return _shiftDefaultReducer(state, action);
}
