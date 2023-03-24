import { createReducer, on, Action } from '@ngrx/store';
import {
  initialserverRunningStatusState,
  IServerRunningStatusState,
} from '@store/state/serverRunningStatus.state';
import * as ACTIONS from '../actions/serverRunningStatus.action';

const serverRunningStatusStateReducer = createReducer(
  initialserverRunningStatusState,
  on(ACTIONS.SAVING_CONFIGURATION, (state) => ({
    ...state,
    isLoaded: true,
    isLoading: false,
    ConfigurationSavingInProgress: true,
  })),
  on(ACTIONS.DONE_SAVING_CONFIGURATION, (state) => ({
    ...state,
    isLoaded: false,
    isLoading: false,
    ConfigurationSavingInProgress: false,
  })),
  on(ACTIONS.RESETTING_CONFIGURATION, (state) => ({
    ...state,
    isLoaded: true,
    isLoading: false,
    ConfigurationResetingInProgress: true,
  })),
  on(ACTIONS.DONE_RESETTING_CONFIGURATION, (state) => ({
    ...state,
    isLoaded: false,
    isLoading: false,
    ConfigurationResetingInProgress: false,
  }))
);

export function ServerRunningStatusStateReducer(
  state: IServerRunningStatusState,
  action: Action
) {
  return serverRunningStatusStateReducer(state, action);
}
