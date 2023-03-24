import { AlarmDefinitionDataUIModel } from "../webModels/AlarmDefinitionDataUI.model";

export class AlarmAndLimitDefinition extends AlarmDefinitionDataUIModel {
    public UnitQuantity: string;
}

export class AlarmDefinition extends AlarmDefinitionDataUIModel {
    public currentIndex: number;

    public static CopyToAlarmDefinition(objalarm: AlarmDefinitionDataUIModel): AlarmDefinition {
        let alarm: AlarmDefinition = new AlarmDefinition();

        alarm.AlarmId = objalarm.AlarmId;
        alarm.Configurable = objalarm.Configurable;
        alarm.currentIndex = -1;
        alarm.DataPointIndex = objalarm.DataPointIndex;
        alarm.Deadband = objalarm.Deadband;
        alarm.Descripiton = objalarm.Descripiton;
        alarm.DeviceId = objalarm.DeviceId;
        alarm.LimitType = objalarm.LimitType;
        alarm.LimitValue = objalarm.LimitValue;
        alarm.SeverityType = objalarm.SeverityType;
        alarm.Status = objalarm.Status;
        alarm.Unit = objalarm.Unit;
        alarm.Details=objalarm.Details;
        alarm.ActionItems=objalarm.ActionItems;

        return alarm;
    }
}