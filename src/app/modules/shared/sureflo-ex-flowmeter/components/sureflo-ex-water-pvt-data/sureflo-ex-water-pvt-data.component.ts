import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { RangeValidator } from '@core/customValidators/rangeValidator.validator';
import { sureflo298EXModelSchema } from '@core/models/schemaModels/SureFLOFlowMeter298Ex.schema';

import { SureFLO298EXCalibrationModel } from '@core/models/UIModels/sureflo-ex-flowmeter-model';
import { FlowMeterCalibrationFile } from '@core/models/webModels/SureFLODataModel.model';
import { ValidationService } from '@core/services/validation.service';
import { GwNumberFormatterPipe } from '@shared/gateway-pipes/pipes/gw-number-formatter.pipe';
import { debounceTime } from 'rxjs/operators';
import { SureFLO298ExConstants } from '../../sureflo298Ex.constant';

@Component({
  selector: 'sureflo-ex-water-pvt-data',
  templateUrl: './sureflo-ex-water-pvt-data.component.html',
  styleUrls: ['./sureflo-ex-water-pvt-data.component.scss']
})
export class SurefloExWaterPvtDataComponent implements OnInit, OnChanges, OnDestroy {

  @Input() data: SureFLO298EXCalibrationModel;
  @Output() isFormValidEvent = new EventEmitter();
  
  pvtFormValid = true;
  waterVolFactorCalFilePath = 'Browse...';
  waterViscosityCalFilePath = 'Browse...';
  waterDensityCalFilePath = 'Browse...';
  waterVolFactorInvalidMsg = null;
  waterViscosityInvalidMsg = null;
  waterDensityInvalidMsg = null;
  coefficientErrorMsg = null;
  waterCutErrorMsg = null;
  measuredDepthErrorMsg = null;
  waterVolFactorFileArray:string[] = new Array();
  waterViscosityFileArray:string[] = new Array();
  waterDensityFileArray :string[] = new Array();

  // Validation messages
  formCtrlErrorMessage: any;
  private mapErrMessages: Map<string, string> = new Map<string, string>();

  customWaterToggle = {
    color: 'primary',
    checked: false,
    disabled: false
  }

  surefloExPVTForm: FormGroup;
  surefloExAddParamForm: FormGroup;

  constructor(private gwNumberPipe: GwNumberFormatterPipe, private validationService: ValidationService) { }

  toggleCustomWaterSection(event: MatSlideToggleChange) {
    this.customWaterToggle.checked = event.checked;
    this.setCustomWaterFormData(event.checked);
  }

  browseFileDialog(selInputElem: HTMLInputElement) {
    selInputElem.value = null;
    selInputElem.click();
  }

  onWaterVolFactorCalFileChange(fileInput: any) {
    if (fileInput.target.files.length == 0)
      return;
    this.waterVolFactorInvalidMsg = null;
    this.waterVolFactorCalFilePath = fileInput.target.files[0].name;
    let extension = this.waterVolFactorCalFilePath.split(".")[1];

    if (extension.toLowerCase() !== "cal") {
      this.resetWaterFVFFileInput();
      this.waterVolFactorInvalidMsg = "Please select a valid calibration file.";
    } else {
      let file = fileInput.target.files[0];
      let reader = new FileReader();
      reader.readAsText(file, "UTF-8");
      reader.onloadend = (e) => {
        if (reader.result) {
          this.waterVolFactorFileArray = this.formatCalibrationFile(reader.result);
          const waterVolumeFactorCalFile: FlowMeterCalibrationFile = {
            UseFile: true,
            FileName: this.waterVolFactorCalFilePath,
            CalibrationData: this.waterVolFactorFileArray
          }; 
          this.surefloExPVTForm.value.WaterVolumeFactorCalibration = waterVolumeFactorCalFile;
          this.validateCustomWaterFormData();
          this.setFormStatus();
        } else {
          this.waterVolFactorCalFilePath = "Browse...";
          this.waterVolFactorInvalidMsg = "Please select a valid calibration file.";
        }
      };
    }
  }

  onWaterDensityCalFileChange(fileInput: any) {
    if (fileInput.target.files.length == 0)
      return;
    this.waterDensityInvalidMsg = null;
    this.waterDensityCalFilePath = fileInput.target.files[0].name;
    let extension = this.waterDensityCalFilePath.split(".")[1];
    if (extension.toLowerCase() !== "cal") {
      this.resetWaterDensityFileInput();
      this.waterDensityInvalidMsg = "Please select a valid calibration file.";
    } else {
      let file = fileInput.target.files[0];
      let reader = new FileReader();
      reader.readAsText(file, "UTF-8");
      reader.onloadend = (e) => {
        if (reader.result) {
          this.waterDensityFileArray = this.formatCalibrationFile(reader.result);
          const waterDensityCalFile: FlowMeterCalibrationFile = {
            UseFile: true,
            FileName: this.waterDensityCalFilePath,
            CalibrationData: this.waterDensityFileArray
          }; 
          this.surefloExPVTForm.value.WaterDensityCalibration = waterDensityCalFile;
          this.validateCustomWaterFormData();
          this.setFormStatus();
        } else {
          this.waterDensityCalFilePath = "Browse...";
          this.waterDensityInvalidMsg = "Please select a valid calibration file.";
        }
      };
    }
  }

  onWaterViscosityCalFileChange(fileInput: any) {
    if (fileInput.target.files.length == 0)
      return;

    this.waterViscosityInvalidMsg = null;
    this.waterViscosityCalFilePath = fileInput.target.files[0].name;
    let extension = this.waterViscosityCalFilePath.split(".")[1];
    if (extension.toLowerCase() !== "cal") {
      this.resetWaterViscosityFileInput();
      this.waterViscosityInvalidMsg = "Please select a valid calibration file.";
    } else {
      let file = fileInput.target.files[0];
      let reader = new FileReader();
      reader.readAsText(file, "UTF-8");
      reader.onloadend = (e) => {
        if (reader.result) {
          this.waterViscosityFileArray = this.formatCalibrationFile(reader.result);
          const waterViscosityCalFile: FlowMeterCalibrationFile = {
            UseFile: true,
            FileName: this.waterViscosityCalFilePath,
            CalibrationData: this.waterViscosityFileArray
          }; 
          this.surefloExPVTForm.value.WaterViscosityCalibration = waterViscosityCalFile;
          this.validateCustomWaterFormData();
          this.setFormStatus();
        } else {
          this.waterViscosityCalFilePath = "Browse...";
          this.waterViscosityInvalidMsg = "Please select a valid calibration file.";
        }
      };
    }
  }

  formatCalibrationFile(data) {
    let fileArray = [];
    let allTextLines = (<string>data).split("\n");
    if (allTextLines.length > 0) {
      if (allTextLines[allTextLines.length - 1].trim() == "")
        allTextLines.splice(allTextLines.length - 1);
    }
    for (let i = 0; i < allTextLines.length; i++) {
      fileArray.push(allTextLines[i].trim());
    }
    return fileArray;
  }

  validateCustomWaterFormData() {
    this.validateFormControls();
    let isCustomWaterFormValid = false;
    if (!this.surefloExPVTForm.value.UseCustomWaterProperties) {
      isCustomWaterFormValid = this.surefloExPVTForm.value.SpecificGravityWater !== null ? true : false;
    } else {
      isCustomWaterFormValid = this.surefloExPVTForm.value.WaterVolumeFactorCalibration !== null &&
                               this.surefloExPVTForm.value.WaterViscosityCalibration !== null &&
                               this.surefloExPVTForm.value.WaterDensityCalibration !== null;
    }
    this.data.fluidPVTData = this.surefloExPVTForm.value;
    this.data.fluidPVTData.SpecificGravityWater = this.surefloExPVTForm.value.SpecificGravityWater ?? 0; 
    this.data.additionalParameters = this.surefloExAddParamForm.value;
    isCustomWaterFormValid = isCustomWaterFormValid && this.surefloExPVTForm.valid && this.surefloExAddParamForm.valid;
    this.pvtFormValid = isCustomWaterFormValid;
    if(!this.surefloExPVTForm.pristine || !this.surefloExAddParamForm.pristine) this.data.IsDirty = isCustomWaterFormValid;
    this.isFormValidEvent.emit(isCustomWaterFormValid);
  }


  setCustomWaterFormData(useFile: boolean) {
    const waterFVFCalFile = this.surefloExPVTForm.value.WaterVolumeFactorCalibration;
    const waterDensityCalFile = this.surefloExPVTForm.value.WaterDensityCalibration;
    const waterViscosityCalFile = this.surefloExPVTForm.value.WaterViscosityCalibration;
    if(waterFVFCalFile) {
      waterFVFCalFile.useFile = useFile;
    }
    if(waterDensityCalFile) { 
      waterDensityCalFile.useFile = useFile;
    }
    if(waterViscosityCalFile) { 
      waterViscosityCalFile.useFile = useFile;
    }
    this.surefloExPVTForm.patchValue({ 
      WaterVolumeFactorCalibration: waterFVFCalFile,
      WaterViscosityCalibration: waterDensityCalFile,
      WaterDensityCalibration: waterViscosityCalFile
    });
    this.waterVolFactorInvalidMsg = null;
    this.waterViscosityInvalidMsg = null;
    this.waterDensityInvalidMsg = null;
  }

  resetWaterFVFFileInput() {
    this.surefloExPVTForm.patchValue({ 
      WaterVolumeFactorCalibration: null
    });
    this.waterVolFactorCalFilePath = "Browse...";
    this.waterVolFactorFileArray = [];
  }

  resetWaterDensityFileInput() {
    this.surefloExPVTForm.patchValue({ 
      WaterDensityCalibration: null
    });
    this.waterDensityCalFilePath = "Browse...";
    this.waterDensityFileArray = [];
  }

  resetWaterViscosityFileInput() {
    this.surefloExPVTForm.patchValue({ 
      WaterViscosityCalibration: null
    });
    this.waterViscosityCalFilePath = "Browse...";
    this.waterViscosityFileArray = [];
  }

  createFormGroup() {
    this.surefloExPVTForm = new FormGroup({});
  
    for (const property in sureflo298EXModelSchema.definitions.FluidPVTData298Ex.properties) {

      if (sureflo298EXModelSchema.definitions.FluidPVTData298Ex.properties.hasOwnProperty(property)) {
        const formControl = new FormControl('');
        const validationFn: ValidatorFn[] = [];
        const prop = sureflo298EXModelSchema.definitions.FluidPVTData298Ex.properties[property];
        if (prop.minLength !== undefined) {
          validationFn.push(Validators.minLength(prop.minLength));
        }
        if (prop.maxLength !== undefined) {
          validationFn.push(Validators.maxLength(prop.maxLength));
        }

        if (prop.minimum !== undefined && prop.maximum !== undefined) {
          validationFn.push(RangeValidator.range(prop.minimum, prop.maximum));
        } else {
          if (prop.minimum !== undefined) {
            validationFn.push(Validators.min(prop.minimum));
          }

          if (prop.maximum !== undefined) {
            validationFn.push(Validators.max(prop.maximum));
          }
        }

        if (prop.type !== undefined && prop.type === 'number') {
          validationFn.push(this.validationService.ValidateNumber);
        }

        if (sureflo298EXModelSchema.definitions.FluidPVTData298Ex.required.includes(property)) {
          validationFn.push(Validators.required);
        }
        this.surefloExPVTForm.addControl(property, formControl);
        formControl.setValidators(validationFn);
        
      }
    }
    this.createAddParamFormGroup();
    this.setFormData();
    this.validateOnInit();
  }

  createAddParamFormGroup() {

      this.surefloExAddParamForm = new FormGroup({});
  
      for (const property in sureflo298EXModelSchema.definitions.AdditionalParameters298Ex.properties) {
        if (sureflo298EXModelSchema.definitions.AdditionalParameters298Ex.properties.hasOwnProperty(property)) {
          const formControl = new FormControl('');
          const validationFn: ValidatorFn[] = [];
          const prop = sureflo298EXModelSchema.definitions.AdditionalParameters298Ex.properties[property];
          if (prop.minLength !== undefined) {
            validationFn.push(Validators.minLength(prop.minLength));
          }
          if (prop.maxLength !== undefined) {
            validationFn.push(Validators.maxLength(prop.maxLength));
          }
  
          if (prop.minimum !== undefined && prop.maximum !== undefined) {
            validationFn.push(RangeValidator.range(prop.minimum, prop.maximum));
          } else {
            if (prop.minimum !== undefined) {
              validationFn.push(Validators.min(prop.minimum));
            }
  
            if (prop.maximum !== undefined) {
              validationFn.push(Validators.max(prop.maximum));
            }
          }
  
          if (prop.type !== undefined && prop.type === 'number') {
            validationFn.push(this.validationService.ValidateNumber);
          }
  
          if (sureflo298EXModelSchema.definitions.AdditionalParameters298Ex.required.includes(property)) {
            validationFn.push(Validators.required);
          }
          this.surefloExAddParamForm.addControl(property, formControl);
          formControl.setValidators(validationFn);
          
        }
      }
  }

  setFormData() {   
    const fileInputDefTxt = "Browse...";
    const fluidPVTData = this.data?.fluidPVTData;
    this.surefloExPVTForm.patchValue(
      {
        
        SpecificGravityWater: fluidPVTData ? this.gwNumberPipe.transform(fluidPVTData.SpecificGravityWater) : null,
        UseCustomWaterProperties: fluidPVTData ? fluidPVTData.UseCustomWaterProperties : false,
        WaterVolumeFactorCalibration: fluidPVTData ? fluidPVTData.WaterVolumeFactorCalibration : null,
        WaterDensityCalibration: fluidPVTData ? fluidPVTData.WaterDensityCalibration : null,
        WaterViscosityCalibration: fluidPVTData ? fluidPVTData.WaterViscosityCalibration : null,
        CalculateDensity: true,
        CalculateViscosity: true,
        GasOilRatio: 0,
        GasOilRatioCalibration: null,
        OilSurfaceViscosity: 0,
        SpecificGravityOil: 0,
        SpecificGravityGas: 0,
        UseOilPVTFile: false,
        UseWaterPVTFile: false,
        UseCustomOilProperties: fluidPVTData ? fluidPVTData.UseCustomOilProperties : false,
        OilDensityCalibration: null,
        OilViscosityCalibration: null,
        OilVolumeFactorCalibration: null,
        UseCustomGasProperties: fluidPVTData ? fluidPVTData.UseCustomGasProperties : false,
        GasDensityCalibration: null,
        GasViscosityCalibration: null,
        GasVolumeFactorCalibration: null,
      }
    );
    const additionalParameters = this.data?.additionalParameters;
    this.surefloExAddParamForm.patchValue(
      {
        CoefficientExpansion: additionalParameters ? this.gwNumberPipe.transform(additionalParameters.CoefficientExpansion) : null,
        Deviation: additionalParameters ? this.gwNumberPipe.transform(additionalParameters.Deviation) : 0,
        EmulsificationStability: additionalParameters ? this.gwNumberPipe.transform(additionalParameters.EmulsificationStability) : 0,
        MeasuredDepth: additionalParameters ? this.gwNumberPipe.transform(additionalParameters.MeasuredDepth) : null,
        RoughnessFactor: additionalParameters ? this.gwNumberPipe.transform(additionalParameters.RoughnessFactor) : 0,
        SurfaceWaterCut: additionalParameters ? this.gwNumberPipe.transform(additionalParameters.SurfaceWaterCut) : null,
        TrueVerticalDepth: additionalParameters ? this.gwNumberPipe.transform(additionalParameters.TrueVerticalDepth) : 0,
        WaterCutInversion: additionalParameters ? this.gwNumberPipe.transform(additionalParameters.WaterCutInversion) : 0
      }
    );
    this.customWaterToggle.checked = fluidPVTData?.UseCustomWaterProperties ? fluidPVTData.UseCustomWaterProperties : false;
    this.waterVolFactorCalFilePath = fluidPVTData?.WaterVolumeFactorCalibration ? fluidPVTData.WaterVolumeFactorCalibration.FileName : fileInputDefTxt;
    this.waterDensityCalFilePath = fluidPVTData?.WaterDensityCalibration ? fluidPVTData.WaterDensityCalibration.FileName : fileInputDefTxt;
    this.waterViscosityCalFilePath = fluidPVTData?.WaterViscosityCalibration ? fluidPVTData.WaterViscosityCalibration.FileName : fileInputDefTxt;
   
    this.subscribeToFormDataChanges();
  }

  private subscribeToFormDataChanges() {
    this.surefloExPVTForm.valueChanges.pipe(debounceTime(200)).subscribe((val) => {
      this.validateCustomWaterFormData();
      if (!this.surefloExPVTForm.pristine && this.pvtFormValid) {
        this.data.IsDirty = true;
      }
    });
    this.surefloExAddParamForm.valueChanges.pipe(debounceTime(200)).subscribe((val) => {
      this.validateCustomWaterFormData();
      if (!this.surefloExAddParamForm.pristine && this.pvtFormValid) {
        this.data.IsDirty = true;
      }
    });
  }

  setFormStatus() {
    this.data.IsDirty = this.pvtFormValid;
    this.isFormValidEvent.emit(this.pvtFormValid);
  }

  getCtrlErrorMsg(ctrlName: string, ctrl: AbstractControl) {
    let errorMsg = '';
    if ((ctrl.dirty || ctrl.touched) && ctrl.errors) {
      ctrl.markAsTouched();
      errorMsg = this.validationService.getValidationErrorMessage(ctrl.errors, ctrlName);
      this.mapErrMessages.set(ctrlName, errorMsg);
    } else {
      this.mapErrMessages.delete(ctrlName);
    }
    return errorMsg;
  }

  private setFormControlStatus() {
    Object.keys(this.surefloExPVTForm.controls).forEach(key => {
      this.getCtrlErrorMsg(key, this.surefloExPVTForm.controls[key]);
    });
    Object.keys(this.surefloExAddParamForm.controls).forEach(key => {
      this.getCtrlErrorMsg(key, this.surefloExAddParamForm.controls[key]);
    });
    this.formCtrlErrorMessage = [];
    for (let [key, value] of this.mapErrMessages) {
      this.formCtrlErrorMessage[key] = value;
    }
  }

  validateFormControls(): void {
    if (this.surefloExPVTForm && this.surefloExAddParamForm) {
      this.setFormControlStatus();
    }
  }

  private validateOnInit(): void {

    if (this.surefloExPVTForm && this.data?.fluidPVTData) {
      if (this.data.fluidPVTData.UseCustomWaterProperties) {
        this.surefloExPVTForm.markAllAsTouched();
      } else {
        this.surefloExPVTForm.controls['SpecificGravityWater'].markAllAsTouched();
      }
      this.setFormControlStatus();
    }

    if (this.surefloExAddParamForm && this.data?.additionalParameters) {
      this.surefloExAddParamForm.markAllAsTouched();
      this.setFormControlStatus();
    }
  }

  ngOnInit(): void {
    this.createFormGroup();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.data.firstChange) {
      this.createFormGroup();
    }
  }

  ngOnDestroy(): void {
    this.validateCustomWaterFormData();
  }


}

