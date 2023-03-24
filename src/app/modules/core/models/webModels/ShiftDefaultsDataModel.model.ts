export class TimeBasedShiftDefaultsModel {
    public PressureLockTime: number;
    public VentTime: number;
    public ShiftTime: number;
    public IdShiftDefault?: number;
    public MinimumResetTime: number;
}

export class ReturnsBasedShiftDefaultsModel {
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

export class ShiftDefaultsDataModel {
    public ShiftMethod: string;
    public TimeBasedShiftDefaults: TimeBasedShiftDefaultsModel;
    public ReturnsBasedShiftDefaults: ReturnsBasedShiftDefaultsModel;
}