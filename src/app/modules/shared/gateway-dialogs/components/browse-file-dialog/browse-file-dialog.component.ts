import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GatewayPanelConfigurationService } from '@core/services/gateway-panel-configuration.service';

export interface BrowseFileDialogComponentData {
  Title: string;
  ForImportFile: boolean;
  FileExtensions: string;
  SelectedFileName: string;
  SelectedFile: any;
  IsConfigDirty?: boolean;
  PrimaryBtnText?: string,
  SecondaryBtnText?: string
}

@Component({
  selector: 'app-browse-file-dialog',
  templateUrl: './browse-file-dialog.component.html',
  styleUrls: ['./browse-file-dialog.component.scss'],
})
export class BrowseFileDialogComponent implements OnInit {
  validationMssg: string = null;
  exportFileError: string = null;
  primaryBtnText: string;
  secondaryBtnText: string;

  browseDialogForm: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<BrowseFileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BrowseFileDialogComponentData,
    private gatewayPanelService: GatewayPanelConfigurationService
  ) {}

  BrowseFile() {
    if (this.data.ForImportFile) {
      this.browseDialogForm.markAllAsTouched();
      const selectedFile = document.getElementById(
        'selectFile'
      ) as HTMLInputElement;
      selectedFile.onchange = (fileInput: any) => {
        this.validationMssg = null;
        if (fileInput.target.files && fileInput.target.files.length > 0) {
          this.data.SelectedFile = fileInput.target.files[0];
          this.data.SelectedFileName = fileInput.target.files[0].name;
        }
        this.validateConfigFile();
      };
      selectedFile.click();
    }
  }

  private validateConfigFile() {
    this.validationMssg = null;
    let ctrl = this.browseDialogForm.controls['FileName'];
    ctrl.setErrors(null);
    this.browseDialogForm.markAllAsTouched();
    if (!this.data.SelectedFileName || this.data.SelectedFileName.trim() == "") {
      this.validationMssg = "Please enter a valid File Name.";
      ctrl.setErrors({"invalid": true});
      return;
    }
    if (this.data.SelectedFileName.split(".").length > 2) {
      this.validationMssg = "Please enter a valid File Name.";
      ctrl.setErrors({"invalid": true});
      return;
    }
    var fileName = this.data.SelectedFileName.split(".")[0];
    if (fileName.trim() === "") {
      this.validationMssg = "Please enter a valid File Name.";
        ctrl.setErrors({"invalid": true});
        return;
    }
    var extension = this.data.SelectedFileName.split(".")[1];
    if (extension && extension.toLowerCase() != "dat") {
        this.validationMssg = "Please enter a valid File Name.";
        ctrl.setErrors({"invalid": true});
        return;
    }
  }

  validateExportFile() {
    if (!this.data.ForImportFile) {
      this.validateConfigFile();
    }
  }

  OnOk(): void {
    if (this.data.ForImportFile) {
      this.browseDialogForm.markAllAsTouched();
      let ctrl = this.browseDialogForm.controls['FileName'];
      if (!this.data.SelectedFile.name || !this.data.SelectedFile.name.endsWith(".dat")){
        this.validationMssg = this.data.ForImportFile ? "Please import a valid configuration." : "Please select a valid file";
        ctrl.setErrors({"invalid": true});
        return;
      }
      
      this.gatewayPanelService.validateImportFile(this.data.SelectedFile)
        .then(result => {
            if (result)
              this.dialogRef.close(this.data);
            else
              this.dialogRef.close();
          }, reject => {
            this.validationMssg = this.data.ForImportFile ? "Please import a valid configuration." : "Please select a valid file";
            ctrl.setErrors({"invalid": true});
          });
    }
    else{
      if (!this.data.IsConfigDirty) {
        this.validateExportFile();
        if (this.data.SelectedFileName.split(".").length == 1) {
          this.data.SelectedFileName = this.data.SelectedFileName + ".dat";
        }
        this.dialogRef.close(this.data);
      }
    } 
  }

  OnCancel(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    if (this.data.ForImportFile) {
      this.data.SelectedFileName = 'Browse file ...';
    }

    this.browseDialogForm = new FormGroup({
      FileName: new FormControl(''),
    });

    this.primaryBtnText = this.data.PrimaryBtnText??"Ok";
    this.secondaryBtnText = this.data.SecondaryBtnText??"Cancel";
    this.exportFileError = this.data.IsConfigDirty ? "Current configuration has been modified and not saved. Please save the configuration." : null;
  }
}
