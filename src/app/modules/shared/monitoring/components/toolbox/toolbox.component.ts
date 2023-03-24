import { Component, OnDestroy, OnInit } from '@angular/core';

import { DataSourceFacade } from '@core/facade/dataSourceFacade.service';
import { GatewayPanelBase } from '@comp/GatewayPanelBase.component';

import { Store } from '@ngrx/store';
import { DataSourceUIModel } from '@core/models/UIModels/dataSource.model';
import { ToolConnectionUIModel } from '@core/models/UIModels/tool-connection.model';
import { PanelConfigurationFacade } from '@core/facade/panelConfigFacade.service';
import { FLOWMETER_TRASMITTER_TYPE, PanelTypeList, UICommon } from '@core/data/UICommon';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { RealTimeDataSignalRService } from '@core/services/realTimeDataSignalR.service';
// import { HyrdraulicPowerUnitPointIndex } from '@features/inforce/common/InForceModbusRegisterIndex';
import { WriteToServerDataModel } from '@core/models/webModels/WriteToServerData.model';
import { ConfigurationService } from '@core/services/configurationService.service';
import { Observable, Subscription } from 'rxjs';
import { IInforceDeviceState } from '@store/state/inforcedevices.state';
import { InforceDeviceDataModel } from '@core/models/webModels/InforceDeviceData.model';
import { StateUtilities } from '@store/state/IState';

import { INFORCEDEVICES_LOAD } from '@store/actions/inforcedevices.action';
import { IServerRunningStatusState } from '@store/state/serverRunningStatus.state';
import { IPanelDefaultState } from '@store/state/panel-default.state';
import { PanelDefaultUIModel } from '@core/models/UIModels/panel-default.model';
import * as PANEL_DEFAULT_ACTIONS from '@store/actions/panel-default.action';

@Component({
  selector: 'app-toolbox',
  templateUrl: './toolbox.component.html',
  styleUrls: ['./toolbox.component.scss']
})
export class ToolboxComponent extends GatewayPanelBase implements OnInit, OnDestroy {

  serverRunningStatusState$: Observable<IServerRunningStatusState>;
  bSavingConfigurationIsInProgress = false;

  InforceDeviceState$: Observable<IInforceDeviceState>;
  private inforcedevices: InforceDeviceDataModel[] = [];
  private hpuDeviceId: number;

  dataSource: DataSourceUIModel[];
  toolConnectionList: ToolConnectionUIModel[];
  showMaintainceMode: boolean = false;
  panelTypeSursens:boolean = false;
  isPanelinMaintainceMode: boolean = false;
  maintainceModeText = "Off";
  currentOperationMode: number;
  isCommunicated: boolean = false;
  FLUID_WELL = FLOWMETER_TRASMITTER_TYPE.Fluidwell;

  private static CurrentOperationMode: number = 53;
  private static CommStatus: number = 98;
  private static iFieldSlaveLockOutMode: number = 97;
  private static iFieldSlaveLockOutModeName: string = "iFieldSlaveLockOutMode";
  private panelDefaultState$: Observable<IPanelDefaultState>;
  panelDefaultData: PanelDefaultUIModel;

  private arrSubscriptions: Subscription[] = [];

  toggleConfig = {
    color: 'primary',
    checked: false,
    disabled: false
  }

  constructor(protected store: Store,
    panelConfigurationFacade: PanelConfigurationFacade,
    dataSourceFacade: DataSourceFacade,
    private configService: ConfigurationService,
    private realTimeSignalRService: RealTimeDataSignalRService) {
    super(store, panelConfigurationFacade, null, dataSourceFacade, null, null, null);
    this.serverRunningStatusState$ = this.store.select<any>((state: any) => state.serverRunningStatusState);
    this.InforceDeviceState$ = this.store.select<any>((state: any) => state.inforcedevicesState);
    this.panelDefaultState$ = this.store.select<IPanelDefaultState>((state: any) => state.panelDefaultState);
  }

  toggleMaintainanceMode(event: MatSlideToggleChange): void {
    let writeVar = new WriteToServerDataModel();
    writeVar.DeviceId = this.hpuDeviceId;
    writeVar.PointIndex = ToolboxComponent.iFieldSlaveLockOutMode;
    writeVar.PointName = ToolboxComponent.iFieldSlaveLockOutModeName;
    writeVar.Value = event.checked ? 1 : 0;
    writeVar.WriteToServerCommandEnum = 1;
    this.configService.WriteToServer(writeVar).subscribe();
  }

  private subscribeToServerRunningStatus(): void {
    const subscription = this.serverRunningStatusState$.subscribe(
      (state: IServerRunningStatusState) => {
        if (state) {
          this.bSavingConfigurationIsInProgress = state.ConfigurationSavingInProgress;
          if (!this.bSavingConfigurationIsInProgress && this.panelConfigurationCommonState && this.panelConfigurationCommonState.panelConfigurationCommon && this.panelConfigurationCommonState.panelConfigurationCommon.PanelTypeId === PanelTypeList.INFORCE) {
            this.subscribeToInforceDevices();
          }
        }
      }
    );
    this.arrSubscriptions.push(subscription);
  }

  private subscribeToInforceDevices(): void {
    const subscription = this.InforceDeviceState$.subscribe(
      (state: IInforceDeviceState) => {
        if (state !== undefined) {
          if (state.isLoaded === false && !StateUtilities.hasErrors(state)) {
            this.store.dispatch(INFORCEDEVICES_LOAD());
          } else {
            Object.assign(this.inforcedevices, state.inforcedevices);
            this.hpuDeviceId = this.inforcedevices.find(c => c.DeviceName == "HPU")?.DeviceId;
            this.subscribeToInFORCEPanelMaintainanceMode();
            this.subscribeToInFORCECommunicationStatus();
            this.subscribeToInFORCECurrentOperationMode();
          }
        }
      }
    );
    this.arrSubscriptions.push(subscription);
  }


  private subscribeToInFORCEPanelMaintainanceMode(): void {
    const subscription = this.realTimeSignalRService.GetRealtimeData(this.hpuDeviceId, ToolboxComponent.iFieldSlaveLockOutMode).subscribe(d => {
      if (d != undefined && d != null) {
        this.isPanelinMaintainceMode = d.Value == 1 ? true : false;
        this.maintainceModeText = d.Value == 1 ? "On" : "Off";
      }
    });

    this.arrSubscriptions.push(subscription);
  }

  private subscribeToInFORCECurrentOperationMode(): void {
    const subscription = this.realTimeSignalRService.GetRealtimeData(this.hpuDeviceId, ToolboxComponent.CurrentOperationMode).subscribe(d => {
      if (d != undefined && d != null) {
        this.currentOperationMode = d.Value;
      }
    });

    this.arrSubscriptions.push(subscription);
  }

  private subscribeToInFORCECommunicationStatus(): void {
    const subscription = this.realTimeSignalRService.GetRealtimeData(this.hpuDeviceId, ToolboxComponent.CommStatus).subscribe(d => {
      if (d != undefined && d != null) {
        this.isCommunicated = d.Value == 1 ? true : false;
      }
    });

    this.arrSubscriptions.push(subscription);
  }

  // Ge Panel Configuration
  postCallGetPanelConfigurationCommon(): void {
    if (this.panelConfigurationCommonState.panelConfigurationCommon.Id > 0) {
      this.showMaintainceMode = this.panelConfigurationCommonState.panelConfigurationCommon.PanelTypeId === PanelTypeList.INFORCE ? true : false;
      this.panelTypeSursens =   this.panelConfigurationCommonState.panelConfigurationCommon.PanelTypeId === PanelTypeList.SURESENS ? true : false;
      if (this.showMaintainceMode) {
        this.subscribeToInforceDevices();
        this.subscribeToPanelDefault();
      }
    }
  }

  // Get All Tool Connections
  postCallGetToolConnections(): void {
    this.toolConnectionList = this.toolConnectionEntity;
  }

  // Get All DataSources
  postCallGetDataSources(): void {
    this.dataSource = this.dataSourcesEntity ?? [];
  }

  private subscribeToPanelDefault(): void {
    const subscription = this.panelDefaultState$.subscribe(
      (state: IPanelDefaultState) => {
        if (state !== undefined) {
          if (state.isLoaded === false && !StateUtilities.hasErrors(state)) {
            this.store.dispatch(PANEL_DEFAULT_ACTIONS.LOAD_PANEL_DEFAULTS());
          } else {
            this.panelDefaultData = new PanelDefaultUIModel();
            Object.assign(this.panelDefaultData, state.panelDefaults);
          }
        }
      }
    );
    this.arrSubscriptions.push(subscription);
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

    super.ngOnDestroy();
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.subscribeToServerRunningStatus();
    this.initPanelConfigurationCommon();
    this.initDataSources();
    this.initToolConnections();   
  }
}
