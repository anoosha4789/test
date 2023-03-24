import { createReducer, on, Action } from '@ngrx/store';
import { ILoggerTypeState, initialLoggerTypeState } from '@store/state/dataLoggerTypes.state';

import * as ACTIONS from '../actions/dataLoggerTypes.action';

const _dataLoggerTypesReducer = createReducer(
    initialLoggerTypeState,
    on(ACTIONS.LOAD_DATA_LOGGER_TYPES_SUCCESS, (state, { loggerTypes }) => ({
        ...state,
        isLoaded: true,
        isLoading: false,
        isDirty: false,
        loggerTypes,
    })),
    on(ACTIONS.LOAD_DATA_LOGGER_TYPES_FAILURE, (state, { error }) => ({
        ...state,
        isLoaded: true,
        isLoading: false,
        error,
    })),
    on(ACTIONS.LOGGER_TYPES_RESET, (state) => ({
        ...state = initialLoggerTypeState
      })),

);

export function DataLoggerTypesReducer(state: ILoggerTypeState, action: Action) {
    return _dataLoggerTypesReducer(state, action);
}