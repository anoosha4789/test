import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WellShiftRecord, WellZoneShiftRecord } from '@core/models/UIModels/WellShiftRecord.model';

@Component({
  selector: 'gw-confirm-vent-dialog',
  templateUrl: './confirm-vent-dialog.component.html',
  styleUrls: ['./confirm-vent-dialog.component.scss']
})
export class ConfirmVentDialogComponent implements OnInit {

  confirmVentDialogData: IConfirmVentDialogData;

  constructor(public dialogRef: MatDialogRef<ConfirmVentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IConfirmVentDialogData) { }

  OnCancel() {
    this.dialogRef.close();
  }

  OnSubmit() {
    this.dialogRef.close({
      confirm: true
    });
  }

  ngOnInit(): void {
    this.confirmVentDialogData = this.data;
  }

}

export interface IConfirmVentDialogData {
  ventAllRecords: boolean;
  recordsToVent: WellZoneShiftRecord[];
  currentWell?: WellShiftRecord;
}
