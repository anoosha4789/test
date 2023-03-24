import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-infoce-abort-shift-dialog',
  templateUrl: './infoce-abort-shift-dialog.component.html',
  styleUrls: ['./infoce-abort-shift-dialog.component.scss']
})
export class InfoceAbortShiftDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<InfoceAbortShiftDialogComponent>) { }

  OnOkBtnClick() {
    this.dialogRef.close('ok');
  }

  OnCancelBtnClick() {
    this.dialogRef.close();
  }

  ngOnInit(): void {
  }

}
