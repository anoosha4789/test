import { Action, createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';

import * as ACTIONS from '../actions/tool-connection.entity.action';
import { adapter, IToolConnecionState, initialState } from '@store/state/tool-connection.state';


const _ToolConnectionEntityReducer = createReducer(
  initialState,

  on(ACTIONS.TOOL_CONNECTIONS_LOAD_SUCCESS, (state, { toolConnections }) => {
    return adapter.setAll(toolConnections, {...state, isLoaded: true, isLoading: false });
  }),

  on(ACTIONS.TOOL_CONNECTIONS_CREATE, (state, { toolConnection }) => {
    return adapter.addOne(toolConnection, state)
  }),

  on(ACTIONS.TOOL_CONNECTIONS_UPDATE, (state, { toolConnection }) => {
    return adapter.updateOne( { id: toolConnection.Id, changes: toolConnection }, state);
  }),

  on(ACTIONS.TOOL_CONNECTIONS_DELETE, (state, { deviceId }) => {
    return adapter.removeOne(deviceId, state);
  }),

  on(ACTIONS.TOOL_CONNECTIONS_RESET, state => {
    return adapter.removeAll({ ...state = initialState });
  }),

  on(ACTIONS.TOOL_CONNECTIONS_UPDATE_WELL_ZONE_NAME, (state , { toolConnection }) => {
    return adapter.updateMany(toolConnection, state);
  }),

  on(ACTIONS.TOOL_CONNECTIONS_UPDATE_CARD_TOOL_NAME, (state , { toolConnection }) => {
    return adapter.updateMany(toolConnection, state);
  })
  
);

export function toolConnectionEntityReducer(state: IToolConnecionState | undefined, action: Action) {
  return _ToolConnectionEntityReducer(state, action);
}

// export const getSelectedDataSourceId = (state: IToolConnecionState) => state.selectedDataSourceId;

export const selectToolConnetionState = createFeatureSelector<IToolConnecionState>('toolConnections');

export const getIsLoaded = createSelector(
  selectToolConnetionState,
  state => state.isLoaded
);

export const { selectAll: selectAllToolConnections, selectIds } = adapter.getSelectors(
  selectToolConnetionState
);