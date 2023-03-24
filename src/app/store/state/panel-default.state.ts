import { IState } from './IState';
import { PanelDefaultUIModel } from '@core/models/UIModels/panel-default.model';

export interface IPanelDefaultState extends IState {
  panelDefaults: PanelDefaultUIModel;
}

export const initialPanelDefaultState: IPanelDefaultState = {
  panelDefaults: {
    HydraulicOutputs: 0,
    TankLowLevel: 0,
    MinSupplyPressure: 0,
    MaxSupplyPressure: 0,
    MinPumpPressure: 0,
    MaxPumpPressure: 0,
    MaxTimeForVentAll: 0,
    DelayBeforeMeasuringReturns: 1,
    HPUPassiveModeEnabled: true,
    HPUPassiveModeTimeout: 1,
    EnableLinePrePressurization: true,
    DurationInSecondsToHoldPressure: 60,
    TimeIntervalInHoursToApplyPrePressurizationAgain: 1,
    FlowMeterTransmitterType: 1,
  },
  isLoaded: false,
  isLoading: false,
  isDirty: false,
  isValid: true,
  error: '',
};
