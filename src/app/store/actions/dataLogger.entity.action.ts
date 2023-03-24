import { DataLoggerUIModel } from '@core/models/UIModels/dataLogger.model';
import { createAction, props } from '@ngrx/store';

export const DATALOGGER_LOAD = createAction('[core module] Load DataLogger');
export const DATALOGGER_LOAD_SUCCESS = createAction('[core module] Load DataLogger Loaded Success', props<{ dataLoggers: DataLoggerUIModel[] }>());
export const DATALOGGER_LOAD_FAILURE = createAction('[core module] Load DataLogger Loaded Failure', props<{ error: any }>());

export const DATALOGGER_ADD = createAction('[DataLogger] Add DataLogger', props<{ dataLogger: DataLoggerUIModel }>());
export const DATALOGGER_UPDATE = createAction('[DataLogger] Update DataLogger', props<{ dataLogger: DataLoggerUIModel }>());
export const DATALOGGER_ADDUPDATE_DB = createAction('[DataLogger] Add DataLogger DB', props<{ dataLoggers: DataLoggerUIModel[] }>());
export const DATALOGGER_ADDUPDATE_SUCCESS = createAction('[DataLogger] DataLogger Add Success');
export const DATALOGGER_ADDUPDATE_FAILURE = createAction('[DataLogger] DataLogger Add Failure', props<{ error: any }>());

export const DATALOGGER_DELETE = createAction('[DataLogger] Delete DataLogger', props<{ id: number }>());
export const DATALOGGER_DELETE_DB = createAction('[DataLogger] Delete DataLogger DB', props<{ id: number }>());
export const DATALOGGER_DELETE_FAILURE = createAction('[DataLogger] DataLogger Delete Failure', props<{ error: any }>());

export const DATALOGGER_RESET = createAction('[core module] Reset DataLogger');
