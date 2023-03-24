import { createReducer, on, Action } from '@ngrx/store';
import { IDiagnosticsTestTypesState, initialDiagnosticsTestTypesState } from '@store/state/diagnosticsTestTypes.state';

import * as ACTIONS from '../actions/diagnosticsTestTypes.action';

const _diagnosticsTestTypesReducer = createReducer(
    initialDiagnosticsTestTypesState,
    on(ACTIONS.LOAD_DIAGNOSTICS_TEST_TYPES_SUCCESS, (state, { diagnosticsTestTypes }) => ({
        ...state,
        isLoaded: true,
        isLoading: false,
        isDirty: false,
        diagnosticsTestTypes,
    })),
    on(ACTIONS.LOAD_DIAGNOSTICS_TEST_TYPES_FAILURE, (state, { error }) => ({
        ...state,
        isLoaded: true,
        isLoading: false,
        error,
    })),
    on(ACTIONS.DIAGNOSTICS_TEST_TYPES_RESET, (state) => ({
        ...state = initialDiagnosticsTestTypesState
      })),

);

export function DiagnosticsTestTypesReducer(state: IDiagnosticsTestTypesState, action: Action) {
    return _diagnosticsTestTypesReducer(state, action);
}