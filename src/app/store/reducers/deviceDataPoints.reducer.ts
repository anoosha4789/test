import { createReducer, on, Action } from '@ngrx/store';

import * as ACTIONS from '../actions/deviceDataPoints.action';
import {
  DeviceDataPoints,
  IDeviceDataPoints,
} from '@store/state/deviceDataPoints.state';

const deviceDataPointsReducer = createReducer(
  DeviceDataPoints,
  on(ACTIONS.LOAD_DEVICES_SUCCESS, (state, { loadeddevices }) => ({
    ...state,
    isLoaded: true,
    isLoading: false,
    devices: loadeddevices,
  })),
  on(ACTIONS.LOAD_DEVICES_FAILURE, (state, { loadingerror }) => ({
    ...state,
    isLoaded: true,
    isLoading: false,
    error: loadingerror,
  })),
  on(ACTIONS.RESET_DEVICES, (state) => ({
    ...state = DeviceDataPoints
  })),
  on(ACTIONS.LOAD_DATAPOINTDEF_SUCCESS, (state, { loadeddatapoints }) => ({
    ...state,
    isLoaded: true,
    isLoading: false,
    datapointdefinitions: loadeddatapoints,
  })),
  on(ACTIONS.LOAD_DATAPOINTDEF_FAILURE, (state, { loadingerror }) => ({
    ...state,
    isLoaded: true,
    isLoading: false,
    error: loadingerror,
  })),
  on(ACTIONS.RESET_DATAPOINTDEF, (state) => ({
    ...state = DeviceDataPoints
  })),
);
export function DeviceDataPointsReducer(state: IDeviceDataPoints, action: Action) {
  return deviceDataPointsReducer(state, action);
}
