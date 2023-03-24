import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { HyrdraulicPowerUnitPointIndex, InFORCEZone_HCM_PointIndex, SHIFT_STATUS_MESSAGE } from '@features/inforce/common/InForceModbusRegisterIndex';
import { InforceWellShiftUIModel, InforceZoneShiftRecordUIModel } from '@core/models/UIModels/inforce.well.shift.model';
import { InforceWellUIModel } from '@core/models/UIModels/InforceWell.model';
import { DeviceIdIndexValue } from '@core/models/webModels/PointTemplate.model';
import { InFORCEWellDataUIModel } from '@core/models/webModels/WellDataUIModel.model';
import { InFORCEZoneDataUIModel } from '@core/models/webModels/ZoneDataUIModel.model';
import { ConfigurationService } from '@core/services/configurationService.service';
import { RealTimeDataSignalRService } from '@core/services/realTimeDataSignalR.service';
import { Subscription } from 'rxjs';
import { UICommon } from '@core/data/UICommon';

@Component({
  selector: 'app-end-of-shift-dialog',
  templateUrl: './end-of-shift-dialog.component.html',
  styleUrls: ['./end-of-shift-dialog.component.scss']
})
export class EndOfShiftDialogComponent implements OnInit {


  displayedColumns: string[] = ['zoneName', 'previousPosition', 'expectedPosition', 'currentPosition', 'shiftStatus'];
  wellInShift: InforceWellShiftUIModel;
  currentWell: InFORCEWellDataUIModel;
  ShiftStatuses: DeviceIdIndexValue[] = [];
  currentPositions: DeviceIdIndexValue[] = [];
  currentPositionUnknownFlags: DeviceIdIndexValue[] = [];
  shiftSuccessMessage = SHIFT_STATUS_MESSAGE.Successful;
  noShiftPlanned = SHIFT_STATUS_MESSAGE.NoShiftPlanned;
  shiftFailed = SHIFT_STATUS_MESSAGE.Failed;
  endOfShiftData: MatTableDataSource<EndOfShiftData>;
  private dataSubscriptions: Subscription[] = [];

  constructor(public dialogRef: MatDialogRef<EndOfShiftDialogComponent>, @Inject(MAT_DIALOG_DATA) public data, private configService: ConfigurationService,
    private realTimeSignalRService: RealTimeDataSignalRService) {
    this.endOfShiftData = new MatTableDataSource<EndOfShiftData>();
  }

  isEllipsisActive(value) {
    return Math.ceil(value.getBoundingClientRect().height) < value.scrollHeight;
  }

  onClose() {
    this.dialogRef.close();
  }

  createDeviceIdAndIndexArray(wellShiftRecord: InforceWellShiftUIModel) {
    let HPUID = this.data.hpuID;
    //Shift status
    for (let m = 0; m < wellShiftRecord?.wellZoneShiftRecords.length; m++) {
      this.ShiftStatuses.push(new DeviceIdIndexValue(wellShiftRecord.wellZoneShiftRecords[m].HcmId, InFORCEZone_HCM_PointIndex.ShiftStatus, -999, ''));
    }
    //current position index value
    for (let m = 0; m < wellShiftRecord.wellZoneShiftRecords.length; m++) {
      this.currentPositions.push(new DeviceIdIndexValue(wellShiftRecord.wellZoneShiftRecords[m].HcmId, InFORCEZone_HCM_PointIndex.CurrentPosition, -999, ''));
    }
    //Current position unknown flag
    for (let m = 0; m < wellShiftRecord.wellZoneShiftRecords.length; m++) {
      this.currentPositionUnknownFlags.push(new DeviceIdIndexValue(wellShiftRecord.wellZoneShiftRecords[m].HcmId, InFORCEZone_HCM_PointIndex.CurrentPositionStateUnknownFlag, -999, ''));
    }
    this.subscribeToRealtimeDataArray(this.ShiftStatuses);
    this.subscribeToRealtimeDataArray(this.currentPositions);
    this.subscribeToRealtimeDataArray(this.currentPositionUnknownFlags);
  }

  private subscribeToRealtimeData(dataPoint) {
    let subscription = this.realTimeSignalRService.GetRealtimeData(dataPoint.deviceId, dataPoint.pointIndex).subscribe(value => {
      if (value != undefined && value != null) {
        dataPoint.match(value);
        let index = this.endOfShiftData.data.findIndex(z => z.hcmId == dataPoint.deviceId);
        if (dataPoint.pointIndex == InFORCEZone_HCM_PointIndex.ShiftStatus) {
          let shiftStatus = SHIFT_STATUS_MESSAGE.NoShiftPlanned;
          if (this.endOfShiftData.data[index].shiftStatus != SHIFT_STATUS_MESSAGE.NoShiftPlanned) {
            if (value.Value == 3)
              shiftStatus = SHIFT_STATUS_MESSAGE.Successful;
            else if (value.Value == 0)
              shiftStatus = SHIFT_STATUS_MESSAGE.NotStarted;
            else if (value.Value == 4)
              shiftStatus = SHIFT_STATUS_MESSAGE.Failed;
          }
          this.endOfShiftData.data[index].shiftStatus = shiftStatus;
        } else if (dataPoint.pointIndex == InFORCEZone_HCM_PointIndex.CurrentPosition) {
          this.endOfShiftData.data[index].currentPosition = this.getCurrentPositionName(this.endOfShiftData.data[index].zoneId, value.Value);
        } else if (dataPoint.pointIndex == InFORCEZone_HCM_PointIndex.CurrentPositionStateUnknownFlag) {
          this.endOfShiftData.data[index].currentPositionUnknownFlag = value.Value;
        }
      }
    });
    this.dataSubscriptions.push(subscription);
    return dataPoint;
  }

  private getCurrentPositionName(zoneId, currentPosition) {
    let zone = this.wellInShift.wellZoneShiftRecords.find(c => c.zoneId == zoneId);
    let ValuePositionString: string = null;
    if (zone.ValvePositionsAndReturns.find(c => c.ToPosition == currentPosition))
      ValuePositionString = zone.ValvePositionsAndReturns.find(c => c.ToPosition == currentPosition).Description;
    return ValuePositionString;
  }

  private subscribeToRealtimeDataArray(dataPointArray) {
    dataPointArray.forEach(dataPoint => {
      this.subscribeToRealtimeData(dataPoint);
    });
  }

  ngOnDestroy(): void {
    if (this.dataSubscriptions != null && this.dataSubscriptions.length > 0) {
      this.dataSubscriptions.forEach(subscription => {
        if (subscription != null)
          subscription.unsubscribe();
      });
    }
  }

  ngOnInit(): void {

    this.configService.getAutoShiftWellObject().subscribe((well: InforceWellShiftUIModel) => {
      this.currentWell = this.data.well.find(w => w.WellId == well.wellId);
      this.wellInShift = well;

      /* if (this.currentWell && this.currentWell.Zones) {
        let shiftData = [];
        this.currentWell.Zones.forEach(zone => {
          let index = this.wellInShift.wellZoneShiftRecords.findIndex(z => z.zoneId == zone.ZoneId);
          let shiftZone = this.wellInShift.wellZoneShiftRecords[index];
          if (shiftZone) {
            shiftData.push(
              { zoneName: zone.ZoneName, zoneId: zone.ZoneId, hcmId: zone.HcmId, wellId: zone.WellId, shiftStatus: "", currentPosition: shiftZone.currentDownholePosition, previousPosition: shiftZone.previousCurrentPosition, expectedPosition: shiftZone.targetDownholePosition, currentPositionUnknownFlag: shiftZone.currentPositionUnknownFlag });
          }
          else {
            let currentPosition = zone.ValvePositionsAndReturns.find(v => v.ToPosition == zone.CurrentPosition)?.Description;
            shiftData.push(
              { zoneName: zone.ZoneName, zoneId: zone.ZoneId, hcmId: zone.HcmId, wellId: zone.WellId, shiftStatus: SHIFT_STATUS_MESSAGE.NoShiftPlanned, currentPosition: currentPosition, previousPosition: currentPosition, expectedPosition: currentPosition, currentPositionUnknownFlag: zone.CurrentPositionStateUnknownFlag })
          }
        });
        this.endOfShiftData.data = shiftData;
      } */
      let shiftData = [];
      this.wellInShift.wellZoneShiftRecords.forEach((zone: InforceZoneShiftRecordUIModel) => {
        shiftData.push(
          { zoneName: zone.zoneName, zoneId: zone.zoneId, hcmId: zone.HcmId, wellId: this.wellInShift.wellId, shiftStatus: zone.shiftStatus, currentPosition: zone.currentDownholePosition, previousPosition: zone.previousCurrentPosition, expectedPosition: zone.targetDownholePosition, currentPositionUnknownFlag: zone.currentPositionUnknownFlag })
      });
      this.endOfShiftData.data = shiftData;
      
      this.createDeviceIdAndIndexArray(this.wellInShift);
    });
  }

}

class EndOfShiftData {
  zoneName: string;
  zoneId: number;
  hcmId: number;
  wellId: number;
  currentPosition: string;
  previousPosition: string;
  expectedPosition: string;
  shiftStatus: string;
  currentPositionUnknownFlag: number;
}
