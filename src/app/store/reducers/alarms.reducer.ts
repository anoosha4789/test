import { createReducer, Action, on } from '@ngrx/store';
import { initialAlarmssState, IAlarmsState } from '@store/state/alarms.state';

import * as ACTIONS from '../actions/alarms.action';

const _AlarmsReducer = createReducer(
    initialAlarmssState,

  on(ACTIONS.ALARMS_LOAD_SUCCESS, (state, { alarmsui }) => ({
    ...state,
    isLoaded: true,
    isLoading: false,
    alarmsui: alarmsui?.map((iAlarm) => iAlarm),
  })),
  on(ACTIONS.ALARMS_LOAD_FAILURE, (state, { error }) => ({
    ...state,
    isLoaded: false,
    isLoading: false,
    error: error
  })),
  on(ACTIONS.ALARMS_RESET, (state) => ({
    ...state = initialAlarmssState
  }))
  
);

export function AlarmsReducer(state: IAlarmsState, action: Action) {
  return _AlarmsReducer(state, action);
}