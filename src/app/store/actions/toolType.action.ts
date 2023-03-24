import { GaugeTypeUIModel } from '@core/models/UIModels/models.model';
import { createAction, props } from '@ngrx/store';

// ACTIONS
export const TOOLTYPES_LOAD = createAction('[core module] Load ToolTypes');
export const TOOLTYPES_LOAD_SUCCESS = createAction('[getPanelTypes/API] ToolTypes Loaded Success', props<{ toolTypes: GaugeTypeUIModel[] }>());
export const TOOLTYPES_LOAD_FAILURE = createAction('[getPanelTypes/API] ToolTypes Loaded Failure', props<{ error: any }>());

export const TOOLTYPES_CLEARERRORS = createAction('TOOLTYPES_CLEARERRORS');