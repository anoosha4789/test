import { createReducer, on, Action } from '@ngrx/store';

import * as ACTIONS from '../actions/efcvPositionSettings.action';
import { IeFCVPositionSettingsState, initialEfcvPositionSetttingsState } from '@store/state/efcvPositionSettings.state';

const _eFCVPositionSettingsReducer = createReducer(
    initialEfcvPositionSetttingsState,
    on(ACTIONS.LOAD_eFCV_POSITION_SETTINGS_SUCCESS, (state, { eFCVPositionSettings }) => ({
        ...state,
        isLoaded: true,
        isLoading: false,
        isDirty: false,
        eFCVPositionSettings,
    })),
    on(ACTIONS.LOAD_eFCV_POSITION_SETTINGS_FAILURE, (state, { error }) => ({
        ...state,
        isLoaded: true,
        isLoading: false,
        error,
    })),
    on(ACTIONS.UPDATE_eFCV_POSITION_SETTINGS, (state, { eFCVPositionState }) => ({
        ...state,
        isLoaded: eFCVPositionState.isLoaded,
        isDirty: eFCVPositionState.isDirty,
        isValid: eFCVPositionState.isValid,
        eFCVPositionSettings: eFCVPositionState.eFCVPositionSettings,
        error: eFCVPositionState.error
    })),
    on(ACTIONS.UPDATE_eFCV_POSITION_SETTINGS_SUCCESS, (state, { }) => ({
        ...state,
        isLoaded: true,
        isDirty: false,
        isValid: true,
        error: ''
    })),
    on(ACTIONS.UPDATE_eFCV_POSITION_SETTINGS_FAILURE, (state, { error }) => ({
        ...state,
        isLoaded: true,
        isLoading: false,
        isDirty: false,
        isValid: true,
        error
    })),
    on(ACTIONS.RESET_eFCV_POSITION_SETTINGS, (state) => ({
        ...state = initialEfcvPositionSetttingsState
    })),
);
export function eFCVPositionSettingsReducer(state: IeFCVPositionSettingsState, action: Action) {
    return _eFCVPositionSettingsReducer(state, action);
}
