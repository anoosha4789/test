import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { PointTemplatesExtension } from '@core/models/UIModels/PointTemplatesExtension.model';

export interface IPointTemplateExtensionEntityState extends EntityState<PointTemplatesExtension> {
    isLoaded: boolean,
    isLoading: boolean,
    isDirty: boolean,
    isValid: boolean,
    error: string,
    selectedDeviceTypeId: number | null;
  }

  export const adapter: EntityAdapter<PointTemplatesExtension> = createEntityAdapter<PointTemplatesExtension>({
    selectId: (pointTemplate: PointTemplatesExtension) => pointTemplate.deviceTypeId
  });

  export const initialState: IPointTemplateExtensionEntityState = adapter.getInitialState({
    isLoaded: false,
    isLoading: false,
    isDirty: false,
    isValid: false,
    error: '',
    selectedDeviceTypeId: null,
  });