import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { RangeValidator } from '@core/customValidators/rangeValidator.validator';
import { ShiftDefaultModelSchema } from '@core/models/schemaModels/ShiftDefaultsDataModel.schema';
import { isFloat } from '@core/data/UICommon';
import { ShiftDefaultUIModel } from '@core/models/UIModels/shift-default.model';
import { ValidationService } from '@core/services/validation.service';
import { initialShiftDefaultState } from '@store/state/shift-default.state';
import { ErrorNotifierModel } from '@core/models/UIModels/error-notifier-model';
import * as _ from 'lodash';

@Component({
  selector: 'gw-inforce-time-based',
  templateUrl: './time-based.component.html',
  styleUrls: ['./time-based.component.scss']
})
export class TimeBasedComponent implements OnInit, AfterViewInit, OnDestroy {
  
  @Input() shiftDefaultData: ShiftDefaultUIModel;
  @Input() readOnly: boolean = false;
  @Input() showHCMSSleeveSettings: boolean = false;
  @Output() isTimebasedFormValidEvent= new EventEmitter();
  @Output() timeBasedFormInValidEvent= new EventEmitter();
  @Output() onFormChangeEvent = new EventEmitter<{ dirty: Boolean, valid: Boolean, data: ShiftDefaultUIModel}>();

  timeBasedShiftForm: FormGroup;
  formCtrlErrorMessage: any;
  private mapErrMessages: Map<string, string> = new Map<string, string>();

  constructor(protected router: Router, private validationService: ValidationService) { }

  // Validate controls time settings section based on max shift time value
  validateTimeSetting() {
    const pressureLockCtrl = this.timeBasedShiftForm.get('PressureLockTime');
    const ventTimeCtrl = this.timeBasedShiftForm.get('VentTime');
    const shiftTimeValCtrl = this.timeBasedShiftForm.get('ShiftTime');
    
    if (Number.isInteger(pressureLockCtrl.value)) {
      const pressureLockCtrlErrors = pressureLockCtrl.value > 0 && pressureLockCtrl.value < shiftTimeValCtrl.value ? null : 
                                     (pressureLockCtrl.value <=0 ? { invalidInput: true }: { invalidMaxShiftTime: true });
      pressureLockCtrl.setErrors(pressureLockCtrlErrors);
    } else {
      const pressureLockCtrlErrors = isFloat(pressureLockCtrl.value) ? { notInteger: true } :
                                     (pressureLockCtrl.value === null ? { required: true } : null);
      pressureLockCtrl.setErrors(pressureLockCtrlErrors);
    }

    if (Number.isInteger(ventTimeCtrl.value)) {
      const ventTimeCtrlErrors = ventTimeCtrl.value > 0 && ventTimeCtrl.value < shiftTimeValCtrl.value ? null : 
                                 (ventTimeCtrl.value <=0 ? { invalidInput: true }: { invalidMaxShiftTime: true });
      ventTimeCtrl.setErrors(ventTimeCtrlErrors);
    } else {
      const ventTimeCtrlErrors = isFloat(ventTimeCtrl.value) ? { notInteger: true } :
                                 (ventTimeCtrl.value === null ? { required: true } : null);
      ventTimeCtrl.setErrors(ventTimeCtrlErrors);
    }

    if (isFloat(shiftTimeValCtrl.value) || shiftTimeValCtrl.value < 0) {
      const maxShiftTimeCtrlErrors = isFloat(shiftTimeValCtrl.value) ? { notInteger: true }  : { invalidInput: true };
      shiftTimeValCtrl.setErrors(maxShiftTimeCtrlErrors);
    }
    this.isTimebasedFormValidEvent.emit(this.mapErrMessages.size === 0 ? true : false);
  }

  validateSleeveSetting() {
    const minResetTimeCtrl = this.timeBasedShiftForm.get('MinimumResetTime');
    if (isFloat(minResetTimeCtrl.value) || minResetTimeCtrl.value < 0) {
      const minResetTimeCtrlErrors = isFloat(minResetTimeCtrl.value) ? { notInteger: true }  : { invalidInput: true };
      minResetTimeCtrl.setErrors(minResetTimeCtrlErrors);
    }
  }

  setMinResetTime() {
    const minResetTimeVal = this.timeBasedShiftForm.get('MinimumResetTime').value;
    if (!minResetTimeVal) {
      this.timeBasedShiftForm.patchValue({
        MinimumResetTime: 0
      });
    }
  }

  createFormGroup() {

    this.timeBasedShiftForm = new FormGroup({});

    for (const property in ShiftDefaultModelSchema.definitions.TimeBasedShiftDefaultsModel.properties) {
      if (ShiftDefaultModelSchema.definitions.TimeBasedShiftDefaultsModel.properties.hasOwnProperty(property)) {
        const formControl = new FormControl('');
        const validationFn: ValidatorFn[] = [];
        const prop = ShiftDefaultModelSchema.definitions.TimeBasedShiftDefaultsModel.properties[property];
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

        if (ShiftDefaultModelSchema.definitions.TimeBasedShiftDefaultsModel.required.includes(property)) {
          validationFn.push(Validators.required);
        }
        this.timeBasedShiftForm.addControl(property, formControl);
        formControl.setValidators(validationFn);
        
      }
    }
    this.setTimeBasedShiftData();
  }

  setTimeBasedShiftData() {

    if (this.shiftDefaultData && this.shiftDefaultData.TimeBasedShiftDefaults) {
      this.timeBasedShiftForm.patchValue({
        PressureLockTime: this.shiftDefaultData.TimeBasedShiftDefaults.PressureLockTime,
        VentTime: this.shiftDefaultData.TimeBasedShiftDefaults.VentTime,
        ShiftTime: this.shiftDefaultData.TimeBasedShiftDefaults.ShiftTime,
        IdShiftDefault: this.shiftDefaultData.TimeBasedShiftDefaults.IdShiftDefault,
        MinimumResetTime: this.shiftDefaultData.TimeBasedShiftDefaults.MinimumResetTime/60
      });
    } else {
      this.timeBasedShiftForm.patchValue({
        PressureLockTime: initialShiftDefaultState.shiftDefaults.TimeBasedShiftDefaults.PressureLockTime,
        VentTime: initialShiftDefaultState.shiftDefaults.TimeBasedShiftDefaults.VentTime,
        ShiftTime: initialShiftDefaultState.shiftDefaults.TimeBasedShiftDefaults.ShiftTime,
        IdShiftDefault: -1,
        MinimumResetTime: initialShiftDefaultState.shiftDefaults.TimeBasedShiftDefaults.MinimumResetTime/60
      });
    }
    this.subscribeToFormDataChanges();
    this.validateFormControls();
    
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
    this.timeBasedShiftForm.markAllAsTouched();
    this.validateTimeSetting();
    this.validateSleeveSetting();
    this.setFormControlStatus();
  }

  private setFormControlStatus() {
    Object.keys(this.timeBasedShiftForm.controls).forEach(key => {
      this.getCtrlErrorMsg(key, this.timeBasedShiftForm.controls[key]);
    });
    this.formCtrlErrorMessage = [];
    for (let [key, value] of this.mapErrMessages) {
      this.formCtrlErrorMessage[key] = value;
    }
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
        tabName:'Shift Defaults - Time Based',
        tabIndex: 3,
        errors: errorList
      };
      this.timeBasedFormInValidEvent.emit(errorDetails);
    } else {
      this.timeBasedFormInValidEvent.emit(null)
    } 

  }

  setErrorDisplayLabel(name, value) {
    let displayName = null;
    switch (name) {      
      case 'PressureLockTime':
        displayName = `Pressure Lock Time : ${value}`
        break;
      case 'VentTime':
        displayName = `Vent Time : ${value}`
        break;
      case 'ShiftTime':
        displayName = `Shift Time : ${value}`
        break;
      case 'MinimumResetTime':
        displayName = `Minimum Reset Time : ${value}`
        break;
    }
    return displayName;
  }

  private subscribeToFormDataChanges() {
    this.timeBasedShiftForm.valueChanges.subscribe((val) => {
      if (!this.timeBasedShiftForm.pristine && this.timeBasedShiftForm.valid) {
        // this.shiftDefaultData.IsDirty = true;
        this.shiftDefaultData.TimeBasedShiftDefaults = this.timeBasedShiftForm.value;
        if(this.shiftDefaultData.ReturnsBasedShiftDefaults === null) {
          this.shiftDefaultData.ReturnsBasedShiftDefaults = {
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
            MinimumResetTime: 1200
          }
        }
        else{
          this.shiftDefaultData.ReturnsBasedShiftDefaults = {
            ToleranceHigh: this.shiftDefaultData.ReturnsBasedShiftDefaults.ToleranceHigh,
            ToleranceLow: this.shiftDefaultData.ReturnsBasedShiftDefaults.ToleranceLow,
            IntervalTime:this.shiftDefaultData.ReturnsBasedShiftDefaults.IntervalTime,
            IntervalCount:this.shiftDefaultData.ReturnsBasedShiftDefaults.IntervalCount,
            StablizationDeadband:this.shiftDefaultData.ReturnsBasedShiftDefaults.StablizationDeadband,
            PressureLockTime: this.shiftDefaultData.ReturnsBasedShiftDefaults.PressureLockTime,
            VentTime: this.shiftDefaultData.ReturnsBasedShiftDefaults.VentTime,
            MinShiftTime: this.shiftDefaultData.ReturnsBasedShiftDefaults.MinShiftTime,
            MaxShiftTime: this.shiftDefaultData.ReturnsBasedShiftDefaults.MaxShiftTime,
            IdShiftDefault: this.shiftDefaultData.ReturnsBasedShiftDefaults.IdShiftDefault,
            IsToleranceUnitInPercentage: this.shiftDefaultData.ReturnsBasedShiftDefaults.IsToleranceUnitInPercentage,
            MinimumReturnsFlowRateForStabilization: this.shiftDefaultData.ReturnsBasedShiftDefaults.MinimumReturnsFlowRateForStabilization,
            ReturnFlowStabilizationCheckingPeriodInSeconds: this.shiftDefaultData.ReturnsBasedShiftDefaults.ReturnFlowStabilizationCheckingPeriodInSeconds,
            MinimumResetTime: this.shiftDefaultData.TimeBasedShiftDefaults.MinimumResetTime * 60
          }
        }
        this.onFormChangeEvent.emit({  dirty: !this.timeBasedShiftForm.pristine, valid: true, data: this.shiftDefaultData});
      }
      this.validateFormControls();
    });
  }

  private validateOnInit(): void {
    if (this.timeBasedShiftForm) {
      this.validateFormControls();
      this.isTimebasedFormValidEvent.emit(this.timeBasedShiftForm.valid)
    }
  }

  ngOnInit(): void {
    this.createFormGroup();
  }

  ngAfterViewInit(): void {
    this.validateOnInit();
  }

  ngOnDestroy(): void {
    const shiftDefaultData = Object.assign({}, this.shiftDefaultData);
    let timesBasedShiftDefaults = _.cloneDeep(this.timeBasedShiftForm.value);
    timesBasedShiftDefaults.MinimumResetTime = (timesBasedShiftDefaults.MinimumResetTime * 60);
    shiftDefaultData.TimeBasedShiftDefaults = timesBasedShiftDefaults;
    this.onFormChangeEvent.emit({ dirty: !this.timeBasedShiftForm.pristine, valid: this.timeBasedShiftForm.valid, data: shiftDefaultData});
  }

}
