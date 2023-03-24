import { IState } from './IState';
import { AlarmsAndLimitsDataModel } from '@core/models/UIModels/PanelDefaultsDataModel.model';
import { AlarmAndLimitDefinition } from '@core/models/UIModels/alarmUIModel.model';

export interface IAlarmsAndLimitsState extends IState {
  alarmsAndLimits: AlarmsAndLimitsDataModel;
}

const today = new Date();
const dateAndTime = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()} ${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;

const startPumpPressure = new AlarmAndLimitDefinition();
startPumpPressure.Unit = "psig";
startPumpPressure.UnitQuantity = "pressure";
startPumpPressure.AlarmId = 0;
startPumpPressure.DeviceId = 3;
startPumpPressure.DataPointIndex = 17;
startPumpPressure.LimitValue = 5000;
startPumpPressure.LimitType = 2;
startPumpPressure.SeverityType = 4;
startPumpPressure.Descripiton = "Start Pump Pressure";
startPumpPressure.Status = false;
startPumpPressure.Deadband = 0;
startPumpPressure.Configurable = true;
startPumpPressure.Details = "Pump Pressure is low.  The current value is {0}, which is less than {1}.";
startPumpPressure.ActionItems = "Check the Pump Pressure settings.";

const stopPumpPressure = new AlarmAndLimitDefinition();
stopPumpPressure.Unit = "psig";
stopPumpPressure.UnitQuantity = "pressure";
stopPumpPressure.AlarmId = 1;
stopPumpPressure.DeviceId = 3;
stopPumpPressure.DataPointIndex = 17;
stopPumpPressure.LimitValue = 7800;
stopPumpPressure.LimitType = 3;
stopPumpPressure.SeverityType = 4;
stopPumpPressure.Descripiton = "Stop Pump Pressure";
stopPumpPressure.Status = false;
stopPumpPressure.Deadband = 0;
stopPumpPressure.Configurable = true;
stopPumpPressure.Details = "Pump Pressure is high.  The current value is {0}, which is more than {1}.";
stopPumpPressure.ActionItems = "Check the Pump Pressure settings.";

const highPumpPressure = new AlarmAndLimitDefinition();
highPumpPressure.Unit = "psig";
highPumpPressure.UnitQuantity = "pressure";
highPumpPressure.AlarmId = 2;
highPumpPressure.DeviceId = 3;
highPumpPressure.DataPointIndex = 17;
highPumpPressure.LimitValue = 8500;
highPumpPressure.LimitType = 4;
highPumpPressure.SeverityType = 3;
highPumpPressure.Descripiton = "High Pump Pressure";
highPumpPressure.Status = false;
highPumpPressure.Deadband = 200;
highPumpPressure.Configurable = true;
highPumpPressure.Details = "Pump Pressure is too high, therefore the Pump has been turned OFF.  The current value is {0}, which is more than {1}.";
highPumpPressure.ActionItems = "Check the Pump Pressure settings.";

const highOutputXPressure = new AlarmAndLimitDefinition();
highOutputXPressure.Unit = "psig";
highOutputXPressure.UnitQuantity = "pressure";
highOutputXPressure.AlarmId = 55;
highOutputXPressure.DeviceId = 2;
highOutputXPressure.DataPointIndex = 24;
highOutputXPressure.LimitValue = 9500;
highOutputXPressure.LimitType = 4;
highOutputXPressure.SeverityType = 3;
highOutputXPressure.Descripiton = "High Output X Pressure";
highOutputXPressure.Status = false;
highOutputXPressure.Deadband = 100;
highOutputXPressure.Configurable = true;
highOutputXPressure.Details = "Output X Pressure is too high, therfore a shift cannot start at this level due to possibility of a downhole tool being damaged.  The current value is {0}, which is more than {1}.";
highOutputXPressure.ActionItems = "Check the Output Pressure settings.";

const highSupplyPressure = new AlarmAndLimitDefinition();
highSupplyPressure.Unit = "psig";
highSupplyPressure.UnitQuantity = "pressure";
highSupplyPressure.AlarmId = 4;
highSupplyPressure.DeviceId = 3;
highSupplyPressure.DataPointIndex = 18;
highSupplyPressure.LimitValue = 8500;
highSupplyPressure.LimitType = 4;
highSupplyPressure.SeverityType = 2;
highSupplyPressure.Descripiton = "High Supply Pressure";
highSupplyPressure.Status = false;
highSupplyPressure.Deadband = 100;
highSupplyPressure.Configurable = true;
highSupplyPressure.Details = "Supply Pressure is too high, therefore a shift cannot start at this level due to possibility of a downhole tool being damaged.  The current value is {0}, which is more than {1}.";
highSupplyPressure.ActionItems = "Check the Supply Pressure settings.";

const lowReservoirLevel = new AlarmAndLimitDefinition();
lowReservoirLevel.Unit = "%";
lowReservoirLevel.UnitQuantity = "dimensionless";
lowReservoirLevel.AlarmId = 6;
lowReservoirLevel.DeviceId = 3;
lowReservoirLevel.DataPointIndex = 20;
lowReservoirLevel.LimitValue = 5;
lowReservoirLevel.LimitType = 2;
lowReservoirLevel.SeverityType = 2;
lowReservoirLevel.Descripiton = "Low Reservoir Level";
lowReservoirLevel.Status = false;
lowReservoirLevel.Deadband = 1;
lowReservoirLevel.Configurable = true;
lowReservoirLevel.Details = "Reservoir Level is below the minimum level, therefore a shift cannot start at this level.  The current value is {0}, which is less than {1}.";
lowReservoirLevel.ActionItems = "Fill the Reservoir tank.";

export const initialAlarmsAndLimitsState: IAlarmsAndLimitsState = {
  alarmsAndLimits: {
    StartPumpPressure: startPumpPressure,
    StopPumpPressure: stopPumpPressure,
    HighPumpPressure: highPumpPressure,
    HighOutputXPressure: highOutputXPressure,
    HighSupplyPressure: highSupplyPressure,
    LowReservoirLevel: lowReservoirLevel,
  },
  isLoaded: false,
  isLoading: false,
  isDirty: false,
  isValid: true,
  error: '',
};
