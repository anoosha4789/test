import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { DataPointDefinitionModel } from '@core/models/webModels/DataPointDefinition.model';
import { SieModel } from '@core/models/webModels/Sie.model';

@Component({
  selector: 'app-manual-mode-power-supply',
  templateUrl: './manual-mode-power-supply.component.html',
  styleUrls: ['./manual-mode-power-supply.component.scss']
})
export class ManualModePowerSupplyComponent implements OnInit, OnDestroy {
  @Input()
  manualPowerSupplies: ManualModePowerSupply[];
  selectedTabIndex: number = 0;
  @Output() selectedSieId = new EventEmitter();
  constructor() { }

  ngOnDestroy(): void {
  }

  ngOnInit(): void {
    this.selectedSieId.emit(this.manualPowerSupplies[this.selectedTabIndex].sie.Id);
  }
  onTabChanged(event){
    this.selectedSieId.emit(this.manualPowerSupplies[event].sie.Id);
  }

  selectedSIE(selectedSieId){
    this.selectedSieId = selectedSieId;
  }
}

export class ManualModePowerSupply {
  sie: SieModel;
  powerSupplies: PowerSupplyData[];
  resizeGrid:boolean;
}

export class PowerSupplyData {
  Name: string;
  wellDeviceId?: number;
  wellName:string;
  index: number;
  OverVoltageSetting: DataPointDefinitionModel;
  VoltageSetting: DataPointDefinitionModel;
  VoltageReading: DataPointDefinitionModel;
  OverCurrentSetting: DataPointDefinitionModel;
  CurrentReading: DataPointDefinitionModel;
  MotorVoltage:DataPointDefinitionModel;
  TECVoltage:DataPointDefinitionModel;
  //powerSupplySettings?: ManualModePowerSupplySettings;
}

export class ManualModePowerSupplySettings {
  OverVoltageSetting: number;
  VoltageSetting: number;
  VoltageReading: number;
  OverCurrentSetting: number;
  CurrentReading: number;
}

