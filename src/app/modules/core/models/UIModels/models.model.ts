export class GaugeTypeUIModel {
    GaugeType: number;
    ESPGaugeType: number;
    TypeName: string
}

export enum DeleteOrder {
    ModbusConfiguration = 1,
    SureFLOFlowMeter,
    ToolConnections,
    Gauge,
    InterfaceCard,
    Channel,
    Zone,
    Well,
    DataLogger,
    Sie,
    eFCV
}