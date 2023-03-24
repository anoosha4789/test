import { Component, Inject, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RangeValidator } from '@core/customValidators/rangeValidator.validator';
import { eFCVSchema } from '@core/models/schemaModels/EFCVUIModel.schema';
import { ValidationService } from '@core/services/validation.service';
import { eFCVDataModel, MotorSettingsDataModel } from '@core/models/webModels/eFCVDataModel.model'
import * as _ from 'lodash';
import { WellFacade } from '@core/facade/wellFacade.service';
import { MultiNodeWellDataUIModel } from '@core/models/webModels/WellDataUIModel.model';
import { UICommon } from '@core/data/UICommon';
import { eFCVMotorSettings_Defaults } from '@features/multinode/common/multiNodeCommon';

@Component({
  selector: 'app-e-fvc',
  templateUrl: './e-fvc.component.html',
  styleUrls: ['./e-fvc.component.scss']
})
export class EFVCComponent implements OnInit{

  efcvNameValidationMessage = "";
  efcvAddressValidationMessage = "";
  efcvSerialNumberValidationMessage = "";
  efcvUniqueAddressValidationMessage = "";
  efcMeasuredDepthValidationMessage = "";
  efcvMaxVoltageValidationMessage = "";
  efcvMaxCurrentValidationMessage = "";
  efcvTargetVoltageValidationMessage = "";
  efcCurrentThresholdValidationMessage = "";
  efcDutyCycleValidationMessage = "";
  efcvForm: FormGroup;
  efcvFormData: eFCVDataModel;
  motorSettings: MotorSettingsDataModel;
  private inputLabelMap = new Map();
  currentOvrrideList = [
    { id: 1, value: 'No' },
    { id: 2, value: 'Yes' }
  ]
  efcvDialogData: IefcvDialogData;
  btnText: string = "ADD";
  efcvList: eFCVDataModel[];
  wellList: MultiNodeWellDataUIModel[];
  currentWell: MultiNodeWellDataUIModel;
  editMode: boolean;

  constructor(
    public dialogRef: MatDialogRef<EFVCComponent>,
    private validationService: ValidationService,
    private wellFacade: WellFacade,
    @Inject(MAT_DIALOG_DATA) public data: IefcvDialogData
  ) { }


  OnCancel(): void {
    this.dialogRef.close();
  }

  OnSubmit() {
    //this.efcvDialogData.efcvDetails = this.efcvForm.getRawValue();
    // const motorSettings = new MotorSettingsDataModel();
    this.efcvFormData.MotorSettings.MaxCurrent = this.efcvForm.getRawValue().MaxCurrent;
    this.efcvFormData.MotorSettings.DutyCycle = this.efcvForm.getRawValue().DutyCycle;
    this.efcvFormData.MotorSettings.MaxVoltage = this.efcvForm.getRawValue().MaxVoltage;
    this.efcvFormData.MotorSettings.OverCurrentOverrideFlag = this.efcvForm.getRawValue().OverCurrentOverride === 2 ? true : false;
    this.efcvFormData.MotorSettings.OverCurrentThreshold = this.efcvForm.getRawValue().OverCurrentThreshold;
    this.efcvFormData.MotorSettings.TargetVoltage = this.efcvForm.getRawValue().TargetVoltage;



    this.efcvFormData.ZoneName = this.efcvForm.getRawValue().eFCVName;
    this.efcvFormData.Address = this.efcvForm.getRawValue().eFCVAddress + "";
    this.efcvFormData.SerialNumber = this.efcvForm.getRawValue().SerialNumber;
    this.efcvFormData.MeasuredDepth = this.efcvForm.getRawValue().MeasuredDepth;
    this.efcvFormData.UId = this.efcvForm.getRawValue().UniqueAddress;
    this.efcvFormData.HcmId =   UICommon.IsImportConfig ? UICommon.getImportNextDeviceId() : -1,// this.sie.SIEDeviceId,
    // this.efcvFormData.MotorSettings = motorSettings;
    // this.efcvFormData.ZoneId = this.efcvDialogData.efcvDetails.ZoneId;
    // this.efcvFormData.wellId = this.efcvDialogData.efcvDetails.wellId;
    // eFCV.eFCVPositions = this.efcvDialogData.efcvDetails.eFCVPositions;
    // eFCV.PositionDescriptionData = this.efcvDialogData.efcvDetails.PositionDescriptionData;

    this.efcvDialogData.efcvDetails = this.efcvForm.getRawValue();

    this.dialogRef.close(this.efcvFormData);
  }

  onWellSelChange(event) {

  }

  validateForm(event) {
    this.validateControl(event.currentTarget.id);
  }

  validateControl(id) {
    let ctrl = this.efcvForm.get(id);
    if (id === "eFCVName") {
      if (ctrl && ctrl.errors) {
        this.efcvNameValidationMessage = this.validationService.getValidationErrorMessage(ctrl.errors, this.inputLabelMap.get(id));
      } else {
        this.efcvNameValidationMessage = "";
      }
    }
    else if (id === "eFCVAddress") {
      if (ctrl && ctrl.errors) {
        this.efcvAddressValidationMessage = this.validationService.getValidationErrorMessage(ctrl.errors, this.inputLabelMap.get(id));
      } else {
        this.efcvAddressValidationMessage = "";
      }
    }
    else if (id === 'SerialNumber') {
      if (ctrl && ctrl.errors) {
        this.efcvSerialNumberValidationMessage = this.validationService.getValidationErrorMessage(ctrl.errors, this.inputLabelMap.get(id));
      } else {
        this.efcvSerialNumberValidationMessage = "";
      }
    }
    else if (id === 'UniqueAddress') {
      if (ctrl && ctrl.errors) {
        this.efcvUniqueAddressValidationMessage = this.validationService.getValidationErrorMessage(ctrl.errors, this.inputLabelMap.get(id));
      } else {
        this.efcvUniqueAddressValidationMessage = "";
      }
    }
    else if (id === "MeasuredDepth") {
      if (ctrl && ctrl.errors) {
        this.efcMeasuredDepthValidationMessage = this.validationService.getValidationErrorMessage(ctrl.errors, this.inputLabelMap.get(id));
      } else {
        this.efcMeasuredDepthValidationMessage = "";
      }
    }
    else if (id === 'MaxVoltage') {
      if (ctrl && ctrl.errors) {
        this.efcvMaxVoltageValidationMessage = this.validationService.getValidationErrorMessage(ctrl.errors, this.inputLabelMap.get(id));
      } else {
        this.efcvMaxVoltageValidationMessage = "";
      }
    }
    else if (id === 'MaxCurrent') {
      if (ctrl && ctrl.errors) {
        this.efcvMaxCurrentValidationMessage = this.validationService.getValidationErrorMessage(ctrl.errors, this.inputLabelMap.get(id));
      } else {
        this.efcvMaxCurrentValidationMessage = "";
      }
    }
    else if (id === 'TargetVoltage') {
      if (ctrl && ctrl.errors) {
        this.efcvTargetVoltageValidationMessage = this.validationService.getValidationErrorMessage(ctrl.errors, this.inputLabelMap.get(id));
      } else {
        this.efcvTargetVoltageValidationMessage = "";
      }
    }
    else if (id === 'OverCurrentThreshold') {
      if (ctrl && ctrl.errors) {
        this.efcCurrentThresholdValidationMessage = this.validationService.getValidationErrorMessage(ctrl.errors, this.inputLabelMap.get(id));
      } else {
        this.efcCurrentThresholdValidationMessage = "";
      }
    }
    else if (id === 'DutyCycle') {
      if (ctrl && ctrl.errors) {
        this.efcDutyCycleValidationMessage = this.validationService.getValidationErrorMessage(ctrl.errors, this.inputLabelMap.get(id));
      } else {
        this.efcDutyCycleValidationMessage = "";
      }
    }
  }

  private createFormGroup(): void {
    this.efcvForm = new FormGroup({});
    for (const property in eFCVSchema.properties) {
      let formControl = new FormControl('');
      let validationFn: ValidatorFn[] = [];
      if (eFCVSchema.required.includes(property))
        validationFn.push(Validators.required);

      if (eFCVSchema.properties.hasOwnProperty(property)) {
        let prop = eFCVSchema.properties[property];
        if (prop.minLength !== undefined)
          validationFn.push(Validators.minLength(prop.minLength));

        if (prop.maxLength !== undefined)
          validationFn.push(Validators.maxLength(prop.maxLength));

        if (prop.minValue !== undefined && prop.maxValue !== undefined) {
          validationFn.push(RangeValidator.range(prop.minValue, prop.maxValue));
        }

        // Min/Max range
        if (prop.minValue !== undefined && prop.maxValue !== undefined) {
          validationFn.push(RangeValidator.range(prop.minValue, prop.maxValue));
        }
        else {
          if (prop.minValue !== undefined)
            validationFn.push(Validators.min(prop.minValue));

          if (prop.maxValue !== undefined)
            validationFn.push(Validators.max(prop.maxValue));
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

        if (prop.pattern !== undefined)
          validationFn.push(Validators.pattern(prop.pattern));


        if (property === 'eFCVName') {
          validationFn.push(this.wellFacade.zoneNameValidator(this.efcvFormData.ZoneName, this.efcvList));
        }
        if (property === 'MeasuredDepth') {
          validationFn.push(this.wellFacade.zoneDepthValidator(this.efcvFormData.MeasuredDepth, this.efcvList));
        }
        if (property === 'eFCVAddress') {
          validationFn.push(this.eFCVAddressValidator(this.efcvFormData.Address, this.efcvList, this.efcvDialogData.modalEditMode, this.efcvDialogData.efcvDetails));
        }
        if (property === 'UniqueAddress') {
          validationFn.push(this.uniqueAddressValidator(this.efcvFormData.UId, this.wellList, this.currentWell));
        }
        if (property === 'SerialNumber') {
          validationFn.push(this.serialNumberValidator(this.efcvFormData.SerialNumber, this.wellList, this.currentWell));
        }
      }
      formControl.setValidators(validationFn);

      this.efcvForm.addControl(property, formControl);
    }
    this.setFormGroupData();
    this.validateControl("eFCVName");
    this.validateControl("eFCVAddress");
    this.efcvForm.get("eFCVName").markAsTouched();
    this.efcvForm.get("eFCVAddress").markAsTouched();
  }

  setFormGroupData() {
    let efcvDetails = this.efcvDialogData.efcvDetails;
    const editMode = this.efcvDialogData.modalEditMode;
    if (efcvDetails) {
      this.efcvForm.patchValue({
        Id: efcvDetails.ZoneId,
        // wellId: editMode ? efcvDetails.wellId : this.efcvDialogData.wellId,
        eFCVName: efcvDetails.ZoneName,
        eFCVAddress: Number(efcvDetails.Address),
        SerialNumber: efcvDetails.SerialNumber,
        UniqueAddress: efcvDetails.UId,
        MeasuredDepth: efcvDetails.MeasuredDepth,
        MaxVoltage: editMode ? efcvDetails.MotorSettings?.MaxVoltage : eFCVMotorSettings_Defaults.MaxVoltage,
        MaxCurrent: editMode ? efcvDetails.MotorSettings?.MaxCurrent : eFCVMotorSettings_Defaults.MaxCurrent,
        TargetVoltage: editMode ? efcvDetails.MotorSettings?.TargetVoltage : eFCVMotorSettings_Defaults.TargetVoltage,
        OverCurrentThreshold: editMode ? efcvDetails.MotorSettings?.OverCurrentThreshold : eFCVMotorSettings_Defaults.OverCurrentThreshold,
        OverCurrentOverride: editMode ? (efcvDetails.MotorSettings?.OverCurrentOverrideFlag ? 2 : 1) : 1,
        DutyCycle: editMode ? efcvDetails.MotorSettings?.DutyCycle : eFCVMotorSettings_Defaults.DutyCycle,
        HcmId :  efcvDetails.HcmId?  efcvDetails.HcmId >0 ? efcvDetails.HcmId : UICommon.IsImportConfig ? UICommon.getImportNextDeviceId() : -1 :-1,// this.sie.SIEDeviceId,
      });
    }
  }
  private initInputLabelMap(): void {
    if (eFCVSchema !== undefined &&
      eFCVSchema !== null &&
      eFCVSchema.properties !== undefined &&
      eFCVSchema.properties !== null) {
      for (const property in eFCVSchema.properties) {
        if (eFCVSchema.properties.hasOwnProperty(property)) {
          const prop = eFCVSchema.properties[property];
          if (prop.title !== undefined) {
            this.inputLabelMap.set(property, prop.title);
          }
        }
      }
    }
  }
  getInputLabel(id: string) {
    return this.inputLabelMap.get(id);
  }

  eFCVAddressValidator(currenteFCVAddress: string, zones: any[] ,modalEditMode: Boolean, selectedeFCV: eFCVDataModel): ValidatorFn {
    return (c: AbstractControl): { [key: string]: any } | null => {
      if (c.value === undefined || c.value == null)
        return null;
      
      let eFCVAddress = c.value.toString().trim();
      if(modalEditMode){
        if (zones.length > 0 && eFCVAddress) {
          const newArr = zones.filter(e => e.Address !== currenteFCVAddress);
          const zoneIdx = newArr.findIndex(z => z.Address === eFCVAddress);
          if (zoneIdx !== -1)
            return { customError: 'Address already exists.' };
        }
      }else{
        if (zones.length > 0 && eFCVAddress) {
          const zoneIdx = zones.findIndex(z => z.Address === eFCVAddress && eFCVAddress !== currenteFCVAddress);
          if (zoneIdx !== -1)
            return { customError: 'Address already exists.' };
        }
      }

      return null;
    };
  }

  uniqueAddressValidator(currentUniqueAddress: string, wells: any[], currentWell: MultiNodeWellDataUIModel): ValidatorFn {
    return (c: AbstractControl): { [key: string]: any } | null => {
      if (c.value === undefined || c.value == null)
        return null;

      let uniqueAddress = c.value.toString().trim();
      if (wells.length > 0 && uniqueAddress) {
        for (let i = 0; i < wells.length; i++) {
          const zoneIdx = wells[i]?.Zones?.findIndex(z => z.UId === uniqueAddress && uniqueAddress !== currentUniqueAddress);
          if (zoneIdx !== -1)
            return { customError: 'Address already exists.' };
        }
      } else if (currentWell && uniqueAddress) {
        const zoneIdx = currentWell?.Zones?.findIndex(z => z.UId === uniqueAddress && uniqueAddress !== currentUniqueAddress);
        if (zoneIdx !== -1)
          return { customError: 'Address already exists.' };
      }
      return null;
    };
  }

  serialNumberValidator(currentSerialNumber: string, wells: any[], currentWell: MultiNodeWellDataUIModel): ValidatorFn {
    return (c: AbstractControl): { [key: string]: any } | null => {
      if (c.value === undefined || c.value == null)
        return null;

      let serialNumber = c.value.toString().trim();
      if (wells.length > 0 && serialNumber) {
        for (let i = 0; i < wells.length; i++) {
          const zoneIdx = wells[i]?.Zones?.findIndex(z => z.SerialNumber === serialNumber && serialNumber !== currentSerialNumber);
          if (zoneIdx !== -1)
            return { customError: 'Serial Number already exists.' };
        }
      } else if (currentWell && serialNumber) {
        const zoneIdx = currentWell?.Zones?.findIndex(z => z.SerialNumber === serialNumber && serialNumber !== currentSerialNumber);
        if (zoneIdx !== -1)
          return { customError: 'Serial Number already exists.' };
      }

      return null;
    };
  }
  ngOnInit(): void {
    this.efcvDialogData = this.data;
    this.efcvList = this.efcvDialogData.efcvList;
    this.wellList = this.efcvDialogData.wellList;
    this.currentWell = this.efcvDialogData.currentWell;
    this.efcvFormData = _.cloneDeep(this.efcvDialogData.efcvDetails);
    this.initInputLabelMap();
    this.createFormGroup();
    this.btnText = this.efcvDialogData.modalEditMode ? "APPLY" : "ADD";
    this.editMode = this.efcvDialogData.modalEditMode;
    
    
    /*  this.efcvForm.patchValue({
       Id: this.efcvDialogData.efcvDetails.ZoneId,
       wellId: this.efcvDialogData.modalEditMode ? this.efcvDialogData.efcvDetails.wellId : this.efcvDialogData.wellId,
     }); */
  }
}

export interface IefcvDialogData {
  efcvDetails: eFCVDataModel,
  modalEditMode: boolean,
  efcvList: eFCVDataModel[],
  wellList: MultiNodeWellDataUIModel[];
  currentWell: MultiNodeWellDataUIModel;
  wellId: number,
}
