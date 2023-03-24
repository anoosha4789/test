import { AlarmsAndLimitsDataModel, FlowmeterTransmitterTypesDataModel, PanelDefaultsDataModel } from "./PanelDefaultsDataModel.model";
import { ErrorNotifierModel } from "./error-notifier-model";

export class PanelDefaultUIModel extends PanelDefaultsDataModel {
    error?: ErrorNotifierModel;
}

export class AlarmsAndLimitsUIModel extends AlarmsAndLimitsDataModel {
    error?: ErrorNotifierModel;
}

export class FlowmeterTransmitterUIModel extends FlowmeterTransmitterTypesDataModel {
    error?: ErrorNotifierModel;
}