import { MultiNodePositionDefaultsDataUIModel } from '@core/models/UIModels/MultiNodePositionDefaultsDataUI.model';
import { createAction, props } from '@ngrx/store';
import { IeFCVPositionSettingsState } from '@store/state/efcvPositionSettings.state';

export const LOAD_eFCV_POSITION_SETTINGS = createAction(
    'Load eFCV Position Settings'
);
export const LOAD_eFCV_POSITION_SETTINGS_SUCCESS = createAction(
    'eFCV Position Settings Load Success',
    props<{ eFCVPositionSettings: MultiNodePositionDefaultsDataUIModel }>()
);
export const LOAD_eFCV_POSITION_SETTINGS_FAILURE = createAction(
    'eFCV Position Settings Load Failure',
    props<{ error: any }>()
);

export const UPDATE_eFCV_POSITION_SETTINGS = createAction(
    'Update Local Store eFCV Position Settings',
    props<{ eFCVPositionState: IeFCVPositionSettingsState }>()
);

export const UPDATE_eFCV_POSITION_SETTINGS_DB = createAction(
    'Update Store eFCV Position Settings',
    props<{ eFCVPositionSettings: MultiNodePositionDefaultsDataUIModel }>()
);
export const UPDATE_eFCV_POSITION_SETTINGS_SUCCESS = createAction(
    'Update eFCV Position Settings Success'
);
export const UPDATE_eFCV_POSITION_SETTINGS_FAILURE = createAction(
    'Update eFCV Position Settings Failure',
    props<{ error: any }>()
);

export const RESET_eFCV_POSITION_SETTINGS = createAction(
    'Reset eFCV Position Settings'
);