import { IState } from './IState';
import { DeviceModel } from '@core/models/webModels/DeviceInfo.model';
import { DataPointDefinitionModel } from '@core/models/webModels/DataPointDefinition.model';

export interface IDeviceDataPoints extends IState {
    devices: DeviceModel[];
    datapointdefinitions: DataPointDefinitionModel[];
}

export const DeviceDataPoints: IDeviceDataPoints = {
    devices: [],
    datapointdefinitions: [],
    isLoaded: false,
    isLoading: false,
    isDirty: false,
    isValid: true,
    error: '',
};
