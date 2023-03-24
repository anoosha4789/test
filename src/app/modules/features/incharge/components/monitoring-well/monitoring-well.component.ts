import { Component, HostListener, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { GatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { CardDataPointIndex, ToolDataPointIndex, SureSENSDataPointIndex, UICommon, ZoneDataPointIndex, TOOL_STATUS, ESPToolDataPointIndex } from '@core/data/UICommon';
import { DataSourceFacade } from '@core/facade/dataSourceFacade.service';
import { DeviceDataPointsFacade } from '@core/facade/deviceDataPointsFacade.service';
import { WellFacade } from '@core/facade/wellFacade.service';
import { InchargeZoneUIModel } from '@core/models/UIModels/incharge.zone.model';
import { ToolConnectionUIModel } from '@core/models/UIModels/tool-connection.model';
import { DataPointDefinitionModel } from '@core/models/webModels/DataPointDefinition.model';
import { RealTimeDataSignalRService } from '@core/services/realTimeDataSignalR.service';
import { ToolConnectionService } from '@core/services/tool-connection.service';
import { UserService } from '@core/services/user.service';
import { Store } from '@ngrx/store';
import * as _ from 'lodash';
import { Observable, Subscription } from 'rxjs';
import { String } from 'typescript-string-operations';

import { LOAD_DEVICES, LOAD_DATAPOINTDEF } from '@store/actions/deviceDataPoints.action';
import { TOOL_CONNECTIONS_LOAD } from '@store/actions/tool-connection.entity.action';
import { IServerRunningStatusState } from '@store/state/serverRunningStatus.state';
import { SureSENSToolType, SureSENS_ESP_Type } from '@core/models/webModels/SureSENSGaugeData.model';
import { InChargeMonitoringTool, InChargeMonitoringZone } from '@core/models/UIModels/monitoring.model';

@Component({
  selector: 'incharge-monitoring-well',
  templateUrl: './monitoring-well.component.html',
  styleUrls: ['./monitoring-well.component.scss']
})
export class MonitoringWellComponent extends GatewayPanelBase implements OnInit, OnChanges, OnDestroy {

  @Input()
  wellId: number;

  @Input()
  wellZones: InchargeZoneUIModel[];

  inchargeMonitoringZones: InChargeMonitoringZone[];
  toolConnections: ToolConnectionUIModel[];
  deviceIndexArray: DataPointDefinitionModel[];
  portingList: any[];
  bIsMobileView: boolean = false;
  cardStatus = UICommon.CARD_STATUS_DISCONNECT;
  private serverRunningStatusState$: Observable<IServerRunningStatusState>;
  private dataSubscriptions: Subscription[] = [];

  constructor(protected store: Store,
    private router: Router,
    private wellDataFacade: WellFacade,
    private dataSourceFacade: DataSourceFacade,
    private dataPointFacade: DeviceDataPointsFacade,
    private userService: UserService,
    private toolConnectionService: ToolConnectionService,
    private realTimeService: RealTimeDataSignalRService) { 
      super(store, null, wellDataFacade, dataSourceFacade, null, dataPointFacade, null);
      this.serverRunningStatusState$ = this.store.select<any>((state: any) => state.serverRunningStatusState);
  }

  navigateShift(deviceId: number, zoneId: number) {
    // https://localhost/incharge/shift?deviceId=7&zoneId=1
    let address = String.Format("incharge/shift?deviceId={0}&zoneId={1}", deviceId, zoneId);
    this.userService.GetCurrentLoginUser().then((x) => {
      if (x !== undefined && x != null && x.Name !== UICommon.OPENUSER_NAME) {
        this.router.navigateByUrl("/" + address);
      } else {
        UICommon.LogInRouteURL = address;
        this.router.navigate(['/Login']);
      }
    });
  }

  navigateTool(toolDeviceId: string) {
    // [routerLink]="['tool', tool.tool.DeviceId]"
    let address = String.Format("incharge/monitoring/tool/{0}", toolDeviceId);
    this.userService.GetCurrentLoginUser().then((x) => {
      if (x !== undefined && x != null && x.Name !== UICommon.OPENUSER_NAME) {
        this.router.navigateByUrl("/" + address);
      } else {
        UICommon.LogInRouteURL = address;
        this.router.navigate(['/Login']);
      }
    });
  }

  private setUpRealtimeSubscription_1(): void {
    if (this.deviceIndexArray.length > 0) {
      this.deviceIndexArray.forEach((element) => {
        let deviceSubs = null;
        deviceSubs = this.realTimeService
          .GetRealtimeData(element.DeviceId, element.DataPointIndex)
          .subscribe((d) => {
            if (d !== undefined && d !== null) {
              element.RawValue = d.Value;
            }
            this.dataSubscriptions.push(deviceSubs);
          });
      });
    }
  }

  private getDeviceByPointIndex(deviceId: number, pointIndex: number): DataPointDefinitionModel {
    let index = this.datapointdefinitions.findIndex(d => d.DeviceId === deviceId && d.DataPointIndex == pointIndex)??-1;
    if (index !== -1) {
      const dp = new DataPointDefinitionModel();
      dp.DataPointIndex = this.datapointdefinitions[index].DataPointIndex;
      dp.DataType = this.datapointdefinitions[index].DataType;
      dp.DeviceId = this.datapointdefinitions[index].DeviceId;
      dp.RawValue = -999;
      dp.ReadOnly = this.datapointdefinitions[index].ReadOnly;
      dp.TagName = this.datapointdefinitions[index].TagName;
      dp.UnitQuantityType = this.datapointdefinitions[index].UnitQuantityType;
      dp.UnitSymbol = this.datapointdefinitions[index].UnitSymbol;

      this.deviceIndexArray.push(dp);
      return dp;
    }
      
    return new DataPointDefinitionModel();  // return empty DataPointDefinitionModel
  }

  private getPortingTool(tool: ToolConnectionUIModel): InChargeMonitoringTool {
    let toolGauge = this.dataSourceFacade.getToolGauge(tool.ChannelId, tool.CardDeviceId, tool.DeviceId);
    const isESPGauge = (toolGauge && toolGauge.GaugeType === SureSENSToolType.ESP) ? true : false;
    let inChargeTool = new InChargeMonitoringTool();
    inChargeTool.tool = tool;
    inChargeTool.pressureDevice = this.getDeviceByPointIndex(tool.DeviceId, SureSENSDataPointIndex.Pressure);
    if(isESPGauge) {
      inChargeTool.temperatureDevice = this.getDeviceByPointIndex(tool.DeviceId, ESPToolDataPointIndex.MotorWindingTemperature);
    } else {
      inChargeTool.temperatureDevice = this.getDeviceByPointIndex(tool.DeviceId, SureSENSDataPointIndex.Temperature);
    }
    if (inChargeTool.temperatureDevice && inChargeTool.temperatureDevice.UnitSymbol) {
      inChargeTool.temperatureDevice.UnitSymbol = inChargeTool.temperatureDevice.UnitSymbol;
    }
    inChargeTool.diagnosticsDevice = this.getDeviceByPointIndex(tool.DeviceId, ToolDataPointIndex.Diagnostics);
    inChargeTool.diagnosticsCard = this.getDeviceByPointIndex(tool.CardDeviceId, CardDataPointIndex.CommStatus);

    return inChargeTool;
  }

  private getToolsForRealtimeSubscription(zoneId: number): InChargeMonitoringTool[] {
    let inChargeTools: InChargeMonitoringTool[] = [];
    let annulusTools =  this.toolConnections.filter(t => t.WellId === this.wellId && t.ZoneId === zoneId && t.PortingId == this.portingList[0].Id)??[];
    let tubingTools =  this.toolConnections.filter(t => t.WellId === this.wellId && t.ZoneId === zoneId && t.PortingId == this.portingList[1].Id)??[];
    if (annulusTools.length > 0 && tubingTools.length > 0) {
      inChargeTools.push(this.getPortingTool(annulusTools[0]));
      inChargeTools.push(this.getPortingTool(tubingTools[0]));
    }
    else if (annulusTools.length > 0) {
      inChargeTools.push(this.getPortingTool(annulusTools[0]));
      if (annulusTools.length > 1)
        inChargeTools.push(this.getPortingTool(annulusTools[1]));
    }
    else if (tubingTools.length > 0) {
      inChargeTools.push(this.getPortingTool(tubingTools[0]));
      if (tubingTools.length > 1)
        inChargeTools.push(this.getPortingTool(tubingTools[1]));
    }

    return inChargeTools;
  }

  private getZoneDeviceForInChargeTool(zoneId: number, zoneDeviceId: number): DataPointDefinitionModel {
    let inxTool = this.toolConnections.findIndex(t => t.WellId === this.wellId && t.ZoneId === zoneId && t.PortingId == -1)??-1;
    if (inxTool != -1) {
      return this.getDeviceByPointIndex(zoneDeviceId, ZoneDataPointIndex.CurrentValveOpeningPercentage);
    }
    return null;
  }

  private getPumpOperationModeDevice(zoneId: number, zoneDeviceId: number): DataPointDefinitionModel {
    let inxTool = this.toolConnections.findIndex(t => t.WellId === this.wellId && t.ZoneId === zoneId && t.PortingId == -1)??-1;
    if (inxTool != -1) {
      return this.getDeviceByPointIndex(zoneDeviceId, ZoneDataPointIndex.PumpOperationMode);
    }
    return null;
  }

  private getInChargeTool(zoneId: number): ToolConnectionUIModel {
    let inxTool = this.toolConnections.findIndex(t => t.WellId === this.wellId && t.ZoneId === zoneId && t.PortingId == -1)??-1;
    if (inxTool != -1) {
      return this.toolConnections[inxTool];
    }
    return null;
  }

  private updateMonitoringZones(): void {
    if (!this.datapointdefinitions || this.datapointdefinitions.length == 0)
      return;

    this.deviceIndexArray = [];
    if (this.toolConnections && this.toolConnections.length > 0) {
      this.inchargeMonitoringZones = [];
      this.wellZones.forEach(zone => {
        let inChargeZone = new InChargeMonitoringZone();
        inChargeZone.zone = zone;
        inChargeZone.inchargeTool = this.getInChargeTool(zone.ZoneId);
        inChargeZone.zoneDevice = this.getZoneDeviceForInChargeTool(zone.ZoneId, zone.ZoneDeviceId);
        inChargeZone.pumpOperationModeDevice = this.getPumpOperationModeDevice(zone.ZoneId, zone.ZoneDeviceId);
        inChargeZone.tools = this.getToolsForRealtimeSubscription(zone.ZoneId);
        this.inchargeMonitoringZones.push(inChargeZone);
      });
    }
    this.setUpRealtimeSubscription_1();
  }

  getToolStatusCode(statusCode : number) {
    let toolStausCode : number;
    if(statusCode === TOOL_STATUS.valid) { 
      toolStausCode = 0;
    } else if(UICommon.TOOL_DIAGNOSTICS_CODES.findIndex(c => c === statusCode) !== -1) { 
      toolStausCode = TOOL_STATUS.warning;
    } else {
      toolStausCode = TOOL_STATUS.critical; 
    }
    return toolStausCode;
  }

  private subscribeToServerRunningStatus(): void {
    let subscription = this.serverRunningStatusState$.subscribe(
      (state: IServerRunningStatusState) => {
        if (state) {
          if (!state.ConfigurationSavingInProgress) {
            console.log("Load Devices and Data Points after server reaqusition finished...");
            this.store.dispatch(TOOL_CONNECTIONS_LOAD()); // Load ToolConnections after server reacqusition finished
            this.store.dispatch(LOAD_DEVICES());          // Load Devices after server reacqusition finished
            this.store.dispatch(LOAD_DATAPOINTDEF());     // Load Data Points after server reacqusition finished
          }
        }
      }
    );
    this.dataSubscriptions.push(subscription);
  }

  postCallDeviceDataPoints(): void {
    this.updateMonitoringZones();
  }

  postCallGetToolConnections(): void {
    this.toolConnections = this.toolConnectionEntity??[];
    this.updateMonitoringZones();
  }

  @HostListener("window:resize", [])
  public onResize() {
    this.detectScreenSize();
  }

  public ngAfterViewInit() {
      this.detectScreenSize();
  }

  private detectScreenSize() {
    this.bIsMobileView = window.innerWidth < 480 ? true : false;
  }

  ngOnChanges(): void {
  }

  ngOnDestroy(): void {
    if (this.dataSubscriptions != null && this.dataSubscriptions.length > 0) {
      this.dataSubscriptions.forEach(subscription => {
        if (subscription != null)
          subscription.unsubscribe();
      });
    }

    this.dataSubscriptions = [];
    super.ngOnDestroy();
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.subscribeToServerRunningStatus();
    this.toolConnectionService.getPortingList().subscribe(res => {
      this.portingList = res;
      this.initDeviceDataPoints();
      this.initToolConnections();
    });
  }
}
