import { createReducer, on, Action, createFeatureSelector, createSelector } from '@ngrx/store';
import { adapter, ISieEntityState, initialSIEState } from '@store/state/sie.state';

import * as ACTIONS from '../actions/sie.entity.action';

const _SieEntityReducer = createReducer(
  initialSIEState,

  on(ACTIONS.SIE_LOAD_SUCCESS, (state, { sie }) => {
    return adapter.setAll(sie, { ...state, isLoaded: true, isLoading: false });
  }),

  on(ACTIONS.SIE_ADD, (state, { sie }) => {
    return adapter.addOne(sie, state)
  }),

  on(ACTIONS.SIE_UPDATE, (state, { sie }) => {
    return adapter.updateOne({ id: sie.Id, changes: sie }, state);
  }),
  on(ACTIONS.SIE_DELETE, (state, { sieId }) => {
    return adapter.removeOne(sieId, state);
  }),
  on(ACTIONS.SIE_RESET, state => {
    return adapter.removeAll({ ...state = initialSIEState, selectedSieId: null });
  })
);

export function SieEntityReducer(state: ISieEntityState | undefined, action: Action) {
  return _SieEntityReducer(state, action);
}

export const getSelectedSieId = (state: ISieEntityState) => state.selectedSieId;

export const selectSieState = createFeatureSelector<ISieEntityState>('sie');

export const getIsLoaded = createSelector(
  selectSieState,
  state => state.isLoaded
);

export const { selectAll: selectAllSie, selectIds } = adapter.getSelectors(
  selectSieState
);

