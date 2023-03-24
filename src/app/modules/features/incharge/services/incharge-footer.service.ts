import { Injectable } from '@angular/core';
import { WellDataPointIndex, ZoneDataPointIndex } from '@core/data/UICommon';
import { FooterStatus, footerStatusType, GwFooterService } from '@core/services/gw-footer-service.service';
import { RealTimeDataSignalRService } from '@core/services/realTimeDataSignalR.service';
import { UserService } from '@core/services/user.service';
import { UtilityService } from '@core/services/utility.service';
import { Store } from '@ngrx/store';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { selectAllWells, selectWellState } from '@store/reducers/well.entity.reducer';
import { IWellEntityState } from '@store/state/well.state';
import { InchargeModule } from '../incharge.module';

import * as WELL_ACTIONS from '@store/actions/well.entity.action';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: InchargeModule
})
export class InchargeFooterService {

  wellOperationMode: Map<number, boolean> = new Map<number, boolean>();
  calibrationStatusMap: Map<number, ZonePumpCalibrationStatus> = new Map<number, ZonePumpCalibrationStatus>();
  shiftStatusMap: Map<number, ZonePumpShiftStatus> = new Map<number, ZonePumpShiftStatus>();

  footerPanelStatus: FooterStatus = null;

  private dataSubscriptions: Subscription[] = [];

  constructor(protected store: Store, 
    private realTimeService: RealTimeDataSignalRService, 
    private gwFooterService: GwFooterService,
    private gwModalService: GatewayModalService) {
      this.initializeFooter();
  }

  initializeFooter() {
    this.initInCHARGEWells();
  }

  private initInCHARGEWells() {
    let subscription = this.store.select<any>(selectWellState).subscribe((state: IWellEntityState) => {
      if (state && !state.isLoaded) {
        this.store.dispatch(WELL_ACTIONS.WELL_LOAD());
      }
      else {
        let wellSubscription = this.store.select<any>(selectAllWells).subscribe(wellData => {
          this.wellOperationMode.clear();
          this.footerPanelStatus = {
            showPanelStatus: true,
            shifting: false,
            shiftWell: null,
            footerProperties: []
          };
          this.footerPanelStatus.footerProperties.push({ DisplayName: "Mode", Status: "Idle", statusType: footerStatusType.OperationMode });
          wellData.forEach((well, index) => {
            if (well.WellId > 0) {
              let deviceSubs = this.realTimeService.GetRealtimeData(well.WellDeviceId, WellDataPointIndex.WellOperationMode).subscribe((d) => {
                if (d !== undefined && d !== null) {
                  this.wellOperationMode.set(d.DeviceId, d.Value == 1 ? true : false);
                  this.checkWellOperationModeStatus();
                }
              });
              this.dataSubscriptions.push(deviceSubs);


              // Get Zones and set Pump Calibration status monitoring
              this.calibrationStatusMap.clear();
              well?.Zones?.forEach(zone => {

                // Calibration Status
                let zoneDeviceSubs = this.realTimeService.GetRealtimeData(zone.ZoneDeviceId, ZoneDataPointIndex.StartPumpCalibration).subscribe(d => {
                  if (d !== undefined && d !== null) {
                    let pumpCalibrationData: ZonePumpCalibrationStatus = {
                      isCalibrating: (d.Value == 1 ? true : false),
                      wellName: well.WellName,
                      zoneName: zone.ZoneName,
                      zoneDeviceId: zone.ZoneDeviceId
                    };
                    this.checkPumpOperationStatus(d.DeviceId, pumpCalibrationData);
                  }
                });
                this.dataSubscriptions.push(zoneDeviceSubs);
              });
            }
          });
        }
        );
        this.dataSubscriptions.push(wellSubscription);
      }
    });
    this.dataSubscriptions.push(subscription);
  }

  private checkWellOperationModeStatus(): void {
    let bShiftStatus = false;
    this.footerPanelStatus.shifting = false;
    this.wellOperationMode.forEach(value => {
      bShiftStatus = bShiftStatus || value;
    });
    if (bShiftStatus) {
      this.footerPanelStatus.shifting = true;
      // this.systemStatus = SystemStatus.ShiftInProgress;
      this.footerPanelStatus.footerProperties[0].Status = "Shifting";  // this.panelOperationMode = "InCHARGE Shift";
    }
    else {
      this.footerPanelStatus.footerProperties[0].Status = "Idle";
    }
    this.gwFooterService.updateFooterPanelStatus(this.footerPanelStatus);
  }

  private checkPumpOperationStatus(deviceId: number, pumpCalibrationData: ZonePumpCalibrationStatus): void {
    // Calibration Status
    let calibrationStatus = this.calibrationStatusMap.get(deviceId);
    if (calibrationStatus != null) {
      if (calibrationStatus.isCalibrating == true && pumpCalibrationData.isCalibrating == false) {
        this.gwModalService.dialog.closeAll();
        this.gwModalService.openDialog(
          this.getProcessStatusMsg(pumpCalibrationData.zoneDeviceId, OperationType.CALIBRATE),
          () => this.gwModalService.closeModal(),
          null,
          'Calibration Operation: ' + pumpCalibrationData.wellName + ' - ' + pumpCalibrationData.zoneName,
          null,
          null,
          null,
          null,
          '440px'
        );
      }
    } else {
      // Shift Status
      let zoneDeviceShiftSubs = this.realTimeService.GetRealtimeData(pumpCalibrationData.zoneDeviceId, ZoneDataPointIndex.AutoShiftStatus).subscribe(d => {
        if (d !== undefined && d !== null) {
          let pumpShiftData: ZonePumpShiftStatus = {
            isShifting: (d.Value == 1 ? true : false),
            wellName: pumpCalibrationData.wellName,
            zoneName: pumpCalibrationData.zoneName,
            zoneDeviceId: pumpCalibrationData.zoneDeviceId
          };
          this.checkPumpShiftStatus(d.DeviceId, pumpShiftData);
        }
        this.dataSubscriptions.push(zoneDeviceShiftSubs);
      });
    }
    this.calibrationStatusMap.set(deviceId, pumpCalibrationData);
  }

  private checkPumpShiftStatus(deviceId: number, pumpShiftData: ZonePumpShiftStatus): void {
    let shiftStatus = this.shiftStatusMap.get(deviceId);
    if (shiftStatus != null) {
      if (shiftStatus.isShifting == true && pumpShiftData.isShifting == false) {
        this.gwModalService.openDialog(
          this.getProcessStatusMsg(shiftStatus.zoneDeviceId, OperationType.SHIFT),
          () => this.gwModalService.closeModal(),
          null,
          'Shift Operation: ' + pumpShiftData.wellName + ' - ' + pumpShiftData.zoneName,
          null,
          null,
          null,
          null,
          '440px'
        );
      }
    }
    this.shiftStatusMap.set(deviceId, pumpShiftData);
  }

  private getProcessStatusMsg(zoneDeviceId: number, operationType: number): string {
    let statusMsg = null;
    let isShiftCompleted = this.getShiftStatus(zoneDeviceId);
    let zoneDeviceSubs = this.realTimeService.GetRealtimeData(zoneDeviceId, ZoneDataPointIndex.PumpOperationMode).subscribe(d => {
      if (d !== undefined && d !== null) {
        const operationMode = d.Value;
        switch (operationMode) {

          case InCHARGEOperationMode.IDLE:
            if (operationType === OperationType.SHIFT) {
              statusMsg = isShiftCompleted ? "The eHCM-P valve shift operation has finished." :
                "The eHCM-P valve shift operation is aborted.";
            } else {
              statusMsg = "The eHCM-P valve Full Shift Volume calibration operation has finished.";
            }
            break;

          case InCHARGEOperationMode.AUTOSHIFT:
            if (operationType === OperationType.SHIFT) {
              statusMsg = isShiftCompleted ? "The eHCM-P valve shift operation has finished." :
                "The eHCM-P valve shift operation is aborted.";
            } else {
              statusMsg = "The eHCM-P valve Full Shift Volume calibration operation has finished.";
            }
            break;

          case InCHARGEOperationMode.AUTOSHIFT_ABORTED:
            if (operationType == OperationType.SHIFT) {
              statusMsg = "The eHCM-P valve shift operation is cancelled by operator.";
            } else {
              statusMsg = "The eHCM-P valve Full Shift Volume calibration operation is cancelled by operator.";
            }
            break;
        }

      }
      this.dataSubscriptions.push(zoneDeviceSubs);
    });
    return statusMsg;
  }

  getShiftStatus(zoneDeviceId: number) {
    let status = true;
    let targetPositionSub = this.realTimeService.GetRealtimeData(zoneDeviceId, ZoneDataPointIndex.TargetValveOpeiningPercentage).subscribe(d => {
      if (d !== undefined && d !== null) {
        let targetPosition = d.Value;
        let currentPositionSub = this.realTimeService.GetRealtimeData(zoneDeviceId, ZoneDataPointIndex.CurrentValveOpeningPercentage).subscribe(d => {
          if (d !== undefined && d !== null) {
            status = Math.abs(d.Value - targetPosition) <= 1 ? true : false;
          }
        });
        this.dataSubscriptions.push(currentPositionSub);
      }
    });
    this.dataSubscriptions.push(targetPositionSub);
    return status;
  }

}

export class ZonePumpCalibrationStatus {
  isCalibrating: boolean;
  wellName: string;
  zoneName: string;
  zoneDeviceId: number;
}

export class ZonePumpShiftStatus {
  isShifting: boolean;
  wellName: string;
  zoneName: string;
  zoneDeviceId: number;
}

enum OperationType {
  SHIFT = 0,
  CALIBRATE = 1
}

enum InCHARGEOperationMode {
  IDLE = 0,
  AUTOSHIFT,
  AUTOSHIFT_DISABLED,
  AUTOSHIFT_ABORTED,
}