export interface ReportUIModel {}

//Report General Info
export interface IReport {

    Name: string,
    CreatedBy: string,
    CreatedOn?: string
    Build?: string
}

//Panel Configuration 
export interface IPanelConfiguration {

    PanelType: string,
    SerialNumber: string,
    HydraulicOutputs?: number,
    CustomerName: string,
    FieldName: string
}

//Units 
export interface IUnit {
    label: string,
    symbol: string
}

export interface IUnitAlarm {
    Id: number;
    Name: string;
}
//Wells
export interface IWell {
    WellId: number;
    WellName: string,
    ControlArchitecture: string,
    ToolConnections:  Array<IToolConnection>
    FlowMeters: Array<IFlowMeter>
}

// FlowMeter
export interface IFlowMeter {

    DeviceName: string,
    Serial: string,
    Technology: string,
    WellType: string
}

//Tools
export interface IToolConnection {

    Description: string,
    GaugeType: string,
    ToolAddress: number,
    WellName: string,
    SerialNumber: string
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

// Cards
export interface ICard {
    CardType: string;
    CardName: string,
    CardAddress: number,
    Gauges: Array<IGauge>
}

// Tool / Gauge
export interface IGauge {

    Description: string,
    ToolAddress: number,
    ToolType: string,
    WellName: string,
    ZoneName: string,
    SerialNumber: string
}

//Data Publishing
export interface IDataPublishing {

    Protocol: string,
    Port: string;
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

export interface IDataLogger {
    Name: string,
    DataLoggerType: number,
    DataLoggerTypeName: string,
    ScanRate?: number,
    IsDeleted?: number,
    WellName?: string
}
