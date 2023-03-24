import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';

import { UICommon, ZONE_VALVE_TYPE } from '@core/data/UICommon';
import { InforceWellUIModel } from '@core/models/UIModels/InforceWell.model';
import { InforceZoneUIModel, ValvePositionsAndReturnsUIModel } from '@core/models/UIModels/InforceZone.model';
import { INFORCE_WELL_ARCHITECTURE } from '@core/services/well.service';
import { ButtonActions } from '@shared/gateway-dialogs/components/gateway-advanced-dialog/gateway-advanced-dialog.component';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { IConfirmShiftDialogData, InforceConfirmShiftDialogComponent } from '../inforce-confirm-shift-dialog/inforce-confirm-shift-dialog.component';
import { RealTimeDataSignalRService } from '@core/services/realTimeDataSignalR.service';
import { InFORCEZone_HCM_PointIndex, SHIFT_STATUS_MESSAGE } from '@features/inforce/common/InForceModbusRegisterIndex';
import { InforceShiftStatus, InforceZoneShiftUIModel, ShiftControlReciepe } from '@features/inforce/common/InforceUICommon';
import { Subscription } from 'rxjs';
import { DataPointDefinitionModel } from '@core/models/webModels/DataPointDefinition.model';

@Component({
  selector: 'gw-inforce-perform-shift-dialog',
  templateUrl: './inforce-perform-shift-dialog.component.html',
  styleUrls: ['./inforce-perform-shift-dialog.component.scss']
})

export class InforcePerformShiftDialogComponent implements OnInit, OnDestroy {

  closeAllSleeveStatus = false;
  shiftBtnVisiblity = false;
  isWellType2N = false;
  fullShiftCycleText = "Full Shift Cycle";
  defaultRoute = "/inforce/monitoring";
  well: InforceWellUIModel;
  confirmShiftDialogData: IConfirmShiftDialogData;
  filteredZoneList: InforceZoneShiftUIModel[] = [];
  zoneList: MatTableDataSource<InforceZoneShiftUIModel>;
  displayedColumns: string[] = ['ZoneName', 'CurrentPosition', 'NumberOfPositions'];
  checkbox = {
    color: 'primary',
    checked: false,
    disabled: false
  }

  private arrSubscriptions: Subscription[] = [];

  constructor(protected router: Router,
    public dialogRef: MatDialogRef<InforcePerformShiftDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: InforceWellUIModel,
    private realTimeService: RealTimeDataSignalRService,
    private gwModalService: GatewayModalService) {
    this.zoneList = new MatTableDataSource<InforceZoneShiftUIModel>();
  }

  isEllipsisActive(value) {
    return Math.ceil(value.getBoundingClientRect().height) < value.scrollHeight;
  }

  onSleeveToggle(event) {
    this.closeAllSleeveStatus = !this.closeAllSleeveStatus;
    const zoneList: InforceZoneShiftUIModel[] = Object.assign([], this.zoneList.data);
    zoneList.forEach(zone => {
      if (!zone.CurrentPositionStateUnknownFlag) {
        zone.SelectedTargetPosition = {
          Id: zone.TargetValvePositionDd[0].Id,
          Description: zone.TargetValvePositionDd[0].Description
        };
      }
    });
    this.zoneList.data = zoneList;
    this.shiftBtnVisiblity = this.ValidateInforceZoneList();
  }

  onValvePositionChange(event, zoneId) {
    this.closeAllSleeveStatus = this.closeAllSleeveStatus ? false : this.closeAllSleeveStatus;
    let zoneIdx = this.zoneList.data.findIndex(zone => zone.ZoneId === zoneId);
    if (zoneIdx !== -1) {
      this.zoneList.data[zoneIdx].PreviousTargetPosition = this.zoneList.data[zoneIdx].CurrentTargetPosition;
      const valvePosition = this.zoneList.data[zoneIdx].TargetValvePositionDd.find(valPos => valPos.Description === event.value);
      this.zoneList.data[zoneIdx].SelectedTargetPosition.Description = valvePosition.Description;
      if (event.value !== this.fullShiftCycleText) {
        this.zoneList.data[zoneIdx].isFullShift = 0;
        this.zoneList.data[zoneIdx].SelectedTargetPosition.Id = valvePosition.ToPosition;
      } else {
        //Full Shift Cycle
        this.zoneList.data[zoneIdx].isFullShift = 1;
        this.zoneList.data[zoneIdx].SelectedTargetPosition.Id = this.zoneList.data[zoneIdx].CurrentTargetPosition.Id;
      }
      // Position Unknown
      if (this.zoneList.data[zoneIdx].PreviousTargetPosition === null || this.zoneList.data[zoneIdx].CurrentPositionStateUnknownFlag) {
        this.zoneList.data[zoneIdx].PreviousTargetPosition.Id === -1;
        this.zoneList.data[zoneIdx].PreviousTargetPosition.Description === SHIFT_STATUS_MESSAGE.ShiftStatusUnknown;
      }
    }
    this.shiftBtnVisiblity = this.ValidateInforceZoneList();
  }

  openConfirmShiftDialog() {
    this.confirmShiftDialogData.closeAllSleeve = this.closeAllSleeveStatus;
    this.confirmShiftDialogData.zoneList = this.filteredZoneList;
    this.gwModalService.openAdvancedDialog(
      'Confirm Shift',
      ButtonActions.None,
      InforceConfirmShiftDialogComponent,
      this.confirmShiftDialogData,
      (result) => {
        if (result) {
          this.dialogRef.close('ok');
        }
      },
      '350px',
      null,
      null,
      null
    );
    this.dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        this.router.navigate([`${this.defaultRoute}/well/${this.well.WellId}/viewshift`]);
      }
    });
  }

  closeModal() {
    this.dialogRef.close();
  }

  OnSubmit() {
    this.openConfirmShiftDialog();
  }

  OnCancel() {
    this.dialogRef.close();
  }

  getValidZoneList() {
    let zoneList: InforceZoneShiftUIModel[] = [];
    this.well.Zones.forEach(zone => {
      if (zone.ValveType !== ZONE_VALVE_TYPE.Monitoring) {
        const valvePositionsAndReturns = zone.ValvePositionsAndReturns;
        const filteredValvePosList = zone.ValvePositionsAndReturns.filter(valPos => valPos.UserSelectable !== false);
        const valvePosition = valvePositionsAndReturns.find(valpos => valpos.ToPosition === zone.CurrentPosition) ?? valvePositionsAndReturns[0];
        if (valvePosition) {
          const zoneObj: InforceZoneShiftUIModel = {
            WellId: zone.WellId,
            ZoneId: zone.ZoneId,
            ZoneName: zone.ZoneName,
            HcmId: zone.HcmId,
            CurrentPositionStateUnknownFlag: zone.CurrentPositionStateUnknownFlag,
            CurrentPositionRawValue: this.getCurrentPosition(zone.HcmId, InFORCEZone_HCM_PointIndex.CurrentPositionStateUnknownFlag),
            CurrentTargetPosition: {
              Id: valvePosition.ToPosition,
              Description: valvePosition.Description
            },
            SelectedTargetPosition: {
              Id: valvePosition.ToPosition,
              Description: valvePosition.Description
            },
            TargetValvePositionDd: this.getTargetValvePositionList(filteredValvePosList),
            IsResetOrVent: false,
            isFullShift: 0,
            isPositionInvalid: this.isPositionInvalid(filteredValvePosList, valvePosition)
          };
          zoneList.push(zoneObj);
        }
      }
    });
    return zoneList;
  }

  isPositionInvalid(filteredValvePosList, currentValvePosition) {
    return filteredValvePosList.find(valve => valve.ToPosition === currentValvePosition.ToPosition) ? false : true;
  }

  getCurrentPosition(zoneHcmId, pointIndex) {
    let position: number;
    let subscription = this.realTimeService.GetRealtimeData(zoneHcmId, pointIndex).subscribe(data => {
      position = data.Value;
    });
    this.arrSubscriptions.push(subscription);
    return position;
  }

  getTargetValvePositionList(valvePositionList: ValvePositionsAndReturnsUIModel[]) {

    valvePositionList.push({
      Id: -1,
      FromPosition: null,
      ToPosition: null,
      ReturnVolume: null,
      UserSelectable: true,
      Description: 'Full Shift Cycle'
    });
    return valvePositionList;
  }

  // Check Valve Position changes
  ValidateInforceZoneList() {
    this.filteredZoneList = [];
    this.confirmShiftDialogData.allZoneToList = [];
    this.zoneList.data.forEach(zone => {
      if (zone.isFullShift === 1 || zone.CurrentTargetPosition.Description !== zone.SelectedTargetPosition.Description) {
        this.filteredZoneList.push(zone);
      }
      this.confirmShiftDialogData.allZoneToList.push(zone);
    });
    return this.filteredZoneList.length > 0 ? true : false;
  }

  subscribeToZoneReset(): void {
    this.arrSubscriptions = [];
    if (this.isWellType2N) {
      this.zoneList.data.forEach(zone => {
        let subscription = this.realTimeService.GetRealtimeData(zone.HcmId, InFORCEZone_HCM_PointIndex.RecipeLineControlOperationStatus).subscribe(x => {
          if (x.Value === InforceShiftStatus.InProgress) {
            let zoneShiftSubscription = this.realTimeService.GetRealtimeData(zone.HcmId, InFORCEZone_HCM_PointIndex.RecipeLineControlType).subscribe(x => {
              zone.IsResetOrVent = (x.Value === ShiftControlReciepe.Reset || x.Value === ShiftControlReciepe.Vent) ? true : false;
              zone.ProgressText = x.Value === ShiftControlReciepe.Reset ? "Resetting" : x.Value === ShiftControlReciepe.Vent ? "Venting" : "";
            });
            this.arrSubscriptions.push(zoneShiftSubscription);
          }
          else {
            zone.IsResetOrVent = false;
            zone.ProgressText = "";
          }
        });
        this.arrSubscriptions.push(subscription);
      });

      this.zoneList.data.forEach(zone => {
        let resetTimeSubscription = this.realTimeService.GetRealtimeData(zone.HcmId, InFORCEZone_HCM_PointIndex.RecipeRemainingTimeInSecond).subscribe(x => {
          zone.ResetTime = x.Value;
        });
        this.arrSubscriptions.push(resetTimeSubscription);
      });
    }
  }

  ngOnDestroy(): void {
    if (this.arrSubscriptions != null && this.arrSubscriptions.length > 0) {
      this.arrSubscriptions.forEach(subscription => {
        if (subscription != null) {
          subscription.unsubscribe();
          subscription = null;
        }
      });
    }
    this.arrSubscriptions = [];
  }

  ngOnInit(): void {
    this.well = this.data;
    this.isWellType2N = this.data.ControlArchitectureId === INFORCE_WELL_ARCHITECTURE.TWO_N;
    if (this.well.Zones.length > 0) {
      this.zoneList.data = this.getValidZoneList();
      this.confirmShiftDialogData = {
        wellId: this.well.WellId,
        wellName: this.well.WellName,
        wellDeviceId: this.well.WellDeviceId,
        zoneList: this.filteredZoneList,
        wellType2N: this.well.ControlArchitectureId === INFORCE_WELL_ARCHITECTURE.TWO_N,
        closeAllSleeve: false
      }
      this.subscribeToZoneReset();
    }
  }

}