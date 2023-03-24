import { CustomDataLoggerConfiguration } from '@core/models/webModels/DataLogger.model';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';

export interface IDataLoggerEntityState extends EntityState<CustomDataLoggerConfiguration> {
  isLoaded: boolean;
  isLoading: boolean;
  isDirty: boolean;
  isValid: boolean;
  error: string;
  selectedDataLoggerId: number | null;
}

export const adapter: EntityAdapter<CustomDataLoggerConfiguration> = createEntityAdapter<CustomDataLoggerConfiguration>({
  selectId: (dataLogger: CustomDataLoggerConfiguration) => dataLogger.Id,
});

export const initialDataLoggerState: IDataLoggerEntityState = adapter.getInitialState({
  isLoaded: false,
  isLoading: false,
  isDirty: false,
  isValid: false,
  error: '',
  selectedDataLoggerId: null
});
