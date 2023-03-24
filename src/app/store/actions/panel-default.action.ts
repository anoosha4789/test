import { createAction, props } from '@ngrx/store';

import { PanelDefaultsDataModel } from '@core/models/UIModels/PanelDefaultsDataModel.model';
import { IPanelDefaultState } from '@store/state/panel-default.state';

export const LOAD_PANEL_DEFAULTS = createAction(
  'Load InFORCE Panel Defaults'
);
export const LOAD_PANEL_DEFAULTS_SUCCESS = createAction(
  'InFORCE Panel Defaults Load Success',
  props<{ panelDefaults: PanelDefaultsDataModel }>()
);
export const LOAD_PANEL_DEFAULTS_FAILURE = createAction(
  'InFORCE Panel Defaults Load Failure',
  props<{ error: any }>()
);

export const UPDATE_PANEL_DEFAULTS = createAction(
  'Update LOcal Store InFORCE Panel Defaults',
  props<{ panelDefaultState: IPanelDefaultState }>()
);

export const UPDATE_PANEL_DEFAULTS_DB = createAction(
  'Update Store InFORCE Panel Defaults',
  props<{ panelDefaults: PanelDefaultsDataModel }>()
);
export const UPDATE_PANEL_DEFAULTS_SUCCESS = createAction(
  'Update InFORCE Panel Defaults Success'
);
export const UPDATE_PANEL_DEFAULTS_FAILURE = createAction(
  'Update InFORCE Panel Defaults Failure',
  props<{ error: any }>()
);

export const RESET_PANEL_DEFAULTS = createAction(
  'Reset InFORCE Panel Defaults'
);
