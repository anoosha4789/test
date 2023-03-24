
export interface IInForcePanelPropertyModel {
    HydraulicOutputs: number;
    TankLowLevel: number;
    MinSupplyPressure: number;
    MaxSupplyPressure: number;
    MinPumpPressure: number;
    MaxPumpPressure: number;
    MaxTimeForVentAll: number;
    DelayBeforeMeasuringReturns: number;
    HPUPassiveModeEnabled: boolean;
    HPUPassiveModeTimeout: number;
    EnableLinePrePressurization: boolean
    DurationInSecondsToHoldPressure: number;
    TimeIntervalInHoursToApplyPrePressurizationAgain: number;
}

export class InForcePanelPropertyModel implements IInForcePanelPropertyModel {
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
    public EnableLinePrePressurization: boolean
    public DurationInSecondsToHoldPressure: number;
    public TimeIntervalInHoursToApplyPrePressurizationAgain: number;
    public Id: number;
    public IdPanelType: number;
}