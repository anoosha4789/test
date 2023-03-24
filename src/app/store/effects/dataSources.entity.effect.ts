import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Effect, Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap, catchError, mergeMap, exhaustMap } from 'rxjs/operators';

import * as ACTIONS from '../actions/dataSources.entity.action';
import * as DEVICEPOINTS_ACTIONS from '@store/actions/deviceDataPoints.action';

import { CommunicationChannelService } from '@core/services/communicationChannel.service';
import { DataSourceUIModel } from '@core/models/UIModels/dataSource.model';
import { of } from 'rxjs';

@Injectable()
export class DataSourcesEntityEffects {
  constructor(
    private store: Store<any>,
    private actions$: Actions,
    private communicationChannelService: CommunicationChannelService) {}


    @Effect()
    loadDataSources$ = this.actions$.pipe(
        ofType(ACTIONS.DATASOURCES_LOAD),
            mergeMap(() => 
                this.communicationChannelService.getDataSources().pipe(
                    map((dataSources: DataSourceUIModel[]) =>
                        ACTIONS.DATASOURCES_LOAD_SUCCESS({ dataSources })
                    ),
                    catchError((error) =>
                        of(ACTIONS.DATASOURCES_LOAD_FAILURE({ error }))
                    )
                )           
            )
    )

    @Effect()
    addDataSource$ = this.actions$.pipe(
        ofType(ACTIONS.DATASOURCES_ADDUPDATE_DB),
        exhaustMap(action => this.communicationChannelService.saveDataSource(action.dataSources).pipe(
            switchMap((dataSources: DataSourceUIModel[]) => [
              ACTIONS.DATASOURCES_LOAD(),
              DEVICEPOINTS_ACTIONS.LOAD_DEVICES(),
              DEVICEPOINTS_ACTIONS.LOAD_DATAPOINTDEF()
            ]
          ),
          catchError((error) =>
            of(ACTIONS.DATASOURCES_ADDUPDATE_FAILURE({ error })))
          )
        )
    )

    @Effect()
    deleteDataSource = this.actions$.pipe(
        ofType(ACTIONS.DATASOURCES_DELETE_DB),
        exhaustMap(action => 
          this.communicationChannelService.deleteSerialPortChannel(action.idComConfig).pipe(
            switchMap(() => [
              ACTIONS.DATASOURCES_LOAD(),
              DEVICEPOINTS_ACTIONS.LOAD_DEVICES(),
              DEVICEPOINTS_ACTIONS.LOAD_DATAPOINTDEF()
            ]
          ),
          catchError((error) =>
            of(ACTIONS.DATASOURCES_DELETE_FAILURE({ error })))
          )
        )
    )
}
