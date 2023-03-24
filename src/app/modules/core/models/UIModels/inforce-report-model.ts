import { ErrorHandlingUIModel } from "../webModels/ErrorHandlingUI.model";
import { IDataLogger } from "./report.model";

export interface InforceReportModel {

    Report: IReport,
    PanelConfiguration?: IPanelConfiguration,
    Units?: Array<IUnits>,
    ErrorHandling?: ErrorHandlingUIModel,
    ShiftDefaults?: IShiftDefaults,
    PanelDefaults?: IPanelDefaults,
    Wells?: Array<IWell>,
    DataSource?: Array<IDataSource>,
    DataPublishing?: Array<IDataPublishing>,
    DataLogger?: Array<IDataLogger>
}

//Report General Info
interface IReport {

    Name: string,
    CreatedBy: string,
    CreatedOn?: string
    Build: string
}

//Panel Configuration 
export interface IPanelConfiguration {

    PanelType: string,
    SerialNumber: string,
    HydraulicOutputs: number,
    CustomerName: string,
    FieldName: string
}

//Units 
export interface IUnits {
    label: string,
    symbol: string

    /*  Temperature: string,
     Pressure: string,
     Depth: string,
     Vibration: string,
     Mass: string,
     PanelPressure: string,
     ProductionFlowRate: string,
     ReturnsFlowRate: string,
     Volumne: string,
     Density: string,
     Voltage: string,
     Current: string */

}

//Shift Defaults 

interface IShiftDefaults {

    ReturnsBased: IReturnsBased,
    TimeBased: ITimeBased
}


interface IReturnsBased {

    ToleranceHigh: {
        Unit: string,
        Value: number
    },

    ToleranceLow: {
        Unit: string,
        Value: number
    },
    StabilizationInterval: number,
    StabilizationFlowRate: number,
    PressureLockTime: number,
    VentTime: number,
    MinShiftTime: number,
    MaxShiftTime: number,
    MinimumResetTime: number,
    Description: string
}

interface ITimeBased {

    PressureLockTime: number,
    VentTime: number,
    ShiftTime: number,
    MinimumResetTime: number,
    Description: string
}

//Panel Defaults
// created custom Object not exists in data model API
interface IPanelDefaults {

    StartPumpPressure: {
        Unit: string,
        Descripiton: string,
        LimitValue: number
    },
    StopPumpPressure: {
        Unit: string,
        Descripiton: string,
        LimitValue: number
    },
    HighPumpPressure: {
        Unit: string,
        Descripiton: string,
        LimitValue: number
    },
    HighOutputPressure: {
        Unit: string,
        Descripiton: string,
        LimitValue: number
    },
    HighSupplyPressure: {
        Unit: string,
        Descripiton: string,
        LimitValue: number
    },
    LowReservoirLevel: {
        Unit: string,
        Descripiton: string,
        LimitValue: number
    },
    DelayBeforeMeasuringReturns: number,
    HPUPassiveModeEnabled: string, // custom
    HPUPassiveModeTimeout: number,
    EnableLinePrePressurization: string, //custom
    DurationInSecondsToHoldPressure: number,
    TimeIntervalInHoursToApplyPrePressurizationAgain: number
}


//Wells
export interface IWell {
    WellId?: number,
    WellName: string,
    ControlArchitecture: string,
    NumberOfOutputs: string;
    LineToZoneMapping: Array<ILineToZoneMapping>,
    PanelToLineMappings: Array<IPanelToLineMappings>,
    ZoneGaugesVisbility?: boolean,
    Zones: Array<IZone>
    Gauges?: Array<IGauge> //For gauges without zone GATE - 845
}

export interface ILineToZoneMapping {

    ZoneName: string,
    OpenLine: string,
    CloseLine: string,
    ValveType: string
}

export interface IPanelToLineMappings {

    PanelConnection: string,
    DownholeLine: string
}


export interface IZone {

    ZoneName: string,
    Depth: number,
    ValveType: string,
    NumberOfPositions: string,
    CurrentPosition: string,
    CurrentPositionStateUnknownFlag?: boolean,
    ValvePositionsAndReturns: Array<IValvePositionsAndReturns>,
    Gauges?: Array<IGauge>
}

// Valve Positions and Returns
export interface IValvePositionsAndReturns {

    Description: string,
    FromPosition: number,
    ReturnVolume: number,
    ReturnVolumeUnitType: {
        Id: number,
        Name: string,
    },
    ToPosition: number,
    UserSelectable: string
}


//Data Source
export interface IDataSource {

    ComPort: number,
    BaudRate: number,
    PollRateInMs: number,
    PortNamePath: string,
    Protocol: string,
    PollMode: string,
    TimeoutInMs: number,
    BadDataValue?: number,
    BadDataValueInteger?: number,
    BadDataValueUnsignedInteger?: number,
    BadDataTimeout?: number,
    IpPortNumber: number,
    IpAddress: string,
    Cards: Array<ICard>

}

export interface ICard {
    CardType:string,
    CardName: string,
    CardAddress: number,
    Gauges: Array<IGauge>
}

// TO DO - flatten Tool Connection object to get well & zone name
export interface IGauge {

    Description: string,
    ToolAddress: number,
    ToolType: string,
    WellName?: string,
    ZoneName?: string,
    SerialNumber: string
}

//Data Publishing

export interface IDataPublishing {

    Protocol: string,
    Port: string,
    BaudRate: number,
    DataBits: number,
    StopBits: number,
    Parity: string,
    IpPortNumber: any,
    IpAddress: any,
    ConnectionTo: string,
    MapType: string,
    WordOrder: string,
    ByteOrder: string,
    SlaveId: number

}

