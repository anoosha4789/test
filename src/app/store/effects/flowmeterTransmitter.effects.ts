// this effect is used to fetch flowmeter transmitter types from web host
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import {
  map,
  catchError,
  exhaustMap,
} from 'rxjs/operators';

import * as ACTIONS from '../actions/flowmeterTransmitter.action';
import { FlowmeterTransmitterTypesDataModel } from '@core/models/UIModels/PanelDefaultsDataModel.model';
import { FlowmeterTransmitterService } from '@core/services/flowmeterTransmitter.service';


@Injectable()
export class FlowmeterTransmitterEffects {
  constructor(
    private actions$: Actions,
    private flowmeterTransmitterService: FlowmeterTransmitterService
  ) { }

  loadFlowmeterTransmitterTypes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ACTIONS.LOAD_FLOWMETER_TRANSMITTER_TYPES),
      exhaustMap(() =>
        this.flowmeterTransmitterService.getFlowmeterTransmitterTypes().pipe(
          map((flowmeterTransmitterTypes: FlowmeterTransmitterTypesDataModel[]) =>
            ACTIONS.LOAD_FLOWMETER_TRANSMITTER_TYPES_SUCCESS({
              flowmeterTransmitterTypes,
            })
          ),
          catchError((error) =>
            of(ACTIONS.LOAD_FLOWMETER_TRANSMITTER_TYPES_FAILURE({ error }))
          )
        )
      )
    )
  );
}
