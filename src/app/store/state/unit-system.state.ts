import { IState } from './IState';
import { UnitSystemModel } from '@core/models/webModels/UnitSystem.model';

export interface IUnitSystemState extends IState {
    unitSystem: UnitSystemModel;
}

export const unitSystem: IUnitSystemState = {
    unitSystem: {
        UnitSystemName: '',
        UnitQuantities: []
    },
    isLoaded: false,
    isLoading: false,
    isDirty: false,
    isValid: true,
    error: ''
};