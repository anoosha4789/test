export class SIUDataPointIndex {
    static SIE_ChassisTemperature: number = 2;
    //PowerSupply 1
    static PS1_OverVoltageSetting: number = 7;
    static PS1_VoltageSetting: number = 8;
    static PS1_OverCurrentSetting: number = 9;
    static PS1_Voltage: number = 10;
    static PS1_Current: number = 11;
    //PowerSupply 2
    static PS2_OverVoltageSetting: number = 18;
    static PS2_VoltageSetting: number = 19;
    static PS2_OverCurrentSetting: number = 20;
    static PS2_Voltage: number = 21;
    static PS2_Current: number = 22;
    //PowerSupply 3
    static PS3_OverVoltageSetting: number = 29;
    static PS3_VoltageSetting: number = 30;
    static PS3_OverCurrentSetting: number = 31;
    static PS3_Voltage: number = 32;
    static PS3_Current: number = 33;
    //PowerSupply 4
    static PS4_OverVoltageSetting: number = 40;
    static PS4_VoltageSetting: number = 41;
    static PS4_OverCurrentSetting: number = 42;
    static PS4_Voltage: number = 43;
    static PS4_Current: number = 44;

    // TEC 1
    static TEC1_MotorVoltage: number = 50;
    static TEC1_TECVoltage: number = 51;
    // TEC 2
    static TEC2_MotorVoltage: number = 56;
    static TEC2_TECVoltage: number = 57;
    // TEC 3
    static TEC3_MotorVoltage: number = 62;
    static TEC3_TECVoltage: number = 63;

    static IsPowerOffInProgress:number=79;
    static IsPowerOnInProgress: number =80;

    static CommStatus : number = 0;
    static CommStatus2 : number = 1
}

export class eFCVDataPointIndex {
    static IsCommunicating: number = 2;
    static ActuationStatus: number = 3;
    static ActuationMode: number = 4;
    static Motor_EncoderCount: number = 5;
    static WasLastActuationSuccess: number = 7;
    static Position: number = 8;
    static Current: number = 13;
    static Voltage: number = 14;
    static Motor_Current: number = 18;
    static Motor_Voltage: number= 19;
    static PowerSupplyTemperature:number=21;
}

export class MultiNodeControlDataPointIndex {
    static OperatorInputNeeded: number = 3;
    static CurrentShiftStatus: number = 8;
    static ActuateResult: number = 16;
    static IsDataBackupCompleted: number = 36;
}

export class MultiNodeLogMessages {
    static MULTINODE_LOG_MESSAGE_KEY: string = "MultiNode InControl Service";
}

export class MultiNodeWellDevicePointIndex {
    static IsCommsPowerOn: number = 0;
    static EchoState: number = 2;
    static IsBeingActuated: number = 3;
}
