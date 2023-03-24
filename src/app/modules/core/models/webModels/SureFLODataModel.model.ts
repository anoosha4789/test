import { DataPointDefinitionModel } from "./DataPointDefinition.model";

export enum WellFlowTypes {
    OilProducer=1,
    GasProducer,
    WaterInjector,
    GasInjector,
}

export enum FlowMeterTypes { 
    SureFLO298 = 1,
    SureFLO298EX,
}

export class FlowMeterCalibrationFile {
    public UseFile: boolean;
    public FileName: string;
    public CalibrationData: string[];
}

export class SureFLOFlowMeter {
    public Active: boolean;
    public Serial: string;
    public DeviceId: number;
    public WellId: number;
    public FluidType: string; 
    public Technology: string;
    public DeviceName: string;
    public CalibrationFileName: string;
}

export class SureFLOFlowMeter298 extends SureFLOFlowMeter {
    public flowMeterPTMapping: FlowMeterPTMapping;
    public flowMeterDimensions: FlowMeterDimensions;
    public fluidPVTData: FluidPVTData;
    public additionalParameters: AdditionalParameters;
}

export class FlowMeterPTMapping {
    public InletPressureSource: DataPointDefinitionModel;
    public ThroatPressureSource: DataPointDefinitionModel;
    public RemotePressureSource: DataPointDefinitionModel;
    public TemperatureSource: DataPointDefinitionModel;
    public UseRemoteGauge: DataPointDefinitionModel;
}

export class FlowMeterDimensions {
    public InletDiameter: number;
    public ThroatDiameter: number;
    public RemoteDiameter: number;
    public StaticCorrection: number;
    public LengthP1toP3: number;
    public RGCPosition: number;
}

export class FluidPVTData {
    public OilFVF: number;
    public OilDensity: number;
    public OilViscosity: number;
    public WaterFVF: number;
    public WaterDensity: number;
    public WaterViscosity: number;
    public SolutionGOR: number;
    public UseCustomWaterProperties: boolean;
    public WaterSpecificGravity: number;
    public OilDensityCalibration: FlowMeterCalibrationFile;
    public OilViscosityCalibration: FlowMeterCalibrationFile;
    public OilVolumeFactorCalibration: FlowMeterCalibrationFile;
    public GasOilRatioCalibration: FlowMeterCalibrationFile;
    public WaterDensityCalibration: FlowMeterCalibrationFile;
    public WaterViscosityCalibration: FlowMeterCalibrationFile;
    public WaterVolumeFactorCalibration: FlowMeterCalibrationFile;
}

export class AdditionalParameters {
    public Deviation: number;
    public FrictionFactor: number;
    public DeltaThreshold: number;
    public DHWaterCutPercent: number;
    public SurfaceWaterCutPercent: number;
    public ProducedGasGravity: number;
    public CD: number;
}

export class SureFLOFlowMeter298Ex extends SureFLOFlowMeter {
    public flowMeterPTMapping: FlowMeterPTMapping298Ex;
    public flowMeterDimensions: FlowMeterDimensions298Ex;
    public fluidPVTData: FluidPVTData298Ex;
    public additionalParameters: AdditionalParameters298Ex;
    public filterParameters: FilterParameters298Ex;
}

export class FlowMeterPTMapping298Ex {
    public InletPressureSource: DataPointDefinitionModel;
    public OutletPressureSource: DataPointDefinitionModel;
    public RemotePressureSource: DataPointDefinitionModel;
    public InletTemperatureSource: DataPointDefinitionModel;
    public OutletTemperatureSource: DataPointDefinitionModel;
    public RemoteTemperatureSource: DataPointDefinitionModel;
    public UseRemoteGauge: boolean;
}

export class FlowMeterDimensions298Ex {
    public InletDiameter: number;
    public OutletDiameter: number;
    public RemoteDiameter: number;
    public InletTolerance: number;
    public OutletTolerance: number;
    public RemoteTolerance: number;
    public StaticCorrection: number;
    public DensityStaticCorrection: number;
    public ApplyStaticCorrection: boolean;
    public ApplyDensityStaticCorrection: boolean;
    public RemotePosition: string;
}

export class FluidPVTData298Ex {
    public SpecificGravityOil: number;
    public SpecificGravityGas: number;
    public SpecificGravityWater: number;
    public OilSurfaceViscosity: number;
    public GasOilRatio: number;
    public UseCustomOilProperties: boolean;
    public UseCustomWaterProperties: boolean;
    public UseCustomGasProperties: boolean;
    public OilDensityCalibration: FlowMeterCalibrationFile;
    public OilViscosityCalibration: FlowMeterCalibrationFile;
    public OilVolumeFactorCalibration: FlowMeterCalibrationFile;
    public GasOilRatioCalibration: FlowMeterCalibrationFile;
    public GasDensityCalibration: FlowMeterCalibrationFile;
    public GasViscosityCalibration: FlowMeterCalibrationFile;
    public GasVolumeFactorCalibration: FlowMeterCalibrationFile;
    public WaterDensityCalibration: FlowMeterCalibrationFile;
    public WaterViscosityCalibration: FlowMeterCalibrationFile;
    public WaterVolumeFactorCalibration: FlowMeterCalibrationFile;
    public CalculateDensity: boolean;
    public CalculateViscosity: boolean;

}

export class AdditionalParameters298Ex {
    public MeasuredDepth: number;
    public TrueVerticalDepth: number;
    public SurfaceWaterCut: number;
    public WaterCutInversion: number;
    public EmulsificationStability: number;
    public RoughnessFactor: number;
    public CoefficientExpansion: number;
    public Deviation: number;
}

export class FilterParameters298Ex {
    public PTBufferLeftWeight: number;
    public PTBufferRightWeight: number;
    public PTBufferOrder: number;
    public FlowBufferLeftWeight: number;
    public FlowBufferRightWeight: number;
    public FlowBufferOrder: number;
    public ThresholdLow: number;
    public ThresholdHigh: number;
}