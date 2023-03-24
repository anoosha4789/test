import { createReducer, on, Action, createFeatureSelector, createSelector } from '@ngrx/store';
import { adapter, IDataLoggerEntityState, initialDataLoggerState } from '@store/state/dataLogger.entity.state';

import * as ACTIONS from '../actions/dataLogger.entity.action';

const _DataLoggerEntityReducer = createReducer(
  initialDataLoggerState,

  on(ACTIONS.DATALOGGER_LOAD_SUCCESS, (state, { dataLoggers }) => {
    return adapter.setAll(dataLoggers, { ...state, isLoaded: true, isLoading: false });
  }),

  on(ACTIONS.DATALOGGER_ADD, (state, { dataLogger }) => {
    return adapter.addOne(dataLogger, state)
  }),

  on(ACTIONS.DATALOGGER_UPDATE, (state, { dataLogger }) => {
    return adapter.updateOne({ id: dataLogger.Id, changes: dataLogger }, state);
  }),
  on(ACTIONS.DATALOGGER_DELETE, (state, { id }) => {
    return adapter.removeOne(id, state);
  }),
  on(ACTIONS.DATALOGGER_RESET, state => {
    return adapter.removeAll({ ...state = initialDataLoggerState, selectedDataLoggerId: null });
  })
);

export function DataLoggerEntityReducer(state: IDataLoggerEntityState | undefined, action: Action) {
  return _DataLoggerEntityReducer(state, action);
}

export const getSelectedDataLoggerId = (state: IDataLoggerEntityState) => state.selectedDataLoggerId;

export const selectDataLoggerState = createFeatureSelector<IDataLoggerEntityState>('dataLogger');

export const getIsLoaded = createSelector(
  selectDataLoggerState,
  state => state.isLoaded
);

export const { selectAll: selectAllDataLoggers, selectIds } = adapter.getSelectors(
  selectDataLoggerState
);

