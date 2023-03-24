import { BuiltInDeviceType } from "../webModels/DeviceInfo.model";
import { PointTemplatesExtensionUIModel } from "../webModels/PointTemplatesExtensionUIModel.model";
import { PointTemplatesPropertyCategoryUIModel } from "../webModels/PointTemplatesPropertyCategoryUIModel.model";

export class PointTemplatesExtension {
    public deviceTypeId: BuiltInDeviceType;
    public PointTemplates: PointTemplatesExtensionUIModel[];
}