import { DataSourceDataUIModel } from '../webModels/DataSourceDataUIModel.model';
import { CardErrorNotifierModel, ChannelErrorNotifierModel } from './error-notifier-model';

export class DataSourceUIModel extends DataSourceDataUIModel {
	public IsValid: boolean;
	public IsDirty: boolean;
	public channelError?: ChannelErrorNotifierModel[];
	public cardError?: CardErrorNotifierModel[];
}