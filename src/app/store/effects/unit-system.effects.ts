import { Injectable } from '@angular/core';
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';

import * as ACTIONS from '../actions/unit-system.action';

import { ConfigurationService } from '@core/services/configurationService.service';
import { UnitSystemModel } from '@core/models/webModels/UnitSystem.model';


@Injectable()
export class UnitSystemEffects {

    constructor (private actions$: Actions, private configurationService: ConfigurationService) {}

    loadUnitSystem$ = createEffect(() =>
    this.actions$.pipe(
        ofType(ACTIONS.UNITSYSTEM_LOAD),
        mergeMap(() =>
            this.configurationService.getUnitSystem().pipe(
                map((newunitSystem: UnitSystemModel) =>
                    ACTIONS.UNITSYSTEM_LOAD_SUCCESS({ newunitSystem })
                ),
                catchError((error) =>
                    of(ACTIONS.UNITSYSTEM_LOAD_FAILURE({ error })))
                )
            )
        )
    );

    saveUnitSystem$ = createEffect(() =>
    this.actions$.pipe(
        ofType(ACTIONS.UNITSYSTEM_SAVE_DB),
        mergeMap((action) =>
            this.configurationService.saveUnitSystem(action.payload).pipe(
                map(newunitSystem => ACTIONS.UNITSYSTEM_SAVE_SUCCESS({newunitSystem})),
                catchError((error) =>
                    of(ACTIONS.UNITSYSTEM_SAVE_FAILURE({ error })))
                )
            )
        )
    );


}