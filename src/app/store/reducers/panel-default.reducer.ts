import { createReducer, on, Action } from '@ngrx/store';

import * as ACTIONS from '../actions/panel-default.action';
import {IPanelDefaultState, initialPanelDefaultState} from '@store/state/panel-default.state';

const _panelDefaultReducer = createReducer(
  initialPanelDefaultState,
  on(ACTIONS.LOAD_PANEL_DEFAULTS_SUCCESS, (state, { panelDefaults }) => ({
    ...state,
    isLoaded: true,
    isLoading: false,
    isDirty: false,
    panelDefaults,
  })),
  on(ACTIONS.LOAD_PANEL_DEFAULTS_FAILURE, (state, { error }) => ({
    ...state,
    isLoaded: true,
    isLoading: false,
    error,
  })),
  on(ACTIONS.UPDATE_PANEL_DEFAULTS, (state, { panelDefaultState }) => ({
    ...state,
    isLoaded: panelDefaultState.isLoaded,
    isDirty: panelDefaultState.isDirty,
    isValid: panelDefaultState.isValid,
    panelDefaults: panelDefaultState.panelDefaults,
    error: panelDefaultState.error
  })),
  on(ACTIONS.UPDATE_PANEL_DEFAULTS_SUCCESS, (state, {}) => ({
    ...state,
    isLoaded: true,
    isDirty: false,
    isValid: true,
    error: ''
  })),
  on(ACTIONS.UPDATE_PANEL_DEFAULTS_FAILURE, (state, { error }) => ({
    ...state,
    isLoaded: true,
    isLoading: false,
    isDirty: false,
    isValid: true,
    error
  })),
  on(ACTIONS.RESET_PANEL_DEFAULTS, (state) => ({
    ...state = initialPanelDefaultState
  })),
);
export function PanelDefaultReducer(state: IPanelDefaultState, action: Action) {
  return _panelDefaultReducer(state, action);
}
