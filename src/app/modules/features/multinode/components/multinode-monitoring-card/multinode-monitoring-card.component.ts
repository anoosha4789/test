import { AfterViewInit, Component, EventEmitter, HostListener, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { GatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { CardDataPointIndex, DEFAULT_eFCV_POSITIONS, DEFAULT_eFCV_POSITIONS_STAGES, ESPToolDataPointIndex, SureSENSDataPointIndex, ToolDataPointIndex, TOOL_STATUS, UICommon, ZoneDataPointIndex } from '@core/data/UICommon';
import { DataSourceFacade } from '@core/facade/dataSourceFacade.service';
import { DeviceDataPointsFacade } from '@core/facade/deviceDataPointsFacade.service';
import { WellFacade } from '@core/facade/wellFacade.service';
import { MultiNodeWellUIModel } from '@core/models/UIModels/MultinodeWell.model';
import { ToolConnectionUIModel } from '@core/models/UIModels/tool-connection.model';
import { DataPointDefinitionModel } from '@core/models/webModels/DataPointDefinition.model';
import { eFCVDataModel } from '@core/models/webModels/eFCVDataModel.model';
import { ErrorHandlingUIModel } from '@core/models/webModels/ErrorHandlingUI.model';
import { SureSENSGaugeDataModel, SureSENSToolType, SureSENS_ESP_Type } from '@core/models/webModels/SureSENSGaugeData.model';
import { MultiNodeWellDataUIModel } from '@core/models/webModels/WellDataUIModel.model';
import { ConfigurationService } from '@core/services/configurationService.service';
import { GwFooterService } from '@core/services/gw-footer-service.service';
import { RealTimeDataSignalRService } from '@core/services/realTimeDataSignalR.service';
import { ToolConnectionService } from '@core/services/tool-connection.service';
import { UserService } from '@core/services/user.service';
import { eFCVDataPointIndex } from '@features/multinode/common/MultiNodeRegisterIndex';
import { Store } from '@ngrx/store';
import { LOAD_DATAPOINTDEF, LOAD_DEVICES } from '@store/actions/deviceDataPoints.action';
import { TOOL_CONNECTIONS_LOAD } from '@store/actions/tool-connection.entity.action';
import { IErrorHandlingSettingsState } from '@store/state/errorHandlingSettings.state';
import { IServerRunningStatusState } from '@store/state/serverRunningStatus.state';
import { PaginationInstance } from 'ngx-pagination';
import { interval, Observable, Subscription } from 'rxjs';
import * as ERROR_HANDLING_SETTINGS_STATE_ACTIONS from '@store/actions/errorHandlingSettings.action';
import { String } from 'typescript-string-operations';

@Component({
  selector: 'multinode-monitoring-card',
  templateUrl: './multinode-monitoring-card.component.html',
  styleUrls: ['./multinode-monitoring-card.component.scss']
})
export class MultinodeMonitoringCardComponent extends GatewayPanelBase implements OnInit, OnDestroy, OnChanges, AfterViewInit {

  @Input()
  wellId: number;

  @Input()
  tabGroupHeight: number;

  @Input()
  config: PaginationInstance;

  @Input()
  wellZones: eFCVDataModel[];

  @Output()
  multinodeMonitoringZonesEmitter = new EventEmitter();

  @ViewChild(TemplateRef)
  public toolsView: TemplateRef<any>;

  multinodeMonitoringZones: MultinodeMonitoringZone[];
  groupMonitoringZones: MultinodeMonitoringZone[][] = [];
  bIsMobileView: boolean = false;
  cardStatus = UICommon.CARD_STATUS_DISCONNECT;

  private dataSubscriptions: Subscription[] = [];

  toolConnections: ToolConnectionUIModel[];
  deviceIndexArray: DataPointDefinitionModel[];
  errorHandlingSettings: ErrorHandlingUIModel; 
  private errorHandlingSettingsState$: Observable<IErrorHandlingSettingsState>;


  constructor(protected store: Store,
    private router: Router,
    private wellDataFacade: WellFacade,
    private dataSourceFacade: DataSourceFacade,
    private dataPointFacade: DeviceDataPointsFacade,
    private userService: UserService,
    private toolConnectionService: ToolConnectionService,
    private realTimeService: RealTimeDataSignalRService) {
    super(store, null, wellDataFacade, dataSourceFacade, null, dataPointFacade, null);
    this.errorHandlingSettingsState$ = this.store.select<any>((state: any) => state.errorHandlingSettingsState);

  }

  postCallDeviceDataPoints(): void {
    this.updateMonitoringZones();
  }

  postCallGetToolConnections(): void {
    this.toolConnections = this.toolConnectionEntity ?? [];
    this.updateMonitoringZones();
  }

  private subscribeToErrorHandlingState(): void {
    const subscription = this.errorHandlingSettingsState$.subscribe(
        (state: IErrorHandlingSettingsState) => {
            if (state !== undefined && !state.isLoaded) {
                this.store.dispatch(ERROR_HANDLING_SETTINGS_STATE_ACTIONS.LOAD_ERROR_HANDLING_SETTINGS());
            } else {
                this.errorHandlingSettings = new ErrorHandlingUIModel();
                Object.assign(this.errorHandlingSettings, state.errorHandlingSettings);
            }
        }
    );
    this.dataSubscriptions.push(subscription);
}

  navigateTool(toolDeviceId: string) {
    // [routerLink]="['tool', tool.tool.DeviceId]"
    let address = String.Format("multinode/monitoring/tool/{0}", toolDeviceId);
    this.userService.GetCurrentLoginUser().then((x) => {
      if (x !== undefined && x != null && x.Name !== UICommon.OPENUSER_NAME) {
        this.router.navigateByUrl("/" + address);
      } else {
        UICommon.LogInRouteURL = address;
        this.router.navigate(['/Login']);
      }
    });
  }

  private getDeviceByPointIndex(deviceId: number, pointIndex: number): DataPointDefinitionModel {
    let index = this.datapointdefinitions.findIndex(d => d.DeviceId === deviceId && d.DataPointIndex == pointIndex) ?? -1;
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

  private isESPTool(toolGauge: SureSENSGaugeDataModel): boolean {
    let isESPGauge = false;
    if (toolGauge && toolGauge.GaugeType !== SureSENSToolType.ESP) {
      return false;
    }

    if (toolGauge && (toolGauge.EspGaugeType != null)) {
      isESPGauge = toolGauge.EspGaugeType !== SureSENS_ESP_Type.None;
    }
    return isESPGauge;
  }

  private getPortingTool(tool: ToolConnectionUIModel): MultinodeMonitoringTool {
    let toolGauge = this.dataSourceFacade.getToolGauge(tool.ChannelId, tool.CardDeviceId, tool.DeviceId);
    const isESPGauge = (toolGauge && toolGauge.GaugeType === SureSENSToolType.ESP) ? true : false;
    // const isESPTool = (isESPGauge || (toolGauge.EspGaugeType !== 1 && toolGauge.EspGaugeType !== 0));
    let multinodeMonitoringTool = new MultinodeMonitoringTool();
    multinodeMonitoringTool.tool = tool;
    multinodeMonitoringTool.isESPTool = this.isESPTool(toolGauge);
    multinodeMonitoringTool.pressureDevice = this.getDeviceByPointIndex(tool.DeviceId, SureSENSDataPointIndex.Pressure);
    if (isESPGauge) {
      multinodeMonitoringTool.temperatureDevice = this.getDeviceByPointIndex(tool.DeviceId, ESPToolDataPointIndex.MotorWindingTemperature);
    } else {
      multinodeMonitoringTool.temperatureDevice = this.getDeviceByPointIndex(tool.DeviceId, SureSENSDataPointIndex.Temperature);
    }
    if (multinodeMonitoringTool.temperatureDevice && multinodeMonitoringTool.temperatureDevice.UnitSymbol) {
      multinodeMonitoringTool.temperatureDevice.UnitSymbol = multinodeMonitoringTool.temperatureDevice.UnitSymbol;
    }
    multinodeMonitoringTool.diagnosticsDevice = this.getDeviceByPointIndex(tool.DeviceId, ToolDataPointIndex.Diagnostics);
    multinodeMonitoringTool.diagnosticsCard = this.getDeviceByPointIndex(tool.CardDeviceId, CardDataPointIndex.CommStatus);

    return multinodeMonitoringTool;
  }

  private getToolsForRealtimeSubscription(zoneId: number): MultinodeMonitoringTool[] {
    let multinodeTools: MultinodeMonitoringTool[] = [];
    if (this.toolConnections && this.toolConnections.length > 0) {

      //let annulusTools = this.toolConnections.filter(t => t.WellId === this.wellId && t.ZoneId === zoneId && t.PortingId == this.portingList[0].Id) ?? [];
      let Tools = this.toolConnections.filter(t => t.WellId === this.wellId && t.ZoneId === zoneId && t.DeviceId > 0) ?? [];

      // if (annulusTools.length > 0) {
      //   annulusTools.forEach(annulusTool => {
      //     multinodeTools.push(this.getPortingTool(annulusTool));
      //   })
      // }
      if (Tools.length > 0) {
        Tools.forEach(tubingTool => {
          multinodeTools.push(this.getPortingTool(tubingTool));
        })
      }
    }
    return multinodeTools;
  }

  private updateMonitoringZones(): void {
    if (!this.datapointdefinitions || this.datapointdefinitions.length == 0)
      return;

    this.deviceIndexArray = [];
    this.multinodeMonitoringZones = [];
    this.wellZones.forEach(zone => {
      let multinodeZone = new MultinodeMonitoringZone();
      multinodeZone.zone = zone;
      // let stage3object = zone.PositionDescriptionData.filter(t => t.PositionStage === "STAGE_3");
      // multinodeZone.PositionDataPoint = this.getDeviceByPointIndex(zone.HcmId, eFCVDataPointIndex.Position);
      multinodeZone.Position = this.getNotSetPosition(zone);
      this.subscribeToRealtimeData(multinodeZone, eFCVDataPointIndex.Position, this.positionCallback);
      multinodeZone.tools = this.getToolsForRealtimeSubscription(zone.ZoneId);
      this.multinodeMonitoringZones.push(multinodeZone);
    });

    if (this.multinodeMonitoringZones !== undefined) {
      this.multinodeMonitoringZones.sort((a, b) => {
        return b.zone.MeasuredDepth - a.zone.MeasuredDepth;
      });
    }
    this.setUpRealtimeSubscription_1();
    this.setView();
  }

  positionCallback = (value, multinodeZone): void => {
    multinodeZone.Position = this.getZonePosition(multinodeZone.zone, value.Value);
  }

  private subscribeToRealtimeData(multinodeZone: MultinodeMonitoringZone, pointIndex, callBack) {
    let subscription = this.realTimeService.GetRealtimeData(multinodeZone.zone.HcmId, pointIndex).subscribe(value => {
      if (value != undefined && value != null) {
        callBack(value, multinodeZone);
      }
    });
    this.dataSubscriptions.push(subscription);
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


  getNotSetPosition(zone: eFCVDataModel) {
    return zone?.PositionDescriptionData?.find(des => des.PositionStage === DEFAULT_eFCV_POSITIONS_STAGES.STAGE_NOTSET)?.Description ?? "";
  }
  getZonePosition(zone: eFCVDataModel, position: number) {
    return (position >= 0 && position < zone?.PositionDescriptionData?.length) ? zone?.PositionDescriptionData[position]?.Description : this.getNotSetPosition(zone);
  }

  getToolStatusCode(statusCode: number) {
    let toolStausCode: number;
    if (statusCode === TOOL_STATUS.valid) {
      toolStausCode = 0;
    } else if (UICommon.TOOL_DIAGNOSTICS_CODES.findIndex(c => c === statusCode) !== -1) {
      toolStausCode = TOOL_STATUS.warning;
    } else {
      toolStausCode = TOOL_STATUS.critical;
    }
    return toolStausCode;
  }

  setView() {
    this.groupMonitoringZones = [];
    let monitoringZones = this.multinodeMonitoringZones;
    let totalItems = 0;
    if (!this.bIsMobileView) {
      const isLargerDevice = window.innerHeight > 800;
      const isExtraLargerDevice = window.innerHeight > 1000;
      const isExtraWidthDevice = window.innerWidth > 1494;
      let zones = [];

      let limit = isExtraWidthDevice ? 9 : isExtraLargerDevice ? 8 : isLargerDevice ? 6 : 4;
      const chunkSize = isExtraWidthDevice ? 3 : 2;

      for (let i = 0; i < monitoringZones.length; i += chunkSize) {
        const chunk = monitoringZones.slice(i, i + chunkSize);
        let filteredZones = chunk.filter(z => z.tools.length > 5);
        if (filteredZones.length > 0) {
          if (zones.length > 0) {
            totalItems = totalItems + zones.length;
            this.groupMonitoringZones.push(zones);
            zones = [];
          }
          if (isExtraWidthDevice) {
            chunk.forEach(element => {
              zones.push(element);
            });
          } else {
            totalItems = totalItems + chunk.length;
            this.groupMonitoringZones.push(chunk);
          }
        } else {
          chunk.forEach(element => {
            zones.push(element);
          });
          if (zones.length === limit || i === monitoringZones.length - 1) {
            totalItems = totalItems + zones.length;
            this.groupMonitoringZones.push(zones);
            zones = [];
          }
        }
      }
    }
    let remainingItems = this.multinodeMonitoringZones.length - totalItems;
    if (remainingItems > 0) {
      this.groupMonitoringZones.push(this.multinodeMonitoringZones?.slice(-remainingItems));
    }
    this.multinodeMonitoringZonesEmitter.emit(this.groupMonitoringZones);
    this.config.itemsPerPage = this.bIsMobileView ? this.groupMonitoringZones.length : 1;
    this.config.totalItems = this.groupMonitoringZones.length;
  }

  private detectScreenSize() {
    this.bIsMobileView = window.innerWidth < 768 || window.innerHeight < 768 ? true : false;
  }

  @HostListener("window:resize", [])
  public onResize() {
    this.detectScreenSize();
    this.initDeviceDataPoints();
    this.initToolConnections();
    this.config.currentPage = 1;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.detectScreenSize();
  }

  ngAfterViewInit() {
    this.detectScreenSize();
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
    this.initDataSources();
    this.initDeviceDataPoints();
    this.initToolConnections();
    this.subscribeToErrorHandlingState();
    this.config.currentPage = 1;
  }
}

export class MultinodeMonitoringZone {
  zone: eFCVDataModel;
  zoneDevice: DataPointDefinitionModel;
  PositionDataPoint: DataPointDefinitionModel;
  Position: string;
  tools: MultinodeMonitoringTool[];
}
export class MultinodeMonitoringTool {
  tool: ToolConnectionUIModel;
  isESPTool: boolean;
  pressureDevice: DataPointDefinitionModel;
  temperatureDevice: DataPointDefinitionModel;
  diagnosticsDevice: DataPointDefinitionModel;
  diagnosticsCard: DataPointDefinitionModel;
}