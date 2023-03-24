import { ModbusProtocolModel } from '@core/models/UIModels/ModbusProtocol.model';
import { IState } from './IState';

export interface IModbusProtocolState extends IState {
  protocols: ModbusProtocolModel[]
}

export const initialModbusProtocol: IModbusProtocolState = {
  protocols: [],
  isLoaded: false,
  isLoading: false,
  isDirty: false,
  isValid: false,
  error: '',
};