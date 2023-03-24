import { IShiftDefaultsModel } from './IShiftDefaults.model';

export class ReturnsBasedShiftDefaultsModel implements IShiftDefaultsModel {
    public ToleranceHigh: number;
    public ToleranceLow: number;
    public IntervalTime: number;
    public IntervalCount: number;
    public StablizationDeadband: number;
    public PressureLockTime: number;
    public VentTime: number;
    public MinShiftTime: number;
    public MaxShiftTime: number;
    public IdShiftDefault?: number;
    public IsToleranceUnitInPercentage: number;
    public MinimumReturnsFlowRateForStabilization: number;
    public ReturnFlowStabilizationCheckingPeriodInSeconds: number;
    public MinimumResetTime: number;
}