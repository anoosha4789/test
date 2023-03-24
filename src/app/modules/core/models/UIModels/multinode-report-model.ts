import { ErrorHandlingUIModel } from "../webModels/ErrorHandlingUI.model";
import { IDataLogger } from "./report.model";

export interface MultinodeReportModel {

    Report: IReport,
    PanelConfiguration?: IPanelConfiguration,
    eFCVPositions?: Array<IeFCVPositions>,
    Units?: Array<IUnits>,
    ErrorHandling?: ErrorHandlingUIModel,
    SIEs?: Array<ISie>,
    // Wells?: Array<IWell>,
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
    CustomerName: string,
    FieldName: string
}

//Units 
export interface IUnits {
    label: string,
    symbol: string
}

//eFCV Positions 
export interface IeFCVPositions {
    position: string,
    description: string
}

// SIEs 
export interface ISie {
    Name: string;
    IpAddress: string;
    PortNumber: number;
    MacAddress: string;
    Wells: Array<IWell>;
}

//Wells
export interface IWell {
    WellId?: number,
    WellName: string,
    ZoneGaugesVisbility?: boolean,
    TecPowerSupply: ITecPowerSupply,
    eFCVPositions: IeFCVPositions[],
    Zones: Array<IZone>,
    Gauges?: Array<IGauge> //For gauges without zone GATE - 845
}

export interface ITecPowerSupply {
    MaxVoltage: number;
    MaxCurrent: number;
    TargetVoltage: number;
    RampRate: number;
    SettleVoltage: number;
    SettleRampRate: number;
}

export interface IZone {
    ZoneName: string,
    Depth: number,
    eFCVAddress: string,
    SerialNumber: string,
    UniqueAddress: string,
    // Motor Settings
    MaxVoltage: string,
    MaxCurrent: string,
    TargetVoltage: string,
    OverCurrentThreshold: string,
    OverCurrentOverride: string,
    DutyCycle: string,
    ZoneGaugesVisbility?: boolean,
    Gauges?: Array<IGauge>
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
    CardType: string,
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
    Porting?: string,
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

