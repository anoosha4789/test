import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import * as _ from 'lodash';

import { Store } from '@ngrx/store';
import { DataSourceFacade } from '@core/facade/dataSourceFacade.service';
import { DeviceDataPointsFacade } from '@core/facade/deviceDataPointsFacade.service';
import { PointTemplatesFacade } from '@core/facade/pointTemplatesFacade.service';
import { WellFacade } from '@core/facade/wellFacade.service';
import { GatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { PanelTypeList, SureSENSDataPointIndex, UICommon } from '@core/data/UICommon';
import { ButtonActions } from '@shared/gateway-dialogs/components/gateway-advanced-dialog/gateway-advanced-dialog.component';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { SurefloDatapointDialogComponent, SurefloDatapointDialogData, SurefloDataPointListNode } from '../sureflo-datapoint-dialog/sureflo-datapoint-dialog.component';
import { ToolConnectionUIModel } from '@core/models/UIModels/tool-connection.model';
import { DataPointDefinitionModel } from '@core/models/webModels/DataPointDefinition.model';
import { SurefloService } from '@core/services/sureflo.service';
import { PanelConfigurationFacade } from '@core/facade/panelConfigFacade.service';
import { UtilityService } from '@core/services/utility.service';
import { AdditionalParameters, FlowMeterDimensions, FluidPVTData, WellFlowTypes } from '@core/models/webModels/SureFLODataModel.model';
import { SureFLO298CalibrationModel, SureFLO298UIFlowMeterUIModel } from '@core/models/UIModels/sureflo-flowmeter-model';
import { SurefloCalibrationDialogComponent, SurefloCalibrationDialogData } from '@shared/sureflo-flowmeter/components/sureflo-calibration-dialog/sureflo-calibration-dialog.component';
import { SurefloFacade } from '@core/facade/surefloFacade.service';
import { sureflo298ModelSchema } from '@core/models/schemaModels/SureFLOFlowMeter298.schema';
import { Validator } from 'jsonschema';

@Component({
  selector: 'sureflo-stepper-gauge-data',
  templateUrl: './sureflo-stepper-gauge-data.component.html',
  styleUrls: ['./sureflo-stepper-gauge-data.component.scss']
})
export class SurefloStepperGaugeDataComponent extends GatewayPanelBase implements OnInit, OnDestroy {

  @Input() data: SureFLO298UIFlowMeterUIModel;
  @Output() onFlowMeterDataChange: EventEmitter<any> = new EventEmitter();

  remoteGaugeSecVisibility = false;
  calFileEditBtnVisibility = false;
  isFormDataChangeValid = false;
  fluidTypeGasVisibility = false;
  fluidTypeWaterVisibility = false;
  isConfigSaved = false;
  surefloPTForm: FormGroup;
  fileExtension: string = "";
  defInputTxt: string = "Browse...";
  inletPressureFilePath: string = "Browse...";
  throatPressureFilePath: string = "Browse...";
  remotePressureFilePath: string = "Browse...";
  temperatureFilePath: string = "Browse...";
  calibrationFilePath: string = "Browse...";

  calibrationErrorMsg: string;

  surefloDatapointDialogComponent: SurefloDatapointDialogComponent;
  surefloDatapointDialogData = new SurefloDatapointDialogData();

  surefloCalibrationDialogComponent: SurefloCalibrationDialogComponent;
  surefloCalibrationDialogData = new SurefloCalibrationDialogData();


  toggleConfig = {
    color: 'primary',
    checked: false,
    disabled: false
  }

  toolsList: ToolConnectionUIModel[];
  dataPoints: DataPointDefinitionModel[];
  dataList: SurefloDataPointListNode[] = [];

  constructor(protected store: Store,
    private panelConfigFacade: PanelConfigurationFacade,
    private wellDataFacade: WellFacade,
    private dataSourceFacade: DataSourceFacade,
    private dataPointsFacade: DeviceDataPointsFacade,
    private pointTemplatesDataFacade: PointTemplatesFacade,
    private surefloDataFacade: SurefloFacade,
    private gwModalService: GatewayModalService,
    private surefloService: SurefloService,
    private utilityService: UtilityService) {
    super(store, panelConfigFacade, wellDataFacade, dataSourceFacade, null, dataPointsFacade, pointTemplatesDataFacade, surefloDataFacade);
  }

  browseFileDialog(selInputElem: HTMLInputElement) {
    selInputElem.value = null;
    selInputElem.click();
  }

  onInletPressureInputClick() {
    const title = "Inlet Pressure";
    this.openModal(title, SureSENSDataPointIndex.Pressure, 'InletPressureSource');
  }

  onThroatPressureInputClick() {
    const title = "Throat Pressure";
    this.openModal(title, SureSENSDataPointIndex.Pressure, 'ThroatPressureSource');
  }


  onTemperatureInputClick() {
    const title = "Reservior Temperature";
    this.openModal(title, SureSENSDataPointIndex.Temperature, 'TemperatureSource');
  }

  onRemotePressureInputClick() {
    const title = "Remote Pressure";
    this.openModal(title, SureSENSDataPointIndex.Pressure, 'RemotePressureSource');
  }

  openModal(title, dpIndex: number, dpName: string) {
    this.buildDataPointsTreeNodes(dpIndex);
    this.gwModalService.openAdvancedDialog(
      title,
      ButtonActions.None,
      SurefloDatapointDialogComponent,
      this.surefloDatapointDialogData,
      (result) => {
        if (result) {
          this.updateSourceData(dpName, result, dpIndex);
          this.closeModal();
        } else {
          this.closeModal();
        }
      },
      '420px'
    );

  }

  updateSourceData(source: string, data: any, pointIndex: number) {

    switch (source) {
      case 'InletPressureSource':
        this.inletPressureFilePath = data.path;
        this.surefloPTForm.patchValue({
            InletPressureSource: this.createDataDefinition(data, pointIndex)
        });
        break;
      case 'ThroatPressureSource':
        this.throatPressureFilePath = data.path;
        this.surefloPTForm.patchValue({
          ThroatPressureSource: this.createDataDefinition(data, pointIndex)
        });
        break;
      case 'RemotePressureSource':
        this.remotePressureFilePath = data.path;
        this.surefloPTForm.patchValue({
          RemotePressureSource: this.createDataDefinition(data, pointIndex)
        });
        break;
      case 'TemperatureSource':
        this.temperatureFilePath = data.path;
        this.surefloPTForm.patchValue({
          TemperatureSource: this.createDataDefinition(data, pointIndex)
        });
        break;
    }
    this.validateFormData();

  }


  closeModal() {
    this.gwModalService.closeModal();
  }

  onResetBtnClick(prop) {
    switch (prop) {
      case 'InletPressureSource':
        this.inletPressureFilePath = "Browse...";
        this.surefloPTForm.patchValue({
            InletPressureSource: null
        });
        break;
      case 'ThroatPressureSource':
        this.throatPressureFilePath = "Browse...";
        this.surefloPTForm.patchValue({
          ThroatPressureSource: null
        });
        break;
      case 'RemotePressureSource':
        this.remotePressureFilePath = "Browse...";
        this.surefloPTForm.patchValue({
          RemotePressureSource: null
        });
        break;
      case 'TemperatureSource':
        this.temperatureFilePath = "Browse...";
        this.surefloPTForm.patchValue({
          TemperatureSource: null
        });
        break;
    }
  }

  onCalibrationFileChange(fileInput: any) {

    if (fileInput.target.files.length == 0)
      return;

    this.calibrationErrorMsg = null;
    this.calibrationFilePath = fileInput.target.files[0].name;
    var extension = this.calibrationFilePath.split(".")[1];
    if (extension.toLowerCase() !== "txt") {
      this.calibrationFilePath = "Browse...";
      this.calibrationErrorMsg = "Please select a valid calibration file.";
      this.calFileEditBtnVisibility = false;
      this.validateFormData(true);
      return;
    }

    var file = fileInput.target.files[0];
    var reader = new FileReader();
    reader.readAsText(file, "UTF-8");

    reader.onloadend = (e) => {

      const isValidCalFile = this.isValidCalFile(reader.result.toString());
      let calFile = isValidCalFile ? JSON.parse(reader.result.toString()) : null;
      if (calFile) {
        const calFileData = reader.result as string;
        let dataObject = JSON.parse(calFileData);
        this.calFileEditBtnVisibility = true;
        this.data.CalibrationFileName = this.calibrationFilePath;
        this.updateFlowMeterData(dataObject);
        this.calibrationErrorMsg = null;
      } else {
        this.calibrationFilePath = "Browse...";
        this.calibrationErrorMsg = "Please select a valid calibration file.";
        this.calFileEditBtnVisibility = false;
        this.validateFormData(true);
      }
    };
  }

  private validateFlowMeterDimensions(flowMeterDimensionsData): boolean {
    let flowMeterDimensionSchema = sureflo298ModelSchema.definitions.FlowMeterDimensions;
    let flowMeterDimensions: FlowMeterDimensions = {
      InletDiameter: flowMeterDimensionsData.InletDiameter,
      ThroatDiameter: flowMeterDimensionsData.ThroatDiameter,
      RemoteDiameter: flowMeterDimensionsData.RemoteDiameter??0,
      StaticCorrection: flowMeterDimensionsData.StaticCorrection,
      LengthP1toP3: flowMeterDimensionsData.LengthP1toP3??0,
      RGCPosition: flowMeterDimensionsData.RGCPosition??0
    };
    let validator = new Validator();
    validator.addSchema(flowMeterDimensionSchema);
    let validationResult = validator.validate(flowMeterDimensions, flowMeterDimensionSchema);
    
    return validationResult.valid;
  }

  private validatefluidPVTData(fluidPVTData): boolean {
    // clone schema and set Calibration file properties to undefined
    let pvtDataSchema = _.cloneDeep(sureflo298ModelSchema.definitions.FluidPVTData);
    pvtDataSchema.properties.GasOilRatioCalibration.$ref = undefined;
    pvtDataSchema.properties.OilDensityCalibration.$ref = undefined;
    pvtDataSchema.properties.OilViscosityCalibration.$ref = undefined;
    pvtDataSchema.properties.OilVolumeFactorCalibration.$ref = undefined;
    pvtDataSchema.properties.WaterDensityCalibration.$ref = undefined;
    pvtDataSchema.properties.WaterViscosityCalibration.$ref = undefined;
    pvtDataSchema.properties.WaterVolumeFactorCalibration.$ref = undefined;

    let fluidPVT: FluidPVTData = {
      OilFVF: fluidPVTData.OilFVF??0,
      OilDensity: fluidPVTData.OilDensity??0,
      OilViscosity: fluidPVTData.OilViscosity??0,
      WaterFVF: fluidPVTData.WaterFVF??0,
      WaterDensity: fluidPVTData.WaterDensity??0,
      WaterViscosity: fluidPVTData.WaterViscosity??0,
      SolutionGOR: fluidPVTData.SolutionGOR??0,
      UseCustomWaterProperties: fluidPVTData.UseCustomWaterProperties??false,
      WaterSpecificGravity: fluidPVTData.WaterSpecificGravity??0,
      OilDensityCalibration: fluidPVTData.OilDensityCalibration??null,
      OilViscosityCalibration: fluidPVTData.OilViscosityCalibration??null,
      OilVolumeFactorCalibration: fluidPVTData.OilVolumeFactorCalibration??null,
      GasOilRatioCalibration: fluidPVTData.GasOilRatioCalibration??null,
      WaterDensityCalibration: fluidPVTData.WaterDensityCalibration??null,
      WaterViscosityCalibration: fluidPVTData.WaterViscosityCalibration??null,
      WaterVolumeFactorCalibration: fluidPVTData.WaterVolumeFactorCalibration??null
    };

    let validator = new Validator();
    validator.addSchema(pvtDataSchema);
    let validationResult = validator.validate(fluidPVT, pvtDataSchema);
    
    return validationResult.valid;
  }

  private validateAdditionalParameters(additionalParams): boolean {
    let additionalParamSchema = sureflo298ModelSchema.definitions.AdditionalParameters;
    let additionalParameters: AdditionalParameters = {
      Deviation: additionalParams.Deviation??0,
      FrictionFactor: additionalParams.FrictionFactor??0,
      DeltaThreshold: additionalParams.DeltaThreshold??0,
      DHWaterCutPercent: additionalParams.DHWaterCutPercent??0,
      SurfaceWaterCutPercent: additionalParams.SurfaceWaterCutPercent??0,
      ProducedGasGravity: additionalParams.ProducedGasGravity??0,
      CD: additionalParams.CD??0,
    };

    let validator = new Validator();
    validator.addSchema(additionalParamSchema);
    let validationResult = validator.validate(additionalParameters, additionalParamSchema);
        
    return validationResult.valid;
  }

  isValidCalFile(str) {
    try {
      const data = JSON.parse(str);
      let bIsValidFile = data.technology === this.data.Technology && data.fluidType === this.data.FluidType && 
             data.flowMeterDimensions && data.additionalParameters && (!this.fluidTypeGasVisibility ? data.fluidPVTData : true);
      if (bIsValidFile) {
        bIsValidFile = this.validateFlowMeterDimensions(data.flowMeterDimensions);
        if (!bIsValidFile)
          return bIsValidFile;

        // PVT Data
        if (!this.fluidTypeGasVisibility) {
          bIsValidFile = this.validatefluidPVTData(data.fluidPVTData);
          if (!bIsValidFile)
            return bIsValidFile;
        }

        // Additional Parameters
        bIsValidFile = this.validateAdditionalParameters(data.additionalParameters);
      }
      return bIsValidFile;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  updateFlowMeterData(calFile) {
    if (this.surefloPTForm.valid) {
      this.data.flowMeterPTMapping = this.surefloPTForm.value;
    }
    this.data.flowMeterDimensions = calFile.flowMeterDimensions;
    this.data.fluidPVTData = calFile.fluidPVTData;
    this.data.additionalParameters = calFile.additionalParameters;
    this.validateFormData(true);
  }

  onEditCalFileBtnClick() {
    
    this.surefloCalibrationDialogData = {
      fluidType: this.data.FluidType,
      technology: this.data.Technology,
      calibrationFileName: this.data.CalibrationFileName,
      flowMeterDimensions: this.data.flowMeterDimensions,
      fluidPVTData: this.data.fluidPVTData,
      additionalParameters: this.data.additionalParameters,
      useRemoteGauge: this.remoteGaugeSecVisibility
    };
    this.gwModalService.openAdvancedDialog(
      'Edit Calibration File',
      ButtonActions.None,
      SurefloCalibrationDialogComponent,
      this.surefloCalibrationDialogData,
      (calibrationData: SureFLO298CalibrationModel) => {
        if (calibrationData) {
          this.calibrationFilePath = calibrationData.calibrationFileName;
          this.data.CalibrationFileName = calibrationData.calibrationFileName;
          this.data.flowMeterDimensions = calibrationData.flowMeterDimensions;
          this.data.fluidPVTData = calibrationData.fluidPVTData;
          this.data.additionalParameters = calibrationData.additionalParameters;
          this.data.CalibrationFileName = this.calibrationFilePath;
          this.validateFormData(true);
          this.closeModal();
        } else {
          this.closeModal();
        }
      },
      '920px'
    );
  }


  onCreateCalFileBtnClick() {
    this.surefloCalibrationDialogData = {
      fluidType: this.data.FluidType,
      technology: this.data.Technology,
      calibrationFileName: this.data.CalibrationFileName,
      flowMeterDimensions: null,
      fluidPVTData: null,
      additionalParameters: null,
      useRemoteGauge: this.remoteGaugeSecVisibility
    };
    this.gwModalService.openAdvancedDialog(
      'Create Calibration File',
      ButtonActions.None,
      SurefloCalibrationDialogComponent,
      this.surefloCalibrationDialogData,
      (calibrationData: SureFLO298CalibrationModel) => {
        if (calibrationData) {
          this.calibrationFilePath = calibrationData.calibrationFileName;
          this.data.CalibrationFileName = calibrationData.calibrationFileName;
          this.data.flowMeterDimensions = calibrationData.flowMeterDimensions;
          this.data.fluidPVTData = calibrationData.fluidPVTData;
          this.data.additionalParameters = calibrationData.additionalParameters;
          this.data.CalibrationFileName = this.calibrationFilePath;
          this.calFileEditBtnVisibility = true;
          this.calibrationErrorMsg = null;
          this.validateFormData(true);
          this.closeModal();
        } else {
          this.closeModal();
        }
      },
      '920px'
    );
  }

  onDownloadCalFileBtnClick() {
    let calibrationFile;
    const calibrationData:SureFLO298CalibrationModel = {
      fluidType: this.data.FluidType,
      technology: this.data.Technology,
      calibrationFileName: this.data.CalibrationFileName,
      flowMeterDimensions: this.data.flowMeterDimensions,
      fluidPVTData: this.data.fluidPVTData,
      additionalParameters: this.data.additionalParameters,
      useRemoteGauge: this.remoteGaugeSecVisibility
    };
    if (this.fluidTypeGasVisibility) {
      calibrationFile = this.surefloService.construct298GasCalFile(calibrationData);
    } else if (this.fluidTypeWaterVisibility) {
      calibrationFile = this.surefloService.construct298WaterCalFile(calibrationData);
    } else {
      calibrationFile = this.surefloService.construct298OilCalFile(calibrationData);
    }
    const blob = new Blob([JSON.stringify(calibrationFile)], { type: "text/plain;charset=utf-8" });
    saveAs(blob, calibrationFile.calibrationFileName);
  }

  onToggle(event: MatSlideToggleChange) {
    this.remoteGaugeSecVisibility = event.checked;
    this.resetRemoteGaugeInfo();
  }

  resetRemoteGaugeInfo() {
    this.surefloPTForm.patchValue({
      RemotePressureSource: null
    });
    this.remotePressureFilePath = "Browse...";
  }

  validateFormData(isCalFileChange?: boolean): void {
    this.isFormDataChangeValid = true;
    this.surefloPTForm.setErrors(null);
    if (this.surefloPTForm.value.UseRemoteGauge) {
      if (!this.surefloPTForm.value.RemotePressureSource || this.calibrationFilePath ===  "Browse...") {
        this.surefloPTForm.setErrors({ 'valid': false });
        this.isFormDataChangeValid = false;
      }
    } else if (!this.surefloPTForm.value.UseRemoteGauge && this.calibrationFilePath === "Browse...") {
      this.surefloPTForm.setErrors({ 'valid': false });
      this.isFormDataChangeValid = false;
    }
    let data = _.cloneDeep(this.data);
    data.flowMeterPTMapping = this.surefloPTForm.value;
    this.onFlowMeterDataChange.emit(data);
  }

  private buildDataPointsTreeNodes(dataPointIdx: number) {
    this.dataList = [];
    if (this.toolsList.length > 0 && this.dataPoints.length > 0) {
      const wellName = this.toolsList[0].WellName;
      let nodeIndex = -1;
      this.toolsList.forEach(tool => {
        const dataPoint = this.dataPoints.find(dp => dp.DeviceId === tool.DeviceId && dp.DataPointIndex === dataPointIdx);

        let node: SurefloDataPointListNode = { name: tool.DeviceName, displayLabel: tool.DeviceName, path: tool.DeviceName, deviceId: tool.DeviceId, index: ++nodeIndex };
        if (dataPoint?.DataPointIndex === dataPointIdx) {
          const item: SurefloDataPointListNode = {
            name: dataPoint.TagName,
            displayLabel: `${node.name}_${dataPoint.TagName}`,
            path: `${wellName}_${node.name}_${dataPoint.TagName}`,
            deviceId: dataPoint.DeviceId,
            index: ++nodeIndex,
          };
          // Filter out irrelevant unit --- to do use index
          if (this.dataList.length > 0) {
            const unitIdx = this.dataList.findIndex(dl => dl.name === dataPoint.TagName);
            if (unitIdx !== -1) this.dataList.push(item);
          } else {
            this.dataList.push(item);
          }

        }

      });
      this.surefloDatapointDialogData = {
        dataList: this.filterDataPoint()
      };
    }
  }

  filterDataPoint() {
    let data = [];
    if (this.dataList.length > 0) {
      data = this.dataList.filter(dl =>
        dl.path !== this.inletPressureFilePath && dl.path !== this.throatPressureFilePath && dl.path !== this.remotePressureFilePath &&
        dl.path !== this.temperatureFilePath
      );
      return data;
    }
  }

  private createDataDefinition(data: any, pointIndex: number): DataPointDefinitionModel {
    let index = this.datapointdefinitions.findIndex(d => d.DeviceId === data.deviceId && d.DataPointIndex == pointIndex) ?? -1;
    if (index !== -1) {
      const dp = new DataPointDefinitionModel();
      dp.DataPointIndex = this.datapointdefinitions[index].DataPointIndex;
      dp.DataType = this.datapointdefinitions[index].DataType;
      dp.DeviceId = this.datapointdefinitions[index].DeviceId;
      dp.RawValue = -999;
      dp.ReadOnly = this.datapointdefinitions[index].ReadOnly;
      dp.TagName = data.path ?? this.datapointdefinitions[index].TagName;
      dp.UnitQuantityType = this.datapointdefinitions[index].UnitQuantityType;
      dp.UnitSymbol = this.datapointdefinitions[index].UnitSymbol;
      return dp;
    }
    return new DataPointDefinitionModel();  // return empty DataPointDefinitionModel
  }

  postCallGetToolConnections() {
    const panelTypeId = this.panelConfigurationCommonState.panelConfigurationCommon.PanelTypeId;
    if (panelTypeId === PanelTypeList.SURESENS) {
      this.toolsList = this.toolConnectionEntity.filter(tc => tc.WellId === this.data.WellId && tc.PortingId === -1);
    } else {
      this.toolsList = this.toolConnectionEntity.filter(tc => tc.WellId === this.data.WellId && tc.PortingId !== -1);
    }
  }

  postCallGetDataSources() { }

  postCallDeviceDataPoints() {
    this.dataPoints = this.datapointdefinitions ?? [];
    this.createFormGroup();
  }

  postCallGetPointTemplates() { }

  private subscribeToFormDataChanges() {
    this.surefloPTForm.valueChanges.subscribe((val) => {
      if (!this.surefloPTForm.pristine) {
        this.validateFormData();
      }
    });
  }

  createFormGroup() {
    
    this.isConfigSaved = this.panelConfigurationCommonState.panelConfigurationCommon.Id > 0 && UICommon.IsConfigSaved ? true : false; 
    this.surefloPTForm = new FormGroup({
      InletPressureSource: new FormControl(null, [Validators.required]),
      ThroatPressureSource: new FormControl(null, [Validators.required]),
      TemperatureSource: new FormControl(null, [Validators.required]),
      RemotePressureSource: new FormControl(null),
      UseRemoteGauge: new FormControl(false)
    });
    this.setFormData();
  }

  setFormData() {

    const flowMeterPTMapping = this.data?.flowMeterPTMapping;
    if (flowMeterPTMapping) {

      this.surefloCalibrationDialogData = {
        fluidType: this.data.FluidType,
        technology: this.data.Technology,
        calibrationFileName: this.data.CalibrationFileName,
        flowMeterDimensions: this.data.flowMeterDimensions,
        fluidPVTData: this.data.fluidPVTData,
        additionalParameters: this.data.additionalParameters,
        useRemoteGauge: this.remoteGaugeSecVisibility
      };

      this.surefloPTForm.patchValue(
        {
          InletPressureSource: flowMeterPTMapping.InletPressureSource,
          ThroatPressureSource: flowMeterPTMapping.ThroatPressureSource,
          TemperatureSource: flowMeterPTMapping.TemperatureSource,
          UseRemoteGauge: flowMeterPTMapping.UseRemoteGauge,
          RemotePressureSource: flowMeterPTMapping.RemotePressureSource,
        }
      );

      // this.inletPressureFilePath = flowMeterPTMapping.InletPressureSource?.TagName || this.inletPressureFilePath;
      // this.throatPressureFilePath = flowMeterPTMapping.ThroatPressureSource?.TagName || this.throatPressureFilePath;
      // this.temperatureFilePath = flowMeterPTMapping.TemperatureSource?.TagName || this.temperatureFilePath;

      if (flowMeterPTMapping.InletPressureSource) {
        this.inletPressureFilePath = this.setFlowMeterDataPointTagName(flowMeterPTMapping.InletPressureSource);
      }

      if (flowMeterPTMapping.ThroatPressureSource) {
        this.throatPressureFilePath = this.setFlowMeterDataPointTagName(flowMeterPTMapping.ThroatPressureSource);
      }

      if (flowMeterPTMapping.TemperatureSource) {
        this.temperatureFilePath = this.setFlowMeterDataPointTagName(flowMeterPTMapping.TemperatureSource);
      }

      if (flowMeterPTMapping.UseRemoteGauge) {
        this.remoteGaugeSecVisibility = true;
        if (flowMeterPTMapping.RemotePressureSource) {
          this.remotePressureFilePath = this.setFlowMeterDataPointTagName(flowMeterPTMapping.RemotePressureSource);
        }
      }
      
      this.calibrationFilePath = this.data?.CalibrationFileName || "Browse...";
      this.calFileEditBtnVisibility = this.calibrationFilePath &&  this.calibrationFilePath !=='Browse...' ? true : false;
    }
    this.subscribeToFormDataChanges();
  }

  private setFlowMeterDataPointTagName(dataPointModel: DataPointDefinitionModel): string {
    let tagName: string = dataPointModel.TagName;

    let inxTool = this.toolsList.findIndex(t => t.DeviceId === dataPointModel.DeviceId);
    if (inxTool != -1) {
      const wellName = this.toolsList[inxTool].WellName;
      const toolName = this.toolsList[inxTool].DeviceName;

      let inxDataPoint = this.dataPoints.findIndex(dp => dp.DeviceId === dataPointModel.DeviceId && dp.DataPointIndex === dataPointModel.DataPointIndex);
      if (inxDataPoint != -1) {
        const dataPoint = this.dataPoints[inxDataPoint];
        tagName = `${wellName}_${toolName}_${dataPoint.TagName}`;
      }
    }
    
    return tagName;
  }

  ngOnInit(): void {
    const fluidTypeId = parseInt(this.data.FluidType);
    this.initPanelConfigurationCommon();
    this.initToolConnections();
    this.initDataSources();
    this.initDeviceDataPoints();
    this.fluidTypeGasVisibility = fluidTypeId === WellFlowTypes.GasProducer || fluidTypeId === WellFlowTypes.GasInjector ? true : false;
    this.fluidTypeWaterVisibility = fluidTypeId === WellFlowTypes.WaterInjector ? true : false;
  }

  ngOnDestroy(): void {
    if (!this.surefloPTForm.pristine) {
      this.validateFormData();
    }
    super.ngOnDestroy();
  }

}


