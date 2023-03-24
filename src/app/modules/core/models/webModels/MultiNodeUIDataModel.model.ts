import { SortIndicatorRenderCompletedEventArgsDescription } from "igniteui-angular-core";
import { AlarmDefinitionDataUIModel } from "./AlarmDefinitionDataUI.model";

export class ActuateNode {
    public AFCDId: string;
    public DeviceId: number;
    public CurrentStage: string;
    public TargetStage: string;
    public PreviousStage: string;
    public RotationCount?: number;
}

export class ActuateWellModel {
    public SIUID: string;
    public WellId: string;
    public ActuationNodes: ActuateNode[];
}

export class MultinodeUIActuationModel extends ActuateWellModel {
    public IsTowardsHome: boolean;
    public ActuationTime?: number;
    public ActuationStartTime?: number;
}

export class TimebasedActuateModel {
    public SIUID: string;
    public WellId: string;
    public eFCVId: string;
    public CurrentPosition: string;
    public IsTowardsHome: boolean;
    public ActuationTime: number;
}

export class OverridePositionModel {
    eFCVId: string;
    StageType: string;
}

export class RehomeAFCD {
    public SIUID: string;
    public WellId: string;
    public AFCDId: string;
    public efcvDeviceId: number;
}

export enum DiagnosticsTestType {
    EchoTest = 1
}

export class DiagnosticTest {
    public wellId: string;
    public TestType: DiagnosticsTestType;
}

export enum MultiNodeEchoProcessState {
    IDLE = 0,
    INPROGRESS = 1,
    COMPLETED = 2,
    ERROR = 3,
    ABORTED = 4,
    STOP_DONE = 5,
    STOP_ERROR = 6,
    EMERGENCY_STOP_DONE = 7,
    EMERGENCY_STOP_ERROR = 8,
}

export class MultiNodeEquipmentAlarm
{
    public AlarmType: number;
    public AlarmState: number;
    public ActiveAlarmCount: number;
    public EquipmentId: string;
    public ParentEquipmentId: string;
    public Start_UTC_DateTime: string;
    public End_UTC_DateTime: string;
    public AlarmDescription: string;
}

export class MultiNodeAlarmDefinitionDataUI extends AlarmDefinitionDataUIModel {
    public DeviceId: number;
    public AlarmType: MultiNodeAlarmType;
    public AlarmState: MultiNodeAlarmState;
    public AlarmCount: number;
    public AlarmStartTime: string;
    public AlarmEquipmentId: string;
    public AlarmEquipmentName: string;
    public AlarmParentId: string;
    public AlarmParentName: string;
}

export enum MultiNodeAlarmType {
    //Surface Alarms
    INVALID_CONNECTION = 0x3E8,		//1000
    SURFACE_COMMUNICATION_ERROR = 0x3E9,	//1001

    //Well Alarms
    TEC_COMMS_ENGAGE_ERROR = 0x7D0,		//2000
    TEC_COMMS_DISENGAGE_ERROR = 0x7D1,	//2001
    TEC_MOTOR_ENGAGE_ERROR = 0x7D2,		//2002
    TEC_MOTOR_DISENGAGE_ERROR = 0x7D3,	//2003
    POWERUP_ERROR = 0x7D4,				//2004

    //All Motor Alarms
    MOTOR_ENGAGE_ERROR = 0xBB8,			//3000
    MOTOR_DISENGAGE_ERROR = 0xBB9,		//3001
    MOTOR_ENCODER_COMMS_ERROR = 0xBBA,	//3002
    MOTOR_ENCODER_STALLING = 0xBBB,		//3003
    MOTOR_SURFACE_OVERCURRENT = 0xBBC,	//3004
    MOTOR_DOWNHOLE_OVERCURRENT_DETECTED_BY_SURFACE = 0xBBD,		//3005
    MOTOR_DOWNHOLE_OVERCURRENT_DETECTED_BY_FIRMWARE = 0xBBE,	//3006
    MOTOR_START_ERROR = 0xBBF,			//3007
    MOTOR_DIRECTION_ERROR = 0xBC0,		//3008
    MOTOR_TIMEDOUT_ERROR = 0xBC1,		//3009
    MOTOR_CURRENT_OUT_OF_SPEC = 0xBC2,	//3010
    MOTOR_18V_OUT_OF_SPEC = 0xBC3,		//3011
    MOTOR_5_0V_OUT_OF_SPEC = 0xBC4,		//3012
    MOTOR_3_3V_OUT_OF_SPEC = 0xBC5,		//3013

    //AFCD Alarms
    AFCD_INVALID_POSITION = 0xFA0,		//4000
    AFCD_COMMUNICATION_ERROR = 0xFA1,	//4001
    AFCD_ECHO_ERROR = 0xFA2,			//4002 
}

export class AlarmKeyModel
{   public EquipmentId: string;
    public ParentId: string;
    public AlarmType: number;
    public Action: string;
}

export enum MultiNodeAlarmState {
    ACTIVE = 0,
    ACKNOWLEDGED = 1,
    SUSPENDED = 2,
    INACTIVE = 3,
    UNKNOWN = 99
}