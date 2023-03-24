import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';

import * as ACTIONS from '../actions/modbusProtocol.action';

import { PublishingChannelService } from '@core/services/publishingChannel.service';
import { ModbusProtocolModel } from '@core/models/UIModels/ModbusProtocol.model';

@Injectable()
export class ModbusProtocolEffects {

    constructor (private actions$: Actions, private publishingChannelService: PublishingChannelService) {}

    loadModbusProtocol$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ACTIONS.MODBUSPROTOCOL_LOAD),
      mergeMap(() =>
        this.publishingChannelService.getmodbusprotocols().pipe(
        map((protocols: ModbusProtocolModel[]) =>
            ACTIONS.MODBUSPROTOCOL_LOAD_SUCCESS({ protocols })
        ),
        catchError((error) =>
          of(ACTIONS.MODBUSPROTOCOL_LOAD_FAILURE({ error })))
       )
      )
    )
  );
}