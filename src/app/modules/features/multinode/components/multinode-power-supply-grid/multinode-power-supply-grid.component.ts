import { AfterViewInit, Component, HostListener, Input, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { GatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { DataSourceFacade } from '@core/facade/dataSourceFacade.service';
import { DeviceDataPointsFacade } from '@core/facade/deviceDataPointsFacade.service';
import { WellFacade } from '@core/facade/wellFacade.service';
import { DataPointDefinitionModel } from '@core/models/webModels/DataPointDefinition.model';
import { RealTimeDataSignalRService } from '@core/services/realTimeDataSignalR.service';
import { ToolConnectionService } from '@core/services/tool-connection.service';
import { UserService } from '@core/services/user.service';
import { SIUDataPointIndex } from '@features/multinode/common/MultiNodeRegisterIndex';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { ManualModePowerSupply } from '../multinode-manual-mode/manual-mode-power-supply/manual-mode-power-supply.component';

@Component({
  selector: 'app-multinode-power-supply-grid',
  templateUrl: './multinode-power-supply-grid.component.html',
  styleUrls: ['./multinode-power-supply-grid.component.scss']
})
export class MultinodePowerSupplyGridComponent extends GatewayPanelBase implements OnInit, AfterViewInit {
  @Input()
  manualPowerSupplies: ManualModePowerSupply;

  // table widths
  tablePowerSupplyWidth: string;
  tableOverVoltageSettingWidth: string;
  tableOverVoltageReadingWidth: string;
  tableVoltageReadingWidth: string;
  tableOverCurrentSettingWidth: string;
  tableCurrentReadingWidth: string;
  private dataSubscriptions: Subscription[] = [];
  deviceIndexArray: DataPointDefinitionModel[];
  test :DataPointDefinitionModel;
  constructor(protected store: Store,
    private router: Router,
    private wellDataFacade: WellFacade,
    private dataSourceFacade: DataSourceFacade,
    private dataPointFacade: DeviceDataPointsFacade,
    private userService: UserService,
    private toolConnectionService: ToolConnectionService,
    private realTimeService: RealTimeDataSignalRService) {
    super(store, null, wellDataFacade, dataSourceFacade, null, dataPointFacade, null);
  }
  // Page Resize
  @HostListener("window:resize", [])
  public onResize() {
    if(this.manualPowerSupplies.resizeGrid)
      this.detectEPScreenSize();
    else
      this.detectMMScreenSize();
  }
  postCallDeviceDataPoints(): void {
    this.setPowerSupplyValues();
  }

  private getDeviceByPointIndex(deviceId: number, pointIndex: number): DataPointDefinitionModel {
    let index = this.datapointdefinitions.findIndex(d => d.DeviceId === deviceId && d.DataPointIndex == pointIndex) ?? -1;
    if (index !== -1) {
      const dp = new DataPointDefinitionModel();
      dp.DataPointIndex = this.datapointdefinitions[index].DataPointIndex;
      dp.DataType = this.datapointdefinitions[index].DataType;
      dp.DeviceId = this.datapointdefinitions[index].DeviceId;
      dp.RawValue = -999;
      dp.ReadOnly = this.datapointdefinitions[index].ReadOnly;
      dp.TagName = this.datapointdefinitions[index].TagName;
      dp.UnitQuantityType = this.datapointdefinitions[index].UnitQuantityType;
      dp.UnitSymbol = this.datapointdefinitions[index].UnitSymbol;

      this.deviceIndexArray.push(dp);
      return dp;
    }
    return new DataPointDefinitionModel();  // return empty DataPointDefinitionModel
  }
  private setPowerSupplyValues(){
    this.deviceIndexArray = [];
      if(this.manualPowerSupplies.powerSupplies.length == 4){
        this.setPS1DataPoints(0);
        this.setPS2DataPoints(1);
        this.setPS3DataPoints(2);
        this.setPS4DataPoints(3);
      }
      else if(this.manualPowerSupplies.powerSupplies.length == 3){
        this.setPS1DataPoints(0);
        this.setPS2DataPoints(1);
        this.setPS4DataPoints(2);
      }
      else if(this.manualPowerSupplies.powerSupplies.length == 2){
        this.setPS1DataPoints(0);
        this.setPS4DataPoints(1);
      }
    this.setUpRealtimeSubscription();
  }
  private setPS1DataPoints(i){
    let SIEDeviceId = this.manualPowerSupplies.sie.SIEDeviceId;
    this.manualPowerSupplies.powerSupplies[i].index = i + 1;
    this.manualPowerSupplies.powerSupplies[i].CurrentReading = this.getDeviceByPointIndex(SIEDeviceId,SIUDataPointIndex.PS1_Current);
    this.manualPowerSupplies.powerSupplies[i].OverCurrentSetting = this.getDeviceByPointIndex(SIEDeviceId,SIUDataPointIndex.PS1_OverCurrentSetting);
    this.manualPowerSupplies.powerSupplies[i].OverVoltageSetting = this.getDeviceByPointIndex(SIEDeviceId,SIUDataPointIndex.PS1_OverVoltageSetting);
    this.manualPowerSupplies.powerSupplies[i].VoltageReading = this.getDeviceByPointIndex(SIEDeviceId,SIUDataPointIndex.PS1_Voltage);
    this.manualPowerSupplies.powerSupplies[i].VoltageSetting = this.getDeviceByPointIndex(SIEDeviceId,SIUDataPointIndex.PS1_VoltageSetting);

  }

  private setPS2DataPoints(i){
    let SIEDeviceId = this.manualPowerSupplies.sie.SIEDeviceId;
    this.manualPowerSupplies.powerSupplies[i].index = i + 1;
    this.manualPowerSupplies.powerSupplies[i].CurrentReading = this.getDeviceByPointIndex(SIEDeviceId,SIUDataPointIndex.PS2_Current);
    this.manualPowerSupplies.powerSupplies[i].OverCurrentSetting = this.getDeviceByPointIndex(SIEDeviceId,SIUDataPointIndex.PS2_OverCurrentSetting);
    this.manualPowerSupplies.powerSupplies[i].OverVoltageSetting = this.getDeviceByPointIndex(SIEDeviceId,SIUDataPointIndex.PS2_OverVoltageSetting);
    this.manualPowerSupplies.powerSupplies[i].VoltageReading = this.getDeviceByPointIndex(SIEDeviceId,SIUDataPointIndex.PS2_Voltage);
    this.manualPowerSupplies.powerSupplies[i].VoltageSetting = this.getDeviceByPointIndex(SIEDeviceId,SIUDataPointIndex.PS2_VoltageSetting);

  }

  private setPS3DataPoints(i){
    let SIEDeviceId = this.manualPowerSupplies.sie.SIEDeviceId;
    this.manualPowerSupplies.powerSupplies[i].index = i + 1;
    this.manualPowerSupplies.powerSupplies[i].CurrentReading = this.getDeviceByPointIndex(SIEDeviceId,SIUDataPointIndex.PS3_Current);
    this.manualPowerSupplies.powerSupplies[i].OverCurrentSetting = this.getDeviceByPointIndex(SIEDeviceId,SIUDataPointIndex.PS3_OverCurrentSetting);
    this.manualPowerSupplies.powerSupplies[i].OverVoltageSetting = this.getDeviceByPointIndex(SIEDeviceId,SIUDataPointIndex.PS3_OverVoltageSetting);
    this.manualPowerSupplies.powerSupplies[i].VoltageReading = this.getDeviceByPointIndex(SIEDeviceId,SIUDataPointIndex.PS3_Voltage);
    this.manualPowerSupplies.powerSupplies[i].VoltageSetting = this.getDeviceByPointIndex(SIEDeviceId,SIUDataPointIndex.PS3_VoltageSetting);

  }

  private setPS4DataPoints(i){
    let SIEDeviceId = this.manualPowerSupplies.sie.SIEDeviceId;
    this.manualPowerSupplies.powerSupplies[i].index = 4;
    this.manualPowerSupplies.powerSupplies[i].CurrentReading = this.getDeviceByPointIndex(SIEDeviceId,SIUDataPointIndex.PS4_Current);
    this.manualPowerSupplies.powerSupplies[i].OverCurrentSetting = this.getDeviceByPointIndex(SIEDeviceId,SIUDataPointIndex.PS4_OverCurrentSetting);
    this.manualPowerSupplies.powerSupplies[i].OverVoltageSetting = this.getDeviceByPointIndex(SIEDeviceId,SIUDataPointIndex.PS4_OverVoltageSetting);
    this.manualPowerSupplies.powerSupplies[i].VoltageReading = this.getDeviceByPointIndex(SIEDeviceId,SIUDataPointIndex.PS4_Voltage);
    this.manualPowerSupplies.powerSupplies[i].VoltageSetting = this.getDeviceByPointIndex(SIEDeviceId,SIUDataPointIndex.PS4_VoltageSetting);

  }
  private setUpRealtimeSubscription(): void {
    if (this.deviceIndexArray.length > 0) {
      this.deviceIndexArray.forEach((element) => {
        let deviceSubs = null;
        deviceSubs = this.realTimeService
          .GetRealtimeData(element.DeviceId, element.DataPointIndex)
          .subscribe((d) => {
            if (d !== undefined && d !== null) {
              element.RawValue = d.Value;
            }
            this.dataSubscriptions.push(deviceSubs);
          });
      });
    }
  }

  private detectEPScreenSize() {
    let isMobileView = window.innerWidth < 768;
    this.tablePowerSupplyWidth = isMobileView ? "60px" : "88px";
    this.tableOverVoltageSettingWidth = isMobileView ? "95px" : "124px";
    this.tableOverVoltageReadingWidth = isMobileView ? "95px" : "124px";
    this.tableVoltageReadingWidth = isMobileView ? "90px" : "118px";
    this.tableOverCurrentSettingWidth = isMobileView ? "100px" : "125px";
    this.tableCurrentReadingWidth = isMobileView ? "115px" : "130px";
  }

  private detectMMScreenSize() {
    let isMobileView = window.innerWidth < 768;
    this.tablePowerSupplyWidth = isMobileView ? "85px" : "";
    this.tableOverVoltageSettingWidth = isMobileView ? "95px" : "";
    this.tableOverVoltageReadingWidth = isMobileView ? "95px" : "";
    this.tableVoltageReadingWidth = isMobileView ? "90px" : "";
    this.tableOverCurrentSettingWidth = isMobileView ? "100px" : "";
    this.tableCurrentReadingWidth = isMobileView ? "115px" : "";
  }

  ngAfterViewInit(): void {
    if(this.manualPowerSupplies.resizeGrid)
      this.detectEPScreenSize();
    else
      this.detectMMScreenSize();
  }

  ngOnInit(): void {
    this.initDeviceDataPoints();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (this.manualPowerSupplies)
      this.setPowerSupplyValues();
  }

}
