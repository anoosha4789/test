import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-abort-actuation-dialog',
  templateUrl: './abort-actuation-dialog.component.html',
  styleUrls: ['./abort-actuation-dialog.component.scss']
})
export class AbortActuationDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<AbortActuationDialogComponent>) { }

  OnOkBtnClick() {
    this.dialogRef.close('ok');
  }

  OnCancelBtnClick() {
    this.dialogRef.close();
  }

  ngOnInit(): void {
  }
}
