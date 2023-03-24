import { PanelConfigurationCommonModel } from '@core/models/webModels/PanelConfigurationCommon.model';
import { createAction, props } from '@ngrx/store';
import { IPanelConfigurationCommonState } from '@store/state/panelConfigurationCommon.state';

// ACTIONS
export const PANELCONFIG_COMMON_LOAD = createAction('PANELCONFIG_COMMON_LOAD');
export const PANELCONFIG_COMMON_LOAD_SUCCESS = createAction('PANELCONFIG_COMMON_LOAD_SUCCESS', props<{ panelConfigurationCommon: PanelConfigurationCommonModel }>());
export const PANELCONFIG_COMMON_LOAD_FAILURE = createAction('PANELCONFIG_COMMON_LOAD_FAILURE', props<{ error: any }>());

export const PANELCONFIG_COMMON_UPDATE = createAction('PANELCONFIG_COMMON_UPDATE', props<{ panelState: IPanelConfigurationCommonState }>());
export const PANELCONFIG_COMMON_UPDATE_DB = createAction('PANELCONFIG_COMMON_UPDATE_DB', props<{ panelConfigurationCommon: PanelConfigurationCommonModel }>());
export const PANELCONFIG_COMMON_UPDATE_SUCCESS = createAction('PANELCONFIG_COMMON_UPDATE_SUCCESS');
export const PANELCONFIG_COMMON_UPDATE_FAILURE = createAction('PANELCONFIG_COMMON_UPDATE_FAILURE', props<{ error: any }>());

export const PANELCONFIG_COMMON_CLEARERRORS = createAction('PANELCONFIG_COMMON_CLEARERRORS');
export const PANELCONFIG_COMMON_RESET = createAction('PANELCONFIG_COMMON_RESET');