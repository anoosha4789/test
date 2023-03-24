// this effect is used to fetch configured devices from web host
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError } from 'rxjs/operators';
import { ConfigurationService } from '@core/services/configurationService.service';
import { DeviceModel } from '@core/models/webModels/DeviceInfo.model';
import { DataPointDefinitionModel } from '@core/models/webModels/DataPointDefinition.model';
import * as ACTIONS from '../actions/deviceDataPoints.action';

@Injectable()
export class DeviceDataPointsEffects {
  constructor(
    private actions$: Actions,
    private configurationService: ConfigurationService
  ) {}

  loadDevices$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ACTIONS.LOAD_DEVICES),
      mergeMap(() =>
        this.configurationService.getDeviceListFromDB().pipe(
          map((loadeddevices: DeviceModel[]) =>
            ACTIONS.LOAD_DEVICES_SUCCESS({ loadeddevices })
          ),
          catchError((loadingerror) =>
            of(ACTIONS.LOAD_DEVICES_FAILURE({ loadingerror }))
          )
        )
      )
    )
  );

  loadDataPointDefinitions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ACTIONS.LOAD_DATAPOINTDEF),
      mergeMap(() =>
        this.configurationService.getallDataPointsfromDB().pipe(
          map((loadeddatapoints: DataPointDefinitionModel[]) =>
            ACTIONS.LOAD_DATAPOINTDEF_SUCCESS({ loadeddatapoints })
          ),
          catchError((loadingerror) =>
            of(ACTIONS.LOAD_DATAPOINTDEF_FAILURE({ loadingerror }))
          )
        )
      )
    )
  );
}
