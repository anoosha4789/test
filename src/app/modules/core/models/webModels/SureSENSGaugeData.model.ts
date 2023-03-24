export class SureSENSGaugeDataModel {
    public DeviceId: number;
    public Active: boolean;
    public GaugeType: any; //SureSENSToolType;
    public EspGaugeType: any; //SureSENS_ESP_Type;
    public ToolAddress: number;
    public PressureCoefficientFileContent: string[];
    public TemperatureCoefficientFileContent: string[];
    public Description: string;
    public SerialNumber: string;
}

export enum SureSENSToolType {
    QPT = 0,
    ESP = 1,
    SPTV = 2,
    INCHARGETOOL = 5
}

export enum SureSENS_ESP_Type {
    None = -1,  // None
    NoMWT = 0,  //INLINE
    MWT = 1     //POD
}