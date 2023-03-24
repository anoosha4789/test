import { IShiftDefaultsModel } from './IShiftDefaults.model';

export class TimeBasedShiftDefaultsModel implements IShiftDefaultsModel {
    public PressureLockTime: number;
    public VentTime: number;
    public ShiftTime: number;
    public IdShiftDefault?: number;
    public MinimumResetTime: number;
}