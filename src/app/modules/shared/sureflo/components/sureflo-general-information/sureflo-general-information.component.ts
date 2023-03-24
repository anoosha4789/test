import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';

import { FlowMeterTypes, WellFlowTypes, SureFLOFlowMeterUIModel } from '@core/models/UIModels/sureflo.model';
import { FlowMeterTypes as fmTypes, WellFlowTypes as welFmTypes } from '@core/models/webModels/SureFLODataModel.model';
import { GatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { SurefloFacade } from '@core/facade/surefloFacade.service';
import { ValidationService } from '@core/services/validation.service';
import { SureFLO298ExUIFlowMeterUIModel } from '@core/models/UIModels/sureflo-ex-flowmeter-model';
import { SureFLO298UIFlowMeterUIModel } from '@core/models/UIModels/sureflo-flowmeter-model';


@Component({
  selector: 'sureflo-general-information',
  templateUrl: './sureflo-general-information.component.html',
  styleUrls: ['./sureflo-general-information.component.scss']
})
export class SurefloGeneralInformationComponent extends GatewayPanelBase implements OnInit, OnDestroy {

  @Input() data: SureFLOFlowMeterUIModel;
  @Output() onFlowMeterDataChange:EventEmitter<any> = new EventEmitter();

  // Validation messages
  formCtrlErrorMessage: any;
  private mapErrMessages: Map<string, string> = new Map<string, string>();
  surefloGeneralInfoForm: FormGroup;
  isReadOnly = false;
  nameErrorMsg = null;
  flowMeterTypes = Object.values(FlowMeterTypes).filter(value => typeof value === 'string');
  wellFlowTypes = Object.values(WellFlowTypes).filter(value => typeof value === 'string');

  constructor(protected store: Store, private surefloDataFacade: SurefloFacade, private validationService : ValidationService) { 
      super(store, null, null, null, null, null, null, surefloDataFacade);
  }

  onTechnologySelChange(event) {
    if(this.data) {
      this.data.CalibrationFileName = null;
      this.data["flowMeterPTMapping"] = null;
    }
  }

  onWellTypeSelChange(event) {
    if(this.data) {
      this.data.CalibrationFileName = null;
      this.data["flowMeterPTMapping"] = null;
    }
  }

  private subscribeToFormDataChanges() {
    this.surefloGeneralInfoForm.valueChanges.subscribe((val) => {
      this.validateFormControls();
    });
  }

   // Validators
   flowMeterNameValidator(): ValidatorFn {
    return (c: AbstractControl): { [key: string]: any } | null => {
        if (c.value === undefined || c.value == null || c.value == "")
            return null;
         
       this.data.DeviceName = c.value;
       if(!this.validateFlowMeterName(false)) { 
          this.nameErrorMsg =  'Name already exists.'
          return;
       }

        return null;
    };
  }

  validateFlowMeterName(bLoading: boolean): boolean {
    let isValidFlowMeterName = true;
    for (let i = 0; i < this.surefloEnity.length; i++) {
      if (this.surefloEnity[i].DeviceName.toLowerCase().trim() === this.data.DeviceName.toLowerCase().trim()) {
        isValidFlowMeterName = false;
      }
    }
    return isValidFlowMeterName;
  }


  createFormGroup() {
    this.surefloGeneralInfoForm = new FormGroup({
      Name: new FormControl('', [Validators.required, Validators.maxLength(50), Validators.pattern('^[A-Za-z0-9-_#]+[A-Za-z0-9-_# ]*$')]),
      Serial: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      FluidType: new FormControl(this.wellFlowTypes[0].toString()), 
      Technology: new FormControl(this.flowMeterTypes[0].toString()),
    });
    if(this.data) {
      this.surefloGeneralInfoForm.patchValue(
        {
          Name: this.data.DeviceName,
          Serial: this.data.Serial,
          FluidType: WellFlowTypes[this.data.FluidType],
          Technology:FlowMeterTypes[this.data.Technology]
        }
      );
      if(this.data.DeviceId > 0 ) {
        this.isReadOnly = true;
      }
    }
    this.subscribeToFormDataChanges();
  }

  getCtrlErrorMsg(ctrlName: string, ctrl: AbstractControl) {
    let errorMsg = '';
    if ((ctrl.dirty || ctrl.touched) && ctrl.errors) {
      ctrl.markAsTouched();
      errorMsg = this.validationService.getValidationErrorMessage(ctrl.errors, ctrlName);
      this.mapErrMessages.set(ctrlName, errorMsg);
    } else {
      this.mapErrMessages.delete(ctrlName);
      if (ctrlName === 'Name') {
        this.validateName(ctrlName, ctrl);
      } else if (ctrlName === 'Serial') {
        this.validateSerial(ctrlName, ctrl);
      }
    }
    return errorMsg;
  }

  private setFormControlStatus() {
    Object.keys(this.surefloGeneralInfoForm.controls).forEach(key => {
      this.getCtrlErrorMsg(key, this.surefloGeneralInfoForm.controls[key]);
    });
    this.formCtrlErrorMessage = [];
    for (let [key, value] of this.mapErrMessages) {
      this.formCtrlErrorMessage[key] = value;
    }
  }

  validateFormControls(): void {
    if (this.surefloGeneralInfoForm) {
      this.setFormControlStatus();
    }
  }

  validateName(ctrlName: string, ctrl: AbstractControl) {
    const deviceName: string = ctrl.value;
    if (deviceName.length > 0) {
      const flowmeterIdx = this.surefloEnity.findIndex(fm => fm.DeviceId !== this.data.DeviceId &&
        fm.DeviceName.trim().toLowerCase() === deviceName.trim().toLowerCase());
      if (flowmeterIdx !== -1) {
        this.surefloGeneralInfoForm.controls[ctrlName].setErrors({ notUnique: true });
        this.surefloGeneralInfoForm.controls[ctrlName].markAsTouched();
        this.surefloGeneralInfoForm.setErrors({ 'invalid': true });
      } else {
        this.surefloGeneralInfoForm.controls[ctrlName].setErrors(null);
        this.surefloGeneralInfoForm.setErrors(null);
        this.mapErrMessages.delete(ctrlName);
      }
    }
  }

  validateSerial(ctrlName: string, ctrl: AbstractControl) {
    const serialNumber: string = ctrl.value;
    if (serialNumber.length > 0) {
      const flowmeterIdx = this.surefloEnity.findIndex(fm => fm.DeviceId !== this.data.DeviceId &&
        fm.Serial.trim().toLowerCase() === serialNumber.trim().toLowerCase());
      if (flowmeterIdx !== -1) {
        this.surefloGeneralInfoForm.controls[ctrlName].setErrors({ notUnique: true });
        this.surefloGeneralInfoForm.controls[ctrlName].markAsTouched();
        this.surefloGeneralInfoForm.setErrors({ 'invalid': true });
      } else {
        this.surefloGeneralInfoForm.controls[ctrlName].setErrors(null);
        this.surefloGeneralInfoForm.setErrors(null);
        this.mapErrMessages.delete(ctrlName);
      }
    }
  }

  postCallGetFlowMeters() {}

  ngOnInit(): void {
    super.ngOnInit();
    this.initFlowMeters();
    this.createFormGroup();
  }

  updateGenInfoFormData() {
    if(this.data) { 
      this.data.DeviceName = this.surefloGeneralInfoForm.value.Name;
      this.data.Serial = this.surefloGeneralInfoForm.value.Serial;
      this.data.FluidType = WellFlowTypes[this.surefloGeneralInfoForm.value.FluidType];
      this.data.Technology = FlowMeterTypes[this.surefloGeneralInfoForm.value.Technology];
      const stepperData: SureFLOFlowMeterUIModel = this.data;
      this.onFlowMeterDataChange.emit(stepperData);
    }
  }
  
  ngOnDestroy(): void {
    if(!this.surefloGeneralInfoForm?.pristine && this.surefloGeneralInfoForm?.valid) {
      this.updateGenInfoFormData();
    }
    super.ngOnDestroy();
  }

}
