import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { GatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { PanelTypeList, SureSENSDataPointIndex, UICommon } from '@core/data/UICommon';
import * as _ from 'lodash';

import { Store } from '@ngrx/store';
import { DataSourceFacade } from '@core/facade/dataSourceFacade.service';
import { DeviceDataPointsFacade } from '@core/facade/deviceDataPointsFacade.service';
import { PointTemplatesFacade } from '@core/facade/pointTemplatesFacade.service';
import { WellFacade } from '@core/facade/wellFacade.service';

import { ButtonActions } from '@shared/gateway-dialogs/components/gateway-advanced-dialog/gateway-advanced-dialog.component';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { SurefloDatapointDialogComponent, SurefloDatapointDialogData, SurefloDataPointListNode } from '../sureflo-datapoint-dialog/sureflo-datapoint-dialog.component';
import { ToolConnectionUIModel } from '@core/models/UIModels/tool-connection.model';
import { DataPointDefinitionModel } from '@core/models/webModels/DataPointDefinition.model';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { SurefloExCalibrationDialogComponent, SurefloExCalibrationDialogData } from '@shared/sureflo-ex-flowmeter/components/sureflo-ex-calibration-dialog/sureflo-ex-calibration-dialog.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SurefloService } from '@core/services/sureflo.service';
import { PanelConfigurationFacade } from '@core/facade/panelConfigFacade.service';
import { UtilityService } from '@core/services/utility.service';
import { SureFLO298EXCalibrationModel, SureFLO298ExUIFlowMeterUIModel } from '@core/models/UIModels/sureflo-ex-flowmeter-model';
import { AdditionalParameters298Ex, FlowMeterDimensions298Ex, FlowMeterTypes, FluidPVTData298Ex, WellFlowTypes } from '@core/models/webModels/SureFLODataModel.model';
import { SurefloFacade } from '@core/facade/surefloFacade.service';
import { sureflo298EXModelSchema } from '@core/models/schemaModels/SureFLOFlowMeter298Ex.schema';
import { Validator } from 'jsonschema';

@Component({
  selector: 'sureflo-stepper-ex-gauge-data',
  templateUrl: './sureflo-stepper-ex-gauge-data.component.html',
  styleUrls: ['./sureflo-stepper-ex-gauge-data.component.scss']
})
export class SurefloStepperExGaugeDataComponent extends GatewayPanelBase implements OnInit, OnDestroy {

  @Input() data: SureFLO298ExUIFlowMeterUIModel;
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
  outletPressureFilePath: string = "Browse...";
  remotePressureFilePath: string = "Browse...";
  inletTemperatureFilePath: string = "Browse...";
  outletTemperatureFilePath: string = "Browse...";
  remoteTemperatureFilePath: string = "Browse...";
  calibrationFilePath: string = "Browse...";

  calibrationErrorMsg: string;

  surefloDatapointDialogComponent: SurefloDatapointDialogComponent;
  surefloDatapointDialogData = new SurefloDatapointDialogData();

  surefloExCalibrationDialogComponent: SurefloExCalibrationDialogComponent;
  surefloExCalibrationDialogData = new SurefloExCalibrationDialogData();


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

  onOutletPressureInputClick() {
    const title = "Outlet Pressure";
    this.openModal(title, SureSENSDataPointIndex.Pressure, 'OutletPressureSource');
  }


  onInletTemperatureInputClick() {
    const title = "Inlet Temperature";
    this.openModal(title, SureSENSDataPointIndex.Temperature, 'InletTemperatureSource');
  }

  onOutletTemperatureInputClick() {
    const title = "Outlet Temperature";
    this.openModal(title, SureSENSDataPointIndex.Temperature, 'OutletTemperatureSource');
  }

  onRemotePressureInputClick() {
    const title = "Remote Pressure";
    this.openModal(title, SureSENSDataPointIndex.Pressure, 'RemotePressureSource');
  }

  onRemoteTemperatureInputClick() {
    const title = "Remote Temperature";
    this.openModal(title, SureSENSDataPointIndex.Temperature, 'RemoteTemperatureSource');
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
      case 'OutletPressureSource':
        this.outletPressureFilePath = data.path;
        this.surefloPTForm.patchValue({
          OutletPressureSource: this.createDataDefinition(data, pointIndex)
        });
        break;
      case 'RemotePressureSource':
        this.remotePressureFilePath = data.path;
        this.surefloPTForm.patchValue({
          RemotePressureSource: this.createDataDefinition(data, pointIndex)
        });
        break;
      case 'OutletTemperatureSource':
        this.outletTemperatureFilePath = data.path;
        this.surefloPTForm.patchValue({
          OutletTemperatureSource: this.createDataDefinition(data, pointIndex)
        });
        break;
      case 'RemoteTemperatureSource':
        this.remoteTemperatureFilePath = data.path;
        this.surefloPTForm.patchValue({
          RemoteTemperatureSource: this.createDataDefinition(data, pointIndex)
        });
        break;
      case 'InletTemperatureSource':
        this.inletTemperatureFilePath = data.path;
        this.surefloPTForm.patchValue({
          InletTemperatureSource: this.createDataDefinition(data, pointIndex)
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
      case 'OutletPressureSource':
        this.outletPressureFilePath = "Browse...";
        this.surefloPTForm.patchValue({
          OutletPressureSource: null
        });
        break;
      case 'RemotePressureSource':
        this.remotePressureFilePath = "Browse...";
        this.surefloPTForm.patchValue({
          RemotePressureSource: null
        });
        break;
      case 'OutletTemperatureSource':
        this.outletTemperatureFilePath = "Browse...";
        this.surefloPTForm.patchValue({
          OutletTemperatureSource: null
        });
        break;
      case 'RemoteTemperatureSource':
        this.remoteTemperatureFilePath = "Browse...";
        this.surefloPTForm.patchValue({
          RemoteTemperatureSource: null
        });
        break;
      case 'InletTemperatureSource':
        this.inletTemperatureFilePath = "Browse...";
        this.surefloPTForm.patchValue({
          InletTemperatureSource: null
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
    let flowMeterDimensionSchema = sureflo298EXModelSchema.definitions.FlowMeterDimensions298Ex;
    let flowMeterDimensions: FlowMeterDimensions298Ex = {
      InletDiameter: flowMeterDimensionsData.InletDiameter,
      OutletDiameter: flowMeterDimensionsData.OutletDiameter,
      RemoteDiameter: flowMeterDimensionsData.RemoteDiameter??0,
      InletTolerance: flowMeterDimensionsData.InletTolerance,
      OutletTolerance: flowMeterDimensionsData.OutletTolerance,
      RemoteTolerance: flowMeterDimensionsData.RemoteTolerance??0,
      StaticCorrection: flowMeterDimensionsData.StaticCorrection,
      DensityStaticCorrection: flowMeterDimensionsData.flowMeterDimensionsDensityStaticCorrection??0,
      ApplyStaticCorrection: flowMeterDimensionsData.ApplyStaticCorrection,
      ApplyDensityStaticCorrection: flowMeterDimensionsData.ApplyDensityStaticCorrection??false,
      RemotePosition: flowMeterDimensionsData.RemotePosition
    };

    let validator = new Validator();
    validator.addSchema(flowMeterDimensionSchema);
    let validationResult = validator.validate(flowMeterDimensions, flowMeterDimensionSchema);

    return validationResult.valid;
  }

  private validatefluidPVTData(fluidPVTData): boolean {
    // clone schema and set Calibration file properties to undefined
    let pvtDataSchema = _.cloneDeep(sureflo298EXModelSchema.definitions.FluidPVTData298Ex);
    pvtDataSchema.properties.OilDensityCalibration.$ref = undefined;
    pvtDataSchema.properties.OilViscosityCalibration.$ref = undefined;
    pvtDataSchema.properties.OilVolumeFactorCalibration.$ref = undefined;
    pvtDataSchema.properties.GasOilRatioCalibration.$ref = undefined;
    pvtDataSchema.properties.GasDensityCalibration.$ref = undefined;
    pvtDataSchema.properties.GasViscosityCalibration.$ref = undefined;
    pvtDataSchema.properties.GasVolumeFactorCalibration.$ref = undefined;
    pvtDataSchema.properties.WaterDensityCalibration.$ref = undefined;
    pvtDataSchema.properties.WaterViscosityCalibration.$ref = undefined;
    pvtDataSchema.properties.WaterVolumeFactorCalibration.$ref = undefined;

    let fluidPVT: FluidPVTData298Ex = {
      SpecificGravityOil: fluidPVTData.SpecificGravityOil??0,
      SpecificGravityGas: fluidPVTData.SpecificGravityGas??0,
      SpecificGravityWater: fluidPVTData.SpecificGravityWater??0,
      OilSurfaceViscosity: fluidPVTData.OilSurfaceViscosity??0,
      GasOilRatio: fluidPVTData.GasOilRatio??0,
      UseCustomOilProperties: fluidPVTData.UseCustomOilProperties??false,
      UseCustomWaterProperties: fluidPVTData.UseCustomWaterProperties??false,
      UseCustomGasProperties: fluidPVTData.UseCustomGasProperties??false,
      OilDensityCalibration: fluidPVTData.OilDensityCalibration??null,
      OilViscosityCalibration: fluidPVTData.OilViscosityCalibration??null,
      OilVolumeFactorCalibration: fluidPVTData.OilVolumeFactorCalibration??null,
      GasOilRatioCalibration: fluidPVTData.GasOilRatioCalibration??null,
      GasDensityCalibration: fluidPVTData.GasDensityCalibration??null,
      GasViscosityCalibration: fluidPVTData.GasViscosityCalibration??null,
      GasVolumeFactorCalibration: fluidPVTData.GasVolumeFactorCalibration??null,
      WaterDensityCalibration: fluidPVTData.WaterDensityCalibration??null,
      WaterViscosityCalibration: fluidPVTData.WaterViscosityCalibration??null,
      WaterVolumeFactorCalibration: fluidPVTData.WaterVolumeFactorCalibration??null,
      CalculateDensity: fluidPVTData.CalculateDensity??false,
      CalculateViscosity: fluidPVTData.CalculateViscosity??false,
    };

    let validator = new Validator();
    validator.addSchema(pvtDataSchema);
    let validationResult = validator.validate(fluidPVT, pvtDataSchema);
    
    return validationResult.valid;
  }

  private validateAdditionalParameters(additionalParams): boolean {
    let additionalParamSchema = sureflo298EXModelSchema.definitions.AdditionalParameters298Ex;
    let additionalParameters: AdditionalParameters298Ex = {
      MeasuredDepth: additionalParams.MeasuredDepth??0,
      TrueVerticalDepth: additionalParams.TrueVerticalDepth??0,
      SurfaceWaterCut: additionalParams.SurfaceWaterCut??0,
      WaterCutInversion: additionalParams.WaterCutInversion??0,
      EmulsificationStability: additionalParams.EmulsificationStability??0,
      RoughnessFactor: additionalParams.RoughnessFactor??0,
      CoefficientExpansion: additionalParams.CoefficientExpansion??0,
      Deviation: additionalParams.Deviation??0
    };
    
    let validator = new Validator();
    validator.addSchema(additionalParamSchema);
    let validationResult = validator.validate(additionalParameters, additionalParamSchema);
    
    return validationResult.valid;
  }

  private validateFilterParameters(filterParams): boolean {
    let filterParamsSchema = sureflo298EXModelSchema.definitions.FilterParameters298Ex;
    let validator = new Validator();
    validator.addSchema(filterParamsSchema);
    let validationResult = validator.validate(filterParams, filterParamsSchema);
    
    return validationResult.valid;
  }

  isValidCalFile(str) {
    try {
      const data = JSON.parse(str);
      let bIsValidFile = (data.fluidType === this.data.FluidType && data.flowMeterDimensions && data.fluidPVTData && data.additionalParameters && data.filterParameters);
      if (bIsValidFile) {
        // FlowMeter Dimensions
        bIsValidFile = this.validateFlowMeterDimensions(data.flowMeterDimensions);
        if (!bIsValidFile)
          return bIsValidFile;

        // PVT Data
        bIsValidFile = this.validatefluidPVTData(data.fluidPVTData);
        if (!bIsValidFile)
          return bIsValidFile;

        // Additional Parameters
        bIsValidFile = this.validateAdditionalParameters(data.additionalParameters);
        if (!bIsValidFile)
          return bIsValidFile;
        
        // Filter Parameters
        bIsValidFile = this.validateFilterParameters(data.filterParameters);
      }
      return bIsValidFile;
    } catch (e) {
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
    this.data.filterParameters = calFile.filterParameters;
    this.validateFormData(true);
  }

  onReservoirTempFileChange(fileInput: any) {

    this.inletTemperatureFilePath = fileInput.target.files[0].name;
  }

  onOutletTempFileChange(fileInput: any) {
    this.outletPressureFilePath = fileInput.target.files[0].name;
  }

  onEditCalFileBtnClick() {
    
    this.surefloExCalibrationDialogData = {
      fluidType: this.data.FluidType,
      technology: this.data.Technology,
      calibrationFileName: this.data.CalibrationFileName,
      flowMeterDimensions: this.data.flowMeterDimensions,
      fluidPVTData: this.data.fluidPVTData,
      additionalParameters: this.data.additionalParameters,
      filterParameters: this.data.filterParameters,
      useRemoteGauge: this.remoteGaugeSecVisibility
    };
    this.gwModalService.openAdvancedDialog(
      'Edit Calibration File',
      ButtonActions.None,
      SurefloExCalibrationDialogComponent,
      this.surefloExCalibrationDialogData,
      (calibrationData: SureFLO298EXCalibrationModel) => {
        if (calibrationData) {
          this.calibrationFilePath = calibrationData.calibrationFileName;
          this.data.CalibrationFileName = calibrationData.calibrationFileName;
          this.data.flowMeterDimensions = calibrationData.flowMeterDimensions;
          this.data.fluidPVTData = calibrationData.fluidPVTData;
          this.data.filterParameters = calibrationData.filterParameters;
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
    this.surefloExCalibrationDialogData = {
      fluidType: this.data.FluidType,
      technology: this.data.Technology,
      calibrationFileName: this.data.CalibrationFileName,
      flowMeterDimensions: null,
      fluidPVTData: null,
      additionalParameters: null,
      filterParameters: null,
      useRemoteGauge: this.remoteGaugeSecVisibility
    };
    this.gwModalService.openAdvancedDialog(
      'Create Calibration File',
      ButtonActions.None,
      SurefloExCalibrationDialogComponent,
      this.surefloExCalibrationDialogData,
      (calibrationData: SureFLO298EXCalibrationModel) => {
        if (calibrationData) {
          this.calibrationFilePath = calibrationData.calibrationFileName;
          this.data.CalibrationFileName = calibrationData.calibrationFileName;
          this.data.flowMeterDimensions = calibrationData.flowMeterDimensions;
          this.data.fluidPVTData = calibrationData.fluidPVTData;
          this.data.filterParameters = calibrationData.filterParameters;
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
    const calibrationData:SureFLO298EXCalibrationModel = {
      fluidType: this.data.FluidType,
      technology: this.data.Technology,
      calibrationFileName: this.data.CalibrationFileName,
      flowMeterDimensions: this.data.flowMeterDimensions,
      fluidPVTData: this.data.fluidPVTData,
      additionalParameters: this.data.additionalParameters,
      filterParameters: this.data.filterParameters,
      useRemoteGauge: this.remoteGaugeSecVisibility
    };
    if (this.fluidTypeGasVisibility) {
      calibrationFile = this.surefloService.construct298EXGasCalFile(calibrationData);
    } else if (this.fluidTypeWaterVisibility) {
      calibrationFile = this.surefloService.construct298EXWaterCalFile(calibrationData);
    } else {
      calibrationFile = this.surefloService.construct298EXOilCalFile(calibrationData);
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
      RemotePressureSource: null,
      RemoteTemperatureSource: null
    });
    this.remotePressureFilePath = "Browse...";
    this.remoteTemperatureFilePath = "Browse...";
  }

  validateFormData(isCalFileChange?: boolean): void {
    this.isFormDataChangeValid = true;
    this.surefloPTForm.setErrors(null);
    if (this.surefloPTForm.value.UseRemoteGauge) {
      if (!this.surefloPTForm.value.RemotePressureSource || !this.surefloPTForm.value.RemoteTemperatureSource || this.calibrationFilePath ===  "Browse...") {
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
        dl.path !== this.inletPressureFilePath && dl.path !== this.outletPressureFilePath && dl.path !== this.remotePressureFilePath &&
        dl.path !== this.inletTemperatureFilePath && dl.path !== this.outletTemperatureFilePath && dl.path !== this.remoteTemperatureFilePath
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

  getFlowMeterData() {
    let data = _.cloneDeep(this.data);
    data.flowMeterPTMapping = this.surefloPTForm.value;
    return data;
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
      OutletPressureSource: new FormControl(null, [Validators.required]),
      InletTemperatureSource: new FormControl(null, [Validators.required]),
      OutletTemperatureSource: new FormControl(null, [Validators.required]),
      RemotePressureSource: new FormControl(null),
      RemoteTemperatureSource: new FormControl(null),
      UseRemoteGauge: new FormControl(false)
    });
    this.setFormData();
  }

  setFormData() {
    const flowMeterPTMapping = this.data?.flowMeterPTMapping;
    if (flowMeterPTMapping) {
      this.surefloExCalibrationDialogData = {
        fluidType: this.data.FluidType,
        technology: this.data.Technology,
        calibrationFileName: this.data.CalibrationFileName,
        flowMeterDimensions: this.data.flowMeterDimensions,
        fluidPVTData: this.data.fluidPVTData,
        additionalParameters: this.data.additionalParameters,
        filterParameters: this.data.filterParameters,
        useRemoteGauge: this.remoteGaugeSecVisibility
      };

      this.surefloPTForm.patchValue(
        {
          InletPressureSource: flowMeterPTMapping.InletPressureSource,
          OutletPressureSource: flowMeterPTMapping.OutletPressureSource,
          InletTemperatureSource: flowMeterPTMapping.InletTemperatureSource,
          OutletTemperatureSource: flowMeterPTMapping.OutletTemperatureSource,
          UseRemoteGauge: flowMeterPTMapping.UseRemoteGauge,
          RemotePressureSource: flowMeterPTMapping.RemotePressureSource,
          RemoteTemperatureSource: flowMeterPTMapping.RemoteTemperatureSource
        }
      );

      // this.inletPressureFilePath = flowMeterPTMapping.InletPressureSource?.TagName || this.inletPressureFilePath;
      // this.inletTemperatureFilePath = flowMeterPTMapping.InletTemperatureSource?.TagName || this.inletTemperatureFilePath;
      // this.outletPressureFilePath = flowMeterPTMapping.OutletPressureSource?.TagName || this.outletPressureFilePath;
      // this.outletTemperatureFilePath = flowMeterPTMapping.OutletTemperatureSource?.TagName || this.outletTemperatureFilePath;

      if (flowMeterPTMapping.InletPressureSource) {
        this.inletPressureFilePath = this.setFlowMeterDataPointTagName(flowMeterPTMapping.InletPressureSource);
      }

      if (flowMeterPTMapping.InletTemperatureSource) {
        this.inletTemperatureFilePath = this.setFlowMeterDataPointTagName(flowMeterPTMapping.InletTemperatureSource);
      }

      if (flowMeterPTMapping.OutletPressureSource) {
        this.outletPressureFilePath = this.setFlowMeterDataPointTagName(flowMeterPTMapping.OutletPressureSource);
      }

      if (flowMeterPTMapping.OutletTemperatureSource) {
        this.outletTemperatureFilePath = this.setFlowMeterDataPointTagName(flowMeterPTMapping.OutletTemperatureSource);
      }

      if (flowMeterPTMapping.UseRemoteGauge) {
        this.remoteGaugeSecVisibility = true;
        // this.remotePressureFilePath = flowMeterPTMapping.RemotePressureSource?.TagName || this.remotePressureFilePath;
        // this.remoteTemperatureFilePath = flowMeterPTMapping.RemoteTemperatureSource?.TagName || this.remoteTemperatureFilePath;

        if (flowMeterPTMapping.RemotePressureSource) {
          this.remotePressureFilePath = this.setFlowMeterDataPointTagName(flowMeterPTMapping.RemotePressureSource);
        }

        if (flowMeterPTMapping.RemoteTemperatureSource) {
          this.remoteTemperatureFilePath = this.setFlowMeterDataPointTagName(flowMeterPTMapping.RemoteTemperatureSource);
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

