import { IState } from './IState';
import { SerialChannelProperty } from '@core/models/UIModels/SerialChannel.model';

export interface ISerialChannelPropertiesState extends IState {
    serialChannelProperties: SerialChannelProperty;
}

export const initialserialChannelProperties: ISerialChannelPropertiesState = {
    serialChannelProperties: null,
    isLoaded: false,
    isLoading: false,
    isDirty: false,
    isValid: true,
    error: ''
};