export let OutputPressureSensors: OutputSensorDetail[] = [
    { OutputPressurePointIndex: 1, OutputSolenoidPointIndex: 25, SensorName: "Output A" },
    { OutputPressurePointIndex: 2, OutputSolenoidPointIndex: 26, SensorName: "Output B" },
    { OutputPressurePointIndex: 3, OutputSolenoidPointIndex: 27, SensorName: "Output C" },
    { OutputPressurePointIndex: 4, OutputSolenoidPointIndex: 28, SensorName: "Output D" },
    { OutputPressurePointIndex: 5, OutputSolenoidPointIndex: 29, SensorName: "Output E" },
    { OutputPressurePointIndex: 6, OutputSolenoidPointIndex: 30, SensorName: "Output F" },
    { OutputPressurePointIndex: 7, OutputSolenoidPointIndex: 31, SensorName: "Output G" },
    { OutputPressurePointIndex: 8, OutputSolenoidPointIndex: 32, SensorName: "Output H" },
    { OutputPressurePointIndex: 9, OutputSolenoidPointIndex: 33, SensorName: "Output I" },
    { OutputPressurePointIndex: 10, OutputSolenoidPointIndex: 34, SensorName: "Output J" },
    { OutputPressurePointIndex: 11, OutputSolenoidPointIndex: 35, SensorName: "Output K" },
    { OutputPressurePointIndex: 12, OutputSolenoidPointIndex: 36, SensorName: "Output L" },
    { OutputPressurePointIndex: 13, OutputSolenoidPointIndex: 37, SensorName: "Output M" },
    { OutputPressurePointIndex: 14, OutputSolenoidPointIndex: 38, SensorName: "Output N" },
    { OutputPressurePointIndex: 15, OutputSolenoidPointIndex: 39, SensorName: "Output O" },
    { OutputPressurePointIndex: 16, OutputSolenoidPointIndex: 40, SensorName: "Output P" },
    { OutputPressurePointIndex: 17, OutputSolenoidPointIndex: 41, SensorName: "Output Q" },
    { OutputPressurePointIndex: 18, OutputSolenoidPointIndex: 42, SensorName: "Output R" },
    { OutputPressurePointIndex: 19, OutputSolenoidPointIndex: 43, SensorName: "Output S" },
    { OutputPressurePointIndex: 20, OutputSolenoidPointIndex: 44, SensorName: "Output T" },
    { OutputPressurePointIndex: 21, OutputSolenoidPointIndex: 45, SensorName: "Output U" },
    { OutputPressurePointIndex: 22, OutputSolenoidPointIndex: 46, SensorName: "Output V" },
    { OutputPressurePointIndex: 23, OutputSolenoidPointIndex: 47, SensorName: "Output W" },
    { OutputPressurePointIndex: 24, OutputSolenoidPointIndex: 48, SensorName: "Output X" },
];

export class OutputSensorDetail {
    SensorName: string;
    OutputPressurePointIndex: number;
    OutputSolenoidPointIndex: number;
}

export class PointIndexDetail {
    PointIndexName: string;
    PointIndex: number;
}

export class HyrdraulicPowerUnitPointIndex {
    static SupplyPressure: number = 49;
    static ReturnsFlowmeterTotal: number = 50;
    static ReturnsFlowRate: number = 51;
    static ResetReturnsFlowmeterTotal: number = 52;
    static CurrentOperationMode: number = 53;
    static SystemAlarmStatusWord: number = 54;
    static OutputPressureAlarmStatusWord: number = 55;
    static StartPump: number = 56;
    static TurnOnFlowmeter: number = 57;
    static OpenRecirculationValve: number = 58;
    static ExecuteOperationMode: number = 59;
    static TurnOnFlowMeterForTimeBasedShift: number = 60;
    static OperationExecutionInProgress: number = 61;
    static OperationAbortingInProgress: number = 62;
    static CurrentControllingWellId: number = 63;
    static CurrentControllingSleeveId: number = 64;
    static CurrentControllingSleevePositionId: number = 65;
    static TotalRequiredRecipeSteps: number = 66;
    static CurrentRecipeStepInExecution: number = 67;
    static TotalRemainingRecipeSteps: number = 68;
    static CurrentRecipeControlTypeInExecution: number = 69;
    static CurrentRecipeControlLineTypeInExecution: number = 70;
    static TotalExecutionTimeRequiredInSeconds: number = 71;
    static TotalRemainingExecutionTimeInSeconds: number = 72;
    static TotalExecutionTimeInSeconds: number = 73;
    static TimeInSecondsRequiredToFinishCurrentRecipeStep: number = 74;
    static TimeInSecondsRemainingToFinishCurrentRecipeStep: number = 75;
    static ExpectedReturnVolume: number = 76;
    static ReturnFlowStabilizationCheckingPeriodInSeconds: number = 77;
    static SetOperationModeInternal: number = 78;
    static SetOperationMode: number = 79;
    static OperationModeAlarmStatus: number = 80;
    static AutoShiftUserIntervationCommand: number = 81;
    static ReservoirTankVolume: number = 82;
    static LastRecirculationOADate: number = 83;
    static LastRecirculationVolumeInTanks: number = 84;
    static LastRecirculationTimeInSeconds: number = 85;
    static ToRecirculateTankByVolume: number = 86;
    static PlannedRecirculationVolumeInTanks: number = 87;
    static PlannedRecirculationTimeInSeconds: number = 88;
    static CurrentRecirculationVolumeInTanks: number = 89;
    static CurrentRecirculationTimeInSeconds: number = 90;
    static TotalSecondsSinceLastRecirculation: number = 91;
    static TankLevelInVolume: number = 92;
    static TankLevelInPercent: number = 93;
    static VentAllLineCountDownInSeconds: number = 94;
    static IsToVentAllWells: number = 95;
    static iFieldSlaveZoneMoveCommand: number = 96;
    static iFieldSlaveLockOutMode: number = 97;
    static CommStatus: number = 98;
    static HeartBeatCounter: number = 100;
    static OperatorUserId: number = 101;

    //
    static iFieldSlaveLockOutModeName: string = "iFieldSlaveLockOutMode";
    static SetOperationModeInternalName: string = "SetOperationModeInternal";
    static StartPumpName: string = "StartPump";
    static TurnOnFlowmeterName: string = "TurnOnFlowmeter";
    static OpenRecirculationValveName: string = "OpenRecirculationValve";
    static ResetReturnsFlowmeterTotalName: string = "ResetReturnsFlowmeterTotal";
}

export class ModuleE1260PointIndex {
    static RTDElectricalEnclosureTemperature: number = 1;
    static RTDPumpAmbientTemperature: number = 2;
}
export class ModuleE1240PointIndex {
    static Output1PressureRaw: number = 1;
    static Output2PressureRaw: number = 2;
    static Output3PressureRaw: number = 3;
    static Output4PressureRaw: number = 4;
    static Output5PressureRaw: number = 5;
    static Output6PressureRaw: number = 6;
    static Output7PressureRaw: number = 7;
    static Output8PressureRaw: number = 8;
}

export class Module2542PointIndex {
    static PumpDischargePressureRaw: number = 13;
    static SupplyPressureRaw: number = 14;
    static UnloadingCircuitPressure: number = 15;
    static ReserviourLevelRaw: number = 16;
    static PumpDischargePressure: number = 17;
    static SupplyPressure: number = 18;
    static ReserviorLevel: number = 20;
    static PressuretoTriggerUnloadingValvetoClose: number = 120;
    static PressuretoTriggerUnloadingValvetoOpen: number = 119;

    //
    static PressuretoTriggerUnloadingValvetoCloseName: string = "Pressure to Trigger Unloading Valve to Close";
    static PressuretoTriggerUnloadingValvetoOpenName: string = "Pressure to Trigger Unloading Valve to Open";
}

export class ModuleFlowMeter {
    static ConfigureKfactorIndex: number = 7;
    static ConfigureKfactorName: string = "Configure: K-factor";
}

export class ModuleFlowMeterFluidWell {
    static ConfigureKfactorIndex: number = 5;
    static ConfigureKfactorRateIndex: number = 6;
    static ConfigureKfactorName: string = "Configure Total : K-factor";
    static ConfigureKfactorRateName: string = "Configure Flowrate: K-factor";
}

export class InforceWellDevicePointIndex {
    static SelectedToRunAutoShiftingIndex: number = 3;
    static CloseAllHcmStepperSleevesIndex: number = 4;
    //
    static SelectedToRunAutoShiftingName: string = "SelectedToRunAutoShifting";
}

export class InFORCEZone_HCM_PointIndex {
    static WellID: number = 1;
    static ZoneID: number = 2;
    static SegmentId: number = 3;
    static CurrentPositionStateUnknownFlag = 4;
    static ShiftStatus: number = 5;
    static SetRoundTripShift = 6;
    static CurrentPosition: number = 7;
    static TargetPosition: number = 8;
    static TotalShiftingTravelPositions: number = 9;
    static TotalDesignedPositions: number = 10;
    static OpenLinePressure: number = 11;
    static OpenLineSolenoid: number = 12;
    static CloseLinePressure: number = 13;
    static CloseLineSolenoid: number = 14;
    static TimeBasedShiftTime: number = 15;
    static TimeBasedLockTime: number = 16;
    static TimeBasedVentTime: number = 17;
    static UsingReturnBasedShift: number = 18;
    static ReturnsBasedLockTime: number = 19;
    static ReturnsBasedMaxVentTime: number = 20;
    static ReturnsBasedMinShiftTime: number = 21;
    static ReturnsBasedMaxShiftTime: number = 22;
    static TimeToBypassFlowMeter: number = 23;
    static ToleranceUnitInPercentage: number = 24;
    static ReturnsToleranceHigh: number = 25;
    static ReturnsToleranceLow: number = 26;
    static MinimumReturnsFlowRate: number = 27;
    static ReturnFlowStabilizationCheckingPeriodInSeconds: number = 28;
    static LastShiftOADate: number = 29;
    static RecipeLineControlType:number=31;
    static RecipeLineControlOperationStatus:number=32;
    static RecipeRemainingTimeInSecond:number=33;
    static LastAutoShiftingOperationStatus:number=34;

    //
    static CurrentPositionName: string = "CurrentPositionIndex";
    static TargetPositionName: string = "TargetPositionIndex";
}

export class OperationMode {
    static Idle: number = 0;
    static AutoShift: number = 1; 
    static Recirculation: number = 2;
    static VentAll: number = 3;
    static Manual: number = 4;
}

export class ExecutionMode {
    static ExecutionOn: number = 1;
    static ExecutionOff: number = 0;
    static NoExecution: number = -1;
}

export class LocalMaintenanceMode  {
    static Enter: number = 1;
    static Exit: number = 0;
}

export class SHIFT_STATUS_MESSAGE {
    static Idle: string = "Shift Idle";
    static InProgress: string = "Shift Inprogress";
    static Aborting: string = "Aborting Inprogress";
    static Successful: string = "Shift Successful";
    static Failed: string = "Shift Failed";
    static Aborted: string = "Shift Aborted";
    static NotShifted: string = "Not Shifted";
    static NotStarted: string = "Shift Not Started";
    static FailedOnShift: string = "Failed On Shift ";
    static NoShiftPlanned: string = "No Shift Planned";
    static ShiftStatusUnknown: string = "Unknown";

    static FindValue(currentvalue: number): string {

        let returnValue: string = "";

        if (currentvalue == ShiftStatusId.Sucessfull)
            returnValue = SHIFT_STATUS_MESSAGE.Successful;
        else if (currentvalue == ShiftStatusId.Idle)
            returnValue = SHIFT_STATUS_MESSAGE.Idle;
        else if (currentvalue == ShiftStatusId.Failed)
            returnValue = SHIFT_STATUS_MESSAGE.Failed;
        else if (currentvalue == ShiftStatusId.InProgress)
            returnValue = SHIFT_STATUS_MESSAGE.InProgress;
        else if (currentvalue == ShiftStatusId.Aborting)
            returnValue = SHIFT_STATUS_MESSAGE.Aborting;

        return returnValue;
    }
}

export enum ShiftStatusId {
    Idle = 0,
    InProgress,
    Aborting,
    Sucessfull,
    Failed
}