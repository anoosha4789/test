export class InChargeCalibrationHistoryDataModel {
    public WellName: string;
    public ZoneName: string;
    public CalibratedFullShiftVolumeInML: number;
    public CalibratedFullyOpenFullShiftVolumeInML: number;
    public CalibratedFullyCloseFullShiftVolumeInML: number;
    public LastFullShiftVolumeCalibrationOADateTime: Date;
    public OperatorUserId: number;
    public EventDateTime: Date;
}