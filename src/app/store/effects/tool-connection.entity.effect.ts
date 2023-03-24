import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Effect, Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, switchMap, catchError, mergeMap, exhaustMap } from 'rxjs/operators';

import * as ACTIONS from '../actions/tool-connection.entity.action';
import { ToolConnectionService } from '@core/services/tool-connection.service';
import { ToolConnectionUIModel } from '@core/models/UIModels/tool-connection.model';

@Injectable()
export class ToolConnectionEntityEffects {
  constructor(
    private store: Store<any>,
    private actions$: Actions,
    private toolConnectionService: ToolConnectionService) {}


    @Effect()
    loadToolConnections$ = this.actions$.pipe(
        ofType(ACTIONS.TOOL_CONNECTIONS_LOAD),
            mergeMap(() => 
                this.toolConnectionService.getToolConnectionList().pipe(
                    map((toolConnections: ToolConnectionUIModel[]) =>
                        ACTIONS.TOOL_CONNECTIONS_LOAD_SUCCESS({toolConnections})
                    ),
                    catchError((error) =>
                        of(ACTIONS.TOOL_CONNECTIONS_LOAD_FAILURE({ error }))
                    )
                )           
            )
    )

    @Effect()
    addToolConnections$ = this.actions$.pipe(
        ofType(ACTIONS.TOOL_CONNECTIONS_CREATE_UPDATE_DB),
        exhaustMap(action => this.toolConnectionService.saveToolConnection(action.toolConnections).pipe(
            switchMap((toolConnections: ToolConnectionUIModel[]) => [
              ACTIONS.TOOL_CONNECTIONS_LOAD()
            ]
          ),
          catchError((error) =>
            of(ACTIONS.TOOL_CONNECTIONS_CREATE_UPDATE_FAILURE({ error })))
          )
        )
    )

}
