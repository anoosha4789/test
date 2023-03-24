import { SureFLO298ExUIFlowMeterUIModel } from '@core/models/UIModels/sureflo-ex-flowmeter-model';
import { SureFLO298UIFlowMeterUIModel } from '@core/models/UIModels/sureflo-flowmeter-model';
import { FlowMeterTypes } from '@core/models/webModels/SureFLODataModel.model';
import { Action, createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';
import { adapter, ISurefloEntityState, initialState } from '@store/state/sureflo.state';

import * as ACTIONS from '../actions/sureflo.entity.action';


const _surefloEntityReducer = createReducer(
  initialState,

  on(ACTIONS.FLOWMETERS_LOAD_SUCCESS, (state, { flowMeters }) => {
    return adapter.setAll(flowMeters, {...state, isLoaded: true, isLoading: false });
  }),

  on(ACTIONS.FLOWMETERS_ADD, (state, { flowMeter }) => {
    return adapter.addOne(flowMeter, state)
  }),

  on(ACTIONS.FLOWMETERS_UPDATE, (state, { flowMeter }) => {
    // let flowMeterToUpdate = FlowMeterTypes[flowMeter.FluidType] === FlowMeterTypes[1] ? flowMeter as SureFLO298UIFlowMeterUIModel : flowMeter as SureFLO298ExUIFlowMeterUIModel
    return adapter.updateOne( { id: flowMeter.DeviceId, changes: flowMeter }, state);
  }),
  on(ACTIONS.FLOWMETERS_DELETE, (state, { flowMeterId }) => {
    return adapter.removeOne(flowMeterId, state);
  }),
  on(ACTIONS.FLOWMETERS_RESET, state => {
    return adapter.removeAll({ ...state = initialState, selectedflowMeterId: null });
  })
);

export function surefloEntityReducer(state: ISurefloEntityState | undefined, action: Action) {
  return _surefloEntityReducer(state, action);
}

export const getSelectedflowMeterId = (state: ISurefloEntityState) => state.selectedFlowMeterId;

export const selectflowMetersState = createFeatureSelector<ISurefloEntityState>('sureflo');

export const getIsLoaded = createSelector(
  selectflowMetersState,
  state => state.isLoaded
);

export const { selectAll: selectAllflowMeters, selectIds } = adapter.getSelectors(
  selectflowMetersState
);