import { AfterViewInit, Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { interval, Observable, Subscription } from 'rxjs';

import { take } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { PaginationInstance } from 'ngx-pagination';

import { IErrorHandlingSettingsState } from '@store/state/errorHandlingSettings.state';
import { GatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { CardDataPointIndex, ToolDataPointIndex, SureSENSDataPointIndex, UICommon, ESPToolDataPointIndex } from '@core/data/UICommon';
import { DataSourceFacade } from '@core/facade/dataSourceFacade.service';
import { ConfigurationService } from '@core/services/configurationService.service';
import { DeviceDataPointsFacade } from '@core/facade/deviceDataPointsFacade.service';
import { WellFacade } from '@core/facade/wellFacade.service';
import { ToolConnectionUIModel } from '@core/models/UIModels/tool-connection.model';
import { DataPointDefinitionModel } from '@core/models/webModels/DataPointDefinition.model';
import { RealTimeDataSignalRService } from '@core/services/realTimeDataSignalR.service';
import { UserService } from '@core/services/user.service';
import { SureSENSGaugeDataUIModel } from '@core/models/webModels/SureSENSGaugeDataUIModel.model';
import { DataSourceUIModel } from '@core/models/UIModels/dataSource.model';

import { LOAD_DEVICES, LOAD_DATAPOINTDEF } from '@store/actions/deviceDataPoints.action';
import { TOOL_CONNECTIONS_LOAD } from '@store/actions/tool-connection.entity.action';
import { FLOWMETERS_LOAD } from '@store/actions/sureflo.entity.action';
import { IServerRunningStatusState } from '@store/state/serverRunningStatus.state';
import { SurefloFacade } from '@core/facade/surefloFacade.service';
import { FlowMeterTypes, SureFLOFlowMeterUIModel } from '@core/models/UIModels/sureflo.model';
import { ErrorHandlingUIModel } from '@core/models/webModels/ErrorHandlingUI.model';
import { GwFooterService } from '@core/services/gw-footer-service.service';


@Component({
  selector: 'suresens-monitoring-card',
  templateUrl: './suresens-monitoring-card.component.html',
  styleUrls: ['./suresens-monitoring-card.component.scss']
})
export class SuresensMonitoringCardComponent extends GatewayPanelBase implements OnInit, OnDestroy, AfterViewInit {
  @Input()
  wellId: number;

  @Input()
  showTabAnimation: boolean;

  @Input()
  animationStepDuration = 0;

  @Output()
  animateTab = new EventEmitter();

  isMobileView = false;
  isTabletView = false;
  errorHandlingSettings: ErrorHandlingUIModel;
  toolConnections: ToolConnectionUIModel[];
  deviceIndexArray: DataPointDefinitionModel[];
  suresenMonitoringTools: SuresenMonitoringTool[];
  suresenLoaded = false;
  allMonitoringTools = [];
  groupedMonitoringTools: any[][] = [];
  dataSources: DataSourceUIModel[];
  gauges: SureSENSGaugeDataUIModel[] = [];
  cardSize: string = 'lg';
  cardStatus = UICommon.CARD_STATUS_DISCONNECT;

  sureFLODeviceIndexArray: DataPointDefinitionModel[];
  sureFLOMonitoringTools: SureFLOMonitoringTool[];
  sureFLOLoaded = false;
  dataLoaded = false;
  private errorHandlingSettingsState$: Observable<IErrorHandlingSettingsState>;
  private serverRunningStatusState$: Observable<IServerRunningStatusState>;
  private dataSubscriptions: Subscription[] = [];
  private intervalSubscriptions: Subscription[] = [];

  config: PaginationInstance = {
    id: 'gw-suresens-pagination',
    itemsPerPage: 3,
    currentPage: 1,
    totalItems: 0
  };

  displayedColumns: string[] = ['tool', 'pressureDevice', 'temperatureDevice'];
  toolDiagnosticsCodes = [6, 8, 10, 12, 14, 16, 18, 20, 22];

  isViewLoaded = false;
  isInitialized = false;

  constructor(protected store: Store<{
    errorHandlingSettingsState: IErrorHandlingSettingsState;
  }>,
    private router: Router,
    private wellDataFacade: WellFacade,
    private configurationService: ConfigurationService,
    private dataSourceFacade: DataSourceFacade,
    private dataPointFacade: DeviceDataPointsFacade,
    private sureFLOFacde: SurefloFacade,
    private userService: UserService,
    private gwFooterService: GwFooterService,
    private realTimeService: RealTimeDataSignalRService) {
    super(store, null, wellDataFacade, dataSourceFacade, null, dataPointFacade, null, sureFLOFacde);
    this.errorHandlingSettingsState$ = this.store.select<any>((state: any) => state.errorHandlingSettingsState);
    this.serverRunningStatusState$ = this.store.select<any>((state: any) => state.serverRunningStatusState);
  }

  navigateTool(toolDeviceId: string) {

    let address = `suresens/monitoring/tool/${toolDeviceId}`;
    this.userService.GetCurrentLoginUser().then((x) => {
      if (x !== undefined && x != null && x.Name !== UICommon.OPENUSER_NAME) {
        this.router.navigateByUrl("/" + address);
      } else {
        UICommon.LogInRouteURL = address;
        this.router.navigate(['/Login']);
      }
    });
  }

  navigateSureFLOTool(surefloDeviceId: number): void {
    let address = `suresens/monitoring/sureflo/${surefloDeviceId}`;
    this.userService.GetCurrentLoginUser().then((x) => {
      if (x !== undefined && x != null && x.Name !== UICommon.OPENUSER_NAME) {
        this.router.navigateByUrl("/" + address);
      } else {
        UICommon.LogInRouteURL = address;
        this.router.navigate(['/Login']);
      }
    });
  }

  // getBadDataValue(dataType: DataPointValueDataType) {
  //   let value = null;
  //   switch (dataType) {
  //     case DataPointValueDataType.SignedInteger16Bit || DataPointValueDataType.SignedInteger32Bit || DataPointValueDataType.SignedInteger64Bit:
  //       value = this.errorHandlingSettings?.BadDataValueInteger;
  //       break;
  //     case DataPointValueDataType.UnsignedInteger16Bit || DataPointValueDataType.SignedInteger32Bit || DataPointValueDataType.UnsignedInteger64Bit:
  //       value = this.errorHandlingSettings?.BadDataValueUnsignedInteger;
  //       break;
  //     case DataPointValueDataType.Float32Bit || DataPointValueDataType.Double64Bit:
  //       value = this.errorHandlingSettings?.BadDataValue;
  //       break;
  //   }
  //   return value;
  // } 

  private setUpRealtimeSubscription(): void {

    if (this.deviceIndexArray.length > 0) {
      this.deviceIndexArray.forEach((element) => {
        let deviceSubs = null;
        deviceSubs = this.realTimeService
          .GetRealtimeData(element.DeviceId, element.DataPointIndex)
          .subscribe((data) => {
            if (data) {
              element.RawValue = data.Value;
            }
            this.dataSubscriptions.push(deviceSubs);
          });
      });
    }
  }

  private setUpSureFLORealtimeSubscription(): void {
    if (this.sureFLODeviceIndexArray.length > 0) {
      this.sureFLODeviceIndexArray.forEach((element) => {
        let deviceSubs = null;
        deviceSubs = this.realTimeService
          .GetRealtimeData(element.DeviceId, element.DataPointIndex)
          .subscribe((data) => {
            if (data) {
              element.RawValue = data.Value;
            }
            this.dataSubscriptions.push(deviceSubs);
          });
      });
    }
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

  private getToolsRealtimeSubscription(isTabToggled = false) {
    this.deviceIndexArray = [];
    this.suresenMonitoringTools = [];
    this.dataLoaded = false;
    if (this.toolConnections && this.toolConnections.length > 0
      && this.dataSources && this.dataSources.length > 0) {
      const tools = this.toolConnections.filter(t => t.WellId === this.wellId) ?? [];
      if (tools && tools.length > 0) {
        const channelId = tools[0].ChannelId;
        const cardId = tools[0].CardDeviceId;
        const datasource = this.dataSources.find(ds => ds.Channel.IdCommConfig === channelId);
        const card = datasource.Cards.find(c => c.DeviceId === cardId);
        this.gauges = card.Gauges as SureSENSGaugeDataUIModel[];
        tools.forEach((tool) => this.suresenMonitoringTools.push(this.setAsSuresenTool(tool)));
      }
      this.dataLoaded = true;
    }
    this.suresenLoaded = true;
    if (this.suresenLoaded && this.sureFLOLoaded) {
      this.setAllData();
    }
    this.updateMonitoringTools();
    this.showTogglingAnimation();
  }

  getPages(total, perpage) {
    return Math.ceil(total / perpage);
  }

  clearTimeoutCall() {
    if (this.intervalSubscriptions != null && this.intervalSubscriptions.length > 0) {
      this.intervalSubscriptions.forEach(subscription => {
        if (subscription != null) {
          subscription.unsubscribe();
          subscription = null;
        }
      });
    }
    this.intervalSubscriptions = [];
  }

  startTabAndPaginationAnimation() {
    this.clearTimeoutCall();
    let animationSubscription = interval(this.animationStepDuration).pipe(take(1)).subscribe(() => {
      if ((window.outerWidth >= 800 && window.outerHeight >= 600) && this.groupedMonitoringTools.length > 0 && this.config.currentPage < this.getPages(this.groupedMonitoringTools.length, this.config.itemsPerPage)) {

        this.config.currentPage++;
        this.startTabAndPaginationAnimation();
      } else {
        this.animateTab.emit();
      }
    });
    this.intervalSubscriptions.push(animationSubscription);
  }

  setAllData() {
    this.allMonitoringTools = [];
    this.groupedMonitoringTools = [];
    this.allMonitoringTools = [...this.suresenMonitoringTools, ...this.sureFLOMonitoringTools];
    let rowFillPercentage = 0;
    this.allMonitoringTools.forEach((tool) => {
      if (rowFillPercentage === 0) {
        this.groupedMonitoringTools.push([]);
      }
      // based on css classes gw-suresens-sptv-card-* and gw-suresens-qpt-card-*
      let currentWidthPercentage = tool.isTemplateSPTV ? (100 / 2.5) : (100 / 5);
      if (this.cardSize === 'xl') {
        currentWidthPercentage = tool.isTemplateSPTV ? 33.33 : 16.66;
      } else if (this.cardSize === 'lg') {
        currentWidthPercentage = tool.isTemplateSPTV ? (100 / 2.5) : (100 / 5);
      } else if (this.cardSize === 'md') {
        currentWidthPercentage = tool.isTemplateSPTV ? (100 / 2) : (100 / 4);
      } else if (this.cardSize === 'sm') {
        currentWidthPercentage = tool.isTemplateSPTV ? (100 / 1.5) : (100 / 3);
      } else if (this.cardSize === 'xs') {
        currentWidthPercentage = tool.isTemplateSPTV ? (100) : (100 / 2);
      }
      rowFillPercentage += currentWidthPercentage;
      if (rowFillPercentage > 100) {
        rowFillPercentage = currentWidthPercentage;
        this.groupedMonitoringTools.push([]);
      }
      this.groupedMonitoringTools[this.groupedMonitoringTools.length - 1].push(tool);
    });
    this.config.currentPage = 1;
    this.config.totalItems = this.groupedMonitoringTools.length;
  }

  private setAsSuresenTool(tool: ToolConnectionUIModel): SuresenMonitoringTool {
    const toolObj = this.gauges.find(g => g.DeviceId === tool.DeviceId);
    let suresenTool = new SuresenMonitoringTool();
    suresenTool.isTemplateSPTV = (SURESENS_TOOL_TYPES.SureSENSSPTVGauge === toolObj.GaugeType || (SURESENS_TOOL_TYPES.SureSENSESPGauge === toolObj.GaugeType && toolObj.EspGaugeType === 1)) ? true : false;
    suresenTool.gaugeType = toolObj.GaugeType;
    suresenTool.espGaugeType = toolObj.EspGaugeType;
    suresenTool.tool = tool;
    suresenTool.pressureDevice = this.getDeviceByPointIndex(tool.DeviceId, SureSENSDataPointIndex.Pressure);
    suresenTool.temperatureDevice = this.getDeviceByPointIndex(tool.DeviceId, SureSENSDataPointIndex.Temperature);
    if (suresenTool.temperatureDevice && suresenTool.temperatureDevice.UnitSymbol) {
      suresenTool.temperatureDevice.UnitSymbol = suresenTool.temperatureDevice.UnitSymbol;
    }
    suresenTool.diagnosticsDevice = this.getDeviceByPointIndex(tool.DeviceId, ToolDataPointIndex.Diagnostics);
    suresenTool.commStatus = this.getDeviceByPointIndex(tool.CardDeviceId, CardDataPointIndex.CommStatus);

    // SPTV
    if (suresenTool.isTemplateSPTV && suresenTool.gaugeType === SURESENS_TOOL_TYPES.SureSENSSPTVGauge) {
      suresenTool.peakVibrationXDevice = this.getDeviceByPointIndex(tool.DeviceId, SureSENSDataPointIndex.PeakVibrationX);
      suresenTool.peakVibrationYDevice = this.getDeviceByPointIndex(tool.DeviceId, SureSENSDataPointIndex.PeakVibrationY);
      suresenTool.peakVibrationZDevice = this.getDeviceByPointIndex(tool.DeviceId, SureSENSDataPointIndex.PeakVibrationZ);
    }

    // ESP Tool
    if (suresenTool.gaugeType === SURESENS_TOOL_TYPES.SureSENSESPGauge) {
      suresenTool.motorWindingTempDevice = this.getDeviceByPointIndex(tool.DeviceId, ESPToolDataPointIndex.MotorWindingTemperature);
      suresenTool.motorWindingTempDevice.UnitSymbol = suresenTool.motorWindingTempDevice.UnitSymbol;
      suresenTool.peakVibrationXDevice = this.getDeviceByPointIndex(tool.DeviceId, ESPToolDataPointIndex.PeakVibrationX);
      suresenTool.peakVibrationYDevice = this.getDeviceByPointIndex(tool.DeviceId, ESPToolDataPointIndex.PeakVibrationY);
      suresenTool.peakVibrationZDevice = this.getDeviceByPointIndex(tool.DeviceId, ESPToolDataPointIndex.PeakVibrationZ);
    }

    return suresenTool;
  }

  private updateMonitoringTools(): void {
    if (!this.datapointdefinitions || this.datapointdefinitions.length == 0)
      return;
    this.setUpRealtimeSubscription();
  }

  private subscribeToServerRunningStatus(): void {
    let subscription = this.serverRunningStatusState$.subscribe(
      (state: IServerRunningStatusState) => {
        if (state) {
          if (!state.ConfigurationSavingInProgress) {
            // console.log('Reload Device and Data Points after system reaqusition finished.');
            if (this.gwFooterService.isLoadApiCalled === false) {
              this.store.dispatch(TOOL_CONNECTIONS_LOAD()); // Load ToolConnections after server reacqusition finished
              this.store.dispatch(FLOWMETERS_LOAD());
              this.store.dispatch(LOAD_DEVICES());          // Load Devices after server reacqusition finished
              this.store.dispatch(LOAD_DATAPOINTDEF());     // Load Data Points after server reacqusition finished
              this.gwFooterService.isLoadApiCalled = true;
            } else if (this.showTabAnimation && this.animationStepDuration > 0) {
              // To invoke toggling animation
              this.store.dispatch(LOAD_DEVICES());
            }
          }
        }
      }
    );
    this.dataSubscriptions.push(subscription);
  }

  private getSureFLODeviceByPointIndex(deviceId: number, pointIndex: number): DataPointDefinitionModel {
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

      this.sureFLODeviceIndexArray.push(dp);

      return dp;
    }

    return new DataPointDefinitionModel();  // return empty DataPointDefinitionModel
  }

  private getSureFLORealtimeSubscription(): void {
    this.sureFLODeviceIndexArray = [];
    this.sureFLOMonitoringTools = [];
    if (this.surefloEnity && this.surefloEnity.length > 0) {
      let sureFLOMeters = this.surefloEnity.filter(fm => fm.WellId === this.wellId) ?? [];
      if (sureFLOMeters && sureFLOMeters.length > 0) {
        sureFLOMeters.forEach(floMeter => this.sureFLOMonitoringTools.push(this.getSureFLOMonitoringTool(floMeter)));
        this.setUpSureFLORealtimeSubscription();
      }
      sureFLOMeters = [];
    }
    this.sureFLOLoaded = true;
    if (this.suresenLoaded && this.sureFLOLoaded) {
      this.setAllData();
    }
  }

  private getSureFLOMonitoringTool(floMeter: SureFLOFlowMeterUIModel) {
    const technology: any = floMeter.Technology;
    if (technology === FlowMeterTypes.SureFLO298)
      return this.getSureFLO298MonitoringTool(floMeter);
    else
      return this.getSureFLO298ExMonitoringTool(floMeter);
  }

  private getSureFLO298ExMonitoringTool(floMeter: SureFLOFlowMeterUIModel) {
    // let sureFLO298Ex = floMeter as SureFLO298ExUIFlowMeterUIModel;
    let sureFLOMonitoringTool = {
      deviceId: floMeter.DeviceId,
      floMeterName: floMeter.DeviceName,
      deltaPDevice: this.getSureFLODeviceByPointIndex(floMeter.DeviceId, this.sureFLOFacde.getSureFLO298ExDeltaPPointIndex(floMeter.FluidType)),
      totalFlowRateDevice: this.getSureFLODeviceByPointIndex(floMeter.DeviceId, this.sureFLOFacde.getSureFLO298ExFlowratePointIndex(floMeter.FluidType)),
      activeDevice: this.getSureFLODeviceByPointIndex(floMeter.DeviceId, this.sureFLOFacde.getSureFLO298ExActivePointIndex(floMeter.FluidType))
    };

    return sureFLOMonitoringTool;
  }

  private getSureFLO298MonitoringTool(floMeter: SureFLOFlowMeterUIModel) {
    // let sureFLO298 = floMeter as SureFLO298UIFlowMeterUIModel;
    let sureFLOMonitoringTool = {
      deviceId: floMeter.DeviceId,
      floMeterName: floMeter.DeviceName,
      deltaPDevice: this.getSureFLODeviceByPointIndex(floMeter.DeviceId, this.sureFLOFacde.getSureFLO298DeltaPPointIndex(floMeter.FluidType)),
      totalFlowRateDevice: this.getSureFLODeviceByPointIndex(floMeter.DeviceId, this.sureFLOFacde.getSureFLO298FlowratePointIndex(floMeter.FluidType)),
      activeDevice: this.getSureFLODeviceByPointIndex(floMeter.DeviceId, this.sureFLOFacde.getSureFLO298ActivePointIndex(floMeter.FluidType))
    };

    return sureFLOMonitoringTool;
  }

  private subscribeErrorHandling(): void {
    const subscription = this.configurationService.getErrorHandlingSettings().subscribe((data) => {
      this.errorHandlingSettings = data;
    });
    // const subscription = this.errorHandlingSettingsState$.subscribe(
    //     (state: IErrorHandlingSettingsState) => {
    //         if (state !== undefined && !state.isLoaded) {
    //             this.store.dispatch(ERROR_HANDLING_SETTINGS_STATE_ACTIONS.LOAD_ERROR_HANDLING_SETTINGS());
    //         } else {
    //           this.errorHandlingSettings = state.errorHandlingSettings; 
    //           this.getToolsRealtimeSubscription();
    //         }
    //     }
    // );
    this.dataSubscriptions.push(subscription);
  }

  postCallGetDataSources(): void {
    this.dataSources = this.dataSourcesEntity ?? [];
    this.getToolsRealtimeSubscription();
  }

  postCallDeviceDataPoints(): void {
    this.getToolsRealtimeSubscription();
    this.getSureFLORealtimeSubscription();
  }

  postCallGetToolConnections(): void {
    this.toolConnections = this.toolConnectionEntity ?? [];
    this.getToolsRealtimeSubscription();
  }

  postCallGetFlowMeters(): void {
    this.getSureFLORealtimeSubscription();
  }

  showTogglingAnimation() {
    if (this.showTabAnimation && this.isInitialized && this.dataLoaded && this.animationStepDuration > 0) {
      this.startTabAndPaginationAnimation();
    }
  }

  @HostListener("window:visibilitychange", ['$event'])
  public onVisibilityChange(event) {
    let visibility = event.target?.visibilityState;
    if (visibility === "visible") {
      this.showTogglingAnimation();
    } else {
      this.clearTimeoutCall();
    }
  }

  @HostListener("window:resize", [])
  public onResize() {
    this.detectScreenSize();
    this.setCardClassName(window.innerWidth, window.innerHeight);
  }
  private detectScreenSize() {
    this.isViewLoaded = true;
    //this.isMobileView = window.innerWidth < 800 || window.innerHeight < 600 ? true : false;
    this.isMobileView = window.innerWidth < 768 ? true : false;
    this.isTabletView = window.outerWidth === 1024 && window.outerHeight === 768;
    // No. of rows per page based on height
    this.config.itemsPerPage = 3;
    if (window.innerWidth === 1024 && window.innerHeight === 768) {
      this.config.itemsPerPage = 3;
    } else if (window.innerWidth === 768 && window.innerHeight === 1024) {
      this.config.itemsPerPage = 4;
    } else if (window.innerWidth === 1024 && window.innerHeight === 1366) {
      this.config.itemsPerPage = 6;
    } else if (window.innerWidth === 1366 && window.innerHeight === 1024) {
      this.config.itemsPerPage = 4;
    } else if (window.innerWidth === 1920 && window.innerHeight === 1080) {
      this.config.itemsPerPage = 5;
    } else if (window.innerWidth === 1080 && window.innerHeight === 1920) {
      this.config.itemsPerPage = 10;
    } else if (window.innerHeight === 540) {
      this.config.itemsPerPage = 1;
    } else if (window.innerHeight < 768) {
      this.config.itemsPerPage = 2;
    }
  }

  setCardClassName(width: number, height: number) {
    if (width >= 481 && width < 768)// Extra small
    {
      this.cardSize = 'xs';
    } else if (width >= 768 && width < 900)//small
    {
      this.cardSize = 'sm';
    }
    else if (width >= 900 && width < 1200)//medium
    {
      this.cardSize = 'md';
    }
    else if (width >= 1200 && width < 1500)//large
    {
      this.cardSize = 'lg';
    }
    else if (width >= 1500)// Extra large
    {
      this.cardSize = 'xl';
    }
    this.setAllData();
  }

  getToolStatusCode(statusCode: number) {
    let toolStausCode: number;
    if (statusCode === TOOL_STATUS.valid) {
      toolStausCode = 0;
    } else if (this.toolDiagnosticsCodes.findIndex(c => c === statusCode) !== -1) {
      toolStausCode = TOOL_STATUS.warning;
    } else {
      toolStausCode = TOOL_STATUS.critical;
    }
    return toolStausCode;
  }

  ngOnDestroy(): void {
    this.clearTimeoutCall();
    if (this.dataSubscriptions != null && this.dataSubscriptions.length > 0) {
      this.dataSubscriptions.forEach(subscription => {
        if (subscription != null)
          subscription.unsubscribe();
        subscription = null;
      });
    }

    this.dataSubscriptions = [];

    this.toolConnections = [];
    this.deviceIndexArray = [];
    this.suresenMonitoringTools = [];
    this.allMonitoringTools = [];
    this.groupedMonitoringTools = [];
    this.dataSources = [];
    this.gauges = [];
    this.sureFLODeviceIndexArray = [];
    this.sureFLOMonitoringTools = [];
    this.displayedColumns = [];
    this.toolDiagnosticsCodes = [];
    this.errorHandlingSettingsState$ = null;
    this.serverRunningStatusState$ = null;
    this.cardStatus = null;
    this.cardSize = null;
    this.config = null;
    this.errorHandlingSettings = null;

    this.sureFLOLoaded = null;
    this.dataLoaded = null;
    this.isMobileView = null;
    this.isTabletView = null;
    this.suresenLoaded = null;
    this.isViewLoaded = null;
    this.isInitialized = null;

    this.datapointdefinitions = [];
    this.toolConnectionEntity = [];
    this.dataSourcesEntity = [];
    this.surefloEnity = [];
    super.ngOnDestroy();
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.subscribeErrorHandling();
    this.subscribeToServerRunningStatus();
    this.initDataSources();
    this.initToolConnections();
    this.initDeviceDataPoints();
    this.initFlowMeters();
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    let subscription = this.userService.GetLoginLogoutStatus().subscribe(bIsLoggedIn => {
      this.getToolsRealtimeSubscription();
    });
    this.dataSubscriptions.push(subscription);
  }

  ngAfterViewInit() {
    const subscription = interval(0).pipe(take(1)).subscribe(res => {
      this.detectScreenSize();
      this.setCardClassName(window.innerWidth, window.innerHeight);
      this.isInitialized = true;
      // this.showTogglingAnimation();
    });
    this.dataSubscriptions.push(subscription);
  }
}

class SuresenMonitoringTool {
  tool: ToolConnectionUIModel;
  pressureDevice: DataPointDefinitionModel;
  temperatureDevice: DataPointDefinitionModel;
  diagnosticsDevice: DataPointDefinitionModel;
  commStatus: DataPointDefinitionModel;
  gaugeType: number;
  espGaugeType: number;
  isTemplateSPTV: boolean;
  peakVibrationXDevice?: DataPointDefinitionModel;
  peakVibrationYDevice?: DataPointDefinitionModel;
  peakVibrationZDevice?: DataPointDefinitionModel;
  motorWindingTempDevice?: DataPointDefinitionModel;
}

class SureFLOMonitoringTool {
  deviceId: number;
  floMeterName: string;
  deltaPDevice: DataPointDefinitionModel;
  totalFlowRateDevice: DataPointDefinitionModel;
  activeDevice: DataPointDefinitionModel;
}


export enum SURESENS_TOOL_TYPES {
  SureSENSQPTGauge = 0,
  SureSENSESPGauge = 1,
  SureSENSSPTVGauge = 2,
}


enum TOOL_STATUS {
  valid = 0,
  warning,
  critical
}


