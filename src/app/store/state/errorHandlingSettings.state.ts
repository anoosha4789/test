import { IState } from './IState';
import { ErrorHandlingModel } from '@core/models/UIModels/error-handling.model';

export interface IErrorHandlingSettingsState extends IState {
  errorHandlingSettings: ErrorHandlingModel;
}

export const initialErrorHandlingSettings: IErrorHandlingSettingsState = {
  errorHandlingSettings: {
    BadDataValue: 0,
    BadDataValueInteger: 0,
    BadDataValueUnsignedInteger: 0,
    BadDataTimeout: 0,
  },
  isLoaded: false,
  isLoading: false,
  isDirty: false,
  isValid: true,
  error: '',
};
