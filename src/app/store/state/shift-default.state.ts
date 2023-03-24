import { IState } from './IState';
import { ShiftDefaultUIModel } from '@core/models/UIModels/shift-default.model';

export interface IShiftDefaultState extends IState {
  shiftDefaults: ShiftDefaultUIModel;
}

export const initialShiftDefaultState: IShiftDefaultState = {
  shiftDefaults: {
    ShiftMethod: 'ReturnsBased',
    TimeBasedShiftDefaults: {
      PressureLockTime: 30,
      VentTime: 60,
      ShiftTime: 300,
      IdShiftDefault: -1,
      MinimumResetTime: 1200

    },
    ReturnsBasedShiftDefaults: {
      ToleranceHigh: 15,
      ToleranceLow: 15,
      IntervalTime: 5,
      IntervalCount: 4,
      StablizationDeadband:0.2,
      PressureLockTime: 30,
      VentTime: 30,
      MinShiftTime: 60,
      MaxShiftTime: 300,
      IdShiftDefault: -1,
      IsToleranceUnitInPercentage: 0,
      MinimumReturnsFlowRateForStabilization: 0.9,
      ReturnFlowStabilizationCheckingPeriodInSeconds: 5,
      MinimumResetTime: 1200

    }
  },
  isLoaded: false,
  isLoading: false,
  isDirty: false,
  isValid: true,
  error: '',
};
