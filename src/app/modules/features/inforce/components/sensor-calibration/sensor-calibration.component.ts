import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { HyrdraulicPowerUnitPointIndex, Module2542PointIndex, ModuleFlowMeter, ModuleFlowMeterFluidWell } from '@features/inforce/common/InForceModbusRegisterIndex';
import { FLOWMETER_TRASMITTER_TYPE, PanelTypeList } from '@core/data/UICommon';
import { ConfigurationDataModel } from '@core/models/UIModels/ConfigurationData.model';
import { InforcePanelUIModel } from '@core/models/UIModels/inforce-panel-config-common.model';
import { DataPointLinearScaleConversionModel } from '@core/models/webModels/DataPointLinearScaleConversion.model';
import { InforceDeviceDataModel } from '@core/models/webModels/InforceDeviceData.model';
import { PanelConfigurationCommonModel } from '@core/models/webModels/PanelConfigurationCommon.model';
import { PanelSensor } from '@core/models/UIModels/PanelSensor.model';
import { PanelSensorModelNew } from '@core/models/webModels/PanelSensorModelNew.model';
import { DeviceIdIndexValue } from '@core/models/webModels/PointTemplate.model';
import { SensorCalibrationExport, SensorCalibrationExportRecord } from '@core/models/UIModels/SensorCalibrationExport.model';
import { WriteToServerDataModel } from '@core/models/webModels/WriteToServerData.model';
import { ConfigurationService } from '@core/services/configurationService.service';
import { GatewayPanelConfigurationService } from '@core/services/gateway-panel-configuration.service';
import { RealTimeDataSignalRService } from '@core/services/realTimeDataSignalR.service';
import { SensorCalibrationService } from '@features/inforce/services/sensor-calibration.service';
import { Store } from '@ngrx/store';
import { BrowseFileDialogComponentData } from '@shared/gateway-dialogs/components/browse-file-dialog/browse-file-dialog.component';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import * as INFORCE_DEVICES_ACTIONS from '@store/actions/inforcedevices.action';
import * as PANELCONFIG_COMMON_ACTIONS from '@store/actions/panelConfigurationCommon.action';
import * as PANEL_DEFAULT_ACTIONS from '@store/actions/panel-default.action';
import { IInforceDeviceState } from '@store/state/inforcedevices.state';
import { StateUtilities } from '@store/state/IState';
import { IPanelConfigurationCommonState } from '@store/state/panelConfigurationCommon.state';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { IPanelDefaultState } from '@store/state/panel-default.state';
import { PanelDefaultUIModel } from '@core/models/UIModels/panel-default.model';

@Component({
  selector: 'app-sensor-calibration',
  templateUrl: './sensor-calibration.component.html',
  styleUrls: ['./sensor-calibration.component.scss']
})
export class SensorCalibrationComponent implements OnInit, OnDestroy {

  displayedColumns: string[] = ['SensorName', 'RawValue', 'RawValuePoint1', 'RawValuePoint2', 'ScaledValuePoint1', 'ScaledValuePoint2', 'ScaledValue'];
  returnFlowDisplayColumns: string[] = ['Name', 'KFactor']

  panelSensors: PanelSensor[] = [];
  hydraulicPressures: PanelSensor[] = [];
  outputPressures: PanelSensor[] = [];
  public savedPanelSensors: PanelSensor[];
  private arrSubscriptions: Subscription[] = [];
  private dataSubscriptions: Subscription[] = [];
  toolboxRoute: string = "/inforce/toolbox";
  isDataChanged = false;
  isInputFocused = false;
  isHydraulicTableValid = true;
  isOutputTableValid = true;
  isReturnFlowmeterValid = true;
  hydraulicPressureList = [];
  outputPressureList = [];
  returnFlowmeterList = [];
  hydraulicErrorMessages = [];
  outputErrorMessages = [];
  returnFlowmeterErrorMessages = [];
  panelDefaultData: PanelDefaultUIModel;
  ShowKFactor = false;
  public deviceIdIndexValue: DeviceIdIndexValue[] = []; // contains device id/pointindex/value for the HTML page
  public returnFlowmeterValue: number;
  public returnFlowmeterDBValue: number;
  public kFactorValidationValue: number;
  public returnsFlowMeterValidationMessage: string;

  private panelConfigurationCommon: PanelConfigurationCommonModel = null;
  private inforceDevices: InforceDeviceDataModel[] = null;

  private panelConfigurationCommonState$: Observable<IPanelConfigurationCommonState>;
  private InforceDeviceState$: Observable<IInforceDeviceState>;
  private panelDefaultState$: Observable<IPanelDefaultState>;

  constructor(protected store: Store<{
    panelConfigCommonState: IPanelConfigurationCommonState;
    inforcedevicesState: IInforceDeviceState;
  }>,
    protected router: Router,
    private realTimeService: RealTimeDataSignalRService,
    private sensorCalibrationService: SensorCalibrationService,
    private configurationService: ConfigurationService,
    private gatewayModalService: GatewayModalService
  ) {
    this.panelConfigurationCommonState$ = this.store.select<IPanelConfigurationCommonState>((state: any) => state.panelConfigCommonState);
    this.InforceDeviceState$ = this.store.select<IInforceDeviceState>((state: any) => state.inforcedevicesState);
    this.panelDefaultState$ = this.store.select<IPanelDefaultState>((state: any) => state.panelDefaultState);
  }

  onFocus(): void {
    this.isInputFocused = true;
  }

  onLeave(): void {
    this.isInputFocused = false;
  }

  private initPanelConfiguration() {
    let subscription = this.panelConfigurationCommonState$.subscribe(
      (state: IPanelConfigurationCommonState) => {
        if (state !== undefined) {
          if (state.isLoaded === false) {
            // Dispatch Action if not loaded
            this.store.dispatch(
              PANELCONFIG_COMMON_ACTIONS.PANELCONFIG_COMMON_LOAD()
            );
          } else {
            if (!StateUtilities.hasErrors(state)) {
              this.panelConfigurationCommon = state.panelConfigurationCommon;
              this.postCallGetPanelConfigurationCommon();
            }
          }
        }
      }
    );
    this.arrSubscriptions.push(subscription);
  }

  private subscribeToPanelDefault(): void {
    const subscription = this.panelDefaultState$.subscribe(
      (state: IPanelDefaultState) => {
        if (state !== undefined) {
          if (state.isLoaded === false && !StateUtilities.hasErrors(state)) {
            this.store.dispatch(PANEL_DEFAULT_ACTIONS.LOAD_PANEL_DEFAULTS());
          } else {
            this.panelDefaultData = new PanelDefaultUIModel();
            Object.assign(this.panelDefaultData, state.panelDefaults);
          }
        }
      }
    );
    this.arrSubscriptions.push(subscription);
  }

  // Ge Panel Configuration
  postCallGetPanelConfigurationCommon(): void {
    if (this.panelConfigurationCommon && this.panelConfigurationCommon.Id > 0) {
      if (this.panelConfigurationCommon.PanelTypeId === PanelTypeList.INFORCE) {
        this.subscribeToInforceDevices();
      }
    }
  }

  private subscribeToInforceDevices(): void {
    const subscription = this.InforceDeviceState$.subscribe(
      (state: IInforceDeviceState) => {
        if (state !== undefined) {
          if (state.isLoaded === false && !StateUtilities.hasErrors(state)) {
            this.store.dispatch(INFORCE_DEVICES_ACTIONS.INFORCEDEVICES_LOAD());
          } else {
            this.inforceDevices = state.inforcedevices;
            this.initPanelSensors();
          }
        }
      }
    );
    this.arrSubscriptions.push(subscription);
  }

  initialiseUI(): void {
    this.hydraulicPressures = this.panelSensors.filter(c => c.CategoryName == "Hydraulic Power Unit");
    this.outputPressures = this.panelSensors.filter(c => c.CategoryName == "Output Pressures");

    if (this.panelSensors != null) {
      for (let j = 0; j < this.panelSensors.length; j++) {
        this.panelSensors[j].Sensor.RawValuePoint1Validation = 0;
        this.panelSensors[j].Sensor.RawValuePoint2Validation = 0;
        this.panelSensors[j].Sensor.ScaledValuePoint1Validation = 0;
        this.panelSensors[j].Sensor.ScaledValuePoint2Validation = 0;
      }
    }
    this.createDeviceIdAndIndexArray();
    this.subScribeToRealTimeData();
  }

  updateUI() {
    this.hydraulicPressureList = this.hydraulicPressures.map(item => {
      const { SensorName, Sensor } = item;
      const { RawValuePoint1, RawValuePoint2, ScaledValuePoint1, ScaledValuePoint2 } = Sensor;
      return {
        item,
        SensorName,
        RawValuePoint1,
        RawValuePoint2,
        ScaledValuePoint1,
        ScaledValuePoint2
      };
    });
    this.hydraulicErrorMessages = [];
    this.hydraulicPressureList.forEach(item => {
      this.hydraulicErrorMessages.push({
        RawValuePoint1: '',
        RawValuePoint2: '',
        ScaledValuePoint1: '',
        ScaledValuePoint2: '',
      });
    });

    // output presure list
    this.outputPressureList = this.outputPressures.map(item => {
      const { SensorName, Sensor } = item;
      const { RawValuePoint1, RawValuePoint2, ScaledValuePoint1, ScaledValuePoint2 } = Sensor;
      return {
        item,
        SensorName,
        RawValuePoint1,
        RawValuePoint2,
        ScaledValuePoint1,
        ScaledValuePoint2
      };
    });
    this.outputErrorMessages = [];
    this.outputPressureList.forEach(item => {
      this.outputErrorMessages.push({
        RawValuePoint1: '',
        RawValuePoint2: '',
        ScaledValuePoint1: '',
        ScaledValuePoint2: '',
      });
    });

    this.getreturnflowmeterValue();
    this.validateAllRows();
  }

  subScribeToRealTimeData() {
    this.dataSubscriptions = [];
    let deviceSubs = null;
    if (this.deviceIdIndexValue != undefined && this.deviceIdIndexValue != null) {
      this.deviceIdIndexValue.forEach(e => {
        deviceSubs = this.realTimeService.GetRealtimeData(e.deviceId, e.pointIndex).subscribe(d => {
          if (d != undefined && d != null) {
            e.match(d);
            if (!this.isDataChanged && !this.isInputFocused) // Don't update when in edit mode
              this.updateUI();
          }
        });
        this.dataSubscriptions.push(deviceSubs);
      });
    }
  }

  createDeviceIdAndIndexArray() {

    let strvalue: string = "";
    let HPUID = this.getHPUID();//to get output pressures
    let Module2542ID = this.getModule2542ID();//to get Hydraulic power unit value
    let FirstModuleE1240ID = this.getFirstModuleE1240ID();//to get first 8 raw output pressure values
    let SecondModuleE1240ID = this.getSecondModuleE1240ID();//to get first 9-16 raw output pressure values
    let ThirdModuleE1240ID = this.getThirdModuleE1240ID();//to get first 17-24 raw output pressure values
    let ModuleE1260ID = this.getModuleE1260ID();//to get temperature measurements value
    let ModuleFlowMeterID = this.getModuleFlowMeterID();//to get flowmeter
    this.deviceIdIndexValue = [];
    //hydralic power unit section
    this.deviceIdIndexValue.push(new DeviceIdIndexValue(Module2542ID, Module2542PointIndex.PumpDischargePressureRaw, null, ''));
    this.deviceIdIndexValue.push(new DeviceIdIndexValue(Module2542ID, Module2542PointIndex.SupplyPressureRaw, null, ''));
    this.deviceIdIndexValue.push(new DeviceIdIndexValue(Module2542ID, Module2542PointIndex.UnloadingCircuitPressure, null, '')); //raw values
    this.deviceIdIndexValue.push(new DeviceIdIndexValue(Module2542ID, Module2542PointIndex.ReserviourLevelRaw, null, '')); //raw values

    //output Pressures section raw value Indexes
    for (let i = 0; i < this.outputPressures.length; i++) {
      if (i < 8)
        this.deviceIdIndexValue.push(new DeviceIdIndexValue(FirstModuleE1240ID, i + 1, null, ''));
      else if (i >= 8 && i < 16)
        this.deviceIdIndexValue.push(new DeviceIdIndexValue(SecondModuleE1240ID, (i + 1) - 8, null, '')); //second module index should start from 1
      else
        this.deviceIdIndexValue.push(new DeviceIdIndexValue(ThirdModuleE1240ID, (i + 1) - 16, null, ''));//Third module index should start from 1
    }

    //return flow meter data acquation
    this.deviceIdIndexValue.push(new DeviceIdIndexValue(HPUID, HyrdraulicPowerUnitPointIndex.CommStatus, 1, ''));
    this.deviceIdIndexValue.push(new DeviceIdIndexValue(HPUID, HyrdraulicPowerUnitPointIndex.OperationExecutionInProgress, -999.0, ''));
    this.deviceIdIndexValue.push(new DeviceIdIndexValue(HPUID, HyrdraulicPowerUnitPointIndex.CurrentOperationMode, -999.0, ''));
    if (this.panelDefaultData) {
      let pointIndex = this.panelDefaultData.FlowMeterTransmitterType === FLOWMETER_TRASMITTER_TYPE.Fluidwell ? ModuleFlowMeterFluidWell.ConfigureKfactorIndex : ModuleFlowMeter.ConfigureKfactorIndex;
      this.deviceIdIndexValue.push(new DeviceIdIndexValue(ModuleFlowMeterID, pointIndex, null, ''));
      if(this.panelDefaultData.FlowMeterTransmitterType === FLOWMETER_TRASMITTER_TYPE.None)
        this.ShowKFactor = false;
      else
        this.ShowKFactor = true;
    }
  }

  getHPUID(): number {
    if (this.inforceDevices != null) {
      let inforceDevice: InforceDeviceDataModel = this.inforceDevices.find(c => c.DeviceName == "HPU");
      return inforceDevice.DeviceId;
    }
    else
      return 2;//need to be removed
  }
  getModule2542ID(): number {
    if (this.inforceDevices != null) {
      let inforceDevice: InforceDeviceDataModel = this.inforceDevices.find(c => c.DeviceName == "Module2542");
      return inforceDevice.DeviceId;
    }
    else
      return 3;//need to be removed
  }
  getFirstModuleE1240ID(): number {
    if (this.inforceDevices != null) {
      let ModuleE1240Devices: InforceDeviceDataModel[] = this.inforceDevices.filter(c => c.DeviceName == "ModuleE1240");
      return ModuleE1240Devices[0].DeviceId;
    }
    else
      return 6;//need to be removed
  }
  getSecondModuleE1240ID(): number {
    if (this.inforceDevices != null) {
      let ModuleE1240Devices: InforceDeviceDataModel[] = this.inforceDevices.filter(c => c.DeviceName == "ModuleE1240");
      return ModuleE1240Devices[1].DeviceId;
    }
    else
      return 7;//need to be removed
  }
  getThirdModuleE1240ID(): number {
    if (this.inforceDevices != null) {
      let ModuleE1240Devices: InforceDeviceDataModel[] = this.inforceDevices.filter(c => c.DeviceName == "ModuleE1240");
      return ModuleE1240Devices[2].DeviceId;
    }
    else
      return 8;//need to be removed
  }
  getModuleE1260ID(): number {
    if (this.inforceDevices != null) {
      let inforceDevice: InforceDeviceDataModel = this.inforceDevices.find(c => c.DeviceName == "ModuleE1260");
      return inforceDevice.DeviceId;
    }
    else
      return 9;//need to be removed
  }
  getModuleFlowMeterID(): number {
    if (this.inforceDevices != null && this.panelDefaultData) {
      let inforceDevice: InforceDeviceDataModel;
      if (this.panelDefaultData.FlowMeterTransmitterType === FLOWMETER_TRASMITTER_TYPE.Fluidwell) {
        inforceDevice = this.inforceDevices.find(c => c.DeviceName == "ModuleFlowMeterFluidWell");
      } else {
        inforceDevice = this.inforceDevices.find(c => c.DeviceName == "ModuleFlowMeter");
      }
      return inforceDevice?.DeviceId;
    }
    else
      return 10;//need to be removed
  }

  fillpanelSensorIndex(allpanelSensors: PanelSensor[]): void {

    let currValueIndex: number = 1;

    for (let i = 0; i < allpanelSensors.length; i++) {

      let currentPanelSensor = allpanelSensors[i];
      //round off panel sensors to 3 decimal places since afer save service is returning so many precesions
      currentPanelSensor.Sensor.RawValuePoint1 = Number(currentPanelSensor.Sensor.RawValuePoint1.toFixed(3));
      currentPanelSensor.Sensor.RawValuePoint2 = Number(currentPanelSensor.Sensor.RawValuePoint2.toFixed(3));
      currentPanelSensor.Sensor.ScaledValuePoint1 = Number(currentPanelSensor.Sensor.ScaledValuePoint1.toFixed(3));
      currentPanelSensor.Sensor.ScaledValuePoint2 = Number(currentPanelSensor.Sensor.ScaledValuePoint2.toFixed(3));

      //Additional Properties for UI
      currentPanelSensor.Id = i;//hard-Code

      if (currentPanelSensor.CategoryName == "Output Pressures") {
        currentPanelSensor.OutputSolenoidPointIndex = 24 + currValueIndex;
        currentPanelSensor.OutputPressurePointIndex = currValueIndex++;
      }
    }

  }

  public initPanelSensors() {
    const numberOfOutputs = (this.panelConfigurationCommon as InforcePanelUIModel).HydraulicOutputs || 6;
    let subsciption = this.sensorCalibrationService.getPanelSensors(numberOfOutputs).subscribe(panelSensors => {
      let data = panelSensors as PanelSensor[];
      if (data != null) {
        this.fillpanelSensorIndex(data);
      }
      this.panelSensors = data;
      this.savedPanelSensors = _.cloneDeep(this.panelSensors);
      this.initialiseUI();
    });
    this.arrSubscriptions.push(subsciption);
  }

  getDeviceIndexValue(index: number): number {
    if (this.deviceIdIndexValue != null && this.deviceIdIndexValue[index] != null) {
      return this.deviceIdIndexValue[index].value;
    }
  }

  getRawValue(panelSensor: PanelSensor): number {
    if (this.panelSensors != null) {
      let index: number;
      // this.getreturnflowmeterValue();
      this.getCommStatusPointValue();
      if (panelSensor.CategoryName == "Hydraulic Power Unit") {
        index = this.hydraulicPressures.findIndex(c => c == panelSensor);
      }
      else if (panelSensor.CategoryName == "Output Pressures") {
        index = this.outputPressures.findIndex(c => c == panelSensor);
        index = index + 4;//first 4 entries  are Hydraulic power units
      }

      return this.getDeviceIndexValue(index);
    }
  }

  getreturnflowmeterValue(): void {
    this.returnFlowmeterValue = this.returnFlowmeterDBValue;
    //last entry is return flowmeter.Update K-factor in UI when DB value changes
    if (this.deviceIdIndexValue[this.deviceIdIndexValue.length - 1]?.value != null) {
      this.returnFlowmeterValue = this.returnFlowmeterDBValue = this.deviceIdIndexValue[this.deviceIdIndexValue.length - 1].value;
      this.returnFlowmeterList = [
        { Name: 'Return Flowmeter (pulses/mL)', KFactor: this.returnFlowmeterValue }
      ];
      this.returnFlowmeterErrorMessages = [];
      this.returnFlowmeterList.forEach(item => {
        this.returnFlowmeterErrorMessages.push({
          KFactor: '',
        });
      });
      this.kFactorValidationValue = 0;
      this.returnsFlowMeterValidationMessage = null;
    }
  }

  validateKfactorRecord(editedValue: number): void {
    this.returnsFlowMeterValidationMessage = null;
    let value = Number(editedValue.toString().split(".")[0]);
    this.kFactorValidationValue = this.validateIntegerMinimumValue(value, 0) == true ? 0 : 2;
    if (this.kFactorValidationValue == 0) {
      if (this.deviceIdIndexValue[this.deviceIdIndexValue.length - 1].value != value) {
        this.kFactorValidationValue = 1;
      }
    }
    if (this.kFactorValidationValue == 2) {
      this.returnsFlowMeterValidationMessage = "Return Flowmeter" + ": Please enter a valid integer value.";
    }
  }

  //validates the integer with out any max value limites and returns the error message
  validateIntegerMinimumValue(integerValue: number, minValue: number): boolean {
    let bIsValid: boolean = true;

    if (integerValue == null || integerValue.toString().trim() == "" || isNaN(Number(integerValue.toString().trim())) || integerValue.toString().indexOf('.') != -1) {
      bIsValid = false;
    }
    if (integerValue == null || minValue == null
      || parseFloat(integerValue.toString()) < parseFloat(minValue.toString())) {
      bIsValid = false;
    }

    return bIsValid;
  }

  getCommStatusPointValue(): void {
    if (this.deviceIdIndexValue != null) {

      if (this.getDeviceIndexValue(this.deviceIdIndexValue.length - 4) == 0) {
        // this.router.navigate(["/Home"]);
      }
    }
  }

  getCalulatedScaledValue(panelSensor: PanelSensor): number {
    let a = ((panelSensor.Sensor.ScaledValuePoint2 - panelSensor.Sensor.ScaledValuePoint1) / (panelSensor.Sensor.RawValuePoint2 - panelSensor.Sensor.RawValuePoint1));
    let b = (panelSensor.Sensor.ScaledValuePoint2 - a * panelSensor.Sensor.RawValuePoint2);
    return this.getRawValue(panelSensor) * a + b;
  }

  validateHydraulicRow(index: number, field: string) {
    const rowData = this.hydraulicPressureList[index];
    const errorObj = this.hydraulicErrorMessages[index];

    errorObj[field] = '';

    if (field === 'RawValuePoint1') {
      if (rowData.RawValuePoint1 === '') {
        errorObj.RawValuePoint1 = errorObj.RawValuePoint1 || rowData.SensorName + ": Please enter a valid Raw₀ value.";
      }
    }

    if (field === 'RawValuePoint2') {
      if (rowData.RawValuePoint2 === '') {
        errorObj.RawValuePoint2 = errorObj.RawValuePoint2 || rowData.SensorName + ": Please enter a valid Raw₁ value.";
      }
    }

    if (field === 'ScaledValuePoint1') {
      if (rowData.ScaledValuePoint1 === '') {
        errorObj.ScaledValuePoint1 = errorObj.ScaledValuePoint1 || rowData.SensorName + ": Please enter a valid Scaled₀ value.";
      }
    }

    if (field === 'ScaledValuePoint2') {
      if (rowData.ScaledValuePoint2 === '') {
        errorObj.ScaledValuePoint2 = errorObj.ScaledValuePoint2 || rowData.SensorName + ": Please enter a valid Scaled₁ value.";
      }
    }

    this.isHydraulicTableValid = this.hydraulicErrorMessages.every(error => Object.values(error).every(value => value === ''));
  }

  onHydraulicValueChange(index, field, event) {
    this.hydraulicPressureList[index][field] = event.target.value;
    const fields = ['RawValuePoint1', 'RawValuePoint2', 'ScaledValuePoint1', 'ScaledValuePoint2'];
    if (fields.includes(field)) {
      this.hydraulicPressures[index].Sensor[field] = event.target.value;
    }
    this.validateAllRows();
  }

  validateOutputRow(index: number, field: string) {
    const rowData = this.outputPressureList[index];
    const errorObj = this.outputErrorMessages[index];

    errorObj[field] = '';

    if (field === 'RawValuePoint1') {
      if (rowData.RawValuePoint1 === '') {
        errorObj.RawValuePoint1 = errorObj.RawValuePoint1 || rowData.SensorName + ": Please enter a valid Raw₀ value.";
      }
    }

    if (field === 'RawValuePoint2') {
      if (rowData.RawValuePoint2 === '') {
        errorObj.RawValuePoint2 = errorObj.RawValuePoint2 || rowData.SensorName + ": Please enter a valid Raw₁ value.";
      }
    }

    if (field === 'ScaledValuePoint1') {
      if (rowData.ScaledValuePoint1 === '') {
        errorObj.ScaledValuePoint1 = errorObj.ScaledValuePoint1 || rowData.SensorName + ": Please enter a valid Scaled₀ value.";
      }
    }

    if (field === 'ScaledValuePoint2') {
      if (rowData.ScaledValuePoint2 === '') {
        errorObj.ScaledValuePoint2 = errorObj.ScaledValuePoint2 || rowData.SensorName + ": Please enter a valid Scaled₁ value.";
      }
    }

    this.isOutputTableValid = this.outputErrorMessages.every(error => Object.values(error).every(value => value === ''));
  }

  onOutputValueChange(index, field, event) {
    this.outputPressureList[index][field] = event.target.value;
    const fields = ['RawValuePoint1', 'RawValuePoint2', 'ScaledValuePoint1', 'ScaledValuePoint2'];
    if (fields.includes(field)) {
      this.outputPressures[index].Sensor[field] = event.target.value;
    }
    this.validateAllRows();
  }

  validateReturnFlowRow(index: number, field: string) {
    const rowData = this.returnFlowmeterList[index];
    const errorObj = this.returnFlowmeterErrorMessages[index];

    errorObj[field] = '';

    if (field === 'KFactor') {
      let value = Number(rowData.KFactor.toString().split(".")[0]);
      if (!this.validateIntegerMinimumValue(value, 0)) {
        errorObj.KFactor = errorObj.KFactor || 'Please enter a valid integer value';
      }
    }

    this.isReturnFlowmeterValid = this.returnFlowmeterErrorMessages.every(error => Object.values(error).every(value => value === ''));
  }

  onReturnFlowValueChange(index, field, event) {
    this.returnFlowmeterList[index][field] = event.target.value;
    const fields = ['KFactor'];
    if (fields.includes(field)) {
      this.returnFlowmeterValue = event.target.value;
    }
    this.validateAllRows();
  }

  validateAllRows() {
    for (let i = 0; i < this.hydraulicPressureList.length; i++) {
      const fields = ['RawValuePoint1', 'RawValuePoint2', 'ScaledValuePoint1', 'ScaledValuePoint2'];
      for (let field of fields) {
        this.validateHydraulicRow(i, field);
      }
    }
    for (let i = 0; i < this.outputPressureList.length; i++) {
      const fields = ['RawValuePoint1', 'RawValuePoint2', 'ScaledValuePoint1', 'ScaledValuePoint2'];
      for (let field of fields) {
        this.validateOutputRow(i, field);
      }
    }
    for (let i = 0; i < this.returnFlowmeterList.length; i++) {
      const fields = ['KFactor'];
      for (let field of fields) {
        this.validateReturnFlowRow(i, field);
      }
    }

    this.isDataChanged = false;
    for (let item of this.panelSensors) {
      const originalItem = this.savedPanelSensors.find(savedItem => savedItem.SensorName === item.SensorName);
      const fields = ['RawValuePoint1', 'RawValuePoint2', 'ScaledValuePoint1', 'ScaledValuePoint2'];
      for (let field of fields) {
        if (originalItem.Sensor[field] != item.Sensor[field]) {
          this.isDataChanged = true;
          break;
        }
      }
      if (this.isDataChanged) {
        break;
      }
    }

    if (this.returnFlowmeterDBValue != this.returnFlowmeterValue) {
      this.isDataChanged = true;
    }
  }

  discardChanges(): void {
    this.isDataChanged = false;
    this.reloadPanelSensors();
  }

  acceptChanges(): void {
    if (this.isReturnFlowmeterValid && this.isHydraulicTableValid && this.isOutputTableValid) {
      const observables: Observable<any>[] = [];
      if (this.returnFlowmeterValue != this.returnFlowmeterDBValue && this.panelDefaultData) {
        const isFluidWell = this.panelDefaultData.FlowMeterTransmitterType === FLOWMETER_TRASMITTER_TYPE.Fluidwell;
        let writeVar = new WriteToServerDataModel();
        writeVar.DeviceId = this.getModuleFlowMeterID();
        writeVar.PointIndex = isFluidWell ? ModuleFlowMeterFluidWell.ConfigureKfactorIndex : ModuleFlowMeter.ConfigureKfactorIndex;
        writeVar.PointName = isFluidWell ? ModuleFlowMeterFluidWell.ConfigureKfactorName : ModuleFlowMeter.ConfigureKfactorName;
        writeVar.Value = this.returnFlowmeterValue;
        writeVar.WriteToServerCommandEnum = 1;
        // writeVar.Unit = Unit;
        observables.push(this.configurationService.WriteToServer(writeVar));

        if (isFluidWell) {
          let writeVar = new WriteToServerDataModel();
          writeVar.DeviceId = this.getModuleFlowMeterID();
          writeVar.PointIndex = ModuleFlowMeterFluidWell.ConfigureKfactorRateIndex;
          writeVar.PointName = ModuleFlowMeterFluidWell.ConfigureKfactorRateName;
          writeVar.Value = this.returnFlowmeterValue;
          writeVar.WriteToServerCommandEnum = 1;
          // writeVar.Unit = Unit;
          observables.push(this.configurationService.WriteToServer(writeVar));
        }
      }
      let recordsToSave = this.panelSensors.filter(c => {
        const originalItem = this.savedPanelSensors.find(savedItem => savedItem.SensorName === c.SensorName);
        return originalItem && c.CategoryName != "Temperature Measurements" &&
          c.Sensor.RawValuePoint1 != originalItem.Sensor.RawValuePoint1 || c.Sensor.RawValuePoint2 != originalItem.Sensor.RawValuePoint2
          || c.Sensor.ScaledValuePoint1 != originalItem.Sensor.ScaledValuePoint1 || c.Sensor.ScaledValuePoint2 != originalItem.Sensor.ScaledValuePoint2;
      });

      if (recordsToSave != null && recordsToSave.length > 0) {
        let recordstoDB: DataPointLinearScaleConversionModel[] = [];
        for (let i = 0; i < recordsToSave.length; i++) {
          recordstoDB.push(recordsToSave[i].Sensor);
          recordsToSave[i].Sensor.RawValuePoint1Validation = 0;
          recordsToSave[i].Sensor.RawValuePoint2Validation = 0;
          recordsToSave[i].Sensor.ScaledValuePoint1Validation = 0;
          recordsToSave[i].Sensor.ScaledValuePoint2Validation = 0;
        }
        observables.push(this.sensorCalibrationService.updatePanelSensors(<DataPointLinearScaleConversionModel[]>(recordstoDB)));
      }

      if (observables.length > 0) {
        forkJoin(observables).subscribe((resArr) => {
          this.isDataChanged = false;
          this.realTimeService.NotifyOthersForSensorCalibrationUpdateEvent();
          this.reloadPanelSensors();
        })
      }
    }
  }

  reloadPanelSensors(): void {
    this.initPanelSensors();
  }

  UnSubscribePointSubscriptions(): void {
    if (this.dataSubscriptions != null) {
      this.dataSubscriptions.forEach(sb => {
        if (sb != null)
          sb.unsubscribe();
      });

      this.dataSubscriptions = [];
    }
  }

  unsubscribeArrSubscriptions(): void {
    if (this.arrSubscriptions != null && this.arrSubscriptions.length > 0) {
      this.arrSubscriptions.forEach(subscription => {
        if (subscription != null)
          subscription.unsubscribe();
      });
    }

    this.arrSubscriptions = [];
  }

  ngOnInit(): void {
    this.initPanelConfiguration();
    this.subscribeToPanelDefault();
    this.validateAllRows();
  }

  ngOnDestroy(): void {
    this.UnSubscribePointSubscriptions();
    this.unsubscribeArrSubscriptions();
  }

  // Import Configuration
  RestoreSensorCalibration(): void {
    const browseFileDialogComponentData: BrowseFileDialogComponentData = {
      Title: 'Restore Sensor Calibration',
      ForImportFile: true, // if this dialog is for export file, set it to false.
      FileExtensions: '.dat', // set the file extension for file selection filter
      SelectedFileName: '', // returned file name
      SelectedFile: {}, // return file object
      PrimaryBtnText: "Import"
    };

    this.gatewayModalService.openBrowseFileDialog(
      browseFileDialogComponentData
    );
    this.gatewayModalService.confirmed().subscribe((result) => {
      if (result) {
        this.ImportConfiguration(result.SelectedFile);
      }
    });
  }

  importedData: SensorCalibrationExport;
  public ImportConfiguration(file: any): Promise<boolean> {
    const reader = new FileReader();
    reader.readAsText(file);

    return new Promise((resolve, reject) => {
      reader.onloadend = () => {
        const configObjectString = reader.result as string;
        this.importedData = JSON.parse(configObjectString);

        this.importsensorCalibration();

        resolve(true);
      };

      reader.onerror = () => {
        console.log("Error while reading configration file...");
        resolve(false);
      }
    });
  }

  importsensorCalibration() {
    if (this.importedData.SerialNumber.toLocaleLowerCase().trim() != (this.panelConfigurationCommon as InforcePanelUIModel).SerialNumber.toLocaleLowerCase().trim()
      || this.importedData.NumberOfOutputs != (this.panelConfigurationCommon as InforcePanelUIModel).HydraulicOutputs
    ) {
      this.confirmImport();
      return;
    }
    else {
      this.fillUICollections();
    }
  }

  confirmImport() {
    const confirmMsg = 'You are restoring the sensor calibration settings file from a different InForce panel!' + '\n\n' +
      'Are you sure that you want to do this?';

    this.gatewayModalService.openDialog(
      confirmMsg,
      () => {
        this.fillUICollections();
        this.gatewayModalService.closeModal();
      },
      null,
      'Warning',
      null,
      null,
      null,
      null,
      '440px'
    );
  }

  fillUICollections() {
    for (let i = 0; i < this.importedData.HPU.length; i++) {
      let record = this.hydraulicPressures.find(c => c.SensorName == this.importedData.HPU[i].SensorName)
      if (record != null) {
        record.Sensor.RawValuePoint1 = this.importedData.HPU[i].Raw0;
        record.Sensor.RawValuePoint2 = this.importedData.HPU[i].Raw1;
        record.Sensor.ScaledValuePoint1 = this.importedData.HPU[i].Scaled0;
        record.Sensor.ScaledValuePoint2 = this.importedData.HPU[i].Scaled1;
      }
    }
    this.hydraulicPressureList = this.hydraulicPressures.map(item => {
      const { SensorName, Sensor } = item;
      const { RawValuePoint1, RawValuePoint2, ScaledValuePoint1, ScaledValuePoint2 } = Sensor;
      return {
        item,
        SensorName,
        RawValuePoint1,
        RawValuePoint2,
        ScaledValuePoint1,
        ScaledValuePoint2,
      };
    });
    for (let i = 0; i < this.importedData.OutputPressures.length; i++) {
      let record = this.outputPressures.find(c => c.SensorName == this.importedData.OutputPressures[i].SensorName)
      if (record != null) {
        record.Sensor.RawValuePoint1 = this.importedData.OutputPressures[i].Raw0;
        record.Sensor.RawValuePoint2 = this.importedData.OutputPressures[i].Raw1;
        record.Sensor.ScaledValuePoint1 = this.importedData.OutputPressures[i].Scaled0;
        record.Sensor.ScaledValuePoint2 = this.importedData.OutputPressures[i].Scaled1;
      }
    }
    this.outputPressureList = this.outputPressures.map(item => {
      const { SensorName, Sensor } = item;
      const { RawValuePoint1, RawValuePoint2, ScaledValuePoint1, ScaledValuePoint2 } = Sensor;
      return {
        item,
        SensorName,
        RawValuePoint1,
        RawValuePoint2,
        ScaledValuePoint1,
        ScaledValuePoint2,
      };
    });
    this.returnFlowmeterValue = this.importedData.KFactor;
    this.returnFlowmeterList = [
      { Name: 'Return Flowmeter(pulses/mL)', KFactor: this.returnFlowmeterValue }
    ];
    this.validateAllRows();
  }

  // Backup Sensor Calibration
  BackupSensorCalibration(): void {
    const browseFileDialogComponentData: BrowseFileDialogComponentData = {
      Title: 'Backup Sensor Calibration',
      ForImportFile: false, // if this dialog is for export file, set it to false.
      FileExtensions: '*.dat', // set the file extension for file selection filter
      SelectedFileName: 'InForcePanel_SensorCalibration', // returned file name
      SelectedFile: {}, // return file object
      IsConfigDirty: false,
      PrimaryBtnText: "Backup"
    };

    this.gatewayModalService.openBrowseFileDialog(
      browseFileDialogComponentData
    );
    this.gatewayModalService.confirmed().subscribe((result) => {
      if (result) {
        this.configurationService.getBuildNumber().subscribe((buildNumber) => {
          this.exportDatFile(result.SelectedFileName, buildNumber);
        });
      }
    });
  }

  exportDatFile(datFileName, buildNumber): void {
    let sensorsExport = new SensorCalibrationExport();
    sensorsExport.VersionNumber = buildNumber;
    sensorsExport.SerialNumber = (this.panelConfigurationCommon as InforcePanelUIModel).SerialNumber;
    sensorsExport.NumberOfOutputs = (this.panelConfigurationCommon as InforcePanelUIModel).HydraulicOutputs || 6;
    sensorsExport.HPU = [];
    sensorsExport.OutputPressures = [];
    sensorsExport.KFactor = this.returnFlowmeterValue;
    for (let i = 0; i < this.hydraulicPressures.length; i++) {
      let record = new SensorCalibrationExportRecord();
      record.SensorName = this.hydraulicPressures[i].SensorName;
      record.Raw0 = this.hydraulicPressures[i].Sensor.RawValuePoint1;
      record.Raw1 = this.hydraulicPressures[i].Sensor.RawValuePoint2;
      record.Scaled0 = this.hydraulicPressures[i].Sensor.ScaledValuePoint1;
      record.Scaled1 = this.hydraulicPressures[i].Sensor.ScaledValuePoint2;
      sensorsExport.HPU.push(record);
    }
    for (let j = 0; j < this.outputPressures.length; j++) {
      let record = new SensorCalibrationExportRecord();
      record.SensorName = this.outputPressures[j].SensorName;
      record.Raw0 = this.outputPressures[j].Sensor.RawValuePoint1;
      record.Raw1 = this.outputPressures[j].Sensor.RawValuePoint2;
      record.Scaled0 = this.outputPressures[j].Sensor.ScaledValuePoint1;
      record.Scaled1 = this.outputPressures[j].Sensor.ScaledValuePoint2;
      sensorsExport.OutputPressures.push(record);
    }
    const datFileArray = JSON.stringify(sensorsExport);
    var blob = new Blob([datFileArray]);
    if ((window.navigator as any).msSaveOrOpenBlob) {
      (window.navigator as any).msSaveBlob(blob, datFileName);
    }
    else {
      const data = window.URL.createObjectURL(blob);
      var link = document.createElement('a');
      link.setAttribute('href', data);
      link.setAttribute('download', datFileName);
      link.click();
    }
  }

}
