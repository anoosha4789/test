import { MultiNodePositionDefaultsDataUIModel } from "@core/models/UIModels/MultiNodePositionDefaultsDataUI.model";
import { IState } from "./IState";

export interface IeFCVPositionSettingsState extends IState {
    eFCVPositionSettings: MultiNodePositionDefaultsDataUIModel;
}

export const initialEfcvPositionSetttingsState: IeFCVPositionSettingsState = {
    eFCVPositionSettings: { PositionDescriptionData: [], PositionStagesData: [] },
    isLoaded: false,
    isLoading: false,
    isDirty: false,
    isValid: true,
    error: '',
}