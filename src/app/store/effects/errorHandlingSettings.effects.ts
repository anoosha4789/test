// this effect is used to fetch configured devices from web host
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import {
  map,
  catchError,
  exhaustMap,
} from 'rxjs/operators';
import { ConfigurationService } from '@core/services/configurationService.service';
import * as ACTIONS from '../actions/errorHandlingSettings.action';
import { ErrorHandlingUIModel } from '@core/models/webModels/ErrorHandlingUI.model';
 
@Injectable()
export class ErrorHandlingSettingsEffects {
  constructor(
    private actions$: Actions,
    private configurationService: ConfigurationService
  ) {}

  loadErrorHandlingSettings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ACTIONS.LOAD_ERROR_HANDLING_SETTINGS),
      exhaustMap(() =>
        this.configurationService.getErrorHandlingSettings().pipe(
          map((errorHandlingSettings: ErrorHandlingUIModel) =>
            ACTIONS.LOAD_ERROR_HANDLING_SETTINGS_SUCCESS({
              errorHandlingSettings,
            })
          ),
          catchError((error) =>
            of(ACTIONS.LOAD_ERROR_HANDLING_SETTINGS_FAILURE({ error }))
          )
        )
      )
    )
  );

  updateErrorHandlingSettings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ACTIONS.UPDATE_ERROR_HANDLING_SETTINGS_DB),
      exhaustMap((action) =>
        this.configurationService
          .updateErrorHandlingSettings(action.errorHandlingSettings)
          .pipe(
            map(() => ACTIONS.UPDATE_ERROR_HANDLING_SETTINGS_SUCCESS()
            ),
            catchError((error) =>
              of(ACTIONS.UPDATE_ERROR_HANDLING_SETTINGS_FAILURE({ error }))
            )
          )
      )
    )
  );
}
