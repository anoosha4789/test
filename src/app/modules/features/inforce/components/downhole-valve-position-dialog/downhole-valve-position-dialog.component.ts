import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { InFORCEZone_HCM_PointIndex } from '@features/inforce/common/InForceModbusRegisterIndex';
import { InforceZoneShiftUIModel } from '@features/inforce/common/InforceUICommon';
import { ZONE_VALVE_TYPE } from '@core/data/UICommon';
import { InforceWellUIModel } from '@core/models/UIModels/InforceWell.model';
import { ValvePositionsAndReturnsUIModel } from '@core/models/UIModels/InforceZone.model';
import { WriteToServerDataModel } from '@core/models/webModels/WriteToServerData.model';
import { ConfigurationService } from '@core/services/configurationService.service';
import { INFORCE_WELL_ARCHITECTURE } from '@core/services/well.service';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { IConfirmShiftDialogData } from '../inforce-confirm-shift-dialog/inforce-confirm-shift-dialog.component';

@Component({
  selector: 'app-downhole-valve-position-dialog',
  templateUrl: './downhole-valve-position-dialog.component.html',
  styleUrls: ['./downhole-valve-position-dialog.component.scss']
})
export class DownholeValvePositionDialogComponent implements OnInit {
  updateBtnVisiblity = false;
  isWellType2N = false;
  well: InforceWellUIModel;
  zoneList: MatTableDataSource<InforceZoneShiftUIModel>;
  valvePositionList: InforceZoneShiftUIModel[] = [];
  displayedColumns: string[] = ['ZoneName', 'CurrentPosition', 'NumberOfPositions'];
  confirmShiftDialogData: IConfirmShiftDialogData;

  constructor(public dialogRef: MatDialogRef<DownholeValvePositionDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: InforceWellUIModel,
    private gwModalService: GatewayModalService, private configService: ConfigurationService) {
    this.zoneList = new MatTableDataSource<InforceZoneShiftUIModel>();
  }

  getValidZoneList() {
    let zoneList: InforceZoneShiftUIModel[] = [];
    this.well.Zones.forEach(zone => {
      if (zone.ValveType !== ZONE_VALVE_TYPE.Monitoring) {
        // const filteredValvePosList = zone.ValvePositionsAndReturns.filter(valPos => valPos.UserSelectable !== false);
        const filteredValvePosList = zone.ValvePositionsAndReturns;
        const valvePosition = filteredValvePosList.find(valpos => valpos.ToPosition === zone.CurrentPosition) ?? filteredValvePosList[0];
        if (valvePosition) {
          const zoneObj: InforceZoneShiftUIModel = {
            WellId: zone.WellId,
            ZoneId: zone.ZoneId,
            ZoneName: zone.ZoneName,
            HcmId: zone.HcmId,
            CurrentPositionStateUnknownFlag: zone.CurrentPositionStateUnknownFlag,
            CurrentTargetPosition: {
              Id: valvePosition.ToPosition,
              Description: valvePosition.Description
            },
            SelectedTargetPosition: {
              Id: valvePosition.ToPosition,
              Description: valvePosition.Description
            },
            TargetValvePositionDd: filteredValvePosList
          };
          zoneList.push(zoneObj);
        }
      }
    });
    return zoneList;
  }

  OnCancel() {
    this.dialogRef.close();
  }
  OnSubmit() {
    this.confirmShiftDialogData.zoneList = this.valvePositionList
    this.dialogRef.close(this.confirmShiftDialogData);
  }

  onValvePositionChange(event, zoneId) {
    let zoneIdx = this.zoneList.data.findIndex(zone => zone.ZoneId === zoneId);
    if (zoneIdx !== -1) {
      if (this.zoneList.data[zoneIdx].CurrentPositionStateUnknownFlag == true) {
        this.clearUnknownStatusConfirmPopup(this.zoneList.data[zoneIdx]);
      }
      const valvePosition = this.zoneList.data[zoneIdx].TargetValvePositionDd.find(valPos => valPos.Description === event.value);
      this.zoneList.data[zoneIdx].SelectedTargetPosition.Id = valvePosition.ToPosition;
      this.zoneList.data[zoneIdx].SelectedTargetPosition.Description = valvePosition.Description;
    }
    this.updateBtnVisiblity = this.ValidateInforceZoneList();
  }

  clearUnknownStatusConfirmPopup(zone: InforceZoneShiftUIModel) {
    this.gwModalService.openDialog(
      'Do you want to clear "Current Position Unknown Flag"?',
      () => {
        this.clearUnknownFlag(zone);
      },
      () => this.gwModalService.closeModal(),
      '',
      null,
      true,
      "Yes",
      "No"
    );
  }

  clearUnknownFlag(zone: InforceZoneShiftUIModel) {
    let writeVar = new WriteToServerDataModel();
    writeVar.DeviceId = zone.HcmId;
    writeVar.PointIndex = InFORCEZone_HCM_PointIndex.CurrentPositionStateUnknownFlag;
    writeVar.PointName = "";
    writeVar.Value = 0;
    writeVar.WriteToServerCommandEnum = 1;
    this.configService.WriteToServer(writeVar).subscribe(() => {
      zone.CurrentPositionStateUnknownFlag = false;
      this.gwModalService.closeModal()
    });
  }

  // Check Valve Position changes
  ValidateInforceZoneList() {
    this.valvePositionList = [];
    this.zoneList.data.forEach(zone => {
      if (zone.CurrentTargetPosition.Id !== zone.SelectedTargetPosition.Id) {
        this.valvePositionList.push(zone);
      }
    });
    return this.valvePositionList.length > 0 ? true : false;
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
        zoneList: this.valvePositionList,
        wellType2N: this.well.ControlArchitectureId === INFORCE_WELL_ARCHITECTURE.TWO_N,
        closeAllSleeve: false
      }
    }
  }
}
