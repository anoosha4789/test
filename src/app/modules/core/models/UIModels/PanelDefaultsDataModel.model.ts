import { AlarmAndLimitDefinition } from "../UIModels/alarmUIModel.model";

export class PanelDefaultsDataModel {
    public HydraulicOutputs: number;
    public TankLowLevel: number;
    public MinSupplyPressure: number;
    public MaxSupplyPressure: number;
    public MinPumpPressure: number;
    public MaxPumpPressure: number;
    public MaxTimeForVentAll: number;
    public DelayBeforeMeasuringReturns: number;
    public HPUPassiveModeEnabled: boolean;
    public HPUPassiveModeTimeout: number;
    public EnableLinePrePressurization: boolean;
    public DurationInSecondsToHoldPressure: number;
    public TimeIntervalInHoursToApplyPrePressurizationAgain: number;
    public FlowMeterTransmitterType: number;
}

export class AlarmsAndLimitsDataModel {
    public StartPumpPressure: AlarmAndLimitDefinition;
    public StopPumpPressure: AlarmAndLimitDefinition;
    public HighPumpPressure: AlarmAndLimitDefinition;
    public HighOutputXPressure: AlarmAndLimitDefinition;
    public HighSupplyPressure: AlarmAndLimitDefinition;
    public LowReservoirLevel: AlarmAndLimitDefinition;
}

export class FlowmeterTransmitterTypesDataModel {
    public Id: number;
    public FlowMeterTransmitterTypeDesc: string;
}
