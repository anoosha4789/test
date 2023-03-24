import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-pump-pressure-dialog',
  templateUrl: './pump-pressure-dialog.component.html',
  styleUrls: ['./pump-pressure-dialog.component.scss']
})
export class PumpPressureDialogComponent implements OnInit {
  pressurePointForm: FormGroup;
  formCtrlErrorMessage: any;
  currentStartPump: number;
  currentStopPump: number;
  isFormValid: boolean;

  constructor(public dialogRef: MatDialogRef<PumpPressureDialogComponent>, @Inject(MAT_DIALOG_DATA) public data) { }

  ngOnInit(): void {
    this.currentStartPump = this.data.changePumpPressure.hpuDataPoint?.value ? this.data.changePumpPressure.hpuDataPoint?.value.toFixed(1) : "";
    this.currentStopPump = this.data.changePumpPressure.hpuSubDataPoint?.value ? this.data.changePumpPressure.hpuSubDataPoint?.value.toFixed(1) : "";
    this.createFormGroup();
  }

  createFormGroup() {
    this.pressurePointForm = new FormGroup({ StartPumpPressure: new FormControl(this.currentStartPump, Validators.required), StopPumpPressure: new FormControl(this.currentStopPump, Validators.required) });
    // this.pressurePointForm.patchValue({ StartPumpPressure: this.currentStartPump, StopPumpPressure: this.currentStopPump });
  }

  OnCancel() {
    this.dialogRef.close();
  }
  OnSubmit() {
    let startPressure = this.pressurePointForm.get("StartPumpPressure").value;
    let stopPressure = this.pressurePointForm.get("StopPumpPressure").value;
    this.dialogRef.close({ StartPumpPressure: startPressure, StopPumpPressure: stopPressure });
  }

  getFormattedUnit(unit) {
    return unit ? unit : "";
  }

  validateFormControls() {
    this.pressurePointForm?.markAllAsTouched();
    this.isFormValid = this.pressurePointForm.valid && (this.pressurePointForm.get("StartPumpPressure").value != this.currentStartPump.toString() || this.pressurePointForm.get("StopPumpPressure").value != this.currentStopPump.toString());
  }

}
