import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

import { GwNumberFormatterPipe } from '@shared/gateway-pipes/pipes/gw-number-formatter.pipe';
import { RangeValidator } from '@core/customValidators/rangeValidator.validator';
import { sureflo298ModelSchema } from '@core/models/schemaModels/SureFLOFlowMeter298.schema';
import { SureFLO298CalibrationModel } from '@core/models/UIModels/sureflo-flowmeter-model';
import { FlowMeterCalFileTypes } from '@core/models/UIModels/sureflo.model';
import { FlowMeterCalibrationFile } from '@core/models/webModels/SureFLODataModel.model';
import { ValidationService } from '@core/services/validation.service';
import { SureFLO298Constants } from '../../sureflo298.constants';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'sureflo-water-pvt-data',
  templateUrl: './sureflo-water-pvt-data.component.html',
  styleUrls: ['./sureflo-water-pvt-data.component.scss']
})
export class SurefloWaterPvtDataComponent implements OnInit, OnChanges, OnDestroy {

  @Input() data: SureFLO298CalibrationModel;
  @Output() isFormValidEvent = new EventEmitter();

  pvtFormValid = true;
  useCustomWaterFVF = false;
  useCustomWaterDensity = false;
  useCustomWaterViscosity = false;
  waterVolFactorCalFilePath = null;
  waterDensityCalFilePath = null;
  waterViscosityCalFilePath = null;
  waterVolFactorInvalidMsg = null;
  waterViscosityInvalidMsg = null;
  waterDensityInvalidMsg= null;
  waterVolFactorFileArray:string[] = new Array();
  waterViscosityFileArray:string[] = new Array();
  waterDensityFileArray :string[] = new Array();

  checkbox = {
    color: 'primary',
    checked: false,
    disabled: false
  }

  customWaterToggle = {
    color: 'primary',
    checked: false,
    disabled: false
  }

  // Validation messages
  formCtrlErrorMessage: any;
  private mapErrMessages: Map<string, string> = new Map<string, string>();

  surefloWaterPVTForm: FormGroup;

  constructor(private gwNumberPipe: GwNumberFormatterPipe, private validationService: ValidationService) { }

  toggleCustomWaterSection(event: MatSlideToggleChange) {
    this.customWaterToggle.checked = event.checked;
    this.setCustomWaterFormData(event.checked);
  }
  
  onUseWaterFVFChange(event) {
    this.useCustomWaterFVF = event.checked;
    this.setUseCalFileStatus(FlowMeterCalFileTypes.WaterFVF, event.checked);
    this.waterVolFactorInvalidMsg = null;
    if(event.checked) {
      this.surefloWaterPVTForm.controls['WaterFVF'].setErrors(null);
      this.mapErrMessages.delete('WaterFVF');
      // this.validateFormControls();
    }
  }

  onUseWaterDensityChange(event) {
    this.useCustomWaterDensity = event.checked;
    this.setUseCalFileStatus(FlowMeterCalFileTypes.WaterDensity, event.checked);
    this.waterDensityInvalidMsg = null;
    if(event.checked) {
      this.surefloWaterPVTForm.controls['WaterDensity'].setErrors(null);
      this.mapErrMessages.delete('WaterDensity');
      this.validateFormControls();
    }
  }

  onUseWaterViscosityChange(event) {
    this.useCustomWaterViscosity = event.checked;
    this.setUseCalFileStatus(FlowMeterCalFileTypes.WaterViscosity, event.checked);
    this.waterViscosityInvalidMsg = null;
    if(event.checked) {
      this.surefloWaterPVTForm.controls['WaterViscosity'].setErrors(null);
      this.mapErrMessages.delete('WaterViscosity');
      this.validateFormControls();
    }
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
          const waterVolFactorCalFile: FlowMeterCalibrationFile = {
            UseFile: true,
            FileName: this.waterVolFactorCalFilePath,
            CalibrationData: this.waterVolFactorFileArray
          }; 
          this.surefloWaterPVTForm.patchValue({
            WaterVolumeFactorCalibration: waterVolFactorCalFile
          });
          this.validatePVTFormData();
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
          this.surefloWaterPVTForm.patchValue({
            WaterDensityCalibration: waterDensityCalFile
          });
          this.validatePVTFormData();
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
          this.surefloWaterPVTForm.patchValue({
            WaterViscosityCalibration: waterViscosityCalFile
          });
          this.validatePVTFormData();
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

   // Set Calibration File Status
   setUseCalFileStatus(calfileType:number , useFile: boolean) {
    switch (calfileType) {
     
      case FlowMeterCalFileTypes.WaterFVF:
        const waterFVFCalFile = this.surefloWaterPVTForm.value.WaterVolumeFactorCalibration
        if(waterFVFCalFile) {
          waterFVFCalFile.UseFile = useFile;
        }
        this.surefloWaterPVTForm.patchValue({
          WaterVolumeFactorCalibration: waterFVFCalFile
        });
        break;
      case FlowMeterCalFileTypes.WaterDensity:
        const waterDensityCalFile = this.surefloWaterPVTForm.value.WaterDensityCalibration;
        if(waterDensityCalFile) { 
          waterDensityCalFile.UseFile = useFile;
        }
        this.surefloWaterPVTForm.patchValue({
          WaterDensityCalibration: waterDensityCalFile
        });
        break;
      case FlowMeterCalFileTypes.WaterViscosity:
        const waterViscosityCalFile = this.surefloWaterPVTForm.value.WaterViscosityCalibration;
        if(waterViscosityCalFile) { 
          waterViscosityCalFile.UseFile = useFile;
        }
        this.surefloWaterPVTForm.patchValue({
          WaterViscosityCalibration: waterViscosityCalFile
        });
        break;
    }
    this.validatePVTFormData();
    this.setFormStatus();
    
  }

  resetWaterFVFFileInput() {
    this.surefloWaterPVTForm.patchValue({ 
      WaterVolumeFactorCalibration: null
    });
    this.waterVolFactorCalFilePath = "Browse...";
    this.waterVolFactorFileArray = [];
  }

  resetWaterDensityFileInput() {
    this.surefloWaterPVTForm.patchValue({ 
      WaterDensityCalibration: null
    });
    this.waterDensityCalFilePath = "Browse...";
    this.waterDensityFileArray = [];
  }

  resetWaterViscosityFileInput() {
    this.surefloWaterPVTForm.patchValue({ 
      WaterViscosityCalibration: null
    });
    this.waterViscosityCalFilePath = "Browse...";
    this.waterViscosityFileArray = [];
  }

  setCustomWaterFormData(UseCustomWaterProperties: boolean) {
    
    this.useCustomWaterFVF = this.surefloWaterPVTForm.value.WaterVolumeFactorCalibration ? this.surefloWaterPVTForm.value.WaterVolumeFactorCalibration.UseFile : false;
    this.useCustomWaterDensity = this.surefloWaterPVTForm.value.WaterDensityCalibration ? this.surefloWaterPVTForm.value.WaterDensityCalibration.UseFile : false;
    this.useCustomWaterViscosity = this.surefloWaterPVTForm.value.WaterViscosityCalibration ? this.surefloWaterPVTForm.value.WaterViscosityCalibration.UseFile : false;
    this.waterVolFactorFileArray = [];
    this.waterDensityFileArray = [];
    this.waterViscosityFileArray = [];
  }

  private subscribeToFormDataChanges() {
    this.surefloWaterPVTForm.valueChanges.pipe(debounceTime(200)).subscribe((val) => {
      this.validatePVTFormData();
      if (!this.surefloWaterPVTForm.pristine && this.pvtFormValid) {
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
    Object.keys(this.surefloWaterPVTForm.controls).forEach(key => {
      this.getCtrlErrorMsg(key, this.surefloWaterPVTForm.controls[key]);
    });
    this.formCtrlErrorMessage = [];
    for (let [key, value] of this.mapErrMessages) {
      this.formCtrlErrorMessage[key] = value;
    }
  }

  validateFormControls(): void {
    if (this.surefloWaterPVTForm) {
      this.setFormControlStatus();
    }
  }

  private validateOnInit(): void {
    if (this.surefloWaterPVTForm && this.data?.fluidPVTData) {
      if (this.data.fluidPVTData.UseCustomWaterProperties) {
        this.surefloWaterPVTForm.markAllAsTouched();
      } else {
        this.surefloWaterPVTForm.controls['WaterSpecificGravity'].markAllAsTouched();
      }
      this.setFormControlStatus();
    }
  }

  validatePVTFormData() {
    this.validateFormControls();
    let isWaterPVTFormValid = true;
    if (!this.surefloWaterPVTForm.value.UseCustomWaterProperties) {
      isWaterPVTFormValid = isWaterPVTFormValid && this.surefloWaterPVTForm.value.WaterSpecificGravity !== null ? true : false;
    } else {
      if (!this.useCustomWaterFVF) {
        isWaterPVTFormValid = isWaterPVTFormValid && this.surefloWaterPVTForm.value.WaterFVF !== null;
      } else {
        isWaterPVTFormValid = isWaterPVTFormValid && this.surefloWaterPVTForm.value.WaterVolumeFactorCalibration !== null;
      }
      if (!this.useCustomWaterDensity) {
        isWaterPVTFormValid = isWaterPVTFormValid && this.surefloWaterPVTForm.value.WaterDensity !== null;
      } else {
        isWaterPVTFormValid = isWaterPVTFormValid && this.surefloWaterPVTForm.value.WaterDensityCalibration !== null;
      }
      if (!this.useCustomWaterViscosity) {
        isWaterPVTFormValid = isWaterPVTFormValid && this.surefloWaterPVTForm.value.WaterViscosity !== null;
      } else {
        isWaterPVTFormValid = isWaterPVTFormValid && this.surefloWaterPVTForm.value.WaterViscosityCalibration !== null;
      }
    }
    this.data.fluidPVTData = this.surefloWaterPVTForm.getRawValue();
    if(isWaterPVTFormValid) {
      this.data.fluidPVTData.WaterFVF =  this.data.fluidPVTData.WaterFVF ?? 0;
      this.data.fluidPVTData.WaterDensity =  this.data.fluidPVTData.WaterDensity ?? 0;
      this.data.fluidPVTData.WaterViscosity =  this.data.fluidPVTData.WaterViscosity ?? 0;
      this.data.fluidPVTData.WaterSpecificGravity = this.data.fluidPVTData.WaterSpecificGravity ?? 0;
    }
    this.pvtFormValid = this.surefloWaterPVTForm.valid && isWaterPVTFormValid;
    if(!this.surefloWaterPVTForm.pristine) this.data.IsDirty = this.surefloWaterPVTForm.valid && isWaterPVTFormValid;
    this.isFormValidEvent.emit(isWaterPVTFormValid);
  }

  setFormData() {   
    const fileInputDefTxt = "Browse...";
    const fluidPVTData = this.data?.fluidPVTData;
    if (fluidPVTData) {
      this.surefloWaterPVTForm.patchValue(
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
      this.customWaterToggle.checked = fluidPVTData.UseCustomWaterProperties;
      this.useCustomWaterFVF = fluidPVTData.WaterVolumeFactorCalibration ? fluidPVTData.WaterVolumeFactorCalibration.UseFile : false;
      this.useCustomWaterDensity = fluidPVTData.WaterDensityCalibration ? fluidPVTData.WaterDensityCalibration.UseFile : false;
      this.useCustomWaterViscosity = fluidPVTData.WaterViscosityCalibration ? fluidPVTData.WaterViscosityCalibration.UseFile : false;
      this.waterVolFactorCalFilePath = fluidPVTData.WaterVolumeFactorCalibration ? fluidPVTData.WaterVolumeFactorCalibration.FileName : fileInputDefTxt;
      this.waterDensityCalFilePath = fluidPVTData.WaterDensityCalibration ? fluidPVTData.WaterDensityCalibration.FileName : fileInputDefTxt;
      this.waterViscosityCalFilePath = fluidPVTData.WaterViscosityCalibration ? fluidPVTData.WaterViscosityCalibration.FileName : fileInputDefTxt;
    } else {
      this.surefloWaterPVTForm.patchValue({
        OilFVF: 0,
        OilDensity: 0,
        OilViscosity: 0,
        WaterFVF: null,
        WaterDensity: null,
        WaterViscosity: null,
        SolutionGOR: 0,
        UseCustomWaterProperties: false,
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

  createFormGroup() {
    this.surefloWaterPVTForm = new FormGroup({});

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
        this.surefloWaterPVTForm.addControl(property, formControl);
        formControl.setValidators(validationFn);
      }
    }

    this.setFormData();
    this.validateOnInit();
  }

  setFormStatus() {
    this.data.IsDirty = this.pvtFormValid;
    this.isFormValidEvent.emit(this.pvtFormValid);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.data.firstChange) {
      this.createFormGroup();
    }
  }

  ngOnInit(): void {
    this.createFormGroup();
  }

  ngOnDestroy(): void {
    this.validatePVTFormData();
  }

}
