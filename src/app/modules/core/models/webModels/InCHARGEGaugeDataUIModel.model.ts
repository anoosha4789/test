import { SureSENSGaugeDataUIModel } from "./SureSENSGaugeDataUIModel.model";
import { InchargeValveCoefficientDataModel } from './InchargeValveCoefficientDataModel.model';

export class InCHARGEGaugeDataUIModel extends SureSENSGaugeDataUIModel{
	
	public InCHARGECoefficientFileName: string;
	public InCHARGECoefficientFileContent: InchargeValveCoefficientDataModel;
	public InCHARGEOpeningPercentage: number;
}
