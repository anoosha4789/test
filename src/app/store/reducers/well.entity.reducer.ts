import { Action, createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';

import * as ACTIONS from '../actions/well.entity.action';
import { adapter, IWellEntityState, initialState } from '@store/state/well.state';


const entityReducer = createReducer(
  initialState,

  on(ACTIONS.WELL_LOAD_SUCCESS, (state, { wells }) => {
    return adapter.setAll(wells, {...state, isLoaded: true, isLoading: false });
  }),

  on(ACTIONS.WELL_ADD, (state, { well }) => {
    return adapter.addOne(well, state);
  }),

  on(ACTIONS.WELL_UPDATE, (state, { well }) => {
     return adapter.updateOne( { id: well.WellId, changes: well }, state);
  }),
  on(ACTIONS.WELL_DELETE, (state, { wellId }) => {
    return adapter.removeOne(wellId, state);
  }),
  // on(ACTIONS.deleteWells, (state, { ids }) => {
  //   return adapter.removeMany(ids, state);
  // }),
  // on(ACTIONS.deleteWellsByPredicate, (state, { predicate }) => {
  //   return adapter.removeMany(predicate, state);
  // }),
  
  on(ACTIONS.WELL_RESET, state => {
    return adapter.removeAll({ ...state = initialState, selectedWellId: null });
  })
);

export function wellEntityReducer(state: IWellEntityState | undefined, action: Action) {
  return entityReducer(state, action);
}

export const getSelectedWellId = (state: IWellEntityState) => state.selectedWellId;

export const selectWellState = createFeatureSelector<IWellEntityState>('well');

export const getIsLoaded = createSelector(
  selectWellState,
  state => state.isLoaded
);

export const { selectAll: selectAllWells, selectIds } = adapter.getSelectors(
  selectWellState
);
