import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { WellDataUIModel } from '@core/models/webModels/WellDataUIModel.model';

export interface IWellEntityState extends EntityState<WellDataUIModel> {
    isLoaded: boolean;
    isLoading: boolean;
    isDirty: boolean;
    isValid: boolean;
    error: string;
    selectedWellId: number | null;
  }

export const adapter: EntityAdapter<WellDataUIModel> = createEntityAdapter<WellDataUIModel>({
  selectId: (well: WellDataUIModel) => well.WellId,
  });

export const initialState: IWellEntityState = adapter.getInitialState({
    isLoaded: false,
    isLoading: false,
    isDirty: false,
    isValid: false,
    error: '',
    selectedWellId: null
  });
