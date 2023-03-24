import { createAction, props } from '@ngrx/store';
import { DeviceModel } from '@core/models/webModels/DeviceInfo.model';
import { DataPointDefinitionModel } from '@core/models/webModels/DataPointDefinition.model';

export const LOAD_DEVICES = createAction('Load Devices');
export const LOAD_DEVICES_SUCCESS = createAction('Devices Load Success', props<{ loadeddevices: DeviceModel[] }>());
export const LOAD_DEVICES_FAILURE = createAction('Devices Load Failure', props<{ loadingerror: any }>());

export const LOAD_DATAPOINTDEF = createAction('Load DataPoints');
export const LOAD_DATAPOINTDEF_SUCCESS = createAction('DataPoints Load Success', props<{ loadeddatapoints: DataPointDefinitionModel[] }>());
export const LOAD_DATAPOINTDEF_FAILURE = createAction('DataPoints Load Failure', props<{ loadingerror: any }>());

export const RESET_DEVICES = createAction('Reset Devices');
export const RESET_DATAPOINTDEF = createAction('RESET DataPoints');
