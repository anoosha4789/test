
import { FlowmeterTransmitterUIModel } from '@core/models/UIModels/panel-default.model';
import { IState } from './IState';

export interface IFlowmeterTransmitterState extends IState {
  flowmeterTransmitterTypes: FlowmeterTransmitterUIModel[];
}

export const initialFlowmeterTransmitterState: IFlowmeterTransmitterState = {
  flowmeterTransmitterTypes: [],
  isLoaded: false,
  isLoading: false,
  isDirty: false,
  isValid: false,
  error: '',
};
