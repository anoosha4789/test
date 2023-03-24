import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, exhaustMap, share } from 'rxjs/operators';

import { LoginModel } from '@core/models/webModels/Login.model';
import { UserService } from '@core/services/user.service';

import * as ACTIONS from '../actions/users.action';

@Injectable({
  providedIn: 'root'
})
export class UsersEffects {

    constructor (private actions$: Actions, private userService: UserService) {}

    loadUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ACTIONS.USERS_LOAD),
      mergeMap(() =>
        this.userService.GetLoginUsers().pipe(
        map((users: LoginModel[]) =>
            ACTIONS.USERS_LOAD_SUCCESS({ users })
        ),
        catchError((error) =>
          of(ACTIONS.USERS_LOAD_FAILURE({ error })))
       )
      )
    )
  );

  addUser$ = createEffect(() => 
    this.actions$.pipe(
      ofType(ACTIONS.USERS_ADD),
      exhaustMap(action => 
        this.userService.AddUserAccount(action.user).pipe(
          map((users: LoginModel[]) => 
            ACTIONS.USERS_ADD_SUCCESS({ users })
        ),
        catchError((error) =>
          of(ACTIONS.USERS_ADD_FAILURE({ error })))
        )
      ), share()
    )
  );

  updateUser$ = createEffect(() => 
    this.actions$.pipe(
      ofType(ACTIONS.USERS_UPDATE),
      exhaustMap(action => 
        this.userService.UpdateUserAccount(action.user).pipe(
          map((users: LoginModel[]) => 
            ACTIONS.USERS_UPDATE_SUCCESS({ users })
        ),
        catchError((error) =>
          of(ACTIONS.USERS_UPDATE_FAILURE({ error })))
        )
      ), share()
    )
  );

  deleteUser$ = createEffect(() => 
    this.actions$.pipe(
      ofType(ACTIONS.USERS_DELETE),
      exhaustMap(action => 
        this.userService.DeleteUserAccount(action.user).pipe(
          map((users: LoginModel[]) => 
            ACTIONS.USERS_DELETE_SUCCESS({ users })
        ),
        catchError((error) =>
          of(ACTIONS.USERS_DELETE_FAILURE({ error })))
        )
      )
    )
  );
}