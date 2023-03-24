import { createReducer, on, Action } from '@ngrx/store';
import { IModbusProtocolState, initialModbusProtocol } from '@store/state/modbusProtocol.state';

import * as ACTIONS from '../actions/modbusProtocol.action';

const _modbusProtocolReducer = createReducer(
    initialModbusProtocol,
  on(ACTIONS.MODBUSPROTOCOL_LOAD_SUCCESS, (state, { protocols }) => ({
    ...state,
    isLoaded: true,
    isLoading: false,
    protocols: protocols.map((protocol) => protocol),
  })),
  on(ACTIONS.MODBUSPROTOCOL_LOAD_FAILURE, (state, { error }) => ({
    ...state,
    isLoaded: false,
    isLoading: false,
    error: error
  })),
  on(ACTIONS.MODBUSPROTOCOL_CLEARERRORS, (state, {}) => ({
    ...state,
    isLoaded: state.error == null ? true: false,
    isLoading: false,
    error: ''
  })),
);

export function modbusProtocolReducer(state: IModbusProtocolState, action: Action) {
  return _modbusProtocolReducer(state, action);
}