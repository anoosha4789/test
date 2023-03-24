import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RangeValidator } from '@core/customValidators/rangeValidator.validator';
import { multinodeTecPowerSupplySchema } from '@core/models/schemaModels/MultinodeTecPowerSupply.schema';
import { ErrorNotifierModel } from '@core/models/UIModels/error-notifier-model';
import { PowerSupplySettingsDataModel, TECDataModel } from '@core/models/webModels/TECDataModel.model';
import { ValidationService } from '@core/services/validation.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-tec-power-supply',
  templateUrl: './tec-power-supply.component.html',
  styleUrls: ['./tec-power-supply.component.scss']
})

export class TecPowerSupplyComponent implements OnInit, AfterViewInit {
  @Input() tecPowerSupplyData: PowerSupplySettingsDataModel;
  @Output() isTecPowerSupplyFormValidEvent = new EventEmitter();
  @Output() tecPowerSupplyFormInValidEvent = new EventEmitter();
  @Input() wellName: string;
  @Output() onFormChangeEvent = new EventEmitter<{ dirty: Boolean, valid: Boolean, data: any }>();

  tecPowerSupplyForm: FormGroup;
  formCtrlErrorMessage: any;

  private mapErrMessages: Map<string, string> = new Map<string, string>();

  constructor(protected router: Router, private validationService: ValidationService) { }

  createFormGroup() {

    this.tecPowerSupplyForm = new FormGroup({});

    for (const property in multinodeTecPowerSupplySchema.properties) {
      if (multinodeTecPowerSupplySchema.properties.hasOwnProperty(property)) {
        const formControl = new FormControl('');
        const validationFn: ValidatorFn[] = [];
        const prop = multinodeTecPowerSupplySchema.properties[property];
        if (prop.minLength !== undefined) {
          validationFn.push(Validators.minLength(prop.minLength));
        }
        if (prop.maxLength !== undefined) {
          validationFn.push(Validators.maxLength(prop.maxLength));
        }

        if (prop.minValue !== undefined && prop.maxValue !== undefined) {
          validationFn.push(RangeValidator.range(prop.minValue, prop.maxValue));
        } else {
          if (prop.maxValue !== undefined) {
            validationFn.push(Validators.min(prop.maxValue));
          }

          if (prop.minValue !== undefined) {
            validationFn.push(Validators.max(prop.minValue));
          }
        }
        /* if(prop?.default !== undefined){
          formControl.setValue(prop.default)
        } */
        // if (prop.type !== undefined && prop.type === 'integer') {
        //   validationFn.push(this.validationService.ValidateInteger);
        // }

        if (multinodeTecPowerSupplySchema.required.includes(property)) {
          validationFn.push(Validators.required);
        }
        this.tecPowerSupplyForm.addControl(property, formControl);
        formControl.setValidators(validationFn);

      }
    }
    this.setFormData();
  }

  setFormData() {
    this.tecPowerSupplyForm.patchValue({
      MaxVoltage: this.tecPowerSupplyData.MaxVoltage,
      RampRate: this.tecPowerSupplyData.RampRate,
      MaxCurrent: this.tecPowerSupplyData.MaxCurrent,
      SettleVoltage: this.tecPowerSupplyData.SettleVoltage,
      TargetVoltage: this.tecPowerSupplyData.TargetVoltage,
      SettleRampRate: this.tecPowerSupplyData.SettleRampRate,
    });

    this.subscribeToFormDataChanges();

  }
  validateFormControls(): void {
    if (!this.tecPowerSupplyForm.pristine)
      this.tecPowerSupplyForm.markAllAsTouched();
    this.setFormControlStatus();
  }

  private setFormControlStatus() {
    Object.keys(this.tecPowerSupplyForm.controls).forEach(key => {
      this.getCtrlErrorMsg(key, this.tecPowerSupplyForm.controls[key]);
    });
    this.formCtrlErrorMessage = [];
    for (let [key, value] of this.mapErrMessages) {
      this.formCtrlErrorMessage[key] = value;
    }
    this.setErrorNotifierList();
  }

  getCtrlErrorMsg(ctrlName: string, ctrl: AbstractControl) {
    let errorMsg = '';
    this.tecPowerSupplyForm.markAllAsTouched();
    if(ctrl && ctrl.touched && ctrl.invalid) { 
      ctrl.markAsTouched();
      errorMsg = this.validationService.getValidationErrorMessage(ctrl.errors, ctrlName);
      this.mapErrMessages.set(ctrlName, errorMsg);
    } else {
      this.mapErrMessages.delete(ctrlName);
    }
    return errorMsg;
  }

  setErrorNotifierList() {
    const errorList = [...this.mapErrMessages].map(([name, value]) => ({
      name,
      value: this.setErrorDisplayLabel(name, value)
    }));
    if (errorList && errorList.length > 0) {
      const errorDetails: ErrorNotifierModel[] = [{
        path: this.router.url,
        tabName: this.wellName +' - TEC Power Supply',
        tabIndex: 3,
        errors: errorList
      }];
      this.tecPowerSupplyFormInValidEvent.emit(errorDetails);
      this.tecPowerSupplyData.error = errorDetails;
    } else {
      this.tecPowerSupplyFormInValidEvent.emit(null)
    }

  }

  setErrorDisplayLabel(name, value) {
    let displayName = null;
    switch (name) {
      case 'MaxVoltage':
        displayName = `Max Voltage : ${value}`
        break;
      case 'RampRate':
        displayName = `Ramp Rate : ${value}`
        break;
      case 'MaxCurrent':
        displayName = `Max Current : ${value}`
        break;
      case 'SettleVoltage':
        displayName = `Settle Voltage : ${value}`
        break;
      case 'TargetVoltage':
        displayName = `Target Voltage : ${value}`
        break;
      case 'SettleRampRate':
        displayName = `Settle Ramp Rate : ${value}`
        break;
    }
    return displayName;
  }

  private subscribeToFormDataChanges() {
    this.tecPowerSupplyForm.valueChanges.subscribe((val) => {
      // if (!this.tecPowerSupplyForm.pristine && this.tecPowerSupplyForm.valid) {

      const powerSupplySettings = new PowerSupplySettingsDataModel();
      powerSupplySettings.MaxVoltage = this.tecPowerSupplyForm.get('MaxVoltage').value;
      powerSupplySettings.MaxCurrent = this.tecPowerSupplyForm.get('MaxCurrent').value;
      powerSupplySettings.TargetVoltage = this.tecPowerSupplyForm.get('TargetVoltage').value;
      powerSupplySettings.RampRate = this.tecPowerSupplyForm.get('RampRate').value;
      powerSupplySettings.SettleVoltage = this.tecPowerSupplyForm.get('SettleVoltage').value;
      powerSupplySettings.SettleRampRate = this.tecPowerSupplyForm.get('SettleRampRate').value;
      this.tecPowerSupplyData = powerSupplySettings;
      this.onFormChangeEvent.emit({ dirty: this.tecPowerSupplyForm.dirty, valid: this.tecPowerSupplyForm.valid, data: powerSupplySettings });
      // }
      this.validateFormControls();

      //this.isTecPowerSupplyFormValidEvent.emit(this.tecPowerSupplyForm.valid);
    });
  }
  private validateOnInit(): void {
    if (this.tecPowerSupplyForm) {
      this.validateFormControls();
     // this.isTecPowerSupplyFormValidEvent.emit(this.tecPowerSupplyForm.valid);
     this.tecPowerSupplyForm.statusChanges
     .pipe(filter(() => this.tecPowerSupplyForm.valid)).subscribe(() => {
       if (this.tecPowerSupplyForm ) {
        this.isTecPowerSupplyFormValidEvent.emit(true);
       }
     });
     this.tecPowerSupplyForm.statusChanges
     .pipe(filter(() => this.tecPowerSupplyForm.invalid)).subscribe(() => {
       if (this.tecPowerSupplyForm ) {
        this.isTecPowerSupplyFormValidEvent.emit(false);
       }
     });
    }
  }

  ngOnInit(): void {
    this.createFormGroup();
  }

  ngAfterViewInit(): void {
    this.validateOnInit();
  }

}