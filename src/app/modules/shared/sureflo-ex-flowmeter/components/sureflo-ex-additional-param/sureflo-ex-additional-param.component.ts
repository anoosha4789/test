import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';

import { RangeValidator } from '@core/customValidators/rangeValidator.validator';
import { sureflo298EXModelSchema } from '@core/models/schemaModels/SureFLOFlowMeter298Ex.schema';
import { GwNumberFormatterPipe } from '@shared/gateway-pipes/pipes/gw-number-formatter.pipe';
import { SureFLO298EXCalibrationModel } from '@core/models/UIModels/sureflo-ex-flowmeter-model';
import { ValidationService } from '@core/services/validation.service';
import { SureFLO298ExConstants } from '../../sureflo298Ex.constant';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'sureflo-ex-additional-param',
  templateUrl: './sureflo-ex-additional-param.component.html',
  styleUrls: ['./sureflo-ex-additional-param.component.scss']
})
export class SurefloExAdditionalParamComponent implements OnInit, OnChanges, OnDestroy {

  @Input() data: SureFLO298EXCalibrationModel;
  @Output() isFormValidEvent = new EventEmitter();

  surefloExAddParamForm: FormGroup;

  // Validation messages
  formCtrlErrorMessage:any;
  private mapErrMessages: Map<string, string> = new Map<string, string>();

  constructor(private gwNumberPipe: GwNumberFormatterPipe, private validationService: ValidationService) { }

  createFormGroup() {
    this.surefloExAddParamForm = new FormGroup({});

    for (const property in sureflo298EXModelSchema.definitions.AdditionalParameters298Ex.properties) {
      if (sureflo298EXModelSchema.definitions.AdditionalParameters298Ex.properties.hasOwnProperty(property)) {
        const formControl = new FormControl('');
        const validationFn: ValidatorFn[] = [];
        const prop = sureflo298EXModelSchema.definitions.AdditionalParameters298Ex.properties[property];
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

        if (sureflo298EXModelSchema.definitions.AdditionalParameters298Ex.required.includes(property)) {
          validationFn.push(Validators.required);
          this.surefloExAddParamForm.addControl(property, formControl);
        }
        formControl.setValidators(validationFn);
        
      }
    }
    this.surefloExAddParamForm.addControl('WaterCutInversion', new FormControl('', [Validators.required]));
    this.setFormData();
    this.validateOnInit();
  }

  setFormData() {
    const additionalParameters = this.data?.additionalParameters;
    if (additionalParameters) {
      this.surefloExAddParamForm.patchValue(
        {
          CoefficientExpansion: this.gwNumberPipe.transform(additionalParameters.CoefficientExpansion),
          Deviation: this.gwNumberPipe.transform(additionalParameters.Deviation),
          EmulsificationStability: this.gwNumberPipe.transform(additionalParameters.EmulsificationStability),
          MeasuredDepth: this.gwNumberPipe.transform(additionalParameters.MeasuredDepth),
          RoughnessFactor: this.gwNumberPipe.transform(additionalParameters.RoughnessFactor),
          SurfaceWaterCut: this.gwNumberPipe.transform(additionalParameters.SurfaceWaterCut),
          TrueVerticalDepth: this.gwNumberPipe.transform(additionalParameters.TrueVerticalDepth),
          WaterCutInversion: this.gwNumberPipe.transform(additionalParameters.WaterCutInversion)
        }
      );

    }
    this.subscribeToFormDataChanges();
  }

  private subscribeToFormDataChanges() {
    this.surefloExAddParamForm.valueChanges.pipe(debounceTime(200)).subscribe((val) => {
      this.data.additionalParameters = this.surefloExAddParamForm.value;
      if (!this.surefloExAddParamForm.pristine && this.surefloExAddParamForm.valid) {
        this.data.IsDirty = true;
      }
      this.validateFormControls();
      this.isFormValidEvent.emit(this.surefloExAddParamForm.valid);
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
    Object.keys(this.surefloExAddParamForm.controls).forEach(key => {
      this.getCtrlErrorMsg(key, this.surefloExAddParamForm.controls[key]);
    });
    this.formCtrlErrorMessage = [];
    for (let [key, value] of this.mapErrMessages) {
      this.formCtrlErrorMessage[key] = value;
    }
  }

  validateFormControls(): void {
    if (this.surefloExAddParamForm) {
      this.setFormControlStatus();
    }
  }

  private validateOnInit(): void {
    if (this.surefloExAddParamForm && this.data?.additionalParameters) {
      this.surefloExAddParamForm.markAllAsTouched();
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
    this.data.additionalParameters = this.surefloExAddParamForm.value;
    this.isFormValidEvent.emit(this.surefloExAddParamForm.valid);
  }

}
