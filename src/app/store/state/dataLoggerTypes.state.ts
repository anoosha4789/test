import { DataLoggerTypesDataModel } from "@core/models/UIModels/dataLoggerTypes.model";
import { IState } from "./IState";

export interface ILoggerTypeState extends IState {
    loggerTypes: DataLoggerTypesDataModel[];
  }
  
  export const initialLoggerTypeState: ILoggerTypeState = {
    loggerTypes: [],
    isLoaded: false,
    isLoading: false,
    isDirty: false,
    isValid: false,
    error: '',
  };