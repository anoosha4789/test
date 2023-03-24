import { IState } from './IState';

export interface IServerRunningStatusState extends IState {
  ConfigurationSavingInProgress: boolean;
  ConfigurationResetingInProgress: boolean;
}

export const initialserverRunningStatusState: IServerRunningStatusState = {
  ConfigurationSavingInProgress: false,
  ConfigurationResetingInProgress: false,
  isLoaded: true,
  isLoading: false,
  isDirty: false,
  isValid: true,
  error: '',
};
