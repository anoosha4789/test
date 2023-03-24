import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, exhaustMap, share } from 'rxjs/operators';
import { AlarmService } from '@core/services/alarm.service';
import { AlarmDefinitionDataUIModel } from '@core/models/webModels/AlarmDefinitionDataUI.model';
import * as ACTIONS from '../actions/alarms.action';

@Injectable({
  providedIn: 'root'
})
export class AlarmsEffects {
    constructor (private actions$: Actions, private alarmService: AlarmService) {
    
    }
  loadAlarms$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ACTIONS.ALARMS_LOAD),
      mergeMap(() =>
        this.alarmService.getAllAlarmsData().pipe(
        map((alarmsui: AlarmDefinitionDataUIModel[]) =>
            ACTIONS.ALARMS_LOAD_SUCCESS({  alarmsui  })
        ),
        catchError((error) =>
          of(ACTIONS.ALARMS_LOAD_FAILURE({ error })))
       )
      )
    )
  );
}