import { SureSENSGaugeDataModel } from './SureSENSGaugeDataModel.model';
export class InterfaceCardDataUIModel {
	public DeviceId: number;
	public Active: boolean;
	public CardAddress: number;
	public CommConfigId: number;
	public Gauges: SureSENSGaugeDataModel[];
	public CardType: number;
	public Description: string;
	public SupportInChargePowerSupplyModule: boolean;
	public InChargePowerSupplyModuleDeviceId: number;
	public EnableDownlin: boolean;
	public DownlinDeviceId: number;
}