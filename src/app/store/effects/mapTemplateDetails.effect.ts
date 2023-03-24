import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';

import * as ACTIONS from '../actions/mapTemplateDetails.action';

import { PublishingChannelService } from '@core/services/publishingChannel.service';
import { RegisteredModbusMap } from '@core/models/UIModels/RegisteredModbusMap.model';

@Injectable()
export class MapTemplateDetailsEffects {

    constructor (private actions$: Actions, private publishingChannelService: PublishingChannelService) {}

    loadMapTemplateDetails$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ACTIONS.MAPTEMPLATES_LOAD),
      mergeMap(() =>
        this.publishingChannelService.getRegisteredMapTemplates().pipe(
        map((templates: RegisteredModbusMap[]) =>
            ACTIONS.MAPTEMPLATES_LOAD_SUCCESS({ templates })
        ),
        catchError((error) =>
          of(ACTIONS.MAPTEMPLATES_LOAD_FAILURE({ error })))
       )
      )
    )
  );

  loadOnSaveMapTemplateDetails$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ACTIONS.MAPTEMPLATES_AFTER_SAVE),
      mergeMap(() =>
        this.publishingChannelService.getRegisteredMapTemplates().pipe(
        map((templates: RegisteredModbusMap[]) =>
            ACTIONS.MAPTEMPLATES_AFTER_SAVE_SUCCESS({ templates })
        ),
        catchError((error) =>
          of(ACTIONS.MAPTEMPLATES_LOAD_FAILURE({ error })))
       )
      )
    )
  );
}