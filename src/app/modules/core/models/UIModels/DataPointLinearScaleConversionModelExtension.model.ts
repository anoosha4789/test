import { DataPointLinearScaleConversionModel } from "../webModels/DataPointLinearScaleConversion.model";

export class DataPointLinearScaleConversionModelExtension extends DataPointLinearScaleConversionModel {
    public RawValuePoint1Validation: number = 0;//0 indicates value is valid.1 indicates value is changed from original value.2 indicates valve is Invalid
    public RawValuePoint2Validation: number = 0;
    public ScaledValuePoint1Validation: number = 0;
    public ScaledValuePoint2Validation: number = 0;
}