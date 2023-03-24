import { createAction, props } from '@ngrx/store';

import { ShiftDefaultsDataModel } from '@core/models/webModels/ShiftDefaultsDataModel.model';
import { IShiftDefaultState } from '@store/state/shift-default.state';

export const LOAD_SHIFT_DEFAULTS = createAction(
  'Load InFORCE Shift Defaults'
);
export const LOAD_SHIFT_DEFAULTS_SUCCESS = createAction(
  'InFORCE Shift Defaults Load Success',
  props<{ shiftDefaults: ShiftDefaultsDataModel }>()
);
export const LOAD_SHIFT_DEFAULTS_FAILURE = createAction(
  'InFORCE Shift Defaults Load Failure',
  props<{ error: any }>()
);

export const UPDATE_SHIFT_DEFAULTS = createAction(
  'Update Local Store InFORCE Shift Defaults',
  props<{ shiftDefaultState: IShiftDefaultState }>()
);

export const UPDATE_SHIFT_DEFAULTS_DB = createAction(
  'Update Store InFORCE Shift Defaults',
  props<{ shiftDefaults: ShiftDefaultsDataModel }>()
);
export const UPDATE_SHIFT_DEFAULTS_SUCCESS = createAction(
  'Update InFORCE Shift Defaults Success',
  props<{ shiftDefaults: ShiftDefaultsDataModel }>()
);
export const UPDATE_SHIFT_DEFAULTS_FAILURE = createAction(
  'Update InFORCE Shift Defaults Failure',
  props<{ error: any }>()
);

export const RESET_SHIFT_DEFAULTS = createAction(
  'Reset InFORCE Shift Defaults'
);
