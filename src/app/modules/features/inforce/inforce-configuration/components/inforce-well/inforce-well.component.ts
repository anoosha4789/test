import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { IgxGridComponent } from '@infragistics/igniteui-angular';
import { forkJoin, Observable, Subscription } from 'rxjs';

import { Store } from '@ngrx/store';

import { PanelConfigurationFacade } from '@core/facade/panelConfigFacade.service';
import { WellFacade } from '@core/facade/wellFacade.service';
import { DataSourceFacade } from '@core/facade/dataSourceFacade.service';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { IWellArchitecture, WellService, INFORCE_WELL_ARCHITECTURE as WELL_ARCHITECTURE, ZONE_VALVE_TYPE, INFORCE_WELL_ARCHITECTURE } from '@core/services/well.service';
import { GatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { InforcePanelUIModel } from '@core/models/UIModels/inforce-panel-config-common.model';
import { InforceZoneDialogComponent, IZoneDialogData } from '../inforce-zone-dialog/inforce-zone-dialog.component';
import { ButtonActions } from '@shared/gateway-dialogs/components/gateway-advanced-dialog/gateway-advanced-dialog.component';
import { InforceZoneUIModel } from '@core/models/UIModels/InforceZone.model';
import { deleteUIModal, FLOWMETER_TRASMITTER_TYPE, PANEL_ROUTES, UICommon } from '@core/data/UICommon';
import { IZoneValveType } from '@core/models/UIModels/ValveType.model';
import { InforceWellUIModel } from '@core/models/UIModels/InforceWell.model';
import { ActivatedRoute, Router } from '@angular/router';
import { inforceWellSchema } from '@core/models/schemaModels/InFORCEWellDataUIModel.schema';
import { ValidationService } from '@core/services/validation.service';
import { WellErrorNotifierModel } from '@core/models/UIModels/error-notifier-model';
import { cloneDeep as _cloneDeep } from 'lodash';
import { UtilityService } from '@core/services/utility.service';
import { GatewayAlertModel } from '@shared/gateway-components/gw-alert/gw-alert.component';
import { PanelToLineMappingModel } from '@core/models/webModels/PanelToLineMapping.model';
import { LineToZoneMappingModel } from '@core/models/webModels/LineToZoneMapping.model';
import { debounceTime } from 'rxjs/operators';
import { IShiftDefaultState, initialShiftDefaultState } from '@store/state/shift-default.state';
import { ShiftDefaultUIModel } from '@core/models/UIModels/shift-default.model';
import { StateUtilities } from '@store/state/IState';
import * as PANEL_DEFAULT_ACTIONS from '@store/actions/panel-default.action';
import * as SHIFT_DEFAULT_ACTIONS from '@store/actions/shift-default.action';
import { IShiftSettingsDialogData, ShiftSettingsDialogComponent } from '../shift-settings-dialog/shift-settings-dialog.component';
import * as _ from 'lodash';
import { WellTypeEnum } from '@core/models/webModels/WellDataUIModel.model';
import { DeleteOrder } from '@core/models/UIModels/models.model';
import { DeleteObjectTypesEnum } from '@core/models/webModels/DeleteObjectTypesEnum';
import { IPanelDefaultState } from '@store/state/panel-default.state';
import { PanelDefaultUIModel } from '@core/models/UIModels/panel-default.model';
import { DataLoggerFacade } from '@core/facade/dataLoggerFacade.service';
@Component({
  selector: 'gw-inforce-well',
  templateUrl: './inforce-well.component.html',
  styleUrls: ['./inforce-well.component.scss']
})

export class InforceWellComponent extends GatewayPanelBase implements OnInit, OnDestroy {

  @ViewChild('zoneGrid', { static: false }) zoneGrid: IgxGridComponent;

  backBtnVisibility = true;
  delBtnVisibility = true;
  shiftBtnVisibility = true;
  outputSelVisibility = true;
  outputAvailability = true;
  suresensWellArchSelected = false;
  isLeavingWorkflow = true;
  actionBtnDisabled = true;
  isWellCreated = false;
  activeTabIndex = 0;
  totalTabCount = 2;
  hydraulicOutput: number;
  wellRoutePath = `${PANEL_ROUTES.INFORCE_CONFIGURATION}/well`;
  actionBtnTxt = 'Create Well';
  wellName = 'New Well';
  selArchitectId: number;
  selNumOfOutput: number;
  private nextWellId: number;
  private prevWellId: number;
  private currentWellId: number;
  private currentWellIdx: number;
  well: InforceWellUIModel;
  formCtrlErrorMessage: any;
  private mapErrMessages: Map<string, string> = new Map<string, string>();
  architectureList: IWellArchitecture[];
  zoneDialogData: IZoneDialogData;
  outputList: number[] = [];
  zones: InforceZoneUIModel[] = [];
  valveTypeList: IZoneValveType[] = [];
  isOutputMappingValid = true;
  isInValidZoneMapping: boolean = false;
  zoneDetailsFormValid = true;
  alertDetail: GatewayAlertModel;
  private arrSubscriptions: Subscription[] = [];
  shiftDefaultState$: Observable<IShiftDefaultState>;
  panelDefaultState$: Observable<IPanelDefaultState>;
  panelLevelShiftDefaultData: ShiftDefaultUIModel;
  isFlowmeterTransmitterNone: boolean = false;
  private zonemapErrMessages: Map<string, string> = new Map<string, string>();

  wellForm: FormGroup;

  constructor(protected router: Router,
    protected activatedRoute: ActivatedRoute,
    protected store: Store<{ shiftDefaultState: IShiftDefaultState; }>,
    private panelConfigFacade: PanelConfigurationFacade,
    private wellDataFacade: WellFacade,
    private dataSourceFacade: DataSourceFacade,
    private wellService: WellService,
    private gwModalService: GatewayModalService,
    private utilityService: UtilityService,
    dataLoggerFacade: DataLoggerFacade,
    private validationService: ValidationService) {
    super(store, panelConfigFacade, wellDataFacade, dataSourceFacade, null, null, null, null, dataLoggerFacade);
    this.shiftDefaultState$ = this.store.select<IShiftDefaultState>((state) => state.shiftDefaultState);
    this.panelDefaultState$ = this.store.select<IPanelDefaultState>((state: any) => state.panelDefaultState);
  }

  private subscribeToPanelDefault(): void {
    const subscription = this.panelDefaultState$.subscribe(
      (state: IPanelDefaultState) => {
        if (state !== undefined) {
          if (state.isLoaded === false && !StateUtilities.hasErrors(state)) {
            this.store.dispatch(PANEL_DEFAULT_ACTIONS.LOAD_PANEL_DEFAULTS());
          } else {
            let panelDefaultData = state.panelDefaults;
            this.isFlowmeterTransmitterNone = panelDefaultData.FlowMeterTransmitterType === FLOWMETER_TRASMITTER_TYPE.None;
          }
        }
      }
    );
    this.arrSubscriptions.push(subscription);
  }

  onTabChanged(event) {
    if (this.currentWellIdx != -1) {
      this.updateWellState();
    }
    this.setUpActionButtons();
  }

  onArchSelChange(event) {
    this.selArchitectId = event.value;
    this.setDefOutputList();
    this.suresensWellArchSelected = this.selArchitectId === WELL_ARCHITECTURE.SURESENS ? true : false;
    this.zoneDialogData.valveTypes = this.filterValTypeByWellArch();
    this.zoneDialogData.wellArchId = this.selArchitectId;
    this.wellForm.patchValue({ ControlArchitectureId: this.selArchitectId });
    // SureSENS well 
    if (this.selArchitectId === WELL_ARCHITECTURE.SURESENS) {
      this.wellForm.patchValue({ NumberOfOutputs: 0 });
      this.zoneDialogData.numberOfOutput = 0;
    } else {
      this.zoneDialogData.numberOfOutput = this.selNumOfOutput;
    }
    this.deleteAllZones();
    this.setActionBtnStatus();
  }

  onOutputSelChange(event) {
    this.selNumOfOutput = Number(event.value);
    this.setActionBtnStatus();
    this.zoneDialogData.numberOfOutput = this.selNumOfOutput;
    this.wellForm.patchValue({
      NumberOfOutputs: this.selNumOfOutput,
    });
  }
  setNoOutputsAvailable(wellType, availOutputCount) {
    if (!(availOutputCount < 0)) this.outputList.push(availOutputCount);
    this.outputAvailability = false;
    this.alertDetail = {
      Type: 'error',
      IconType: 'error',
      content: wellType + ' Well Architecture requires a minimum of 2 outputs.',
      cusomClass: false
    }
  }
  setDefOutputList() {
    this.outputSelVisibility = true;
    this.outputAvailability = true;
    let availOutputCount = this.wellEnity.length > 0 ? (this.well.NumberOfOutputs ?? this.getOutputLimit()) : this.hydraulicOutput;
    this.outputList = [];
    if (this.selArchitectId === WELL_ARCHITECTURE.N_PlUS_ONE) { // N+1 Architecture
      if (availOutputCount >= 2) {
        for (let i = 2; i <= availOutputCount; i++) {
          this.outputList.push(i);
        }
      } else {
        this.setNoOutputsAvailable("N+1", availOutputCount);
      }
    } else if (this.selArchitectId === WELL_ARCHITECTURE.TWO_N) { // 2N Architecture
      if (availOutputCount >= 2) {
        for (let i = 2; i <= availOutputCount; i++) {
          if (i % 2 === 0) this.outputList.push(i);
        }
      } else {
        this.setNoOutputsAvailable("2N", availOutputCount);
      }
    } else {
      this.outputSelVisibility = false;
    }
    this.selNumOfOutput = this.well.NumberOfOutputs ?? (this.outputList[0] ?? 0);
  }

  getOutputLimit() {
    const usedOutputCount = this.wellEnity.reduce((count, well) => (well as InforceWellUIModel).NumberOfOutputs + count, 0);
    return this.hydraulicOutput - usedOutputCount;
  }

  postCallGetPanelConfigurationCommon(): void {
    this.hydraulicOutput = (this.panelConfigurationCommonState.panelConfigurationCommon as InforcePanelUIModel).HydraulicOutputs;
    if (this.architectureList) {
      this.setDefOutputList();
    }
  }

  fetchWellArchandValveTypeData(): Observable<any[]> {
    let responseWellArch = this.wellService.getWellArchitectureList();
    let responseValvetype = this.wellService.getZoneValveTypesList()
    return forkJoin([responseWellArch, responseValvetype]);
  }

  // Well Architecture List
  setWellArchList(data) {
    if (data) {
      this.architectureList = data;
      this.selArchitectId = this.well.ControlArchitectureId ?? WELL_ARCHITECTURE.N_PlUS_ONE;
      if (this.hydraulicOutput) {
        this.setDefOutputList();
      }
    }
  }

  // Well Valve Type List
  setValveTypesList(data) {
    if (data) {
      this.valveTypeList = data;
      this.zoneDialogData = {
        zoneDetails: new InforceZoneUIModel(),
        valveTypes: this.filterValTypeByWellArch(),
        modalEditMode: false,
        zoneList: this.zones,
        wellArchId: this.well.ControlArchitectureId ?? this.selArchitectId,
        numberOfOutput: this.well.NumberOfOutputs ?? this.selNumOfOutput,
        wellId: this.well.WellId
      };
    }
  }

  filterValTypeByWellArch() {
    let valveTypeList = [];
    switch (this.selArchitectId) {
      case WELL_ARCHITECTURE.N_PlUS_ONE:
        valveTypeList = this.valveTypeList.filter((valveType) => valveType.Id !== ZONE_VALVE_TYPE.eHCM_P && valveType.Id !== ZONE_VALVE_TYPE.HCM_S);
        break;

      case WELL_ARCHITECTURE.TWO_N:
        valveTypeList = this.valveTypeList.filter((valveType) => valveType.Id !== ZONE_VALVE_TYPE.eHCM_P && valveType.Id !== ZONE_VALVE_TYPE.HCM_A);
        break;

      default:
        valveTypeList = this.valveTypeList;
        break;
    }
    return valveTypeList;
  }

  onShiftSettingsBtnClick() {
    this.openShiftSettingsDialog();
  }

  openShiftSettingsDialog(): void {
    const dialogData: IShiftSettingsDialogData = {
      applyButtonText: 'Set at Well Level',
      defaultShiftSettingsTitle: 'Use Panel Level Shift settings',
      customShiftSettingsTitle: 'Use Custom Well Level Shift Settings',
      parentShiftSettings: this.panelLevelShiftDefaultData,
      shiftSettings: {
        ShiftMethod: this.well.ShiftMethod,
        ReturnsBasedShiftDefaults: this.well.ReturnsBasedShiftDefaults,
        TimeBasedShiftDefaults: this.well.TimeBasedShiftDefaults,
      },
      isParentLevelShiftDefaultApplied: this.well.IsPanelLevelShiftDefaultApplied,
      showHCMSSleeveSettings: this.selArchitectId === INFORCE_WELL_ARCHITECTURE.TWO_N,
      isFlowmeterTransmitterNone: this.isFlowmeterTransmitterNone
    };
    this.gwModalService.openAdvancedDialog(
      'Well Level Shift Settings',
      ButtonActions.None,
      ShiftSettingsDialogComponent,
      dialogData,
      (result) => {
        if (result) {
          const shiftDefaultData: ShiftDefaultUIModel = result.shiftDefaultData;
          this.well.ShiftMethod = shiftDefaultData.ShiftMethod;
          this.well.ReturnsBasedShiftDefaults = shiftDefaultData.ReturnsBasedShiftDefaults;
          this.well.TimeBasedShiftDefaults = shiftDefaultData.TimeBasedShiftDefaults;
          this.well.IsPanelLevelShiftDefaultApplied = result.isParentLevelShiftDefaultApplied;
          this.zones.forEach(zone => {
            if (zone.IsWellLevelShiftDefaultApplied) {
              zone.ShiftMethod = this.well.ShiftMethod;
              zone.ReturnsBasedShiftDefaults = this.well.ReturnsBasedShiftDefaults;
              zone.TimeBasedShiftDefaults = this.well.TimeBasedShiftDefaults;
            }
          });
          this.well.IsDirty = true;
          this.closeDialog();
        } else {
          this.closeDialog();
        }
      },
      '900px',
      null,
      this.selArchitectId === INFORCE_WELL_ARCHITECTURE.TWO_N ? '650px' : '585px',
      null
    );
  }

  onAddZoneBtnClick() {
    this.zoneDialogData.modalEditMode = false;
    let zoneId: number;
    this.zoneDialogData.zoneDetails = new InforceZoneUIModel();
    if (this.zones.length === 0) {
      zoneId = -1;
    } else {
      const prevZoneId = this.zones[this.zones.length - 1].ZoneId;
      zoneId = prevZoneId > 0 ? -(prevZoneId + 1) : (prevZoneId - 1);
    }
    const zoneNameId = Math.abs(zoneId);
    this.zoneDialogData.zoneDetails.ZoneId = zoneId;
    this.zoneDialogData.zoneDetails.ZoneName = this.zones && this.zones.findIndex(z => z.ZoneName === `Zone ${zoneNameId}`) === -1 ? `Zone ${zoneNameId}` : `Zone ${zoneNameId + 1}`;
    this.openZoneDialog('New Zone');
  }

  openZoneDialog(title: string): void {
    this.zoneDialogData.zoneList = this.zones;
    this.gwModalService.openAdvancedDialog(
      title,
      ButtonActions.None,
      InforceZoneDialogComponent,
      this.zoneDialogData,
      (result) => {
        if (result) {
          this.createOrUpdateZone(result);
          this.closeDialog();
        } else {
          this.closeDialog();
        }
      },
      '500px',
      null,
      null,
      null
    );
  }

  onEditZone(zoneId) {
    const selectedZone: InforceZoneUIModel = this.zones.find(z => z.ZoneId === zoneId);
    this.zoneDialogData.zoneDetails = selectedZone;
    this.zoneDialogData.modalEditMode = true;
    this.openZoneDialog(selectedZone.ZoneName);
  }

  createOrUpdateZone(zone: InforceZoneUIModel) {
    const index = this.zones.findIndex(z => z.ZoneId === zone.ZoneId);
    if (index === -1) {  // New  Zone added
      if (this.well.IsPanelLevelShiftDefaultApplied) {
        zone.ShiftMethod = this.panelLevelShiftDefaultData.ShiftMethod;
        zone.ReturnsBasedShiftDefaults = this.panelLevelShiftDefaultData.ReturnsBasedShiftDefaults;
        zone.TimeBasedShiftDefaults = this.panelLevelShiftDefaultData.TimeBasedShiftDefaults;
      } else {
        zone.ShiftMethod = this.well.ShiftMethod;
        zone.ReturnsBasedShiftDefaults = this.well.ReturnsBasedShiftDefaults;
        zone.TimeBasedShiftDefaults = this.well.TimeBasedShiftDefaults;
      }
      zone.IsWellLevelShiftDefaultApplied = true;
      this.zoneGrid.addRow(zone);
    } else {
      const zoneToUpdate = this.zones[index];
      zoneToUpdate.ZoneName = zone.ZoneName;
      zoneToUpdate.ValveType = zone.ValveType;
      zoneToUpdate.NumberOfPositions = zone.NumberOfPositions;
      zoneToUpdate.MeasuredDepth = zone.MeasuredDepth;
      this.zoneGrid.updateRow(zoneToUpdate, zone.ZoneId);
    }
    this.well.Zones = this.zones;
    this.well.IsDirty = true;
    this.setActionBtnStatus();
    if (this.suresensWellArchSelected) {
      this.setUpActionButtons();  // Update in case of SureSENS well
    }
    this.closeDialog();
  }

  public onDeleteZone(rowIndex: number, rowID: number) {
    if (rowIndex >= 0) {
      const zoneName = this.zoneGrid.getRowByIndex(rowIndex).cells.find((cell) => cell.column.field === 'ZoneName').value;
      let toolConnections = this.toolConnectionEntity.filter(t => t.WellId === this.well.WellId && t.ZoneId === rowID) ?? [];
      if (toolConnections.length > 0) {
        this.gwModalService.openDialog(
          `${zoneName} is associated with a tool(s).<br>Delete the associated tool(s) before deleting the zone.</br>`,
          () => this.gwModalService.closeModal(),
          null,
          'Warning',
          null,
          false,
          "Ok"
        );
      } else {
        this.gwModalService.openDialog(
          `Do you want to delete zone '${zoneName}'?`,
          () => this.deleteZone(rowID),
          () => this.gwModalService.closeModal(),
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
    let inxZone = this.zones.findIndex(z => z.ZoneId === zoneId) ?? -1;
    if (inxZone != -1) {
      let zoneName = this.zones[inxZone].ZoneName;
      UICommon.deletedObjects.push({
        deleteOrder: DeleteOrder.Zone,
        id: zoneId,
        parentId: this.well.WellId,
        name: zoneName,
        data: this.zones[inxZone],
        objectType: DeleteObjectTypesEnum.Zone
      });
      this.zones.splice(inxZone, 1);
      this.zoneGrid.notifyChanges(true);
    }
    this.setActionBtnStatus();
    this.closeDialog();
  }

  private deleteAllZones(): void {
    let zonesToDelete = _.cloneDeep(this.zones);
    zonesToDelete.forEach(zone => {
      let inxZone = this.zones.findIndex(z => z.ZoneId === zone.ZoneId) ?? -1;
      if (inxZone != -1) {
        this.zones.splice(inxZone, 1);
      }
    });
    this.zoneGrid.notifyChanges(true);
    this.zones = [];
  }

  private deleteWell(): void {
    this.wellDataFacade.deleteWell(this.well.WellId);
    if (isNaN(this.nextWellId) && isNaN(this.prevWellId)) {
      this.setNavigation();
    }
    else {
      if (!isNaN(this.nextWellId)) {
        this.router.navigate([this.wellRoutePath, this.nextWellId]);
      }
      else {
        this.router.navigate([this.wellRoutePath, this.prevWellId]);
      }
    }
  }

  setNavigation() {
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate([this.wellRoutePath]);
    this.isLeavingWorkflow = GatewayPanelBase.ShowNavigation ? true : false;
    if (this.wellEnity.length === 0 && !this.isLeavingWorkflow) {
      this.utilityService.setForwardStepper(0);
    }
  }

  onDeleteBtnClick() {

    let toolConnections = this.toolConnectionEntity.filter(t => t.WellId === this.well.WellId) ?? [];
    let dataLoggers = this.dataLoggerEntity.filter(t => t.WellId === this.well.WellId && t.IsDeleted == 0) ?? [];
    if (toolConnections.length > 0) {
      this.gwModalService.openDialog(
        `${this.well.WellName} is associated with a tool(s).<br>Delete the associated tool(s) before deleting the well.</br>`,
        () => this.gwModalService.closeModal(),
        null,
        'Warning',
        null,
        false,
        "Ok"
      );
    } else if (dataLoggers.length > 0) {
      this.gwModalService.openDialog(
        `${this.well.WellName} is associated with a Data Logger(s).<br>Delete the associated Data Logger(s) before deleting the well.</br>`,
        () => this.gwModalService.closeModal(),
        null,
        'Warning',
        null,
        false,
        "Ok"
      );
      return;
    }
    else {
      this.gwModalService.openDialog(
        `Do you want to delete well '${this.well.WellName}'?`,
        () => {
          this.gwModalService.closeModal();
          this.deleteWell();
        },
        () => this.gwModalService.closeModal(),
        deleteUIModal.title,
        null,
        true,
        deleteUIModal.primaryBtnText,
        deleteUIModal.secondaryBtnText
      );
    }
  }

  closeDialog() {
    this.gwModalService.closeModal();
  }

  onBackBtnClick() {
    this.setPreTabNavigation();
  }

  onSaveorNextBtnClick() {
    this.updateWellState();
    this.setNextTabNavigation();
  }

  private setPreTabNavigation(isDelFlowmeter?: boolean) {
    if (this.activeTabIndex > 0) {
      this.activeTabIndex -= 1;
    } else {
      if (this.prevWellId) {
        this.router.navigate([this.wellRoutePath, this.prevWellId]);
      } else {
        this.isLeavingWorkflow = false;
        this.router.navigateByUrl(`${PANEL_ROUTES.INFORCE_CONFIGURATION}/general`);
      }
    }
  }

  private setNextTabNavigation() {
    const totalTabCount = this.getTotalTabCount();
    if (this.activeTabIndex === (totalTabCount - 1)) {
      if (isNaN(this.nextWellId)) {
        this.router.navigateByUrl(`${PANEL_ROUTES.INFORCE_CONFIGURATION}/dashboard`);
      } else {
        this.router.navigate([this.wellRoutePath, this.nextWellId]);
      }
    } else {
      this.isWellCreated = true;
      this.activeTabIndex++;
    }
    this.isLeavingWorkflow = false;
  }

  validateOnInit() {
    if (this.wellForm && this.isWellCreated) {
      this.wellForm.markAllAsTouched();
      this.setFormControlStatus();
    }
  }

  validateFormControls() {
    this.setFormControlStatus()
  }

  getCtrlErrorMsg(ctrlName: string, ctrl: AbstractControl) {
    let errorMsg = '';
    if ((ctrl.dirty || ctrl.touched) && ctrl.errors) {
      ctrl.markAsTouched();
      errorMsg = this.validationService.getValidationErrorMessage(ctrl.errors, ctrlName);
      this.mapErrMessages.set(ctrlName, errorMsg);
    } else {
      this.mapErrMessages.delete(ctrlName);
    }
    return errorMsg;
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

  onPanelToLineMappingsChange(data) {
    this.well.PanelToLineMappings = data.panelToLineMapping;
    this.well.IsDirty = data.dirty || this.well.IsDirty;
  }

  onLineToZoneMappingsChanged(lineToZoneMappings: LineToZoneMappingModel[]): void {
    this.well.LineToZoneMapping = lineToZoneMappings;
    // Update Zones here
    this.well.Zones.forEach(zone => {
      let inxZoneMapping = this.well.LineToZoneMapping.findIndex(zm => zm.ZoneId === zone.ZoneId) ?? -1;
      if (inxZoneMapping != -1) {
        zone.LineToZoneMapping = this.well.LineToZoneMapping[inxZoneMapping];
      }
    });
    this.well.IsDirty = true;
  }

  onLineToZoneMappingValidateEvent(isInValid: boolean): void {
    this.isInValidZoneMapping = isInValid;
  }

  onOutputMappingValidEvent(isValid: boolean) {
    this.isOutputMappingValid = isValid;
  }

  onZoneDetailFormChangeEvent(isDirty: boolean) {
    this.well.IsDirty = isDirty;
  }

  onZoneDetailFormValidEvent(isValid: boolean) {
    this.zoneDetailsFormValid = isValid;
  }

  private updateWellState() {
    this.well.WellName = this.wellForm.value.WellName;
    this.well.ControlArchitectureId = this.wellForm.value.ControlArchitectureId;
    this.well.NumberOfOutputs = this.wellForm.value.NumberOfOutputs;
    this.currentWellId = this.well.WellId;
    const wellToUpdate = _cloneDeep(this.well); // to avoid state read only issue
    wellToUpdate.IsValid = true;
    let errMssg = this.wellDataFacade.validateInforceWell(wellToUpdate);
    var zoneMapErrorList: WellErrorNotifierModel[] = [];
    if (errMssg) {
      if (errMssg === 'No Zone Mapping added' && wellToUpdate.zoneMapErrors === undefined && wellToUpdate.ControlArchitectureId !== INFORCE_WELL_ARCHITECTURE.SURESENS) {
        wellToUpdate.zoneMapErrors = [];
        this.zonemapErrMessages.set(wellToUpdate.WellId.toString(), "Line to Zone Mapping has invalid data");
        zoneMapErrorList.push(
          {
          wellId: wellToUpdate.WellId,
          wellName: wellToUpdate.currentWellName,
          path: `${this.router.url}/${wellToUpdate.WellId.toString()}`,
          tabName: `${wellToUpdate.currentWellName} - Zone Mapping`,
          tabIndex: 2,
          errors: [...this.zonemapErrMessages].map(([name, value]) => ({ name, value }))
          });  
          wellToUpdate.zoneMapErrors = zoneMapErrorList;
      }
      wellToUpdate.IsValid = false;
    }
    this.wellDataFacade.saveWell(wellToUpdate);

  }

  private setUpActionButtons() {
    const totalTabCount = this.getTotalTabCount();
    if (this.activeTabIndex > 0) {
      this.delBtnVisibility = false;
      this.shiftBtnVisibility = false;
    } else {
      this.delBtnVisibility = isNaN(this.currentWellId) ? false : true;
      this.shiftBtnVisibility = !this.suresensWellArchSelected;
    }
    this.actionBtnTxt = isNaN(this.currentWellId) ? "Create Well" : this.activeTabIndex !== totalTabCount - 1 ? "Next"
      : (isNaN(this.nextWellId) ? "Done" : "Next");
  }

  getTotalTabCount(): number {
    const minTabCount = this.suresensWellArchSelected ? 1 : 3;
    return this.well?.Zones?.length > 0 ? (this.well.Zones.length + minTabCount) : minTabCount;
  }

  private updateLineToZoneMappings(): void {
    let inForceZoneMappings: LineToZoneMappingModel[] = [];
    this.well.Zones.forEach((zone, inx) => {
      let inxZoneMap = this.well.LineToZoneMapping?.findIndex(zm => zm.ZoneId === zone.ZoneId) ?? -1;
      if (inxZoneMap != -1) {
        inForceZoneMappings.push({
          ZoneId: this.well.LineToZoneMapping[inxZoneMap].ZoneId,
          ZoneName: this.well.LineToZoneMapping[inxZoneMap].ZoneName,
          OpenLine: this.well.LineToZoneMapping[inxZoneMap].OpenLine,
          CloseLine: this.well.LineToZoneMapping[inxZoneMap].CloseLine,
          ValveType: this.well.LineToZoneMapping[inxZoneMap].ValveType,
          Priority: this.well.LineToZoneMapping[inxZoneMap].Priority,
          Enabled: this.well.LineToZoneMapping[inxZoneMap].Enabled,
          Id: this.well.LineToZoneMapping[inxZoneMap].Id
        });
      }
      else {
        inForceZoneMappings.push({
          ZoneId: zone.ZoneId,
          ZoneName: zone.ZoneName,
          OpenLine: zone.ValveType === 0 ? "N/A" : "",
          CloseLine: zone.ValveType === 0 ? "N/A" : "",
          ValveType: zone.ValveType,
          Priority: 1,
          Enabled: true,
          Id: -(inx + 1)
        })
      }
    });
    this.well.LineToZoneMapping = inForceZoneMappings;
  }

  setCurrentWellData() {
    this.well = new InforceWellUIModel();
    this.currentWellIdx = this.wellEnity.findIndex(w => w.WellId == this.currentWellId);
    if (this.currentWellIdx !== -1) {
      this.well = this.wellEnity[this.currentWellIdx];
      this.wellName = this.well.Error && this.well.Error.length > 0 ? this.well.currentWellName : (this.well?.WellName ? this.well.WellName : this.wellName);
      this.well.currentWellName = this.well.Error && this.well.Error.length > 0 ? this.well.currentWellName : this.wellName;
      this.nextWellId = this.currentWellIdx + 1 < this.wellEnity.length ? this.wellEnity[this.currentWellIdx + 1].WellId : NaN;
      this.prevWellId = this.currentWellIdx > 0 ? this.wellEnity[this.currentWellIdx - 1].WellId : NaN;
      this.backBtnVisibility = !isNaN(this.prevWellId) || !GatewayPanelBase.ShowNavigation;
      this.isWellCreated = true;
      this.suresensWellArchSelected = this.well.ControlArchitectureId == WELL_ARCHITECTURE.SURESENS ? true : false;
      this.updateLineToZoneMappings();
    }
  }

  initWellData() {
    this.activatedRoute.queryParams.subscribe(params => {
      if (params && params.selectedId) {
        this.currentWellId = parseInt(params.selectedId, 10);
        this.activeTabIndex = params.selectedChild ? parseInt(params.selectedChild, 10) : 0;
        this.initWells();
      } else {
        this.getParameter();
      }
    });
  }

  getParameter(): void {
    this.activatedRoute.params.subscribe(params => {
      this.currentWellId = parseInt(params.Id, 10);
      this.activeTabIndex = 0;
      this.initWells();
    });
  }

  createFormGroup() {
    this.wellForm = new FormGroup({});
    for (const property in inforceWellSchema.properties) {

      if (inforceWellSchema.properties.hasOwnProperty(property)) {
        const formControl = new FormControl('');
        const validationFn: ValidatorFn[] = [];
        if (inforceWellSchema.required.includes(property)) {

          validationFn.push(Validators.required);
          let prop = inforceWellSchema.properties[property];
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
  }

  private subscribeToFormChanges() {
    this.wellForm.valueChanges.pipe(debounceTime(200)).subscribe((val) => {
      if (!this.wellForm.pristine) {
        this.well.IsDirty = true;
        this.validateFormControls();
      }
    });
  }

  setWellFormData() {
    this.wellForm.patchValue({
      WellId: this.well.WellId,
      WellName: this.well.WellName,
      WellType: this.well.WellType,
      ControlArchitectureId: this.well.ControlArchitectureId ?? WELL_ARCHITECTURE.N_PlUS_ONE,
      NumberOfOutputs: this.well.NumberOfOutputs ?? (this.well.ControlArchitectureId === WELL_ARCHITECTURE.SURESENS ? 0 : 2),
      ShiftMethod: this.well.ShiftMethod
    });
    this.zones = this.well.Zones ?? this.zones;
    if (this.well.IsPanelLevelShiftDefaultApplied) {
      this.well.ShiftMethod = this.panelLevelShiftDefaultData.ShiftMethod;
      this.well.ReturnsBasedShiftDefaults = this.panelLevelShiftDefaultData.ReturnsBasedShiftDefaults;
      this.well.TimeBasedShiftDefaults = this.panelLevelShiftDefaultData.TimeBasedShiftDefaults
      this.well.Zones?.forEach(zone => {
        if (zone.IsWellLevelShiftDefaultApplied) {
          zone.ShiftMethod = this.panelLevelShiftDefaultData.ShiftMethod;
          zone.ReturnsBasedShiftDefaults = this.panelLevelShiftDefaultData.ReturnsBasedShiftDefaults;
          zone.TimeBasedShiftDefaults = this.panelLevelShiftDefaultData.TimeBasedShiftDefaults;
        }
      });
    }
    this.subscribeToFormChanges();
    this.validateOnInit();
    this.setActiveTab();
  }

  setActionBtnStatus() {
    this.actionBtnDisabled = true;
    this.shiftBtnVisibility = true;
    if (this.suresensWellArchSelected) {
      this.actionBtnDisabled = this.well.Zones.length > 0 ? false : true;
      this.shiftBtnVisibility = false;
    }
    else if (this.well?.Zones?.length > 0) {
      const zoneCount = this.well.Zones.reduce((count, zone) => (zone.ValveType !== ZONE_VALVE_TYPE.Monitoring ? count + 1 : count), 0);
      // this.actionBtnDisabled = zoneCount < 0 ? true : false;
      this.actionBtnDisabled = this.getZoneLimit() > zoneCount ? true : false;
    }
  }

  getZoneLimit(): number {
    let count = 0;
    switch (this.selArchitectId) {
      case INFORCE_WELL_ARCHITECTURE.TWO_N:
        count = this.selNumOfOutput / 2;
        break;

      case INFORCE_WELL_ARCHITECTURE.N_PlUS_ONE:
        count = this.selNumOfOutput - 1;
        break;

      case INFORCE_WELL_ARCHITECTURE.SURESENS:
        count = 999;  // No limit of zones
        break;

      default:
        count = this.selNumOfOutput - 1;  ///Default is N+1
        break;
    }
    return count;
  }

  private updateWellWithPanelLevelShiftDefaults() {
    this.well.ShiftMethod = this.panelLevelShiftDefaultData.ShiftMethod;
    this.well.ReturnsBasedShiftDefaults = this.panelLevelShiftDefaultData.ReturnsBasedShiftDefaults;
    this.well.TimeBasedShiftDefaults = this.panelLevelShiftDefaultData.TimeBasedShiftDefaults;
    this.well.IsPanelLevelShiftDefaultApplied = true;
  }

  private subscribeToShiftDefault(): void {
    const subscription = this.shiftDefaultState$.subscribe(
      (state: IShiftDefaultState) => {
        if (state !== undefined) {
          if (state.isLoaded === false && !StateUtilities.hasErrors(state)) {
            this.store.dispatch(SHIFT_DEFAULT_ACTIONS.LOAD_SHIFT_DEFAULTS());
          } else {
            this.panelLevelShiftDefaultData = new ShiftDefaultUIModel();
            Object.assign(this.panelLevelShiftDefaultData, state.shiftDefaults);
            if (!this.panelLevelShiftDefaultData.ShiftMethod || this.panelLevelShiftDefaultData.ShiftMethod === 'NA') {
              this.panelLevelShiftDefaultData.ShiftMethod = initialShiftDefaultState.shiftDefaults.ShiftMethod;
            }
            if (!this.panelLevelShiftDefaultData.ReturnsBasedShiftDefaults) {
              this.panelLevelShiftDefaultData.ReturnsBasedShiftDefaults = initialShiftDefaultState.shiftDefaults.ReturnsBasedShiftDefaults;
            }
            if (!this.panelLevelShiftDefaultData.TimeBasedShiftDefaults) {
              this.panelLevelShiftDefaultData.TimeBasedShiftDefaults = initialShiftDefaultState.shiftDefaults.TimeBasedShiftDefaults;
            }
            if (this.well && this.currentWellIdx === -1) {
              this.updateWellWithPanelLevelShiftDefaults();
            }
          }
        }
      }
    );
    this.arrSubscriptions.push(subscription);
  }

  postCallGetWells(): void {

    if (isNaN(this.currentWellId)) {
      const wellId = this.wellEnity.length + 1;
      // const wellName = this.wellEnity.findIndex(w => w.WellName === `Well ${wellId}`) === -1 ? `Well ${wellId}` : `Well ${wellId + 1}`;
      if (!GatewayPanelBase.ShowNavigation && this.wellEnity.length == 1) {
        this.currentWellId = this.wellEnity[0].WellId;
        this.setCurrentWellData();
      } else {
        this.well = this.wellDataFacade.getNewWell(wellId, WellTypeEnum.InFORCE);
        this.currentWellIdx = -1;
        this.well.ShiftMethod = 'ReturnsBased';
        if (this.panelLevelShiftDefaultData) {
          this.updateWellWithPanelLevelShiftDefaults();
        }
      }
      this.backBtnVisibility = !GatewayPanelBase.ShowNavigation;
    }
    else if (this.wellEnity && this.wellEnity.length > 0) {
      this.setCurrentWellData();
    }
    this.setUpActionButtons();
  }

  setActiveTab() {
    if (history.state && history.state.tabIndex) {
      this.activeTabIndex = history.state.tabIndex;
    }
  }

  trackByFn(index, item) {
    return index;
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.subscribeToShiftDefault();
    this.subscribeToPanelDefault();
    this.initPanelConfigurationCommon();
    this.initWellData();
    this.initToolConnections();
    this.createFormGroup();
    this.initDataLoggers();
    const subscription = this.fetchWellArchandValveTypeData().subscribe(responseList => {
      if (responseList) {
        this.setWellArchList(responseList[0]);
        this.setValveTypesList(responseList[1]);
        this.setWellFormData();
        this.setActionBtnStatus();
      }
    });

    this.arrSubscriptions.push(subscription);
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  ngOnDestroy(): void {
   
    if (this.isLeavingWorkflow)
      GatewayPanelBase.ShowNavigation = true;

      console.log("this.isLeavingWorkflow inforce well",this.isLeavingWorkflow, GatewayPanelBase.ShowNavigation)


    if (this.arrSubscriptions != null && this.arrSubscriptions.length > 0) {
      this.arrSubscriptions.forEach(subscription => {
        if (subscription != null)
          subscription.unsubscribe();
        subscription = null;
      });
    }
    this.arrSubscriptions = [];

    this.validationService.clearError();
    if (this.currentWellIdx != -1) {
      this.updateWellState();
    }

    // If flowmeter associated 
    // if (this.surefloFlowMeterList.length > 0) {
    //   this.updateFlowMeterState();
    // }

    super.ngOnDestroy();

  }
}
