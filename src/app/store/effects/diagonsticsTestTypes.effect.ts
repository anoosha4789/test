// this effect is used to fetch Data Logger from web host
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import {
    map,
    catchError,
    exhaustMap,
} from 'rxjs/operators';

import * as ACTIONS from '../actions/diagnosticsTestTypes.action';
import { DiagonsticsTestsService } from '@core/services/diagonsticsTests.service';
import { DiagnosticsTestTypesDataModel } from '@core/models/UIModels/diagnosticsTestTypes.model';

@Injectable()
export class DiagnosticsTestTypesEffects {
    constructor(
        private actions$: Actions,
        private diagonsticsTestService: DiagonsticsTestsService
    ) { }

    loadDiagnosticsTestTypes$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ACTIONS.LOAD_DIAGNOSTICS_TEST_TYPES),
            exhaustMap(() =>
                this.diagonsticsTestService.getDiagnosticsTestsTypes().pipe(
                    map((diagnosticsTestTypes: DiagnosticsTestTypesDataModel[]) =>
                        ACTIONS.LOAD_DIAGNOSTICS_TEST_TYPES_SUCCESS({
                            diagnosticsTestTypes,
                        })
                    ),
                    catchError((error) =>
                        of(ACTIONS.LOAD_DIAGNOSTICS_TEST_TYPES_FAILURE({ error }))
                    )
                )
            )
        )
    );

}
