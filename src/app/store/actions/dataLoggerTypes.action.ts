import { DataLoggerTypesDataModel } from '@core/models/UIModels/dataLoggerTypes.model';
import { createAction, props } from '@ngrx/store';

export const LOAD_DATA_LOGGER_TYPES = createAction(
  'Load Data Logger Types'
);
export const LOAD_DATA_LOGGER_TYPES_SUCCESS = createAction(
  'Data Logger Types Load Success',
  props<{ loggerTypes: DataLoggerTypesDataModel[] }>()
);
export const LOAD_DATA_LOGGER_TYPES_FAILURE = createAction(
  'Data Logger Types Load Failure',
  props<{ error: any }>()
);

export const LOGGER_TYPES_RESET = createAction('[core module] Reset DataLoggerTypes');