import { ToolConnectionModel } from '@core/models/webModels/ToolConnection.model';
import { Update } from '@ngrx/entity';
import { createAction, props } from '@ngrx/store';

// ACTIONS
export const TOOL_CONNECTIONS_LOAD = createAction('[core module] Load Tool Connection');
export const TOOL_CONNECTIONS_LOAD_SUCCESS = createAction('[core module] Load Tool Connection Loaded Success', props<{ toolConnections: ToolConnectionModel[] }>());
export const TOOL_CONNECTIONS_LOAD_FAILURE = createAction('[core module] Load Tool Connection Loaded Failure', props<{ error: any }>());

export const TOOL_CONNECTIONS_CREATE = createAction('[ToolConnection] Create Tool Connection', props<{ toolConnection : ToolConnectionModel }>());
export const TOOL_CONNECTIONS_UPDATE = createAction('[ToolConnection] Update Tool Connection', props<{ toolConnection : ToolConnectionModel }>());
export const TOOL_CONNECTIONS_CREATE_UPDATE_DB = createAction('[ToolConnection] Create Tool Connection DB', props<{toolConnections: ToolConnectionModel[]}>());
export const TOOL_CONNECTIONS_CREATE_UPDATE_SUCCESS = createAction('[ToolConnection] Tool Connection Create or Update Success');
export const TOOL_CONNECTIONS_CREATE_UPDATE_FAILURE = createAction('[ToolConnection] Tool Connection Create or Update Failure', props<{ error: any }>());

export const TOOL_CONNECTIONS_DELETE = createAction('[ToolConnection] Delete Tool Connection', props<{deviceId: number}>());
export const TOOL_CONNECTIONS_DELETE_DB = createAction('[ToolConnection] Delete Tool Connection DB', props<{deviceId: number}>());
export const TOOL_CONNECTIONS__DELETE_FAILURE = createAction('[ToolConnection] DataSource Tool Connection Failure', props<{ error: any }>());

export const TOOL_CONNECTIONS_RESET = createAction('[core module] Reset Tool Connection');

export const TOOL_CONNECTIONS_UPDATE_WELL_ZONE_NAME = createAction('[ToolConnection] Update Tool Connection Well Name', props<{ toolConnection : Update<ToolConnectionModel>[]}>());
export const TOOL_CONNECTIONS_UPDATE_CARD_TOOL_NAME = createAction('[ToolConnection] Update Tool Connection Well Name', props<{ toolConnection : Update<ToolConnectionModel>[]}>());