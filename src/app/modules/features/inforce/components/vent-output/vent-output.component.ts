import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { selectAllWells, selectWellState } from '@store/reducers/well.entity.reducer';
import { IWellEntityState } from '@store/state/well.state';
import { Observable, Subscription } from 'rxjs';
import * as WELL_ACTIONS from '@store/actions/well.entity.action';
import * as PANELCONFIG_COMMON_ACTIONS from '@store/actions/panelConfigurationCommon.action';
import * as INFORCE_DEVICES_ACTIONS from '@store/actions/inforcedevices.action';
import * as _ from 'lodash';
import { InforceWellUIModel } from '@core/models/UIModels/InforceWell.model';
import { InFORCEWellDataUIModel } from '@core/models/webModels/WellDataUIModel.model';
import { WellShiftRecord, WellZoneShiftRecord } from '@core/models/UIModels/WellShiftRecord.model';
import { INFORCE_WELL_ARCHITECTURE } from '@core/services/well.service';
import { ExecutionMode, HyrdraulicPowerUnitPointIndex, InforceWellDevicePointIndex, OperationMode, OutputPressureSensors, OutputSensorDetail } from '@features/inforce/common/InForceModbusRegisterIndex';
import { InFORCEZoneDataUIModel } from '@core/models/webModels/ZoneDataUIModel.model';
import { DeviceIdIndexValue } from '@core/models/webModels/PointTemplate.model';
import { RealTimeDataSignalRService } from '@core/services/realTimeDataSignalR.service';
import { InforceDeviceDataModel } from '@core/models/webModels/InforceDeviceData.model';
import { IInforceDeviceState } from '@store/state/inforcedevices.state';
import { StateUtilities } from '@store/state/IState';
import { PanelConfigurationCommonModel } from '@core/models/webModels/PanelConfigurationCommon.model';
import { IPanelConfigurationCommonState } from '@store/state/panelConfigurationCommon.state';
import { InforcePanelUIModel } from '@core/models/UIModels/inforce-panel-config-common.model';
import { ButtonActions } from '@shared/gateway-dialogs/components/gateway-advanced-dialog/gateway-advanced-dialog.component';
import { ConfirmVentDialogComponent, IConfirmVentDialogData } from './confirm-vent-dialog/confirm-vent-dialog.component';
import { ConfigurationService } from '@core/services/configurationService.service';
import { WriteToServerDataModel } from '@core/models/webModels/WriteToServerData.model';
import { AlarmService } from '@core/services/alarm.service';
import { IDeviceDataPoints } from '@store/state/deviceDataPoints.state';
import { DataPointDefinitionModel } from '@core/models/webModels/DataPointDefinition.model';
import * as DEVICEPOINTS_ACTIONS from '@store/actions/deviceDataPoints.action';
@Component({
  selector: 'app-vent-output',
  templateUrl: './vent-output.component.html',
  styleUrls: ['./vent-output.component.scss']
})
export class VentOutputComponent implements OnInit, OnDestroy {

  IsMobileView: boolean = false;
  public static CurrentExecutionMode: ExecutionMode = ExecutionMode.NoExecution;
  displayedColumns: string[] = ['panelLine', 'downholeLine', 'state', 'pressure'];
  toolboxRoute: string = "/inforce/toolbox";
  wellState$: Observable<IWellEntityState>;
  // Store Entity objects
  wellEntity: InFORCEWellDataUIModel[];
  activeTabIndex = 0;
  public currentWell: WellShiftRecord;
  public SelectedWell: WellShiftRecord;
  private dataSubscriptions: Subscription[] = [];
  wellRecords: WellShiftRecord[] = [];
  allVents: WellZoneShiftRecord[] = []; // all panel lines
  public paneloutputSensors: OutputSensorDetail[];
  public deviceIdIndexValue: DeviceIdIndexValue[] = []; // contains device id/pointindex/value for the HTML page
  public deviceIdTEMP: number;
  public IsToVentAllWellsUI: boolean = false;
  public currenVentAllLineCountDownInSeconds: number = 0;
  public ventAllLineCountDownInSecondsFirstValue: number;
  public operationExecutionInProgressPointValue: number;
  public fatalCriticalcountOfAlarms: number = 0;
  
  private panelConfigurationCommon: PanelConfigurationCommonModel = null;
  private inforceDevices: InforceDeviceDataModel[] = null;
  
  private panelConfigurationCommonState$: Observable<IPanelConfigurationCommonState>;
  private InforceDeviceState$: Observable<IInforceDeviceState>;
  showMaintenenceMode: boolean = false;
  private deviceDataPointsModels$: Observable<IDeviceDataPoints>;
  datapointdefinitions: DataPointDefinitionModel[] = [];
  PressureUnit:string="";
  constructor(protected store: Store<{
      wellState: IWellEntityState;
      panelConfigCommonState: IPanelConfigurationCommonState;
      inforcedevicesState: IInforceDeviceState;
    }>,
    private gatewayModalService: GatewayModalService,
    private realTimeService: RealTimeDataSignalRService,
    private alarmService: AlarmService,
    private configurationService: ConfigurationService
  ) {
    this.wellState$ = this.store.select<any>(
      (state: any) => state.wellState
    );
    this.deviceDataPointsModels$ = this.store.select<any>(
      (state: any) => state.deviceDataPointsState
    );
    this.panelConfigurationCommonState$ = this.store.select<IPanelConfigurationCommonState>((state: any) => state.panelConfigCommonState);
    this.InforceDeviceState$ = this.store.select<IInforceDeviceState>((state: any) => state.inforcedevicesState);
  }

  
  @HostListener("window:resize", [])
  public onResize() {
    this.detectScreenSize();
  }

  ngAfterViewInit(): void {
    this.detectScreenSize();
  }

  resizeTimer = null;
  private detectScreenSize() {
    if (this.resizeTimer) clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      this.IsMobileView = window.innerWidth < 950 ? true : false;
    }, 300);
  }

  isEllipsisActive(value) {
    return Math.ceil(value.getBoundingClientRect().width) < value.scrollWidth;
  }

  private subscribeToWellEntityStore() {
    let wellSubscription = this.store.select<any>(selectWellState).subscribe((state: IWellEntityState) => {
      if (state && !state.isLoaded) {
        this.store.dispatch(WELL_ACTIONS.WELL_LOAD());
      }
      else {
        let wellDataSubscription = this.store.select<any>(selectAllWells).subscribe(wells => {
          this.wellEntity = _.cloneDeep(wells);
          this.initPanelConfiguration();
        });
        this.dataSubscriptions.push(wellDataSubscription);
      }
    });
    this.dataSubscriptions.push(wellSubscription);
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
              const numberOfOutputs = (this.panelConfigurationCommon as InforcePanelUIModel).HydraulicOutputs;
              this.paneloutputSensors = OutputPressureSensors.slice(0, numberOfOutputs);
              this.subscribeToInforceDevices();
            }
          }
        }
      }
    );
    this.dataSubscriptions.push(subscription);
  }

  private subscribeToInforceDevices(): void {
    const subscription = this.InforceDeviceState$.subscribe(
      (state: IInforceDeviceState) => {
        if (state !== undefined) {
          if (state.isLoaded === false && !StateUtilities.hasErrors(state)) {
            this.store.dispatch(INFORCE_DEVICES_ACTIONS.INFORCEDEVICES_LOAD());
          } else {
            this.inforceDevices = state.inforcedevices;
            this.fillWellRecords();
            this.fillAllVents();
            // this.getShiftTotalVentTime();
            this.currentWell = null;
          }
        }
      }
    );
    this.dataSubscriptions.push(subscription);
  }

  fillWellRecords(): void {
    let index: number = 0;
    try {
      this.wellRecords= [];
        if (this.wellEntity != null && this.wellEntity.length > 0) {
            for (let i = 0; i < this.wellEntity.length; i++) {
                if ((this.wellEntity[i].ControlArchitectureId == INFORCE_WELL_ARCHITECTURE.N_PlUS_ONE || this.wellEntity[i].ControlArchitectureId == INFORCE_WELL_ARCHITECTURE.TWO_N) && this.wellEntity[i].WellDeviceId > 0) {

                    let well = this.wellEntity[i];

                    let record: WellShiftRecord = {
                        wellId: index,
                        wellName: well.WellName,
                        wellZoneShiftRecords: [],
                        HcmId: well.WellId,
                        wellDeviceId: well.WellDeviceId,
                        controlArchitectureId: well.ControlArchitectureId,
                        tools: null,
                    }

                    if (well.Zones != null) {

                        if (INFORCE_WELL_ARCHITECTURE.N_PlUS_ONE == well.ControlArchitectureId) {
                            let firstNonMonitoringZone: InFORCEZoneDataUIModel;

                            for (let a = 0; a < well.Zones.length; a++) {

                                if (well.Zones[a].LineToZoneMapping != null) {

                                    if (well.Zones[a].ValveType != 0 && firstNonMonitoringZone == null) {
                                        firstNonMonitoringZone = well.Zones[a];
                                    }
                                }
                            }

                            if (firstNonMonitoringZone != null) {

                                if (firstNonMonitoringZone.LineToZoneMapping != null) {

                                    let currPanelSensor: OutputSensorDetail = null;
                                    let valvePostions: string[] = [];
                                    let NonMonitoringZoneIdentified: boolean = false;

                                    for (let s = 0; s < firstNonMonitoringZone.ValvePositionsAndReturns.length; s++) {
                                        valvePostions.push(firstNonMonitoringZone.ValvePositionsAndReturns[s].Description);
                                    }

                                    for (let s = 0; s < well.PanelToLineMappings.length; s++) {
                                        if (well.PanelToLineMappings[s].DownholeLine == firstNonMonitoringZone.LineToZoneMapping.CloseLine) {//Show Common Close Line only for N+1 well
                                            if (this.paneloutputSensors.find(ps => ps.SensorName == well.PanelToLineMappings[s].PanelConnection) != null) {
                                                currPanelSensor = this.paneloutputSensors.find(ps => ps.SensorName == well.PanelToLineMappings[s].PanelConnection);
                                            }
                                        }
                                    }

                                    this.fillWellZoneShiftRecordsWithSensor(record, currPanelSensor, firstNonMonitoringZone, valvePostions, firstNonMonitoringZone.LineToZoneMapping.CloseLine);
                                }
                            }
                        }

                        for (let k = 0; k < well.Zones.length; k++) {
                            if (well.Zones[k].ValveType != 0) {
                                if (well.Zones[k].LineToZoneMapping != null) {
                                    let currPanelSensor: OutputSensorDetail = null;
                                    let valvePostions: string[] = [];

                                    for (let s = 0; s < well.Zones[k].ValvePositionsAndReturns.length; s++) {
                                        valvePostions.push(well.Zones[k].ValvePositionsAndReturns[s].Description);
                                    }

                                    for (let s = 0; s < well.PanelToLineMappings.length; s++) {
                                        if (well.PanelToLineMappings[s].DownholeLine == well.Zones[k].LineToZoneMapping.OpenLine) {//Show all the OPEN Line for both 2N and N+1 well
                                            if (this.paneloutputSensors.find(ps => ps.SensorName == well.PanelToLineMappings[s].PanelConnection) != null) {
                                                currPanelSensor = this.paneloutputSensors.find(ps => ps.SensorName == well.PanelToLineMappings[s].PanelConnection);
                                                this.fillWellZoneShiftRecordsWithSensor(record, currPanelSensor, well.Zones[k], valvePostions, well.Zones[k].LineToZoneMapping.OpenLine);
                                            }
                                        }
                                        if (INFORCE_WELL_ARCHITECTURE.TWO_N == well.ControlArchitectureId) {//Show all the Close Line for 2N well
                                            if (well.PanelToLineMappings[s].DownholeLine == well.Zones[k].LineToZoneMapping.CloseLine) {
                                                if (this.paneloutputSensors.find(ps => ps.SensorName == well.PanelToLineMappings[s].PanelConnection) != null) {
                                                    currPanelSensor = this.paneloutputSensors.find(ps => ps.SensorName == well.PanelToLineMappings[s].PanelConnection);
                                                    this.fillWellZoneShiftRecordsWithSensor(record, currPanelSensor, well.Zones[k], valvePostions, well.Zones[k].LineToZoneMapping.CloseLine);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    this.wellRecords.push(record);
                    index = index + 1;
                }
            }
        }
    }
    catch (e) {
    }

    this.createDeviceIdAndIndexArray(this.wellRecords);
    this.subScribeToRealTimeData();
  }

  fillWellZoneShiftRecordsWithSensor(wellShiftRecord: WellShiftRecord, outputSensor: OutputSensorDetail, wellZone: InFORCEZoneDataUIModel, valvePostions: string[], downholeLine: string) {
    wellShiftRecord.wellZoneShiftRecords.push({
        zoneId: wellZone.ZoneId,
        zoneName: wellZone.ZoneName,
        downholeLine: downholeLine,
        panelLine: outputSensor.SensorName,
        isVentMode: false,
        currentPositionUnknownFlag: 0,
        outputPressureIndex: outputSensor.OutputPressurePointIndex,
        outputSolenoidIndex: outputSensor.OutputSolenoidPointIndex,
        currentDownholePositionId: wellZone.CurrentPosition,
        currentDownholePosition: wellZone.ValvePositionsAndReturns.find(c => c.ToPosition == wellZone.CurrentPosition).Description,//popup
        targetDownholePosition: wellZone.ValvePositionsAndReturns.find(c => c.ToPosition == wellZone.CurrentPosition).Description,//popup
        targetDownholePositionId: null,
        isFullShift: null,
        valvepositionsDropDownValues: valvePostions,
        shiftStatus: null,
        isCommonClose: false,
        outputPressure: 0,
        zoneIndex: outputSensor.OutputPressurePointIndex - 1,
        openLineIndexId: -1,
        HcmId: wellZone.HcmId,
        ValvePositionsAndReturns: null,
        previousCurrentPosition: null,
        isResetInProgress:false
    })
  }

  fillAllVents(): void {
    for (let s = 0; s < this.paneloutputSensors.length; s++) {
        let zone = null;
        for (let w = 0; w < this.wellRecords.length; w++) {
            zone = this.wellRecords[w].wellZoneShiftRecords.find(c => c.panelLine == this.paneloutputSensors[s].SensorName);
            if (zone != null)
                break;
        }
        this.allVents.push({
            zoneId: null,
            zoneName: null,
            downholeLine: zone == null ? "Unassigned" : zone.downholeLine,
            panelLine: this.paneloutputSensors[s].SensorName,
            isVentMode: false,
            currentPositionUnknownFlag: 0,
            outputPressureIndex: this.paneloutputSensors[s].OutputPressurePointIndex,
            outputSolenoidIndex: this.paneloutputSensors[s].OutputSolenoidPointIndex,
            currentDownholePositionId: null,
            currentDownholePosition: null,
            targetDownholePosition: null,
            targetDownholePositionId: null,
            isFullShift: null,
            valvepositionsDropDownValues: null,
            shiftStatus: zone == null ? null : "Vented",
            isCommonClose: false,
            outputPressure: 0,
            zoneIndex: this.paneloutputSensors[s].OutputPressurePointIndex - 1,
            openLineIndexId: -1,
            HcmId: -1,
            ValvePositionsAndReturns: null,
            previousCurrentPosition: null,
            isResetInProgress:false
        })
    }
  }

  // for realtime data
  subScribeToRealTimeData() {
    this.dataSubscriptions = [];
    let deviceSubs = null;
    if (this.deviceIdIndexValue != undefined && this.deviceIdIndexValue != null) {
        this.deviceIdIndexValue.forEach(e => {
            deviceSubs = this.realTimeService.GetRealtimeData(e.deviceId, e.pointIndex).subscribe(d=>{
                if (d != undefined && d != null) {
                  // time related 
                  // if (e.pointIndex === HyrdraulicPowerUnitPointIndex.VentAllLineCountDownInSeconds) {
                  //   console.log(d);
                  // }
                  e.match(d);
                }
            });
            this.dataSubscriptions.push(deviceSubs);
        });
    }
  }

  private subscribeToDeviceDataPoints() {
    
    let devicePointSubscription = this.deviceDataPointsModels$.subscribe((state: IDeviceDataPoints) => {
      if (state) {
        if (!state.isLoaded) {
          this.store.dispatch(DEVICEPOINTS_ACTIONS.LOAD_DEVICES());
          this.store.dispatch(DEVICEPOINTS_ACTIONS.LOAD_DATAPOINTDEF());
        }
        
        if (state.datapointdefinitions.length) {
          this.datapointdefinitions = state.datapointdefinitions;
        }
      }
    });
    this.dataSubscriptions.push(devicePointSubscription);
  }

  private getUnitofDeviceDataPoint(deviceId, pointIndex) {
    if (this.datapointdefinitions) {
      let unit = this.datapointdefinitions.find(dataPoint => dataPoint.DeviceId == deviceId && dataPoint.DataPointIndex == pointIndex)?.UnitSymbol;
      return unit ? unit : "";
    }
    return "";
  }

  private subscribeToFatalCriticalAlarmsCount() {
    const subscription = this.alarmService.subscribeToFatalCriticalAlarmsCount().subscribe(count => {
      this.fatalCriticalcountOfAlarms = count;
    });
    this.dataSubscriptions.push(subscription);
  }

  createDeviceIdAndIndexArray(wellShiftRecord: WellShiftRecord[]) {
    let strvalue: string = "";
    this.deviceIdTEMP = this.getHPUID();
    this.deviceIdIndexValue = [];
    //all output lines are queried in this screens since we need it to show in vent all outputs table
    for (let s = 0; s < this.paneloutputSensors.length; s++) {
        this.deviceIdIndexValue.push(new DeviceIdIndexValue(this.deviceIdTEMP, this.paneloutputSensors[s].OutputPressurePointIndex, null, ''));
    }
    for (let s = 1; s <= this.paneloutputSensors.length; s++) { // vent state index for all output lines
        this.deviceIdIndexValue.push(new DeviceIdIndexValue(this.deviceIdTEMP, 24 + s, null, ''));
    }

    this.deviceIdIndexValue.push(new DeviceIdIndexValue(this.deviceIdTEMP, HyrdraulicPowerUnitPointIndex.SystemAlarmStatusWord, -999.0, ''));
    this.deviceIdIndexValue.push(new DeviceIdIndexValue(this.deviceIdTEMP, HyrdraulicPowerUnitPointIndex.OperationExecutionInProgress, -999.0, ''));
    this.deviceIdIndexValue.push(new DeviceIdIndexValue(this.deviceIdTEMP, HyrdraulicPowerUnitPointIndex.CurrentOperationMode, -999.0, ''));
    this.deviceIdIndexValue.push(new DeviceIdIndexValue(this.deviceIdTEMP, HyrdraulicPowerUnitPointIndex.VentAllLineCountDownInSeconds, -999.0, ''));
    this.deviceIdIndexValue.push(new DeviceIdIndexValue(this.deviceIdTEMP, HyrdraulicPowerUnitPointIndex.IsToVentAllWells, -999.0, ''));
    this.deviceIdIndexValue.push(new DeviceIdIndexValue(this.deviceIdTEMP, HyrdraulicPowerUnitPointIndex.CommStatus, 1, ''));

    for (let i = 0; i < this.wellRecords.length; i++) {
        this.deviceIdIndexValue.push(new DeviceIdIndexValue(this.wellRecords[i].HcmId, InforceWellDevicePointIndex.SelectedToRunAutoShiftingIndex, -999.0, ''));
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

  getOutputPressure(outputZone: WellZoneShiftRecord): number {
    this.PressureUnit = this.getDeviceIndexUnit(outputZone.zoneIndex);
    return this.getDeviceIndexValue(outputZone.zoneIndex);
  }

  getDeviceIndexValue(index: number): number {
    if (this.deviceIdIndexValue != null && this.deviceIdIndexValue[index] != null)
        return this.deviceIdIndexValue[index].value;
  }
  getDeviceIndexUnit(index: number): string {
    if (this.deviceIdIndexValue != null && this.deviceIdIndexValue[index] != null)
    {
      return this.getUnitofDeviceDataPoint(this.deviceIdIndexValue[index].deviceId,this.deviceIdIndexValue[index].pointIndex)
    }
        
  }
  getCommStatusPointValue(): void {
      if (this.deviceIdIndexValue != null) {
          let totaloutputpressureindex: number = this.paneloutputSensors.length * 2;
          if (this.getDeviceIndexValue(totaloutputpressureindex + 5) == 0) {
              // this.router.navigate(["/Home"]);
          }
      }
  }

  getCurrentOperationModePointValue(): number {
      let totaloutputpressureindex: number = this.paneloutputSensors.length * 2;
      this.getCommStatusPointValue();
      return this.getDeviceIndexValue(totaloutputpressureindex + 2);
  }

  getIsToVentAllWellsPointValue(): number {
      let totaloutputpressureindex: number = this.paneloutputSensors.length * 2;
      return this.getDeviceIndexValue(totaloutputpressureindex + 4);
  }

  IsTheSelectedWell(record: WellShiftRecord): boolean {
    let result: boolean = false;
    if (this.SelectedWell != null) {
        if (record.HcmId == this.SelectedWell.HcmId) {
            result = true;
        }
    }
    return result
  }

  getVentState(outputZone: WellZoneShiftRecord): string {
    let value = this.getDeviceIndexValue(this.paneloutputSensors.length + outputZone.zoneIndex);
    if (value == 1) {
      return "Pressurized";
    } else if (value == 0) {
      return "Vented";
    } else {
      return "";
    }
  }

  areAllRecordsVented(wellZoneShiftRecords: WellZoneShiftRecord[]) {
    let allVented = true;
    for (let record of wellZoneShiftRecords) {
      if (record.downholeLine != 'Unassigned' && this.getVentState(record) !== 'Vented') {
        allVented = false;
        break;
      }
    }
    return allVented;
  }

  isAbortDisabled() {
    // const records = this.currentWell ? this.currentWell.wellZoneShiftRecords : this.allVents;
    const disableAbortBtn = this.currentWell ? this.disableAbortOnWellButton(this.currentWell) : this.disableAbortButton();
    return disableAbortBtn;
    // return this.areAllRecordsVented(records) || disableAbortBtn;
  }

  isVentDisabled() {
    const records = this.currentWell ? this.currentWell.wellZoneShiftRecords : this.allVents;
    return this.areAllRecordsVented(records) || this.disableStartButton();
  }

  disableStartButton(): boolean {
      let returnValue = true;
      if (this.getOperationExecutionInProgressPointValue() != ExecutionMode.ExecutionOn
          && this.getCurrentOperationModePointValue() == OperationMode.Idle
          && this.fatalCriticalcountOfAlarms == 0
      ) {
          returnValue = false; // enable
      }
      return returnValue;
  }

  disableAbortButton(): boolean {
      let returnValue = true;
      if (this.getOperationExecutionInProgressPointValue() == ExecutionMode.ExecutionOn
          && this.getCurrentOperationModePointValue() == OperationMode.VentAll
          && this.getIsToVentAllWellsPointValue() == 1
      ) {
        returnValue = false; // enable
      }
      return returnValue;
  }

  disableAbortOnWellButton(well: WellShiftRecord): boolean {
      let returnValue = true;
      if (this.getOperationExecutionInProgressPointValue() == ExecutionMode.ExecutionOn
          && this.getCurrentOperationModePointValue() == OperationMode.VentAll
          && this.getIsToVentAllWellsPointValue() == 0
          && this.IsTheSelectedWell(well)) {
            returnValue = false; // enable
      }
      return returnValue;
  }

  openConfirmVentDialog() {
    const records = this.currentWell ? this.currentWell.wellZoneShiftRecords : this.allVents;
    const recordsToVent = [];
    for (let record of records) {
      if (record.downholeLine != 'Unassigned' && this.getVentState(record) !== 'Vented') {
        recordsToVent.push(record);
      }
    } 
    const dialogData: IConfirmVentDialogData = {
      ventAllRecords: this.currentWell ? false : true,
      recordsToVent: recordsToVent,
      currentWell: this.currentWell,
    };
    this.gatewayModalService.openAdvancedDialog(
      'Confirm Vent',
      ButtonActions.None,
      ConfirmVentDialogComponent,
      dialogData,
      (result) => {
        if (result) {
          this.SelectedWell = this.currentWell;
          if (this.SelectedWell) {
            this.BeginVentWell();
          } else {
            this.BeginVentAllWell();
          }
          this.closeDialog();
        } else {
          this.SelectedWell = null;
          this.closeDialog();
        }
      },
      '365px',
      null,
      '350px',
      null
    );
  }
  
  closeDialog() {
    this.gatewayModalService.closeModal();
  }

  BeginVentWell(): void {
      this.IsToVentAllWellsUI = false;
      this.BEGINVent();
  }

  BeginVentAllWell(): void {
      this.IsToVentAllWellsUI = true;
      this.BEGINVent();
  }

  BEGINVent(): void {
      this.currenVentAllLineCountDownInSeconds = 0;
      if (this.getOperationExecutionInProgressPointValue() == ExecutionMode.ExecutionOff) {
          this.setOperationModeSequence();
      }
  }

  isVentingInProgress() {
    return VentOutputComponent.CurrentExecutionMode === ExecutionMode.ExecutionOn;
  }

  /*FLOW STARTS HERE*/
  setOperationModeSequence(): void {
      const writeVar = new WriteToServerDataModel();
      writeVar.DeviceId = this.getHPUID();
      writeVar.PointIndex = HyrdraulicPowerUnitPointIndex.SetOperationModeInternal;
      writeVar.PointName = '';
      writeVar.Value = OperationMode.Idle;
      writeVar.WriteToServerCommandEnum = 1;

      this.configurationService.WriteToServer(writeVar).subscribe(
          result => {
              this.setOperationModeVentAll();
          }
      );
  }

  setOperationModeVentAll(): void {
      const writeVar = new WriteToServerDataModel();
      writeVar.DeviceId = this.getHPUID();
      writeVar.PointIndex = HyrdraulicPowerUnitPointIndex.SetOperationModeInternal;
      writeVar.PointName = '';
      writeVar.Value = OperationMode.VentAll;
      writeVar.WriteToServerCommandEnum = 1;

      this.configurationService.WriteToServer(writeVar).subscribe(
          result => {
              this.setIsToVentAllWells();
          }
      );
  }

  setIsToVentAllWells(): void {
      let IsToVentAllWellsValue: number = 0;

      if (this.IsToVentAllWellsUI == true) {
          IsToVentAllWellsValue = 1;
      }
      else {
          IsToVentAllWellsValue = 0;
      }

      const writeVar = new WriteToServerDataModel();
      writeVar.DeviceId = this.getHPUID();
      writeVar.PointIndex = HyrdraulicPowerUnitPointIndex.IsToVentAllWells;
      writeVar.PointName = '';
      writeVar.Value = IsToVentAllWellsValue;
      writeVar.WriteToServerCommandEnum = 1;

      this.configurationService.WriteToServer(writeVar).subscribe(
          result => {
              if (this.IsToVentAllWellsUI == true)
                  this.setExecuteOperationMode();
              else
                  this.setValue();
          }
      );
  }

  setValue(): void {
      const writeVar = new WriteToServerDataModel();
      // console.log('setValue.....', this.SelectedWell);
      writeVar.DeviceId = this.SelectedWell.wellDeviceId;
      writeVar.PointIndex = InforceWellDevicePointIndex.SelectedToRunAutoShiftingIndex;
      writeVar.PointName = InforceWellDevicePointIndex.SelectedToRunAutoShiftingName;
      writeVar.Value = 1;
      writeVar.WriteToServerCommandEnum = 1;

      this.configurationService.WriteToServer(writeVar).subscribe(
          result => {
              this.setExecuteOperationMode();
          });
  }

  setExecuteOperationMode(): void {
      const writeVar = new WriteToServerDataModel();
      writeVar.DeviceId = this.getHPUID();
      writeVar.PointIndex = HyrdraulicPowerUnitPointIndex.ExecuteOperationMode;
      writeVar.PointName = '';
      writeVar.Value = ExecutionMode.ExecutionOn;
      writeVar.WriteToServerCommandEnum = 1;

      this.configurationService.WriteToServer(writeVar).subscribe(
          result => {
              this.IsToVentAllWellsUI = false;
          });
  }

  getOperationExecutionInProgressPointValue(): number {
    let totaloutputpressureindex: number = this.paneloutputSensors ? this.paneloutputSensors.length * 2 : 0;
    this.operationExecutionInProgressPointValue = this.getDeviceIndexValue(totaloutputpressureindex + 1);

    if (this.operationExecutionInProgressPointValue > 0 && VentOutputComponent.CurrentExecutionMode == ExecutionMode.NoExecution) {
        VentOutputComponent.CurrentExecutionMode = ExecutionMode.ExecutionOn;
    }

    if (this.operationExecutionInProgressPointValue == 0 && VentOutputComponent.CurrentExecutionMode == ExecutionMode.ExecutionOn) {
        VentOutputComponent.CurrentExecutionMode = ExecutionMode.ExecutionOff;
        this.setIsToVentAllWellsToZero();
    }

    return this.operationExecutionInProgressPointValue;
  }

  setIsToVentAllWellsToZero(): void {
    const writeVar = new WriteToServerDataModel();
    writeVar.DeviceId = this.getHPUID();
    writeVar.PointIndex = HyrdraulicPowerUnitPointIndex.SetOperationModeInternal;
    writeVar.PointName = '';
    writeVar.Value = OperationMode.Idle;
    writeVar.WriteToServerCommandEnum = 1;

    this.configurationService.WriteToServer(writeVar).subscribe(
        result => {
            const writeVar = new WriteToServerDataModel();
            writeVar.DeviceId = this.getHPUID();
            writeVar.PointIndex = HyrdraulicPowerUnitPointIndex.SetOperationModeInternal;
            writeVar.PointName = '';
            writeVar.Value = OperationMode.VentAll;
            writeVar.WriteToServerCommandEnum = 1;

            this.configurationService.WriteToServer(writeVar).subscribe(
                result => {
                    const writeVar = new WriteToServerDataModel();
                    writeVar.DeviceId = this.getHPUID();
                    writeVar.PointIndex = HyrdraulicPowerUnitPointIndex.IsToVentAllWells;
                    writeVar.PointName = '';
                    writeVar.Value = 0;
                    writeVar.WriteToServerCommandEnum = 1;

                    this.configurationService.WriteToServer(writeVar).subscribe(
                        result => {
                            VentOutputComponent.CurrentExecutionMode = ExecutionMode.NoExecution;
                            this.setShiftTotalVentTime(0);
                            this.ventAllLineCountDownInSecondsFirstValue = 0;
                            this.SelectedWell = null;

                            const writeVar = new WriteToServerDataModel();
                            writeVar.DeviceId = this.getHPUID();
                            writeVar.PointIndex = HyrdraulicPowerUnitPointIndex.SetOperationModeInternal;
                            writeVar.PointName = '';
                            writeVar.Value = OperationMode.Idle;
                            writeVar.WriteToServerCommandEnum = 1;

                            this.configurationService.WriteToServer(writeVar).subscribe();
                        }
                    );
                }
            );
        }
    );
  }

  getVolumeRecirculateProgress(): number {
    if (this.ventAllLineCountDownInSecondsFirstValue > 0 && this.getVentAllLineCountDownInSecondsPointValue_RTD() > 0) {
        this.currenVentAllLineCountDownInSeconds = ((this.ventAllLineCountDownInSecondsFirstValue - this.getVentAllLineCountDownInSecondsPointValue_RTD()) / this.ventAllLineCountDownInSecondsFirstValue) * 100;
        return this.currenVentAllLineCountDownInSeconds;
    }
    else {
        return 0;
    }
  }

  getVentAllLineCountDownInSecondsPointValue(): number {
    if (this.ventAllLineCountDownInSecondsFirstValue == undefined || this.ventAllLineCountDownInSecondsFirstValue <= 0) {
        this.ventAllLineCountDownInSecondsFirstValue = this.getVentAllLineCountDownInSecondsPointValue_RTD();
        if (this.ventAllLineCountDownInSecondsFirstValue > 0) {
            this.setShiftTotalVentTime(this.ventAllLineCountDownInSecondsFirstValue);
        }
    }

    return this.getVentAllLineCountDownInSecondsPointValue_RTD();
  }

  // time index
  getVentAllLineCountDownInSecondsPointValue_RTD(): number {
    let totaloutputpressureindex: number = this.paneloutputSensors.length * 2;
    return this.getDeviceIndexValue(totaloutputpressureindex + 3);
  }

  getShiftTotalVentTime(): void {
    //if (this.getOperationExecutionInProgressPointValue() == InForceModbusRegisterIndex.ExecutionMode.ExecutionOn) {
    this.configurationService.getShiftTotalVentTime().subscribe(
        result => {
            if (this.ventAllLineCountDownInSecondsFirstValue == undefined || this.ventAllLineCountDownInSecondsFirstValue <= 0) {
                this.ventAllLineCountDownInSecondsFirstValue = result;
            }
        });
  }

  setShiftTotalVentTime(totaltime: number): void {
    this.configurationService.setShiftTotalVentTime(totaltime)
        .subscribe(x => {
            //console.log("UPDATED totaltime done = " + totaltime)
        })
  }

  ABORTVenting(): void {//function for begin recirculate. type 1 for volume based.0 for timebased
      if (this.getOperationExecutionInProgressPointValue() == ExecutionMode.ExecutionOn)//verify  recirculate mode is in progress
      {
          const writeVar = new WriteToServerDataModel();
          writeVar.DeviceId = this.getHPUID();
          writeVar.PointIndex = HyrdraulicPowerUnitPointIndex.ExecuteOperationMode;
          writeVar.PointName = '';
          writeVar.Value = ExecutionMode.ExecutionOff;
          writeVar.WriteToServerCommandEnum = 1;

          this.configurationService.WriteToServer(writeVar).subscribe(
              result => {
                console.log('ABORTVenting.....', this.SelectedWell);
                  this.SelectedWell = null;
                  this.IsToVentAllWellsUI = false;
              }
          );
      }
  }

  onshowMaintenenceModeEvent(isValid: boolean) {
    this.showMaintenenceMode = isValid;
  }
  ngOnInit(): void {
    this.subscribeToFatalCriticalAlarmsCount();
    this.subscribeToWellEntityStore();
    this.subscribeToDeviceDataPoints();
  }

  ngOnDestroy(): void {
    if (this.dataSubscriptions != null && this.dataSubscriptions.length > 0) {
      this.dataSubscriptions.forEach(subscription => {
        if (subscription != null)
          subscription.unsubscribe();
      });
    }
  }

  onTabChanged(event) {
    if (event.index === 0) {
      this.currentWell = null;
    }
    else {
      this.currentWell = this.wellRecords[event.index - 1];
    }
  }

}
