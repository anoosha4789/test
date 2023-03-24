
import { SieModel } from '@core/models/webModels/Sie.model';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';


export interface ISieEntityState extends EntityState<SieModel> {
  isLoaded: boolean;
  isLoading: boolean;
  isDirty: boolean;
  isValid: boolean;
  error: string;
  selectedSieId: number | null;
  }
  
  export const adapter: EntityAdapter<SieModel> = createEntityAdapter<SieModel>({
    selectId: (sie: SieModel) => sie.Id,
  });
  
export const initialSIEState: ISieEntityState = adapter.getInitialState({
  isLoaded: false,
  isLoading: false,
  isDirty: false,
  isValid: false,
  error: '',
  selectedSieId: null
});


