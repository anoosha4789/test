import { createAction, props } from '@ngrx/store';
import { UnitSystemModel } from '@core/models/webModels/UnitSystem.model';
import { UnitSystemUIModel } from '@core/models/UIModels/unit-system.model';
import { IUnitSystemState } from '@store/state/unit-system.state';

// Get Unit System
export const UNITSYSTEM_LOAD = createAction('[core module] Load Unit System');

export const UNITSYSTEM_LOAD_SUCCESS = createAction(
    '[getUnitSystem/API] Unit System Load Success',
    props<{ newunitSystem: UnitSystemModel }>()
);
export const UNITSYSTEM_LOAD_FAILURE = createAction(
    '[getUnitSystem/API] Unit System Load Failure',
    props<{ error: any }>()
);

// Save/Update local Unit System state
export const UNITSYSTEM_SAVE = createAction(
    '[core module] Save local Unit System',
    props<{ unitSystemState: IUnitSystemState }>()
);

// Save/Update Unit System
export const UNITSYSTEM_SAVE_DB = createAction(
    '[core module] Save Unit System',
    props<{ payload: UnitSystemUIModel[] }>()
);

export const UNITSYSTEM_SAVE_SUCCESS = createAction(
    '[updateUnitSystem/API] Unit System Save Success',
    props<{ newunitSystem: UnitSystemModel }>()
);
export const UNITSYSTEM_SAVE_FAILURE = createAction(
    '[updateUnitSystem/API] Unit System Save Failure',
    props<{ error: any }>()
);

export const UNITSYSTEM_RESET = createAction('[core module] Reset Unit System');