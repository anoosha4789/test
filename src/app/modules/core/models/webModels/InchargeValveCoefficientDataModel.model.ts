export interface InchargeValveCoefficientDataModel {
    serialNumber: string;
    toolType: string;
    toolSize: string;
    fullStrokeLengthInInch: number;
    defaultFullShiftVolumeInML: number;
    shiftVolumeInMLAndOpenPercentages: number[][];
    selectableOpenPercentages: number[];
}
