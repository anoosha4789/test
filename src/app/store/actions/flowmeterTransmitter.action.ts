import { FlowmeterTransmitterTypesDataModel } from '@core/models/UIModels/PanelDefaultsDataModel.model';
import { createAction, props } from '@ngrx/store';

export const LOAD_FLOWMETER_TRANSMITTER_TYPES = createAction(
  'Load InFORCE Flowmeter Transmitter Types'
);
export const LOAD_FLOWMETER_TRANSMITTER_TYPES_SUCCESS = createAction(
  'InFORCE Flowmeter Transmitter Types Load Success',
  props<{ flowmeterTransmitterTypes: FlowmeterTransmitterTypesDataModel[] }>()
);
export const LOAD_FLOWMETER_TRANSMITTER_TYPES_FAILURE = createAction(
  'InFORCE Flowmeter Transmitter Types Load Failure',
  props<{ error: any }>()
);