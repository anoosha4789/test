import { Component, HostListener, Inject, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { DEFAULT_eFCV_POSITIONS_STAGES } from '@core/data/UICommon';
import { eFCVDataModel } from '@core/models/webModels/eFCVDataModel.model';
import { MultinodeUIActuationModel } from '@core/models/webModels/MultiNodeUIDataModel.model';
import { MultiNodeWellDataUIModel } from '@core/models/webModels/WellDataUIModel.model';
import { RealTimeDataSignalRService } from '@core/services/realTimeDataSignalR.service';
import { eFCVDataPointIndex, MultiNodeControlDataPointIndex } from '@features/multinode/common/MultiNodeRegisterIndex';
import { ACTUATION_STATUS_MESSAGE, MultiNodeLocalStorage } from '@features/multinode/common/MultiNodeUICommon';
import { MultiNodelocalstorageService } from '@features/multinode/services/multi-nodelocalstorage.service';
import { MultinodeService } from '@features/multinode/services/multinode.service';
import { Subscription } from 'rxjs/internal/Subscription';
@Component({
  selector: 'app-end-of-actuation-dialog',
  templateUrl: './end-of-actuation-dialog.component.html',
  styleUrls: ['./end-of-actuation-dialog.component.scss']
})
export class EndOfActuationDialogComponent implements OnInit, AfterViewInit, OnDestroy {
  displayedColumns: string[] = ['zoneName', 'previousPosition', 'expectedPosition', 'currentPosition', 'rotationCount', 'timeTaken', 'shiftStatus'];
  currentWell: MultiNodeWellDataUIModel;
  endOfActuationData: MatTableDataSource<EndOfActuationData>;
  actuateWellModel: MultinodeUIActuationModel;
  isMobileView: boolean = false;

  private dataSubscriptions: Subscription[] = [];
  constructor(public dialogRef: MatDialogRef<EndOfActuationDialogComponent>, @Inject(MAT_DIALOG_DATA) public data, private multiNodeService: MultinodeService
    , private multiNodeLocalStorageService: MultiNodelocalstorageService
    , private realTimeSignalRService: RealTimeDataSignalRService) {
    this.endOfActuationData = new MatTableDataSource<EndOfActuationData>();
  }


  private subscribeToRealtimeData(deviceId, pointIndex, eFCVPosition) {
    let subscription = this.realTimeSignalRService.GetRealtimeData(deviceId, pointIndex).subscribe(value => {
      if (value != undefined && value != null) {
        // let index = this.endOfActuationData.data.findIndex(z => z.hcmId == deviceId);
        if (pointIndex == MultiNodeControlDataPointIndex.CurrentShiftStatus && !eFCVPosition) {
          let shiftStatus = "Successful";
          if (value.Value == 2)
            shiftStatus = "Successful";
          else if (value.Value == 3)
            shiftStatus = "Failed";
          else if (value.Value == 4)
            shiftStatus = "Failed";
          if (window.localStorage.getItem(MultiNodeLocalStorage.IsStopActuating) === ACTUATION_STATUS_MESSAGE.InProgress && value.Value == 3) {
            this.endOfActuationData.data[0].shiftStatus = this.endOfActuationData.data[0].currentPosition === this.endOfActuationData.data[0].expectedPosition ? "Successful" : "Stopped";
            // Rehome
            if (this.endOfActuationData.data[1])
              this.endOfActuationData.data[1].shiftStatus = this.endOfActuationData.data[1].currentPosition === this.endOfActuationData.data[1].expectedPosition ? "Successful" : "Stopped";
          } else {
            this.endOfActuationData.data[0].shiftStatus = shiftStatus;
            // Rehome
            if (this.actuateWellModel.ActuationNodes[0].CurrentStage === DEFAULT_eFCV_POSITIONS_STAGES.STAGE_NOTSET && this.endOfActuationData.data[1]) {
              this.endOfActuationData.data[1].shiftStatus = shiftStatus;
            }
          }
        } else if (pointIndex == eFCVDataPointIndex.Position && eFCVPosition) {
          if (this.actuateWellModel.ActuationNodes[0].CurrentStage === DEFAULT_eFCV_POSITIONS_STAGES.STAGE_NOTSET && this.endOfActuationData.data[1]) {
            this.endOfActuationData.data[0].currentPosition = this.getCurrentPositionName(this.endOfActuationData.data[0].zoneId, this.getPositionStageIndex(this.endOfActuationData.data[0].zoneId, DEFAULT_eFCV_POSITIONS_STAGES.STAGE_OPEN));
            this.endOfActuationData.data[1].currentPosition = this.getCurrentPositionName(this.endOfActuationData.data[0].zoneId, value.Value);
          } else {
            this.endOfActuationData.data[0].currentPosition = this.getCurrentPositionName(this.endOfActuationData.data[0].zoneId, value.Value);
          }
          if (window.localStorage.getItem(MultiNodeLocalStorage.IsStopActuating) === ACTUATION_STATUS_MESSAGE.InProgress && value.Value == -1) {
            this.endOfActuationData.data[0].shiftStatus = "Stopped";
            // Rehome
            if (this.actuateWellModel.ActuationNodes[0].CurrentStage === DEFAULT_eFCV_POSITIONS_STAGES.STAGE_NOTSET && this.endOfActuationData.data[1]) {
              this.endOfActuationData.data[1].shiftStatus = "Stopped";
            }
          }
        } else if (pointIndex == eFCVDataPointIndex.ActuationMode) {
          this.endOfActuationData.data[0].actuationMode = value.Value;
          this.endOfActuationData.data[0].timeTaken = this.getActuationTimeTaken();
          this.endOfActuationData.data[0].isTimeBasedActuation = value.Value === 1;
          if (this.endOfActuationData.data[1]) {
            this.endOfActuationData.data[1].isTimeBasedActuation = value.Value === 1;
          }
          if (value.Value === 1) {
            this.displayedColumns = ['zoneName', 'previousPosition', 'direction', 'timeTaken', 'shiftStatus'];
          } else {
            this.displayedColumns = ['zoneName', 'previousPosition', 'expectedPosition', 'currentPosition', 'expectedRotationCount', 'rotationCount', 'shiftStatus'];
          }
        } else if (pointIndex == eFCVDataPointIndex.Motor_EncoderCount) {
          if (this.actuateWellModel.ActuationNodes[0].CurrentStage !== DEFAULT_eFCV_POSITIONS_STAGES.STAGE_NOTSET) {
            this.endOfActuationData.data[0].rotationCount = value.Value;
          } else {
            // Rehome
            /*  this.endOfActuationData.data[0].rotationCount = null;
             if (this.endOfActuationData.data[1]) {
               this.endOfActuationData.data[1].rotationCount = value.Value;
             } */
            this.endOfActuationData.data.forEach(data => {
              data.rotationCount = this.getRotationCountFromStorage(data);
            });
          }
        }
      }
    });
    this.dataSubscriptions.push(subscription);
  }

  getPositionStageIndex(zoneId, PositionStage) {
    let zone = this.currentWell.Zones.find(c => c.ZoneId == zoneId);
    return zone?.PositionDescriptionData?.findIndex(pos => pos.PositionStage === PositionStage);
  }

  getActuationTimeTaken() {
    let actuationEndTime = Number(window.localStorage.getItem(MultiNodeLocalStorage.ActuationEndTime));
    let timeDiff = actuationEndTime - this.actuateWellModel.ActuationStartTime;
    return timeDiff && timeDiff > 0 ? Math.floor(timeDiff / 1000) : 0;
  }

  isEllipsisActive(value) {
    return Math.ceil(value.getBoundingClientRect().height) < value.scrollHeight;
  }

  private getCurrentPositionName(zoneId, currentPosition) {
    let zone = this.currentWell.Zones.find(c => c.ZoneId == zoneId);
    let PositionString: string = null;
    if (zone.PositionDescriptionData[currentPosition])
      PositionString = zone.PositionDescriptionData[currentPosition].Description;
    return PositionString ?? this.getNotSetPosition(zone);
  }

  getNotSetPosition(zone: eFCVDataModel) {
    return zone?.PositionDescriptionData?.find(des => des.PositionStage === DEFAULT_eFCV_POSITIONS_STAGES.STAGE_NOTSET)?.Description ?? "";
  }

  getTotalCount() {
    let totalCount = 0;
    let targetRotationCount = this.getStageRotationCount(this.actuateWellModel.ActuationNodes[0].TargetStage);
    let currentRotationCount = this.actuateWellModel.ActuationNodes[0].CurrentStage !== DEFAULT_eFCV_POSITIONS_STAGES.STAGE_NOTSET ? this.getStageRotationCount(this.actuateWellModel.ActuationNodes[0].CurrentStage) : this.getStageRotationCount(DEFAULT_eFCV_POSITIONS_STAGES.STAGE_CLOSE);
    if (targetRotationCount < currentRotationCount) {
      totalCount = currentRotationCount - targetRotationCount;
    } else {
      totalCount = targetRotationCount - currentRotationCount;
    }
    return totalCount;
  }

  getStageRotationCount(stage) {
    return this.currentWell.PositionDescriptionData.find(pos => pos.PositionStage === stage)?.RotationCount;
  }

  getRotationCountFromStorage(data: EndOfActuationData) {
    let storedRotationCount = localStorage.getItem(MultiNodeLocalStorage.ActuationRotationCount);
    if (storedRotationCount) {
      let counts: any[] = JSON.parse(storedRotationCount);
      return counts?.find(c => c.deviceId === data.hcmId && this.getPositionStageIndex(data.zoneId, data.expectedPositionStage) === c.targetPosition)?.rotationCount;
    }
    return null;
  }

  @HostListener("window:resize", [])
  public onResize() {
    this.detectScreenSize();
  }

  public ngAfterViewInit() {
    this.detectScreenSize();
  }

  private detectScreenSize() {
    this.isMobileView = window.innerWidth < 768 || window.innerHeight < 768 ? true : false;
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
    this.multiNodeService.getActuationWellObject().subscribe((well: MultinodeUIActuationModel) => {
      this.actuateWellModel = well;
      let actuateData = [];
      this.currentWell = this.data.well.find(w => w.WellId == well.WellId);
      well.ActuationNodes.forEach(z => {

        let zone = this.currentWell.Zones.find(x => x.eFCVGuid == z.AFCDId);
        actuateData.push(
          {
            zoneName: zone.ZoneName, zoneId: zone.ZoneId, hcmId: zone.HcmId, wellId: this.currentWell.WellId, shiftStatus: "",
            currentPosition: zone.PositionDescriptionData.find(x => x.PositionStage == z.CurrentStage) ? zone.PositionDescriptionData.find(x => x.PositionStage == z.CurrentStage).Description : "Unknown Position",
            previousPosition: zone.PositionDescriptionData.find(x => x.PositionStage == z.PreviousStage) ? zone.PositionDescriptionData.find(x => x.PositionStage == z.PreviousStage).Description : "Unknown Position",
            expectedPosition: zone.PositionDescriptionData.find(x => x.PositionStage == z.TargetStage) ? zone.PositionDescriptionData.find(x => x.PositionStage == z.TargetStage).Description : "Unknown Position",
            expectedPositionStage: zone.PositionDescriptionData.find(x => x.PositionStage == z.TargetStage) ? zone.PositionDescriptionData.find(x => x.PositionStage == z.TargetStage).PositionStage : "Unknown Position",
            expectedRotationCount: z.CurrentStage !== DEFAULT_eFCV_POSITIONS_STAGES.STAGE_NOTSET ? this.getTotalCount() : null,
            direction: this.actuateWellModel.IsTowardsHome ? "Towards Close" : "Towards Open"
          })


      });
      this.endOfActuationData.data = actuateData;
      this.endOfActuationData.data.forEach(x => {
        this.subscribeToRealtimeData(x.hcmId, eFCVDataPointIndex.Position, true);
        this.subscribeToRealtimeData(x.hcmId, eFCVDataPointIndex.Motor_EncoderCount, false);
        this.subscribeToRealtimeData(x.hcmId, eFCVDataPointIndex.ActuationMode, false);
      })
      this.subscribeToRealtimeData(this.data.multinodeDeviceId, MultiNodeControlDataPointIndex.CurrentShiftStatus, false);
    })
    this.multiNodeLocalStorageService.removeItem(MultiNodeLocalStorage.IsActuating);
  }
  onClose() {
    this.actuateWellModel.ActuationNodes = [];
    this.multiNodeService.sentActuateAcknowledgement(this.actuateWellModel).subscribe(c => {
      this.multiNodeLocalStorageService.clearLocalStorage();
    });
    this.dialogRef.close();
  }
}

class EndOfActuationData {
  zoneName: string;
  zoneId: number;
  hcmId: number;
  wellId: number;
  currentPosition: string;
  previousPosition: string;
  expectedPosition: string;
  expectedRotationCount?: number;
  rotationCount: number;
  actuationMode: number;
  timeTaken?: number;
  shiftStatus: string;
  direction?: string;
  isTimeBasedActuation?: boolean;
  expectedPositionStage?: string;
  //currentPositionUnknownFlag: number;
}

