import { createReducer, on, Action } from '@ngrx/store';

import * as ACTIONS from '../actions/unit-system.action';
import { unitSystem, IUnitSystemState } from '@store/state/unit-system.state';


const _unitSystemReducer = createReducer(
  unitSystem,
  on(ACTIONS.UNITSYSTEM_LOAD_SUCCESS, (state, { newunitSystem }) => ({
    ...state,
    isLoaded: true,
    isLoading: false,
    isDirty: false,
    unitSystem: newunitSystem,
  })),
  on(ACTIONS.UNITSYSTEM_LOAD_FAILURE, (state, { error }) => ({
    ...state,
    isLoaded: true,
    isLoading: false,
    error,
  })),
  on(ACTIONS.UNITSYSTEM_SAVE, (state, { unitSystemState }) => ({
    ...state,
    isLoaded: unitSystemState.isLoaded,
    isLoading: unitSystemState.isLoading,
    isDirty: unitSystemState.isDirty,
    isValid: unitSystemState.isValid,
    unitSystem: unitSystemState.unitSystem
  })),
  on(ACTIONS.UNITSYSTEM_SAVE_SUCCESS, (state, { newunitSystem }) => ({
    ...state,
    isLoaded: true,
    isLoading: false,
    unitSystem: newunitSystem
  })),
  on(ACTIONS.UNITSYSTEM_SAVE_FAILURE, (state, { error }) => ({
    ...state,
    isLoaded: true,
    isLoading: false,
    error,
  })),
  on(ACTIONS.UNITSYSTEM_RESET, (state) => ({
    ...state = unitSystem
  }))
);

export function unitSystemReducer(state: IUnitSystemState, action: Action) {
  return _unitSystemReducer(state, action);
}
