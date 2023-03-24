import { createReducer, on, Action } from '@ngrx/store';

import * as ACTIONS from '@store/actions/error.action';

const initalState = {};

const _errorReducer = createReducer(
  initalState,
  on(ACTIONS.ADD_GLOBAL_ERROR, (state, { error }) => ({
    ...state,
    isLoaded: true,
    isLoading: false,
    error: error
  }))
);

export function errorReducer(state: any = null, action: Action) {
  return _errorReducer(state, action);
}

