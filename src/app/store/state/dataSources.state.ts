import { DataSourceUIModel } from '@core/models/UIModels/dataSource.model';
import { SerialPortCommunicationChannelDataUIModel } from '@core/models/webModels/SerialPortCommunicationChannelDataUIModel.model';
import { TcpIpCommunicationChannelDataUIModel } from '@core/models/webModels/TcpIpCommunicationChannelDataUIModel.model';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';

export interface IDataSourceEntityState extends EntityState<DataSourceUIModel> {
    isLoaded: boolean,
    isLoading: boolean,
    isDirty: boolean,
    isValid: boolean,
    error: string,
    selectedDataSourceId: number | null;
  }

  export const adapter: EntityAdapter<DataSourceUIModel> = createEntityAdapter<DataSourceUIModel>({
    selectId: (dataSource: DataSourceUIModel) => dataSource.Channel.IdCommConfig,
  });

  export const initialState: IDataSourceEntityState = adapter.getInitialState({
    isLoaded: false,
    isLoading: false,
    isDirty: false,
    isValid: false,
    error: '',
    selectedDataSourceId: null,
  });