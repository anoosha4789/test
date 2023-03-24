import { Injectable } from '@angular/core';
import { InforceDeviceDataModel } from '@core/models/webModels/InforceDeviceData.model';
import { FooterStatus, footerStatusType, GwFooterService } from '@core/services/gw-footer-service.service';
import { RealTimeDataSignalRService } from '@core/services/realTimeDataSignalR.service';
import { IInforceDeviceState } from '@store/state/inforcedevices.state';
import { StateUtilities } from '@store/state/IState';
import { Observable, Subscription } from 'rxjs';
import { InforceModule } from '../inforce.module';

import * as WELL_ACTIONS from '@store/actions/well.entity.action';
import { WELL_LOAD } from '@store/actions/well.entity.action';
import { INFORCEDEVICES_LOAD } from '@store/actions/inforcedevices.action';
import { UNITSYSTEM_LOAD } from '@store/actions/unit-system.action';
import { Store } from '@ngrx/store';
import { HyrdraulicPowerUnitPointIndex, InforceWellDevicePointIndex, ModuleE1260PointIndex, OperationMode } from '@features/inforce/common/InForceModbusRegisterIndex';
import { UtilityService } from '@core/services/utility.service';
import { IUnitSystemState } from '@store/state/unit-system.state';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { UICommon } from '@core/data/UICommon';
import { ButtonActions } from '@shared/gateway-dialogs/components/gateway-advanced-dialog/gateway-advanced-dialog.component';
import { EndOfShiftDialogComponent } from '../components/end-of-shift-dialog/end-of-shift-dialog.component';
import { UserService } from '@core/services/user.service';
import { selectAllWells, selectWellState } from '@store/reducers/well.entity.reducer';
import { IWellEntityState } from '@store/state/well.state';
import { INFORCE_WELL_ARCHITECTURE } from '@core/services/well.service';

@Injectable({
  providedIn: InforceModule
})
export class InforceFooterService {

  private inforceDeviceState$: Observable<IInforceDeviceState>;
  private unitSystemState$: Observable<IUnitSystemState>;
  
  private inForceDevices: InforceDeviceDataModel[] = [];
  private inFORCEShiftStatus: number;
  private hpuDeviceId: number;
  private previousOperation: number;

  footerPanelStatus: FooterStatus = null;
  tempratureUnitSymbol: string = "°F";
  wellEntity: any[];

  private dataSubscriptions: Subscription[] = [];
  
  constructor(protected store: Store, 
    private realTimeService: RealTimeDataSignalRService, 
    private gwFooterService: GwFooterService,
    private gwModalService: GatewayModalService,
    private userService: UserService,
    private utilityService: UtilityService) {
      this.inforceDeviceState$ = this.store.select<IInforceDeviceState>((state: any) => state.inforcedevicesState);
      this.unitSystemState$ = this.store.select<IUnitSystemState>((state: any) => state.unitSystemState);
      this.initializeFooter();
  }

  initializeFooter(): void {
    this.subscribeToInforceDevices();
    this.subscribeToInFORCEWellEntityStore();
    this.subscribeToUnitSystems();
  }

  private subscribeToInforceDevices(): void {
    const subscription = this.inforceDeviceState$.subscribe(
      (state: IInforceDeviceState) => {
        if (state !== undefined) {
          if (state.isLoaded === false && !StateUtilities.hasErrors(state)) {
            this.store.dispatch(INFORCEDEVICES_LOAD());
          } else {
            Object.assign(this.inForceDevices, state.inforcedevices);
            if (this.inForceDevices.length > 0) {
              this.hpuDeviceId = this.inForceDevices.find(c => c.DeviceName == "HPU")?.DeviceId;
            }
            this.subScribeToInFORCEStatus();
            this.subscribeToOperationModeStatus();
          }
        }
      }
    );
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
            this.tempratureUnitSymbol = state.unitSystem.UnitQuantities.find(c => c.UnitQuantityName === "thermodynamic_temperature").SelectedDisplayUnitSymbol;
          }
        }
      }
    );

    this.dataSubscriptions.push(subscription);
  }

  private subScribeToInFORCEStatus(): void {
    this.footerPanelStatus = {
      showPanelStatus: true,
      shifting: false,
      shiftWell: {
        wellId: -1,
        navigateAddress: ""
      },
      footerProperties: []
    };
    // Operation Mode
    this.footerPanelStatus.footerProperties.push({ DisplayName: "Mode", Status: "Idle", statusType: footerStatusType.OperationMode });
    let hpuDeviceId = this.inForceDevices.find(d => d.DeviceName === "HPU")?.DeviceId;
    let subscription = this.realTimeService.GetRealtimeData(hpuDeviceId, HyrdraulicPowerUnitPointIndex.CurrentOperationMode).subscribe(value => {

      if (value !== undefined && value !== null) {
        this.footerPanelStatus.shifting = true;
        this.inFORCEShiftStatus = value.Value;
        this.utilityService.setShiftStatus(this.inFORCEShiftStatus);  // Update shift status
        if (value.Value === OperationMode.Idle) {
          this.footerPanelStatus.footerProperties[0].Status = "Idle";
          this.footerPanelStatus.shifting = false;
          if (this.previousOperation == OperationMode.AutoShift) {
            this.processEndOfShift();
            this.footerPanelStatus.footerProperties[2].hide = true;
          }
        }
        else if (value.Value === OperationMode.AutoShift) {
          this.footerPanelStatus.footerProperties[0].Status = "Auto Shift";
        }
        else if (value.Value === OperationMode.VentAll)
          this.footerPanelStatus.footerProperties[0].Status = "Vent";
        else if (value.Value === OperationMode.Recirculation)
          this.footerPanelStatus.footerProperties[0].Status = "Recirculate";
        else if (value.Value === OperationMode.Manual)
          this.footerPanelStatus.footerProperties[0].Status = "Manual";

        this.previousOperation = value.Value;

        this.gwFooterService.updateFooterPanelStatus(this.footerPanelStatus);
      }
    });
    this.dataSubscriptions.push(subscription);

    // Elect. Temp.
    this.footerPanelStatus.footerProperties.push({ DisplayName: "Elec. Temp.", Status: "-999", statusType: footerStatusType.Normal });
    let module1260DeviceId = this.inForceDevices.find(d => d.DeviceName === "ModuleE1260")?.DeviceId;
    subscription = this.realTimeService.GetRealtimeData(module1260DeviceId, ModuleE1260PointIndex.RTDElectricalEnclosureTemperature).subscribe(value => {
      if (value !== undefined && value !== null) {
        this.footerPanelStatus.footerProperties[1].Status = parseFloat(value.Value.toFixed(2)) + " " + this.tempratureUnitSymbol;
        this.gwFooterService.updateFooterPanelStatus(this.footerPanelStatus);
      }
    });
    this.dataSubscriptions.push(subscription);

    // Shift Input
    this.footerPanelStatus.footerProperties.push({ DisplayName: "Input Required", Status: "", statusType: footerStatusType.Input, hide: true });
    this.gwFooterService.updateFooterPanelStatus(this.footerPanelStatus); // Initial
  }

  private subscribeToOperationModeStatus(): void {
    let hpuDeviceId = this.inForceDevices.find(d => d.DeviceName === "HPU")?.DeviceId;
    let subscription = this.realTimeService.GetRealtimeData(hpuDeviceId, HyrdraulicPowerUnitPointIndex.OperationModeAlarmStatus).subscribe(value => {
      if (this.inFORCEShiftStatus === OperationMode.AutoShift) {
        if (value != null && ((value.Value & 2) > 0 || (value.Value & 4) > 0 || (value.Value & 8) > 0)) {
          this.footerPanelStatus.footerProperties[2].hide = false;
        }
        else if (value != null && value.Value == 0) {
          this.footerPanelStatus.footerProperties[2].hide = true;
        }
        this.gwFooterService.updateFooterPanelStatus(this.footerPanelStatus);
      }
    });
    this.dataSubscriptions.push(subscription);
  }

  private subscribeToShiftWell(): void {
    this.wellEntity.forEach(inforceWell => {
      let subscription = this.realTimeService.GetRealtimeData(inforceWell.WellDeviceId, InforceWellDevicePointIndex.SelectedToRunAutoShiftingIndex).subscribe(dataPoint => {
        if (dataPoint && dataPoint.Value == 1) {
          this.footerPanelStatus.shiftWell = {
            wellId:  inforceWell.WellId,
            navigateAddress: `/inforce/monitoring/well/${inforceWell.WellId}/viewshift`
          };
          this.gwFooterService.updateFooterPanelStatus(this.footerPanelStatus);
        }
      });
      this.dataSubscriptions.push(subscription);
    });
  }

  private subscribeToInFORCEWellEntityStore() {
    let wellSubscription = this.store.select<any>(selectWellState).subscribe((state: IWellEntityState) => {
      if (state && !state.isLoaded) {
        this.store.dispatch(WELL_ACTIONS.WELL_LOAD());
      }
      else {
        let wellDataSubscription = this.store.select<any>(selectAllWells).subscribe(wells => {
          const filteredWells = wells.filter(well => well.ControlArchitectureId != INFORCE_WELL_ARCHITECTURE.SURESENS);
          this.wellEntity = filteredWells;
          this.subscribeToShiftWell();
        });
        this.dataSubscriptions.push(wellDataSubscription);
      }
    });
    this.dataSubscriptions.push(wellSubscription);
  }

  showEndOfShiftDialog() {
    const dialogData = { well: this.wellEntity, hpuId: this.hpuDeviceId }
    if (this.gwModalService.dialog) {
      this.gwModalService.dialog.closeAll();
    }
    this.userService.GetCurrentLoginUser().then(user => {
      if (user && user?.Name !== UICommon.OPENUSER_NAME) {
        this.gwModalService.openAdvancedDialog(
          'End of Shift',
          ButtonActions.None,
          EndOfShiftDialogComponent,
          dialogData,
          (result) => { },
          '750px',
          null,
          null,
          null,
          "gw-end-of-shift-dialog"
        );
      }
    })
  }

  private processEndOfShift(): void {
    this.store.dispatch(WELL_LOAD());
    this.showEndOfShiftDialog();
  }
}
