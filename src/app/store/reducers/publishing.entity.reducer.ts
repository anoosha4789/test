import { Action, createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';

import * as ACTIONS from '../actions/publishing.entity.action';
import { adapter, IPublishingEntityState, initialState } from '@store/state/publishing.state';


const _publishingEntityReducer = createReducer(
  initialState,

  on(ACTIONS.PUBLISHING_LOAD_SUCCESS, (state, { publishings }) => {
    return adapter.setAll(publishings, {...state, isLoaded: true, isLoading: false });
  }),

  on(ACTIONS.PUBLISHING_ADD, (state, { publishing }) => {
    return adapter.addOne(publishing, state)
  }),

  on(ACTIONS.PUBLISHING_UPDATE, (state, { publishing }) => {
    return adapter.updateOne( { id: publishing.Id, changes: publishing }, state);
  }),
  on(ACTIONS.PUBLISHING_DELETE, (state, { idPublishing }) => {
    return adapter.removeOne(idPublishing, state);
  }),
  // on(ACTIONS.deleteDataSources, (state, { ids }) => {
  //   return adapter.removeMany(ids, state);
  // }),
  // on(ACTIONS.deleteDataSourcesByPredicate, (state, { predicate }) => {
  //   return adapter.removeMany(predicate, state);
  // }),
  
  on(ACTIONS.PUBLISHING_RESET, state => {
    return adapter.removeAll({ ...state = initialState, selectedDataSourceId: null });
  })
);

export function publishingEntityReducer(state: IPublishingEntityState | undefined, action: Action) {
  return _publishingEntityReducer(state, action);
}

export const getSelectedPublishingeId = (state: IPublishingEntityState) => state.selectedPublishingId;

export const selectPublishingState = createFeatureSelector<IPublishingEntityState>('publishing');

export const getIsLoaded = createSelector(
    selectPublishingState,
  state => state.isLoaded
);

export const { selectAll: selectAllPublishings, selectIds } = adapter.getSelectors(
    selectPublishingState
);