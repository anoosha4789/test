import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { RangeValidator } from '@core/customValidators/rangeValidator.validator';
import { sureflo298EXModelSchema } from '@core/models/schemaModels/SureFLOFlowMeter298Ex.schema';

import { SureFLO298EXCalibrationModel } from '@core/models/UIModels/sureflo-ex-flowmeter-model';
import { WellFlowTypes } from '@core/models/UIModels/sureflo.model';
import { FlowMeterCalibrationFile } from '@core/models/webModels/SureFLODataModel.model';
import { ValidationService } from '@core/services/validation.service';
import { GwNumberFormatterPipe } from '@shared/gateway-pipes/pipes/gw-number-formatter.pipe';
import { debounceTime } from 'rxjs/operators';
import { SureFLO298ExConstants } from '../../sureflo298Ex.constant';

@Component({
  selector: 'sureflo-ex-pvt-data',
  templateUrl: './sureflo-ex-pvt-data.component.html',
  styleUrls: ['./sureflo-ex-pvt-data.component.scss']
})
export class SurefloExPvtDataComponent implements OnInit, OnChanges, OnDestroy {

  @Input() data: SureFLO298EXCalibrationModel;
  @Output() isFormValidEvent = new EventEmitter();
  
  pvtFormValid = true;
  customGasVisibility = false;
  gasFluidTypeVisibility = false;
  waterFluidTypeVisibility = false;
  oilVolFactorCalFilePath = 'Browse...';
  oilDensityCalFilePath = 'Browse...';
  oilViscosityCalFilePath = 'Browse...';
  waterVolFactorCalFilePath = 'Browse...';
  waterDensityCalFilePath = 'Browse...';
  waterViscosityCalFilePath = 'Browse...';
  gasOilRatioCalFilePath = 'Browse...';
  oilVolFactorInvalidMsg = null;
  oilViscosityInvalidMsg = null;
  oilDensityInvalidMsg = null;
  waterVolFactorInvalidMsg = null;
  waterViscosityInvalidMsg = null;
  waterDensityInvalidMsg= null;
  gasCalFileInvalidMsg = null;
  oilVolFactorFileArray:string[] = new Array();
  oilViscosityFileArray:string[] = new Array();
  oilDensityFileArray:string[] = new Array();
  waterVolFactorFileArray:string[] = new Array();
  waterViscosityFileArray:string[] = new Array();
  waterDensityFileArray :string[] = new Array();
  gasOilRatioFileArray:string[] = new Array();

  // Validation messages
  formCtrlErrorMessage:any;
  private mapErrMessages: Map<string, string> = new Map<string, string>();

  // 298EX Gas Producer/Injector
  gasAdditionalParams = {
    CoefficientExpansion: null,
    MeasuredDepth: null,
    Deviation: 0,
    EmulsificationStability: 0,
    RoughnessFactor: 0,
    SurfaceWaterCut: 0,
    TrueVerticalDepth: 0,
    WaterCutInversion: 0
  }

  customOilToggle = {
    color: 'primary',
    checked: false,
    disabled: false
  }

  customWaterToggle = {
    color: 'primary',
    checked: false,
    disabled: false
  }

  customGasToggle = {
    color: 'primary',
    checked: false,
    disabled: false
  }

  surefloExPVTForm: FormGroup;

  constructor(private gwNumberPipe: GwNumberFormatterPipe, private validationService: ValidationService) { }

  onInletPressureInputClick() {

  }

  toggleCustomOilSection(event: MatSlideToggleChange) {
    this.customOilToggle.checked = event.checked;
    this.setCustomOilFormData(event.checked);
    if(event.checked)  { 
      this.surefloExPVTForm.controls['SpecificGravityOil'].setErrors(null);
      this.mapErrMessages.delete('SpecificGravityOil');
      this.validateCustomGasFormData();
    }
  }

  toggleCustomWaterSection(event: MatSlideToggleChange) {
    this.customWaterToggle.checked = event.checked;
    this.setCustomWaterFormData(event.checked);
  }

  onUseGasPVTChange(event) {
    this.customGasVisibility = event.checked;
    this.setCustomGasFormData(event.checked);
  }

  browseFileDialog(selInputElem: HTMLInputElement) {
    selInputElem.value = null;
    selInputElem.click();
  }

  onOilVolFactorCalFileChange(fileInput: any) {
    if (fileInput.target.files.length == 0)
      return;

    this.oilVolFactorInvalidMsg = null;
    this.oilVolFactorCalFilePath = fileInput.target.files[0].name;
    let extension = this.oilVolFactorCalFilePath.split(".")[1];
    if (extension.toLowerCase() !== "cal") {
      this.resetOilFVFFileInput();
      this.oilVolFactorInvalidMsg = "Please select a valid calibration file.";
    } else {
      let file = fileInput.target.files[0];
      let reader = new FileReader();
      reader.readAsText(file, "UTF-8");
      reader.onloadend = (e) => {
        if (reader.result) {
          this.oilVolFactorFileArray = this.formatCalibrationFile(reader.result);
          const oilVolumeFactorCalFile: FlowMeterCalibrationFile = {
            UseFile: true,
            FileName: this.oilVolFactorCalFilePath,
            CalibrationData: this.oilVolFactorFileArray
          }; 
          this.surefloExPVTForm.patchValue({
            OilVolumeFactorCalibration: oilVolumeFactorCalFile
          });
          this.validateOilProducerFormData();
          this.setFormStatus();
        } else {
          this.oilVolFactorCalFilePath = "Browse...";
          this.oilVolFactorInvalidMsg = "Please select a valid calibration file.";
        }
      };
    }
  }

  onOilDensityCalFileChange(fileInput: any) {
    if (fileInput.target.files.length == 0)
      return;

    this.oilDensityInvalidMsg = null;
    this.oilDensityCalFilePath = fileInput.target.files[0].name;
    let extension = this.oilDensityCalFilePath.split(".")[1];
    if (extension.toLowerCase() !== "cal") {
      this.resetOilDensityFileInput();
      this.oilDensityInvalidMsg = "Please select a valid calibration file.";
    } else {
      let file = fileInput.target.files[0];
      let reader = new FileReader();
      reader.readAsText(file, "UTF-8");
      reader.onloadend = (e) => {
        if (reader.result) {
          this.oilDensityFileArray = this.formatCalibrationFile(reader.result);
          const oilDensityCalFile: FlowMeterCalibrationFile = {
            UseFile: true,
            FileName: this.oilDensityCalFilePath,
            CalibrationData: this.oilDensityFileArray
          }; 
          this.surefloExPVTForm.patchValue({
            OilDensityCalibration: oilDensityCalFile
          });
          this.validateOilProducerFormData();
          this.setFormStatus();
        } else {
          this.oilDensityCalFilePath = "Browse...";
          this.oilDensityInvalidMsg = "Please select a valid calibration file.";
        }
      };
    }
  }

  onOilViscosityCalFileChange(fileInput: any) {
    if (fileInput.target.files.length == 0)
      return;

    this.oilViscosityInvalidMsg = null;
    this.oilViscosityCalFilePath = fileInput.target.files[0].name;
    let extension = this.oilViscosityCalFilePath.split(".")[1];
    if (extension.toLowerCase() !== "cal") {
      this.resetOilViscosityFileInput();
      this.oilViscosityInvalidMsg = "Please select a valid calibration file.";
    } else {
      let file = fileInput.target.files[0];
      let reader = new FileReader();
      reader.readAsText(file, "UTF-8");
      reader.onloadend = (e) => {
        if (reader.result) {
          this.oilViscosityFileArray = this.formatCalibrationFile(reader.result);
          const oilViscosityCalFile: FlowMeterCalibrationFile = {
            UseFile: true,
            FileName: this.oilViscosityCalFilePath,
            CalibrationData: this.oilViscosityFileArray
          }; 
          this.surefloExPVTForm.patchValue({
            OilViscosityCalibration: oilViscosityCalFile
          });
          this.validateOilProducerFormData();
          this.setFormStatus();
        } else {
          this.oilViscosityCalFilePath = "Browse...";
          this.oilViscosityInvalidMsg = "Please select a valid calibration file.";
        }
      };

    }
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
          const waterVolFactorCalFile: FlowMeterCalibrationFile = {
            UseFile: true,
            FileName: this.waterVolFactorCalFilePath,
            CalibrationData: this.waterVolFactorFileArray
          }; 
          this.surefloExPVTForm.patchValue({
            WaterVolumeFactorCalibration: waterVolFactorCalFile
          });
          this.validateOilProducerFormData();
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
          this.surefloExPVTForm.patchValue({
            WaterDensityCalibration: waterDensityCalFile
          });
          this.validateOilProducerFormData();
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
          this.surefloExPVTForm.patchValue({
            WaterViscosityCalibration: waterViscosityCalFile
          });
          this.validateOilProducerFormData();
          this.setFormStatus();
        } else {
          this.waterViscosityCalFilePath = "Browse...";
          this.waterViscosityInvalidMsg = "Please select a valid calibration file.";
        }
      };
    }
  }

  
  onGasOilRatioCalFileChange(fileInput: any) {

    if (fileInput.target.files.length == 0)
      return;

    this.gasCalFileInvalidMsg = null;
    this.gasOilRatioCalFilePath = fileInput.target.files[0].name;
    let extension = this.gasOilRatioCalFilePath.split(".")[1];
    if (extension.toLowerCase() !== "cal") {
      this.resetCustomGasFileInput();
      this.gasCalFileInvalidMsg = "Please select a valid calibration file.";
    } else {
      let file = fileInput.target.files[0];
      let reader = new FileReader();
      reader.readAsText(file, "UTF-8");
      reader.onloadend = (e) => {
        if (reader.result) {
          this.gasOilRatioFileArray = this.formatCalibrationFile(reader.result);
          const gasOilRatioCalFile: FlowMeterCalibrationFile = {
            UseFile: true,
            FileName: this.gasOilRatioCalFilePath,
            CalibrationData: this.gasOilRatioFileArray
          };
          this.surefloExPVTForm.patchValue({
            GasOilRatioCalibration: gasOilRatioCalFile
          });
          this.validateOilProducerFormData(); 
          this.setFormStatus();
        } else {
          this.gasOilRatioCalFilePath = "Browse...";
          this.gasCalFileInvalidMsg = "Please select a valid calibration file.";
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


  validateCustomOilFormData() {
    const isCustomOilFieldValid =  this.surefloExPVTForm.value.OilVolumeFactorCalibration && 
    this.surefloExPVTForm.value.OilViscosityCalibration &&
    this.surefloExPVTForm.value.OilDensityCalibration;
    this.isFormValidEvent.emit(this.surefloExPVTForm.valid && isCustomOilFieldValid);
  }

  validateCustomWaterFormData() {
    const isCustomWaterFieldValid = this.surefloExPVTForm.value.WaterVolumeFactorCalibration && 
    this.surefloExPVTForm.value.WaterViscosityCalibration &&
    this.surefloExPVTForm.value.WaterDensityCalibration;
    this.isFormValidEvent.emit(this.surefloExPVTForm.valid && isCustomWaterFieldValid);
  }

  validateCustomGasFormData() {
    const isCustomGasFieldValid = this.surefloExPVTForm.value.GasOilRatioCalibration !== null ? true : false;
    this.isFormValidEvent.emit(this.surefloExPVTForm.valid && isCustomGasFieldValid);
  }

  // 298EX Oil Producer
  validateOilProducerFormData() {
    this.validateFormControls();
    let isOilPVTFormValid = true;
    let isWaterPVTFormValid = true;
    let isGasPVTFormValid = true;
    
    if (!this.surefloExPVTForm.value.UseCustomOilProperties) {
      isOilPVTFormValid = this.surefloExPVTForm.value.SpecificGravityOil !== null && this.surefloExPVTForm.value.SpecificGravityOil !== "" ? true : false;
    } else {
      isOilPVTFormValid = this.surefloExPVTForm.value.OilVolumeFactorCalibration !== null &&
        this.surefloExPVTForm.value.OilViscosityCalibration !== null &&
        this.surefloExPVTForm.value.OilDensityCalibration !== null;
    }

    if (!this.surefloExPVTForm.value.UseCustomWaterProperties) {
      isWaterPVTFormValid = this.surefloExPVTForm.value.SpecificGravityWater !== null && this.surefloExPVTForm.value.SpecificGravityWater !== "" ? true : false;
    } else {
      isWaterPVTFormValid = this.surefloExPVTForm.value.WaterVolumeFactorCalibration !== null &&
        this.surefloExPVTForm.value.WaterViscosityCalibration !== null &&
        this.surefloExPVTForm.value.WaterDensityCalibration !== null;
    }

    if (!this.surefloExPVTForm.value.UseCustomGasProperties) {
      isGasPVTFormValid = this.surefloExPVTForm.value.GasOilRatio !== null && this.surefloExPVTForm.value.GasOilRatio !== "" ? true : false;
    } else {
      isGasPVTFormValid = this.surefloExPVTForm.value.GasOilRatioCalibration !== null ? true : false;
    }
    const formValid = isOilPVTFormValid && isWaterPVTFormValid && isGasPVTFormValid;
    this.data.fluidPVTData = this.surefloExPVTForm.getRawValue();
    // Fix null error in API
    this.data.fluidPVTData.SpecificGravityOil = this.surefloExPVTForm.controls['SpecificGravityOil'].value ?? 0;
    this.data.fluidPVTData.SpecificGravityGas = this.surefloExPVTForm.controls['SpecificGravityGas'].value ?? 0;
    this.data.fluidPVTData.SpecificGravityWater = this.surefloExPVTForm.controls['SpecificGravityWater'].value ?? 0;
    this.data.fluidPVTData.GasOilRatio = this.surefloExPVTForm.controls['GasOilRatio'].value ?? 0;
    // End
    this.pvtFormValid = formValid;
    if(!this.surefloExPVTForm.pristine) this.data.IsDirty  = formValid;
    this.isFormValidEvent.emit(formValid);
  }

  setCustomOilFormData(useFile: boolean) {
    const oilFVFCalFile = this.surefloExPVTForm.value.OilVolumeFactorCalibration;
    const oilDensityCalFile = this.surefloExPVTForm.value.OilDensityCalibration;
    const oilViscosityCalFile = this.surefloExPVTForm.value.OilViscosityCalibration;
    if(oilFVFCalFile) { 
      oilFVFCalFile.useFile = useFile;
    }
    if(oilDensityCalFile) { 
      oilDensityCalFile.useFile = useFile;
    }
    if(oilViscosityCalFile) { 
      oilViscosityCalFile.useFile = useFile;
    }
    this.surefloExPVTForm.patchValue({ 
      OilVolumeFactorCalibration: oilFVFCalFile,
      OilViscosityCalibration: oilDensityCalFile,
      OilDensityCalibration: oilViscosityCalFile
    });
    this.oilVolFactorInvalidMsg = null;
    this.oilViscosityInvalidMsg = null;
    this.oilDensityInvalidMsg = null;
    
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
    this.waterDensityInvalidMsg= null;
  }

  setCustomGasFormData(useFile: boolean) {
    const gasOilRatioCalFile = this.surefloExPVTForm.value.GasOilRatioCalibration;
    if(gasOilRatioCalFile) {
      gasOilRatioCalFile.useFile = useFile;
    }
    this.surefloExPVTForm.patchValue({ 
      GasOilRatioCalibration: gasOilRatioCalFile
    });
    this.gasCalFileInvalidMsg = null;
  }

  resetOilFVFFileInput() {
    this.surefloExPVTForm.patchValue({ 
      OilVolumeFactorCalibration: null
    });
    this.oilVolFactorCalFilePath = "Browse...";
    this.oilVolFactorFileArray = [];
  }

  resetOilDensityFileInput() {
    this.surefloExPVTForm.patchValue({ 
      OilDensityCalibration: null
    });
    this.oilDensityCalFilePath = "Browse...";
    this.oilDensityFileArray = [];
  }

  resetOilViscosityFileInput() {
    this.surefloExPVTForm.patchValue({ 
      OilViscosityCalibration: null
    });
    this.oilViscosityCalFilePath = "Browse...";
    this.oilViscosityFileArray = [];
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

  resetCustomGasFileInput() {
    this.surefloExPVTForm.patchValue({ 
      GasOilRatioCalibration: null
    });
    this.gasOilRatioCalFilePath = 'Browse...';
    this.gasOilRatioFileArray = [];
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
    this.setFormData();
    this.validateOnInit();
  }

  setFormData() {   
    const fileInputDefTxt = "Browse...";
    const fluidPVTData = this.data?.fluidPVTData;
    if (fluidPVTData) {
      this.surefloExPVTForm.patchValue(
        {
          SpecificGravityOil: this.gwNumberPipe.transform(fluidPVTData.SpecificGravityOil),
          SpecificGravityGas:  this.gwNumberPipe.transform(fluidPVTData.SpecificGravityGas),
          SpecificGravityWater:  this.gwNumberPipe.transform(fluidPVTData.SpecificGravityWater),
          OilSurfaceViscosity:  this.gwNumberPipe.transform(fluidPVTData.OilSurfaceViscosity),
          GasOilRatio:  this.gwNumberPipe.transform(fluidPVTData.GasOilRatio),
          UseCustomOilProperties: fluidPVTData.UseCustomOilProperties,
          UseCustomGasProperties: fluidPVTData.UseCustomGasProperties,
          UseCustomWaterProperties: fluidPVTData.UseCustomWaterProperties,
          OilDensityCalibration: fluidPVTData.OilDensityCalibration,
          OilViscosityCalibration: fluidPVTData.OilViscosityCalibration,
          OilVolumeFactorCalibration: fluidPVTData.OilVolumeFactorCalibration,
          GasOilRatioCalibration: fluidPVTData.GasOilRatioCalibration,
          WaterDensityCalibration: fluidPVTData.WaterDensityCalibration,
          WaterViscosityCalibration: fluidPVTData.WaterViscosityCalibration,
          WaterVolumeFactorCalibration: fluidPVTData.WaterVolumeFactorCalibration,
          CalculateDensity: fluidPVTData.CalculateDensity,
          CalculateViscosity: fluidPVTData.CalculateViscosity,
          GasDensityCalibration: null,
          GasViscosityCalibration: null,
          GasVolumeFactorCalibration: null
        }
      );
      
      this.customOilToggle.checked = fluidPVTData.UseCustomOilProperties;
      this.customWaterToggle.checked = fluidPVTData.UseCustomWaterProperties;
      this.customGasVisibility = fluidPVTData.UseCustomGasProperties;
      this.oilVolFactorCalFilePath = fluidPVTData.OilVolumeFactorCalibration ?  fluidPVTData.OilVolumeFactorCalibration.FileName : fileInputDefTxt;
      this.oilDensityCalFilePath = fluidPVTData.OilDensityCalibration ? fluidPVTData.OilDensityCalibration.FileName : fileInputDefTxt;
      this.oilViscosityCalFilePath = fluidPVTData.OilViscosityCalibration ? fluidPVTData.OilViscosityCalibration.FileName : fileInputDefTxt;
      this.waterVolFactorCalFilePath = fluidPVTData.WaterVolumeFactorCalibration ? fluidPVTData.WaterVolumeFactorCalibration.FileName : fileInputDefTxt;
      this.waterDensityCalFilePath = fluidPVTData.WaterDensityCalibration ? fluidPVTData.WaterDensityCalibration.FileName : fileInputDefTxt;
      this.waterViscosityCalFilePath = fluidPVTData.WaterViscosityCalibration ? fluidPVTData.WaterViscosityCalibration.FileName : fileInputDefTxt;
      this.gasOilRatioCalFilePath = fluidPVTData.GasOilRatioCalibration ? fluidPVTData.GasOilRatioCalibration.FileName : fileInputDefTxt;
    } else {
      this.surefloExPVTForm.patchValue(
        {
          CalculateDensity: true,
          CalculateViscosity: true,
          UseCustomOilProperties: false,
          UseCustomGasProperties: false,
          UseCustomWaterProperties: false,
          OilDensityCalibration: null,
          OilViscosityCalibration: null,
          OilVolumeFactorCalibration: null,
          WaterDensityCalibration: null,
          WaterViscosityCalibration: null,
          WaterVolumeFactorCalibration: null,
          GasDensityCalibration: null,
          GasViscosityCalibration: null,
          GasVolumeFactorCalibration: null,
          GasOilRatioCalibration: null

        });
    }
    this.subscribeToFormDataChanges();
  }

  private subscribeToFormDataChanges() {
    this.surefloExPVTForm.valueChanges.pipe(debounceTime(200)).subscribe((val) => {
      this.validateOilProducerFormData();
      if (!this.surefloExPVTForm.pristine && this.pvtFormValid) {
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
    this.formCtrlErrorMessage = [];
    for (let [key, value] of this.mapErrMessages) {
      this.formCtrlErrorMessage[key] = value;
    }
  }

  validateFormControls(): void {
    if (this.surefloExPVTForm) {
      this.setFormControlStatus();
    }
  }

  private validateOnInit(): void {
    if (this.surefloExPVTForm && this.data?.fluidPVTData) {
      this.surefloExPVTForm.markAllAsTouched();
      this.setFormControlStatus();
    }
  }

  onCoeffInputkeyUp(event) {
    this.gasAdditionalParams.CoefficientExpansion = parseInt(event.target.value);
    this.data.additionalParameters = this.gasAdditionalParams;
  }

  onDepthInputkeyUp(event) {
    this.gasAdditionalParams.MeasuredDepth = parseInt(event.target.value);
    this.data.additionalParameters = this.gasAdditionalParams;
  }

  ngOnInit(): void {
    this.gasFluidTypeVisibility = WellFlowTypes[this.data.fluidType] === WellFlowTypes[2] ||
                             WellFlowTypes[this.data.fluidType] === WellFlowTypes[4] ? true : false;
    this.waterFluidTypeVisibility = WellFlowTypes[this.data.fluidType] === WellFlowTypes[3] ? true : false;
    this.createFormGroup();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.data.firstChange) {
      this.createFormGroup();
    }
  }

  ngOnDestroy(): void {
    this.validateOilProducerFormData();
  }

}
