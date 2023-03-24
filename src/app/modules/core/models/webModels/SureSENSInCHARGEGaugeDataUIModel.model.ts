import { SureSENSGaugeDataUIModel } from './SureSENSGaugeDataUIModel.model';
import { InchargeValveCoefficientDataModel } from './InchargeValveCoefficientDataModel.model';

export interface SureSENSInCHARGEGaugeDataUIModel extends SureSENSGaugeDataUIModel {
    inCHARGECoefficientFileName: string;
    inCHARGECoefficientFileContent: InchargeValveCoefficientDataModel;
    inCHARGEOpeningPercentage: number;
}
