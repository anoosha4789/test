import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

import { GwNumberFormatterPipe } from '@shared/gateway-pipes/pipes/gw-number-formatter.pipe';
import { RangeValidator } from '@core/customValidators/rangeValidator.validator';
import { sureflo298ModelSchema } from '@core/models/schemaModels/SureFLOFlowMeter298.schema';
import { SureFLO298CalibrationModel } from '@core/models/UIModels/sureflo-flowmeter-model';
import { FlowMeterCalFileTypes } from '@core/models/UIModels/sureflo.model';
import { FlowMeterCalibrationFile, WellFlowTypes } from '@core/models/webModels/SureFLODataModel.model';
import { ValidationService } from '@core/services/validation.service';
import { SureFLO298Constants } from '../../sureflo298.constants';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'sureflo-pvt-data',
  templateUrl: './sureflo-pvt-data.component.html',
  styleUrls: ['./sureflo-pvt-data.component.scss']
})
export class SurefloPvtDataComponent implements OnInit, OnChanges, OnDestroy {

  @Input() data: SureFLO298CalibrationModel;
  @Output() isFormValidEvent = new EventEmitter();
  
  pvtFormValid = true;
  customGasVisibility = false;
  gasFluidTypeVisibility = false;
  waterFluidTypeVisibility = false;
  useCustomOilFVF = false;
  useCustomOilDensity = false;
  useCustomOilViscosity = false;
  useCustomWaterFVF = false;
  useCustomWaterDensity = false;
  useCustomWaterViscosity = false;
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

  checkbox = {
    color: 'primary',
    checked: false,
    disabled: false
  }

  // Validation messages
  formCtrlErrorMessage: any;
  private mapErrMessages: Map<string, string> = new Map<string, string>();
  surefloPVTForm: FormGroup;

  constructor(private gwNumberPipe: GwNumberFormatterPipe, private validationService: ValidationService) { }

  onInletPressureInputClick() {

  }

  onUseOilFVFChange(event) {
    this.useCustomOilFVF = event.checked;
    this.setUseCalFileStatus(FlowMeterCalFileTypes.OilFVF, event.checked);
    this.oilVolFactorInvalidMsg = null;
    if(event.checked) {
      this.surefloPVTForm.controls['OilFVF'].setErrors(null);
      this.mapErrMessages.delete('OilFVF');
      this.validateFormControls();
    }
  }

  onUseOilDensityChange(event) {
    this.useCustomOilDensity = event.checked;
    this.setUseCalFileStatus(FlowMeterCalFileTypes.OilDensity, event.checked);
    this.oilDensityInvalidMsg = null;
    if(event.checked) {
      this.surefloPVTForm.controls['OilDensity'].setErrors(null);
      this.mapErrMessages.delete('OilDensity');
      this.validateFormControls();
    }
  }

  onUseOilViscosityChange(event) {
    this.useCustomOilViscosity = event.checked;
    this.setUseCalFileStatus(FlowMeterCalFileTypes.OilViscosity, event.checked);
    this.oilViscosityInvalidMsg = null;
    if(event.checked) {
      this.surefloPVTForm.controls['OilViscosity'].setErrors(null);
      this.mapErrMessages.delete('OilViscosity');
      this.validateFormControls();
    }
  }

  onUseWaterFVFChange(event) {
    this.useCustomWaterFVF = event.checked;
    this.setUseCalFileStatus(FlowMeterCalFileTypes.WaterFVF, event.checked);
    this.waterVolFactorInvalidMsg = null;
    if(event.checked) {
      this.surefloPVTForm.controls['WaterFVF'].setErrors(null);
      this.mapErrMessages.delete('WaterFVF');
      this.validateFormControls();
    }
  }

  onUseWaterDensityChange(event) {
    this.useCustomWaterDensity = event.checked;
    this.setUseCalFileStatus(FlowMeterCalFileTypes.WaterDensity, event.checked);
    this.waterDensityInvalidMsg = null;
    if(event.checked) {
      this.surefloPVTForm.controls['WaterDensity'].setErrors(null);
      this.mapErrMessages.delete('WaterDensity');
      this.validateFormControls();
    }
  }

  onUseWaterViscosityChange(event) {
    this.useCustomWaterViscosity = event.checked;
    this.setUseCalFileStatus(FlowMeterCalFileTypes.WaterViscosity, event.checked);
    this.waterViscosityInvalidMsg = null;
    if(event.checked) {
      this.surefloPVTForm.controls['WaterViscosity'].setErrors(null);
      this.mapErrMessages.delete('WaterViscosity');
      this.validateFormControls();
    }
  }

  onUseGasPVTChange(event) {
    this.customGasVisibility = event.checked;
    this.setUseCalFileStatus(FlowMeterCalFileTypes.GasOilRatio, event.checked);
    this.gasCalFileInvalidMsg = null;
    if(event.checked) {
      this.surefloPVTForm.controls['SolutionGOR'].setErrors(null);
      this.mapErrMessages.delete('SolutionGOR');
      this.validateFormControls();
    }
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
      this.oilVolFactorInvalidMsg = "Please select a valid calibration file.";
      this.resetOilFVFFileInput();
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
          this.surefloPVTForm.patchValue({
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
          this.surefloPVTForm.patchValue({
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
          this.surefloPVTForm.patchValue({
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
          this.surefloPVTForm.patchValue({
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
          this.surefloPVTForm.patchValue({
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
          this.surefloPVTForm.patchValue({
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
          this.surefloPVTForm.patchValue({
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

  // 298 Oil Producer
  validateOilProducerFormData() {
    this.validateFormControls();
    let isOilPVTFormValid = true;
    let isWaterPVTFormValid = true;
    let isGasPVTFormValid = true;
    
    // Custom Oil Properties
    if (!this.useCustomOilFVF) {
      isOilPVTFormValid = isOilPVTFormValid && this.surefloPVTForm.value.OilFVF !== null;
    } else {
      isOilPVTFormValid = isOilPVTFormValid && this.surefloPVTForm.value.OilVolumeFactorCalibration !== null;
    }
    if (!this.useCustomOilDensity) {
      isOilPVTFormValid = isOilPVTFormValid && this.surefloPVTForm.value.OilDensity !== null;
    } else {
      isOilPVTFormValid = isOilPVTFormValid && this.surefloPVTForm.value.OilDensityCalibration !== null;
    }
    if (!this.useCustomOilViscosity) {
      isOilPVTFormValid = isOilPVTFormValid && this.surefloPVTForm.value.OilViscosity !== null;
    } else {
      isOilPVTFormValid = isOilPVTFormValid && this.surefloPVTForm.value.OilViscosityCalibration !== null;
    }

    // Custom Water Properties
    if (!this.useCustomWaterFVF) {
      isWaterPVTFormValid = isWaterPVTFormValid && this.surefloPVTForm.value.WaterFVF !== null;
    } else {
      isWaterPVTFormValid = isWaterPVTFormValid && this.surefloPVTForm.value.WaterVolumeFactorCalibration !== null;
    }
    if (!this.useCustomWaterDensity) {
      isWaterPVTFormValid = isWaterPVTFormValid && this.surefloPVTForm.value.WaterDensity !== null;
    } else {
      isWaterPVTFormValid = isWaterPVTFormValid && this.surefloPVTForm.value.WaterDensityCalibration !== null;
    }
    if (!this.useCustomWaterViscosity) {
      isWaterPVTFormValid = isWaterPVTFormValid && this.surefloPVTForm.value.WaterViscosity !== null;
    } else {
      isWaterPVTFormValid = isWaterPVTFormValid && this.surefloPVTForm.value.WaterViscosityCalibration !== null;
    }

    // Custom Gas Properties
    if (!this.customGasVisibility) {
      isGasPVTFormValid = this.surefloPVTForm.value.SolutionGOR !== null ? true : false;
    } else {
      isGasPVTFormValid = this.surefloPVTForm.value.GasOilRatioCalibration !== null ? true : false;
    }
    const formValid = isOilPVTFormValid && isWaterPVTFormValid && isGasPVTFormValid;
    this.data.fluidPVTData = this.surefloPVTForm.getRawValue();
    if(isOilPVTFormValid) {
      this.data.fluidPVTData.OilFVF =  this.surefloPVTForm.controls['OilFVF'].value ?? 0;
      this.data.fluidPVTData.OilDensity =  this.surefloPVTForm.controls['OilDensity'].value ?? 0;
      this.data.fluidPVTData.OilViscosity =  this.surefloPVTForm.controls['OilViscosity'].value ?? 0;
    }
    if(isWaterPVTFormValid) {
      this.data.fluidPVTData.WaterFVF =  this.surefloPVTForm.controls['WaterFVF'].value ?? 0;
      this.data.fluidPVTData.WaterDensity =  this.surefloPVTForm.controls['WaterDensity'].value ?? 0;
      this.data.fluidPVTData.WaterViscosity =  this.surefloPVTForm.controls['WaterViscosity'].value ?? 0;
    }
    if(isGasPVTFormValid) {
      this.data.fluidPVTData.SolutionGOR =  this.surefloPVTForm.controls['SolutionGOR'].value ?? 0;
    }
    this.pvtFormValid = formValid;
    if(!this.surefloPVTForm.pristine) this.data.IsDirty = formValid;
    this.isFormValidEvent.emit(formValid);
  }

  // Set Calibration File Status
  setUseCalFileStatus(calfileType:number , useFile: boolean) {
    switch (calfileType) {
      case FlowMeterCalFileTypes.OilFVF:
        const oilFVFCalFile = this.surefloPVTForm.value.OilVolumeFactorCalibration;
        if(oilFVFCalFile) { 
          oilFVFCalFile.UseFile = useFile;
        }
        this.surefloPVTForm.patchValue({
          OilVolumeFactorCalibration: oilFVFCalFile
        });
        break;
      case FlowMeterCalFileTypes.OilDensity:
        const oilDensityCalFile = this.surefloPVTForm.value.OilDensityCalibration;
        if(oilDensityCalFile) {
          oilDensityCalFile.UseFile = useFile;
        }
        this.surefloPVTForm.patchValue({
          OilDensityCalibration: oilDensityCalFile
        });
        break;
      case FlowMeterCalFileTypes.OilViscosity:
        const oilViscosityCalFile = this.surefloPVTForm.value.OilViscosityCalibration;
        if(oilViscosityCalFile) { 
          oilViscosityCalFile.UseFile = useFile;
        }
        this.surefloPVTForm.patchValue({
          OilViscosityCalibration: oilViscosityCalFile
        });
        break;
      case FlowMeterCalFileTypes.WaterFVF:
        const waterFVFCalFile = this.surefloPVTForm.value.WaterVolumeFactorCalibration
        if(waterFVFCalFile) { 
          waterFVFCalFile.UseFile = useFile;
        }
        this.surefloPVTForm.patchValue({
          WaterVolumeFactorCalibration: waterFVFCalFile
        });
        break;
      case FlowMeterCalFileTypes.WaterDensity:
        const waterDensityCalFile = this.surefloPVTForm.value.WaterDensityCalibration;
        if(waterDensityCalFile) { 
          waterDensityCalFile.UseFile = useFile;
        }
        this.surefloPVTForm.patchValue({
          WaterDensityCalibration: waterDensityCalFile
        });
        break;
      case FlowMeterCalFileTypes.WaterViscosity:
        const waterViscosityCalFile = this.surefloPVTForm.value.WaterViscosityCalibration;
        if(waterViscosityCalFile) {  
          waterViscosityCalFile.UseFile = useFile;
        }
        this.surefloPVTForm.patchValue({
          WaterViscosityCalibration: waterViscosityCalFile
        });
        break;
      case FlowMeterCalFileTypes.GasOilRatio:
        const gasOilRatioCalFile = this.surefloPVTForm.value.GasOilRatioCalibration;
        if(gasOilRatioCalFile) {
          gasOilRatioCalFile.UseFile = useFile;
        }
        this.surefloPVTForm.patchValue({
          GasOilRatioCalibration: gasOilRatioCalFile
        });
        break;
    }

    this.validateOilProducerFormData();
    this.setFormStatus();
    
  }

  resetOilFVFFileInput() {
    this.surefloPVTForm.patchValue({ 
      OilVolumeFactorCalibration: null
    });
    this.oilVolFactorCalFilePath = "Browse...";
    this.oilVolFactorFileArray = [];
  }

  resetOilDensityFileInput() {
    this.surefloPVTForm.patchValue({ 
      OilDensityCalibration: null
    });
    this.oilDensityCalFilePath = "Browse...";
    this.oilDensityFileArray = [];
  }

  resetOilViscosityFileInput() {
    this.surefloPVTForm.patchValue({ 
      OilViscosityCalibration: null
    });
    this.oilViscosityCalFilePath = "Browse...";
    this.oilViscosityFileArray = [];
  }

  resetWaterFVFFileInput() {
    this.surefloPVTForm.patchValue({ 
      WaterVolumeFactorCalibration: null
    });
    this.waterVolFactorCalFilePath = "Browse...";
    this.waterVolFactorFileArray = [];
  }

  resetWaterDensityFileInput() {
    this.surefloPVTForm.patchValue({ 
      WaterDensityCalibration: null
    });
    this.waterDensityCalFilePath = "Browse...";
    this.waterDensityFileArray = [];
  }

  resetWaterViscosityFileInput() {
    this.surefloPVTForm.patchValue({ 
      WaterViscosityCalibration: null
    });
    this.waterViscosityCalFilePath = "Browse...";
    this.waterViscosityFileArray = [];
  }

  resetCustomGasFileInput() {
    this.surefloPVTForm.patchValue({ 
      GasOilRatioCalibration: null
    });
    this.gasOilRatioCalFilePath = 'Browse...';
    this.gasOilRatioFileArray = [];
  }

  createFormGroup() {
    this.surefloPVTForm = new FormGroup({});
    for (const property in sureflo298ModelSchema.definitions.FluidPVTData.properties) {
      if (sureflo298ModelSchema.definitions.FluidPVTData.properties.hasOwnProperty(property)) {
        const formControl = new FormControl('');
        const validationFn: ValidatorFn[] = [];
        const prop = sureflo298ModelSchema.definitions.FluidPVTData.properties[property];
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

        if (sureflo298ModelSchema.definitions.FluidPVTData.required.includes(property)) {
          validationFn.push(Validators.required);
        }
        this.surefloPVTForm.addControl(property, formControl);
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
      this.surefloPVTForm.patchValue(
        {
          OilFVF: this.gwNumberPipe.transform(fluidPVTData.OilFVF),
          OilDensity: this.gwNumberPipe.transform(fluidPVTData.OilDensity),
          OilViscosity: this.gwNumberPipe.transform(fluidPVTData.OilViscosity),
          WaterFVF: this.gwNumberPipe.transform(fluidPVTData.WaterFVF),
          WaterDensity: this.gwNumberPipe.transform(fluidPVTData.WaterDensity),
          WaterViscosity: this.gwNumberPipe.transform(fluidPVTData.WaterViscosity),
          SolutionGOR: this.gwNumberPipe.transform(fluidPVTData.SolutionGOR),
          UseCustomWaterProperties: fluidPVTData.UseCustomWaterProperties,
          WaterSpecificGravity: this.gwNumberPipe.transform(fluidPVTData.WaterSpecificGravity),
          OilDensityCalibration: fluidPVTData.OilDensityCalibration,
          OilViscosityCalibration: fluidPVTData.OilViscosityCalibration,
          OilVolumeFactorCalibration: fluidPVTData.OilVolumeFactorCalibration,
          GasOilRatioCalibration: fluidPVTData.GasOilRatioCalibration,
          WaterDensityCalibration: fluidPVTData.WaterDensityCalibration,
          WaterViscosityCalibration: fluidPVTData.WaterViscosityCalibration,
          WaterVolumeFactorCalibration: fluidPVTData.WaterVolumeFactorCalibration
        }
      );
      this.useCustomOilFVF = fluidPVTData.OilVolumeFactorCalibration ? fluidPVTData.OilVolumeFactorCalibration.UseFile : false;
      this.useCustomOilDensity = fluidPVTData.OilDensityCalibration ? fluidPVTData.OilDensityCalibration.UseFile : false;
      this.useCustomOilViscosity = fluidPVTData.OilViscosityCalibration ? fluidPVTData.OilViscosityCalibration.UseFile : false;
      this.useCustomWaterFVF = fluidPVTData.WaterVolumeFactorCalibration ? fluidPVTData.WaterVolumeFactorCalibration.UseFile : false;
      this.useCustomWaterDensity = fluidPVTData.WaterDensityCalibration ? fluidPVTData.WaterDensityCalibration.UseFile : false;
      this.useCustomWaterViscosity = fluidPVTData.WaterViscosityCalibration ? fluidPVTData.WaterViscosityCalibration.UseFile : false;
      this.customGasVisibility = fluidPVTData.GasOilRatioCalibration ? fluidPVTData.GasOilRatioCalibration.UseFile : false;
      this.oilVolFactorCalFilePath = fluidPVTData.OilVolumeFactorCalibration ?  fluidPVTData.OilVolumeFactorCalibration.FileName : fileInputDefTxt;
      this.oilDensityCalFilePath = fluidPVTData.OilDensityCalibration ? fluidPVTData.OilDensityCalibration.FileName : fileInputDefTxt;
      this.oilViscosityCalFilePath = fluidPVTData.OilViscosityCalibration ? fluidPVTData.OilViscosityCalibration.FileName : fileInputDefTxt;
      this.waterVolFactorCalFilePath = fluidPVTData.WaterVolumeFactorCalibration ? fluidPVTData.WaterVolumeFactorCalibration.FileName : fileInputDefTxt;
      this.waterDensityCalFilePath = fluidPVTData.WaterDensityCalibration ? fluidPVTData.WaterDensityCalibration.FileName : fileInputDefTxt;
      this.waterViscosityCalFilePath = fluidPVTData.WaterViscosityCalibration ? fluidPVTData.WaterViscosityCalibration.FileName : fileInputDefTxt;
      this.gasOilRatioCalFilePath = fluidPVTData.GasOilRatioCalibration ? fluidPVTData.GasOilRatioCalibration.FileName : fileInputDefTxt;
    } else {
      this.surefloPVTForm.patchValue({
        UseCustomWaterProperties: false,
        WaterSpecificGravity: 0,
        OilDensityCalibration: null,
        OilViscosityCalibration: null,
        OilVolumeFactorCalibration: null,
        WaterDensityCalibration: null,
        WaterViscosityCalibration: null,
        WaterVolumeFactorCalibration: null,
        GasOilRatioCalibration: null
      });
    }
    this.subscribeToFormDataChanges();
  }

  setFormStatus() {
    this.data.IsDirty = this.pvtFormValid;
    this.isFormValidEvent.emit(this.pvtFormValid);
  }

  private subscribeToFormDataChanges() {
    this.surefloPVTForm.valueChanges.pipe(debounceTime(200)).subscribe((val) => {
      this.validateOilProducerFormData();
      if (!this.surefloPVTForm.pristine && this.pvtFormValid) {
        this.data.IsDirty = true;
      }
    });
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
    Object.keys(this.surefloPVTForm.controls).forEach(key => {
      this.getCtrlErrorMsg(key, this.surefloPVTForm.controls[key]);
    });
    this.formCtrlErrorMessage = [];
    for (let [key, value] of this.mapErrMessages) {
      this.formCtrlErrorMessage[key] = value;
    }
  }

  validateFormControls(): void {
    if (this.surefloPVTForm) {
      this.setFormControlStatus();
    }
  }

  private validateOnInit(): void {
    if (this.surefloPVTForm && this.data?.fluidPVTData) {
      this.surefloPVTForm.markAllAsTouched();
      this.setFormControlStatus();
    }
  }

  ngOnInit(): void {
    const fluidTypeId = parseInt(this.data.fluidType);
    this.gasFluidTypeVisibility =  fluidTypeId === WellFlowTypes.GasProducer || fluidTypeId === WellFlowTypes.GasInjector ? true : false;
    this.waterFluidTypeVisibility = fluidTypeId === WellFlowTypes.WaterInjector ? true : false;
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


