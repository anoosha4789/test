import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';

import * as ACTIONS from '../actions/panelType.action';

import { PanelConfigurationService } from '@core/services/panelConfiguration.service';
import { PanelType } from '@core/models/UIModels/PanelType.model';

@Injectable()
export class PanelTypeEffects {

    constructor (private actions$: Actions, private panelConfigurationService: PanelConfigurationService) {}

    loadPanelTypes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ACTIONS.PANELTYPES_LOAD),
      mergeMap(() =>
        this.panelConfigurationService.getPanelTypes().pipe(
        map((panels: PanelType[]) =>
            ACTIONS.PANELTYPES_LOAD_SUCCESS({ panels })
        ),
        catchError((error) =>
          of(ACTIONS.PANELTYPES_LOAD_FAILURE({ error })))
       )
      )
    )
  );
}