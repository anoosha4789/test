// this effect is used to fetch alarms and limits from web host
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import {
  map,
  catchError,
  exhaustMap,
} from 'rxjs/operators';

import * as ACTIONS from '../actions/alarms-and-limits.action';
import { AlarmsAndLimitsDataModel } from '@core/models/UIModels/PanelDefaultsDataModel.model';
import { AlarmService } from '@core/services/alarm.service';


@Injectable()
export class AlarmsAndLimitsEffects {
  constructor(
    private actions$: Actions,
    private alarmService: AlarmService
  ) {}

  loadAlarmsAndLimits$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ACTIONS.LOAD_ALARMS_AND_LIMITS),
      exhaustMap(() =>
        this.alarmService.getAlarmsAndLimits().pipe(
          map((alarmsAndLimits: AlarmsAndLimitsDataModel) =>
            ACTIONS.LOAD_ALARMS_AND_LIMITS_SUCCESS({
              alarmsAndLimits,
            })
          ),
          catchError((error) =>
            of(ACTIONS.LOAD_ALARMS_AND_LIMITS_FAILURE({ error }))
          )
        )
      )
    )
  );

  updateAlarmsAndLimits$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ACTIONS.UPDATE_ALARMS_AND_LIMITS_DB),
      exhaustMap((action) =>
        this.alarmService
          .updateAlarmsAndLimits(action.alarmsAndLimits)
          .pipe(
            map(() => ACTIONS.UPDATE_ALARMS_AND_LIMITS_SUCCESS()
            ),
            catchError((error) =>
              of(ACTIONS.UPDATE_ALARMS_AND_LIMITS_FAILURE({ error }))
            )
          )
        )
    )
  );
}
