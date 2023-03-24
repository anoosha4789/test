import { SieModel } from "../webModels/Sie.model";
import { ErrorNotifierModel } from "./error-notifier-model";

export class SieUIModel extends SieModel {
    public IsValid?: boolean;
    public IsDirty?: boolean;
    error?: ErrorNotifierModel[];
    currentSieName?: string;
}