import { Injectable } from '@angular/core';
import { GaugeTypeUIModel } from '@core/models/UIModels/models.model';
import { CommunicationChannelService } from '@core/services/communicationChannel.service';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';

import * as ACTIONS from '../actions/toolType.action';

@Injectable()
export class ToolTypeEffects {

    constructor (private actions$: Actions, private communicationChannelService: CommunicationChannelService) {}

    loadToolTypes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ACTIONS.TOOLTYPES_LOAD),
      mergeMap(() =>
        this.communicationChannelService.getGaugeToolTypes().pipe(
        map((toolTypes: GaugeTypeUIModel[]) =>
            ACTIONS.TOOLTYPES_LOAD_SUCCESS({ toolTypes })
        ),
        catchError((error) =>
          of(ACTIONS.TOOLTYPES_LOAD_FAILURE({ error })))
       )
      )
    )
  );
}