import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ErrorNotifierModel } from '@core/models/UIModels/error-notifier-model';
import { MultiNodePositionDefaultsDataUIModel } from '@core/models/UIModels/MultiNodePositionDefaultsDataUI.model';
import { IeFCVPositionSettingsState } from '@store/state/efcvPositionSettings.state';

@Component({
  selector: 'app-efcv-positions-dialog',
  templateUrl: './efcv-positions-dialog.component.html',
  styleUrls: ['./efcv-positions-dialog.component.scss']
})
export class EfcvPositionsDialogComponent implements OnInit {
  eFCVPositionState: IeFCVPositionSettingsState;
  eFCVPositions: MultiNodePositionDefaultsDataUIModel = new MultiNodePositionDefaultsDataUIModel();
  isFormValid = true;
  isFormDirty = false;

  constructor(public dialogRef: MatDialogRef<any>, @Inject(MAT_DIALOG_DATA) public data) { }

  eFCVPositionStateChange(eFCVPositionState: IeFCVPositionSettingsState) {
    this.eFCVPositionState = eFCVPositionState;
  }

  efcvPositionFormInValidEvent(error: ErrorNotifierModel) {
    if (this.eFCVPositionState) {
      this.eFCVPositionState.eFCVPositionSettings.error = error;
    }
  }

  isFormDirtyEvent(isFormDirty: boolean) {
    this.isFormDirty = isFormDirty;
  }
  isFormValidEvent(isFormValid: boolean) {
    this.isFormValid = isFormValid;
  }

  OnCancel() {
    this.dialogRef.close();
  }

  OnSubmit() {
    this.dialogRef.close(this.eFCVPositionState);
  }

  ngOnInit(): void {
    this.eFCVPositions = { PositionStagesData: this.data?.paneleFCVPositions?.PositionStagesData, PositionDescriptionData: this.data?.well?.PositionDescriptionData }
    // Object.assign(this.eFCVPositions, this.data.well.eFCVPositions);
  }

}
