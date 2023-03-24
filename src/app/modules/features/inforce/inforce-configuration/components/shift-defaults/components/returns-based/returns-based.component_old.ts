import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { RangeValidator } from '@core/customValidators/rangeValidator.validator';
import { InForceGeneralSettingsTabOrder } from '@core/data/UICommon';
import { ShiftDefaultModelSchema } from '@core/models/schemaModels/ShiftDefaultsDataModel.schema';
import { ShiftDefaultUIModel } from '@core/models/UIModels/shift-default.model';
import { ValidationService } from '@core/services/validation.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'gw-inforce-returns-based',
  templateUrl: './returns-based.component.html',
  styleUrls: ['./returns-based.component.scss']
})
export class ReturnsBasedComponent implements OnInit, OnChanges, OnDestroy {

  @Input() shiftDefaultData: ShiftDefaultUIModel;
  @Input() selectedTab: number;
  @Output() isReturnFormValidEvent = new EventEmitter();
  @Output() onFormChangeEvent = new EventEmitter<{ valid: Boolean, data: ShiftDefaultUIModel}>();
  
  returnsBasedShiftForm: FormGroup;
  formCtrlErrorMessage: any;
  private mapErrMessages: Map<string, string> = new Map<string, string>();
  unitVal = 'mL';
  constructor(private validationService: ValidationService) { }

  onDropdownChange(val) {
    this.unitVal = val;
    const toleranceProperties = ['ToleranceHigh', 'ToleranceLow'];
    for (const property of toleranceProperties) {
      const formControl = this.returnsBasedShiftForm.get(property);
      const validationFn: ValidatorFn[] = [];
      const prop = ShiftDefaultModelSchema.definitions.ReturnsBasedShiftDefaultsModel.properties[property];
      if (val === '%') {
        validationFn.push(RangeValidator.range(0, 100));
      } else {
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
      }

      if (prop.type !== undefined && prop.type === 'number') {
        validationFn.push(this.validationService.ValidateNumber);
      }

      if (ShiftDefaultModelSchema.definitions.ReturnsBasedShiftDefaultsModel.required.includes(property)) {
        validationFn.push(Validators.required);
      }

      formControl.setValidators(validationFn);
      formControl.updateValueAndValidity();
    }
  }

  onMaxShiftTimeChange(val) {
    const timeProperties = ['PressureLockTime', 'VentTime', 'MinShiftTime'];
    for (const property of timeProperties) {
      const formControl = this.returnsBasedShiftForm.get(property);
      const validationFn: ValidatorFn[] = [];
      const prop = ShiftDefaultModelSchema.definitions.ReturnsBasedShiftDefaultsModel.properties[property];
      if (val !== '') {
        const maxVal = Number(val);
        validationFn.push(RangeValidator.range(0, maxVal));
      } else {
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
      }

      if (prop.type !== undefined && prop.type === 'integer') {
        validationFn.push(this.validationService.ValidateInteger);
      }

      if (ShiftDefaultModelSchema.definitions.ReturnsBasedShiftDefaultsModel.required.includes(property)) {
        validationFn.push(Validators.required);
      }

      formControl.setValidators(validationFn);
      formControl.updateValueAndValidity();
    }
  }

  createFormGroup() {

    this.returnsBasedShiftForm = new FormGroup({});

    for (const property in ShiftDefaultModelSchema.definitions.ReturnsBasedShiftDefaultsModel.properties) {
      if (ShiftDefaultModelSchema.definitions.ReturnsBasedShiftDefaultsModel.properties.hasOwnProperty(property)) {
        const formControl = new FormControl('');
        const validationFn: ValidatorFn[] = [];
        const prop = ShiftDefaultModelSchema.definitions.ReturnsBasedShiftDefaultsModel.properties[property];
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

        if (prop.type !== undefined && prop.type === 'integer') {
          validationFn.push(this.validationService.ValidateInteger);
        }

        if (ShiftDefaultModelSchema.definitions.ReturnsBasedShiftDefaultsModel.required.includes(property)) {
          validationFn.push(Validators.required);
        }
        this.returnsBasedShiftForm.addControl(property, formControl);
        formControl.setValidators(validationFn);

      }
    }
    this.returnsBasedShiftForm.get('MaxShiftTime').valueChanges.subscribe((val) => {
      this.onMaxShiftTimeChange(val);
    })
    this.setFormData();
  }

  setFormData() {

    if (this.shiftDefaultData && this.shiftDefaultData.ReturnsBasedShiftDefaults) {
      this.returnsBasedShiftForm.patchValue({
        ToleranceHigh: this.shiftDefaultData.ReturnsBasedShiftDefaults.ToleranceHigh,
        ToleranceLow: this.shiftDefaultData.ReturnsBasedShiftDefaults.ToleranceLow,
        IntervalTime: this.shiftDefaultData.ReturnsBasedShiftDefaults.IntervalTime,
        IntervalCount: this.shiftDefaultData.ReturnsBasedShiftDefaults.IntervalCount,
        StablizationDeadband: this.shiftDefaultData.ReturnsBasedShiftDefaults.StablizationDeadband,
        PressureLockTime: this.shiftDefaultData.ReturnsBasedShiftDefaults.PressureLockTime,
        VentTime: this.shiftDefaultData.ReturnsBasedShiftDefaults.VentTime,
        MinShiftTime: this.shiftDefaultData.ReturnsBasedShiftDefaults.MinShiftTime,
        MaxShiftTime: this.shiftDefaultData.ReturnsBasedShiftDefaults.MaxShiftTime,
        IdShiftDefault: this.shiftDefaultData.ReturnsBasedShiftDefaults.IdShiftDefault,
        IsToleranceUnitInPercentage: this.shiftDefaultData.ReturnsBasedShiftDefaults.IsToleranceUnitInPercentage,
        MinimumReturnsFlowRateForStabilization: this.shiftDefaultData.ReturnsBasedShiftDefaults.MinimumReturnsFlowRateForStabilization,
        ReturnFlowStabilizationCheckingPeriodInSeconds: this.shiftDefaultData.ReturnsBasedShiftDefaults.ReturnFlowStabilizationCheckingPeriodInSeconds,
        MinimumResetTime: this.shiftDefaultData.ReturnsBasedShiftDefaults.MinimumResetTime
      });
    } else {
      this.returnsBasedShiftForm.patchValue({
        ToleranceHigh: 15,
        ToleranceLow: 15,
        IntervalTime:0,
        IntervalCount:0,
        StablizationDeadband:0,
        PressureLockTime: 30,
        VentTime: 30,
        MinShiftTime: 60,
        MaxShiftTime: 300,
        IdShiftDefault: -1,
        IsToleranceUnitInPercentage: 0,
        MinimumReturnsFlowRateForStabilization: 0.9,
        ReturnFlowStabilizationCheckingPeriodInSeconds: 5,
        MinimumResetTime: 20
      });
    }
    this.subscribeToFormDataChanges();
    this.validateOnInit();
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

  validateFormControls(): void {
    if (this.returnsBasedShiftForm) {
      this.setFormControlStatus();
    }
  }

  private setFormControlStatus() {
    Object.keys(this.returnsBasedShiftForm.controls).forEach(key => {
      this.getCtrlErrorMsg(key, this.returnsBasedShiftForm.controls[key]);
    });
    this.formCtrlErrorMessage = [];
    for (let [key, value] of this.mapErrMessages) {
      this.formCtrlErrorMessage[key] = value;
    }
  }

  private subscribeToFormValidationEvent() {
    this.returnsBasedShiftForm.statusChanges
    .pipe( filter(() => this.returnsBasedShiftForm.valid)).subscribe(() => {
      if (this.returnsBasedShiftForm && this.selectedTab == InForceGeneralSettingsTabOrder.SHIFT_DEFAULTS)
        this.isReturnFormValidEvent.emit(true);
    });

    this.returnsBasedShiftForm.statusChanges
    .pipe( filter(() => this.returnsBasedShiftForm.invalid)).subscribe(() => {
      if (this.returnsBasedShiftForm && this.selectedTab == InForceGeneralSettingsTabOrder.SHIFT_DEFAULTS)
        this.isReturnFormValidEvent.emit(false);
    });
  }

  private subscribeToFormDataChanges() {
    this.returnsBasedShiftForm.valueChanges.subscribe((val) => {
      if (!this.returnsBasedShiftForm.pristine && this.returnsBasedShiftForm.valid) {
        this.shiftDefaultData.ReturnsBasedShiftDefaults = this.returnsBasedShiftForm.value;
        if(this.shiftDefaultData.TimeBasedShiftDefaults === null) {
          this.shiftDefaultData.TimeBasedShiftDefaults = {
            PressureLockTime: 30,
            VentTime: 60,
            ShiftTime: 300,
            IdShiftDefault: -1,
            MinimumResetTime: 20
          }
        }
        this.onFormChangeEvent.emit({ valid: true, data: this.shiftDefaultData});
      }
      this.validateFormControls();
    });
  }

  private validateOnInit(): void {
    if (this.returnsBasedShiftForm && this.shiftDefaultData.ReturnsBasedShiftDefaults) {
      this.returnsBasedShiftForm.markAllAsTouched();
      this.setFormControlStatus();
      this.isReturnFormValidEvent.emit(this.returnsBasedShiftForm.valid);
    }
  }

  ngOnDestroy(): void {
    this.shiftDefaultData.ReturnsBasedShiftDefaults = this.returnsBasedShiftForm.value;
    this.onFormChangeEvent.emit({ valid: this.returnsBasedShiftForm.valid, data: this.shiftDefaultData });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // if (!changes.data.firstChange) {
    //   this.createFormGroup();
    // }
  }

  ngOnInit(): void {
    this.createFormGroup();
    this.subscribeToFormValidationEvent();
  }

}
