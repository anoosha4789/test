import { Component, OnInit } from '@angular/core';

import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-download-confirm-dialog',
  templateUrl: './download-confirm-dialog.component.html',
  styleUrls: ['./download-confirm-dialog.component.scss']
})
export class DownloadConfirmDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<any>) { }

  OnCancelBtnClick(): void {
    this.dialogRef.close('resume');
  }

  onOkBtnClick(): void {
    this.dialogRef.close(true);
  }

  ngOnInit(): void {
  }

}
