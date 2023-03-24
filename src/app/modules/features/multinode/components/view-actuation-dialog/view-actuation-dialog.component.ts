import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DEFAULT_eFCV_POSITIONS_STAGES, UIChartColors, UICommon } from '@core/data/UICommon';
import { SieUIModel } from '@core/models/UIModels/sie.model';
import { DataPointDefinitionModel } from '@core/models/webModels/DataPointDefinition.model';
import { eFCVDataModel } from '@core/models/webModels/eFCVDataModel.model';
import { ActuateWellModel, MultinodeUIActuationModel } from '@core/models/webModels/MultiNodeUIDataModel.model';
import { UnitQuantities } from '@core/models/webModels/UnitSystem.model';
import { MultiNodeWellDataUIModel } from '@core/models/webModels/WellDataUIModel.model';
import { RealTimeDataSignalRService } from '@core/services/realTimeDataSignalR.service';
import { eFCVDataPointIndex, SIUDataPointIndex } from '@features/multinode/common/MultiNodeRegisterIndex';
import { Store } from '@ngrx/store';
import { ChartOptions } from '@shared/gateway-chart/multiaxis-chart/multiaxis-chart.model';
import { UNITSYSTEM_LOAD } from '@store/actions/unit-system.action';
import { StateUtilities } from '@store/state/IState';
import { IUnitSystemState } from '@store/state/unit-system.state';
import { Observable, Subscription } from 'rxjs';
import * as _ from 'lodash';
import { ACTUATION_STATUS_MESSAGE, MultiNodeLocalStorage } from '@features/multinode/common/MultiNodeUICommon';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { ButtonActions } from '@shared/gateway-dialogs/components/gateway-advanced-dialog/gateway-advanced-dialog.component';
import { AbortActuationDialogComponent } from './abort-actuation-dialog/abort-actuation-dialog.component';
import { MultinodeService } from '@features/multinode/services/multinode.service';

@Component({
  selector: 'app-view-actuation-dialog',
  templateUrl: './view-actuation-dialog.component.html',
  styleUrls: ['./view-actuation-dialog.component.scss']
})
export class ViewActuationDialogComponent implements OnInit, OnDestroy {

  wellInActuation: MultiNodeWellDataUIModel;
  siuInActuation: SieUIModel;
  efcvInActuation: eFCVDataModel;
  actuationWellObject: MultinodeUIActuationModel;
  progress: number = 0;
  public chartId: string = "viewactuation";
  public dataPointChartOptions: ChartOptions = new ChartOptions();
  parameterList: ActuationParameter[];
  SurfaceparameterList: ActuationParameter[];
  wellsInStore: MultiNodeWellDataUIModel[] = [];
  siesInStore: SieUIModel[] = [];
  private dataSubscriptions: Subscription[] = [];
  deviceIndexArray: DataPointDefinitionModel[] = [];
  showChart = false;
  private unitQuatities: UnitQuantities[] = [];
  private unitSystemState$: Observable<IUnitSystemState>;
  voltage_unit: string = "";
  current_unit: string = "";
  temp_unit: string = "";
  actuationData: IViewActuationData;
  dataPointDefinitions: DataPointDefinitionModel[];
  isActuationStarted: boolean = false;
  currentStatus = ACTUATION_STATUS_MESSAGE.Initializing;
  disableStopActuationBtn: boolean = true;
  constructor(protected store: Store, public dialogRef: MatDialogRef<ViewActuationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
    private realTimeService: RealTimeDataSignalRService,
    private gwModalService: GatewayModalService,
    private multinodeService: MultinodeService) {
    this.unitSystemState$ = this.store.select<IUnitSystemState>((state: any) => state.unitSystemState);
  }

  private getWellInShiftData() {
    const subscription = this.multinodeService.getActuationWellObject().subscribe((well: MultinodeUIActuationModel) => {
      this.actuationWellObject = _.cloneDeep(well);
      this.setWellAndEfcvInActuation(this.actuationWellObject);
      this.setDataPointList();
      this.setUpRealtimeSubscription();
      this.subscribeToUnitSystems();
    });
    this.dataSubscriptions.push(subscription);
  }
  private subscribeToUnitSystems() {
    const subscription = this.unitSystemState$.subscribe(
      (state: IUnitSystemState) => {
        if (state !== undefined) {
          if (state.isLoaded === false || StateUtilities.hasErrors(state)) {
            // Dispatch Action if not loaded
            this.store.dispatch(UNITSYSTEM_LOAD());
          } else {
            this.unitQuatities = state.unitSystem.UnitQuantities;
            this.voltage_unit = this.getUnit("electric_potential");
            this.current_unit = this.getUnit("electric_current");
            this.temp_unit = this.getUnit("thermodynamic_temperature");
            this.getefcvParamterList();
            this.setSufaceParametersDataPoints();
            this.setupChart();
          }
        }
      }
    );

    this.dataSubscriptions.push(subscription);
  }

  setWellAndEfcvInActuation(well: ActuateWellModel) {
    this.wellInActuation = this.wellsInStore?.find(w => w.WellId + "" === well?.WellId);
    this.siuInActuation = this.siesInStore?.find(sie => sie.SIEGuid === well?.SIUID);
    this.efcvInActuation = this.wellInActuation?.Zones?.find(z => z.eFCVGuid === well?.ActuationNodes[0]?.AFCDId);
  }

  getefcvParamterList() {
    this.parameterList = [
      {
        key: `eFCV Voltage  (${this.voltage_unit})`,
        value: this.actuationData?.TECVoltage
      },
      {
        key: `eFCV Current  (${this.current_unit})`,
        value: this.actuationData?.TECCurrent
      },
      {
        key: `Motor Voltage  (${this.voltage_unit})`,
        value: this.actuationData?.MotorVoltage
      },
      {
        key: `Motor Current   (${this.current_unit})`,
        value: this.actuationData?.MotorCurrent
      },
      {
        key: 'Rotation Count',
        value: this.actuationData?.RotationCount
      },
      /* {
        key: `TEC Current (${this.current_unit})`,
        value: null
      }, */

    ];
  }

  setSufaceParametersDataPoints() {
    this.SurfaceparameterList = [
      {
        key: `PSU TEC Voltage (${this.voltage_unit})`,
        value: this.actuationData?.PSUTECVoltage
      },
      {
        key: `PSU TEC Current  (${this.current_unit})`,
        value: this.actuationData?.PSUTECCurrent
      },
      {
        key: `PSU Motor Voltage (${this.voltage_unit})`,
        value: this.actuationData?.PSUMotorVoltage
      },
      {
        key: `PSU Motor Current  (${this.current_unit})`,
        value: this.actuationData?.PSUMotorCurrent
      },
    ]
  }
  setupChart() {
    let chartOptions = new ChartOptions();
    let yAxes: any[] = [];
    let dataSeries: any[] = [];
    const voltageLabel = `Motor Voltage (${this.voltage_unit})`;
    const currentLabel = `Motor Current (${this.current_unit})`;
    const temperatureLabel = `Power Supply Temperature (${this.temp_unit})`;

    yAxes.push(
      {
        label: `Voltage (${this.voltage_unit})`, unit: this.voltage_unit
      },
      {
        label: `Current (${this.current_unit})`, unit: this.current_unit
      },
      {
        label: `Temperature (${this.temp_unit})`, unit: this.temp_unit
      }
    );
    dataSeries.push(
      {
        deviceId: this.efcvInActuation?.HcmId,
        pointIndex: eFCVDataPointIndex.Motor_Voltage,
        label: voltageLabel,
        unit: this.voltage_unit,
        decimalPoints: 2,
        brush: UIChartColors.getChartBrush(0)
      },
      {
        deviceId: this.efcvInActuation?.HcmId,
        pointIndex: eFCVDataPointIndex.Motor_Current,
        label: currentLabel,
        unit: this.current_unit,
        decimalPoints: 2,
        brush: UIChartColors.getChartBrush(1)
      },
      {
        deviceId: this.efcvInActuation?.HcmId,
        pointIndex: eFCVDataPointIndex.PowerSupplyTemperature,
        label: temperatureLabel,
        unit: this.temp_unit,
        decimalPoints: 2,
        brush: UIChartColors.getChartBrush(2)
      }
    )

    chartOptions.yAxes = yAxes;
    chartOptions.dataSeries = dataSeries;
    chartOptions.chartStartTime = this.actuationWellObject.ActuationStartTime;
    this.dataPointChartOptions = chartOptions;

    setTimeout(() => {
      this.showChart = true;
    }, 1000);
  }

  getUnit(value) {
    return this.unitQuatities?.find(unit => unit.UnitQuantityName == value)?.SelectedDisplayUnitSymbol ?? "";
  }

  setDataPointList() {
    this.actuationData = {

      TECVoltage: this.getDeviceByPointIndex(this.efcvInActuation.HcmId, eFCVDataPointIndex.Voltage),
      MotorVoltage: this.getDeviceByPointIndex(this.efcvInActuation.HcmId, eFCVDataPointIndex.Motor_Voltage),
      TECCurrent: this.getDeviceByPointIndex(this.efcvInActuation.HcmId, eFCVDataPointIndex.Current),
      MotorCurrent: this.getDeviceByPointIndex(this.efcvInActuation.HcmId, eFCVDataPointIndex.Motor_Current),
      RotationCount: this.getDeviceByPointIndex(this.efcvInActuation.HcmId, eFCVDataPointIndex.Motor_EncoderCount),

      ActuationStatus: this.getDeviceByPointIndex(this.efcvInActuation.HcmId, eFCVDataPointIndex.ActuationStatus),
      ActuationMode: this.getDeviceByPointIndex(this.efcvInActuation.HcmId, eFCVDataPointIndex.ActuationMode),
      Position: this.getDeviceByPointIndex(this.efcvInActuation.HcmId, eFCVDataPointIndex.Position),

      PSUTECVoltage: this.getDeviceByPointIndex(this.siuInActuation.SIEDeviceId, this.getTECIndex()),
      PSUMotorVoltage: this.getDeviceByPointIndex(this.siuInActuation.SIEDeviceId, SIUDataPointIndex.PS4_Voltage),
      PSUTECCurrent: this.getDeviceByPointIndex(this.siuInActuation.SIEDeviceId, this.getPSUIndex()),
      PSUMotorCurrent: this.getDeviceByPointIndex(this.siuInActuation.SIEDeviceId, SIUDataPointIndex.PS4_Current),
    };
  }

  getTECIndex() {
    let index = this.siuInActuation.SIEWellLinks.findIndex(w => w.WellId === this.wellInActuation.WellId);
    if (index === 0) {
      return SIUDataPointIndex.TEC1_TECVoltage;
    } else if (index === 1) {
      return SIUDataPointIndex.TEC2_TECVoltage;
    } else if (index === 2) {
      return SIUDataPointIndex.TEC3_TECVoltage;
    }
  }

  getPSUIndex() {
    let index = this.siuInActuation.SIEWellLinks.findIndex(w => w.WellId === this.wellInActuation.WellId);
    if (index === 0) {
      return SIUDataPointIndex.PS1_Current;
    } else if (index === 1) {
      return SIUDataPointIndex.PS2_Current;
    } else if (index === 2) {
      return SIUDataPointIndex.PS3_Current;
    }
  }
  private getDeviceByPointIndex(deviceId: number, pointIndex: number): DataPointDefinitionModel {
    let index = this.dataPointDefinitions.findIndex(d => d.DeviceId === deviceId && d.DataPointIndex == pointIndex) ?? -1;
    if (index !== -1) {
      const dp = new DataPointDefinitionModel();
      dp.DataPointIndex = this.dataPointDefinitions[index].DataPointIndex;
      dp.DataType = this.dataPointDefinitions[index].DataType;
      dp.DeviceId = this.dataPointDefinitions[index].DeviceId;
      dp.RawValue = pointIndex === eFCVDataPointIndex.Motor_EncoderCount ? 0 : -999;
      dp.ReadOnly = this.dataPointDefinitions[index].ReadOnly;
      dp.TagName = this.dataPointDefinitions[index].TagName;
      dp.UnitQuantityType = this.dataPointDefinitions[index].UnitQuantityType;
      dp.UnitSymbol = this.dataPointDefinitions[index].UnitSymbol;
      this.deviceIndexArray.push(dp);
      return dp;
    }

    return null;
  }

  private setUpRealtimeSubscription(): void {
    if (this.deviceIndexArray.length > 0) {
      this.deviceIndexArray.forEach((element) => {
        let deviceSubs = null;
        deviceSubs = this.realTimeService
          .GetRealtimeData(element.DeviceId, element.DataPointIndex)
          .subscribe((d) => {
            if (d !== undefined && d !== null) {
              if (element.DeviceId == this.efcvInActuation.HcmId && element.DataPointIndex === eFCVDataPointIndex.ActuationStatus) {
                if (d.Value === 1) {
                  window.localStorage.setItem(MultiNodeLocalStorage.IsActuating, ACTUATION_STATUS_MESSAGE.InProgress);
                }
                if (window.localStorage.getItem(MultiNodeLocalStorage.IsActuating)) {
                  this.currentStatus = ACTUATION_STATUS_MESSAGE.InProgress;
                  this.isActuationStarted = true;
                  // this.disableStopActuationBtn = window.localStorage.getItem(MultiNodeLocalStorage.IsStopActuating) === ACTUATION_STATUS_MESSAGE.InProgress;
                  if (this.actuationWellObject.ActuationNodes.length > 1) {
                    this.disableStopActuationBtn = window.localStorage.getItem(MultiNodeLocalStorage.IsStopActuating) === ACTUATION_STATUS_MESSAGE.InProgress;  // Disabled for now as of now as we can select only 1 eFCV to actuate 
                  }
                }
              }
              if (element.DeviceId == this.efcvInActuation.HcmId && element.DataPointIndex === eFCVDataPointIndex.Motor_EncoderCount) {
                const isRotationCompleted = d.Value === this.getTotalCount();
                if (window.localStorage.getItem(MultiNodeLocalStorage.IsActuating)) {
                  element.RawValue = d.Value;
                  if (this.isActuationStarted || isRotationCompleted) {
                    this.updateActuationProgress(d.Value);
                  }
                }
                /*  if (isRotationCompleted) {
                   this.multinodeFooterService.actuationEndTime = new Date().getTime();
                   this.currentStatus = ACTUATION_STATUS_MESSAGE.Finalizing;
                 } */
              } else if (element.DeviceId == this.efcvInActuation.HcmId && element.DataPointIndex === eFCVDataPointIndex.Position) {
                element.RawValue = d.Value;
                if (window.localStorage.getItem(MultiNodeLocalStorage.IsActuating) && this.actuationData.ActuationStatus.RawValue === 0)
                  this.saveRotationCountToStorage(element.DeviceId, d.Value);
                if (window.localStorage.getItem(MultiNodeLocalStorage.IsActuating) && (this.getTargetPosition() === d.Value || (this.actuationData.ActuationMode.RawValue === 1 && d.Value === -1))) {
                  window.localStorage.setItem(MultiNodeLocalStorage.ActuationEndTime, new Date().getTime().toString());
                  this.currentStatus = ACTUATION_STATUS_MESSAGE.Finalizing;
                  this.progress = 100;
                }
              } else {
                element.RawValue = d.Value;
              }
            }
            this.dataSubscriptions.push(deviceSubs);
          });
      });
    }
  }
  saveRotationCountToStorage(DeviceId, targetPosition) {
    let storedRotationCount = [];
    if (localStorage.getItem(MultiNodeLocalStorage.ActuationRotationCount)) {
      storedRotationCount = JSON.parse(localStorage.getItem(MultiNodeLocalStorage.ActuationRotationCount));
    }
    if (storedRotationCount?.filter(d => d.deviceId === DeviceId && d.targetPosition === targetPosition)?.length === 0)
      storedRotationCount.push({ deviceId: DeviceId, targetPosition: targetPosition, rotationCount: this.actuationData.RotationCount.RawValue });

    if (storedRotationCount?.length > 0)
      window.localStorage.setItem(MultiNodeLocalStorage.ActuationRotationCount, JSON.stringify(storedRotationCount));
  }

  getTargetPosition() {
    let targetStage;
    if (this.actuationWellObject.ActuationTime && this.actuationWellObject.ActuationTime > 0) {
      targetStage = this.actuationWellObject.IsTowardsHome ? DEFAULT_eFCV_POSITIONS_STAGES.STAGE_CLOSE : DEFAULT_eFCV_POSITIONS_STAGES.STAGE_OPEN;
    } else {
      if (this.actuationWellObject.ActuationNodes[0].CurrentStage === DEFAULT_eFCV_POSITIONS_STAGES.STAGE_NOTSET && this.actuationWellObject.ActuationNodes[1]) {
        // Rehome
        targetStage = this.actuationWellObject.ActuationNodes[1].TargetStage;
      } else {
        targetStage = this.actuationWellObject.ActuationNodes[0].TargetStage;
      }
    }
    return this.wellInActuation.PositionDescriptionData.findIndex(pos => pos.PositionStage === targetStage);
  }

  getTotalCount() {
    let totalCount = 0;

    let targetRotationCount = this.getStageRotationCount(this.actuationWellObject.ActuationNodes[0].TargetStage);
    let currentRotationCount = this.actuationWellObject.ActuationNodes[0].CurrentStage !== DEFAULT_eFCV_POSITIONS_STAGES.STAGE_NOTSET ? this.getStageRotationCount(this.actuationWellObject.ActuationNodes[0].CurrentStage) : this.getStageRotationCount(DEFAULT_eFCV_POSITIONS_STAGES.STAGE_CLOSE);

    if (targetRotationCount < currentRotationCount) {
      totalCount = currentRotationCount - targetRotationCount;
    } else {
      totalCount = targetRotationCount - currentRotationCount;
    }
    /* } else {
      // Rehome
      let targetRotationCount = this.wellInActuation.PositionDescriptionData.find(pos => pos.PositionStage === DEFAULT_eFCV_POSITIONS_STAGES.STAGE_CLOSE)?.RotationCount;
      totalCount = targetRotationCount * 2;
    } */
    return totalCount;
  }

  getStageRotationCount(stage) {
    return this.wellInActuation.PositionDescriptionData.find(pos => pos.PositionStage === stage)?.RotationCount;
  }

  updateActuationProgress(rotationCount) {
    const totalCount = this.getTotalCount();
    if (rotationCount > 0) {
      const calcPercentage = (rotationCount / totalCount) * 100;
      const percentage = Math.round(calcPercentage);
      this.progress = percentage > 100 ? 100 : (percentage < 0 ? 0 : percentage);
      if (this.progress === 100) {
        this.isActuationStarted = false;
      }
    }
  }

  stopActuation() {    
    this.gwModalService.openDialogInsideModal(
      'Confirm Stop Actuation',
      ButtonActions.None,
      AbortActuationDialogComponent,
      {},
      (result) => {
        if (result) {
          window.localStorage.setItem(MultiNodeLocalStorage.IsStopActuating, ACTUATION_STATUS_MESSAGE.InProgress);
          this.disableStopActuationBtn = true;
          this.multinodeService.stopActuation(this.siuInActuation.SIEGuid).subscribe((response => {
            // console.log("Stop Actuation", response);

          }))
        }
        // this.gwModalService.closeModal();
      },
      '400px'
    );
  }

  onClose() {
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    if (this.dataSubscriptions != null && this.dataSubscriptions.length > 0) {
      this.dataSubscriptions.forEach((subscription) => {
        if (subscription != null) {
          subscription.unsubscribe();
          subscription = null;
        }
      });
    }
  }

  ngOnInit(): void {
    this.wellsInStore = this.data.wells;
    this.siesInStore = this.data.sies;
    this.dataPointDefinitions = this.data.dataPointDefinitions;
    this.getWellInShiftData();
  }
}

interface ActuationParameter {
  key: string,
  value: DataPointDefinitionModel
}

interface IViewActuationData {
  MotorVoltage: DataPointDefinitionModel;
  TECCurrent: DataPointDefinitionModel;
  MotorCurrent: DataPointDefinitionModel;
  RotationCount: DataPointDefinitionModel;
  TECVoltage: DataPointDefinitionModel;
  ActuationStatus?: DataPointDefinitionModel;
  ActuationMode?: DataPointDefinitionModel;
  Position?: DataPointDefinitionModel;

  PSUTECCurrent: DataPointDefinitionModel;
  PSUMotorCurrent: DataPointDefinitionModel;
  PSUMotorVoltage: DataPointDefinitionModel;
  PSUTECVoltage: DataPointDefinitionModel;
}