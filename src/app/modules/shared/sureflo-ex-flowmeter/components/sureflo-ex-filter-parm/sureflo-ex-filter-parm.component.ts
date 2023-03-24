import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';

import { WellFlowTypes } from '@core/models/UIModels/sureflo.model';
import { SureFLO298EXCalibrationModel } from '@core/models/UIModels/sureflo-ex-flowmeter-model';
import { ValidationService } from '@core/services/validation.service';
import { sureflo298EXModelSchema } from '@core/models/schemaModels/SureFLOFlowMeter298Ex.schema';
import { RangeValidator } from '@core/customValidators/rangeValidator.validator';
import { SureFLO298ExConstants } from '../../sureflo298Ex.constant';
import { GwNumberFormatterPipe } from '@shared/gateway-pipes/pipes/gw-number-formatter.pipe';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'sureflo-ex-filter-parm',
  templateUrl: './sureflo-ex-filter-parm.component.html',
  styleUrls: ['./sureflo-ex-filter-parm.component.scss']
})
export class SurefloExFilterParmComponent implements OnInit, OnChanges, OnDestroy {

  @Input() data: SureFLO298EXCalibrationModel;
  @Output() isFormValidEvent = new EventEmitter();

  surefloExFilterParamForm: FormGroup;

   // Validation messages
   formCtrlErrorMessage:any;
   private mapErrMessages: Map<string, string> = new Map<string, string>();

  constructor(private gwNumberPipe: GwNumberFormatterPipe, private validationService: ValidationService) { }
  

  createFormGroup() {
  
    this.surefloExFilterParamForm = new FormGroup({});
    
    for (const property in sureflo298EXModelSchema.definitions.FilterParameters298Ex.properties) {
      if (sureflo298EXModelSchema.definitions.FilterParameters298Ex.properties.hasOwnProperty(property)) {
        const formControl = new FormControl('');
        const validationFn: ValidatorFn[] = [];
        const prop = sureflo298EXModelSchema.definitions.FilterParameters298Ex.properties[property];
        if (prop.minLength !== undefined) {
          validationFn.push(Validators.minLength(prop.minLength));
        }
        if (prop.maxLength !== undefined) {
          validationFn.push(Validators.maxLength(prop.maxLength));
        }

        if (prop.minimum !== undefined && prop.maximum !== undefined) {
          validationFn.push(RangeValidator.range(prop.minimum, prop.maximum));
        } else {
          if (prop.minimum !== undefined) {
            validationFn.push(Validators.min(prop.minimum));
          }

          if (prop.maximum !== undefined) {
            validationFn.push(Validators.max(prop.maximum));
          }
        }

        if (prop.type !== undefined && prop.type === 'number') {
          validationFn.push(this.validationService.ValidateNumber);
        }

        if (sureflo298EXModelSchema.definitions.FilterParameters298Ex.required.includes(property)) {
          validationFn.push(Validators.required);
          this.surefloExFilterParamForm.addControl(property, formControl);
        }
        formControl.setValidators(validationFn);
        
      }
    }
    this.setFormData();
    this.validateOnInit();
  }

  setFormData() {   
    const fuidTypeGasVisibility = WellFlowTypes[this.data.fluidType] === WellFlowTypes[2] ||
                                  WellFlowTypes[this.data.fluidType] === WellFlowTypes[4] ? true : false;
    const thresholdLowVal = fuidTypeGasVisibility ?  0.0010 : 0.0001;
    const filterParameters = this.data?.filterParameters;
      this.surefloExFilterParamForm.patchValue(
        {
          PTBufferLeftWeight: filterParameters ? this.gwNumberPipe.transform(filterParameters.PTBufferLeftWeight) : 20,
          PTBufferRightWeight: filterParameters ? this.gwNumberPipe.transform(filterParameters.PTBufferRightWeight) : 0,
          PTBufferOrder: filterParameters ? this.gwNumberPipe.transform(filterParameters.PTBufferOrder): 3,
          FlowBufferLeftWeight: filterParameters ? this.gwNumberPipe.transform(filterParameters.FlowBufferLeftWeight) : 10,
          FlowBufferRightWeight: filterParameters ? this.gwNumberPipe.transform(filterParameters.FlowBufferRightWeight) : 10,
          FlowBufferOrder: filterParameters ? this.gwNumberPipe.transform(filterParameters.FlowBufferOrder) : 3,
          ThresholdLow: filterParameters ? this.gwNumberPipe.transform(filterParameters.ThresholdLow) : thresholdLowVal,
          ThresholdHigh: filterParameters ? this.gwNumberPipe.transform(filterParameters.ThresholdHigh) : 50
        }
      );
    this.data.filterParameters = this.surefloExFilterParamForm.value;
    this.subscribeToFormDataChanges();
  }

  private subscribeToFormDataChanges() {
    this.surefloExFilterParamForm.valueChanges.pipe(debounceTime(200)).subscribe((val) => {
      this.data.filterParameters = this.surefloExFilterParamForm.value;
      if (!this.surefloExFilterParamForm.pristine && this.surefloExFilterParamForm.valid) {
        this.data.IsDirty = true;
      }
      this.validateFormControls();
      this.isFormValidEvent.emit(this.surefloExFilterParamForm.valid);
    });
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
    Object.keys(this.surefloExFilterParamForm.controls).forEach(key => {
      this.getCtrlErrorMsg(key, this.surefloExFilterParamForm.controls[key]);
    });
    this.formCtrlErrorMessage = [];
    for (let [key, value] of this.mapErrMessages) {
      this.formCtrlErrorMessage[key] = value;
    }
  }

  validateFormControls(): void {
    if (this.surefloExFilterParamForm) {
      this.setFormControlStatus();
    }
  }

  private validateOnInit(): void {
    if (this.surefloExFilterParamForm && this.data?.filterParameters) {
      this.surefloExFilterParamForm.markAllAsTouched();
      this.setFormControlStatus();
    }
  }

  ngOnInit(): void {
    
    this.createFormGroup();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.data.firstChange) {
      this.createFormGroup();
    }
  }

  ngOnDestroy(): void {
    this.data.filterParameters = this.surefloExFilterParamForm.value;
    this.isFormValidEvent.emit(this.surefloExFilterParamForm.valid);
  }

}
