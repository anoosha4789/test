import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';

import { GwNumberFormatterPipe } from '@shared/gateway-pipes/pipes/gw-number-formatter.pipe';
import { RangeValidator } from '@core/customValidators/rangeValidator.validator';
import { sureflo298ModelSchema } from '@core/models/schemaModels/SureFLOFlowMeter298.schema';
import { SureFLO298CalibrationModel } from '@core/models/UIModels/sureflo-flowmeter-model';
import { WellFlowTypes } from '@core/models/webModels/SureFLODataModel.model';
import { ValidationService } from '@core/services/validation.service';
import { SureFLO298Constants } from '../../sureflo298.constants';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'sureflo-additional-param',
  templateUrl: './sureflo-additional-param.component.html',
  styleUrls: ['./sureflo-additional-param.component.scss']
})
export class SurefloAdditionalParamComponent implements OnInit, OnChanges, OnDestroy {

  @Input() data: SureFLO298CalibrationModel;
  @Output() isFormValidEvent = new EventEmitter();

  // Validation messages
  formCtrlErrorMessage: any;
  private mapErrMessages: Map<string, string> = new Map<string, string>();
  surefloAddParamForm: FormGroup;
  fluidTypeGasVisibility = false;
  fluidTypeWaterVisibility = false;

  constructor(private gwNumberPipe: GwNumberFormatterPipe, private validationService : ValidationService) { }

  createFormGroup() {
    this.surefloAddParamForm = new FormGroup({});
    
    for (const property in sureflo298ModelSchema.definitions.AdditionalParameters.properties) {
      if (sureflo298ModelSchema.definitions.AdditionalParameters.properties.hasOwnProperty(property)) {
        const formControl = new FormControl('');
        const validationFn: ValidatorFn[] = [];
        const prop = sureflo298ModelSchema.definitions.AdditionalParameters.properties[property];
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

        if (sureflo298ModelSchema.definitions.AdditionalParameters.required.includes(property)) {
          validationFn.push(Validators.required);
        }
        this.surefloAddParamForm.addControl(property, formControl);
        formControl.setValidators(validationFn);
        
      }
    }
    this.setFormData();
    this.validateOnInit();
  }

  setFormData() {
    const additionalParameters = this.data?.additionalParameters;
    if (additionalParameters) {
      this.surefloAddParamForm.patchValue(
        {
          Deviation: this.gwNumberPipe.transform(additionalParameters.Deviation),
          FrictionFactor: this.gwNumberPipe.transform(additionalParameters.FrictionFactor),
          DeltaThreshold: this.gwNumberPipe.transform(additionalParameters.DeltaThreshold),
          SurfaceWaterCutPercent: this.gwNumberPipe.transform(additionalParameters.SurfaceWaterCutPercent),
          DHWaterCutPercent: this.gwNumberPipe.transform(additionalParameters.DHWaterCutPercent),
          CD: this.gwNumberPipe.transform(additionalParameters.CD),
          ProducedGasGravity: this.gwNumberPipe.transform(additionalParameters.ProducedGasGravity)
        }
      );

    } 

    if (this.fluidTypeGasVisibility) {
      this.surefloAddParamForm.patchValue(
        {
          Deviation: 0,
          FrictionFactor: 0,
          SurfaceWaterCutPercent: 0,
          DHWaterCutPercent: 0,
          CD: 0
        }
      );
    } else if (this.fluidTypeWaterVisibility) {
      this.surefloAddParamForm.patchValue(
        {
          Deviation: 0,
          FrictionFactor: 0,
          SurfaceWaterCutPercent: 0,
          DHWaterCutPercent: 0,
          ProducedGasGravity: 0
        }
      );
    } else {
      this.surefloAddParamForm.patchValue({ ProducedGasGravity: 0 });
    }

    this.subscribeToFormDataChanges();
  }

  private subscribeToFormDataChanges() {
    this.surefloAddParamForm.valueChanges.pipe(debounceTime(200)).subscribe((val) => {
      this.data.additionalParameters = this.surefloAddParamForm.value;
      if (!this.surefloAddParamForm.pristine && this.surefloAddParamForm.valid) {
        this.data.IsDirty = true;
      }
      this.isFormValidEvent.emit(this.surefloAddParamForm.valid);
      this.validateFormControls();
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
    Object.keys(this.surefloAddParamForm.controls).forEach(key => {
      this.getCtrlErrorMsg(key, this.surefloAddParamForm.controls[key]);
    });
    this.formCtrlErrorMessage = [];
    for (let [key, value] of this.mapErrMessages) {
      this.formCtrlErrorMessage[key] = value;
    }
  }

  validateFormControls(): void {
    if (this.surefloAddParamForm) {
      this.setFormControlStatus();
    }
  }

  private validateOnInit(): void {
    if (this.surefloAddParamForm && this.data?.additionalParameters) {
      this.surefloAddParamForm.markAllAsTouched();
      this.setFormControlStatus();
    }
  }

  ngOnInit(): void {
    const fluidTypeId = parseInt(this.data.fluidType);
    this.fluidTypeGasVisibility = fluidTypeId === WellFlowTypes.GasProducer || fluidTypeId === WellFlowTypes.GasInjector ? true : false;
    this.fluidTypeWaterVisibility = fluidTypeId === WellFlowTypes.WaterInjector ? true : false;
    this.createFormGroup();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.data.firstChange) {
      this.createFormGroup();
    }
  }

  ngOnDestroy(): void {
    this.data.additionalParameters = this.surefloAddParamForm.value;
    this.isFormValidEvent.emit(this.surefloAddParamForm.valid);
  }

}
