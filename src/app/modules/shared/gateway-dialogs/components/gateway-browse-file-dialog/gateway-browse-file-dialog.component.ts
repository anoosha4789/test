import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ValvePositionsAndReturnsModel } from '@core/models/webModels/ValvePositionsAndReturns.model';

import { GatewayPanelConfigurationService } from '@core/services/gateway-panel-configuration.service';

@Component({
  selector: 'gateway-browse-file-dialog',
  templateUrl: './gateway-browse-file-dialog.component.html',
  styleUrls: ['./gateway-browse-file-dialog.component.scss']
})
export class GatewayBrowseFileDialogComponent implements OnInit {

  validationMsg: string = null;
  primaryBtnText: string;
  secondaryBtnText: string;
  fileFormat: string;
  valvePosFileData: ValvePositionsAndReturnsModel[];
  browseDialogForm: FormGroup;

  constructor(public dialogRef: MatDialogRef<GatewayBrowseFileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: GatewayBrowseFileDialogComponentData,
    private gatewayPanelService: GatewayPanelConfigurationService) { }


  BrowseFile() {
    if (this.data.importFile) {
      this.browseDialogForm.markAllAsTouched();
      const selectedFile = document.getElementById(
        'selectFile'
      ) as HTMLInputElement;
      selectedFile.onchange = (fileInput: any) => {
        this.validationMsg = null;
        if (fileInput.target.files && fileInput.target.files.length > 0) {
          this.data.selectedFile = fileInput.target.files[0];
          this.data.selectedFileName = fileInput.target.files[0].name;
        }
        this.browseDialogForm.patchValue({ fileName: this.data.selectedFileName });
        this.validateFile();
      };
      selectedFile.click();
    }
  }

  private validateFile() {
    this.validationMsg = null;
    const errorMsg = "Please enter a valid File Name.";
    let ctrl = this.browseDialogForm.controls['fileName'];
    ctrl.setErrors(null);
    ctrl.markAllAsTouched();
    if (!ctrl.value || ctrl.value.trim() == "") {
      this.validationMsg = errorMsg;
      ctrl.setErrors({ "invalid": true });
      return;
    }
    if (ctrl.value.split(".").length > 2) {
      this.validationMsg = errorMsg;
      ctrl.setErrors({ "invalid": true });
      return;
    }
    var fileName = ctrl.value.split(".")[0];
    if (fileName.trim() === "") {
      this.validationMsg = errorMsg;
      ctrl.setErrors({ "invalid": true });
      return;
    }
    var extension = ctrl.value.split(".")[1];
    if (extension && extension.toLowerCase() != this.fileFormat) {
      this.validationMsg = errorMsg;
      ctrl.setErrors({ "invalid": true });
      return;
    }
  }

  validateExportFile() {
    if (!this.data.importFile) {
      this.validateFile();
    }
  }

  OnOk(): void {
    if (this.data.importFile) {
      this.browseDialogForm.markAllAsTouched();
      let ctrl = this.browseDialogForm.controls['fileName'];
      if (!this.data.selectedFile.name || !this.data.selectedFile.name.endsWith(this.fileFormat)) {
        this.validationMsg = this.data.importFile ? `Please import a valid ${this.fileFormat} file.` : `Please select a valid ${this.fileFormat} file`;
        ctrl.setErrors({ "invalid": true });
        return;
      }
      this.validateValvePosition();
    } else {
      const fileName = this.browseDialogForm.value.fileName;
      if (fileName.split(".").length == 1) {
        this.data.selectedFileName = `${fileName}${this.data.fileExtensions}`;
      }
      this.dialogRef.close(this.data);
    }
  }

  validateValvePosition() {
    this.constructValvePosition(this.data.selectedFile);
  }

  constructValvePosition(file: any) {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onloadend = () => {
      this.valvePosFileData = [];
      const data = reader.result as string;
      let splitChar = data.indexOf('\r') == -1 ? "\n":"\r\n"; //if file from 1.3, split with \n otherwise split with \r\n
     
      let csvToRowArray = data.split(splitChar);
      for (let index = 1; index < csvToRowArray.length; index++) {
        let row = csvToRowArray[index].split(",");
        if (row.length === 5) {
          const valvePositionsAndReturnObj: ValvePositionsAndReturnsModel = {
            Id: -index,
            FromPosition: Number(row[0]),
            ToPosition: Number(row[1]),
            Description: row[2].replace(/['"]+/g, ""),
            ReturnVolume: Number(row[3]),
            UserSelectable: row[4].replace(/(?:\\[rn])+/g, "").includes('Yes') ? true : false
          }
          if (!valvePositionsAndReturnObj.Description) {
            this.validationMsg = `Invalid Value for Description at line ${index}.`;
            return;
          }
          if (!valvePositionsAndReturnObj.ReturnVolume) {
            this.validationMsg = `Invalid Value for Return Volume at line ${index}.`;
            return;
          }
          this.valvePosFileData.push(valvePositionsAndReturnObj);
        }
      }
      if (this.data.numberOfPositions !== this.valvePosFileData.length) {
        this.validationMsg = 'Please select a valid csv file.';
      } else {
        this.dialogRef.close(this.valvePosFileData);
      }
    }
    reader.onerror = () => {
    }
  }

  OnCancel(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
    this.browseDialogForm = new FormGroup({
      fileName: new FormControl(''),
    });
    this.fileFormat = this.data.fileExtensions.split('.')[1].toLowerCase();
    this.primaryBtnText = this.data.primaryBtnText ?? "Ok";
    this.secondaryBtnText = this.data.secondaryBtnText ?? "Cancel";
    if (this.data.importFile) {
      this.data.selectedFileName = 'Browse file ...';
    } else {
      this.browseDialogForm.patchValue({ fileName: this.data.selectedFileName });
    }
  }

}

export interface GatewayBrowseFileDialogComponentData {
  title: string;
  importFile: boolean;
  fileExtensions: string;
  selectedFileName: string;
  selectedFile: any;
  numberOfPositions?: number;
  primaryBtnText?: string;
  secondaryBtnText?: string;
}