import { UICommon } from '@core/data/UICommon';
import { PointTemplatesExtension } from '@core/models/UIModels/PointTemplatesExtension.model';
import { PointTemplatesExtensionUIModel } from '@core/models/webModels/PointTemplatesExtensionUIModel.model';
import { Action, createFeatureSelector, createReducer, createSelector, on } from '@ngrx/store';
import { adapter, initialState, IPointTemplateExtensionEntityState } from '@store/state/dataPointTemplates.state';

import * as ACTIONS from '../actions/dataPointTemplates.entity.action';


const _pointTemplatesEntityReducer = createReducer(
  initialState,

  on(ACTIONS.POINTTEMPLATES_LOAD_SUCCESS, (state, { pointTemplates }) => {
    let deviceTypeId = pointTemplates ? pointTemplates[0].DeviceTypeId : null;
    let pointTemplateDevice: PointTemplatesExtension = {
      deviceTypeId: deviceTypeId,
      PointTemplates: pointTemplates
    };
    return adapter.addOne(pointTemplateDevice, {...state, isLoaded: true, isLoading: false });
  }),

  on(ACTIONS.SHIFT_POINTTEMPLATES_LOAD_SUCCESS, (state, { pointTemplates }) => {
    let deviceTypeId = UICommon.SHIFT_DEVICE_TYPEID;
    let pointTemplateDevice: PointTemplatesExtension = {
      deviceTypeId: deviceTypeId,
      PointTemplates: pointTemplates
    };
    return adapter.addOne(pointTemplateDevice, {...state, isLoaded: true, isLoading: false });
  }),

  on(ACTIONS.DEVICETYPE_ADD, (state, { pointTemplate }) => {
    return adapter.addOne(pointTemplate, state)
  }),

  on(ACTIONS.DEVICETYPE_UPDATE, (state, { pointTemplate }) => {
    return adapter.updateOne( { id: pointTemplate.deviceTypeId, changes: pointTemplate }, state);
  }),
  //   on(ACTIONS.DATASOURCES_DELETE, (state, { idComConfig }) => {
  //     return adapter.removeOne(idComConfig, state);
  //   }),
  // on(ACTIONS.deleteDataSources, (state, { ids }) => {
  //   return adapter.removeMany(ids, state);
  // }),
  // on(ACTIONS.deleteDataSourcesByPredicate, (state, { predicate }) => {
  //   return adapter.removeMany(predicate, state);
  // }),
  
  on(ACTIONS.POINTTEMPLATES_RESET, state => {
    return adapter.removeAll({ ...state = initialState, selectedDeviceTypeId: null });
  })
);

export function pointTemplatesEntityReducer(state: IPointTemplateExtensionEntityState | undefined, action: Action) {
  return _pointTemplatesEntityReducer(state, action);
}

export const getSelectedPointsCategoryId = (state: IPointTemplateExtensionEntityState) => state.selectedDeviceTypeId;

export const selectPointsTemplatesState = createFeatureSelector<IPointTemplateExtensionEntityState>('pointTemplates');

export const getIsLoaded = createSelector(
  selectPointsTemplatesState,
  state => state.isLoaded
);

export const { selectAll: selectAllPointTemplates, selectIds } = adapter.getSelectors(
    selectPointsTemplatesState
);