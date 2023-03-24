import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { RangeValidator } from '@core/customValidators/rangeValidator.validator';
import { sureflo298ModelSchema } from '@core/models/schemaModels/SureFLOFlowMeter298.schema';

import { GwNumberFormatterPipe } from '@shared/gateway-pipes/pipes/gw-number-formatter.pipe';
import { SureFLO298CalibrationModel } from '@core/models/UIModels/sureflo-flowmeter-model';
import { FlowMeterDimensions, WellFlowTypes } from '@core/models/webModels/SureFLODataModel.model';
import { ValidationService } from '@core/services/validation.service';
import { SureFLO298Constants } from '../../sureflo298.constants';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'sureflo-gauge-data',
  templateUrl: './sureflo-gauge-data.component.html',
  styleUrls: ['./sureflo-gauge-data.component.scss']
})
export class SurefloGaugeDataComponent implements OnInit, OnChanges, OnDestroy {

  @Input() data: SureFLO298CalibrationModel;
  @Output() isFormValidEvent = new EventEmitter();

  remoteGaugeSecVisibility = false;
  fluidTypeGasVisibility = false;
  fluidTypeWaterVisibility = false;
  positionList = [
    { name: 'Upstream', checked: true },
    { name: 'Downstream', checked: true }
  ];
  // Validation messages
  formCtrlErrorMessage: any;
  private mapErrMessages: Map<string, string> = new Map<string, string>();
  
  surefloGaugeForm: FormGroup;
  
  radioBtnConfig = {
    color: 'primary',
    disabled: false
  };

  constructor(private gwNumberPipe: GwNumberFormatterPipe, private validationService: ValidationService) { }

  createFormGroup() {
    this.surefloGaugeForm = new FormGroup({});
    
    for (const property in sureflo298ModelSchema.definitions.FlowMeterDimensions.properties) {
      if (sureflo298ModelSchema.definitions.FlowMeterDimensions.properties.hasOwnProperty(property)) {
        const formControl = new FormControl('');
        const validationFn: ValidatorFn[] = [];
        const prop = sureflo298ModelSchema.definitions.FlowMeterDimensions.properties[property];
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

        if (sureflo298ModelSchema.definitions.FlowMeterDimensions.required.includes(property)) {
          validationFn.push(Validators.required);
        }
        this.surefloGaugeForm.addControl(property, formControl);
        formControl.setValidators(validationFn);
        
      }
    }
    this.setFormData();
    this.validateOnInit();
  }

  setFormData() {   
    const flowMeterDimensions = this.data?.flowMeterDimensions;
    if (flowMeterDimensions) {
      this.surefloGaugeForm.patchValue(
        {
          InletDiameter: this.gwNumberPipe.transform(flowMeterDimensions.InletDiameter),
          ThroatDiameter: this.gwNumberPipe.transform(flowMeterDimensions.ThroatDiameter),
          RemoteDiameter:  this.gwNumberPipe.transform(flowMeterDimensions.RemoteDiameter),
          LengthP1toP3:  this.gwNumberPipe.transform(flowMeterDimensions.LengthP1toP3),
          StaticCorrection:  this.gwNumberPipe.transform(flowMeterDimensions.StaticCorrection),
          RGCPosition:  this.gwNumberPipe.transform(flowMeterDimensions.RGCPosition)
        }
      );

    } else {
      this.surefloGaugeForm.patchValue({
        RGCPosition: 0
      });
    }

    if(!this.remoteGaugeSecVisibility) {
      this.surefloGaugeForm.patchValue({
        RemoteDiameter: 0,
        LengthP1toP3: 0,
        RGCPosition: 0
      });
    }

    // 298EX Gas Producer / Injector / Water Injector
    if(this.fluidTypeGasVisibility || this.fluidTypeWaterVisibility) {
      this.surefloGaugeForm.patchValue({
        RemoteDiameter: 0,
        RGCPosition:0
      });
    }
    this.subscribeToFormDataChanges();
  }

  private subscribeToFormDataChanges() {
    this.surefloGaugeForm.valueChanges.pipe(debounceTime(200)).subscribe((val) => {
      this.data.flowMeterDimensions = this.surefloGaugeForm.value;
      if (!this.surefloGaugeForm.pristine && this.surefloGaugeForm.valid) {
        this.data.IsDirty = true;
      }
      this.validateFormControls();
      this.isFormValidEvent.emit(this.surefloGaugeForm.valid);
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
    Object.keys(this.surefloGaugeForm.controls).forEach(key => {
      this.getCtrlErrorMsg(key, this.surefloGaugeForm.controls[key]);
    });
    this.formCtrlErrorMessage = [];
    for (let [key, value] of this.mapErrMessages) {
      this.formCtrlErrorMessage[key] = value;
    }
  }

  validateFormControls(): void {
    if (this.surefloGaugeForm) {
      this.setFormControlStatus();
    }
  }

  private validateOnInit(): void {
    if (this.surefloGaugeForm && this.data?.flowMeterDimensions) {
      this.surefloGaugeForm.markAllAsTouched();
      this.setFormControlStatus();
    }
  }

  ngOnInit(): void {
    const fluidTypeId = parseInt(this.data.fluidType);
    this.fluidTypeGasVisibility = fluidTypeId === WellFlowTypes.GasProducer || fluidTypeId === WellFlowTypes.GasInjector ? true : false;
    this.fluidTypeWaterVisibility = fluidTypeId === WellFlowTypes.WaterInjector ? true : false;
    this.remoteGaugeSecVisibility = this.data.useRemoteGauge;
    this.createFormGroup();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.data.firstChange) {
      this.createFormGroup();
    }
  }

  ngOnDestroy(): void {
    this.data.flowMeterDimensions = this.surefloGaugeForm.value as FlowMeterDimensions;
    this.isFormValidEvent.emit(this.surefloGaugeForm.valid);
  }

}
