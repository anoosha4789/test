import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { DEFAULT_eFCV_POSITIONS_STAGES } from '@core/data/UICommon';
import { PositionDescriptionDataModel } from '@core/models/webModels/PositionDescriptionDataModel.model';
import { SieModel } from '@core/models/webModels/Sie.model';
import { MultiNodeWellDataUIModel } from '@core/models/webModels/WellDataUIModel.model';
import { ButtonActions } from '@shared/gateway-dialogs/components/gateway-advanced-dialog/gateway-advanced-dialog.component';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { MultinodeMonitoringZone } from '../multinode-monitoring-card/multinode-monitoring-card.component';
import { ConfirmActuationComponent } from './confirm-actuation/confirm-actuation.component';

@Component({
  selector: 'app-perform-actuation-dialog',
  templateUrl: './perform-actuation-dialog.component.html',
  styleUrls: ['./perform-actuation-dialog.component.scss']
})
export class PerformActuationDialogComponent implements OnInit {
  actuationList: MatTableDataSource<PerformActuationUIModel>;
  well: MultiNodeWellDataUIModel;
  multinodeMonitoringZones: MultinodeMonitoringZone[][];
  displayedColumns: string[] = ['ZoneName', 'CurrentPosition', 'NumberOfPositions'];
  actuateBtnVisiblity: boolean = false;
  selectedZone: PerformActuationZoneModel;
  sies: SieModel[] = [];
  NOTSET = DEFAULT_eFCV_POSITIONS_STAGES.STAGE_NOTSET;

  constructor(public dialogRef: MatDialogRef<PerformActuationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data, private gatewayModalService: GatewayModalService,) {
    this.actuationList = new MatTableDataSource<PerformActuationUIModel>();
  }

  isEllipsisActive(value) {
    return Math.ceil(value.getBoundingClientRect().height) < value.scrollHeight;
  }
  getValidZoneList() {
    let actuationList: PerformActuationUIModel[] = [];
    let actuation: PerformActuationUIModel = new PerformActuationUIModel();
    let zoneList: PerformActuationZoneModel[] = [];
    const SIEGuid = this.getSIUId();
    this.well?.Zones?.forEach(zone => {
      const currentPosition = this.getCurrentPosition(zone.ZoneId);
      const currentPositionStage = this.getPositionStage(currentPosition);

      const zoneObj = {
        WellId: this.well.WellId,
        WellName: this.well.WellName,
        ZoneId: zone.ZoneId,
        SIEGuid: SIEGuid,
        eFCVGuid: zone.eFCVGuid,
        ZoneName: zone.ZoneName,
        HcmId: zone.HcmId,
        CurrentTargetPosition: currentPosition,
        CurrentTargetPositionStage: currentPositionStage,
        SelectedTargetPosition: currentPosition,
        SelectedTargetPositionStage: currentPositionStage,
        isPositionValid: currentPositionStage !== this.NOTSET,
        TargetValvePositionDd: this.well.PositionDescriptionData.filter(des => des.PositionStage !== DEFAULT_eFCV_POSITIONS_STAGES.STAGE_NOTSET),
      };
      zoneList.push(zoneObj);
    });
    actuation.Zones = zoneList;
    actuation.SelectedZone = zoneList[0];
    this.selectedZone = zoneList[0];
    actuationList.push(actuation);
    return actuationList;
  }

  getSIUId() {
    let SIU_Id = ""
    for (let index = 0; index < this.sies?.length; index++) {
      const sie = this.sies[index];
      const wellLink = sie?.SIEWellLinks?.find(w => w.WellId === this.well?.WellId);
      if (wellLink) {
        SIU_Id = sie.SIEGuid;
        break;
      }
    }
    return SIU_Id;
  }

  getCurrentPosition(ZoneId) {
    let position = "";
    this.multinodeMonitoringZones.forEach(multinodeMonitoringZone => {
      multinodeMonitoringZone.forEach(monitoringZone => {
        if (monitoringZone.zone.ZoneId === ZoneId) {
          position = monitoringZone.Position;
        }
      });
    });
    return position;
    // return this.multinodeMonitoringZones.find(z => z.zone?.ZoneId === zone.ZoneId)?.Position ?? "";
  }

  onZoneChange(event, actuation: PerformActuationUIModel) {
    this.actuateBtnVisiblity = false;
    this.setSelectedTargetPosition(actuation, event.value);
  }

  setSelectedTargetPosition(actuation: PerformActuationUIModel, zoneId) {
    const currentPosition = this.getCurrentPosition(zoneId);
    actuation.SelectedZone = this.getSelectedZone(zoneId, actuation.Zones);
    actuation.SelectedZone.SelectedTargetPosition = currentPosition;
    const currentPositionStage = this.getPositionStage(currentPosition);
    actuation.SelectedZone.SelectedTargetPositionStage = currentPositionStage;
    actuation.SelectedZone.isPositionValid = currentPositionStage !== this.NOTSET;
    if (actuation.SelectedZone.isPositionValid === false)
      this.actuateBtnVisiblity = true;
    this.selectedZone = actuation.SelectedZone;
  }

  getSelectedZone(zoneId, zones: PerformActuationZoneModel[]) {
    return zones.find(z => z.ZoneId === zoneId);
  }

  getPositionStage(position: string) {
    return this.well?.PositionDescriptionData.find(des => des.Description === position)?.PositionStage ?? "";
  }

  isValid(zone: PerformActuationZoneModel) {
    return zone.CurrentTargetPosition !== zone.SelectedTargetPosition;
  }

  onPositionChange(event, actuation: PerformActuationUIModel) {
    this.actuateBtnVisiblity = this.isValid(actuation.SelectedZone);
    const currentPosition = actuation.SelectedZone.SelectedTargetPosition;
    actuation.SelectedZone.SelectedTargetPositionStage = this.getPositionStage(currentPosition);
  }

  openConfirmActuationDialog() {
    const dialogData = { actuateZone: this.selectedZone }
    this.gatewayModalService.openDialogInsideModal(
      'Confirm Actuation',
      ButtonActions.None,
      ConfirmActuationComponent,
      dialogData,
      (result) => {
        if (result) {
          this.dialogRef.close('ok');
        }
      },
      '350px',
      null
    );
  }

  OnSubmit() {
    this.openConfirmActuationDialog();
  }

  OnCancel() {
    this.dialogRef.close();
  }

  ngOnInit(): void {
    this.well = this.data?.well;
    this.sies = this.data?.sies;
    this.multinodeMonitoringZones = this.data?.multinodeMonitoringZones;
    this.actuationList.data = this.getValidZoneList();
    if (this.selectedZone.isPositionValid === false)
      this.actuateBtnVisiblity = true;
  }
}

export class PerformActuationUIModel {
  Zones: PerformActuationZoneModel[];
  SelectedZone: PerformActuationZoneModel;
}

export class PerformActuationZoneModel {
  WellId: number;
  WellName: string;
  ZoneId: number;
  SIEGuid: string;
  eFCVGuid: string;
  ZoneName: string;
  HcmId: number;
  CurrentTargetPosition?: string;
  CurrentTargetPositionStage?: string;
  SelectedTargetPosition?: string;
  SelectedTargetPositionStage?: string;
  isPositionValid?: boolean;
  TargetValvePositionDd?: PositionDescriptionDataModel[];
}
