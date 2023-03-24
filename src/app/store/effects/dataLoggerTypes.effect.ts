// this effect is used to fetch Data Logger from web host
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import {
    map,
    catchError,
    exhaustMap,
} from 'rxjs/operators';

import * as ACTIONS from '../actions/dataLoggerTypes.action';
import { DataLoggerService } from '@core/services/dataLogger.service';
import { DataLoggerTypesDataModel } from '@core/models/UIModels/dataLoggerTypes.model';


@Injectable()
export class DataLoggerTypesEffects {
    constructor(
        private actions$: Actions,
        private dataLoggerService: DataLoggerService
    ) { }

    loadDataLoggerTypes$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ACTIONS.LOAD_DATA_LOGGER_TYPES),
            exhaustMap(() =>
                this.dataLoggerService.getDataLoggerTypes().pipe(
                    map((loggerTypes: DataLoggerTypesDataModel[]) =>
                        ACTIONS.LOAD_DATA_LOGGER_TYPES_SUCCESS({
                            loggerTypes,
                        })
                    ),
                    catchError((error) =>
                        of(ACTIONS.LOAD_DATA_LOGGER_TYPES_FAILURE({ error }))
                    )
                )
            )
        )
    );

}
