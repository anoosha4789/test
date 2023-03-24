import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { DEFAULT_eFCV_POSITIONS_STAGES } from '@core/data/UICommon';
import { DataPointDefinitionModel } from '@core/models/webModels/DataPointDefinition.model';
import { eFCVDataModel } from '@core/models/webModels/eFCVDataModel.model';
import { ActuateWellModel, MultinodeUIActuationModel } from '@core/models/webModels/MultiNodeUIDataModel.model';
import { MultiNodeWellDataUIModel } from '@core/models/webModels/WellDataUIModel.model';
import { RealTimeDataSignalRService } from '@core/services/realTimeDataSignalR.service';
import { eFCVDataPointIndex } from '@features/multinode/common/MultiNodeRegisterIndex';
import { ActuationStatus, ACTUATION_STATUS_MESSAGE, MultiNodeLocalStorage } from '@features/multinode/common/MultiNodeUICommon';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-multinode-actuate-hierarchy',
  templateUrl: './multinode-actuate-hierarchy.component.html',
  styleUrls: ['./multinode-actuate-hierarchy.component.scss']
})
export class MultinodeActuateHierarchyComponent implements OnInit, OnDestroy {
  @Input() wellInActuation: MultiNodeWellDataUIModel;
  @Input() efcvInActuation: eFCVDataModel;
  @Input() actuationWellObject: MultinodeUIActuationModel;
  @Input() dataPointDefinitions: DataPointDefinitionModel[];
  zoneNode: IZoneNode;
  deviceIndexArray: DataPointDefinitionModel[] = [];
  private dataSubscriptions: Subscription[] = [];

  constructor(private realTimeService: RealTimeDataSignalRService,) { }

  get actuationStatus() {
    return ActuationStatus;
  }

  constructZoneTree() {
    this.zoneNode = {
      name: this.efcvInActuation.ZoneName,
      zoneId: this.efcvInActuation.ZoneId,
      shiftStatus: ACTUATION_STATUS_MESSAGE.Idle,
      expand: false,
      visited: false,
      actuateStatusDataPoint: this.getDeviceByPointIndex(this.efcvInActuation.HcmId, eFCVDataPointIndex.ActuationStatus),
      currentPosition: this.getDeviceByPointIndex(this.efcvInActuation.HcmId, eFCVDataPointIndex.Position),
      WasLastActuationSuccess: this.getDeviceByPointIndex(this.efcvInActuation.HcmId, eFCVDataPointIndex.WasLastActuationSuccess),
      RotationCount: this.getDeviceByPointIndex(this.efcvInActuation.HcmId, eFCVDataPointIndex.Motor_EncoderCount),
      valvePositionNodeList: []
    };
    this.setUpRealtimeSubscription();
    this.buildTreeHierarchyForZone();
    this.updateZonePositionNode();
  }

  buildTreeHierarchyForZone() {
    let currentPositionStage = this.actuationWellObject.ActuationNodes[0].CurrentStage;
    let targetPositionStage = this.actuationWellObject.ActuationNodes[0].TargetStage;
    const currentPosition = this.wellInActuation.PositionDescriptionData.find(pos => pos.PositionStage === currentPositionStage)?.Description;
    const targetPosition = this.wellInActuation.PositionDescriptionData.find(pos => pos.PositionStage === targetPositionStage)?.Description;
    if (currentPositionStage !== DEFAULT_eFCV_POSITIONS_STAGES.STAGE_NOTSET) {
      let valvePositionNode: IValvePositionNode = {
        visited: false,
        current: currentPosition,
        target: targetPosition,
        shiftStatus: ActuationStatus.Idle
      };
      this.zoneNode.valvePositionNodeList.push(valvePositionNode);
    } else {
      // Rehome
      this.zoneNode.valvePositionNodeList.push({
        visited: false,
        current: currentPosition,
        target: this.getPosition(DEFAULT_eFCV_POSITIONS_STAGES.STAGE_OPEN),
        shiftStatus: ActuationStatus.Idle
      });
      this.zoneNode.valvePositionNodeList.push({
        visited: false,
        current: this.getPosition(DEFAULT_eFCV_POSITIONS_STAGES.STAGE_OPEN),
        target: this.getPosition(DEFAULT_eFCV_POSITIONS_STAGES.STAGE_CLOSE),
        shiftStatus: ActuationStatus.Idle
      });
    }
    if (this.zoneNode.valvePositionNodeList.length > 0) {
      this.zoneNode.expand = true;
    }
  }

  getPosition(positionStage) {
    return this.wellInActuation.PositionDescriptionData.find(pos => pos.PositionStage === positionStage)?.Description ?? "";
  }

  updateZonePositionNode() {
    if (this.actuationWellObject.ActuationNodes[0].CurrentStage !== DEFAULT_eFCV_POSITIONS_STAGES.STAGE_NOTSET) {
      for (let i = 0; i < this.zoneNode.valvePositionNodeList.length; i++) {
        this.zoneNode.valvePositionNodeList[i].visited = true;
        this.zoneNode.valvePositionNodeList[i].shiftStatus = (window.localStorage.getItem(MultiNodeLocalStorage.IsActuating) && (this.zoneNode.currentPosition.RawValue === this.getTargetPosition() || this.zoneNode.RotationCount.RawValue === this.getTotalCount())) ?
          ActuationStatus.Successfull : ActuationStatus.InProgress;
      }
    } else {
      // Rehome
      if (this.zoneNode.valvePositionNodeList.length === 2 && window.localStorage.getItem(MultiNodeLocalStorage.IsActuating)) {
        const stageOpen = this.getPositionStageIndex(DEFAULT_eFCV_POSITIONS_STAGES.STAGE_OPEN);
        const stageClose = this.getPositionStageIndex(DEFAULT_eFCV_POSITIONS_STAGES.STAGE_CLOSE);
        this.zoneNode.valvePositionNodeList[0].visited = true;
        this.zoneNode.valvePositionNodeList[0].shiftStatus = this.zoneNode.currentPosition.RawValue === stageOpen || this.zoneNode.currentPosition.RawValue === stageClose ?
          ActuationStatus.Successfull : ActuationStatus.InProgress;
        this.zoneNode.valvePositionNodeList[1].visited = this.zoneNode.currentPosition.RawValue === stageOpen || this.zoneNode.currentPosition.RawValue === stageClose;
        this.zoneNode.valvePositionNodeList[1].shiftStatus = this.zoneNode.currentPosition.RawValue === stageClose ?
          ActuationStatus.Successfull : ActuationStatus.InProgress;
      }
    }
  }

  getPositionStageIndex(PositionStage) {
    return this.wellInActuation.PositionDescriptionData.findIndex(pos => pos.PositionStage === PositionStage);
  }

  getTargetPosition() {
    return this.getPositionStageIndex(this.actuationWellObject.ActuationNodes[0].TargetStage);
  }

  getTotalCount() {
    let targetRotationCount = this.wellInActuation.PositionDescriptionData.find(pos => pos.PositionStage === this.actuationWellObject.ActuationNodes[0].TargetStage)?.RotationCount;
    let currentRotationCount = this.wellInActuation.PositionDescriptionData.find(pos => pos.PositionStage === this.actuationWellObject.ActuationNodes[0].CurrentStage)?.RotationCount;
    let totalCount = 0;
    if (targetRotationCount < currentRotationCount) {
      totalCount = currentRotationCount - targetRotationCount;
    } else {
      totalCount = targetRotationCount - currentRotationCount;
    }
    return totalCount;
  }

  private getDeviceByPointIndex(deviceId: number, pointIndex: number): DataPointDefinitionModel {
    let index = this.dataPointDefinitions.findIndex(d => d.DeviceId === deviceId && d.DataPointIndex == pointIndex) ?? -1;
    if (index !== -1) {
      const dp = new DataPointDefinitionModel();
      dp.DataPointIndex = this.dataPointDefinitions[index].DataPointIndex;
      dp.DataType = this.dataPointDefinitions[index].DataType;
      dp.DeviceId = this.dataPointDefinitions[index].DeviceId;
      dp.RawValue = -999;
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
              element.RawValue = d.Value;
              // if (element.DataPointIndex === eFCVDataPointIndex.Position || element.DataPointIndex === eFCVDataPointIndex.Motor_EncoderCount) {
                this.updateZonePositionNode();
              // }
            }
            this.dataSubscriptions.push(deviceSubs);
          });
      });
    }
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
    this.constructZoneTree();
  }

}

interface IZoneNode {
  zoneId?: number,
  name: string,
  expand: boolean,
  visited: boolean,
  actuateStatusDataPoint?: DataPointDefinitionModel,
  currentPosition?: DataPointDefinitionModel,
  targetPosition?: DataPointDefinitionModel,
  WasLastActuationSuccess?: DataPointDefinitionModel,
  RotationCount?: DataPointDefinitionModel,
  shiftStatus: string,
  valvePositionNodeList: IValvePositionNode[]
}

interface IValvePositionNode {
  visited: boolean,
  shiftStatus: number,
  currentPositionId?: number,
  current: string,
  target: string
}