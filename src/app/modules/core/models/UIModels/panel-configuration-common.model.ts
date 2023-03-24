import { PanelConfigurationCommonModel } from "../webModels/PanelConfigurationCommon.model";
import { ErrorNotifierModel } from "./error-notifier-model";

export class PanelConfigurationCommonUIModel extends PanelConfigurationCommonModel {
        error?: ErrorNotifierModel;
        isPageVisited?: boolean;
}