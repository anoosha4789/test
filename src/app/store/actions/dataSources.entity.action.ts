import { DataSourceUIModel } from '@core/models/UIModels/dataSource.model';
import { createAction, props } from '@ngrx/store';

// ACTIONS
export const DATASOURCES_LOAD = createAction('[core module] Load DataSources');
export const DATASOURCES_LOAD_SUCCESS = createAction('[core module] Load DataSources Loaded Success', props<{ dataSources: DataSourceUIModel[] }>());
export const DATASOURCES_LOAD_FAILURE = createAction('[core module] Load DataSources Loaded Failure', props<{ error: any }>());

export const DATASOURCES_ADD = createAction('[DataSource] Add DataSource', props<{ dataSource: DataSourceUIModel }>());
export const DATASOURCES_UPDATE = createAction('[DataSource] Update DataSource', props<{ dataSource: DataSourceUIModel }>());
export const DATASOURCES_ADDUPDATE_DB = createAction('[DataSource] Add DataSource DB', props<{dataSources: DataSourceUIModel[]}>());
export const DATASOURCES_ADDUPDATE_SUCCESS = createAction('[DataSource] DataSource Add Success');
export const DATASOURCES_ADDUPDATE_FAILURE = createAction('[DataSource] DataSource Add Failure', props<{ error: any }>());

export const DATASOURCES_DELETE = createAction('[DataSource] Delete DataSource', props<{idComConfig: number}>());
export const DATASOURCES_DELETE_DB = createAction('[DataSource] Delete DataSource DB', props<{idComConfig: number}>());
export const DATASOURCES_DELETE_FAILURE = createAction('[DataSource] DataSource Delete Failure', props<{ error: any }>());

export const DATASOURCES_RESET = createAction('[core module] Reset DataSources');