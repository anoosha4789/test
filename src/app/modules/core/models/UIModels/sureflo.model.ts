import { SureFLOFlowMeter } from "../webModels/SureFLODataModel.model";

export class SureFLOFlowMeterUIModel extends SureFLOFlowMeter {
    IsValid: boolean;
    IsDirty: boolean;
}

export enum WellFlowTypes {
    "Oil Producer"=1,
    "Gas Producer",
    "Water Injector",
    "Gas Injector",
}

export enum FlowMeterTypes { 
    "SureFLO298" = 1,
    "SureFLO298 EX",
}

export enum FlowMeterCalFileTypes {
    "OilFVF" = 0,
    "OilDensity", 
    "OilViscosity",
    "WaterFVF", 
    "WaterDensity",
    "WaterViscosity",
    "GasOilRatio"
}
  