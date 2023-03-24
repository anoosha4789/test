import { TimeBasedShiftDefaultsModel } from './TimeBasedShiftDefaults.model';
import { ReturnsBasedShiftDefaultsModel } from './ReturnsBasedShiftDefaults.model';
import { WellModel } from './Well.model';
import { PanelConfigurationModel } from './PanelConfiguration.model';
import { PanelSensorsModel } from './PanelSensors.model';

export class PanelModel {
    public PanelId: number;
    public Wells: WellModel[];
    public PanelSensors: PanelSensorsModel[];
    public TimeBasedShiftDefaults: TimeBasedShiftDefaultsModel;
    public ShiftMethod: string;
    public PanelConfiguration: PanelConfigurationModel;
    public ReturnsBasedShiftDefaults: ReturnsBasedShiftDefaultsModel;
}