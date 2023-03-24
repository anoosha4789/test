import { IState } from './IState';
import { InforceDeviceDataModel } from '@core/models/webModels/InforceDeviceData.model';

export interface IInforceDeviceState extends IState {

    inforcedevices: InforceDeviceDataModel[];
 
  }
  
export const initialInforceDeviceState: IInforceDeviceState = {
    inforcedevices: [],
    isLoaded: false,
    isLoading: false,
    isDirty: false,
    isValid: false,
    error: '',
};