import { createReducer, on, Action } from '@ngrx/store';
import { IFlowmeterTransmitterState, initialFlowmeterTransmitterState } from '@store/state/flowmeterTransmitter.state';

import * as ACTIONS from '../actions/flowmeterTransmitter.action';

const _flowmeterTransmittersReducer = createReducer(
  initialFlowmeterTransmitterState,
  on(ACTIONS.LOAD_FLOWMETER_TRANSMITTER_TYPES_SUCCESS, (state, { flowmeterTransmitterTypes }) => ({
    ...state,
    isLoaded: true,
    isLoading: false,
    isDirty: false,
    flowmeterTransmitterTypes,
  })),  
  on(ACTIONS.LOAD_FLOWMETER_TRANSMITTER_TYPES_FAILURE, (state, { error }) => ({
    ...state,
    isLoaded: true,
    isLoading: false,
    error,
  })),
);

export function FlowmeterTransmitterReducer(state: IFlowmeterTransmitterState, action: Action) {
  return _flowmeterTransmittersReducer(state, action);
}