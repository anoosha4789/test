import { PublishingDataUIModel } from '@core/models/UIModels/dataPublishing.model';
import { createAction, props } from '@ngrx/store';

// ACTIONS
export const PUBLISHING_LOAD = createAction('[core module] Load PUBLISHING');
export const PUBLISHING_LOAD_SUCCESS = createAction('[core module] Load PUBLISHING Loaded Success', props<{ publishings: PublishingDataUIModel[] }>());
export const PUBLISHING_LOAD_FAILURE = createAction('[core module] Load PUBLISHING Loaded Failure', props<{ error: any }>());

export const PUBLISHING_ADD = createAction('[Publishing] Add Publishing', props<{ publishing: PublishingDataUIModel }>());
export const PUBLISHING_UPDATE = createAction('[Publishing] Update Publishing', props<{ publishing: PublishingDataUIModel }>());
export const PUBLISHING_ADDUPDATE_DB = createAction('[Publishing] Add Publishing DB', props<{publishings: PublishingDataUIModel[]}>());
export const PUBLISHING_ADDUPDATE_SUCCESS = createAction('[Publishing] Publishing Add Success');
export const PUBLISHING_ADDUPDATE_FAILURE = createAction('[Publishing] Publishing Add Failure', props<{ error: any }>());

export const PUBLISHING_DELETE = createAction('[Publishing] Delete Publishing', props<{ idPublishing: number}>());
export const PUBLISHING_DELETE_DB = createAction('[Publishing] Delete Publishing DB', props<{ idPublishing: number}>());
export const PUBLISHING_DELETE_SUCCESS = createAction('[Publishing] Publishing Delete Success');
export const PUBLISHING_DELETE_FAILURE = createAction('[Publishing] Publishing Delete Failure', props<{ error: any }>());

export const PUBLISHING_RESET = createAction('[core module] Reset PUBLISHING');