import { createReducer, on, Action } from '@ngrx/store';
import { IPanelTypeState, initialPanelTypes } from '@store/state/panelType.state';

import * as ACTIONS from '../actions/panelType.action';

const _panelTypesReducer = createReducer(
  initialPanelTypes,
  on(ACTIONS.PANELTYPES_LOAD_SUCCESS, (state, { panels }) => ({
    ...state,
    isLoaded: true,
    isLoading: false,
    panels: panels.map((panel) => panel),
  })),
  on(ACTIONS.PANELTYPES_LOAD_FAILURE, (state, { error }) => ({
    ...state,
    isLoaded: false,
    isLoading: false,
    error: error
  })),
  on(ACTIONS.PANELTYPES_CLEARERRORS, (state, {}) => ({
    ...state,
    isLoaded: state.error == null ? true: false,
    isLoading: false,
    error: ''
  })),
);

export function panelTypesReducer(state: IPanelTypeState, action: Action) {
  return _panelTypesReducer(state, action);
}