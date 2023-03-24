import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ErrorNotifierModel } from '@core/models/UIModels/error-notifier-model';

@Component({
  selector: 'gw-notifier-dialog',
  templateUrl: './gw-notifier-dialog.component.html',
  styleUrls: ['./gw-notifier-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class GwNotifierDialogComponent implements OnInit {

  errorNotifierList: any;

  constructor(private router: Router,
    public dialogRef: MatDialogRef<GwNotifierDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: GwNotifierDialogData) { }

  onCloseBtnClick() {
    this.dialogRef.close();
  }

  navToPage(errorNotifier: ErrorNotifierModel) {
    if (errorNotifier.tabIndex) {
      this.router.navigateByUrl(errorNotifier.path, { state: { tabIndex: errorNotifier.tabIndex } });
    } else {
      this.router.navigateByUrl(errorNotifier.path);
    }
    this.dialogRef.close();
  }

  ngOnInit(): void {
    this.errorNotifierList = this.data;
  }

}

export class GwNotifierDialogData {
  errorsList: any[];
}
