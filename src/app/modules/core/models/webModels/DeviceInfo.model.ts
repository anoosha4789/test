export enum BuiltInDeviceType {
  SureSENSStarInterfaceCard = 1,
  SureSENSHarvestInterfaceCard,
  SureSENSIWISInterfaceCard,
  SureSENSQPTGauge = 4,
  SureSENSESPGauge = 5,
  SureSENSSPTVGauge = 6,
  // Unused = 7,
  // Unused = 8,
  SystemClock = 9,
  InForceHPU = 10,
  InForceModule2542 = 11,
  InForceModuleE1211 = 12,
  InForceModuleE1240 = 13,
  InForceModuleE1260 = 14,
  InForceModuleFlowMeter = 15,
  InForceHCM = 16,
  InForceWell = 17,
  SystemAlarm = 18,
  CustomAlarm = 19,
  InChargeHCMP = 20,
  InChargeWell = 21,
  InterfaceCardDownlink = 22,
  InChargePowerSupplyModule = 23,
  SureSENSInChargeTool = 24,
  SureSENSZone = 25,
  SureSENSWell = 26,
  SureSENSFlowmeter298OilProducerGauge = 27,
  SureSENSFlowmeter298GasProducerGauge,
  SureSENSFlowmeter298GasInjectorGauge,
  SureSENSFlowmeter298WaterInjectorGauge,
  SureSENSFlowmeter298ExOilProducerGauge = 31,
  SureSENSFlowmeter298ExGasProducerGauge,
  SureSENSFlowmeter298ExGasInjectorGauge,
  SureSENSFlowmeter298ExWaterInjectorGauge,
  MultiNodeSIE = 35,
  MultiNodeControl,
  MultiNodeWell,
  MultiNodeeFCV
}
export class DeviceModel {
    public Id: number; // Id >=1 //device ID
    public IdDeviceType: number; // Device type ID
    public OwnerId: number; // Card is an owner, its OwnerId = Id;
    public Enable: boolean;
    public Name: string;
}
export enum SystemClockDataPointIndex {
  TimeZone = 9,
  Year,
  Month,
  Day,
  Hour,
  Minute,
  Second,
}
export class HistorianTimeRange {
  public fromDate: Date;
  public toDate: Date;
}