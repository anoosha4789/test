import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AbstractControl, FormArray, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';

import { MatTableDataSource } from '@angular/material/table';
import { RangeValidator } from '@core/customValidators/rangeValidator.validator';
import { WellFacade } from '@core/facade/wellFacade.service';
import { ValidationService } from '@core/services/validation.service';
import { ZONE_VALVE_TYPE } from '@core/services/well.service';
import { inforceWellSchema } from '@core/models/schemaModels/InFORCEWellDataUIModel.schema';
import { WellErrorNotifierModel } from '@core/models/UIModels/error-notifier-model';
import { InforceWellUIModel } from '@core/models/UIModels/InforceWell.model';
import { InforceZoneUIModel } from '@core/models/UIModels/InforceZone.model';
import { ShiftDefaultUIModel } from '@core/models/UIModels/shift-default.model';
import { IZoneValveType } from '@core/models/UIModels/ValveType.model';
import { ValvePositionsAndReturnsModel } from '@core/models/webModels/ValvePositionsAndReturns.model';
import { GatewayAlertModel } from '@shared/gateway-components/gw-alert/gw-alert.component';
import { ButtonActions } from '@shared/gateway-dialogs/components/gateway-advanced-dialog/gateway-advanced-dialog.component';
import { GatewayBrowseFileDialogComponentData } from '@shared/gateway-dialogs/components/gateway-browse-file-dialog/gateway-browse-file-dialog.component';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { IShiftSettingsDialogData, ShiftSettingsDialogComponent } from '../shift-settings-dialog/shift-settings-dialog.component';

@Component({
  selector: 'gw-inforce-zone-detail',
  templateUrl: './inforce-zone-detail.component.html',
  styleUrls: ['./inforce-zone-detail.component.scss']
})
export class InforceZoneDetailComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() zone: InforceZoneUIModel;
  @Input() valveTypes: IZoneValveType[];
  @Input() well: InforceWellUIModel;
  @Input() isFlowmeterTransmitterNone: boolean;
  
  @Output() zoneDetailFormValidEvent = new EventEmitter<boolean>();
  @Output() zoneDetailFormChangeEvent = new EventEmitter<boolean>();

  isMonitoringZone = false;
  title:string;
  displayedColumns: string[];
  private mapErrMessages: Map<string, string> = new Map<string, string>();
  zoneErrorList: WellErrorNotifierModel[] = [];
  radioBtnConfig = {
    color: 'primary',
    checked: false,
    disabled: false
  };
  alertsList: GatewayAlertModel[] = [];

  dataSource:  MatTableDataSource<AbstractControl>;
  csvFileData: ValvePositionsAndReturnsModel[];
  userSelDdList : IUserSelectable[] = [];
  valvePosandReturnForm: FormGroup;
  CSVArray: string = "";
  constructor(protected router: Router, private gatewayModalService: GatewayModalService, private wellDataFacade: WellFacade, private validationService: ValidationService) { }

  onCurrentPosChange(event, formGroup: FormGroup) {
    this.zone.CurrentPosition = Number(event.value);
    this.validateFormControls(formGroup);
    this.well.IsDirty = this.zoneErrorList.length > 0 ? false : true;
  }

  onUserSelDdChange(event, formGroup: FormGroup) {
    this.validateFormControls(formGroup);
  }

  onExportBtnClick() {
    const valveType = this.valveTypes.find(v => v.Id === this.zone.ValveType);
    
    const browseFileDialogComponentData: GatewayBrowseFileDialogComponentData = {
      title: 'Export to CSV',
      importFile: false, 
      fileExtensions: '.csv', 
      selectedFileName: `${valveType.ValveName}_Zone_Returns_${this.zone.NumberOfPositions}_Positions`,  
      selectedFile: {}, 
      primaryBtnText: "Export"
    };

    this.gatewayModalService.openGatewayBrowseFileDialog(
      browseFileDialogComponentData
    );
    this.gatewayModalService.confirmed().subscribe((result) => {
      if (result) {
        this.getValvePostionData();
        /*const replacer = (key, value) => (value === null ? "" : (typeof value) === 'string'? '' + value.replace(/"/g, '""') + '' :(typeof value) === 'boolean' ? ( value === true ? 'Yes': 'No') : value); 
        const header = Object.keys(this.zone.ValvePositionsAndReturns[0]).filter((col) => col !== 'Id');
        const csv = this.zone.ValvePositionsAndReturns.map((row) =>
          header.map((fieldName) => JSON.stringify(row[fieldName], replacer)).join(',')
        );
        csv.unshift(header.join(','));
        const csvArray = csv.join('\r\n'); */
        this.CSVArray = this.CSVArray + "From Position," + "To Position," + "Description," + "Return Volume," + "User Selectable\r\n";
        for (var i = 0; i < this.zone.ValvePositionsAndReturns.length; i++) {
          this.CSVArray = this.CSVArray + this.zone.ValvePositionsAndReturns[i].FromPosition + ",";
          this.CSVArray = this.CSVArray + this.zone.ValvePositionsAndReturns[i].ToPosition + ",";
          this.CSVArray = this.CSVArray + this.zone.ValvePositionsAndReturns[i].Description + ",";
          this.CSVArray = this.CSVArray + (this.zone.ValvePositionsAndReturns[i].ReturnVolume == null ? "" : this.zone.ValvePositionsAndReturns[i].ReturnVolume) + ",";
          var userselectable = this.zone.ValvePositionsAndReturns[i].UserSelectable == true ? 'Yes' : 'No';
          if (i == this.zone.ValvePositionsAndReturns.length - 1)
              this.CSVArray = this.CSVArray + userselectable;  // remove \n for last row
          else
              this.CSVArray = this.CSVArray + userselectable + "\r\n";

      } 
        const blob = new Blob([this.CSVArray], { type: "data:text/csv;charset=utf-8" });
        saveAs(blob, result.selectedFileName);
      }
    });

  }

  onImportBtnClick() {
    const browseFileDialogComponentData: GatewayBrowseFileDialogComponentData = {
      title: 'Import from CSV',
      importFile: true, 
      fileExtensions: '.csv', 
      selectedFileName: '', 
      selectedFile: {}, 
      primaryBtnText: "Import",
      numberOfPositions: this.zone.NumberOfPositions
    };
    this.gatewayModalService.openGatewayBrowseFileDialog(
      browseFileDialogComponentData
    );
    this.gatewayModalService.confirmed().subscribe((result) => {
      if (result) {
        if (this.zone.ValvePositionsAndReturns && this.zone.ValvePositionsAndReturns.length === result.length) {
          this.zone.ValvePositionsAndReturns = this.updateValvePosAndReturn(result);
        } else {
          this.zone.ValvePositionsAndReturns = result;
        }
        this.well.IsDirty = true;
        this.setvalvePosandReturnForm();
      }
    });
  }

  // To retain existing valvepostion Id in DB to avoid new one inserted to DB 
  updateValvePosAndReturn(data: ValvePositionsAndReturnsModel[]) {
    this.zone.ValvePositionsAndReturns.forEach((ValvePositionsAndReturn, index) => {
      if(ValvePositionsAndReturn.Id > 0) {
        data[index].Id = ValvePositionsAndReturn.Id;
        // const valPosIdx = data.findIndex(vp => vp.Id === -(ValvePositionsAndReturn.Id));
        // if(valPosIdx !== -1) { 
        //   data[valPosIdx].Id = Math.abs(data[valPosIdx].Id); 
        // } else {
        //   data[valPosIdx].Id = ValvePositionsAndReturn.Id;
        // }
      }
    });
    return data;
  }
  
  onShiftSettingsBtnClick() {
    this.openShiftSettingsDialog();
  }

  openShiftSettingsDialog(): void {
    const dialogData: IShiftSettingsDialogData = {
      applyButtonText: 'Set at Zone Level',
      defaultShiftSettingsTitle: 'Use Well Level Shift settings',
      customShiftSettingsTitle: 'Use Custom Zone Level Shift Settings',
      parentShiftSettings: {
        ShiftMethod: this.well.ShiftMethod,
        ReturnsBasedShiftDefaults: this.well.ReturnsBasedShiftDefaults,
        TimeBasedShiftDefaults: this.well.TimeBasedShiftDefaults,
      },
      shiftSettings: {
        ShiftMethod: this.zone.IsWellLevelShiftDefaultApplied ? this.well.ShiftMethod : this.zone.ShiftMethod,
        ReturnsBasedShiftDefaults: this.zone.IsWellLevelShiftDefaultApplied ? this.well.ReturnsBasedShiftDefaults : this.zone.ReturnsBasedShiftDefaults,
        TimeBasedShiftDefaults: this.zone.IsWellLevelShiftDefaultApplied ? this.well.TimeBasedShiftDefaults : this.zone.TimeBasedShiftDefaults,
      },
      isParentLevelShiftDefaultApplied: this.zone.IsWellLevelShiftDefaultApplied,
      isShiftMethodReadOnly: true,
      isZoneLevel: true,
      isFlowmeterTransmitterNone: this.isFlowmeterTransmitterNone
    };
    this.gatewayModalService.openAdvancedDialog(
      'Zone Level Shift Settings',
      ButtonActions.None,
      ShiftSettingsDialogComponent,
      dialogData,
      (result) => {
        if (result) {
          const shiftDefaultData: ShiftDefaultUIModel = result.shiftDefaultData;
          this.zone.ShiftMethod = shiftDefaultData.ShiftMethod;
          this.zone.ReturnsBasedShiftDefaults = shiftDefaultData.ReturnsBasedShiftDefaults;
          this.zone.TimeBasedShiftDefaults = shiftDefaultData.TimeBasedShiftDefaults;
          this.zone.IsWellLevelShiftDefaultApplied = result.isParentLevelShiftDefaultApplied;
          this.well.IsDirty = true;
          this.closeDialog();
        } else {
          this.closeDialog();
        }
      },
      '900px',
      null,
      '585px',
      null
    );
  }

  closeDialog() {
    this.gatewayModalService.closeModal();
  }

  private setvalvePosandReturnForm(){
    this.valvePosandReturnForm = new FormGroup({
      tableRows: new FormArray([])
    });
    const control = this.valvePosandReturnForm.get('tableRows') as FormArray;
    this.constructValPosandReturnData(control);
  };

  createFormGroup(valvePosAndReturn: ValvePositionsAndReturnsModel) {
    const formGroup = new FormGroup({});
    const valvePosandReturnSchema = inforceWellSchema.definitions.ValvePositionsAndReturnsModel;
    for (const property in valvePosandReturnSchema.properties) {
      
      if (valvePosandReturnSchema.properties.hasOwnProperty(property)) {
        const formControl = new FormControl('');
        const validationFn: ValidatorFn[] = [];
        if (valvePosandReturnSchema.required.includes(property)) {
          validationFn.push(Validators.required);

          let prop = valvePosandReturnSchema.properties[property];
          if (prop.minLength) {
            validationFn.push(Validators.minLength(prop.minLength));
          }
          if (prop.maxLength) {
            validationFn.push(Validators.maxLength(prop.maxLength));
          }
          if (prop.minimum !== undefined && prop.maximum !== undefined) {
            validationFn.push(RangeValidator.range(prop.minimum, prop.maximum));
          }
          // Alphanumeric characters only
          if (prop.pattern) {
            validationFn.push(Validators.pattern(prop.pattern));
          }
           // Special Cases
          if (property === 'Description') {
            validationFn.push(this.wellDataFacade.valvePosandReturnDescValidator(valvePosAndReturn.Id, (this.valvePosandReturnForm.get('tableRows') as FormArray)));
          }
          formControl.setValidators(validationFn);
          formGroup.addControl(property, formControl);
        }
      }
    }

    formGroup.patchValue({
      Id: valvePosAndReturn.Id,
      FromPosition: valvePosAndReturn.FromPosition,
      ToPosition: valvePosAndReturn.ToPosition,
      Description: valvePosAndReturn.Description,
      ReturnVolume: valvePosAndReturn.ReturnVolume ? parseFloat(valvePosAndReturn.ReturnVolume.toFixed(2)): valvePosAndReturn.ReturnVolume,
      UserSelectable: valvePosAndReturn.UserSelectable
    });

    return formGroup;
   
  }

  constructValPosandReturnData(control: FormArray) {

    if (this.zone.ValvePositionsAndReturns?.length > 0 && this.zone.ValvePositionsAndReturns?.length === this.zone.NumberOfPositions) {
      this.zone.ValvePositionsAndReturns.forEach((ValvePositionsAndReturn) => {
        control.push(this.createFormGroup(ValvePositionsAndReturn));
      });
    } else {
      for (let i = 1; i <= this.zone.NumberOfPositions; i++) {
        const valvePosAndReturnObj: ValvePositionsAndReturnsModel = {
          Id: -i,
          FromPosition: i,
          ToPosition: i + 1 > this.zone.NumberOfPositions ? 1 : i + 1,
          Description: null,
          ReturnVolume: null,
          UserSelectable: true
        }
        if (i === this.zone.NumberOfPositions) {
          control.controls.unshift(this.createFormGroup(valvePosAndReturnObj));
        } else {
          control.push(this.createFormGroup(valvePosAndReturnObj));
        };
      }
    }

      this.dataSource = new MatTableDataSource((this.valvePosandReturnForm.get('tableRows') as FormArray).controls);
      this.displayedColumns = ['FromPosition', 'ToPosition', 'Id',  'Description', 'ReturnVolume', 'UserSelectable'];
      this.zoneDetailFormValidEvent.emit(this.valvePosandReturnForm.valid);
      if(this.valvePosandReturnForm && this.zone?.ValvePositionsAndReturns?.length > 0) {
        this.valvePosandReturnForm.markAllAsTouched();
        this.validateFormControls();
      }
      this.subscribeToFormChanges();
  }

  validateFormControls(activeformGroup?: FormGroup) {
      const formArray: FormArray = this.valvePosandReturnForm.get('tableRows') as FormArray;
      // formArray.markAsUntouched();
      activeformGroup?.markAllAsTouched();
      this.zone.ValvePositionsAndReturns = [];
      this.alertsList = [];
      for(let i = 0; i < formArray.controls.length ; i++) {
        const formGroup = formArray.controls[i] as FormGroup;        
        const valvePositionsAndReturnsObj = (formGroup.value as ValvePositionsAndReturnsModel);
        valvePositionsAndReturnsObj.ReturnVolume = valvePositionsAndReturnsObj.ReturnVolume ? parseFloat(valvePositionsAndReturnsObj.ReturnVolume.toFixed(2)) : valvePositionsAndReturnsObj.ReturnVolume;
        if(i === formArray.controls.length) {
          this.zone.ValvePositionsAndReturns.unshift(valvePositionsAndReturnsObj); 
        } else {
          this.zone.ValvePositionsAndReturns.push(valvePositionsAndReturnsObj); 
        }
        this.setFormControlStatus(formGroup, i);
      }
  }

  getValvePostionData() {
    const formArray: FormArray = this.valvePosandReturnForm.get('tableRows') as FormArray;
    this.zone.ValvePositionsAndReturns = [];
    this.alertsList = [];
    for(let i = 0; i < formArray.controls.length ; i++) {
      const formGroup = formArray.controls[i] as FormGroup;       
      const valvePositionsAndReturnsObj = (formGroup.value as ValvePositionsAndReturnsModel);
      valvePositionsAndReturnsObj.ReturnVolume = valvePositionsAndReturnsObj.ReturnVolume ? parseFloat(valvePositionsAndReturnsObj.ReturnVolume.toFixed(2)) : valvePositionsAndReturnsObj.ReturnVolume;
      if(i === formArray.controls.length) {
        this.zone.ValvePositionsAndReturns.unshift(valvePositionsAndReturnsObj); 
      } else {
        this.zone.ValvePositionsAndReturns.push(valvePositionsAndReturnsObj); 
      }
    }
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

  private setFormControlStatus(formGroup: FormGroup, index) {
    Object.keys(formGroup.controls).forEach(key => {
      this.getCtrlErrorMsg(key, formGroup.controls[key]);
    });
    for (let [key, value] of this.mapErrMessages) {
      this.setFieldErrorMsg(key, value); 
    }       
    this.setWellZoneErrorMsg(index);  
    
  }

  setWellZoneErrorMsg(rowIdx) {

    const errorList = [...this.mapErrMessages].map(([name, value]) => ({ name, value }));
    if (errorList && errorList.length > 0) {
      errorList.forEach((error) => { 
        error.value = this.setErrorDisplayLabel(error.name, error.value);
      });
      if(this.zoneErrorList.length > 0) {
        errorList.forEach((error) => { 
          this.zoneErrorList.forEach(zoneError => {
          const errorIdx =  zoneError.errors.findIndex(e => e.name === error.name && e.value === error.value);
          if(errorIdx === -1 ) { 
            zoneError.errors.push(error);
          } else {
            zoneError.errors[errorIdx] = error;
          }
          });
        });
      } else {        
        const zoneTabIdx = this.well.Zones.findIndex(z => z.ZoneId === this.zone.ZoneId) + 1;
        this.zoneErrorList.push(
          {
          wellId: this.zone.WellId,
          wellName: this.well.currentWellName,
          zoneId: this.zone.ZoneId,
          path: this.router.url,
          tabName: `${this.well.currentWellName} - ${this.zone.ZoneName}`,
          tabIndex: (2 + zoneTabIdx),
          errors: errorList
        });        
      }
      
    } else {
      this.zoneErrorList.splice(rowIdx, 1);
    }
    if(this.well) {
      if(this.zoneErrorList.length >0) {
        this.updateZoneErrorMessage();
      } else {
        this.well.zoneErrors = [];
      }
    }
  }

  updateZoneErrorMessage() {
    if (this.well.zoneErrors && this.well.zoneErrors.length > 0) {
      const zoneIdx = this.well.zoneErrors?.findIndex(e => e.zoneId === this.zone.ZoneId);
      if (zoneIdx === -1) {
        this.well.zoneErrors?.push(this.zoneErrorList[0]);
      } else {
        this.well.zoneErrors[zoneIdx] = this.zoneErrorList[0];
      }
    } else {  
      this.well.zoneErrors = this.zoneErrorList;
    }
  }

  setFieldErrorMsg(field, message) {
   const alert:GatewayAlertModel = {
      Type: 'error',
      IconType: 'error',
      content: `${message}`,
      cusomClass: false,
      field: `${field}`
    }
    if(this.alertsList.length > 0) {
      const fieldIdx = this.alertsList.findIndex(alert => alert.field === `${field}`);
      if(fieldIdx == -1) {
        this.alertsList.unshift(alert);
      }
    } else {
      this.alertsList.unshift(alert);
    }
  }

  setErrorDisplayLabel(name, value) {
    let displayName = null;
    switch (name) {
      case 'Description':
        displayName = `Position Description : ${value}`
        break;
      case 'ReturnVolume':
        displayName = `Return Volume : ${value}`
        break;
      default:
        displayName = `${name} : ${value}`
        break;
    }
    return displayName;
  }

  private subscribeToFormChanges() {
    this.valvePosandReturnForm.valueChanges.pipe(debounceTime(200)).subscribe((val) => {
      if (!this.valvePosandReturnForm.pristine) {
        this.zoneDetailFormValidEvent.emit(this.valvePosandReturnForm.valid);
        this.zoneDetailFormChangeEvent.emit(true);
      }
    });
  }

  ngOnInit(): void {
    this.userSelDdList = USER_SELECTABLE_LIST;
    const valveType = this.valveTypes.find(v => v.Id === this.zone.ValveType);
    this.isMonitoringZone = valveType.Id === ZONE_VALVE_TYPE.Monitoring ? true : false;
    this.title = `Valve Positions and Returns for ${valveType.ValveName} in ${this.zone.ZoneName}`;
    this.setvalvePosandReturnForm();
  }

  ngAfterViewInit(): void {  
    setTimeout(() => {
      this.zoneDetailFormValidEvent.emit(this.valvePosandReturnForm.valid);
    }, 50);
  }

  ngOnDestroy(): void {
    if(!this.zone.ValvePositionsAndReturns) {
      this.getValvePostionData();
    }
    this.zoneDetailFormValidEvent.emit(true);
  }

}

export interface IUserSelectable {
  key: boolean,
  value: string
}

export const USER_SELECTABLE_LIST: IUserSelectable[] = [
  
  { 
    key: true,
    value: 'Yes'
  },
  { 
    key: false,
    value: 'No'
  },
]

