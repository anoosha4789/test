
import { MultiNodePositionDefaultsDataModel } from "../webModels/MultiNodePositionDefaultsDataModel.model";
import { ErrorNotifierModel } from "./error-notifier-model";

export class MultiNodePositionDefaultsDataUIModel extends MultiNodePositionDefaultsDataModel {
    error?: ErrorNotifierModel;
    isPageVisited?: false;
}