import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { cloneDeep as _cloneDeep } from 'lodash';

import { ShiftDefaultUIModel } from '@core/models/UIModels/shift-default.model';

@Component({
  selector: 'gw-shift-settings-dialog',
  templateUrl: './shift-settings-dialog.component.html',
  styleUrls: ['./shift-settings-dialog.component.scss']
})

export class ShiftSettingsDialogComponent implements OnInit {

  selectedShift = 'initial';
  selectedShiftMethod: string = 'ReturnsBased';
  isShiftMethodReadOnly = false;
  showHCMSSleeveSettings = false;
  shiftMethods = ['ReturnsBased', 'TimeBased'];
  unitVal = 'mL';
  parentShiftDefaultData: ShiftDefaultUIModel; // panel level shift settings
  shiftDefaultData: ShiftDefaultUIModel;

  shiftSettingsDialogData: IShiftSettingsDialogData;

  isReturnBasedFormValid: boolean = true;
  isTimebasedFormValid: boolean = true;
  isShiftDefaultsValid: boolean = true;
  hasChanges: boolean = false;
  isFlowmeterTransmitterNone: boolean = false;

  constructor(public dialogRef: MatDialogRef<ShiftSettingsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IShiftSettingsDialogData) { }


  radioChange(event) {
    this.shiftDefaultData.ShiftMethod = event.value;
    this.hasChanges = true;
  }

  onToggleChange() {
    this.hasChanges = true;
  }

  updateShiftDefault(shiftDefaultForm) {
    if (shiftDefaultForm?.data) {
      this.shiftDefaultData.ShiftMethod = shiftDefaultForm.data.ShiftMethod;
      this.shiftDefaultData.ReturnsBasedShiftDefaults = shiftDefaultForm.data.ReturnsBasedShiftDefaults;
      this.shiftDefaultData.TimeBasedShiftDefaults = shiftDefaultForm.data.TimeBasedShiftDefaults;
      if (!this.hasChanges)
        this.hasChanges = shiftDefaultForm.dirty;
    }
  }

  returnBasedFormValidEvent(isFormValid: boolean) {
    this.isReturnBasedFormValid = isFormValid;
    this.formValidationEvent()
  }

  timeBasedFormValidEvent(isFormValid: boolean) {
    this.isTimebasedFormValid = isFormValid;
    this.formValidationEvent();
  }

  formValidationEvent() {
    if (this.isReturnBasedFormValid && this.isTimebasedFormValid) {
      this.isShiftDefaultsValid = true;
    } else {
      this.isShiftDefaultsValid = false;
    }
  }

  OnCancel() {
    this.dialogRef.close();
  }

  OnSubmit() {
    this.shiftSettingsDialogData.shiftSettings = this.shiftDefaultData;
    this.shiftSettingsDialogData.shiftSettings.ShiftMethod = this.selectedShiftMethod;
    this.shiftSettingsDialogData.isParentLevelShiftDefaultApplied = this.selectedShift === 'initial' ? true : false;
    this.dialogRef.close({
      shiftDefaultData: this.selectedShift === 'initial' ? _cloneDeep(this.parentShiftDefaultData) : this.shiftDefaultData,
      isParentLevelShiftDefaultApplied: this.selectedShift === 'initial' ? true : false
    });
  }

  ngOnInit(): void {
    this.shiftSettingsDialogData = this.data;
    this.selectedShift = this.shiftSettingsDialogData.isParentLevelShiftDefaultApplied ? 'initial' : 'custom';
    this.parentShiftDefaultData = this.shiftSettingsDialogData.parentShiftSettings;
    this.shiftDefaultData = this.shiftSettingsDialogData.shiftSettings;
    this.selectedShiftMethod = this.shiftSettingsDialogData.isZoneLevel ? this.shiftSettingsDialogData.parentShiftSettings.ShiftMethod : this.shiftSettingsDialogData.shiftSettings.ShiftMethod;
    this.isShiftMethodReadOnly = this.shiftSettingsDialogData.isShiftMethodReadOnly ?? false;
    this.showHCMSSleeveSettings = this.shiftSettingsDialogData.showHCMSSleeveSettings ?? false;
    this.isFlowmeterTransmitterNone = this.shiftSettingsDialogData.isFlowmeterTransmitterNone;
  }

}

export interface IShiftSettingsDialogData {
  defaultShiftSettingsTitle: string;
  customShiftSettingsTitle: string;
  applyButtonText: string;
  parentShiftSettings: ShiftDefaultUIModel;
  shiftSettings: ShiftDefaultUIModel;
  isParentLevelShiftDefaultApplied: boolean;
  isShiftMethodReadOnly?: boolean;
  showHCMSSleeveSettings?: boolean;
  isZoneLevel?: boolean;
  isFlowmeterTransmitterNone: boolean;
}
