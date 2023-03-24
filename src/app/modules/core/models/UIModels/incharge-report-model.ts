import { ErrorHandlingUIModel } from "../webModels/ErrorHandlingUI.model";
import { IDataLogger } from "./report.model";

export interface InchargeReportModel {

    Report: IReport,
    PanelConfiguration?: IPanelConfiguration,
    UnitSystem?: Array<IUnit>,
    ErrorHandling?: ErrorHandlingUIModel,
    Wells?: Array<IWell>,
    DataSource?: Array<IDataSource>,
    DataPublishing?: Array<IDataPublishing>
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
export interface IUnit {

    label: string,
    symbol: string
}

//Wells
export interface IWell {
    WellId?: number,
    WellName: string,
    ZoneGaugesVisbility?: boolean,
    Zones:  Array<IZone>
    Gauges?:  Array<IGauge>,
    FlowMeters: Array<IFlowMeter> 
}

export interface IZone {

    ZoneName: string,
    WellName: string,
    Depth: number,
    ValveType?: string,
    ValveSize?: string,
    Gauges?:  Array<IGauge>
}

// FlowMeter
export interface IFlowMeter {

    DeviceName: string,
    Serial: string,
    Technology: string,
    WellType: string
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
    IpPortNumber: number,
    IpAddress: string,
    Cards: Array<ICard>
   
}

export interface ICard {
    CardType: string;
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
    SerialNumber: string,
    valveInitialOpen?: number,
    Porting?: string

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
