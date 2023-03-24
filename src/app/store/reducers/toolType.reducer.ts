import { createReducer, on, Action } from '@ngrx/store';
import { initialToolTypes, IToolTypeState } from '@store/state/toolType.state';

import * as ACTIONS from '../actions/toolType.action';

const _toolTypesReducer = createReducer(
  initialToolTypes,
  on(ACTIONS.TOOLTYPES_LOAD_SUCCESS, (state, { toolTypes }) => ({
    ...state,
    isLoaded: true,
    isLoading: false,
    toolTypes: toolTypes.map((toolType) => toolType),
  })),
  on(ACTIONS.TOOLTYPES_LOAD_FAILURE, (state, { error }) => ({
    ...state,
    isLoaded: false,
    isLoading: false,
    error: error
  })),
  on(ACTIONS.TOOLTYPES_CLEARERRORS, (state, {}) => ({
    ...state,
    isLoaded: state.error == null ? true: false,
    isLoading: false,
    error: ''
  })),
);

export function toolTypesReducer(state: IToolTypeState, action: Action) {
  return _toolTypesReducer(state, action);
}