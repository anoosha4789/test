import { DiagnosticsTestTypesDataModel } from '@core/models/UIModels/diagnosticsTestTypes.model';
import { createAction, props } from '@ngrx/store';

export const LOAD_DIAGNOSTICS_TEST_TYPES = createAction(
  'Load Diagonstics Test Types'
);
export const LOAD_DIAGNOSTICS_TEST_TYPES_SUCCESS = createAction(
  'Diagonstics Test Types Load Success',
  props<{ diagnosticsTestTypes: DiagnosticsTestTypesDataModel[] }>()
);
export const LOAD_DIAGNOSTICS_TEST_TYPES_FAILURE = createAction(
  'Diagonstics Test Types Load Failure',
  props<{ error: any }>()
);

export const DIAGNOSTICS_TEST_TYPES_RESET = createAction('[core module] Reset DiagonsticsTestTypes');