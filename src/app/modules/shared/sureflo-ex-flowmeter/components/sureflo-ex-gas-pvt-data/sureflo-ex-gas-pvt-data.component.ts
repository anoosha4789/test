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
  selector: 'sureflo-ex-gas-pvt-data',
  templateUrl: './sureflo-ex-gas-pvt-data.component.html',
  styleUrls: ['./sureflo-ex-gas-pvt-data.component.scss']
})

export class SurefloExGasPvtDataComponent implements OnInit, OnChanges, OnDestroy {

  @Input() data: SureFLO298EXCalibrationModel;
  @Output() isFormValidEvent = new EventEmitter();

  formValid = true;
  customGasVisibility = false;
  gasVolFactorCalFilePath = 'Browse...';
  gasViscosityCalFilePath = 'Browse...';
  gasDensityCalFilePath = 'Browse...';
  gasCalFileInvalidMsg = null;
  gasVolFactorInvalidMsg = null;
  gasViscosityInvalidMsg = null;
  gasDensityInvalidMsg= null;
  coefficientErrorMsg = null;
  measuredDepthErrorMsg = null;
  gasVolFactorFileArray:string[] = new Array();
  gasViscosityFileArray:string[] = new Array();
  gasDensityFileArray :string[] = new Array();

  // Validation messages
  formCtrlErrorMessage: any;
  private mapErrMessages: Map<string, string> = new Map<string, string>();

  // 298EX Gas Producer/Injector
  gasAdditionalParams = {
    CoefficientExpansion: 0,
    MeasuredDepth: 0,
    Deviation: 0,
    EmulsificationStability: 0,
    RoughnessFactor: 0,
    SurfaceWaterCut: 0,
    TrueVerticalDepth: 0,
    WaterCutInversion: 0
  }

  customGasToggle = {
    color: 'primary',
    checked: false,
    disabled: false
  }

  surefloExPVTForm: FormGroup;
  surefloExAddParamForm: FormGroup;

  constructor(private gwNumberPipe: GwNumberFormatterPipe, private validationService: ValidationService) { }

  toggleCustomGasSection(event: MatSlideToggleChange) {
    this.customGasToggle.checked = event.checked;
    this.setCustomGasFormData(event.checked);
  }

  browseFileDialog(selInputElem: HTMLInputElement) {
    selInputElem.value = null;
    selInputElem.click();
  }

  onGasVolFactorCalFileChange(fileInput: any) {
    if (fileInput.target.files.length == 0)
      return;
    this.gasVolFactorInvalidMsg = null;
    this.gasVolFactorCalFilePath = fileInput.target.files[0].name;
    let extension = this.gasVolFactorCalFilePath.split(".")[1];

    if (extension.toLowerCase() !== "cal") {
      this.gasVolFactorCalFilePath = "Browse...";
      this.gasVolFactorInvalidMsg = "Please select a valid calibration file.";
    } else {
      let file = fileInput.target.files[0];
      let reader = new FileReader();
      reader.readAsText(file, "UTF-8");
      reader.onloadend = (e) => {
        if (reader.result) {
          this.gasVolFactorFileArray = this.formatCalibrationFile(reader.result);
          const gasVolumeFactorCalFile: FlowMeterCalibrationFile = {
            UseFile: true,
            FileName: this.gasVolFactorCalFilePath,
            CalibrationData: this.gasVolFactorFileArray
          }; 
          this.surefloExPVTForm.value.GasVolumeFactorCalibration = gasVolumeFactorCalFile;
          this.validateCustomGasFormData();
          this.setFormStatus();
        } else {
          this.gasVolFactorCalFilePath = "Browse...";
          this.gasVolFactorInvalidMsg = "Please select a valid calibration file.";
        }
      };
    }
  }

  onGasDensityCalFileChange(fileInput: any) {
    if (fileInput.target.files.length == 0)
      return;
    this.gasDensityInvalidMsg = null;
    this.gasDensityCalFilePath = fileInput.target.files[0].name;
    let extension = this.gasDensityCalFilePath.split(".")[1];
    if (extension.toLowerCase() !== "cal") {
      this.gasDensityCalFilePath = "Browse...";
      this.gasDensityInvalidMsg = "Please select a valid calibration file.";
    } else {
      let file = fileInput.target.files[0];
      let reader = new FileReader();
      reader.readAsText(file, "UTF-8");
      reader.onloadend = (e) => {
        if (reader.result) {
          this.gasDensityFileArray = this.formatCalibrationFile(reader.result);
          const gasDensityCalFile: FlowMeterCalibrationFile = {
            UseFile: true,
            FileName: this.gasDensityCalFilePath,
            CalibrationData: this.gasDensityFileArray
          }; 
          this.surefloExPVTForm.value.GasDensityCalibration = gasDensityCalFile;
          this.validateCustomGasFormData();
          this.setFormStatus();
        } else {
          this.gasDensityCalFilePath = "Browse...";
          this.gasDensityInvalidMsg = "Please select a valid calibration file.";
        }
      };
    }
  }

  onGasViscosityCalFileChange(fileInput: any) {
    if (fileInput.target.files.length == 0)
      return;

    this.gasViscosityInvalidMsg = null;
    this.gasViscosityCalFilePath = fileInput.target.files[0].name;
    let extension = this.gasViscosityCalFilePath.split(".")[1];
    if (extension.toLowerCase() !== "cal") {
      this.gasViscosityCalFilePath = "Browse...";
      this.gasViscosityInvalidMsg = "Please select a valid calibration file.";
    } else {
      let file = fileInput.target.files[0];
      let reader = new FileReader();
      reader.readAsText(file, "UTF-8");
      reader.onloadend = (e) => {
        if (reader.result) {
          this.gasViscosityFileArray = this.formatCalibrationFile(reader.result);
          const gasViscosityCalFile: FlowMeterCalibrationFile = {
            UseFile: true,
            FileName: this.gasViscosityCalFilePath,
            CalibrationData: this.gasViscosityFileArray
          }; 
          this.surefloExPVTForm.value.GasViscosityCalibration = gasViscosityCalFile;
          this.validateCustomGasFormData();
          this.setFormStatus();
        } else {
          this.gasViscosityCalFilePath = "Browse...";
          this.gasViscosityInvalidMsg = "Please select a valid calibration file.";
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
      // if (allTextLines[i].trim().startsWith("'")) {
      //   allTextLines[i] = allTextLines[i].replace("\r", '');
      // }
      // fileArray.push(allTextLines[i]);
    }
    return fileArray;
  }

  validateCustomGasFormData() {
    this.validateFormControls();
    let isCustomGasFormValid = false;
    if (!this.surefloExPVTForm.value.UseCustomGasProperties) {
      isCustomGasFormValid = this.surefloExPVTForm.value.SpecificGravityGas !== null ? true : false;
    } else {
      isCustomGasFormValid = this.surefloExPVTForm.value.GasVolumeFactorCalibration !== null &&
        this.surefloExPVTForm.value.GasViscosityCalibration !== null &&
        this.surefloExPVTForm.value.GasDensityCalibration !== null;
    }
    this.data.fluidPVTData = this.surefloExPVTForm.value;
    this.data.additionalParameters = this.surefloExAddParamForm.value;
    this.data.fluidPVTData.SpecificGravityGas = this.surefloExPVTForm.value.SpecificGravityGas ?? 0; 
    isCustomGasFormValid = isCustomGasFormValid && this.surefloExPVTForm.valid && this.surefloExAddParamForm.valid;
    this.formValid = isCustomGasFormValid;
    if(!this.surefloExPVTForm.pristine || !this.surefloExAddParamForm.pristine) this.data.IsDirty = isCustomGasFormValid;
    this.isFormValidEvent.emit(isCustomGasFormValid);
  }

  setCustomGasFormData(useFile: boolean) {
    const gasFVFCalFile = this.surefloExPVTForm.value.GasVolumeFactorCalibration;
    const gasDensityCalFile = this.surefloExPVTForm.value.GasDensityCalibration;
    const gasViscosityCalFile = this.surefloExPVTForm.value.GasViscosityCalibration;
    if(gasFVFCalFile) { 
      gasFVFCalFile.useFile = useFile;
    }
    if(gasDensityCalFile) { 
      gasDensityCalFile.useFile = useFile;
    }
    if(gasViscosityCalFile) { 
      gasViscosityCalFile.useFile = useFile;
    }
    this.surefloExPVTForm.patchValue({ 
      GasVolumeFactorCalibration: gasFVFCalFile,
      GasDensityCalibration: gasViscosityCalFile,
      GasViscosityCalibration: gasDensityCalFile
    });
    this.gasVolFactorInvalidMsg = null;
    this.gasDensityInvalidMsg = null;
    this.gasViscosityInvalidMsg = null;
  }

  createFormGroup() {
    this.createPVTFormGroup();
    this.createAddParamFormGroup();
    this.setFormData();
    this.validateOnInit();
  }

  createPVTFormGroup() {
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
        SpecificGravityGas: fluidPVTData ? this.gwNumberPipe.transform(fluidPVTData.SpecificGravityGas) : null,
        UseCustomGasProperties: fluidPVTData ? fluidPVTData.UseCustomGasProperties : false,
        GasDensityCalibration: fluidPVTData ? fluidPVTData.GasDensityCalibration : null,
        GasViscosityCalibration: fluidPVTData ? fluidPVTData.GasViscosityCalibration : null,
        GasVolumeFactorCalibration: fluidPVTData ? fluidPVTData.GasVolumeFactorCalibration : null,
        CalculateDensity: true,
        CalculateViscosity: true,
        GasOilRatio: 0,
        GasOilRatioCalibration: null,
        OilSurfaceViscosity: 0,
        SpecificGravityOil: 0,
        SpecificGravityWater:0,
        UseOilPVTFile: false,
        UseWaterPVTFile: false,
        UseCustomOilProperties: fluidPVTData ? fluidPVTData.UseCustomOilProperties : false,
        OilDensityCalibration: null,
        OilViscosityCalibration: null,
        OilVolumeFactorCalibration: null,
        UseCustomWaterProperties: fluidPVTData ? fluidPVTData.UseCustomWaterProperties : false,
        WaterDensityCalibration: null,
        WaterViscosityCalibration: null,
        WaterVolumeFactorCalibration: null
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
        SurfaceWaterCut: additionalParameters ? this.gwNumberPipe.transform(additionalParameters.SurfaceWaterCut) : 0,
        TrueVerticalDepth: additionalParameters ? this.gwNumberPipe.transform(additionalParameters.TrueVerticalDepth) : 0,
        WaterCutInversion: additionalParameters ? this.gwNumberPipe.transform(additionalParameters.WaterCutInversion) : 0
      }
    );


    this.customGasToggle.checked = fluidPVTData?.UseCustomGasProperties ? fluidPVTData.UseCustomGasProperties : false;
    this.gasVolFactorCalFilePath = fluidPVTData?.GasVolumeFactorCalibration ? fluidPVTData.GasVolumeFactorCalibration.FileName : fileInputDefTxt;
    this.gasDensityCalFilePath = fluidPVTData?.GasDensityCalibration ? fluidPVTData.GasDensityCalibration.FileName : fileInputDefTxt;
    this.gasViscosityCalFilePath = fluidPVTData?.GasViscosityCalibration ? fluidPVTData.GasViscosityCalibration.FileName : fileInputDefTxt;

    this.subscribeToFormDataChanges();
  }

  private subscribeToFormDataChanges() {
    this.surefloExPVTForm.valueChanges.pipe(debounceTime(200)).subscribe((val) => {
      this.validateCustomGasFormData();
      if (!this.surefloExPVTForm.pristine && this.formValid) {
        this.data.IsDirty = true;
      }
    });
    this.surefloExAddParamForm.valueChanges.pipe(debounceTime(200)).subscribe((val) => {
      this.validateCustomGasFormData();
      if (!this.surefloExAddParamForm.pristine && this.formValid) {
        this.data.IsDirty = true;
      }
    });
  }

  setFormStatus() {
    this.data.IsDirty = this.formValid;
    this.isFormValidEvent.emit(this.formValid);
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
      if(this.data.fluidPVTData.UseCustomWaterProperties) {
        this.surefloExPVTForm.markAllAsTouched();
      }
      this.surefloExPVTForm.controls['SpecificGravityGas'].markAllAsTouched();
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
    this.validateCustomGasFormData();
  }


}
