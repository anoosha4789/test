import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { truncate } from 'igniteui-angular-core';

@Component({
  selector: 'sureflo-calibration-apply-dialog',
  templateUrl: './sureflo-calibration-apply-dialog.component.html',
  styleUrls: ['./sureflo-calibration-apply-dialog.component.scss']
})
export class SurefloCalibrationApplyDialogComponent implements OnInit {
  

  constructor(public dialogRef: MatDialogRef<SurefloCalibrationApplyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SurefloCalibrationApplyDialogData) { }

  OnCancel(): void {
    this.dialogRef.close();
  }

  onkeyUp(event) {
    this.data.fileName = event.target.value;
  }

  OnOk() {
    this.dialogRef.close(this.data.fileName);
  }

  ngOnInit(): void {}

}

export class SurefloCalibrationApplyDialogData {
  fileName: string;
}