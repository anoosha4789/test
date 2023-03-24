import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Effect, Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap, catchError, mergeMap, exhaustMap } from 'rxjs/operators';

import * as ACTIONS from '../actions/dataPointTemplates.entity.action';

import { of } from 'rxjs';
import { CommunicationChannelService } from '@core/services/communicationChannel.service';
import { DataPointTemplatesExtensionService } from '@core/services/dataPointTemplatesExtension.service';
import { PointTemplatesExtensionUIModel } from '@core/models/webModels/PointTemplatesExtensionUIModel.model';

@Injectable()
export class PointTemplatesEntityEffects {
  constructor(
    private store: Store<any>,
    private actions$: Actions,
    private dataPointTemplatesService: DataPointTemplatesExtensionService) {}

    @Effect()
    loadDataPointTemplates$ = this.actions$.pipe(
        ofType(ACTIONS.POINTTEMPLATES_LOAD),
        exhaustMap(action => this.dataPointTemplatesService.getPointTemplates(action.deviceTypeId).pipe(
            switchMap((pointTemplates: PointTemplatesExtensionUIModel[]) => [
              ACTIONS.POINTTEMPLATES_LOAD_SUCCESS({ pointTemplates }),
            ]
          ),
          catchError((error) =>
            of(ACTIONS.POINTTEMPLATES_LOAD_FAILURE({ error })))
          )
        )
    )

    @Effect()
    loadShiftDataPointTemplates$ = this.actions$.pipe(
        ofType(ACTIONS.SHIFT_POINTTEMPLATES_LOAD),
        exhaustMap(action => this.dataPointTemplatesService.getShiftPointTemplates().pipe(
            switchMap((pointTemplates: PointTemplatesExtensionUIModel[]) => [
              ACTIONS.SHIFT_POINTTEMPLATES_LOAD_SUCCESS({ pointTemplates }),
            ]
          ),
          catchError((error) =>
            of(ACTIONS.POINTTEMPLATES_LOAD_FAILURE({ error })))
          )
        )
    )
}
