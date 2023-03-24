import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, exhaustMap } from 'rxjs/operators';

import * as ACTIONS from '../actions/panelConfigurationCommon.action';

import { PanelConfigurationService } from '@core/services/panelConfiguration.service';
import { PanelConfigurationCommonModel } from '@core/models/webModels/PanelConfigurationCommon.model';

@Injectable()
export class PanelConfigurationCommonEffects {

    constructor (private actions$: Actions, private panelConfigurationService: PanelConfigurationService) {}

    loadPanelConfigurationCommon$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ACTIONS.PANELCONFIG_COMMON_LOAD),
      mergeMap(() =>
        this.panelConfigurationService.getPanelConfigurationCommon().pipe(
        map((panelConfigurationCommon: PanelConfigurationCommonModel) =>
            ACTIONS.PANELCONFIG_COMMON_LOAD_SUCCESS({ panelConfigurationCommon })
        ),
        catchError((error) =>
          of(ACTIONS.PANELCONFIG_COMMON_LOAD_FAILURE({ error })))
       )
      )
    )
  );

  updatePanelConfigurationCommon$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ACTIONS.PANELCONFIG_COMMON_UPDATE_DB),
      exhaustMap(action =>
        this.panelConfigurationService.updatePanelConfigurationCommon(action.panelConfigurationCommon).pipe(
        map(x => ACTIONS.PANELCONFIG_COMMON_LOAD()),
        catchError((error) =>
          of(ACTIONS.PANELCONFIG_COMMON_UPDATE_FAILURE({ error })))
       )
      )
    )
  );
}