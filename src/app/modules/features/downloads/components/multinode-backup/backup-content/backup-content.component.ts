import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { multinodeBackupSchema } from '@core/models/schemaModels/MultinodeBackupSchema';
import { ValidationService } from '@core/services/validation.service';
import { BackupUIData } from '../multinode-backup.component';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-backup-content',
  templateUrl: './backup-content.component.html',
  styleUrls: ['./backup-content.component.scss']
})
export class BackupContentComponent implements OnInit, OnChanges {
  @Input()
  backupUIData: BackupUIData;

  @Output()
  primaryBtnEmitter = new EventEmitter();
  @Output()
  secondaryBtnEmitter?: EventEmitter<any> = new EventEmitter();
  backupData: BackupUIData;
  backupForm: FormGroup;
  formCtrlErrorMessage: any;
  private mapErrMessages: Map<string, string> = new Map<string, string>();

  constructor(private validationService: ValidationService) { }

  onSecondaryBtnClick() {
    this.setPackageName();
    this.secondaryBtnEmitter.emit(this.backupData);
  }

  onPrimaryBtnClick() {
    this.setPackageName();
    this.primaryBtnEmitter.emit(this.backupData);
  }

  setPackageName() {
    this.backupData.PackageName = this.backupForm?.get('PackageName')?.value;
  }

  validateFormControls() {
    this.setFormControlStatus();
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
    Object.keys(this.backupForm.controls).forEach(key => {
      this.getCtrlErrorMsg(key, this.backupForm.controls[key]);
    });
    this.formCtrlErrorMessage = [];
    for (let [key, value] of this.mapErrMessages) {
      this.formCtrlErrorMessage[key] = value;
    }
  }

  createFormGroup() {
    this.backupForm = new FormGroup({});
    for (const property in multinodeBackupSchema.properties) {

      if (multinodeBackupSchema.properties.hasOwnProperty(property)) {
        const formControl = new FormControl('');
        const validationFn: ValidatorFn[] = [];
        if (multinodeBackupSchema.required.includes(property)) {

          validationFn.push(Validators.required);
          let prop = multinodeBackupSchema.properties[property];
          // Minimum Length
          if (prop.minLength) {
            validationFn.push(Validators.minLength(prop.minLength));
          }
          // Max Length
          if (prop.maxLength) {
            validationFn.push(Validators.maxLength(prop.maxLength));
          }
          // Alphanumeric characters only
          if (prop.pattern) {
            validationFn.push(Validators.pattern(prop.pattern));
          }
          formControl.setValidators(validationFn);
          this.backupForm.addControl(property, formControl);
        }
      }
    }

    if (!this.backupData?.isEditable)
      this.backupForm?.controls['PackageName']?.disable();

    this.backupForm?.patchValue({
      PackageName: this.backupData?.PackageName
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.backupData = this.backupUIData;
    this.createFormGroup();
  }

  ngOnInit(): void {
  }

}
