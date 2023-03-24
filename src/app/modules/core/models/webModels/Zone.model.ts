import { TimeBasedShiftDefaultsModel } from './TimeBasedShiftDefaults.model';
import { ReturnsBasedShiftDefaultsModel } from './ReturnsBasedShiftDefaults.model';
import { ValvePositionsAndReturnsModel } from './ValvePositionsAndReturns.model';
import { LineToZoneMappingModel } from './LineToZoneMapping.model';

export class ZoneModel {
    public ZoneId: number;
    public ZoneName: string;
    public ValveType: string;
    public NumberOfPositions: number;
    public CurrentPosition: number;
    public Depth: number;
    public TimeBasedShiftDefaults: TimeBasedShiftDefaultsModel;
    public ShiftMethod: string;
    public LineToZoneMapping: LineToZoneMappingModel;
    public ValvePositionsAndReturns: ValvePositionsAndReturnsModel[];
    public WellId: number;
    public ReturnsBasedShiftDefaults: ReturnsBasedShiftDefaultsModel;
    public HcmId: number;
    public IsWellLevelShiftDefaultApplied: boolean;
    public CurrentPositionStateUnknownFlag: boolean;
}