import { createAction, props } from '@ngrx/store';
import { SerialChannelProperty } from '@core/models/UIModels/SerialChannel.model';

// ACTIONS
export const SERIALCHANNELPROPERTIES_LOAD = createAction('[core module] Load Serial Ports and other settings');
export const SERIALCHANNELPROPERTIES_LOAD_SUCCESS = createAction('[core module] Load Serial Ports and other settings Loaded Success', props<{ serialSettings: SerialChannelProperty }>());
export const SERIALCHANNELPROPERTIES_LOAD_FAILURE = createAction('[core module] Load Serial Ports and other settings Loaded Failure', props<{ error: any }>());

export const SERIALCHANNELPROPERTIES_CLEARERRORS = createAction('SERIALCHANNELPROPERTIES_CLEARERRORS');