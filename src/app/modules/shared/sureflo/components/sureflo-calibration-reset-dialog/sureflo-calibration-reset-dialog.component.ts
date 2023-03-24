import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'sureflo-calibration-reset-dialog',
  templateUrl: './sureflo-calibration-reset-dialog.component.html',
  styleUrls: ['./sureflo-calibration-reset-dialog.component.scss']
})
export class SurefloCalibrationResetDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<SurefloCalibrationResetDialogComponent>) { }

  OnCancel(): void {
    this.dialogRef.close();
  }

  OnOk() {
    this.dialogRef.close(true);
  }

  ngOnInit(): void {
  }

}
