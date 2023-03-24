import { ValvePositionsAndReturnsUIModel } from '@core/models/UIModels/InforceZone.model';

export class InforceUICommon {
    static convertPressure(value: number, unit: string): number {
        switch (unit?.toLowerCase()) {
            case 'psia':
                value = value + 14.7;
                break;
            case 'bar':
                value = value * 0.0689476;
                break;
            case 'barg':
                value = value * 0.0689476;
                break;
            case 'kpa':
                value = value * 6.89476;
                break;
            case 'mpa':
                value = value * 0.00689476;
                break;
            case 'pa':
                value = value * 6894.76;
                break;
        }
        return Number(value.toFixed(1));
    }

    static getGaugeMaxLimit(unit: string) {
        let maxLimit = 0;
        switch (unit?.toLowerCase()) {
            case 'psia':
                maxLimit = 10000;
                break;
            case 'psig':
                maxLimit = 10000;
                break;
            case 'bar':
                maxLimit = 1000;
                break;
            case 'barg':
                maxLimit = 1000;
                break;
            case 'kpa':
                maxLimit = 70000;
                break;
            case 'mpa':
                maxLimit = 100;
                break;
            case 'pa':
                maxLimit = 6.8948e+7;
                break;
        }
        return maxLimit;
    }
}

export enum INFORCE_ALARM_CONFIG  {
    Fatal = 1,
    Critical
}


export const INFORCE_GAUGE_THRESHOLD_CONFIG = {
    valid: { severityType: -1, color: '#02a783' },
    warning: { severityType: 1, color: '#f0b429' },
    critical: { severityType: 3, color: '#fb8c00' },
    fatal: { severityType: 2, color: '#E12D39' },
}

export const INFORCE_GAUGE_CONFIG = {
    bgFillColor: '#E0E0E0',
    fgFillColor: '#02a783'
}

export const INFORCE_RESERVIOR_CONFIG = {
    bgFillColor: '#F5F5F5',
    valid: '#BBEBFF',
    critical: '#fb8c00',
    fatal: '#E12D39'
}

export enum InforceShiftStatus {
    Idle = 0,
    InProgress,
    Aborting,
    Successfull,
    Failed
}

export enum ShiftControlReciepe {
    Lock = 0,
    Vent,
    Shift,
    Pressurize,
    Reset
}

export class InforceZoneShiftUIModel {
    WellId: number;
    ZoneId: number;
    ZoneName: string;
    HcmId: number;
    CurrentPositionStateUnknownFlag: boolean;
    CurrentPositionRawValue?: number;
    PreviousTargetPosition?: InforceShiftValvePositionModel;
    CurrentTargetPosition?: InforceShiftValvePositionModel;
    SelectedTargetPosition?: InforceShiftValvePositionModel;
    TargetValvePositionDd?: ValvePositionsAndReturnsUIModel[];
    IsResetOrVent?: boolean;
    ProgressText?: string;
    ResetTime?: number;
    isFullShift?: number = 0;
    isPositionInvalid?: boolean;
  }
  
  export class InforceShiftValvePositionModel {
    Id: number;
    Description: string
  }


