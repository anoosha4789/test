import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RangeValidator } from '@core/customValidators/rangeValidator.validator';
import { isFloat } from '@core/data/UICommon';
import { ShiftDefaultModelSchema } from '@core/models/schemaModels/ShiftDefaultsDataModel.schema';
import { ErrorNotifierModel } from '@core/models/UIModels/error-notifier-model';
import { ShiftDefaultUIModel } from '@core/models/UIModels/shift-default.model';
import { ValidationService } from '@core/services/validation.service';
import { initialShiftDefaultState } from '@store/state/shift-default.state';
import * as _ from 'lodash';

export const UNITS = {
   ml: "mL",
   percentage: '%'
}

@Component({
  selector: 'gw-inforce-returns-based',
  templateUrl: './returns-based.component.html',
  styleUrls: ['./returns-based.component.scss']
})

export class ReturnsBasedComponent implements OnInit, OnDestroy, AfterViewInit {

  @Input() shiftDefaultData: ShiftDefaultUIModel;
  @Input() readOnly: boolean = false;
  @Input() showHCMSSleeveSettings: boolean = false;
  @Output() isReturnFormValidEvent = new EventEmitter();
  @Output() returnBasedFormInValidEvent= new EventEmitter();
  @Output() onFormChangeEvent = new EventEmitter<{ dirty: Boolean, valid: Boolean, data: ShiftDefaultUIModel}>();

  returnsBasedShiftForm: FormGroup;
  formCtrlErrorMessage: any;
  private mapErrMessages: Map<string, string> = new Map<string, string>();
  defUnitVal: string;

  constructor(protected router: Router, private validationService: ValidationService) { }

  onUnitDropdownChange(val) {
    this.defUnitVal = val;
    if (this.defUnitVal === UNITS.percentage) {
      this.validateMeasurementSetting();
    } else {
      this.resetToleranceFormControls();
    }
    this.returnsBasedShiftForm.patchValue({
      IsToleranceUnitInPercentage :  this.defUnitVal === UNITS.percentage ? 1 : 0
    });
    this.setFormControlStatus();
  }

  validateMeasurementSetting() {
    const toleranceHighCtrl = this.returnsBasedShiftForm.get('ToleranceHigh');
    const toleranceLowCtrl = this.returnsBasedShiftForm.get('ToleranceLow');
    const stabIntervalCtrl = this.returnsBasedShiftForm.get('ReturnFlowStabilizationCheckingPeriodInSeconds');
    if (this.defUnitVal === UNITS.percentage) {
      if (!toleranceHighCtrl.errors) {
        const tolHighCtrlErrors = toleranceHighCtrl.value !== null && toleranceHighCtrl.value >= 0 && toleranceHighCtrl.value <= 100 ? null :
          (toleranceHighCtrl.value === null ? { required: true } : { invalidPercentage: true });
        toleranceHighCtrl.setErrors(tolHighCtrlErrors);
      }
      if (!toleranceLowCtrl.errors) {
        const tolLowCtrlErrors = toleranceLowCtrl.value !== null && toleranceLowCtrl.value >= 0 && toleranceLowCtrl.value <= 100 ? null :
          (toleranceLowCtrl.value === null ? { required: true } : { invalidPercentage: true });
        toleranceLowCtrl.setErrors(tolLowCtrlErrors);
      }
    }
    if (isFloat(stabIntervalCtrl.value) || stabIntervalCtrl.value < 0) {
      const stabIntervalCtrlErrors = isFloat(stabIntervalCtrl.value) ? { notInteger: true }  : { invalidInput: true };
      stabIntervalCtrl.setErrors(stabIntervalCtrlErrors);
    }

  }

  validateSleeveSetting() {
    const minResetTimeCtrl = this.returnsBasedShiftForm.get('MinimumResetTime');
    if (isFloat(minResetTimeCtrl.value) || minResetTimeCtrl.value < 0) {
      const minResetTimeCtrlErrors = isFloat(minResetTimeCtrl.value) ? { notInteger: true }  : { invalidInput: true };
      minResetTimeCtrl.setErrors(minResetTimeCtrlErrors);
    }
  }

  resetToleranceFormControls() {
    const toleranceHighCtrl = this.returnsBasedShiftForm.get('ToleranceHigh');
    const toleranceLowCtrl = this.returnsBasedShiftForm.get('ToleranceLow');
    if(toleranceHighCtrl.errors?.invalidPercentage) toleranceHighCtrl.setErrors(null);
    if(toleranceLowCtrl.errors?.invalidPercentage) toleranceLowCtrl.setErrors(null);
  }

  // Validate controls time settings section based on max shift time value
  validateTimeSetting() {
    const pressureLockCtrl = this.returnsBasedShiftForm.get('PressureLockTime');
    const ventTimeCtrl = this.returnsBasedShiftForm.get('VentTime');
    const minShiftTimeCtrl = this.returnsBasedShiftForm.get('MinShiftTime');
    const maxShiftTimeCtrl = this.returnsBasedShiftForm.get('MaxShiftTime');
    
    if (Number.isInteger(pressureLockCtrl.value)) {
      const pressureLockCtrlErrors = pressureLockCtrl.value > 0 && pressureLockCtrl.value < maxShiftTimeCtrl.value ? null :
                                     (pressureLockCtrl.value <= 0 ? { invalidInput: true } : { invalidMaxShiftTime: true });
      pressureLockCtrl.setErrors(pressureLockCtrlErrors);
    } else {
      const pressureLockCtrlErrors = isFloat(pressureLockCtrl.value) ? { notInteger: true } :
                                     (pressureLockCtrl.value === null ? { required: true } : null);
      pressureLockCtrl.setErrors(pressureLockCtrlErrors);
    }

    if (Number.isInteger(ventTimeCtrl.value)) {
      const ventTimeCtrlErrors = ventTimeCtrl.value > 0 && ventTimeCtrl.value < maxShiftTimeCtrl.value ? null :
                                 (ventTimeCtrl.value <= 0 ? { invalidInput: true } : { invalidMaxShiftTime: true });
      ventTimeCtrl.setErrors(ventTimeCtrlErrors);
    } else {
      const ventTimeCtrlErrors = isFloat(ventTimeCtrl.value) ? { notInteger: true } :
                                 (ventTimeCtrl.value === null ? { required: true } : null);
      ventTimeCtrl.setErrors(ventTimeCtrlErrors);
    }

    if (Number.isInteger(minShiftTimeCtrl.value)) {
      const minShiftTimeCtrlErrors = minShiftTimeCtrl.value > 0 && minShiftTimeCtrl.value < maxShiftTimeCtrl.value ? null :
                                     (minShiftTimeCtrl.value <= 0 ? { invalidInput: true } : { invalidMaxShiftTime: true });
      minShiftTimeCtrl.setErrors(minShiftTimeCtrlErrors);
    } else {
      const minShiftTimeCtrlErrors = isFloat(minShiftTimeCtrl.value) ? { notInteger: true } :
                                     (minShiftTimeCtrl.value === null ? { required: true } : null);
      minShiftTimeCtrl.setErrors(minShiftTimeCtrlErrors);
    }

    if (isFloat(maxShiftTimeCtrl.value) || maxShiftTimeCtrl.value < 0) {
      const maxShiftTimeCtrlErrors = isFloat(maxShiftTimeCtrl.value) ? { notInteger: true }  : { invalidInput: true };
      maxShiftTimeCtrl.setErrors(maxShiftTimeCtrlErrors);
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
        
        // if (prop.type !== undefined && prop.type === 'integer') {
        //   validationFn.push(this.validationService.ValidateInteger);
        // }

        if (ShiftDefaultModelSchema.definitions.ReturnsBasedShiftDefaultsModel.required.includes(property)) {
          validationFn.push(Validators.required);
        }
        this.returnsBasedShiftForm.addControl(property, formControl);
        formControl.setValidators(validationFn);

      }
    }
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
        MinimumResetTime: this.shiftDefaultData.ReturnsBasedShiftDefaults.MinimumResetTime/60
      });
      this.defUnitVal = this.shiftDefaultData.ReturnsBasedShiftDefaults.IsToleranceUnitInPercentage === 1 ? UNITS.percentage : UNITS.ml;
    } else {
      this.returnsBasedShiftForm.patchValue({
        ToleranceHigh: initialShiftDefaultState.shiftDefaults.ReturnsBasedShiftDefaults.ToleranceHigh,
        ToleranceLow: initialShiftDefaultState.shiftDefaults.ReturnsBasedShiftDefaults.ToleranceLow,
        IntervalTime: initialShiftDefaultState.shiftDefaults.ReturnsBasedShiftDefaults.IntervalTime,
        IntervalCount: initialShiftDefaultState.shiftDefaults.ReturnsBasedShiftDefaults.IntervalCount,
        StablizationDeadband: initialShiftDefaultState.shiftDefaults.ReturnsBasedShiftDefaults.StablizationDeadband,
        PressureLockTime: initialShiftDefaultState.shiftDefaults.ReturnsBasedShiftDefaults.PressureLockTime,
        VentTime: initialShiftDefaultState.shiftDefaults.ReturnsBasedShiftDefaults.VentTime,
        MinShiftTime: initialShiftDefaultState.shiftDefaults.ReturnsBasedShiftDefaults.MinShiftTime,
        MaxShiftTime: initialShiftDefaultState.shiftDefaults.ReturnsBasedShiftDefaults.MaxShiftTime,
        IdShiftDefault: -1,
        IsToleranceUnitInPercentage: initialShiftDefaultState.shiftDefaults.ReturnsBasedShiftDefaults.IsToleranceUnitInPercentage,
        MinimumReturnsFlowRateForStabilization: initialShiftDefaultState.shiftDefaults.ReturnsBasedShiftDefaults.MinimumReturnsFlowRateForStabilization,
        ReturnFlowStabilizationCheckingPeriodInSeconds: initialShiftDefaultState.shiftDefaults.ReturnsBasedShiftDefaults.ReturnFlowStabilizationCheckingPeriodInSeconds,
        MinimumResetTime: initialShiftDefaultState.shiftDefaults.ReturnsBasedShiftDefaults.MinimumResetTime/60
      });
      this.defUnitVal = UNITS.ml;
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
    }
    return errorMsg;
  }

  validateFormControls(): void {
    this.returnsBasedShiftForm.markAllAsTouched();
    this.validateMeasurementSetting();
    this.validateTimeSetting();
    this.validateSleeveSetting();
    this.setFormControlStatus();
  }

  private setFormControlStatus() {
    Object.keys(this.returnsBasedShiftForm.controls).forEach(key => {
      this.getCtrlErrorMsg(key, this.returnsBasedShiftForm.controls[key]);
    });
    this.formCtrlErrorMessage = [];
    for (let [key, value] of this.mapErrMessages) {
      this.formCtrlErrorMessage[key] = value;
    }
    this.isReturnFormValidEvent.emit(this.mapErrMessages.size === 0 ? true : false);
    this.setErrorNotifierList();
  }

  setErrorNotifierList() {
    const errorList = [...this.mapErrMessages].map(([name, value]) => ({ 
      name, 
      value: this.setErrorDisplayLabel(name, value)
    }));
    if (errorList && errorList.length > 0) {
      const errorDetails: ErrorNotifierModel = {
        path: this.router.url,
        tabName:'Shift Defaults - Returns Based',
        tabIndex: 3,
        errors: errorList
      };
      this.returnBasedFormInValidEvent.emit(errorDetails);
    } else {
      this.returnBasedFormInValidEvent.emit(null)
    } 

  }

  setErrorDisplayLabel(name, value) {
    let displayName = null;
    switch (name) {

      case 'ToleranceHigh':
        displayName = `Tolerance High : ${value}`
        break;
      case 'ToleranceLow':
        displayName = `Tolerance Low : ${value}`
        break;
      case 'ReturnFlowStabilizationCheckingPeriodInSeconds':
        displayName = `Stabilization Interval : ${value}`
        break;
      case 'MinimumReturnsFlowRateForStabilization':
        displayName = `Stabilization Flow Rate : ${value}`
        break;
      case 'PressureLockTime':
        displayName = `Pressure Lock Time : ${value}`
        break;
      case 'VentTime':
        displayName = `Vent Time : ${value}`
        break;
      case 'MinShiftTime':
        displayName = `Minimum Shift Time : ${value}`
        break;
      case 'MaxShiftTime':
        displayName = `Maximum Shift Time : ${value}`
        break;
      case 'MinimumResetTime':
        displayName = `Minimum Reset Time : ${value}`
        break;
    }
    return displayName;
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
            MinimumResetTime: this.shiftDefaultData.ReturnsBasedShiftDefaults.MinimumResetTime * 60
          }
        }else{
          this.shiftDefaultData.TimeBasedShiftDefaults = {
            PressureLockTime: this.shiftDefaultData.TimeBasedShiftDefaults.PressureLockTime,
            VentTime: this.shiftDefaultData.TimeBasedShiftDefaults.VentTime,
            ShiftTime: this.shiftDefaultData.TimeBasedShiftDefaults.ShiftTime,
            IdShiftDefault: this.shiftDefaultData.TimeBasedShiftDefaults.IdShiftDefault,
            MinimumResetTime: this.shiftDefaultData.ReturnsBasedShiftDefaults.MinimumResetTime * 60
        }
      }
        this.onFormChangeEvent.emit({ dirty: !this.returnsBasedShiftForm.pristine, valid: true, data: this.shiftDefaultData});
      }
      this.validateFormControls();
      this.isReturnFormValidEvent.emit(this.returnsBasedShiftForm.valid);
    });
  }

  setMinResetTime() {
    const minResetTimeVal = this.returnsBasedShiftForm.get('MinimumResetTime').value;
    if (!minResetTimeVal) {
      this.returnsBasedShiftForm.patchValue({
        MinimumResetTime: 0
      });
    }
  }

  private validateOnInit(): void {
    if (this.returnsBasedShiftForm) {
      this.validateFormControls();
      this.isReturnFormValidEvent.emit(this.returnsBasedShiftForm.valid);
    }
  }

  ngOnInit(): void {
    this.createFormGroup();
  }

  ngAfterViewInit(): void {
    this.validateOnInit();
  }

  ngOnDestroy(): void {
    const returnsBasedshiftDefaults = Object.assign({}, this.shiftDefaultData);
    let returnsBasedShiftDefaults = _.cloneDeep(this.returnsBasedShiftForm.value);
    returnsBasedShiftDefaults.MinimumResetTime = (returnsBasedShiftDefaults.MinimumResetTime * 60);
    returnsBasedshiftDefaults.ReturnsBasedShiftDefaults = returnsBasedShiftDefaults;
    this.onFormChangeEvent.emit({ dirty: !this.returnsBasedShiftForm.pristine, valid: this.returnsBasedShiftForm.valid, data: returnsBasedshiftDefaults });
  }

}
