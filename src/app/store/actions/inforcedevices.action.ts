import { createAction, props } from '@ngrx/store';
import { InforceDeviceDataModel } from '@core/models/webModels/InforceDeviceData.model';

export const INFORCEDEVICES_LOAD = createAction('[core module] Load Inforce Devices');
export const INFORCEDEVICES_LOAD_SUCCESS = createAction('[getInforcedevices/API] Inforce Devices Loaded Success', props<{ inforcedevices: InforceDeviceDataModel[] }>());
export const INFORCEDEVICES_LOAD_FAILURE = createAction('[getInforcedevices/API] Inforce Devices Loaded Failure', props<{ error: any }>());

export const INFORCEDEVICES_RESET = createAction('[core module] Reset Alarms');
