import { createReducer, on, Action } from '@ngrx/store';

import * as ACTIONS from '../actions/serialChannelProperties.action';
import { initialserialChannelProperties, ISerialChannelPropertiesState } from '@store/state/serialChannelProperties.state';

const _serialChannelPropertiesReducer = createReducer(
  initialserialChannelProperties,
  on(ACTIONS.SERIALCHANNELPROPERTIES_LOAD_SUCCESS, (state, { serialSettings }) => ({
    ...state,
    isLoaded: true,
    isLoading: false,
    serialChannelProperties: serialSettings,
  })),
  on(ACTIONS.SERIALCHANNELPROPERTIES_LOAD_FAILURE, (state, { error }) => ({
    ...state,
    isLoaded: false,
    isLoading: false,
    error: error
  })),
  on(ACTIONS.SERIALCHANNELPROPERTIES_CLEARERRORS, (state, {}) => ({
    ...state,
    isLoaded: state.error == null ? true: false,
    isLoading: false,
    error: ''
  })),
);

export function serialChannelPropertiesReducer(state: ISerialChannelPropertiesState, action: Action) {
  return _serialChannelPropertiesReducer(state, action);
}