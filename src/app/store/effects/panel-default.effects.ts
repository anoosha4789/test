// this effect is used to fetch panel defaults from web host
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import {
  map,
  catchError,
  exhaustMap,
} from 'rxjs/operators';

import * as ACTIONS from '../actions/panel-default.action';
import { PanelDefaultService } from '@core/services/panel-default.service';
import { PanelDefaultsDataModel } from '@core/models/UIModels/PanelDefaultsDataModel.model';


@Injectable()
export class PanelDefaultEffects {
  constructor(
    private actions$: Actions,
    private panelDefaultService: PanelDefaultService
  ) {}

  loadPanelDefault$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ACTIONS.LOAD_PANEL_DEFAULTS),
      exhaustMap(() =>
        this.panelDefaultService.getPanelDefault().pipe(
          map((panelDefaults: PanelDefaultsDataModel) =>
            ACTIONS.LOAD_PANEL_DEFAULTS_SUCCESS({
              panelDefaults,
            })
          ),
          catchError((error) =>
            of(ACTIONS.LOAD_PANEL_DEFAULTS_FAILURE({ error }))
          )
        )
      )
    )
  );

  updatePanelDefault$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ACTIONS.UPDATE_PANEL_DEFAULTS_DB),
      exhaustMap((action) =>
        this.panelDefaultService
          .updatePanelDefault(action.panelDefaults)
          .pipe(
            map(() => ACTIONS.UPDATE_PANEL_DEFAULTS_SUCCESS()
            ),
            catchError((error) =>
              of(ACTIONS.UPDATE_PANEL_DEFAULTS_FAILURE({ error }))
            )
          )
      )
    )
  );
}
