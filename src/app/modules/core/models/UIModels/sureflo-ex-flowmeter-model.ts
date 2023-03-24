import { AdditionalParameters298Ex, FilterParameters298Ex, FlowMeterCalibrationFile, FlowMeterDimensions298Ex, FlowMeterPTMapping298Ex, FluidPVTData298Ex, SureFLOFlowMeter, SureFLOFlowMeter298, SureFLOFlowMeter298Ex } from "../webModels/SureFLODataModel.model";
import { SureFLOFlowMeterUIModel } from "./sureflo.model";


export class SureFLO298ExUIFlowMeterUIModel extends SureFLOFlowMeterUIModel {
    
    flowMeterPTMapping: FlowMeterPTMapping298Ex;
    flowMeterDimensions: FlowMeterDimensions298Ex;
    fluidPVTData: FluidPVTData298Ex;
    additionalParameters: AdditionalParameters298Ex;
    filterParameters: FilterParameters298Ex;
}

// Oil Producer
export class SureFLO298EXCalibrationModel {
    fluidType: string; 
    technology: string;
    calibrationFileName: string;
    flowMeterDimensions: FlowMeterDimensions298Ex;
    fluidPVTData: FluidPVTData298Ex;
    additionalParameters: AdditionalParameters298Ex;
    filterParameters: FilterParameters298Ex;
    useRemoteGauge: boolean;
    IsValid?: boolean;
    IsDirty?: boolean;
}

// Gas Producer or Injector
export class SureFLO298EXGasCalibrationModel {
    fluidType: string; 
    technology: string;
    calibrationFileName: string;
    flowMeterDimensions: FlowMeterDimensionsGas298ExModel;
    fluidPVTData: FluidPVTDataGas298ExModel;
    additionalParameters: AdditionalParamGas298ExModel;
    filterParameters: FilterParameters298Ex;
}

// Water Injector
export class SureFLO298EXWaterCalibrationModel {
    fluidType: string; 
    technology: string;
    calibrationFileName: string;
    flowMeterDimensions: FlowMeterDimensionsGas298ExModel;
    fluidPVTData: FluidPVTDataWater298ExModel;
    additionalParameters: AdditionalParamWater298ExModel;
    filterParameters: FilterParameters298Ex;
}


export class FlowMeterDimensionsGas298ExModel {
    public InletDiameter: number;
    public OutletDiameter: number;
    public InletTolerance: number;
    public OutletTolerance: number;
    public StaticCorrection: number;
}

export class FluidPVTDataGas298ExModel {

    public SpecificGravityGas: number;
    public UseCustomGasProperties: boolean;
    public GasDensityCalibration: FlowMeterCalibrationFile;
    public GasViscosityCalibration: FlowMeterCalibrationFile;
    public GasVolumeFactorCalibration: FlowMeterCalibrationFile;

}

export class AdditionalParamGas298ExModel {
    public MeasuredDepth: number;
    public CoefficientExpansion: number;
}

export class FluidPVTDataWater298ExModel {

    public SpecificGravityWater: number;
    public UseCustomWaterProperties: boolean;
    public WaterDensityCalibration: FlowMeterCalibrationFile;
    public WaterViscosityCalibration: FlowMeterCalibrationFile;
    public WaterVolumeFactorCalibration: FlowMeterCalibrationFile;

}

export class AdditionalParamWater298ExModel {
    public MeasuredDepth: number;
    public CoefficientExpansion: number;
    public SurfaceWaterCut: number;
}


  