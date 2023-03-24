import { SureFLOFlowMeterUIModel } from '@core/models/UIModels/sureflo.model';
import { createAction, props } from '@ngrx/store';

// ACTIONS
export const FLOWMETERS_LOAD = createAction('[core module] Load FlowMeters');
export const FLOWMETERS_LOAD_SUCCESS = createAction('[core module] Load FlowMeters Loaded Success', props<{ flowMeters: SureFLOFlowMeterUIModel[] }>());
export const FLOWMETERS_LOAD_FAILURE = createAction('[core module] Load FlowMeters Loaded Failure', props<{ error: any }>());

export const FLOWMETERS_ADD = createAction('[FlowMeter] Add FlowMeter', props<{ flowMeter: SureFLOFlowMeterUIModel }>());
export const FLOWMETERS_UPDATE = createAction('[FlowMeter] Update FlowMeter', props<{ flowMeter: SureFLOFlowMeterUIModel }>());
export const FLOWMETERS_ADDUPDATE_DB = createAction('[FlowMeter] Add FlowMeter DB', props<{flowMeters: SureFLOFlowMeterUIModel[]}>());
export const FLOWMETERS_ADDUPDATE_SUCCESS = createAction('[FlowMeter] FlowMeter Add Success');
export const FLOWMETERS_ADDUPDATE_FAILURE = createAction('[FlowMeter] FlowMeter Add Failure', props<{ error: any }>());

export const FLOWMETERS_DELETE = createAction('[FlowMeter] Delete FlowMeter', props<{flowMeterId: number}>());
export const FLOWMETERS_DELETE_DB = createAction('[FlowMeter] Delete FlowMeter DB', props<{flowMeterId: number}>());
export const FLOWMETERS_DELETE_FAILURE = createAction('[FlowMeter] FlowMeter Delete Failure', props<{ error: any }>());

export const FLOWMETERS_RESET = createAction('[core module] Reset FlowMeters');