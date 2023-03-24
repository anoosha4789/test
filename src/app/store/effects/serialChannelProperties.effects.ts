import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';

import * as ACTIONS from '../actions/serialChannelProperties.action';

import { SerialChannelProperty } from '@core/models/UIModels/SerialChannel.model';
import { CommunicationChannelService } from '@core/services/communicationChannel.service';

@Injectable()
export class SerialChannelPropertiesEffects {

    constructor (private actions$: Actions, private communicationChannelService: CommunicationChannelService) {}

    loadSerialSettings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ACTIONS.SERIALCHANNELPROPERTIES_LOAD),
      mergeMap(() =>
        this.communicationChannelService.getSerialsettings().pipe(
        map((serialSettings: SerialChannelProperty) =>
            ACTIONS.SERIALCHANNELPROPERTIES_LOAD_SUCCESS({ serialSettings })
        ),
        catchError((error) =>
          of(ACTIONS.SERIALCHANNELPROPERTIES_LOAD_FAILURE({ error })))
       )
      )
    )
  );
}