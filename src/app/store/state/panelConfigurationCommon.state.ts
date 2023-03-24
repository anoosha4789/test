import { PanelConfigurationCommonUIModel } from '@core/models/UIModels/panel-configuration-common.model';
import { PanelConfigurationCommonModel } from '@core/models/webModels/PanelConfigurationCommon.model';
import { IState } from '@store/state/IState';

export interface IPanelConfigurationCommonState extends IState {
    panelConfigurationCommon: PanelConfigurationCommonUIModel;
}

let initPanelConfigCommon: PanelConfigurationCommonUIModel = {
    Id: -1,
    PanelTypeId: -1,
    SerialNumber: null,
    CustomerName: null,
    FieldName: null,
    error: null,
    isPageVisited: false
}

export const initialPanelConfigurationCommon: IPanelConfigurationCommonState = {
    panelConfigurationCommon: initPanelConfigCommon,
    isLoaded: false,
    isLoading: false,
    isDirty: false,
    isValid: true,
    error: '',
};
