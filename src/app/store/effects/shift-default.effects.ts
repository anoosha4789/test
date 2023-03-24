// this effect is used to fetch shift defaults from web host
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import {
  map,
  catchError,
  exhaustMap,
} from 'rxjs/operators';

import * as ACTIONS from '../actions/shift-default.action';
import { ShiftDefaultService } from '@core/services/shift-default.service';
import { ShiftDefaultsDataModel } from '@core/models/webModels/ShiftDefaultsDataModel.model';

 
@Injectable()
export class ShiftDefaultEffects {
  constructor(
    private actions$: Actions,
    private shiftDefaultService: ShiftDefaultService
  ) {}

  loadShiftDefault$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ACTIONS.LOAD_SHIFT_DEFAULTS),
      exhaustMap(() =>
        this.shiftDefaultService.getShiftDefault().pipe(
          map((shiftDefaults: ShiftDefaultsDataModel) =>
            ACTIONS.LOAD_SHIFT_DEFAULTS_SUCCESS({
              shiftDefaults,
            })
          ),
          catchError((error) =>
            of(ACTIONS.LOAD_SHIFT_DEFAULTS_FAILURE({ error }))
          )
        )
      )
    )
  );

  updateShiftDefault$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ACTIONS.UPDATE_SHIFT_DEFAULTS_DB),
      exhaustMap((action) =>
        this.shiftDefaultService
          .updateShiftDefault(action.shiftDefaults)
          .pipe(
            map(() => ACTIONS.UPDATE_SHIFT_DEFAULTS_SUCCESS({ shiftDefaults: action.shiftDefaults })
            ),
            catchError((error) =>
              of(ACTIONS.UPDATE_SHIFT_DEFAULTS_FAILURE({ error }))
            )
          )
      )
    )
  );
}
