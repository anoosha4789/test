// this effect is used to fetch configured devices from web host
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import {
    map,
    catchError,
    exhaustMap,
} from 'rxjs/operators';
import { ConfigurationService } from '@core/services/configurationService.service';
import * as ACTIONS from '../actions/efcvPositionSettings.action';
import { MultiNodePositionDefaultsDataUIModel } from '@core/models/UIModels/MultiNodePositionDefaultsDataUI.model';

@Injectable()
export class eFCVPositionSettingsEffects {
    constructor(
        private actions$: Actions,
        private configurationService: ConfigurationService
    ) { }

    loadeFCVPositionSettings$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ACTIONS.LOAD_eFCV_POSITION_SETTINGS),
            exhaustMap(() =>
                this.configurationService.geteFCVPositionSettings().pipe(
                    map((eFCVPositionSettings: MultiNodePositionDefaultsDataUIModel) =>
                        ACTIONS.LOAD_eFCV_POSITION_SETTINGS_SUCCESS({
                            eFCVPositionSettings,
                        })
                    ),
                    catchError((error) =>
                        of(ACTIONS.LOAD_eFCV_POSITION_SETTINGS_FAILURE({ error }))
                    )
                )
            )
        )
    );

    updateeFCVPositionSettings$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ACTIONS.UPDATE_eFCV_POSITION_SETTINGS_DB),
            exhaustMap((action) =>
                this.configurationService
                    .updateeFCVPositionSettings(action.eFCVPositionSettings)
                    .pipe(
                        map(() => ACTIONS.UPDATE_eFCV_POSITION_SETTINGS_SUCCESS()
                        ),
                        catchError((error) =>
                            of(ACTIONS.UPDATE_eFCV_POSITION_SETTINGS_FAILURE({ error }))
                        )
                    )
            )
        )
    );
}
