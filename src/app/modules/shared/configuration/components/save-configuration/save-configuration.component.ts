import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';


import { ConfigurationSummaryData, SaveConfigurationChanges } from '@shared/configuration/services/configuration-summary.service';

@Component({
  selector: 'app-save-configuration',
  templateUrl: './save-configuration.component.html',
  styleUrls: ['./save-configuration.component.scss']
})
export class SaveConfigurationComponent implements OnInit {

  panelSettingChanges: SaveConfigurationChanges[] = [];
  errorHandlingChanges: SaveConfigurationChanges[] = [];
  unitSystemChanges: SaveConfigurationChanges[] = [];
  wellChanges: SaveConfigurationChanges[] = [];
  devicesChanges: SaveConfigurationChanges[] = [];
  publishingChanges: SaveConfigurationChanges[] = [];
  surefloChanges: SaveConfigurationChanges[] = [];
  shiftDefaultChanges: SaveConfigurationChanges[] = [];
  alarmsAndLimitsChanges: SaveConfigurationChanges[] = [];
  panelDefaultChanges: SaveConfigurationChanges[] = [];
  dataLoggerChanges: SaveConfigurationChanges[] = [];
  sieChanges: SaveConfigurationChanges[] = [];
  eFCVPositionsChanges: SaveConfigurationChanges[] = [];

  constructor(
    public dialogRef: MatDialogRef<SaveConfigurationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfigurationSummaryData) { }

  // On Modal Close
  OnClose(): void {
    this.dialogRef.close();
  }

  // On Modal Cancel
  OnCancel(): void {
    this.dialogRef.close(enumSaveDialogActions.Cancel);
  }

  // On Modal Submit
  OnOk() {
    this.dialogRef.close(enumSaveDialogActions.Save);
  }

  ngOnInit(): void {
    if (this.data !== undefined && this.data !== null) {
      this.panelSettingChanges = this.data.panelSettingChanges;
      this.errorHandlingChanges = this.data.errorHandlingChanges;
      this.unitSystemChanges = this.data.unitSystemChanges;
      this.wellChanges = this.data.wellChanges;
      this.devicesChanges = this.data.devicesChanges;
      this.publishingChanges = this.data.publishingChanges;
      this.surefloChanges = this.data.surefloChanges;
      this.shiftDefaultChanges = this.data?.shiftDefaultChanges ?? []
      this.alarmsAndLimitsChanges = this.data?.alarmsAndLimitsChanges ?? [];
      this.panelDefaultChanges = this.data?.panelDefaultChanges ?? [];
      this.dataLoggerChanges = this.data?.dataLoggerChanges ?? [];
      this.sieChanges = this.data?.sieChanges ?? [];
      this.eFCVPositionsChanges = this.data?.eFCVPositionsChanges ?? [];
    }
  }
}

export enum enumSaveDialogActions {
  Save = 1,
  Cancel
}
