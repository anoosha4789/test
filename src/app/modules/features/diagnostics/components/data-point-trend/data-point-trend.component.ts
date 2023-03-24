import { Component, OnDestroy, OnInit } from '@angular/core';
import { TokenStorageService } from '@core/services/tokenStorage.service';
import { Store } from '@ngrx/store';
import { GatewayChartService } from '@shared/gateway-chart/gatewayChart.service';
import {
  ChartOptions
} from '@shared/gateway-chart/multiaxis-chart/multiaxis-chart.model';
import { IDeviceDataPoints } from '@store/state/deviceDataPoints.state';
import { Observable, Subscription } from 'rxjs';
import * as DEVICEPOINTS_ACTIONS from '@store/actions/deviceDataPoints.action';
import { DeviceModel } from '@core/models/webModels/DeviceInfo.model';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { ButtonActions } from '@shared/gateway-dialogs/components/gateway-advanced-dialog/gateway-advanced-dialog.component';
import { CustomDataPointUIModel, PointTrendDataPointsDialogComponent } from './point-trend-data-points-dialog/point-trend-data-points-dialog.component';
import * as _ from 'lodash';
import { deleteUIModal } from '@core/data/UICommon';

@Component({
  selector: 'app-data-point-trend',
  templateUrl: './data-point-trend.component.html',
  styleUrls: ['./data-point-trend.component.scss'],
})
export class DataPointTrendComponent implements OnInit, OnDestroy {
  private deviceDataPointsModels$: Observable<IDeviceDataPoints>;
  private devices: DeviceModel[];

  public enableRealTimeData = true;
  public showChart = false;
  private dataSubscriptions: Subscription[] = [];

  pointTrendCharts: PointTrendChart[] = [];
  selectedTabIndex: number = 0;

  constructor(
    protected gatewayChartService: GatewayChartService,
    protected tokenStorageService: TokenStorageService,
    protected store: Store<{ deviceDataPointsState: IDeviceDataPoints }>,
    protected gatewayModalService: GatewayModalService,
  ) {
    this.deviceDataPointsModels$ = this.store.select<any>(
      (state: any) => state.deviceDataPointsState
    );
  }

  ngOnInit(): void {
    const subscription = this.deviceDataPointsModels$.subscribe((state: IDeviceDataPoints) => {
      if (state !== undefined) {
        if (state.isLoaded === false) {
          this.store.dispatch(DEVICEPOINTS_ACTIONS.LOAD_DEVICES());
        } else {
          this.devices = state.devices;
        }
      }
    });
    this.dataSubscriptions.push(subscription);

    this.loadTrendColorBrushesLocalSettings();
    this.loadTrendMinMaxLocalSettings();
    this.pointTrendCharts = this.gatewayChartService.getPointTrendCharts();
    setTimeout(() => {
      if (this.pointTrendCharts.length > 0)
        this.showChart = true;
    }, 0);
  }

  showAddDataPointDialog() {
    this.showChart = false;
    let  chartLength =1;
    if(this.pointTrendCharts.length>0){
      chartLength = Math.max(...this.pointTrendCharts.map(o => o.id)) +1;
    }
     let newChart = this.gatewayChartService.getNewPointTrendChart(chartLength);
    this.gatewayModalService.openAdvancedDialog(
      "Configure Point Trend Data Points",
      ButtonActions.None,
      PointTrendDataPointsDialogComponent,
      newChart,
      (result: PointTrendChart) => {
        if (result) {
          this.gatewayChartService.savePointTrendChart(result);
          this.pointTrendCharts = this.gatewayChartService.getPointTrendCharts();
          this.selectedTabIndex = this.pointTrendCharts.length - 1;
        }
        if (this.pointTrendCharts.length > 0) {
          this.showChart = true;
        }
      },
      "980px",
      null,
      null,
      null
    );
  }

  EditChartEventReceiver(event) {
    let currentChart = { id: event.id, chartOptions: event.chartOptions, chartId: event.chartId, customDataLoggerDataPoints: event.customDataLoggerDataPoints };//this.gatewayChartService.getNewPointTrendChart(chartLength);
    this.gatewayModalService.openAdvancedDialog(
      "Configure Point Trend Data Points",
      ButtonActions.None,
      PointTrendDataPointsDialogComponent,
      currentChart,
      (result: PointTrendChart) => {
        if (result) {
          this.gatewayChartService.savePointTrendChart(result);
          this.pointTrendCharts = this.gatewayChartService.getPointTrendCharts();
          if (this.pointTrendCharts.length > 0) {
            this.showChart = true;
          }
        }
      },
      "980px",
      null,
      null,
      null
    );
  }
  private loadTrendColorBrushesLocalSettings(): void {
    const valueString: string = this.tokenStorageService.getLocalSettings(
      'TrendColorBrushes'
    );
    // if (valueString && valueString.length > 10) {
    //   const brushes: string[] = JSON.parse(valueString);
    //   if (brushes) {
    //     brushes.forEach((element, index) => {
    //       this.gatewayChartService.setSeriesBrushColor(index, element);
    //     });
    //   }
    // }
  }
  private loadTrendMinMaxLocalSettings(): void {
    const valueString: string = this.tokenStorageService.getLocalSettings(
      'TrendMinMax'
    );
    // if (valueString && valueString.length > 10) {
    //   const minMaxSettings: YAxes[] = JSON.parse(valueString);
    //   if (minMaxSettings) {
    //     minMaxSettings.forEach((value) => {
    //       this.gatewayChartService.setYAxisMinMaxSettings(value);
    //     });
    //   }
    // }
  }

  onTabChanged(event) {
  }
  receivedMessageHandler(p) {
    let currentChart = { id: p.id, chartId: p.chartId };
    this.gatewayModalService.openDialog(
      `Do you want to delete 'Chart ${currentChart.id}'?`,
      () => {
        this.gatewayModalService.closeModal();
        let index =this.pointTrendCharts.findIndex((element)=>element.chartId === currentChart.chartId);
        if(index !== -1){
          this.pointTrendCharts.splice(index,1)
          window.localStorage.setItem("pointTrendCharts",JSON.stringify(this.pointTrendCharts));
        }
        if(this.pointTrendCharts.length === 0){
          this.showChart = false;
          window.localStorage.removeItem('pointTrendCharts');
        }
      },
      () => this.gatewayModalService.closeModal(),
      deleteUIModal.title,
      null,
      true,
      deleteUIModal.primaryBtnText,
      deleteUIModal.secondaryBtnText
    );
  }
  ngOnDestroy(): void {
    if (this.dataSubscriptions != null && this.dataSubscriptions.length > 0) {
      this.dataSubscriptions.forEach(subscription => {
        if (subscription != null) {
          subscription.unsubscribe();
          subscription = null;
        }
      });
    }

    this.dataSubscriptions = [];
  }
}

export class PointTrendChart {
  id: number;
  chartId: string;
  chartOptions: ChartOptions;
  customDataLoggerDataPoints?: CustomDataPointUIModel[];
}