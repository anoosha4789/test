import { createReducer, Action, on } from '@ngrx/store';
import { initialUsersState, IUsersState } from '@store/state/users.state';

import * as ACTIONS from '../actions/users.action';

const _UsersReducer = createReducer(
  initialUsersState,
  on(ACTIONS.USERS_LOAD_SUCCESS, (state, { users }) => ({
    ...state,
    isLoaded: true,
    isLoading: false,
    users: users.map((user) => user),
  })),
  on(ACTIONS.USERS_LOAD_FAILURE, (state, { error }) => ({
    ...state,
    isLoaded: false,
    isLoading: false,
    error: error
  })),
  on(ACTIONS.USERS_ADD_SUCCESS, (state, { users }) => ({
    ...state,
    isLoaded: true,
    isLoading: false,
    users: users.map((user) => user),
    error: ''
  })),
  on(ACTIONS.USERS_ADD_FAILURE, (state, { error }) => ({
    ...state,
    isLoaded: false,
    isLoading: false,
    error: error
  })),
  on(ACTIONS.USERS_UPDATE_SUCCESS, (state, { users }) => ({
    ...state,
    isLoaded: true,
    isLoading: false,
    users: users.map((user) => user),
  })),
  on(ACTIONS.USERS_UPDATE_FAILURE, (state, { error }) => ({
    ...state,
    isLoaded: false,
    isLoading: false,
    error: error
  })),
  on(ACTIONS.USERS_DELETE_SUCCESS, (state, { users }) => ({
    ...state,
    isLoaded: true,
    isLoading: false,
    users: users.map((user) => user),
  })),
  on(ACTIONS.USERS_DELETE_FAILURE, (state, { error }) => ({
    ...state,
    isLoaded: false,
    isLoading: false,
    error: error
  })),
  on(ACTIONS.USERS_RESET, (state) => ({
    ...state = initialUsersState
  }))
);

export function UsersReducer(state: IUsersState, action: Action) {
  return _UsersReducer(state, action);
}