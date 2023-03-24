import {createAction, props} from '@ngrx/store';

export const ADD_GLOBAL_ERROR = createAction(
    '[Global Error] Add',
    props<{ error: any }>()
);