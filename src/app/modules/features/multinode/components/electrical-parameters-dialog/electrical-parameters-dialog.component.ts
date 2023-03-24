import { AfterViewInit, Component, HostListener, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { DataPointDefinitionModel } from '@core/models/webModels/DataPointDefinition.model';
import { SieModel } from '@core/models/webModels/Sie.model';
import { MultiNodeWellDataUIModel } from '@core/models/webModels/WellDataUIModel.model';
import { ManualModePowerSupply, PowerSupplyData } from '../multinode-manual-mode/manual-mode-power-supply/manual-mode-power-supply.component';
import { DataSourceFacade } from '@core/facade/dataSourceFacade.service';
import { DeviceDataPointsFacade } from '@core/facade/deviceDataPointsFacade.service';
import { WellFacade } from '@core/facade/wellFacade.service';
import { ToolConnectionService } from '@core/services/tool-connection.service';
import { UserService } from '@core/services/user.service';
import { SIUDataPointIndex } from '@features/multinode/common/MultiNodeRegisterIndex';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { RealTimeDataSignalRService } from '@core/services/realTimeDataSignalR.service';

@Component({
  selector: 'app-electrical-parameters-dialog',
  templateUrl: './electrical-parameters-dialog.component.html',
  styleUrls: ['./electrical-parameters-dialog.component.scss']
})
export class ElectricalParametersDialogComponent extends GatewayPanelBase implements OnInit {
  sies: SieModel[] = [];
  wellsInStore: MultiNodeWellDataUIModel[] = [];
  currentSieId: number;
  currentSie: SieModel;
  currentSieWells: MultiNodeWellDataUIModel[] = [];
  manualPowerSupplies: ManualModePowerSupply;
  manualTecPowerSupplies: ManualModePowerSupply;
  deviceIndexArray: DataPointDefinitionModel[];
  chassisTemperature: DataPointDefinitionModel;
  private dataSubscriptions: Subscription[] = [];
  sieDeviceId: number = 0;
  // table widths
  tableWellWidth: string;

  constructor(public dialogRef: MatDialogRef<any>, @Inject(MAT_DIALOG_DATA) public data,
    protected store: Store,
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
    if (this.manualPowerSupplies.resizeGrid)
      this.detectEPScreenSize();
    else
      this.detectMMScreenSize();
  }
  onToggleSie(event) {
    this.setCurrentSieAndWell(event.value);
  }

  onClose() {
    this.dialogRef.close();
  }

  postCallDeviceDataPoints(): void {
    this.setPowerSupplyValues();
  }

  setCurrentSieAndWell(sieId) {
    this.currentSieId = sieId;
    this.currentSie = this.sies.find(sie => sie.Id === sieId);
    this.sieDeviceId = this.currentSie.SIEDeviceId;
    if (this.currentSie) {
      this.currentSieWells = [];
      this.manualPowerSupplies = new ManualModePowerSupply();
      this.manualTecPowerSupplies = new ManualModePowerSupply();
      let manualSupplies: ManualModePowerSupply;
      let manualPowerSupply = new ManualModePowerSupply();
      manualPowerSupply.sie = this.currentSie;
      let wellPowerSupplies = [];
      this.manualTecPowerSupplies.powerSupplies = [];
      this.currentSie.SIEWellLinks.forEach((wellLink, index) => {
        let sieWell = this.wellsInStore?.find(well => wellLink.WellId === well.WellId);
        if (sieWell) {
          let powerSupply = new PowerSupplyData();
          powerSupply.Name = "Power Supply: 0" + (index + 1);
          powerSupply.wellDeviceId = sieWell.WellDeviceId;
          powerSupply.wellName = sieWell.WellName;
          wellPowerSupplies.push(powerSupply);
          this.manualTecPowerSupplies.powerSupplies.push(powerSupply);
          this.currentSieWells.push(sieWell);
        }
      });
      // Panel level Power supply
      let panelPowerSupply = new PowerSupplyData();
      panelPowerSupply.Name = "Power Supply: 04";
      wellPowerSupplies.push(panelPowerSupply);
      manualPowerSupply.powerSupplies = wellPowerSupplies;
      manualSupplies = manualPowerSupply;
      manualSupplies.resizeGrid = true;
      this.manualPowerSupplies = manualSupplies;

    }
    this.setPowerSupplyValues();
  }
  private setPowerSupplyValues() {
    this.deviceIndexArray = [];
    this.chassisTemperature = this.getDeviceByPointIndex(this.sieDeviceId, SIUDataPointIndex.SIE_ChassisTemperature);
    if (this.manualTecPowerSupplies.powerSupplies.length == 3) {
      this.setTEC1DataPoints(0);
      this.setTEC2DataPoints(1);
      this.setTEC3DataPoints(2);
    }
    else if (this.manualTecPowerSupplies.powerSupplies.length == 2) {
      this.setTEC1DataPoints(0);
      this.setTEC2DataPoints(1);
    }
    else if (this.manualTecPowerSupplies.powerSupplies.length == 1) {
      this.setTEC1DataPoints(0);
    }
    this.setUpRealtimeSubscription();

  }
  private setTEC1DataPoints(i) {
    this.manualTecPowerSupplies.powerSupplies[i].MotorVoltage = this.getDeviceByPointIndex(this.sieDeviceId, SIUDataPointIndex.TEC1_MotorVoltage);
    this.manualTecPowerSupplies.powerSupplies[i].TECVoltage = this.getDeviceByPointIndex(this.sieDeviceId, SIUDataPointIndex.TEC1_TECVoltage);
  }

  private setTEC2DataPoints(i) {
    this.manualTecPowerSupplies.powerSupplies[i].MotorVoltage = this.getDeviceByPointIndex(this.sieDeviceId, SIUDataPointIndex.TEC2_MotorVoltage);
    this.manualTecPowerSupplies.powerSupplies[i].TECVoltage = this.getDeviceByPointIndex(this.sieDeviceId, SIUDataPointIndex.TEC2_TECVoltage);

  }

  private setTEC3DataPoints(i) {
    this.manualTecPowerSupplies.powerSupplies[i].MotorVoltage = this.getDeviceByPointIndex(this.sieDeviceId, SIUDataPointIndex.TEC3_MotorVoltage);
    this.manualTecPowerSupplies.powerSupplies[i].TECVoltage = this.getDeviceByPointIndex(this.sieDeviceId, SIUDataPointIndex.TEC3_TECVoltage);

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
  private detectEPScreenSize() {
    let isMobileView = window.innerWidth < 768;
    if (isMobileView)
      this.tableWellWidth = "85px";
  }

  private detectMMScreenSize() {
    let isMobileView = window.innerWidth < 768;
    this.tableWellWidth = isMobileView ? "85px" : "";

  }

  ngAfterViewInit(): void {
    if (this.manualPowerSupplies.resizeGrid)
      this.detectEPScreenSize();
    else
      this.detectMMScreenSize();
  }
  ngOnInit(): void {
    this.sies = this.data.sies?.filter(s => s.SIEDeviceId > 0)??[];
    this.wellsInStore = this.data.wells;
    this.setCurrentSieAndWell(this.sies[0]?.Id);
    this.initDeviceDataPoints();
  }

}
