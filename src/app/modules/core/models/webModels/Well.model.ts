import { TimeBasedShiftDefaultsModel } from './TimeBasedShiftDefaults.model';
import { ReturnsBasedShiftDefaultsModel } from './ReturnsBasedShiftDefaults.model';
import { ZoneModel } from './Zone.model';
import { PanelToLineMappingModel } from './PanelToLineMapping.model';
import { LineToZoneMappingModel } from './LineToZoneMapping.model';

export class WellModel {
    public WellId: number;
    public WellName: string;
    public ControlArchitecture: string;
    public NumberOfOutputs: number;
    public Zones: ZoneModel[];
    public TimeBasedShiftDefaults: TimeBasedShiftDefaultsModel;
    public ShiftMethod: string;
    public PanelToLineMappings: PanelToLineMappingModel[];
    public LineToZoneMapping: LineToZoneMappingModel[];
    public ReturnsBasedShiftDefaults: ReturnsBasedShiftDefaultsModel;
    public IsPanelLevelShiftDefaultApplied: boolean
    public InforceWellId: number
}