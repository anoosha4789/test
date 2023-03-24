import { ShiftDefaultsDataModel } from "../webModels/ShiftDefaultsDataModel.model";
import { ErrorNotifierModel } from "./error-notifier-model";

export class ShiftDefaultUIModel extends ShiftDefaultsDataModel {
        returnBasedError?: ErrorNotifierModel;
        timeBasedError?: ErrorNotifierModel;
}