import { PointTemplatesExtension } from '@core/models/UIModels/PointTemplatesExtension.model';
import { PointTemplatesExtensionUIModel } from '@core/models/webModels/PointTemplatesExtensionUIModel.model';
import { createAction, props } from '@ngrx/store';

// ACTIONS
export const POINTTEMPLATES_LOAD = createAction('[core module] Load PointTemplates', props<{ deviceTypeId: number}>());
export const POINTTEMPLATES_LOAD_SUCCESS = createAction('[core module] Load PointTemplates Loaded Success', props<{ pointTemplates: PointTemplatesExtensionUIModel[] }>());
export const POINTTEMPLATES_LOAD_FAILURE = createAction('[core module] Load PointTemplates Loaded Failure', props<{ error: any }>());

export const SHIFT_POINTTEMPLATES_LOAD = createAction('[core module] Load Shift PointTemplates');
export const SHIFT_POINTTEMPLATES_LOAD_SUCCESS = createAction('[core module] Load Shift PointTemplates Loaded Success', props<{ pointTemplates: PointTemplatesExtensionUIModel[] }>());
export const SHIFT_POINTTEMPLATES_LOAD_FAILURE = createAction('[core module] Load Shift PointTemplates Loaded Failure', props<{ error: any }>());

export const DEVICETYPE_ADD = createAction('[PointTemplates] Add PointTemplates', props<{ pointTemplate: PointTemplatesExtension }>());
export const DEVICETYPE_UPDATE = createAction('[PointTemplates] Update PointTemplates', props<{ pointTemplate: PointTemplatesExtension }>());
// export const POINTTEMPLATES_DELETE = createAction('[PointTemplates] Delete PointTemplates', props<{pointTemplateId: number}>());

export const POINTTEMPLATES_RESET = createAction('[core module] Reset PointTemplates');