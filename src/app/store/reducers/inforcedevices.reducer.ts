import { createReducer, Action, on } from '@ngrx/store';
import { initialInforceDeviceState, IInforceDeviceState } from '@store/state/inforcedevices.state';

import * as ACTIONS from '../actions/inforcedevices.action';

const _InforceDeviceReducer = createReducer(
    initialInforceDeviceState,
  on(ACTIONS.INFORCEDEVICES_LOAD_SUCCESS, (state, { inforcedevices }) => ({
    ...state,
    isLoaded: true,
    isLoading: false,
    inforcedevices: inforcedevices?.map((iFdevice) => iFdevice),
  })),
  on(ACTIONS.INFORCEDEVICES_LOAD_FAILURE, (state, { error }) => ({
    ...state,
    isLoaded: false,
    isLoading: false,
    error: error
  })),
  on(ACTIONS.INFORCEDEVICES_RESET, (state) => ({
    ...state = initialInforceDeviceState
  })),
  
);

export function InforceDeviceReducer(state: IInforceDeviceState, action: Action) {
  return _InforceDeviceReducer(state, action);
}