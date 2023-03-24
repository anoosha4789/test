import { createAction, props } from '@ngrx/store';

// ACTIONS
export const SAVING_CONFIGURATION = createAction('Saving configuration and restart server acquisiton');
export const DONE_SAVING_CONFIGURATION = createAction('Done saving configuration and restart server acquisiton');
export const RESETTING_CONFIGURATION = createAction('Resetting configuration and stop server acquisiton');
export const DONE_RESETTING_CONFIGURATION = createAction('Done Resetting configuration and stop server acquisiton');
