import { SureSENSGaugeDataModel } from './SureSENSGaugeData.model';
import { CardErrorNotifierModel } from '../UIModels/error-notifier-model';

export class InterfaceCardDataUIModel
{
	public DeviceId: number;
	public Active: boolean;
	public CardAddress: number;
	public CommConfigId: number;
	public Gauges: SureSENSGaugeDataModel[];
	public CardType: number;
	public Description: string;
	public SupportInChargePowerSupplyModule: boolean;
	public EnableDownlink: boolean;
	public currentCardName?: string;
}