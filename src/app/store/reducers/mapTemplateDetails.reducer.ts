import { createReducer, on, Action } from '@ngrx/store';
import { initialIRegisteredModbusMap, IRegisteredModbusMapState } from '@store/state/mapTemplateDetails.state';

import * as ACTIONS from '../actions/mapTemplateDetails.action';

const _mapTemplateDetailsReducer = createReducer(
  initialIRegisteredModbusMap,
  on(ACTIONS.MAPTEMPLATES_LOAD_SUCCESS, (state, { templates }) => ({
    ...state,
    isLoaded: true,
    isLoading: false,
    isDirty: false,
    templates: templates.map((template) => template),
  })),
  on(ACTIONS.MAPTEMPLATES_LOAD_FAILURE, (state, { error }) => ({
    ...state,
    isLoaded: false,
    isLoading: false,
    error: error
  })),
  on(ACTIONS.MAPTEMPLATES_AFTER_SAVE_SUCCESS, (state, { templates }) => ({
    ...state,
    isLoaded: true,
    isLoading: false,
    isDirty: true,
    templates: templates.map((template) => template),
  })),
  on(ACTIONS.MAPTEMPLATES_CONFIG_SAVED, (state, {}) => ({
    ...state,
    isLoaded: true,
    isLoading: false,
    isDirty: false,
  })),
  on(ACTIONS.MAPTEMPLATES_CLEARERRORS, (state, {}) => ({
    ...state,
    isLoaded: state.error == null ? true: false,
    isLoading: false,
    error: ''
  })),
  on(ACTIONS.MAPTEMPLATES_RESET, (state) => ({
    ...state = initialIRegisteredModbusMap
  }))
);

export function mapTemplateDetailsReducer(state: IRegisteredModbusMapState, action: Action) {
  return _mapTemplateDetailsReducer(state, action);
}