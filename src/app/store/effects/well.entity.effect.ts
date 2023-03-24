import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Effect, Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap, catchError, mergeMap, exhaustMap } from 'rxjs/operators';

import * as ACTIONS from '../actions/well.entity.action';
import * as DEVICEPOINTS_ACTIONS from '@store/actions/deviceDataPoints.action';

import { WellService } from '@core/services/well.service';
import { InchargeWellUIModel } from '@core/models/UIModels/Incharge.well.model';
import { of } from 'rxjs';
import { WellDataUIModel } from '@core/models/webModels/WellDataUIModel.model';

@Injectable()
export class WellEntityEffects {
  constructor(
    private store: Store<any>,
    private actions$: Actions,
    private wellService: WellService) {}


    @Effect()
    loadWells$ = this.actions$.pipe(
        ofType(ACTIONS.WELL_LOAD),
            mergeMap(() =>
                this.wellService.getWellList().pipe(
                    map((wells: WellDataUIModel[]) =>
                        ACTIONS.WELL_LOAD_SUCCESS({ wells })
                    ),
                    catchError((error) =>
                        of(ACTIONS.WELL_LOAD_FAILURE({ error }))
                    )
                )
            )
    );

    @Effect()
    addWell$ = this.actions$.pipe(
        ofType(ACTIONS.WELL_ADDUPDATE_DB),
        exhaustMap(action => this.wellService.saveWell(action.wells).pipe(
            switchMap((wells: WellDataUIModel[]) => [
              ACTIONS.WELL_LOAD(),
              DEVICEPOINTS_ACTIONS.LOAD_DEVICES(),
              DEVICEPOINTS_ACTIONS.LOAD_DATAPOINTDEF()
            ]
          ),
          catchError((error) =>
            of(ACTIONS.WELL_ADDUPDATE_FAILURE({ error })))
          )
        )
    );

    @Effect()
    deleteWell = this.actions$.pipe(
        ofType(ACTIONS.WELL_DELETE_DB),
        exhaustMap(action =>
          this.wellService.deleteWell(action.wellId).pipe(
            switchMap(() => [
              ACTIONS.WELL_LOAD(),
              DEVICEPOINTS_ACTIONS.LOAD_DEVICES(),
              DEVICEPOINTS_ACTIONS.LOAD_DATAPOINTDEF()
            ]
          ),
          catchError((error) =>
            of(ACTIONS.WELL_DELETE_FAILURE({ error })))
          )
        )
    );
}
