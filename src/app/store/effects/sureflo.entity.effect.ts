import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { map, switchMap, catchError, mergeMap, exhaustMap } from 'rxjs/operators';

import { Effect, Actions, createEffect, ofType } from '@ngrx/effects';

import * as ACTIONS from '../actions/sureflo.entity.action';

import { SureFLOFlowMeterUIModel } from '@core/models/UIModels/sureflo.model';
import { SurefloService } from '@core/services/sureflo.service';

@Injectable()
export class SurefloEntityEffects {
  constructor(
    private store: Store<any>,
    private actions$: Actions,
    private surefloService: SurefloService) {}

    @Effect()
    loadFlowMeters$ = this.actions$.pipe(
        ofType(ACTIONS.FLOWMETERS_LOAD),
            mergeMap(() => 
                this.surefloService.getFlowMeterList().pipe(
                    map((flowMeters: SureFLOFlowMeterUIModel[]) =>
                        ACTIONS.FLOWMETERS_LOAD_SUCCESS({ flowMeters })
                    ),
                    catchError((error) =>
                        of(ACTIONS.FLOWMETERS_LOAD_FAILURE({ error }))
                    )
                )           
            )
    )

    @Effect()
    addFlowMeter$ = this.actions$.pipe(
        ofType(ACTIONS.FLOWMETERS_ADDUPDATE_DB),
        exhaustMap(action => this.surefloService.saveFlowMeter(action.flowMeters).pipe(
            switchMap((dataSources: SureFLOFlowMeterUIModel[]) => [
              ACTIONS.FLOWMETERS_LOAD(),
            ]
          ),
          catchError((error) =>
            of(ACTIONS.FLOWMETERS_ADDUPDATE_FAILURE({ error })))
          )
        )
    )

    @Effect()
    deleteFlowMeter = this.actions$.pipe(
        ofType(ACTIONS.FLOWMETERS_DELETE_DB),
        exhaustMap(action => 
          this.surefloService.deleteFlowMeter(action.flowMeterId).pipe(
            switchMap(() => [
              ACTIONS.FLOWMETERS_LOAD()
            ]
          ),
          catchError((error) =>
            of(ACTIONS.FLOWMETERS_DELETE_FAILURE({ error })))
          )
        )
    )
}
