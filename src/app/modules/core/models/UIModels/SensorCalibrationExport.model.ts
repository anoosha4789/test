export class SensorCalibrationExportRecord {
    public SensorName: string;
    public Raw0: number;
    public Raw1: number;
    public Scaled0: number;
    public Scaled1: number;
}

export class SensorCalibrationExport {
    public VersionNumber: string;
    public SerialNumber: string;
    public NumberOfOutputs: number;
    public HPU: SensorCalibrationExportRecord[];
    public OutputPressures: SensorCalibrationExportRecord[];
    public KFactor: number;
}
