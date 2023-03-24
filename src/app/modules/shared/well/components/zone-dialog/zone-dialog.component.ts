import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, ValidatorFn, Validators } from '@angular/forms';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { InchargeZoneUIModel } from '@core/models/UIModels/incharge.zone.model';
import { zoneSchema } from '@core/models/schemaModels/ZoneDataModel.schema';
import { ValidationService } from '@core/services/validation.service';
import { WellFacade } from '@core/facade/wellFacade.service';

@Component({
  selector: 'app-zone-dialog',
  templateUrl: './zone-dialog.component.html',
  styleUrls: ['./zone-dialog.component.scss']
})
export class ZoneDialogComponent implements OnInit {

  zoneDetails: ZoneDialogData;
  invalidZoneNameMsg: string;
  invalidMeasuredDepthMsg: string;
  selectedZone: any;
  valveTypeList: string[];
  valveSizeList: string[];
  zoneForm: FormGroup;
  errorMsg: string;
  invalidDepthMsg: string;
  zoneSchema: any;
  ValveType: string;
  ValveSize: string;
  inputZoneName: string;
  modalEditMode: boolean;

  constructor(
    public dialogRef: MatDialogRef<ZoneDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ZoneDialogData,
    private fb: FormBuilder,
    private wellDataFacade: WellFacade,
    private validationService: ValidationService) { }

  onValveTypeChange(event) {
    // console.log('valve type change...' + event);
  }

  onValveSizeChange(event) {
    // console.log('valve size change...' + event);
  }

  validateZone(event?) {
    this.errorMsg = null;

    const ctrl = this.zoneForm.get('ZoneName');
    if (ctrl && ctrl.touched && ctrl.invalid) {
      this.errorMsg = this.validationService.getValidationErrorMessage(ctrl.errors, 'Zone Name');
      return;
    }
    this.inputZoneName = ctrl.value;
  }

  validateDepth(event?) {
    this.invalidDepthMsg = null;

    const ctrl = this.zoneForm.get('MeasuredDepth');
    if (ctrl && ctrl.touched && ctrl.invalid) {
      this.invalidDepthMsg = this.validationService.getValidationErrorMessage(ctrl.errors, 'Measured Depth');
      return;
    }
  }

  private getValveTypes(): string[] {
    const data = ['eHCM-P', 'Monitoring'];
    return data;
  }

  private getValveSizes(): string[] {

    const data = ['3 1/4', '3 2/4'];
    return data;
  }

  OnCancel() {
    this.dialogRef.close();
  }

  OnSubmit() {
    
    if (this.zoneForm.dirty && this.zoneForm.valid) {
      this.selectedZone.ZoneName = this.zoneForm.value.ZoneName.toString().trim();
      this.selectedZone.MeasuredDepth = parseInt(this.zoneForm.value.MeasuredDepth, 10);
      this.dialogRef.close(this.selectedZone);
    } else {
      this.dialogRef.close();
    }
  }

  createFormGroup() { 

    this.zoneForm = this.fb.group({});

    this.zoneSchema = zoneSchema;
    for (const property in this.zoneSchema.properties) {
      
      if (this.zoneSchema.properties.hasOwnProperty(property)) {
        const formControl = new FormControl('');
        const validationFn: ValidatorFn[] = [];
        if (this.zoneSchema.required.includes(property)) {
          validationFn.push(Validators.required);

          let prop = zoneSchema.properties[property];
          if (prop.minLength) {
            validationFn.push(Validators.minLength(prop.minLength));
          }
          if (prop.maxLength) {
            validationFn.push(Validators.maxLength(prop.maxLength));
          }
          // Alphanumeric characters only
          if (prop.pattern) {
            validationFn.push(Validators.pattern(prop.pattern));
          }
          // Special Cases
          switch(property) {
            case 'ZoneName':
              validationFn.push(this.wellDataFacade.zoneNameValidator(this.data.selectedZone.ZoneName, this.data.zones));
              break;

            case 'MeasuredDepth':
              validationFn.push(this.wellDataFacade.zoneDepthValidator(this.data.selectedZone.MeasuredDepth, this.data.zones));
              break;
          }

          formControl.setValidators(validationFn);
          this.zoneForm.addControl(property, formControl);
        }
      }
    }
    this.inputZoneName = this.selectedZone.ZoneName;
    this.zoneForm.patchValue(
      {
        ZoneName: this.selectedZone.ZoneName,
        MeasuredDepth:  this.selectedZone.MeasuredDepth,
      },
    );

  }

  get zoneName() { return this.zoneForm.get('ZoneName'); }

  get measuredDepth() { return this.zoneForm.get('MeasuredDepth'); }

  initModal() {
    if (this.data) {
      this.zoneDetails = this.data;
      this.selectedZone  = this.zoneDetails.selectedZone;
      this.valveTypeList = this.getValveTypes();
      this.valveSizeList = this.getValveSizes();
      this.createFormGroup();
      this.validateZone();
      this.validateDepth();
      this.modalEditMode = this.data.modalEditMode;
    }
  }

  ngOnInit(): void {
    this.ValveType = 'N/A';
    this.ValveSize = 'N/A';
    this.initModal();
  }
}

export class ZoneDialogData  {
  zones: InchargeZoneUIModel[];
  selectedZone: InchargeZoneUIModel; 
  modalEditMode: boolean
}

