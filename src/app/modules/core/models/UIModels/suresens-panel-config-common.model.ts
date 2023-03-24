import { SureSENSPanelModel } from "../webModels/PanelConfigurationCommon.model";
import { ErrorNotifierModel } from "./error-notifier-model";

export class SuresensPanelConfigurationCommonUIModel extends SureSENSPanelModel {
        error?: ErrorNotifierModel;
        isPageVisited?: boolean;
}