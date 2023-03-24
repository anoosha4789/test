import { formatDate } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SureFLO298CalibrationModel, SureFLO298GasCalibrationModel, SureFLO298WaterCalibrationModel } from '@core/models/UIModels/sureflo-flowmeter-model';
import { FlowMeterTypes, WellFlowTypes } from '@core/models/UIModels/sureflo.model';
import { SurefloService } from '@core/services/sureflo.service';
import { ButtonActions } from '@shared/gateway-dialogs/components/gateway-advanced-dialog/gateway-advanced-dialog.component';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { SurefloCalibrationApplyDialogComponent, SurefloCalibrationApplyDialogData } from '@shared/sureflo/components/sureflo-calibration-apply-dialog/sureflo-calibration-apply-dialog.component';
import { SurefloCalibrationResetDialogComponent } from '@shared/sureflo/components/sureflo-calibration-reset-dialog/sureflo-calibration-reset-dialog.component';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-sureflo-calibration-dialog',
  templateUrl: './sureflo-calibration-dialog.component.html',
  styleUrls: ['./sureflo-calibration-dialog.component.scss']
})

export class SurefloCalibrationDialogComponent implements OnInit {
  isFormValid = false;
  isGaugeFormValid = true;
  isPVTFormValid = true;
  isAddParamFormValid = true;
  isFilterParamFormValid = true;
  fluidTypeGasVisibility = false;
  fluidTypeWaterVisibility = false;
  activeTabIndex = 0;

  flowmeterdimensions: any;
  calibrationData: SureFLO298CalibrationModel;

  constructor(public dialogRef: MatDialogRef<SurefloCalibrationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SurefloCalibrationDialogData,
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
      this.isAddParamFormValid && this.calibrationData.additionalParameters !== null && isCalibratioDataValid;
    // 298 Oil Producer &  Water Injector
    if (!this.fluidTypeGasVisibility) {
      this.isFormValid = this.isFormValid && this.isPVTFormValid && this.calibrationData.fluidPVTData !== null;
    }
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
      const calibrationFile = this.surefloService.construct298GasCalFile(this.calibrationData);
      return calibrationFile;
    } else if (this.fluidTypeWaterVisibility) {
      const calibrationFile = this.surefloService.construct298WaterCalFile(this.calibrationData);
      return calibrationFile;
    } else {
      const calibrationFile = this.surefloService.construct298OilCalFile(this.calibrationData);
      return calibrationFile;
    }
  }
  
  ngOnInit(): void {
    this.calibrationData = cloneDeep(this.data);
    this.fluidTypeGasVisibility = WellFlowTypes[this.calibrationData.fluidType] === WellFlowTypes[2] ||
                             WellFlowTypes[this.calibrationData.fluidType] === WellFlowTypes[4] ? true : false;
    this.fluidTypeWaterVisibility = WellFlowTypes[this.calibrationData.fluidType] === WellFlowTypes[3] ? true : false;
  }

}

export class SurefloCalibrationDialogData  extends SureFLO298CalibrationModel {}
