import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, exhaustMap, share } from 'rxjs/operators';
import { InforceDeviceDataModel } from '@core/models/webModels/InforceDeviceData.model';
import { AlarmService } from '@core/services/alarm.service';
import * as ACTIONS from '../actions/inforcedevices.action';

@Injectable({
  providedIn: 'root'
})

export class InforceDeviceEffects {
    constructor (private actions$: Actions, private alarmService: AlarmService) {
    
    }

    loadInforceDevices$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ACTIONS.INFORCEDEVICES_LOAD),
      mergeMap(() =>
        this.alarmService.getAllInforceDevices().pipe(
        map((inforcedevices: InforceDeviceDataModel[]) =>
            ACTIONS.INFORCEDEVICES_LOAD_SUCCESS({ inforcedevices })
        ),
        catchError((error) =>
          of(ACTIONS.INFORCEDEVICES_LOAD_FAILURE({ error })))
       )
      )
    )
  );
}