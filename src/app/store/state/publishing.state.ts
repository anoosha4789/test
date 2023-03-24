import { PublishingDataUIModel } from '@core/models/UIModels/dataPublishing.model';
import { SerialPortCommunicationChannelDataUIModel } from '@core/models/webModels/SerialPortCommunicationChannelDataUIModel.model';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { TcpIpCommunicationChannelDataUIModel } from '@core/models/webModels/TcpIpCommunicationChannelDataUIModel.model';

export interface IPublishingEntityState extends EntityState<PublishingDataUIModel> {
    isLoaded: boolean,
    isLoading: boolean,
    isDirty: boolean,
    isValid: boolean,
    error: string,
    selectedPublishingId: number | null;
  }

  export const adapter: EntityAdapter<PublishingDataUIModel> = createEntityAdapter<PublishingDataUIModel>({
    selectId: (publishing: PublishingDataUIModel) => publishing.Id,
  });

  export const initialState: IPublishingEntityState = adapter.getInitialState({
    isLoaded: false,
    isLoading: false,
    isDirty: false,
    isValid: false,
    error: '',
    selectedPublishingId: null,
  });