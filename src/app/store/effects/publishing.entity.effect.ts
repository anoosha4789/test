import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Effect, Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap, catchError, mergeMap, exhaustMap } from 'rxjs/operators';

import * as ACTIONS from '../actions/publishing.entity.action';

import { of } from 'rxjs';
import { PublishingChannelService } from '@core/services/publishingChannel.service';
import { ModbusConfigurationModelsUI, PublishingDataUIModel } from '@core/models/UIModels/dataPublishing.model';

@Injectable()
export class PublishingEntityEffects {
  constructor(
    private store: Store<any>,
    private actions$: Actions,
    private publishingChannelService: PublishingChannelService) {}


    @Effect()
    loadPublishings$ = this.actions$.pipe(
        ofType(ACTIONS.PUBLISHING_LOAD),
            mergeMap(() => 
                this.publishingChannelService.getPublishing().pipe(
                    map((publishings: ModbusConfigurationModelsUI) =>
                        ACTIONS.PUBLISHING_LOAD_SUCCESS({ publishings: this.publishingChannelService.getPublishing_UIModel(publishings)})
                    ),
                    catchError((error) =>
                        of(ACTIONS.PUBLISHING_LOAD_FAILURE({ error }))
                    )
                )           
            )
    )

    @Effect()
    addPublishings$ = this.actions$.pipe(
        ofType(ACTIONS.PUBLISHING_ADDUPDATE_DB),
        exhaustMap(action => this.publishingChannelService.savePublishing(action.publishings).pipe(
            switchMap((publishings: PublishingDataUIModel[]) => [
              ACTIONS.PUBLISHING_LOAD()
            ]
          ),
          catchError((error) =>
            of(ACTIONS.PUBLISHING_ADDUPDATE_FAILURE({ error })))
          )
        )
    )

    @Effect()   // This is just a place holder - actual API call need to be implemented.
    deletePublishings = this.actions$.pipe(
        ofType(ACTIONS.PUBLISHING_DELETE_DB),
        exhaustMap(action => 
          this.publishingChannelService.deletePublishingChannel(action.idPublishing).pipe(
            switchMap(() => [
              ACTIONS.PUBLISHING_LOAD()
            ]
          ),
          catchError((error) =>
            of(ACTIONS.PUBLISHING_DELETE_FAILURE({ error })))
          )
        )
    )
}
