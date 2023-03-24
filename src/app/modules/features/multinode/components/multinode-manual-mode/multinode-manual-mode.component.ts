import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, OnChanges, Input } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { RangeValidator } from '@core/customValidators/rangeValidator.validator';
import { DEFAULT_eFCV_POSITIONS_STAGES } from '@core/data/UICommon';
import { DeviceDataPointsFacade } from '@core/facade/deviceDataPointsFacade.service';
import { PanelConfigurationFacade } from '@core/facade/panelConfigFacade.service';
import { SieFacade } from '@core/facade/sieFacade.service';
import { WellFacade } from '@core/facade/wellFacade.service';
import { timebasedActuateModelSchema } from '@core/models/schemaModels/MultiNodeUIDataModel.schema';
import { eFCVDataModel } from '@core/models/webModels/eFCVDataModel.model';
import { OverridePositionModel, TimebasedActuateModel } from '@core/models/webModels/MultiNodeUIDataModel.model';
import { PositionDescriptionDataModel } from '@core/models/webModels/PositionDescriptionDataModel.model';
import { SieModel } from '@core/models/webModels/Sie.model';
import { MultiNodeWellDataUIModel } from '@core/models/webModels/WellDataUIModel.model';
import { RealTimeDataSignalRService } from '@core/services/realTimeDataSignalR.service';
import { UserService } from '@core/services/user.service';
import { ValidationService } from '@core/services/validation.service';
import { MultiNodeCommon } from '@features/multinode/common/multiNodeCommon';
import { eFCVDataPointIndex } from '@features/multinode/common/MultiNodeRegisterIndex';
import { Store } from '@ngrx/store';
import { Validator } from 'jsonschema';
import { Subscription } from 'rxjs';
import { ManualModePowerSupply, PowerSupplyData } from './manual-mode-power-supply/manual-mode-power-supply.component';

@Component({
  selector: 'multinode-manual-mode',
  templateUrl: './multinode-manual-mode.component.html',
  styleUrls: ['./multinode-manual-mode.component.scss']
})
export class MultinodeManualModeComponent extends GatewayPanelBase implements OnInit, OnDestroy, OnChanges {
  @Output() isPowerSupplyTabSelected = new EventEmitter();
  @Output() selectedSieId = new EventEmitter();
  @Output() selectedWellId = new EventEmitter();
  @Output() manualModeOperationChanged = new EventEmitter();
  @Input() isOperationInProgress: boolean;
  @Input() isSIUDisconnected: boolean;

  isPoweSupplySelected: boolean = false;
  selectedOperationMethod: string = MultiNodeCommon.TimeBasedActuation;
  selectedActuationDirection: string = MultiNodeCommon.Actuation_TowardClose;

  sies: SieModel[] = [];
  seiId: string;
  wells: MultiNodeWellDataUIModel[] = [];
  wellId: number;
  multiNodeWell: MultiNodeWellDataUIModel;
  zones: eFCVDataModel[];
  eFCVId: string;
  multiNodeeFCVStages: PositionDescriptionDataModel[];
  currentPoistion: eFCVPosition;
  overridePosition: string;
  manualPowerSupplies: ManualModePowerSupply[] = [];
  actuationTime: number;

  enableOperation: boolean = false;
  timeBasedActuationForm: FormGroup;
  disableButton: boolean = true;

  // Validation messages
  private mapErrMessages: Map<string, string> = new Map<string, string>();

  eFCVPosSubs: Subscription;

  constructor(protected store: Store,
    private router: Router,
    private panelConfigFacade: PanelConfigurationFacade,
    private wellDataFacade: WellFacade,
    protected sieFacade: SieFacade,
    private dataPointFacade: DeviceDataPointsFacade,
    private elementRef: ElementRef,
    private userService: UserService,
    private realTimeSignalRService: RealTimeDataSignalRService,
    private validationService: ValidationService,
    protected route: ActivatedRoute) {
    super(store, panelConfigFacade, wellDataFacade, null, null, dataPointFacade, null, null, null, sieFacade);

  }

  onToggle(event) {
    this.isPoweSupplySelected = event.value === "2";
    this.isPowerSupplyTabSelected.emit(this.isPoweSupplySelected);
    if (!this.isPoweSupplySelected) {
      this.selectedWellId.emit(this.multiNodeWell.WellId);
    }
  }

  onOperationChanged(event) {
    this.validate(null);
  }
  selectedSIE(selectedSieId) {
    this.selectedSieId.emit(selectedSieId);
  }

  onWellSelChange(event) {
    let inxWell = this.wellEnity.findIndex(w => w.WellId === event.value) ?? -1;
    if (inxWell != -1) {
      this.multiNodeWell = this.wells[inxWell];
      this.selectedWellId.emit(this.multiNodeWell.WellId);
      this.zones = this.multiNodeWell.Zones;
      this.sies.forEach(sie => {
        let wellsielink = sie.SIEWellLinks.find(sw => sw.WellId === this.multiNodeWell.WellId);
        if (wellsielink) {
          this.seiId = sie.SIEGuid;
        }
      });
      this.ResetFields();
    }
  }

  ResetFields() {
    this.actuationTime = null;
    this.selectedActuationDirection = MultiNodeCommon.Actuation_TowardClose;
    this.selectedOperationMethod = MultiNodeCommon.TimeBasedActuation;
    this.overridePosition = null;
    this.enableOperation = false;
    this.timeBasedActuationForm.get("ActuationTime").disable();
    this.validate(null);
  }

  onZoneSelChange(event): void {
    this.enableOperation = false;
    this.timeBasedActuationForm.get("ActuationTime").disable();
    const zone = this.zones.find(z => z.eFCVGuid === event.value);
    if (zone) {
      this.enableOperation = true;
      this.timeBasedActuationForm.get("ActuationTime").enable();
      this.eFCVId = zone.eFCVGuid;
      this.multiNodeeFCVStages = zone.PositionDescriptionData.filter(p => p.PositionStage != DEFAULT_eFCV_POSITIONS_STAGES.STAGE_NOTSET);
      if (this.eFCVPosSubs != null) {
        this.eFCVPosSubs.unsubscribe();
        this.eFCVPosSubs = null;
      }

      this.eFCVPosSubs = this.realTimeSignalRService.GetRealtimeData(zone.HcmId, eFCVDataPointIndex.Position).subscribe(data => {
        let inxPos = data.Value < 0 || data.Value > 6 ? 6 : data.Value;
        this.currentPoistion = {
          Stage: zone.PositionDescriptionData[inxPos].PositionStage,
          Description: zone.PositionDescriptionData[inxPos].Description
        }
        this.overridePosition = null;
        this.manualModeOperationChanged.emit({
          isDataValid: false,
          operationType: this.selectedOperationMethod,
          timeBasedActuation: null,
          overridePosition: null
        });
      })
    }
    this.validate(event);
  }

  onStageChange(event): void {
    this.validate(null);
  }

  converttoBoolean(value: any) {
    return JSON.parse(String(value));
  }

  validate(event): void {
    if (this.selectedOperationMethod === MultiNodeCommon.TimeBasedActuation) {
      let timeBasedActuationModel: TimebasedActuateModel = {
        SIUID: this.seiId,
        WellId: this.wellId?.toString(),
        eFCVId: this.eFCVId,
        ActuationTime: this.actuationTime * 1000, // sec to ms
        CurrentPosition: this.currentPoistion?.Stage,
        IsTowardsHome: this.selectedActuationDirection === MultiNodeCommon.Actuation_TowardClose ? true : false
      };

      const validator = new Validator();
      const result = validator.validate(timeBasedActuationModel, timebasedActuateModelSchema);
      this.manualModeOperationChanged.emit({
        isDataValid: result.valid,
        operationType: this.selectedOperationMethod,
        timeBasedActuation: timeBasedActuationModel,
        overridePosition: null
      });

      this.validateActautionTime();
    }
    else {
      let overRidePositinData: OverridePositionModel = {
        eFCVId: this.eFCVId,
        StageType: this.overridePosition
      };
      if (this.eFCVId) {
        this.manualModeOperationChanged.emit({
          isDataValid: this.overridePosition && this.currentPoistion.Stage != this.overridePosition,
          operationType: this.selectedOperationMethod,
          timeBasedActuation: null,
          overridePosition: overRidePositinData
        });
      }
    }
  }

  postCallGetWells(): void {
    this.wells = this.wellEnity.filter(Px=>Px.WellDeviceId > 0) ?? [];
    this.wells.forEach(py=>{
      let wellZones = [];
      py.Zones.forEach(pz=>{
        if(pz.HcmId>0)
          {
            wellZones.push(pz);
          }
      })
      py.Zones = wellZones;
    })
    this.sies = this.sieEntity ?? [];
    let manualSupplies: ManualModePowerSupply[] = [];
    this.sies.filter(s => s.SIEDeviceId > 0).forEach(sie => {
      let manualPowerSupply = new ManualModePowerSupply();
      manualPowerSupply.sie = sie;
      let wellPowerSupplies = [];
      sie.SIEWellLinks.forEach((wellLink, index) => {
        let sieWell = this.wells?.find(well => wellLink.WellId === well.WellId);
        if (sieWell) {
          let powerSupply = new PowerSupplyData();
          powerSupply.Name = "Power Supply: 0" + (index + 1);
          //powerSupply.wellId = sieWell.WellId;
          wellPowerSupplies.push(powerSupply);
        }
      });

      // Panel level Power supply
      let panelPowerSupply = new PowerSupplyData();
      panelPowerSupply.Name = "Power Supply: 04";
      wellPowerSupplies.push(panelPowerSupply);
      manualPowerSupply.powerSupplies = wellPowerSupplies;
      manualPowerSupply.resizeGrid = false;
      manualSupplies.push(manualPowerSupply);
    });
    this.manualPowerSupplies = manualSupplies;
  }

  postCallGetSie(): void {
    this.initWells();
  }

  private validateActautionTime() {
    let ctrl = this.timeBasedActuationForm.get("ActuationTime");
    if (ctrl) {
      if (ctrl.touched && ctrl.invalid) {
        this.mapErrMessages.set("ActuationTime", this.validationService.getValidationErrorMessage(ctrl.errors, "ActuationTime"));
      }
      else
        this.mapErrMessages.delete("ActuationTime");
    }
  }

  getError(fieldName: string) {
    return this.mapErrMessages.get(fieldName);
  }

  createFormGroup(): void {
    this.timeBasedActuationForm = new FormGroup({});
    let formControl = new FormControl('');
    let validationFn: ValidatorFn[] = [];
    validationFn.push(Validators.required);
    validationFn.push(RangeValidator.range(timebasedActuateModelSchema.properties.ActuationTime.minimum, timebasedActuateModelSchema.properties.ActuationTime.maximum / 1000)); // max range is in ms, converted to sec for UI display
    formControl.setValidators(validationFn);
    formControl.disable();
    this.timeBasedActuationForm.addControl("ActuationTime", formControl);
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  ngOnChanges(): void {
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.initSie();
    this.initDeviceDataPoints();
    this.createFormGroup();
  }
}

class eFCVPosition {
  public Stage: string;
  public Description: string;
}