// this effect is used to fetch Data Logger from web host
import { Injectable } from '@angular/core';
import { Actions, createEffect, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import {
  map,
  catchError,
  exhaustMap,
  mergeMap,
  switchMap,
} from 'rxjs/operators';

import * as ACTIONS from '../actions/dataLogger.entity.action';
import { DataLoggerService } from '@core/services/dataLogger.service';
import { DataLoggerUIModel } from '@core/models/UIModels/dataLogger.model';


@Injectable()
export class DataLoggerEntityEffects {
  constructor(
    private actions$: Actions,
    private dataLoggerService: DataLoggerService
  ) { }

  @Effect()
  loadDataLogger$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ACTIONS.DATALOGGER_LOAD),
      mergeMap(() =>
        this.dataLoggerService.getDataLogger().pipe(
          map((dataLoggers: DataLoggerUIModel[]) =>
            ACTIONS.DATALOGGER_LOAD_SUCCESS({
              dataLoggers
            })
          ),
          catchError((error) =>
            of(ACTIONS.DATALOGGER_LOAD_FAILURE({ error }))
          )
        )
      )
    )
  );

  @Effect()
  updateDataLogger$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ACTIONS.DATALOGGER_ADDUPDATE_DB),
      exhaustMap((action) =>
        this.dataLoggerService
          .saveDataLogger(action.dataLoggers)
          .pipe(
            map(() => ACTIONS.DATALOGGER_LOAD()
            ),
            catchError((error) =>
              of(ACTIONS.DATALOGGER_ADDUPDATE_FAILURE({ error }))
            )
          )
      )
    )
  );

  @Effect()
  deleteDataLogger = this.actions$.pipe(
    ofType(ACTIONS.DATALOGGER_DELETE_DB),
    exhaustMap(action =>
      this.dataLoggerService.deleteDataLogger(action.id).pipe(
        switchMap(() => [
          ACTIONS.DATALOGGER_LOAD()
        ]
        ),
        catchError((error) =>
          of(ACTIONS.DATALOGGER_DELETE_FAILURE({ error })))
      )
    )
  );
}
