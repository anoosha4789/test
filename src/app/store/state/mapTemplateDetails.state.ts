import { ModbusMapTemplateUIModel } from '@core/models/UIModels/modbusTemplate.model';
import { IState } from './IState';

export interface IRegisteredModbusMapState extends IState {
    templates: ModbusMapTemplateUIModel[]
  }
  
  export const initialIRegisteredModbusMap: IRegisteredModbusMapState = {
    templates: [],
    isLoaded: false,
    isLoading: false,
    isDirty: false,
    isValid: false,
    error: '',
  }