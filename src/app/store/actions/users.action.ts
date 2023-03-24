import { createAction, props } from '@ngrx/store';
import { LoginModel } from '@core/models/webModels/Login.model';

// ACTIONS
export const USERS_LOAD = createAction('[core module] Load Users');
export const USERS_LOAD_SUCCESS = createAction('[getUsers/API] Users Loaded Success', props<{ users: LoginModel[] }>());
export const USERS_LOAD_FAILURE = createAction('[getUsers/API] Users Loaded Failure', props<{ error: any }>());

export const USERS_ADD = createAction('[Users] Add User', props<{user: LoginModel}>());
export const USERS_ADD_SUCCESS = createAction('[addUsers/API] User Add Success', props<{ users: LoginModel[] }>());
export const USERS_ADD_FAILURE = createAction('[addUsers/API] User Add Failure', props<{ error: any }>());

export const USERS_UPDATE = createAction('[Users] Update User', props<{user: LoginModel}>());
export const USERS_UPDATE_SUCCESS = createAction('[updateUsers/API] User Update Success', props<{ users: LoginModel[] }>());
export const USERS_UPDATE_FAILURE = createAction('[updateUsers/API] User Update Failure', props<{ error: any }>());

export const USERS_DELETE = createAction('[Users] Delete User', props<{user: string}>());
export const USERS_DELETE_SUCCESS = createAction('[deleteUsers/API] User Delete Success', props<{ users: LoginModel[] }>());
export const USERS_DELETE_FAILURE = createAction('[deleteUsers/API] User Delete Failure', props<{ error: any }>());

export const USERS_RESET = createAction('[core module] Reset Users');