import { AdditionalParameters, FlowMeterCalibrationFile, FlowMeterDimensions, FlowMeterPTMapping, FluidPVTData, SureFLOFlowMeter, SureFLOFlowMeter298 } from "../webModels/SureFLODataModel.model";
import { SureFLOFlowMeterUIModel } from "./sureflo.model";


export class SureFLO298UIFlowMeterUIModel extends SureFLOFlowMeterUIModel {
    flowMeterPTMapping: FlowMeterPTMapping;
    flowMeterDimensions: FlowMeterDimensions;
    fluidPVTData: FluidPVTData;
    additionalParameters: AdditionalParameters;
}


export class SureFLO298CalibrationModel {
    fluidType: string; 
    technology: string;
    calibrationFileName: string;
    flowMeterDimensions: FlowMeterDimensions;
    fluidPVTData: FluidPVTData;
    additionalParameters: AdditionalParameters;
    useRemoteGauge: boolean;
    IsValid?: boolean;
    IsDirty?: boolean;
}

export class SureFLO298GasCalibrationModel {
    fluidType: string; 
    technology: string;
    calibrationFileName: string;
    flowMeterDimensions: FlowMeterDimensionsUIModel;
    additionalParameters: AdditionalParamGasModel;
}

export class SureFLO298WaterCalibrationModel {
    fluidType: string; 
    technology: string;
    calibrationFileName: string;
    flowMeterDimensions: FlowMeterDimensionsUIModel;
    fluidPVTData: FluidPVTDataWaterUIModel;
    additionalParameters: AdditionalParamWaterModel;
}


export class FlowMeterDimensionsUIModel {
    InletDiameter: number;
    ThroatDiameter: number;
    StaticCorrection: number;
}

export class AdditionalParamGasModel {
    DeltaThreshold: number;
    ProducedGasGravity: number;
}

export class FluidPVTDataWaterUIModel {
    WaterFVF: number;
    WaterDensity: number;
    WaterViscosity: number;
    WaterSpecificGravity: number;
    UseCustomWaterProperties: boolean;
    WaterDensityCalibration: FlowMeterCalibrationFile;
    WaterViscosityCalibration: FlowMeterCalibrationFile;
    WaterVolumeFactorCalibration: FlowMeterCalibrationFile;

}

export class AdditionalParamWaterModel {
    DeltaThreshold: number;
    CD: number;
}


  