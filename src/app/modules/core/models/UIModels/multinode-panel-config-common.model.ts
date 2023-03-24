import { MultiNodePanelModel } from "../webModels/PanelConfigurationCommon.model";
import { ErrorNotifierModel } from "./error-notifier-model";

export class MultiNodePanelConfigurationCommonUIModel extends MultiNodePanelModel {
        error?: ErrorNotifierModel;
        isPageVisited?: boolean;
}