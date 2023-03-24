import { ModbusProtocolModel } from '@core/models/UIModels/ModbusProtocol.model';
import { createAction, props } from '@ngrx/store';

// ACTIONS
export const MODBUSPROTOCOL_LOAD = createAction('MODBUSPROTOCOL LOAD');
export const MODBUSPROTOCOL_LOAD_SUCCESS = createAction('MODBUSPROTOCOL LOAD SUCCESS', props<{ protocols: ModbusProtocolModel[] }>());
export const MODBUSPROTOCOL_LOAD_FAILURE = createAction('MODBUSPROTOCOL LOAD FAILURE', props<{ error: any }>());

export const MODBUSPROTOCOL_CLEARERRORS = createAction('MODBUSPROTOCOL CLEARERRORS');