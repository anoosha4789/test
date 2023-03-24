import { InFORCEPanelModel } from "../webModels/PanelConfigurationCommon.model";
import { ErrorNotifierModel } from "./error-notifier-model";

export class InforcePanelUIModel extends InFORCEPanelModel {
        error?: ErrorNotifierModel;
        isPageVisited?: boolean;
}