import { createAction, props } from '@ngrx/store';
import { SieUIModel } from '@core/models/UIModels/sie.model';

// // ACTIONS
export const SIE_LOAD = createAction('[core module] Load SIE');
export const SIE_LOAD_SUCCESS = createAction('[getSIE/API] SIE Loaded Success', props<{ sie: SieUIModel[] }>());
export const SIE_LOAD_FAILURE = createAction('[getSIE/API] SIE Loaded Failure', props<{ error: any }>());

export const SIE_ADD = createAction('[SIE] Add SIE', props<{sie: SieUIModel}>());
export const SIE_UPDATE = createAction('[SIE] Update Sie', props<{sie: SieUIModel}>());

export const SIE_ADDUPDATE_DB = createAction('[SIE] Add SIE DB', props<{ sies: SieUIModel[] }>());
export const SIE_ADDUPDATE_SUCCESS = createAction('[SIE] SIE Add Success');
export const SIE_ADDUPDATE_FAILURE = createAction('[SIE] SIE Add Failure', props<{ error: any }>());

export const SIE_DELETE = createAction('[SIE] Delete Sie', props<{sieId: number}>());
export const SIE_DELETE_DB = createAction('[deleteSIE/API] Delete SIE DB', props<{ sieId: number }>());
export const SIE_DELETE_FAILURE = createAction('[deleteSIE/API] Sie Delete Failure', props<{ error: any }>());

export const SIE_RESET = createAction('[core module] Reset SIE');