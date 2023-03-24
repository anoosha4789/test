import { createAction, props } from '@ngrx/store';
import { PanelType } from '@core/models/UIModels/PanelType.model';

// ACTIONS
export const PANELTYPES_LOAD = createAction('[core module] Load PanelTypes');
export const PANELTYPES_LOAD_SUCCESS = createAction('[getPanelTypes/API] Panel Types Loaded Success', props<{ panels: PanelType[] }>());
export const PANELTYPES_LOAD_FAILURE = createAction('[getPanelTypes/API] Panel Types Loaded Failure', props<{ error: any }>());

export const PANELTYPES_CLEARERRORS = createAction('PANELTYPES_CLEARERRORS');