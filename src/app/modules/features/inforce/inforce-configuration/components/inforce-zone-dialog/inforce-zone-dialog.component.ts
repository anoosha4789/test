import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { INFORCE_WELL_ARCHITECTURE, WellService, ZONE_VALVE_TYPE } from '@core/services/well.service';
import { IZoneValveType } from '@core/models/UIModels/ValveType.model';
import { InforceZoneUIModel } from '@core/models/UIModels/InforceZone.model';
import { inforceWellSchema } from '@core/models/schemaModels/InFORCEWellDataUIModel.schema';
import { WellFacade } from '@core/facade/wellFacade.service';
import { ValidationService } from '@core/services/validation.service';
import { RangeValidator } from '@core/customValidators/rangeValidator.validator';

@Component({
  selector: 'gw-inforce-zone-dialog',
  templateUrl: './inforce-zone-dialog.component.html',
  styleUrls: ['./inforce-zone-dialog.component.scss']
})

export class InforceZoneDialogComponent implements OnInit {

  modalEditMode = false;
  suresensWellArchSelected = false;
  zoneErrorMsg: string;
  showPositions:boolean;
  isHCMP_S_Valve: boolean;
  formCtrlErrorMessage: any;
  private mapErrMessages: Map<string, string> = new Map<string, string>();
  valveTypeList: IZoneValveType[];
  numOfPosList: number[] = [];
  zoneDialogData: IZoneDialogData;

  private arrSubscriptions: Subscription[] = [];
  zoneForm: FormGroup;
  
  constructor(private wellService: WellService, 
              private wellDataFacade: WellFacade,
              private validationService: ValidationService,
              public dialogRef: MatDialogRef<InforceZoneDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: IZoneDialogData) { }

  onValveTypeSelChange(event) {
    this.setOutputByValveType(Number(event.value));
  }

  setOutputByValveType(valveTypeId) {
    this.showPositions = false;
    this.isHCMP_S_Valve = false;
    let bValidateValve = true;

    switch (valveTypeId) {
      // Monitoring
      case ZONE_VALVE_TYPE.Monitoring:
        this.zoneForm.patchValue({
          NumberOfPositions: 0
        });
        this.zoneErrorMsg = null;
        bValidateValve = false;
        break;

      // HCM+
      case ZONE_VALVE_TYPE.HCM_Plus:
        this.zoneForm.patchValue({
          NumberOfPositions: 2
        });
        break;

      // HCM-A
      case ZONE_VALVE_TYPE.HCM_A:
        this.zoneForm.patchValue({
          NumberOfPositions: this.zoneDialogData.modalEditMode && this.zoneDialogData.zoneDetails.ValveType === valveTypeId ? this.zoneDialogData.zoneDetails.NumberOfPositions : this.numOfPosList[0]
        });
        this.showPositions = true; 
        break;

      // HCM-S
      case ZONE_VALVE_TYPE.HCM_S:
        this.zoneForm.patchValue({
          NumberOfPositions: this.zoneDialogData.modalEditMode ? this.zoneDialogData.zoneDetails.NumberOfPositions : 12
        });
        this.isHCMP_S_Valve = true;
        break;
    }

    if (bValidateValve)
      this.validateControlArch();
  }

  onOutputSelChange(event) {
    this.zoneForm.patchValue({
      NumberOfPositions: Number(event.value)
    });
  }

  validateControlArch() {
    let zoneIdx: number;
    let zoneCount: number = this.getZoneCount();
    const maxZoneCount = this.getZoneLimit(this.zoneDialogData.wellArchId);
    if (this.zoneDialogData.modalEditMode) {
      zoneIdx = this.zoneDialogData.zoneList.findIndex((zone) => zone.ValveType !== ZONE_VALVE_TYPE.Monitoring
                && zone.ZoneId === this.zoneDialogData.zoneDetails.ZoneId);
      if (maxZoneCount === zoneCount && zoneIdx === -1) {
        this.setZoneErrorMsg(maxZoneCount);
      }
    } else if (maxZoneCount === zoneCount) {
      this.setZoneErrorMsg(maxZoneCount);
    }
  }

  setZoneErrorMsg(count: number) {
    this.zoneErrorMsg = `Number of Zones with Valve Type should be equal to ${count}.`;
  }

  // Returns zones count without valvetype as monitoring
  getZoneCount() {
    return this.zoneDialogData.zoneList.reduce((count, zone) => (zone.ValveType !== ZONE_VALVE_TYPE.Monitoring ? count+1 : count), 0);
  }

  getZoneLimit(architectureId): number {
    let count = 0;
    switch (architectureId) {
      case INFORCE_WELL_ARCHITECTURE.TWO_N:
        count = this.zoneDialogData.numberOfOutput > 0 ? (this.zoneDialogData.numberOfOutput/2) : 0;
        break; 
    
      case INFORCE_WELL_ARCHITECTURE.N_PlUS_ONE:
        count = this.zoneDialogData.numberOfOutput > 0 ? (this.zoneDialogData.numberOfOutput - 1) : 0;
        break;

      default:
        count = this.zoneDialogData.numberOfOutput > 0 ? (this.zoneDialogData.numberOfOutput - 1) : 0;
        break;
    }
    return count;
  }

  sortByValveType(data: IZoneValveType[]) {
    let valveTypeList: IZoneValveType[] = [];
    const result = data.sort((a,b) => a.ValveName > b.ValveName ? 1 : -1)
    result.forEach((valveType) => {
      if(this.zoneDialogData.wellArchId === INFORCE_WELL_ARCHITECTURE.N_PlUS_ONE && valveType.Id === ZONE_VALVE_TYPE.HCM_A) {
        valveTypeList.unshift(valveType);
      } else {
        if(this.zoneDialogData.wellArchId === INFORCE_WELL_ARCHITECTURE.TWO_N && valveType.Id === ZONE_VALVE_TYPE.HCM_S) { 
          valveTypeList.unshift(valveType);
        } else { 
          valveTypeList.push(valveType);
        }
      }
    });
    return valveTypeList;
  }

  getNumOfPositionList() {
    const maxPosLimit = this.zoneDialogData.wellArchId === INFORCE_WELL_ARCHITECTURE.N_PlUS_ONE ? 14 : 2;
    for(let i = 2; i <= maxPosLimit; i++) {
      if(i === maxPosLimit) {
        this.numOfPosList.unshift(i);
      } else if((i%2) === 0) this.numOfPosList.push(i);
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
    Object.keys(this.zoneForm.controls).forEach(key => {
      this.getCtrlErrorMsg(key, this.zoneForm.controls[key]);
    });
    this.formCtrlErrorMessage = [];
    for (let [key, value] of this.mapErrMessages) {
      this.formCtrlErrorMessage[key] = value;
    }
  }

  createFormGroup() {
    const zoneSchema = inforceWellSchema.definitions.InFORCEZoneDataUIModel;
    this.zoneForm = new FormGroup({});
    for (const property in zoneSchema.properties) {
      
      if (zoneSchema.properties.hasOwnProperty(property)) {
        const formControl = new FormControl('');
        const validationFn: ValidatorFn[] = [];
        if (zoneSchema.required.includes(property)) {
          validationFn.push(Validators.required);

          let prop = zoneSchema.properties[property];
          if (prop.minLength) {
            validationFn.push(Validators.minLength(prop.minLength));
          }
          if (prop.maxLength) {
            validationFn.push(Validators.maxLength(prop.maxLength));
          }

          // Min/Max range
          if (prop.minimum !== undefined && prop.maximum !== undefined) {
            validationFn.push(RangeValidator.range(prop.minimum, prop.maximum));
          }
          else {
            if (prop.minimum !== undefined)
              validationFn.push(Validators.min(prop.minimum));
  
            if (prop.maximum !== undefined)
              validationFn.push(Validators.max(prop.maximum));
          }
          
          // Alphanumeric characters only
          if (prop.pattern) {
            validationFn.push(Validators.pattern(prop.pattern));
          }
          // Special Cases
          switch(property) {
            case 'ZoneName':
              validationFn.push(this.wellDataFacade.zoneNameValidator(this.zoneDialogData.zoneDetails.ZoneName, this.zoneDialogData.zoneList));
              break;
            case 'ValveType':
              if(this.zoneDialogData.zoneDetails.WellId > 0 && this.zoneDialogData.zoneDetails.ZoneId > 0 ) {
                formControl.disable();
              }
              break;
            case 'NumberOfPositions':
              if(this.zoneDialogData.zoneDetails.WellId > 0 && this.zoneDialogData.zoneDetails.ZoneId > 0 ) {
                formControl.disable();
              }
              break;
            case 'MeasuredDepth':
              validationFn.push(this.wellDataFacade.zoneDepthValidator(this.zoneDialogData.zoneDetails.MeasuredDepth, this.zoneDialogData.zoneList));
              break;
          }

          formControl.setValidators(validationFn);
          this.zoneForm.addControl(property, formControl);
        }
      }
    }
    this.setFormGroupData();
  }

  setFormGroupData() {
    this.zoneForm.patchValue({
      ZoneId: this.zoneDialogData.zoneDetails.ZoneId,
      ZoneName: this.zoneDialogData.zoneDetails.ZoneName,
      ValveType: this.zoneDialogData.modalEditMode ? this.zoneDialogData.zoneDetails.ValveType : (this.suresensWellArchSelected ? ZONE_VALVE_TYPE.Monitoring : this.valveTypeList[0].Id),
      NumberOfPositions: this.zoneDialogData.modalEditMode ? this.zoneDialogData.zoneDetails.NumberOfPositions : this.numOfPosList[0],
      MeasuredDepth: this.zoneDialogData.modalEditMode ? this.zoneDialogData.zoneDetails.MeasuredDepth : null,
      CurrentPosition: this.zoneDialogData.modalEditMode ? this.zoneDialogData.zoneDetails.CurrentPosition : 1,
      ShiftMethod:  this.zoneDialogData.modalEditMode ? this.zoneDialogData.zoneDetails.ShiftMethod : 'ReturnsBased',
      WellId:  this.zoneDialogData.modalEditMode ? this.zoneDialogData.zoneDetails.WellId : this.zoneDialogData.wellId,
      HcmId:  this.zoneDialogData.modalEditMode ? this.zoneDialogData.zoneDetails.HcmId : -1,
      IsWellLevelShiftDefaultApplied:  this.zoneDialogData.modalEditMode ? this.zoneDialogData.zoneDetails.IsWellLevelShiftDefaultApplied : false,
      CurrentPositionStateUnknownFlag:  this.zoneDialogData.modalEditMode ? this.zoneDialogData.zoneDetails.CurrentPositionStateUnknownFlag : false,
    });
    const valveTypeId = this.zoneDialogData.modalEditMode ? this.zoneDialogData.zoneDetails.ValveType : (this.suresensWellArchSelected ? ZONE_VALVE_TYPE.Monitoring : this.valveTypeList[0].Id);
    this.setOutputByValveType(valveTypeId);
  }
 
  OnCancel() {
    this.dialogRef.close();
  }

  OnSubmit() {
    this.zoneDialogData.zoneDetails = this.zoneForm.getRawValue();
    this.zoneForm.patchValue({
      NumberOfPositions: Number(this.zoneDialogData.zoneDetails.NumberOfPositions),
      MeasuredDepth: Number(this.zoneDialogData.zoneDetails.MeasuredDepth)
    });
    this.dialogRef.close(this.zoneForm.getRawValue());
  }

  ngOnInit(): void {
    this.zoneDialogData = this.data;
    this.getNumOfPositionList();
    this.valveTypeList = this.sortByValveType(this.zoneDialogData.valveTypes);
    this.suresensWellArchSelected = this.zoneDialogData.wellArchId === INFORCE_WELL_ARCHITECTURE.SURESENS ? true : false;
    this.createFormGroup();
  }

}

export interface IZoneDialogData {
  zoneDetails: InforceZoneUIModel,
  valveTypes : IZoneValveType[],
  modalEditMode: Boolean,
  zoneList: InforceZoneUIModel[],
  wellArchId: number,
  numberOfOutput: number,
  wellId : number,
}
