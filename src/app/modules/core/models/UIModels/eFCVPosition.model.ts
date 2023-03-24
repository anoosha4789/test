import { eFCVPositionModel } from "../webModels/eFCVPosition.model";
import { ErrorNotifierModel } from "./error-notifier-model";

export class eFCVPositionUIModel extends eFCVPositionModel {
    error?: ErrorNotifierModel;
    isPageVisited?: false;
}