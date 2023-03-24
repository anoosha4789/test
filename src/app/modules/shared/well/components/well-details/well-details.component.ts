import { Component, OnInit, ViewChild, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { IgxColumnComponent, IgxGridComponent } from '@infragistics/igniteui-angular';
import * as _ from 'lodash';
import { String } from 'typescript-string-operations';

import { Store } from '@ngrx/store';
import { ZoneDialogComponent, ZoneDialogData } from '../zone-dialog/zone-dialog.component';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { ButtonActions } from '@shared/gateway-dialogs/components/gateway-advanced-dialog/gateway-advanced-dialog.component';
import { InchargeWellUIModel } from '@core/models/UIModels/Incharge.well.model';
import { GatewayPanelBase, IWellBase } from '@comp/GatewayPanelBase.component';
import { InchargeZoneUIModel } from '@core/models/UIModels/incharge.zone.model';
import { ValidationService } from '@core/services/validation.service';
import { deleteUIModal, UICommon } from '@core/data/UICommon';
import { DeleteOrder } from '@core/models/UIModels/models.model';
import { DeleteObjectTypesEnum } from '@core/models/webModels/DeleteObjectTypesEnum';
import { ToolConnectionUIModel } from '@core/models/UIModels/tool-connection.model';
import { WellFacade } from '@core/facade/wellFacade.service';
import { DataSourceFacade } from '@core/facade/dataSourceFacade.service';
import { filter } from 'rxjs/operators';
import { WellErrorNotifierModel } from '@core/models/UIModels/error-notifier-model';
import { WellTypeEnum } from '@core/models/webModels/WellDataUIModel.model';

@Component({
  selector: 'app-well-details',
  templateUrl: './well-details.component.html',
  styleUrls: ['./well-details.component.scss']
})
export class WellDetailsComponent extends GatewayPanelBase implements OnInit, OnDestroy, IWellBase {

  @Input() well: InchargeWellUIModel;

  @Input() wellSchema: any;

  zones: InchargeZoneUIModel[];

  @Output() isFormValidEvent = new EventEmitter();

  @Output() onZoneChangeEvent = new EventEmitter();

  @Output() wellFormInvalidEvent = new EventEmitter();

  @ViewChild('gridZones', { static: true })
  public gridZones: IgxGridComponent;

  toolConnectionList: ToolConnectionUIModel[];
  toolConnection: ToolConnectionUIModel;
  zoneDialogComp: ZoneDialogComponent;
  zoneDetails: ZoneDialogData;
  // zones = [];
  isZoneDirty = false;
  valveVisibility = false;
  saveIconVisibility = true;
  wellTypeSelectVisibility = false;
  activeZoneIndex: number;
  currentWellName: string;
  wellTypeList: any;
  wellTypeKeys: any;
  invalidWellNameErorMsg: string;
  valveTypeList: string[];
  valveSizeList: string[];
  selectedWellType: string;
  wellForm: FormGroup;

  constructor(protected store: Store ,private fb: FormBuilder,
     private router: Router,
     private wellDataFacade: WellFacade,
     private dataSourceFacade: DataSourceFacade,
     private validationService: ValidationService,
     private gwModalService: GatewayModalService) {
      super(store, null, wellDataFacade, dataSourceFacade, null, null, null);
  }

  // On Well Type Dropdown Change
  onWellTypeChange(event) {
    // console.log(`panel type select change...${event}`);
  }

  private isValidForm() {
    this.wellForm.statusChanges
      .pipe(filter(() => this.wellForm.valid)).subscribe(() => {
        this.isFormValidEvent.emit(true);
      });

    this.wellForm.statusChanges
      .pipe(filter(() => this.wellForm.invalid)).subscribe(() => {
        this.isFormValidEvent.emit(false);
      });
  }

  private validateOnInit(): void {
    if (this.wellForm && this.well.IsDirty) {
      // this.wellForm.markAllAsTouched();
      let ctrl = this.wellForm.get('WellName');
      this.validateControl('Well Name', ctrl);
    }
  }

  private validateControl(fieldInfo, ctrl) {
   
    this.wellForm.markAllAsTouched();
    this.invalidWellNameErorMsg = null;
    if(ctrl && ctrl.touched && ctrl.invalid) { 
      // if(!this.well.WellName) this.well.currentWellName = this.well.currentWellName;
      this.invalidWellNameErorMsg = this.validationService.getValidationErrorMessage(ctrl.errors, fieldInfo);
      const error: WellErrorNotifierModel[] = [{
        tabName: this.well.currentWellName,
        path: this.router.url,
        errors: [
          {
            name: this.well.WellName,
            value:  `Well Name : ${this.invalidWellNameErorMsg}`
          }
        ],
        wellId: this.well.WellId,
        wellName: this.well.currentWellName
      }];
      this.wellFormInvalidEvent.emit(error);
      this.isFormValidEvent.emit(false);
      return;
    } else {    
      // this.well.currentWellName = this.well.WellName;
      this.isFormValidEvent.emit(true);
      this.wellFormInvalidEvent.emit(null);
    }
  }

  // Validate Well Name
  validateWellName(event) {
    this.updateWell();
    let ctrl = this.wellForm.get(event.currentTarget.id);
    this.validateControl('Well Name', ctrl);
  }

  initColumns(column: IgxColumnComponent) {
    // console.log(`init zone grid columns...${column}`);
  }

  onValveTypeChange(event, rowIdx) {
    this.saveIconVisibility = true;
    this.activeZoneIndex = rowIdx;
  }

  onValveSizeChange(event, rowIdx) {
    this.saveIconVisibility = true;
    this.activeZoneIndex = rowIdx;
  }

  private getValveTypes(): string[] {
    const data = ['eHCM-P', 'Monitoring'];
    return data;
  }

  private getValveSizes(): string[] {

    const data = ['3 1/4', '3 2/4'];
    return data;
  }

  viewZoneDetails(rowId) {
    // console.log(`view zone details...${rowId}`);
  }

  addZone() {
    const zoneId =  this.zones && this.zones.length > 0 ? this.zones.length + 1 : -1;
    const zoneNameId = Math.abs(zoneId);
    this.saveIconVisibility = true;
    const zoneObj : InchargeZoneUIModel  = {
      ZoneId: -1,
      ZoneName: '',
      ZoneTypeEnum: this.well.WellType,
      ZoneDeviceId: -1,
      Tools: [],
      MeasuredDepth: null
    }; 
    zoneObj.ZoneId = this.zones && this.zones.length === 0 ? -1 : 
                    (this.zones[this.zones.length - 1].ZoneId > 0 ? -(this.zones[this.zones.length - 1].ZoneId + 1) : this.zones[this.zones.length - 1].ZoneId -1);
    zoneObj.ZoneName = this.zones && this.zones.findIndex(z => z.ZoneName === `Zone ${zoneNameId}`) === -1 ? `Zone ${zoneNameId}` : `Zone ${zoneNameId + 1}`;
    // Construct modal data
    this.zoneDetails = {
      zones: this.zones,
      selectedZone: zoneObj,
      modalEditMode: false
    };

    // this.gridZones.addRow(zoneObj);
    this.openZoneDialog('New Zone');
  }

  editZone(zoneId) {
    this.zoneDetails = null;
    const selectedZone: InchargeZoneUIModel = this.zones.find(z => z.ZoneId === zoneId);
    this.zoneDetails = {
      zones: this.zones,
      selectedZone: selectedZone,
      modalEditMode: true
    };

    this.openZoneDialog(selectedZone.ZoneName);
  }

  public onDeleteZone(rowIndex: number, rowID: number) {
    if (rowIndex >= 0) {
      const zoneName = this.gridZones.getRowByIndex(rowIndex).cells.find((cell) => cell.column.field === 'ZoneName').value;
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
        return;
      }

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

  private deleteZone(zoneId: number): void {
    let inxZone = this.zones.findIndex(z => z.ZoneId === zoneId)??-1;
    if (inxZone != -1) {
      this.well.IsDirty = true;
      let zoneName = String.Format("{0} - {1}", this.well.WellName??"", this.zones[inxZone].ZoneName??"");
      UICommon.deletedObjects.push({ 
        deleteOrder: DeleteOrder.Zone, 
        id: zoneId, 
        parentId: this.well.WellId,
        name: zoneName,
        data: this.zones[inxZone],
        objectType: DeleteObjectTypesEnum.Zone
      });
      this.zones.splice(inxZone, 1);
      this.gridZones.notifyChanges(true);
    }
    this.onZoneChangeEvent.emit(this.zones);
    this.gwModalService.closeModal();
  }

  openZoneDialog(title: string): void {
    this.gwModalService.openAdvancedDialog(
      title,
      ButtonActions.None,
      ZoneDialogComponent,
      this.zoneDetails,
      (result) => {
        if (result) {
          if(result) this.updateZone();
        } else {
          this.closeDialog();
        }
      },
      '500px'
    );
  }

  closeDialog() {
    this.zoneDetails = null;
    this.gwModalService.closeModal();
  }

  updateZone() {
    const selectedZone = this.zoneDetails.selectedZone;
    const index = this.zones.findIndex(z => z.ZoneId === selectedZone.ZoneId);
    if (index === -1) {  // New  Zone added
      this.gridZones.addRow(selectedZone);
    } else {
      const zone = this.zones[index];
      zone.ZoneName = selectedZone.ZoneName;
      zone.MeasuredDepth = selectedZone.MeasuredDepth;
      this.gridZones.updateRow(zone, zone.ZoneId);
    }
    this.isZoneDirty = true;
    this.isFormValidEvent.emit(true && this.wellForm.valid);
    this.onZoneChangeEvent.emit(this.zones);
    this.closeDialog();
  }

  updateWell() {
    this.well.WellName = this.wellForm.value.WellName;
    // this.isFormValidEvent.emit(this.wellForm.valid);
  }

  saveZone(rowIdx?, rowId?) {
    // console.log(`save zone...${rowIdx}${rowId}`);
    this.saveIconVisibility = false;
  }


  createFormGroup() {
    this.selectedWellType = this.well && this.well.WellType ? this.well.WellType.toString() : "1";
    this.wellForm = this.fb.group({});

    for (const property in this.wellSchema.properties) {
      
      if (this.wellSchema.properties.hasOwnProperty(property)) {
        const formControl = new FormControl('');
        const validationFn: ValidatorFn[] = [];
        if (this.wellSchema.required.includes(property)) {

          validationFn.push(Validators.required);
          let prop = this.wellSchema.properties[property];
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
              validationFn.push(this.wellDataFacade.wellNameValidator(this.well.WellId));
          }

          formControl.setValidators(validationFn);
          this.wellForm.addControl(property, formControl);
        }
      }
    }
   
    this.wellForm.patchValue({
      WellId: this.well.WellId,
      WellDeviceId: this.well.WellDeviceId,
      WellType: this.selectedWellType,
      WellName: this.well.WellName
    });

  }

  postCallGetToolConnections(): void {
    this.toolConnectionList = this.toolConnectionEntity.filter(tc => tc.WellId === this.well.WellId);
    if(this.toolConnectionList && this.toolConnectionList.length > 0 && this.zones) {
      this.updateToolDetails();
    }
  }

  updateToolDetails() {
    this.zones.forEach(zone => {
      zone.ValveSize = null;
      zone.ValveType = null;
     const gaugeList = this.toolConnectionList.filter(tc => tc.ZoneId ===  zone.ZoneId);
      gaugeList.forEach(gauge => {
        this.getZoneDetails(gauge, zone);
      });
    });
  }

  getZoneDetails(gauge, zone) {
    
    this.dataSourceFacade.dataSourcesEntity?.forEach(ds => {
      ds.Cards.forEach(card => {
        card.Gauges.forEach(g => {
          if(g.DeviceId === gauge.DeviceId) {
            this.setToolDetails(g, zone);
          }
        })
      });
    });
    // this.zones = _.cloneDeep(this.well.Zones);
    
  }

  setToolDetails(gauge, zone) {
    if (gauge.InCHARGECoefficientFileContent) {
      const gaugeDetails = gauge.InCHARGECoefficientFileContent;
      zone.ValveSize = gaugeDetails.ToolSize;
      zone.ValveType = gaugeDetails.ToolType;
    } 
  }

  ngOnDestroy(): void {
    if(this.isZoneDirty)
      this.isFormValidEvent.emit(true);

    super.ngOnDestroy();
  }

  ngOnInit(): void {
   
    this.zones = _.cloneDeep(this.well.Zones);
    this.initToolConnections();
    this.wellTypeList = WellTypeEnum;
    this.wellTypeKeys = Object.keys(this.wellTypeList).filter(f => !isNaN(Number(f)));
    this.currentWellName = this.well.WellName;
    this.createFormGroup();
    this.isValidForm();
    this.validateOnInit();
    if(this.well.WellId > 0) this.valveVisibility = true;
    // force route reload whenever params change;
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }
}
