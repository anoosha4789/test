import { DataPointDefinitionModel } from '../webModels/DataPointDefinition.model';
import { ReturnsBasedShiftDefaultsModel } from '../webModels/ShiftDefaultsDataModel.model';
import { TimeBasedShiftDefaultsModel } from '../webModels/TimeBasedShiftDefaults.model';
import { ValvePositionsAndReturnsModel } from '../webModels/ValvePositionsAndReturns.model';
import { InFORCEZoneDataUIModel } from '../webModels/ZoneDataUIModel.model';
import { ToolConnectionUIModel } from './tool-connection.model';

export class InforceZoneUIModel extends InFORCEZoneDataUIModel {
}

export class  ValvePositionsAndReturnsUIModel extends ValvePositionsAndReturnsModel {

}

export class InforceMonitoringZoneUIModel {    
    wellId: number;
    zoneId: number;
    zoneName: string;
    valveType: number;
    numberOfPositions: number;
    currentPosition: number;
    measuredDepth: number;
    hcmId: number;    
    shiftMethod?: string;
    currentPositionStateUnknownFlag?: boolean;    
    CurrentPositionDp?: DataPointDefinitionModel;
    controlReciepeType?:DataPointDefinitionModel;
    ValvePositionsAndReturns?: ValvePositionsAndReturnsModel[];
    sleeve?:InforceMonitoringSleeveUIModel;
    toolList?: InforceMonitoringToolUIModel[];
    currentPositionDescription?: string;
}

export class InforceMonitoringSleeveUIModel {
    sleeveId: number;
    position: DataPointDefinitionModel;
    lastShift: DataPointDefinitionModel;
    lastShiftStatus: DataPointDefinitionModel;
    lastShiftDate?: string;
    lastShiftStatusDescription?: string;
}


export class InforceMonitoringToolUIModel {
    tool: ToolConnectionUIModel;
    pressureDevice: DataPointDefinitionModel;
    temperatureDevice: DataPointDefinitionModel;
    diagnosticsDevice: DataPointDefinitionModel;
    commStatus: DataPointDefinitionModel;
    gaugeType: number;
    espGaugeType: number;
    peakVibrationXDevice?: DataPointDefinitionModel;
    peakVibrationYDevice?: DataPointDefinitionModel;
    peakVibrationZDevice?: DataPointDefinitionModel;
    motorWindingTempDevice?: DataPointDefinitionModel;
    toolStatusCode?: number;
}
  
