import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChange, SimpleChanges } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { RangeValidator } from '@core/customValidators/rangeValidator.validator';
import { sureflo298EXModelSchema } from '@core/models/schemaModels/SureFLOFlowMeter298Ex.schema';

import { SureFLO298EXCalibrationModel } from '@core/models/UIModels/sureflo-ex-flowmeter-model';
import { WellFlowTypes } from '@core/models/webModels/SureFLODataModel.model';
import { ValidationService } from '@core/services/validation.service';
import { GwNumberFormatterPipe } from '@shared/gateway-pipes/pipes/gw-number-formatter.pipe';
import { debounceTime } from 'rxjs/operators';
import { SureFLO298ExConstants } from '../../sureflo298Ex.constant';

@Component({
  selector: 'sureflo-ex-gauge-data',
  templateUrl: './sureflo-ex-gauge-data.component.html',
  styleUrls: ['./sureflo-ex-gauge-data.component.scss']
})

export class SurefloExGaugeDataComponent implements OnInit, OnChanges, OnDestroy {

  @Input() data: SureFLO298EXCalibrationModel;
  @Output() isFormValidEvent = new EventEmitter();

  remoteGaugeSecVisibility = false;
  fluidTypeGasVisibility = false;
  fluidTypeWaterVisibility = false;
  positionList = [
    { name: 'Upstream', checked: true },
    { name: 'Downstream', checked: true }
  ];

  // Validation messages
  formCtrlErrorMessage:any;
  private mapErrMessages: Map<string, string> = new Map<string, string>();

  surefloExGaugeForm: FormGroup;
  
  toggleConfig = {
    color: 'primary',
    checked: false,
    disabled: false
  };

  radioBtnConfig = {
    color: 'primary',
    disabled: false
  };


  constructor(private gwNumberPipe: GwNumberFormatterPipe, private validationService: ValidationService) { }

  
  toggle(event: MatSlideToggleChange) {
    this.toggleConfig.checked = event.checked;
  }

  createFormGroup() {
    this.surefloExGaugeForm = new FormGroup({});
    
    for (const property in sureflo298EXModelSchema.definitions.FlowMeterDimensions298Ex.properties) {
      if (sureflo298EXModelSchema.definitions.FlowMeterDimensions298Ex.properties.hasOwnProperty(property)) {
        const formControl = new FormControl('');
        const validationFn: ValidatorFn[] = [];
        const prop = sureflo298EXModelSchema.definitions.FlowMeterDimensions298Ex.properties[property];
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

        if (sureflo298EXModelSchema.definitions.FlowMeterDimensions298Ex.required.includes(property)) {
          validationFn.push(Validators.required);
          this.surefloExGaugeForm.addControl(property, formControl);
        }
        formControl.setValidators(validationFn);
        
      }
    }
    this.surefloExGaugeForm.addControl('RemotePosition', new FormControl('Downstream', [Validators.required]));
    this.setFormData();
    this.validateOnInit();
  }

  setFormData() {   
    const flowMeterDimensions = this.data?.flowMeterDimensions;
    if (flowMeterDimensions) {
      this.surefloExGaugeForm.patchValue(
        {
          InletDiameter: this.gwNumberPipe.transform(flowMeterDimensions.InletDiameter),
          OutletDiameter: this.gwNumberPipe.transform(flowMeterDimensions.OutletDiameter),
          RemoteDiameter: this.gwNumberPipe.transform(flowMeterDimensions.RemoteDiameter),
          InletTolerance: this.gwNumberPipe.transform(flowMeterDimensions.InletTolerance),
          OutletTolerance: this.gwNumberPipe.transform(flowMeterDimensions.OutletTolerance),
          RemoteTolerance: this.gwNumberPipe.transform(flowMeterDimensions.RemoteTolerance),
          StaticCorrection: this.gwNumberPipe.transform(flowMeterDimensions.StaticCorrection),
          DensityStaticCorrection: this.gwNumberPipe.transform(flowMeterDimensions.DensityStaticCorrection),
          RemotePosition: flowMeterDimensions.RemotePosition
        }
      );

    } else {
      this.surefloExGaugeForm.patchValue({
        RemoteDiameter: this.data.useRemoteGauge ? null : 0,
        RemoteTolerance: this.data.useRemoteGauge ? null : 0,
        DensityStaticCorrection: this.data.useRemoteGauge ? null : 0
      });
    }

    // 298EX Gas Producer / Injector / Water Injector
    if(this.fluidTypeGasVisibility || this.fluidTypeWaterVisibility) {
      this.surefloExGaugeForm.patchValue({
        RemoteDiameter: 0,
        RemoteTolerance: 0,
        DensityStaticCorrection: 0,
        RemotePosition:'Downstream'
      });
    }
    this.subscribeToFormDataChanges();
  }

  private subscribeToFormDataChanges() {
    this.surefloExGaugeForm.valueChanges.pipe(debounceTime(200)).subscribe((val) => {
      this.data.flowMeterDimensions = this.surefloExGaugeForm.value;
      if (!this.surefloExGaugeForm.pristine && this.surefloExGaugeForm.valid) {
        this.data.IsDirty = true;
      }
      this.validateFormControls();
      this.isFormValidEvent.emit(this.surefloExGaugeForm.valid);
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
    Object.keys(this.surefloExGaugeForm.controls).forEach(key => {
      this.getCtrlErrorMsg(key, this.surefloExGaugeForm.controls[key]);
    });
    this.formCtrlErrorMessage = [];
    for (let [key, value] of this.mapErrMessages) {
      this.formCtrlErrorMessage[key] = value;
    }
  }

  validateFormControls(): void {
    if (this.surefloExGaugeForm) {
      this.setFormControlStatus();
    }
  }

  private validateOnInit(): void {
    if (this.surefloExGaugeForm && this.data?.flowMeterDimensions) {
      this.surefloExGaugeForm.markAllAsTouched();
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
    this.data.flowMeterDimensions = this.surefloExGaugeForm.value;
    this.isFormValidEvent.emit(this.surefloExGaugeForm.valid);
  }

}
