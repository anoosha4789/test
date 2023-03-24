export class PanelConfigurationModel {
    public Id: number;
    public IdPanelType : number;
    public PanelTypeId: number;
    public PanelType: string;
    public SerialNumber: string;
    public WifiSsid: string;
    public HydraulicOutputs: number;
    public InterfaceCardSlots: number;
    public CustomerName: string;
    public FieldName: string;
    public UnitSystemId: number;
    public TankLowLevel: number;
    public MinSupplyPressure: number;
    public MaxSupplyPressure: number;
    public MinPumpPressure: number;
    public MaxPumpPressure: number;
    public MaxTimeForVentAll: number;
    public DelayBeforeMeasuringReturns: number;
    public HPUPassiveModeEnabled: boolean
    public HPUPassiveModeTimeout: number;
    public EnableLinePrePressurization: boolean
    public DurationInSecondsToHoldPressure: number;
    public TimeIntervalInHoursToApplyPrePressurizationAgain: number;
    public ToggleEnabled: boolean;
    public ToggleIntervalInSec: number;
}