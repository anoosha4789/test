import { string } from '@amcharts/amcharts4/core';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GatewayPanelBase } from '@comp/GatewayPanelBase.component';
import { UIChartColors, UICommon } from '@core/data/UICommon';
import { DeviceDataPointsFacade } from '@core/facade/deviceDataPointsFacade.service';
import { PanelConfigurationFacade } from '@core/facade/panelConfigFacade.service';
import { PointTemplatesFacade } from '@core/facade/pointTemplatesFacade.service';
import { SurefloFacade } from '@core/facade/surefloFacade.service';
import { WellFacade } from '@core/facade/wellFacade.service';
import { SureFLO298ExUIFlowMeterUIModel } from '@core/models/UIModels/sureflo-ex-flowmeter-model';
import { SureFLO298UIFlowMeterUIModel } from '@core/models/UIModels/sureflo-flowmeter-model';
import { FlowMeterTypes, SureFLOFlowMeterUIModel, WellFlowTypes } from '@core/models/UIModels/sureflo.model';
import { DataPointDefinitionModel, DataPointValueDataType } from '@core/models/webModels/DataPointDefinition.model';
import { PointTemplatesExtensionUIModel } from '@core/models/webModels/PointTemplatesExtensionUIModel.model';
import { RealTimeDataSignalRService } from '@core/services/realTimeDataSignalR.service';
import { Store } from '@ngrx/store';
import { ChartOptions } from '@shared/gateway-chart/multiaxis-chart/multiaxis-chart.model';
import { ButtonActions } from '@shared/gateway-dialogs/components/gateway-advanced-dialog/gateway-advanced-dialog.component';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { String } from 'typescript-string-operations';
import { SetServerComponentData, SetServerValueComponent } from '../setservervalue/setservervalue.component';
import { FLOWMETERS_LOAD } from '@store/actions/sureflo.entity.action';
import { ErrorHandlingUIModel } from '@core/models/webModels/ErrorHandlingUI.model';
import { ConfigurationService } from '@core/services/configurationService.service';
@Component({
  selector: 'gw-sureflodetails',
  templateUrl: './sureflodetails.component.html',
  styleUrls: ['../../assets/css/monitoring.scss', './sureflodetails.component.scss']
})
export class SurefloDetailsComponent extends GatewayPanelBase implements OnInit, OnDestroy {

  toolTitle: string = "";
  monitoringRoute: string = "/incharge/monitoring";

  floMeterDeviceId: number;
  flowMeterWellId: number;
  flowMeterTechnology: string;
  flowMeterFluidType: string;
  flowMeterWellName: string;

  expandPanels: boolean[] = [];
  deviceTypeId: number;
  deviceIndexArray: DataPointDefinitionModel[];
  sureFLOOverviewMonitoringTools: SureFLOMonitoringOverViewTool[];
  sureFLOMonitoringTool: Map<string, SureFLOMonitoringPointTool[]> = new Map<string, SureFLOMonitoringPointTool[]>();
  chartId: string = "sureflodetails";
  multi_axis_series: any; 
  errorHandlingSettings: ErrorHandlingUIModel;
  private dataSubscriptions: Subscription[] = [];

  private SETSERVERVALUE_WARNING: string = "Changes will affect flow rate calculation results. Please consult with a qualified personnel.";
  private isRealtimeValueSet: boolean = false;

  IsMobileView: boolean = false;

  constructor(protected store: Store,
    private panelConfigFacade: PanelConfigurationFacade,
    private wellsFacade: WellFacade,
    private surefloToolFacade: SurefloFacade,
    private dataPointFacade: DeviceDataPointsFacade,
    private pointTemplateFacade: PointTemplatesFacade,
    private realTimeService: RealTimeDataSignalRService,
    private gwModalService: GatewayModalService,
    private configurationService: ConfigurationService,
    protected activatedRoute: ActivatedRoute) {
    super(store, panelConfigFacade, wellsFacade, null, null, dataPointFacade, pointTemplateFacade, surefloToolFacade);
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

  setServerValue(dataPoint: SureFLOMonitoringPointTool) {
    let serverData: SetServerComponentData = {
      fieldName: "Value",
      min: dataPoint.point.MinValue,
      max: dataPoint.point.MaxValue,
      precision: 3,
      device: dataPoint.deviceDataPoint,
      warning: this.SETSERVERVALUE_WARNING
    };
    let dialogSetServerValue = this.gwModalService.openDialogInsideModal(
      dataPoint.point.Description,
      ButtonActions.None,
      SetServerValueComponent,
      serverData,
      (res) => {
        if (res) {
          this.isRealtimeValueSet = true;
          this.store.dispatch(FLOWMETERS_LOAD()); // Reload the SureFLO configuration for changes.
        }
        dialogSetServerValue.close();
      },
      '350px',
    );
  }

  private setUpRealtimeSubscription(): void {
    if (this.deviceIndexArray.length > 0) {
      this.deviceIndexArray.forEach((element) => {
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

  private setUpSureFLOChart(): void {
    let chartOptions = new ChartOptions();
    let points = _.cloneDeep(this.pointTemplatesEnity.find(pt => pt.deviceTypeId === this.deviceTypeId));
    if (points && points.PointTemplates.length > 0) {
      let dataPoints = points.PointTemplates.filter(pt => pt.UIChart === true)??[];
      let chartPoints: SureFLOMonitoringPointTool[] = [];
      dataPoints.forEach(dataPoint => {
        let dp = this.dataPointFacade.getDeviceByPoint(this.floMeterDeviceId, dataPoint.DevicePointIndex);
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
              deviceId: this.floMeterDeviceId, 
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

  private setFlowMeterOverview(): void {
    if (this.floMeterDeviceId > 0 && this.wellEnity && this.wellEnity.length > 0) {
      let flowMeter = this.surefloEnity.find(fm => fm.DeviceId === this.floMeterDeviceId);
      if (flowMeter) {
        this.flowMeterWellId = flowMeter.WellId;
        this.flowMeterTechnology = FlowMeterTypes[flowMeter.Technology];
        this.flowMeterFluidType = WellFlowTypes[flowMeter.FluidType];
        this.flowMeterWellName = this.wellEnity.find(w => w.WellId === flowMeter.WellId)?.WellName;
        this.toolTitle = String.Format(" > {0} > {1}", this.flowMeterWellName, flowMeter.DeviceName);
      }
    }
  }

  private addSureFLOMonitoringOverviewTool(displayName: string, deviceId: number, pointIndex: number): void {
    let deviceDataPoint = this.getDeviceByPointIndex(deviceId, pointIndex);
    // if (deviceDataPoint.UnitSymbol == "degF" || deviceDataPoint.UnitSymbol == "degC")
    //           deviceDataPoint.UnitSymbol = deviceDataPoint.UnitSymbol == "degF" ? "°F" : "°C";

    this.sureFLOOverviewMonitoringTools.push({
      tag: displayName,
      deviceDataPoint: deviceDataPoint
    });
  }

  private setUpSureFLOMonitoringOverview(floMeter: SureFLOFlowMeterUIModel) {
    const technology: any = floMeter.Technology;
    this.sureFLOOverviewMonitoringTools = [];
    if (technology === FlowMeterTypes.SureFLO298) {
      let flowMeter298 = floMeter as SureFLO298UIFlowMeterUIModel;
      this.addSureFLOMonitoringOverviewTool("Inlet Pressure", flowMeter298.flowMeterPTMapping.InletPressureSource.DeviceId, flowMeter298.flowMeterPTMapping.InletPressureSource.DataPointIndex);
      this.addSureFLOMonitoringOverviewTool("Throat Pressure", flowMeter298.flowMeterPTMapping.ThroatPressureSource.DeviceId, flowMeter298.flowMeterPTMapping.ThroatPressureSource.DataPointIndex);
      this.addSureFLOMonitoringOverviewTool("Reservoir Temperature", flowMeter298.flowMeterPTMapping.TemperatureSource.DeviceId, flowMeter298.flowMeterPTMapping.TemperatureSource.DataPointIndex);
      if (flowMeter298.flowMeterPTMapping.UseRemoteGauge)
        this.addSureFLOMonitoringOverviewTool("Remote Pressure", flowMeter298.flowMeterPTMapping.RemotePressureSource.DeviceId, flowMeter298.flowMeterPTMapping.RemotePressureSource.DataPointIndex);
    }
    else {
      let flowMeter298Ex = floMeter as SureFLO298ExUIFlowMeterUIModel;
      this.addSureFLOMonitoringOverviewTool("Inlet Pressure", flowMeter298Ex.flowMeterPTMapping.InletPressureSource.DeviceId, flowMeter298Ex.flowMeterPTMapping.InletPressureSource.DataPointIndex);
      this.addSureFLOMonitoringOverviewTool("Outlet Pressure", flowMeter298Ex.flowMeterPTMapping.OutletPressureSource.DeviceId, flowMeter298Ex.flowMeterPTMapping.OutletPressureSource.DataPointIndex);
      this.addSureFLOMonitoringOverviewTool("Inlet Temperature", flowMeter298Ex.flowMeterPTMapping.InletTemperatureSource.DeviceId, flowMeter298Ex.flowMeterPTMapping.InletTemperatureSource.DataPointIndex);
      this.addSureFLOMonitoringOverviewTool("Outlet Temperature", flowMeter298Ex.flowMeterPTMapping.OutletTemperatureSource.DeviceId, flowMeter298Ex.flowMeterPTMapping.OutletTemperatureSource.DataPointIndex);
      if (flowMeter298Ex.flowMeterPTMapping.UseRemoteGauge) {
        this.addSureFLOMonitoringOverviewTool("Remote Pressure", flowMeter298Ex.flowMeterPTMapping.RemotePressureSource.DeviceId, flowMeter298Ex.flowMeterPTMapping.RemotePressureSource.DataPointIndex);
        this.addSureFLOMonitoringOverviewTool("Remote Temperature", flowMeter298Ex.flowMeterPTMapping.RemoteTemperatureSource.DeviceId, flowMeter298Ex.flowMeterPTMapping.RemoteTemperatureSource.DataPointIndex);
      }
    }
  }

  private setUpSureFLODetails(): void {
    if (this.floMeterDeviceId > 0 && this.wellEnity && this.wellEnity.length > 0) {
      let flowMeter = this.surefloEnity.find(fm => fm.DeviceId === this.floMeterDeviceId);
      if (flowMeter) {
        this.deviceIndexArray = [];
        this.setFlowMeterOverview();
        this.setUpSureFLOMonitoringOverview(flowMeter);
        this.deviceTypeId = this.surefloToolFacade.getSureFLODeviceTypeId(flowMeter.Technology, flowMeter.FluidType);
        this.initPointTemplates(this.deviceTypeId);
      }
    }
  }

  private getDeviceByPointIndex(deviceId: number, pointIndex: number): DataPointDefinitionModel {
    let dp = this.dataPointFacade.getDeviceByPoint(deviceId, pointIndex);
    if (dp != null) {
      this.deviceIndexArray.push(dp);
      return dp;
    }
      
    return new DataPointDefinitionModel();  // return empty DataPointDefinitionModel
  }

  postCallGetPointTemplates(): void {
    this.sureFLOMonitoringTool.clear();
    if (this.pointTemplatesEnity && this.pointTemplatesEnity.length > 0) {
      this.expandPanels = [];
      this.expandPanels.push(this.isRealtimeValueSet ? false : true);
      let points = _.cloneDeep(this.pointTemplatesEnity.find(pt => pt.deviceTypeId === this.deviceTypeId));
      
      if (points) {
        let pointTemplates =  _.groupBy(points.PointTemplates, point => point.PropertyCategoryDescription);
        for (let key in pointTemplates) {
          let pointTemplatesXXX: SureFLOMonitoringPointTool[] = [];
          let dataPointsXXX = pointTemplates[key].filter(p => p.UIPropertyList === true)??[];
          dataPointsXXX.forEach(dataPoint => {
            let deviceDataPoint = this.getDeviceByPointIndex(this.floMeterDeviceId, dataPoint.DevicePointIndex);
            // if (deviceDataPoint.UnitSymbol == "degF" || deviceDataPoint.UnitSymbol == "degC")
            //   deviceDataPoint.UnitSymbol = deviceDataPoint.UnitSymbol == "degF" ? "°F" : "°C";

            pointTemplatesXXX.push({
              point: dataPoint,
              deviceDataPoint: deviceDataPoint,
              isFloat: (deviceDataPoint.DataType == DataPointValueDataType.Double64Bit || deviceDataPoint.DataType == DataPointValueDataType.Float32Bit) ? true : false
            });
          });
          this.sureFLOMonitoringTool.set(key, pointTemplatesXXX);
          this.expandPanels.push(false);
        }

        this.setUpRealtimeSubscription();
        this.setUpSureFLOChart();

        if (this.isRealtimeValueSet)
          this.expandPanels[this.expandPanels.length - 1] = true;
      }
    }
  }

  postCallGetPanelConfigurationCommon(): void {
    if (this.panelConfigurationCommonState.panelConfigurationCommon) {
      let panelType = UICommon.getPanelType(this.panelConfigurationCommonState.panelConfigurationCommon.PanelTypeId).name;
      this.monitoringRoute = String.Format("/{0}/monitoring", panelType);
    }
  }

  postCallGetWells(): void {
    if (this.wellEnity && this.wellEnity.length > 0)
      this.setFlowMeterOverview();
  }

  postCallGetFlowMeters(): void {
    if (this.surefloEnity && this.surefloEnity.length > 0) {
      this.setUpSureFLODetails();
    }
  }

  postCallDeviceDataPoints(): void {
    this.setUpSureFLODetails();
  }

  getParameter(): void {
    this.activatedRoute.params.subscribe(params => {
      this.floMeterDeviceId = parseInt(params['Id']);
      this.initFlowMeters();
    });
  }
  private subscribeErrorHandling(): void {
    const subscription = this.configurationService.getErrorHandlingSettings().subscribe((data) => {
      this.errorHandlingSettings = data;
    });
    this.dataSubscriptions.push(subscription);
  }
  ngOnDestroy(): void {
    if (this.dataSubscriptions != null && this.dataSubscriptions.length > 0) {
      this.dataSubscriptions.forEach(subscription => {
        if (subscription != null)
          subscription.unsubscribe();
      });
    }

    this.dataSubscriptions = [];
    this.errorHandlingSettings = null;
    super.ngOnDestroy();
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.getParameter();
    this.initWells();
    this.initDeviceDataPoints();
    this.initPanelConfigurationCommon();
    this.subscribeErrorHandling();
  }
}

class SureFLOMonitoringPointTool {
  point: PointTemplatesExtensionUIModel;
  deviceDataPoint: DataPointDefinitionModel;
  isFloat: boolean;
}

class SureFLOMonitoringOverViewTool {
  tag: string;
  deviceDataPoint: DataPointDefinitionModel;
}
