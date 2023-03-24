import { WellDataUIModel } from '@core/models/webModels/WellDataUIModel.model';
import { createAction, props } from '@ngrx/store';

// ACTIONS
export const WELL_LOAD = createAction('[core module] Load Wells');
export const WELL_LOAD_SUCCESS = createAction('[core module] Load Wells Loaded Success', props<{ wells: WellDataUIModel[] }>());
export const WELL_LOAD_FAILURE = createAction('[core module] Load Wells Loaded Failure', props<{ error: any }>());

export const WELL_ADD = createAction('[Well] Add Well', props<{ well: WellDataUIModel }>());
export const WELL_UPDATE = createAction('[Well] Update Well', props<{ well: WellDataUIModel }>());
export const WELL_ADDUPDATE_DB = createAction('[Well] Add Well DB', props<{wells: WellDataUIModel[]}>());
export const WELL_ADDUPDATE_SUCCESS = createAction('[Well] Well Add Success');
export const WELL_ADDUPDATE_FAILURE = createAction('[Well] Well Add Failure', props<{ error: any }>());

export const WELL_DELETE = createAction('[Well] Delete Well', props<{wellId: number}>());
export const WELL_DELETE_DB = createAction('[Well] Delete Well DB', props<{wellId: number}>());
export const WELL_DELETE_FAILURE = createAction('[Well] Well Delete Failure', props<{ error: any }>());

export const WELL_RESET = createAction('[core module] Reset WELLS');
