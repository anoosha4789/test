import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType, Effect } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, exhaustMap, share, switchMap } from 'rxjs/operators';

import { SieModel } from '@core/models/webModels/Sie.model';

import * as ACTIONS from '../actions/sie.entity.action';
import { SieService } from '@core/services/sie.service';

@Injectable({
  providedIn: 'root'
})
export class SieEffects {

  constructor(private actions$: Actions, private sieService: SieService) { }

  // GET
  @Effect()
  loadSie$ = this.actions$.pipe(
    ofType(ACTIONS.SIE_LOAD),
    mergeMap(() =>
      this.sieService.GetSie().pipe(
        map((sie: SieModel[]) =>
          ACTIONS.SIE_LOAD_SUCCESS({ sie })
        ),
        catchError((error) =>
          of(ACTIONS.SIE_LOAD_FAILURE({ error })))
      )
    )
  );

  // ADD
  @Effect()
  addUpdateSie$ = this.actions$.pipe(
    ofType(ACTIONS.SIE_ADDUPDATE_DB),
    exhaustMap(action =>
      this.sieService.saveSies(action.sies).pipe(
        map(() => ACTIONS.SIE_LOAD()
        ),
        catchError((error) =>
          of(ACTIONS.SIE_ADDUPDATE_FAILURE({ error })))
      )
    ), share()
  );

  // UPDATE
  /* @Effect()
  updateSie$ = this.actions$.pipe(
      ofType(ACTIONS.SIE_UPDATE),
      exhaustMap(action => 
        this.sieService.UpdateSie(action.sie).pipe(
          map((sie: SieModel[]) => 
            ACTIONS.SIE_UPDATE_SUCCESS({ sie })
        ),
        catchError((error) =>
          of(ACTIONS.SIE_UPDATE_FAILURE({ error })))
        )
      ), share()
    ); */

  // DELETE
  @Effect()
  deleteSie$ = this.actions$.pipe(
    ofType(ACTIONS.SIE_DELETE_DB),
    exhaustMap(action =>
      this.sieService.DeleteSie(action.sieId).pipe(
        switchMap(() => [
          ACTIONS.SIE_LOAD(),
        ]
        ),
        catchError((error) =>
          of(ACTIONS.SIE_DELETE_FAILURE({ error })))
      )
    )
  );
}