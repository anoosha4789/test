import { Action, createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';

import * as ACTIONS from '../actions/dataSources.entity.action';
import { adapter, IDataSourceEntityState, initialState } from '@store/state/dataSources.state';
import { SerialPortCommunicationChannelDataUIModel } from '@core/models/webModels/SerialPortCommunicationChannelDataUIModel.model';
import { TcpIpCommunicationChannelDataUIModel } from '@core/models/webModels/TcpIpCommunicationChannelDataUIModel.model';


const _dataSourcesEntityReducer = createReducer(
  initialState,

  on(ACTIONS.DATASOURCES_LOAD_SUCCESS, (state, { dataSources }) => {
    return adapter.setAll(dataSources, {...state, isLoaded: true, isLoading: false });
  }),

  on(ACTIONS.DATASOURCES_ADD, (state, { dataSource }) => {
    return adapter.addOne(dataSource, state)
  }),

  on(ACTIONS.DATASOURCES_UPDATE, (state, { dataSource }) => {
    let channel = dataSource.Channel.channelType == 0 ? dataSource.Channel as SerialPortCommunicationChannelDataUIModel : dataSource.Channel as TcpIpCommunicationChannelDataUIModel;
    return adapter.updateOne( { id: channel.IdCommConfig, changes: dataSource }, state);
  }),
  on(ACTIONS.DATASOURCES_DELETE, (state, { idComConfig }) => {
    return adapter.removeOne(idComConfig, state);
  }),
  // on(ACTIONS.deleteDataSources, (state, { ids }) => {
  //   return adapter.removeMany(ids, state);
  // }),
  // on(ACTIONS.deleteDataSourcesByPredicate, (state, { predicate }) => {
  //   return adapter.removeMany(predicate, state);
  // }),
  
  on(ACTIONS.DATASOURCES_RESET, state => {
    return adapter.removeAll({ ...state = initialState, selectedDataSourceId: null });
  })
);

export function dataSourcesEntityReducer(state: IDataSourceEntityState | undefined, action: Action) {
  return _dataSourcesEntityReducer(state, action);
}

export const getSelectedDataSourceId = (state: IDataSourceEntityState) => state.selectedDataSourceId;

export const selectDataSourcesState = createFeatureSelector<IDataSourceEntityState>('dataSources');

export const getIsLoaded = createSelector(
  selectDataSourcesState,
  state => state.isLoaded
);

export const { selectAll: selectAllDataSources, selectIds } = adapter.getSelectors(
  selectDataSourcesState
);