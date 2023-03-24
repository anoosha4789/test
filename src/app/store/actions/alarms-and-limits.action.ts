import { createAction, props } from '@ngrx/store';

import { AlarmsAndLimitsDataModel } from '@core/models/UIModels/PanelDefaultsDataModel.model';
import { IAlarmsAndLimitsState } from '@store/state/alarms-and-limits.state';

export const LOAD_ALARMS_AND_LIMITS = createAction(
  'Load InFORCE Alarms and Limits'
);
export const LOAD_ALARMS_AND_LIMITS_SUCCESS = createAction(
  'InFORCE Alarms and Limits Load Success',
  props<{ alarmsAndLimits: AlarmsAndLimitsDataModel }>()
);
export const LOAD_ALARMS_AND_LIMITS_FAILURE = createAction(
  'InFORCE Alarms and Limits Load Failure',
  props<{ error: any }>()
);

export const UPDATE_ALARMS_AND_LIMITS = createAction(
  'Update LOcal Store InFORCE Alarms and Limits',
  props<{ alarmsAndLimitsState: IAlarmsAndLimitsState }>()
);

export const UPDATE_ALARMS_AND_LIMITS_DB = createAction(
  'Update Store InFORCE Alarms and Limits',
  props<{ alarmsAndLimits: AlarmsAndLimitsDataModel }>()
);
export const UPDATE_ALARMS_AND_LIMITS_SUCCESS = createAction(
  'Update InFORCE Alarms and Limits Success'
);
export const UPDATE_ALARMS_AND_LIMITS_FAILURE = createAction(
  'Update InFORCE Alarms and Limits Failure',
  props<{ error: any }>()
);

export const RESET_ALARMS_AND_LIMITS = createAction(
  'Reset InFORCE Alarms and Limits'
);
