import { AfterViewInit, Component, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild, ContentChild, ElementRef } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { GatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { WellFacade } from '@core/facade/wellFacade.service';
import { multinodeWellSchema } from '@core/models/schemaModels/MultinodeWell.schema';
import { WellErrorNotifierModel } from '@core/models/UIModels/error-notifier-model';
import { MultiNodeWellUIModel } from '@core/models/UIModels/MultinodeWell.model';
import { MultiNodeWellDataUIModel } from '@core/models/webModels/WellDataUIModel.model';
import { ValidationService } from '@core/services/validation.service';
import { Store } from '@ngrx/store';
import { debounceTime, filter } from 'rxjs/operators';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { EFVCComponent, IefcvDialogData } from '../e-fvc/e-fvc.component';
import { ButtonActions } from '@shared/gateway-dialogs/components/gateway-advanced-dialog/gateway-advanced-dialog.component';
import { EfcvPositionsDialogComponent } from '../efcv-positions-dialog/efcv-positions-dialog.component';

//import { EfvcModel,TECModel } from '@core/models/webModels/Multinode-Efcv.model';
import { ColumnPinningPosition, IgxGridComponent, IPinningConfig } from '@infragistics/igniteui-angular';
import { eFCVDataModel, MotorSettingsDataModel } from '@core/models/webModels/eFCVDataModel.model';
import { PowerSupplySettingsDataModel, TECDataModel } from '@core/models/webModels/TECDataModel.model';
import { Subscription } from 'rxjs';
import * as _ from 'lodash';
import { MultiNodePositionDefaultsDataUIModel } from '@core/models/UIModels/MultiNodePositionDefaultsDataUI.model';
import { deleteUIModal, eFCV_POSITION_POSITION_OWNERS, UICommon } from '@core/data/UICommon';
import { DeleteOrder } from '@core/models/UIModels/models.model';
import { DeleteObjectTypesEnum } from '@core/models/webModels/DeleteObjectTypesEnum';
import { DataSourceFacade } from '@core/facade/dataSourceFacade.service';
import { TecPowerSupplyComponent } from '../tec-power-supply/tec-power-supply.component';
import { MatStepper } from '@angular/material/stepper';
import { eFCVMotorSettings_Defaults } from '@features/multinode/common/multiNodeCommon';
import { eFCVSchema } from '@core/models/schemaModels/EFCVUIModel.schema';


@Component({
  selector: 'app-multinode-well',
  templateUrl: './multinode-well.component.html',
  styleUrls: ['./multinode-well.component.scss']
})
export class MultinodeWellComponent extends GatewayPanelBase implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  eFCVData = [];
  // eFCVData : EfvcModel[];

  backBtnVisibility = true;
  delBtnVisibility = true;
  actionBtnTxt = 'Next';
  wellForm: FormGroup;
  formCtrlErrorMessage: any;
  private mapErrMessages: Map<string, string> = new Map<string, string>();

  @Output()
  wellStateEmmiter = new EventEmitter<MultiNodeWellUIModel>();
  @Output()
  stepperChangeEmitter = new EventEmitter<number>();
  @Output() isFormValidEvent = new EventEmitter();

  @Input()
  well: MultiNodeWellUIModel;
  @Input()
  selectedStepperIndex: number;
  @Input()
  wellEnities: any[];
  @Input()
  steps: any[];

  @Input()
  paneleFCVPositions: MultiNodePositionDefaultsDataUIModel;
  efcvs: eFCVDataModel[] = [];
  efcvDialogData: IefcvDialogData;
  wellData: MultiNodeWellDataUIModel;
  // wellEnities: any[];
  motorSettings: MotorSettingsDataModel
  eFCV: eFCVDataModel;
  TEC: TECDataModel;
  powerSupplyData: PowerSupplySettingsDataModel;
  tecPowerSupplyData: any;
  isTecPoweSupplySelected: boolean = false;
  columnWidth = "";
  isSmallerScreenSize = false;
  activeTabIndex = 0;
  isTecFormValid = true;
  defaultPowerSupplyData: PowerSupplySettingsDataModel = {
    MaxVoltage: 150,
    RampRate: 25,
    MaxCurrent: 250,
    SettleVoltage: 90,
    TargetVoltage: 125,
    SettleRampRate: -10
  }
  multinodeWellStepper = MultinodeWellStepper;

  private currentWellId: number;
  private currentWellIdx: number;
  private arrSubscriptions: Subscription[] = [];
  public pinningConfig: IPinningConfig = { columns: ColumnPinningPosition.End };

  @ViewChild("eFCVGrid", { static: false })
  public eFCVGrid: IgxGridComponent;
  @ViewChild('wellStepper', { static: false }) wellStepper: MatStepper;
  @ViewChild('efcvContainer', { static: false }) efcvContainer: ElementRef<HTMLDivElement>;
  @ViewChild('powerSupplyComponent', { static: false }) powerSupplyComponent: TecPowerSupplyComponent;


  get step1() {
    return this.efcvContainer;
  }

  get step2() {
    return this.powerSupplyComponent;
  }

  constructor(protected store: Store,
    protected activatedRoute: ActivatedRoute,
    private gatewayModalService: GatewayModalService,
    private dataSourceFacade: DataSourceFacade,
    private wellDataFacade: WellFacade, protected router: Router, private validationService: ValidationService) {
    super(store, null, wellDataFacade, dataSourceFacade, null, null, null, null, null);
  }
  isTecPowerSupplyFormValidEvent(isFormValid) {
    this.isTecFormValid = isFormValid;
    this.emitFormValid();
  }
  tecPowerSupplyFormInValidEvent(data) {
    // if (this.tecPowerSupplyData) {
    // 	this.tecPowerSupplyData.error = data;
    // 	}
  }
  onTecPowerSupplyFormChangeEvent(data) {
    this.tecPowerSupplyData = data.data;
    this.well.TEC.PowerSupplySettings = this.tecPowerSupplyData;
    this.well.IsDirty = true;
    this.wellStateEmmiter.emit(this.well);
  }
  onEditZone(id) {
    this.efcvDialogData.modalEditMode = true;
    let selectedeFCV = this.efcvs?.find(efcv => efcv.ZoneId === id);
    if (selectedeFCV) {
      this.efcvDialogData.efcvDetails = selectedeFCV;
      this.openZoneDialog("Edit eFCV");
    }
  }

  stepperSelectionChange(event) {
    let selectedIndex = event.selectedIndex;
    this.stepperChangeEmitter.emit(selectedIndex);
  }

  public onDeleteZone(rowIndex: number, rowID: number) {
    if (rowIndex >= 0) {
      const zoneName = this.eFCVGrid.getRowByIndex(rowIndex).cells.find((cell) => cell.column.field === 'ZoneName').value;
      let toolConnections = this.toolConnectionEntity.filter(t => t.WellId === this.well.WellId && t.ZoneId === rowID) ?? [];
      if (toolConnections.length > 0) {
        this.gatewayModalService.openDialog(
          `${zoneName} is associated with a tool(s).<br>Delete the associated tool(s) before deleting the eFCV.</br>`,
          () => this.gatewayModalService.closeModal(),
          null,
          'Warning',
          null,
          false,
          "Ok"
        );
      } else {
        this.gatewayModalService.openDialog(
          `Do you want to delete eFCV '${zoneName}'?`,
          () => this.deleteZone(rowID),
          () => this.gatewayModalService.closeModal(),
          deleteUIModal.title,
          null,
          true,
          deleteUIModal.primaryBtnText,
          deleteUIModal.secondaryBtnText
        );
      }
    }
  }

  private deleteZone(zoneId: number): void {
    let inxZone = this.efcvs.findIndex(z => z.ZoneId === zoneId) ?? -1;
    if (inxZone != -1) {
      let zoneName = this.efcvs[inxZone].ZoneName;
      UICommon.deletedObjects.push({
        deleteOrder: DeleteOrder.eFCV,
        id: zoneId,
        parentId: this.well.WellId,
        name: zoneName,
        data: this.efcvs[inxZone],
        objectType: DeleteObjectTypesEnum.eFCV
      });
      this.efcvs.splice(inxZone, 1);
      this.eFCVGrid.notifyChanges(true);
      this.well.Zones = this.efcvs;
      this.well.IsDirty = true;
      this.wellStateEmmiter.emit(this.well);
    }
    // this.setActionBtnStatus();
    this.closeDialog();
  }


  onAddeFCVBtnClick() {
    this.efcvDialogData.modalEditMode = false;
    let Id: number;
    this.efcvDialogData.efcvDetails = new eFCVDataModel();
    if (this.efcvs.length === 0) {
      Id = -1;
    } else {
      const preveFCVId = this.efcvs[this.efcvs.length - 1].ZoneId;
      Id = preveFCVId > 0 ? -(preveFCVId + 1) : (preveFCVId - 1);
    }
    const efCVNameId = Math.abs(Id);
    this.efcvDialogData.efcvDetails.ZoneId = Id;
    let nextAddress = this.efcvs?.length > 0 ? this.getNextAddress() : this.efcvs?.length + 2;
    // count = this.getCount(count);
    this.efcvDialogData.efcvDetails.ZoneName = nextAddress ? `eFCV ${nextAddress}` : "";
    this.efcvDialogData.efcvDetails.Address = nextAddress + '';
    // this.efcvDialogData.efcvDetails.eFCVPositions = this.well.eFCVPositions;
    let PositionDescriptionData = _.cloneDeep(this.well.PositionDescriptionData);
    PositionDescriptionData?.forEach(descriptionData => {
      descriptionData.idPositionOwner = eFCV_POSITION_POSITION_OWNERS.eFCV;
      descriptionData.Id = -1;
    });
    this.efcvDialogData.efcvDetails.PositionDescriptionData = PositionDescriptionData;
    this.efcvDialogData.efcvDetails.MotorSettings = {
      MaxVoltage: eFCVMotorSettings_Defaults.MaxVoltage,
      MaxCurrent: eFCVMotorSettings_Defaults.MaxCurrent,
      TargetVoltage: eFCVMotorSettings_Defaults.TargetVoltage,
      OverCurrentThreshold: eFCVMotorSettings_Defaults.OverCurrentThreshold,
      OverCurrentOverrideFlag: eFCVMotorSettings_Defaults.OverCurrentOverrideFlag,
      DutyCycle: eFCVMotorSettings_Defaults.DutyCycle
    }
    this.openZoneDialog('Add New eFCV');
  }

  getNextAddress() {
    /* let count = this.efcvs?.findIndex(efc => efc.Address === c + "") === -1 ? c : c + 1;
    if (this.efcvs?.findIndex(efc => efc.Address === count + "") !== -1) {
      this.getCount(count);
    } */
    let maxEFCVAddress = eFCVSchema.properties.eFCVAddress.maxValue;
    let zones = _.cloneDeep(this.efcvs);
    zones.sort((c1, c2) => Number(c1.Address) - Number(c2.Address));
    let address = Number(zones[zones.length - 1].Address);
    return address === maxEFCVAddress ? null : address + 1;
  }

  openZoneDialog(title: string): void {
    this.efcvDialogData.efcvList = this.efcvs;
    this.efcvDialogData.wellList = this.wellEnities;
    this.efcvDialogData.currentWell = this.well;
    this.gatewayModalService.openAdvancedDialog(
      title,
      ButtonActions.None,
      EFVCComponent,
      this.efcvDialogData,
      (result) => {
        if (result) {
          this.createOrUpdateEfCV(result);
          this.closeDialog();
        } else {
          this.closeDialog();
        }
        this.emitFormValid();
      },
      '735px',
      null,
      null,
      null
    );
  }

  showeFCVPositionDialog() {
    const dialogData = { well: this.well, paneleFCVPositions: this.paneleFCVPositions }
    this.gatewayModalService.openAdvancedDialog(
      'Edit eFCV Positions for ' + this.well.WellName,
      ButtonActions.None,
      EfcvPositionsDialogComponent,
      dialogData,
      (result) => {
        if (result) {
          this.updateeFCVPosition(result);
          this.gatewayModalService.closeModal();
        }
      },
      "426px",
      null,
      null,
      null
    );
  }

  private updateeFCVPosition(eFCVPositionState) {
    if (eFCVPositionState && eFCVPositionState.isDirty) {
      // this.store.dispatch(eFCV_POSITION_SETTINGS_STATE_ACTIONS.UPDATE_eFCV_POSITION_SETTINGS({ eFCVPositionState: eFCVPositionState }));
      /*  this.well.eFCVPositions = _.cloneDeep(eFCVPositionState.eFCVPositionSettings);
       this.well.Zones.forEach(efcv => {
         efcv.eFCVPositions = _.cloneDeep(eFCVPositionState.eFCVPositionSettings);
       }); */
      this.well.PositionDescriptionData = _.cloneDeep(eFCVPositionState.eFCVPositionSettings.PositionDescriptionData);
      this.well.Zones.forEach(efcv => {
        efcv.PositionDescriptionData = _.cloneDeep(eFCVPositionState.eFCVPositionSettings.PositionDescriptionData);
      });
      this.well.IsDirty = true;
      this.wellStateEmmiter.emit(this.well);
    }
  }


  createOrUpdateEfCV(efcv: eFCVDataModel) {
    const index = this.efcvs.findIndex(z => z.ZoneId === efcv.ZoneId);
    if (index === -1) {  // New  Zone added
      this.motorSettings = new MotorSettingsDataModel();
      this.motorSettings.MaxCurrent = efcv.MotorSettings.MaxCurrent;
      this.motorSettings.DutyCycle = efcv.MotorSettings.DutyCycle;
      this.motorSettings.MaxVoltage = efcv.MotorSettings.MaxVoltage;
      this.motorSettings.OverCurrentOverrideFlag = efcv.MotorSettings.OverCurrentOverrideFlag;
      this.motorSettings.OverCurrentThreshold = efcv.MotorSettings.OverCurrentThreshold;
      this.motorSettings.TargetVoltage = efcv.MotorSettings.TargetVoltage;
      this.eFCVGrid.addRow(efcv);
    } else {
      this.eFCVGrid.updateRow(efcv, efcv.ZoneId);
    }
    this.well.Zones = this.efcvs;
    this.well.IsDirty = true;
    this.wellStateEmmiter.emit(this.well);
    // this.setActionBtnStatus();
    this.closeDialog();
  }


  closeDialog() {
    this.gatewayModalService.closeModal();
  }
  onToggle(event) {
    this.isTecPoweSupplySelected = event.value === "2";
  }
  validateFormControls() {
    this.setFormControlStatus();
    this.emitFormValid();
  }

  getCtrlErrorMsg(ctrlName: string, ctrl: AbstractControl) {
    let errorMsg = '';
    this.wellForm.markAllAsTouched();
    if (ctrl && ctrl.touched && ctrl.invalid) {
      ctrl.markAsTouched();
      errorMsg = this.validationService.getValidationErrorMessage(ctrl.errors, ctrlName);
      this.mapErrMessages.set(ctrlName, errorMsg);
    } else {
      this.mapErrMessages.delete(ctrlName);
    }
    return errorMsg;
  }

  setWellFormData() {
    this.wellForm.patchValue({
      WellId: this.well.WellId,
      WellName: this.well.WellName,
      WellType: this.well.WellType,
    });
    this.efcvs = this.well.Zones ?? this.efcvs;
    this.well.TEC.WellId = this.well.WellId;
    this.tecPowerSupplyData = this.well.TEC && this.well.TEC.PowerSupplySettings ? this.well.TEC.PowerSupplySettings : this.defaultPowerSupplyData;
    this.subscribeToFormChanges();
    // this.validateOnInit();
    //this.setActiveTab();
  }


  private setFormControlStatus() {
    Object.keys(this.wellForm.controls).forEach(key => {
      this.getCtrlErrorMsg(key, this.wellForm.controls[key]);
    });
    this.formCtrlErrorMessage = [];
    this.well.Error = null;
    for (let [key, value] of this.mapErrMessages) {
      this.setWellErrorMsg(value);
      this.formCtrlErrorMessage[key] = value;
    }
  }

  setWellErrorMsg(errorMsg) {
    const error: WellErrorNotifierModel[] = [
      {
        tabName: this.well.currentWellName,
        path: this.router.url,
        errors: [
          {
            name: this.well.WellName,
            value: `Well Name : ${errorMsg}`
          }
        ],
        wellId: this.well.WellId,
        wellName: this.well.currentWellName
      }
    ];
    this.well.Error = error;
  }


  createFormGroup() {
    this.wellForm = new FormGroup({});
    for (const property in multinodeWellSchema.properties) {

      if (multinodeWellSchema.properties.hasOwnProperty(property)) {
        const formControl = new FormControl('');
        const validationFn: ValidatorFn[] = [];
        if (multinodeWellSchema.required.includes(property)) {

          validationFn.push(Validators.required);
          let prop = multinodeWellSchema.properties[property];
          // Minimum Length
          if (prop.minLength) {
            validationFn.push(Validators.minLength(prop.minLength));
          }
          // Max Length
          if (prop.maxLength) {
            validationFn.push(Validators.maxLength(prop.maxLength));
          }
          // Alphanumeric characters only
          if (prop.pattern) {
            validationFn.push(Validators.pattern(prop.pattern));
          }
          // Special Cases
          if (property === 'WellName') {
            let wellId = this.currentWellId ? this.currentWellId : this.well?.WellId;
            validationFn.push(this.wellDataFacade.wellNameValidator(wellId));
          }
          formControl.setValidators(validationFn);
          this.wellForm.addControl(property, formControl);


        }
      }
    }
    setTimeout(() => {
      this.validateFormControls();
    }, 0)
  }

  private subscribeToFormChanges() {
    this.wellForm.valueChanges.pipe(debounceTime(200)).subscribe((val) => {
      if (!this.wellForm.pristine) {
        this.well.IsDirty = true;
        this.validateFormControls();
        this.wellStateEmmiter.emit(this.well);
      }
    });
  }

  emitFormValid() {
    this.isFormValidEvent.emit(this.wellForm?.valid && this.well.Zones?.length > 0 && this.isTecFormValid);
  }

  @HostListener("window:resize", [])
  public onResize() {
    this.detectScreenSize();
  }

  public ngAfterViewInit() {
    this.detectScreenSize();
  }

  private detectScreenSize() {
    this.isSmallerScreenSize = window.innerWidth < 1180;
    this.columnWidth = this.isSmallerScreenSize ? "99px" : "";
  }

  setEfcvDialogData() {
    this.efcvDialogData = {
      efcvDetails: new eFCVDataModel(),
      modalEditMode: false,
      efcvList: this.efcvs,
      wellId: this.well.WellId,
      wellList: this.wellEnities,
      currentWell: this.well
    };
  }


  ngOnDestroy(): void {
    if (this.arrSubscriptions != null && this.arrSubscriptions.length > 0) {
      this.arrSubscriptions.forEach((subscription) => {
        if (subscription != null) {
          subscription.unsubscribe();
          subscription = null;
        }
      });
    }
    super.ngOnDestroy();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.selectedStepperIndex >= 0 && this.wellStepper) {
      this.wellStepper.selectedIndex = this.selectedStepperIndex;
    }
  }

  ngOnInit(): void {
    this.initToolConnections();
    this.createFormGroup();
    this.setEfcvDialogData();
    this.setWellFormData();
    this.emitFormValid();

  }
}

export enum MultinodeWellStepper {
  eFCV = 0,
  TEC_POWER_SUPPLY
}