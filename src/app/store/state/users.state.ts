import { IState } from './IState';
import { LoginModel } from '@core/models/webModels/Login.model';

export interface IUsersState extends IState {
    users: LoginModel[];
  }
  
export const initialUsersState: IUsersState = {
    users: [],
    isLoaded: false,
    isLoading: false,
    isDirty: false,
    isValid: false,
    error: '',
};