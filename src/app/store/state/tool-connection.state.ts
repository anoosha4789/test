import { ToolConnectionUIModel } from '@core/models/UIModels/tool-connection.model';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { IState } from './IState';

export interface IToolConnecionState extends EntityState<ToolConnectionUIModel> {
  isLoaded: boolean,
  isLoading: boolean,
  isDirty: boolean,
  isValid: boolean,
  error: string
}

export const adapter: EntityAdapter<ToolConnectionUIModel> = createEntityAdapter<ToolConnectionUIModel>({
  selectId: (toolConnection: ToolConnectionUIModel) => toolConnection.Id,
});

export const initialState: IToolConnecionState = adapter.getInitialState({
  isLoaded: false,
  isLoading: false,
  isDirty: false,
  isValid: false,
  error: '',
});