export enum ActuationStatus {
    Idle = 0,
    InProgress,
    Successfull,
    Failed
}

export class ACTUATION_STATUS_MESSAGE {
    static Idle: string = "Actuation Idle";
    static Initializing: string = "Initializing";
    static InProgress: string = "In Progress";
    static Finalizing: string = "Finalizing";
    static Successful: string = "Actuation Successful";
    static Failed: string = "Failed";

    static FindValue(currentvalue: number): string {
        let returnValue: string = "";
        if (currentvalue == ActuationStatus.Successfull)
            returnValue = ACTUATION_STATUS_MESSAGE.Successful;
        else if (currentvalue == ActuationStatus.Idle)
            returnValue = ACTUATION_STATUS_MESSAGE.Idle;
        else if (currentvalue == ActuationStatus.Failed)
            returnValue = ACTUATION_STATUS_MESSAGE.Failed;
        else if (currentvalue == ActuationStatus.InProgress)
            returnValue = ACTUATION_STATUS_MESSAGE.InProgress;
        return returnValue;
    }
}

export class MultiNodeLocalStorage {
    static ActuationEndTime: string = "ActuationEndTime";
    static IsActuating: string = "IsActuating";
    static IsStopActuating: string = "IsStopActuating";
    static ActuationRotationCount: string = "ActuationRotationCount";
    static DIAGNOSTICTEST_STARTTIME = "DIAGNOSTICTEST_STARTTIME";
}

export enum HealthState {
    ACTIVE = 0,
    STALE = 1,
    REVIEW = 2,
    INACTIVE = 3,
    ILL = 4,
    IDLE = 5,
}