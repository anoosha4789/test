import { SureFLOFlowMeterUIModel } from '@core/models/UIModels/sureflo.model';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';

export interface ISurefloEntityState extends EntityState<SureFLOFlowMeterUIModel> {
    isLoaded: boolean,
    isLoading: boolean,
    isDirty: boolean,
    isValid: boolean,
    error: string,
    selectedFlowMeterId: number | null;
  }

  export const adapter: EntityAdapter<SureFLOFlowMeterUIModel> = createEntityAdapter<SureFLOFlowMeterUIModel>({
    selectId: (flowmeter: SureFLOFlowMeterUIModel) => flowmeter.DeviceId,
  });

  export const initialState: ISurefloEntityState = adapter.getInitialState({
    isLoaded: false,
    isLoading: false,
    isDirty: false,
    isValid: false,
    error: '',
    selectedFlowMeterId: null,
  });