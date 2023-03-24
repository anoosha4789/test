import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { String } from 'typescript-string-operations';
import { Observable, Subscription } from 'rxjs';
import * as _ from 'lodash';

import { GatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { CardDataPointIndex, ESPToolDataPointIndex, ToolDataPointIndex, TOOL_STATUS, UIChartColors, UICommon } from '@core/data/UICommon';
import { DataSourceFacade } from '@core/facade/dataSourceFacade.service';
import { DeviceDataPointsFacade } from '@core/facade/deviceDataPointsFacade.service';
import { WellFacade } from '@core/facade/wellFacade.service';
import { ToolConnectionUIModel } from '@core/models/UIModels/tool-connection.model';
import { DataPointDefinitionModel, DataPointValueDataType } from '@core/models/webModels/DataPointDefinition.model';
import { RealTimeDataSignalRService } from '@core/services/realTimeDataSignalR.service';

import * as ERROR_HANDLING_SETTINGS_STATE_ACTIONS from '@store/actions/errorHandlingSettings.action';

import { SetServerComponentData, SetServerValueComponent } from '../setservervalue/setservervalue.component';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { ButtonActions } from '@shared/gateway-dialogs/components/gateway-advanced-dialog/gateway-advanced-dialog.component';
import { PointTemplatesFacade } from '@core/facade/pointTemplatesFacade.service';
import { PointTemplatesExtensionUIModel } from '@core/models/webModels/PointTemplatesExtensionUIModel.model';
import { ChartOptions } from '@shared/gateway-chart/multiaxis-chart/multiaxis-chart.model';
import { UserService } from '@core/services/user.service';
import { SureSENSToolType, SureSENS_ESP_Type } from '@core/models/webModels/SureSENSGaugeData.model';
import { PanelConfigurationFacade } from '@core/facade/panelConfigFacade.service';
import { UtilityService } from '@core/services/utility.service';
import { ErrorHandlingUIModel } from '@core/models/webModels/ErrorHandlingUI.model';
import { IErrorHandlingSettingsState } from '@store/state/errorHandlingSettings.state';
import { ConfigurationService } from '@core/services/configurationService.service';
@Component({
  selector: 'gw-tooldetails',
  templateUrl: './tooldetails.component.html',
  styleUrls: ['../../assets/css/monitoring.scss', './tooldetails.component.scss']
})
export class ToolDetailsComponent extends GatewayPanelBase implements OnInit, OnDestroy {
  toolTitle: string = "";
  toolCardTitle: string = "";
  monitoringRoute: string = "/incharge/monitoring";
  cardRoute: string = "/incharge/card";
  toolboxRoute: string = "/incharge/toolbox";
  toolTipText: string;
  cardStatus = UICommon.CARD_STATUS_DISCONNECT;
  errorHandlingSettings: ErrorHandlingUIModel; 
  errorHandlingSettingObjs: ErrorHandlingUIModel; 
  toolConnections: ToolConnectionUIModel[];
  inchargeMonitoringTool: Map<string, InChargeMonitoringPointTool[]> = new Map<string, InChargeMonitoringPointTool[]>();
  diagnosticDevice: DataPointDefinitionModel = new DataPointDefinitionModel();  // initialize
  diagnosticCard: DataPointDefinitionModel = new DataPointDefinitionModel();  // init
  toolDiagnosticStatus: number;
  isViewMode = false;
  isESPNoMWTGauge: boolean = false;
  toolID: number;
  wellId: number;
  cardDeviceId: number;
  deviceTypeId: number;
  cardName: string;
  toolTypeName: string;
  toolAddress: number;
  expandPanels: boolean[] = [];
  fromCard: boolean = false;
  deviceIndexArray: DataPointDefinitionModel[];
  chartId: string = "tooldetails";
  multi_axis_series: any; 
  monitoringToolDetails: MonitoringToolDetails[];
  invalidTools: MonitoringToolDetails[] = [];
  toolDeviceIndexArray: DataPointDefinitionModel[];
  cardToolsStatusCode: number;
  private errorHandlingSettingsState$: Observable<IErrorHandlingSettingsState>;

  private dataSubscriptions: Subscription[] = [];

  IsMobileView: boolean = false;
  
  constructor(protected store: Store,
    private panelConfigFacade: PanelConfigurationFacade,
    private wellDataFacade: WellFacade,
    private dataSourceFacade: DataSourceFacade,
    private dataPointFacade: DeviceDataPointsFacade,
    private pointTemplateFacade: PointTemplatesFacade,
    private realTimeService: RealTimeDataSignalRService,
    private gwModalService: GatewayModalService,
    protected router: Router,
    protected activatedRoute: ActivatedRoute,
    private userService: UserService,
    private configService: ConfigurationService,
    private utilityService: UtilityService) { 
      super(store, panelConfigFacade, wellDataFacade, dataSourceFacade, null, dataPointFacade, pointTemplateFacade);
      this.errorHandlingSettingsState$ = this.store.select<any>((state: any) => state.errorHandlingSettingsState);
  }

  
  @HostListener("window:resize", [])
  public onResize() {
    console.log('resize called')
    this.detectScreenSize();
  }

  ngAfterViewInit(): void {
    this.detectScreenSize();
  }

  resizeTimer = null;
  private detectScreenSize() {
    if (this.resizeTimer) clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      this.IsMobileView = window.innerWidth < 950 ? true : false;
    }, 300);
  }

  togglePanel(panel: number) {
    // for (let i = 0; i < this.expandPanels.length; i++)
    //   this.expandPanels[i] = false;
    this.expandPanels[panel] = true;
  }

  setServerValue(dataPoint: InChargeMonitoringPointTool) {
    let serverData: SetServerComponentData = {
      fieldName: "Value",
      min: dataPoint.point.MinValue,
      max: dataPoint.point.MaxValue,
      precision: 2,
      device: dataPoint.deviceDataPoint
    };
    let dialogSetServerValue = this.gwModalService.openDialogInsideModal(
      dataPoint.point.Description,
      ButtonActions.None,
      SetServerValueComponent,
      serverData,
      () => dialogSetServerValue.close(),
      '350px',
    );
  }

  private subscribeToToolDiagnosticDevice(): void {
    this.diagnosticDevice = this.dataPointFacade.getDeviceByPoint(this.toolID, ToolDataPointIndex.Diagnostics);
    let subscription = this.realTimeService.GetRealtimeData(this.diagnosticDevice?.DeviceId, this.diagnosticDevice?.DataPointIndex).subscribe(d => {
      if (d !== undefined && d !== null) {
        this.diagnosticDevice.RawValue = d.Value;
        this.toolDiagnosticStatus = this.getToolStatusCode(d.Value);
      }
    });
    this.dataSubscriptions.push(subscription);
  }

  private subscribeToCardDiagnosticDevice(): void {
    this.diagnosticCard = this.dataPointFacade.getDeviceByPoint(this.cardDeviceId, CardDataPointIndex.CommStatus);
    let subscription = this.realTimeService.GetRealtimeData(this.diagnosticCard?.DeviceId, this.diagnosticCard?.DataPointIndex).subscribe(d => {
      if (d !== undefined && d !== null) {
        this.diagnosticCard.RawValue = d.Value;
      }
    });
    this.dataSubscriptions.push(subscription);
  }

  getBadDataValue(dataType: DataPointValueDataType) {
    let value = null;
    switch (dataType) {
      case DataPointValueDataType.SignedInteger16Bit || DataPointValueDataType.SignedInteger32Bit || DataPointValueDataType.SignedInteger64Bit:
        value = this.errorHandlingSettings?.BadDataValueInteger;
        break;
      case DataPointValueDataType.UnsignedInteger16Bit || DataPointValueDataType.SignedInteger32Bit || DataPointValueDataType.UnsignedInteger64Bit:
        value = this.errorHandlingSettings?.BadDataValueUnsignedInteger;
        break;
      case DataPointValueDataType.Float32Bit || DataPointValueDataType.Double64Bit:
        value = this.errorHandlingSettings?.BadDataValue;
        break;
    }
    return value;
  } 
  private subscribeErrorHandling(): void {
    const subscription = this.configService.getErrorHandlingSettings().subscribe((data) => {
      this.errorHandlingSettingObjs = data;
    });
    this.dataSubscriptions.push(subscription);
  }
  private setUpRealtimeSubscription(): void {
    if (this.deviceIndexArray.length > 0) {
      this.deviceIndexArray.forEach((element) => {
        const badDataValue = this.getBadDataValue(element.DataType);
        let deviceSubs = this.realTimeService
          .GetRealtimeData(element.DeviceId, element.DataPointIndex)
          .subscribe((d) => {
            if (d !== undefined && d !== null) {
              element.RawValue = d.Value;
            }
          });
          this.dataSubscriptions.push(deviceSubs);
      });
    }
  }

  private setUpToolChart(): void {
    let chartOptions = new ChartOptions();
    let points = _.cloneDeep(this.pointTemplatesEnity.find(pt => pt.deviceTypeId === this.deviceTypeId));
    if (points && points.PointTemplates.length > 0) {
      let dataPoints = points.PointTemplates.filter(pt => pt.UIChart === true)??[];
      if (this.isESPNoMWTGauge) {
        let inx = dataPoints.findIndex(p => p.DevicePointIndex === ESPToolDataPointIndex.MotorWindingTemperature)??-1;
        if (inx != -1)
          dataPoints.splice(inx, 1);  // Remove Motor Winding Temperature
      }
      let chartPoints: InChargeMonitoringPointTool[] = [];
      dataPoints.forEach(dataPoint => {
        let dp = this.dataPointFacade.getDeviceByPoint(this.toolID, dataPoint.DevicePointIndex);
        if (dp != null) {
          chartPoints.push(
            {
              point: dataPoint,
              deviceDataPoint: dp,
              isFloat: undefined
            }
          );
        }
      });
      let chartPointDict = _.groupBy(chartPoints, point => point.deviceDataPoint.UnitSymbol);
      let yAxes: any [] = [];
      let dataSeries: any [] = [];
      let inxColor = 0;
      for (let unitLabel in chartPointDict) {
        yAxes.push(
          {
            label: unitLabel,
            unit:  unitLabel 
          }
        );
        let series = chartPointDict[unitLabel];
        series.forEach(point => {
          dataSeries.push(
            {
              deviceId: this.toolID, 
              pointIndex: point.point.DevicePointIndex, 
              label: String.Format("{0} ({1})", point.point.Description, point.deviceDataPoint.UnitSymbol??""), 
              unit: point.deviceDataPoint.UnitSymbol,
              decimalPoints: point.point.DecimalPoints,
              brush: UIChartColors.getChartBrush(inxColor++) 
            }
          );
        });
      }

      if (yAxes.length > 0 && dataSeries.length > 0) {
        chartOptions.yAxes = yAxes;
        chartOptions.dataSeries = dataSeries;
      }
    }
    this.multi_axis_series = chartOptions;
  }

  private getDeviceByPointIndex(deviceId: number, pointIndex: number, bIsTool: boolean = false): DataPointDefinitionModel {
    let dp = this.dataPointFacade.getDeviceByPoint(deviceId, pointIndex);
    if (dp != null) {
      if (bIsTool)
        this.toolDeviceIndexArray.push(dp);
      else
        this.deviceIndexArray.push(dp);
      return dp;
    }
      
    return new DataPointDefinitionModel();  // return empty DataPointDefinitionModel
  }

  private setToolOverView() {
    if (!this.dataSourcesEntity || this.dataSourcesEntity.length == 0)
      return;

    if (this.toolConnections && this.toolConnections.length > 0) {
      let toolInx = this.toolConnections.findIndex(t => t.DeviceId === this.toolID)??-1;
      if (toolInx != -1) {
        let tool = this.toolConnections[toolInx];
        let toolGauge = this.dataSourceFacade.getToolGauge(tool.ChannelId, tool.CardDeviceId, tool.DeviceId);
        this.cardName = String.Format("{0} - {1}", tool.ChannelName, tool.CardDeviceName),
        this.toolAddress = toolGauge ? toolGauge.ToolAddress : -999;
        let inxToolType = this.toolTypesStore.findIndex(tt => tt.GaugeType === toolGauge.GaugeType && tt.ESPGaugeType === toolGauge.EspGaugeType)??-1;
        if (inxToolType != -1)
          this.toolTypeName =  toolGauge ? this.toolTypesStore[inxToolType].TypeName: "-"
      }
    }
  }

  private setUpToolDetails(): void {
        this.deviceIndexArray = [];
        if (this.toolConnections && this.toolConnections.length > 0) {
          let toolInx = this.toolConnections.findIndex(t => t.DeviceId === this.toolID)??-1;
          if (toolInx != -1) {
            let tool = this.toolConnections[toolInx];
            if (tool.ZoneName && tool.ZoneName.trim() != "")
              this.toolTitle = String.Format(" > {0} > {1} > {2}", tool.WellName, tool.ZoneName, tool.DeviceName);
            else
              this.toolTitle = String.Format(" > {0} > {1}", tool.WellName, tool.DeviceName);
            this.wellId = tool.WellId;
            this.cardDeviceId = tool.CardDeviceId;
            this.toolCardTitle = String.Format(" > {0} - {1} > {2}", tool.ChannelName, tool.CardDeviceName, tool.DeviceName);
            let toolGauge = this.dataSourceFacade.getToolGauge(tool.ChannelId, tool.CardDeviceId, tool.DeviceId);
    
            if (toolGauge) {
              this.isESPNoMWTGauge = (toolGauge.GaugeType === SureSENSToolType.ESP && toolGauge.EspGaugeType === SureSENS_ESP_Type.NoMWT) ? true : false;
              this.deviceTypeId = UICommon.GetDeviceTypeId(toolGauge.GaugeType);
              this.initPointTemplates(this.deviceTypeId);
            }
          }
        }
  }

  private getToolStatusCode(statusCode : number) {
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

  postCallGetPanelConfigurationCommon(): void {
    if (this.panelConfigurationCommonState.panelConfigurationCommon) {
      let panelType = UICommon.getPanelType(this.panelConfigurationCommonState.panelConfigurationCommon.PanelTypeId).name;
      this.monitoringRoute = String.Format("/{0}/monitoring", panelType);
      this.cardRoute = String.Format("/{0}/card",panelType);
      this.toolboxRoute = String.Format("/{0}/toolbox", panelType);
    }
  }

  postCallGetPointTemplates(): void {
    setTimeout(() => {
    this.subscribeToToolDiagnosticDevice();
    this.subscribeToCardDiagnosticDevice();
  }, 1000);
    
    this.inchargeMonitoringTool.clear();
    if (this.pointTemplatesEnity && this.pointTemplatesEnity.length > 0) {
      this.expandPanels = [];
      this.expandPanels.push(true);
      let points = _.cloneDeep(this.pointTemplatesEnity.find(pt => pt.deviceTypeId === this.deviceTypeId));
      if (this.isESPNoMWTGauge) {
        let inx = points.PointTemplates.findIndex(p => p.DevicePointIndex === ESPToolDataPointIndex.MotorWindingTemperature)??-1;
        if (inx != -1)
          points.PointTemplates.splice(inx, 1);  // Remove Motor Winding Temperature
      }
      if (points) {
        let pointTemplates =  _.groupBy(points.PointTemplates, point => point.PropertyCategoryDescription);
        for (let key in pointTemplates) {
          let pointTemplatesXXX: InChargeMonitoringPointTool[] = [];
          let dataPointsXXX = pointTemplates[key].filter(p => p.UIPropertyList === true)??[];
          dataPointsXXX.forEach(dataPoint => {
            let deviceDataPoint = this.getDeviceByPointIndex(this.toolID, dataPoint.DevicePointIndex);
            // if (deviceDataPoint.UnitSymbol == "degF" || deviceDataPoint.UnitSymbol == "degC")
            //   deviceDataPoint.UnitSymbol = deviceDataPoint.UnitSymbol == "degF" ? "°F" : "°C";

            pointTemplatesXXX.push({
              point: dataPoint,
              deviceDataPoint: deviceDataPoint,
              isFloat: (deviceDataPoint.DataType == DataPointValueDataType.Double64Bit || deviceDataPoint.DataType == DataPointValueDataType.Float32Bit) ? true : false
            });
          });
          this.inchargeMonitoringTool.set(key, pointTemplatesXXX);
          this.expandPanels.push(false);
        }

        this.setUpRealtimeSubscription();
        this.setUpToolChart();
        this.setUpToolsForCard();
      }
    }
  }

  private setUpToolsForCard(): void {
    this.toolDeviceIndexArray = [];
    this.monitoringToolDetails = [];
    let tools = this.toolConnectionEntity.filter(t => t.CardDeviceId === this.cardDeviceId)??[];
    if (tools.length > 0) {
      tools.forEach(cardTool => {
        let inchargeTool: MonitoringToolDetails = {
          deviceId: cardTool.DeviceId,
          toolName: cardTool.DeviceName,
          toolDiagnosticsDevice: this.getDeviceByPointIndex(cardTool.DeviceId, ToolDataPointIndex.Diagnostics, true)
        };
        this.monitoringToolDetails.push(inchargeTool);
      });
      this.setUpRealtimeSubscriptionForTools();
    }
  }

  private setUpRealtimeSubscriptionForTools(): void {
    if (this.toolDeviceIndexArray.length > 0) {
      this.toolDeviceIndexArray.forEach((element) => {
        let deviceSubs = this.realTimeService
          .GetRealtimeData(element.DeviceId, element.DataPointIndex)
          .subscribe((d) => {
            if (d !== undefined && d !== null) {
              element.RawValue = d.Value;
              this.getInvalidTools(element.DeviceId, d.Value);
            }
          });
          this.dataSubscriptions.push(deviceSubs);
      });
    }
  }

  private getInvalidTools(toolDeviceId, diagnosticCode) {
    const toolIdx = this.monitoringToolDetails.findIndex( tool => tool.deviceId === toolDeviceId);
    if(toolIdx !== -1) {
      if(diagnosticCode !== 0) { // Tool is invalid
        if(this.invalidTools.length > 0) {
          const invalidToolIdx =  this.invalidTools.findIndex(t => t.deviceId === toolDeviceId);
          if(invalidToolIdx === -1) { 
            this.invalidTools.push(this.monitoringToolDetails[toolIdx]);
          } else {
            this.invalidTools[invalidToolIdx].toolDiagnosticsDevice.RawValue = diagnosticCode;
          }

        } else {
          this.invalidTools.push(this.monitoringToolDetails[toolIdx]);
        }
      } else if(diagnosticCode === 0) { //  Tool is valid
        if(this.invalidTools.length > 0) {
          const toolIdx =  this.invalidTools.findIndex(t => t.deviceId === toolDeviceId);
          if(toolIdx !== -1) this.invalidTools.splice(toolIdx, 1);
        }
      }
    }
    
    this.setCardToolStatusCode(this.invalidTools);
  }

  private setCardToolStatusCode(tools: MonitoringToolDetails[]) {
    if(tools.length > 0) {
      let toolTipArr = [];
      let toolStatusCriticalCount = 0;
      tools.forEach(tool => {
        if(UICommon.TOOL_DIAGNOSTICS_CODES.findIndex(c => c === tool.toolDiagnosticsDevice.RawValue) === -1 || tool.toolDiagnosticsDevice.RawValue === -999) {
          toolStatusCriticalCount ++;
        }
        const toolStatus = this.utilityService.getToolStatus(tool.toolDiagnosticsDevice.RawValue);
        if (toolStatus) {
          const tooltip = `${tool.toolName} - ${toolStatus}`;
          toolTipArr.push(tooltip);
        }
      });
      this.toolTipText = toolTipArr.length > 0 ? toolTipArr.join("\r\n") : null;
      this.cardToolsStatusCode =  toolStatusCriticalCount > 0 ? TOOL_STATUS.critical : TOOL_STATUS.warning;
    } else {
      this.cardToolsStatusCode =  TOOL_STATUS.valid;
    }
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

  postCallGetToolTypes(): void {
    this.setToolOverView(); // Set ToolType Name
  }

  postCallGetDataSources(): void {
    this.initToolConnections();
  }

  postCallDeviceDataPoints(): void {
    this.setUpToolDetails();
  }

  postCallGetToolConnections(): void {
    this.toolConnections = this.toolConnectionEntity??[];
    this.initDeviceDataPoints();
    this.initToolTypes();
  }

  getParameter(): void {
    this.activatedRoute.params.subscribe(params => {
      this.toolID = parseInt(params['Id']);
    });
  }

  getQueryParameters() {
    this.activatedRoute.queryParams.subscribe( 
      params => { 
        if(params['fromCard']) {
            this.fromCard = true;
        }
      } 
    );
  }

  ngOnDestroy(): void {
    if (this.dataSubscriptions != null && this.dataSubscriptions.length > 0) {
      this.dataSubscriptions.forEach(subscription => {
        if (subscription != null)
          subscription.unsubscribe();
      });
    }

    this.dataSubscriptions = [];
    this.errorHandlingSettingObjs = null;
    super.ngOnDestroy();
  }

  setBtnVisibility() {
    this.userService.GetCurrentLoginUser().then(user => {
      if (user) {
        this.isViewMode = this.userService.isOperatorUser(user) ? true : false;
      }
    });
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.getParameter();
    this.getQueryParameters();
    this.subscribeToErrorHandlingState();
    this.initPanelConfigurationCommon();
    this.subscribeErrorHandling();
    // this.initToolTypes();
    // this.initToolConnections();
    // this.initDeviceDataPoints();
    this.initDataSources();
    // this.setUpToolDetails();
    this.setBtnVisibility();
  }
}

class InChargeMonitoringPointTool {
  point: PointTemplatesExtensionUIModel;
  deviceDataPoint: DataPointDefinitionModel;
  isFloat: boolean;
}

class MonitoringToolDetails {
  deviceId: number;
  toolName: string;
  toolDiagnosticsDevice: DataPointDefinitionModel;
}
