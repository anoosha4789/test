import { DataPointLinearScaleConversionModelExtension } from './DataPointLinearScaleConversionModelExtension.model';
import { PanelSensorModelNew } from '../webModels/PanelSensorModelNew.model';

export class PanelSensor extends PanelSensorModelNew {
    Id: number;
    // Unit: IUnit;
    OutputPressurePointIndex: number;
    OutputSolenoidPointIndex: number;
    Sensor: DataPointLinearScaleConversionModelExtension;
    public static copyTo(original: PanelSensor): PanelSensor {
        if (original == null)
            return null;

        let newObj: PanelSensor = {

            Id: original.Id,
            // Unit: original.Unit,
            SensorName: original.SensorName,
            Sensor: {
                InputDeviceId: original.Sensor.InputDeviceId, InputDataPointIndex: original.Sensor.InputDataPointIndex, OutputDataPointIndex: original.Sensor.OutputDataPointIndex,
                OutputDeviceId: original.Sensor.OutputDeviceId, RawValuePoint1: original.Sensor.RawValuePoint1, RawValuePoint2: original.Sensor.RawValuePoint2, ScaledValuePoint1: original.Sensor.ScaledValuePoint1,
                ScaledValuePoint2: original.Sensor.ScaledValuePoint2, RawValuePoint1Validation: 0, RawValuePoint2Validation: 0, ScaledValuePoint1Validation: 0, ScaledValuePoint2Validation: 0
            },
            CategoryName: original.CategoryName,
            OutputPressurePointIndex: original.OutputPressurePointIndex,
            OutputSolenoidPointIndex: original.OutputSolenoidPointIndex
        }
        return newObj;
    }
}
