import { Component, Inject, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { saveAs } from 'file-saver';
import * as _ from 'lodash';

import { FlowMeterTypes, WellFlowTypes } from '@core/models/UIModels/sureflo.model';
import { SureFLO298EXCalibrationModel, SureFLO298EXGasCalibrationModel, SureFLO298EXWaterCalibrationModel } from '@core/models/UIModels/sureflo-ex-flowmeter-model';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { ButtonActions } from '@shared/gateway-dialogs/components/gateway-advanced-dialog/gateway-advanced-dialog.component';
import { SurefloCalibrationApplyDialogComponent, SurefloCalibrationApplyDialogData } from '@shared/sureflo/components/sureflo-calibration-apply-dialog/sureflo-calibration-apply-dialog.component';
import { SurefloCalibrationResetDialogComponent } from '@shared/sureflo/components/sureflo-calibration-reset-dialog/sureflo-calibration-reset-dialog.component';
import { SurefloService } from '@core/services/sureflo.service';

@Component({
  selector: 'app-sureflo-ex-calibration-dialog',
  templateUrl: './sureflo-ex-calibration-dialog.component.html',
  styleUrls: ['./sureflo-ex-calibration-dialog.component.scss']
})
export class SurefloExCalibrationDialogComponent implements OnInit {

  isFormValid = false;
  isGaugeFormValid = true;
  isPVTFormValid = true;
  isAddParamFormValid = true;
  isFilterParamFormValid = true;
  fluidTypeGasVisibility = false;
  fluidTypeWaterVisibility = false;
  activeTabIndex = 0;

  flowmeterdimensions: any;
  calibrationData: SureFLO298EXCalibrationModel;

  constructor(public dialogRef: MatDialogRef<SurefloExCalibrationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SurefloExCalibrationDialogData,
    private gwModalService: GatewayModalService, private surefloService: SurefloService) { }
  
  onTabChanged(event): void {
    // console.log('on tab change', event);
  }

  isGaugFormValidEvent(isFormValid: boolean) {
    this.isGaugeFormValid = isFormValid;
    this.validateModalData();
  }

  isPVTFormValidEvent(isFormValid: boolean) {
    this.isPVTFormValid = isFormValid;
    this.validateModalData();
  }

  isAddParamFormValidEvent(isFormValid: boolean) {
    this.isAddParamFormValid = isFormValid;
    this.validateModalData();
  }

  isFilterParamFormValidEvent(isFormValid: boolean) {
    this.isFilterParamFormValid = isFormValid;
    this.validateModalData();
  }

  validateModalData() {
    const isCalibratioDataValid = this.calibrationData?.IsDirty || false;
    this.isFormValid = this.isGaugeFormValid && this.calibrationData.flowMeterDimensions !== null &&
      this.isPVTFormValid && this.calibrationData.fluidPVTData !== null &&
      this.isFilterParamFormValid && this.calibrationData.filterParameters !== null && isCalibratioDataValid;
    // 298EX Oil Producer
    if (!this.fluidTypeGasVisibility && !this.fluidTypeWaterVisibility) {
      this.isFormValid = this.isFormValid && this.isAddParamFormValid && this.calibrationData.additionalParameters !== null;
    }
    // console.log('form status',  this.isFormValid);
  }

  onResetBtnClick(): void {
    let dialogRef = this.gwModalService.openDialogInsideModal(
      'Calibration Reset',
      ButtonActions.None,
      SurefloCalibrationResetDialogComponent,
      null,
      (result) => {
        if (result) {
          this.calibrationData.flowMeterDimensions = null;
          this.calibrationData.fluidPVTData = null;
          this.calibrationData.additionalParameters = null;
          this.calibrationData.filterParameters = null;
          this.calibrationData =  Object.assign({}, this.calibrationData);
          this.activeTabIndex = 0;
          dialogRef.close();
        } else {
          dialogRef.close();
        }
      },
      '360px',
    );

  }

  onCancelBtnClick(): void  {
    this.ngOnInit();
    this.dialogRef.close();
  }

  onSubmitBtnClick(): void  {
    if (this.calibrationData.IsDirty) {
      const Technology = (FlowMeterTypes[this.calibrationData.technology] as string).split(" ").join("");
      const fluidType = (WellFlowTypes[this.calibrationData.fluidType] as string).split(" ").join("");
      const dateTime = formatDate(new Date(), 'MMM-d-yyy_HH:mm:ss', 'en');
      const calibrationFileData = this.constructCalFile();
      let data: SurefloCalibrationApplyDialogData = {
        fileName: `${Technology}_${fluidType}_${dateTime}`
      };
      let dialogRef = this.gwModalService.openDialogInsideModal(
        'Calibration File',
        ButtonActions.None,
        SurefloCalibrationApplyDialogComponent,
        data,
        (result) => {
          if (result) {
            const calFileName = `${result}.txt`;
            calibrationFileData.calibrationFileName = calFileName;
            this.calibrationData.calibrationFileName = calFileName;
            let blob = new Blob([JSON.stringify(calibrationFileData)], { type: "text/plain;charset=utf-8" });
            saveAs(blob, `${calFileName}`);
            this.dialogRef.close(this.calibrationData);
          } else {
            dialogRef.close();
          }
        },
        '380px',
      );
    } else {
      this.dialogRef.close(this.calibrationData);
    }
  }

  // To exclude irrelevant properties 
  constructCalFile() {

    if (this.fluidTypeGasVisibility) {
      const calibrationFile = this.surefloService.construct298EXGasCalFile(this.calibrationData);
      return calibrationFile;
    } else if (this.fluidTypeWaterVisibility) {
      const calibrationFile = this.surefloService.construct298EXWaterCalFile(this.calibrationData);
      return calibrationFile;
    }
    else {
      const calibrationFile = this.surefloService.construct298EXOilCalFile(this.calibrationData);
      return calibrationFile;
    }
   
  }

  ngOnInit(): void {
    this.calibrationData = _.cloneDeep(this.data);
    this.fluidTypeGasVisibility = WellFlowTypes[this.calibrationData.fluidType] === WellFlowTypes[2] ||
                             WellFlowTypes[this.calibrationData.fluidType] === WellFlowTypes[4] ? true : false;
    this.fluidTypeWaterVisibility = WellFlowTypes[this.calibrationData.fluidType] === WellFlowTypes[3] ? true : false;
  }

}

export class SurefloExCalibrationDialogData  extends SureFLO298EXCalibrationModel {
}
