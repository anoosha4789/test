import {
  Component,
  OnInit,
  ViewChild,
  Input,
  ElementRef,
  HostListener,
  TemplateRef,
  Output,
  EventEmitter
} from '@angular/core';
import { GatewayChartService } from '../../../gatewayChart.service';
import { DatePipe } from '@angular/common';
import { Observable, Subscription } from 'rxjs';

import {
  IgxRectChangedEventArgs,
  Visibility
} from 'igniteui-angular-core';
import {
  IgxLineSeriesComponent,
  IgxDataChartComponent,
  AxisLabelsLocation,
  IgxZoomSliderComponent,
  IgxTimeXAxisComponent,
  IgxTimeAxisLabelFormatComponent,
  IgxTimeAxisIntervalComponent,
  TimeAxisIntervalType,
  IgxAxisRangeChangedEventArgs,
  IgxNumericYAxisComponent
} from 'igniteui-angular-charts';

import { ChartOptions, ChartSettings, XAxisSetting } from '../../multiaxis-chart.model';
import { DeviceIdIndexValue } from '@core/models/webModels/PointTemplate.model';
import { RealTimeDataSignalRService } from '@core/services/realTimeDataSignalR.service';
import { HistorianTimeRange } from '@core/models/webModels/DeviceInfo.model';
import { IgxDialogComponent } from '@infragistics/igniteui-angular';
import { Store } from '@ngrx/store';
import * as UNITSYSTEM_ACTIONS from '@store/actions/unit-system.action';
import { IUnitSystemState } from '@store/state/unit-system.state';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { String } from 'typescript-string-operations';
import { UnitQuantities } from '@core/models/webModels/UnitSystem.model';
import * as _ from 'lodash';

@Component({
  selector: 'gateway-multiaxis-chart',
  templateUrl: './multiaxis-chart.component.html',
  styleUrls: ['./multiaxis-chart.component.scss'],
})
export class MultiaxisChartComponent implements OnInit {
  @ViewChild('infrgChart', { static: true })
  public infrgChart: IgxDataChartComponent;

  // Line X Axis
  @ViewChild('xAxisTime', { static: true })
  // public xAxisTime: IgxCategoryXAxisComponent;
  public xAxisTime: IgxTimeXAxisComponent;

  // Zoom Slider
  @ViewChild('zoomSlider', { static: true })
  public zoomSlider: IgxZoomSliderComponent = null;

  @ViewChild('valueTooltip', { static: true })
  public toolTipTemplate: TemplateRef<any>;

  @ViewChild('toolChart', { static: true })
  public toolChart: ElementRef;

  @ViewChild('chartSettingsPopUp', { static: true })
  public chartSettingsPopUp: IgxDialogComponent;

  @ViewChild('resetChartPopUp', { static: true })
  public resetChartPopUp: IgxDialogComponent;

  // Line Y Series Map
  private igxSeriesBrushMap = new Map<number, string>();
  private igxYAxisMap = new Map<string, IgxNumericYAxisComponent>();
  private seriesYAxesMap = new Map<number, string>();
  seriesLegendMap = new Map<number, any[]>();

  @Input('chartId') chartId: string;  // Unique string to distinguish charts
  @Input('chartOptions') chartOptions: ChartOptions;
  @Input('chartTitle') chartTitle: string;
  @Input('id') id: number;
  @Input('selectedChartDataPoints') selectedChartDataPoints: any[];
  @Input('enableRealTime') enableRealTime: boolean = true;
  @Input('isFileHistorian') isFileHistorian: boolean = false;

  @Input('displayChartSettingsOptions') displayChartSettingsOptions: string = "allCharts";

  @Input('MinReturns') MinReturns: number;
  @Input('MaxReturns') MaxReturns: number;
  @Input('timeRange') timeRange: HistorianTimeRange;

  @Output()
  isDeleteChartEmitEvent = new EventEmitter();

  @Output()
  isEditChartEmitEvent = new EventEmitter();

  @Input('Height') Height: number;
  chartHeight: number;

  toDate: Date;
  fromDate: Date;
  private seriesData: any[] = [];

  infragistics_data = [];
  arrSeriesMappings = [];

  private interval: number;
  private dataSubscriptions: Subscription[] = [];

  private deviceIdIndexValue: DeviceIdIndexValue[] = [];
  private realTimeDate: Date = new Date(2000, 1);

  private transperantBrush = 'rgba(0,0,0,0)';
  private _minReturns: number;
  private _maxReturns: number;
  private _minIndex: number;
  private _maxIndex: number;

  isZoomed: boolean = false;
  isMobileView: boolean = false;
  showResetBtn: boolean = false;
  hasDataSeries: boolean = true;
  ChartOptionshelp: string = null;
  validationMessage: string = null;
  isIntervalChanged: boolean = false;

  private unitSystemModel$: Observable<IUnitSystemState>;
  private unitSystemSelections: Map<string, string> = new Map<string, string>();
  private UnitQuantities: UnitQuantities[];
  constructor(
    protected store: Store,
    private gatewayChartService: GatewayChartService,
    private realTimeService: RealTimeDataSignalRService,
    private datePipe: DatePipe,
    protected gatewayModalService: GatewayModalService,
  ) {
    this.unitSystemModel$ = this.store.select<any>(
      (state: any) => state.unitSystemState
    );
    this.interval = this.gatewayChartService.RequestInterval;
  }

  private getSeriesPointValue(value: number, series: number): number {
    let retVal = value;
    switch (series) {
      case 1:
        if (value === null) {
          retVal =
            this.infragistics_data.length > 1
              ? this.infragistics_data[this.infragistics_data.length - 1]
                .series1Data
              : null;
        }
        break;

      case 2:
        if (value === null) {
          retVal =
            this.infragistics_data.length > 1
              ? this.infragistics_data[this.infragistics_data.length - 1]
                .series2Data
              : null;
        }
        break;

      case 3:
        if (value === null) {
          retVal =
            this.infragistics_data.length > 1
              ? this.infragistics_data[this.infragistics_data.length - 1]
                .series3Data
              : null;
        }
        break;

      case 4:
        if (value === null) {
          retVal =
            this.infragistics_data.length > 1
              ? this.infragistics_data[this.infragistics_data.length - 1]
                .series4Data
              : null;
        }
        break;

      case 5:
        if (value === null) {
          retVal =
            this.infragistics_data.length > 1
              ? this.infragistics_data[this.infragistics_data.length - 1]
                .series5Data
              : null;
        }
        break;

      case 6:
        if (value === null) {
          retVal =
            this.infragistics_data.length > 1
              ? this.infragistics_data[this.infragistics_data.length - 1]
                .series6Data
              : null;
        }
        break;

      case 7:
        if (value === null) {
          retVal =
            this.infragistics_data.length > 1
              ? this.infragistics_data[this.infragistics_data.length - 1]
                .series7Data
              : null;
        }
        break;

      case 8:
        if (value === null) {
          retVal =
            this.infragistics_data.length > 1
              ? this.infragistics_data[this.infragistics_data.length - 1]
                .series8Data
              : null;
        }
        break;

      case 9:
        if (value === null) {
          retVal =
            this.infragistics_data.length > 1
              ? this.infragistics_data[this.infragistics_data.length - 1]
                .series9Data
              : null;
        }
        break;

      case 10:
        if (value === null) {
          retVal =
            this.infragistics_data.length > 1
              ? this.infragistics_data[this.infragistics_data.length - 1]
                .series10Data
              : null;
        }
        break;

      case 11:
        if (value === null) {
          retVal =
            this.infragistics_data.length > 1
              ? this.infragistics_data[this.infragistics_data.length - 1]
                .series11Data
              : null;
        }
        break;

      case 12:
        if (value === null) {
          retVal =
            this.infragistics_data.length > 1
              ? this.infragistics_data[this.infragistics_data.length - 1]
                .series12Data
              : null;
        }
        break;

      case 13:
        if (value === null) {
          retVal =
            this.infragistics_data.length > 1
              ? this.infragistics_data[this.infragistics_data.length - 1]
                .series13Data
              : null;
        }
        break;

      case 14:
        if (value === null) {
          retVal =
            this.infragistics_data.length > 1
              ? this.infragistics_data[this.infragistics_data.length - 1]
                .series14Data
              : null;
        }
        break;

      case 15:
        if (value === null) {
          retVal =
            this.infragistics_data.length > 1
              ? this.infragistics_data[this.infragistics_data.length - 1]
                .series15Data
              : null;
        }
        break;

      case 16:
        if (value === null) {
          retVal =
            this.infragistics_data.length > 1
              ? this.infragistics_data[this.infragistics_data.length - 1]
                .series16Data
              : null;
        }
        break;
    }

    let decimalPoint = 2;
    const lgSeriesMapping = this.arrSeriesMappings.find(l => l.seriesIndex === series);
    if (lgSeriesMapping) {
      decimalPoint = lgSeriesMapping.decimalPoints ?? 2;
    }

    return Number(retVal?.toFixed(decimalPoint));
  }

  private getSeriesHistorianDataForCharts(): void {
    const inputDataPoints = [];
    this.chartOptions.dataSeries.forEach((element) => {
      if (element.deviceId !== null && element.pointIndex !== null) {
        inputDataPoints.push({
          deviceId: element.deviceId,
          pointIndex: element.pointIndex,
        });
      }
    });
    const chartDataModel: any = {
      dataPoints: inputDataPoints,
      fromDate: this.datePipe.transform(this.fromDate, 'yyyy-MM-ddTHH:mm:ss'),
      toDate: this.datePipe.transform(this.toDate, 'yyyy-MM-ddTHH:mm:ss'),
    };

    if (this.isFileHistorian) {
      let csvData = this.gatewayChartService.getCSVHistorianFileData();
      this.seriesData = csvData.csvHistorianValues;
      this.getChartDataForSeriesFromFile(csvData.date);
    }
    else {
      const subscription = this.gatewayChartService
        .getMultipleChartDataForTimeRange(chartDataModel)
        .subscribe((data) => {
          this.infragistics_data = [];
          if (data.length > 0) {
            this.seriesData = data;
          }
          this.getChartDataForSeries();
          const labelInterval = this.xAxisTime.intervals.item(0);
          this.setUpChartAxesOnWidth(labelInterval);
        });
      this.dataSubscriptions.push(subscription);
    }
  }

  /* private setSeriesData(seriesDataItem, objData, index) {
    let key = `series${index + 1}Data`;
    objData[key] = this.getSeriesPointValue(
      seriesDataItem.Value[index],
      index + 1
    );
  }
   */
  private getChartDataForSeries() {
    if (this.seriesData.length > 0) {
      this.infragistics_data = [];

      this.seriesData.forEach((element) => {
        const dtDate = new Date(element.Key);

        const objData: any = {};
        // this.addZero(dtDate.getHours()) + ":" + this.addZero(dtDate.getMinutes()) + ":" + this.addZero(dtDate.getSeconds());
        objData.label = dtDate;
        objData.dateValue = dtDate.getTime();
        element.Value.forEach((dataValue, index) => {
          switch (index) {
            case 0: // Series 1
              objData.series1Data = this.getSeriesPointValue(
                element.Value[index],
                1
              );
              break;

            case 1: // Series 2
              objData.series2Data = this.getSeriesPointValue(
                element.Value[index],
                2
              );
              break;

            case 2: // Series 3
              objData.series3Data = this.getSeriesPointValue(
                element.Value[index],
                3
              );
              break;

            case 3: // Series 4
              objData.series4Data = this.getSeriesPointValue(
                element.Value[index],
                4
              );
              break;

            case 4: // Series 5
              objData.series5Data = this.getSeriesPointValue(
                element.Value[index],
                5
              );
              break;

            case 5: // Series 6
              objData.series6Data = this.getSeriesPointValue(
                element.Value[index],
                6
              );
              break;

            case 6: // Series 7
              objData.series7Data = this.getSeriesPointValue(
                element.Value[index],
                6
              );
              break;

            case 7: // Series 8
              objData.series8Data = this.getSeriesPointValue(
                element.Value[index],
                7
              );
              break;
            case 8: // Series 9
              objData.series9Data = this.getSeriesPointValue(
                element.Value[index],
                8
              );
              break;

            case 9: // Series 10
              objData.series10Data = this.getSeriesPointValue(
                element.Value[index],
                9
              );
              break;

            case 10: // Series 11
              objData.series11Data = this.getSeriesPointValue(
                element.Value[index],
                10
              );
              break;

            case 11: // Series 12
              objData.series12Data = this.getSeriesPointValue(
                element.Value[index],
                11
              );
              break;

            case 12: // Series 13
              objData.series13Data = this.getSeriesPointValue(
                element.Value[index],
                12
              );
              break;

            case 13: // Series 14
              objData.series14Data = this.getSeriesPointValue(
                element.Value[index],
                13
              );
              break;

            case 14: // Series 15
              objData.series15Data = this.getSeriesPointValue(
                element.Value[index],
                14
              );
              break;

            case 15: // Series 16
              objData.series16Data = this.getSeriesPointValue(
                element.Value[index],
                15
              );
              break;
          }
        });
        if (this.MinReturns !== null && this.MinReturns !== null) {
          this.setMinMaxValue('Min', objData, this._minReturns);
          this.setMinMaxValue('Max', objData, this._maxReturns);
        }
        this.infragistics_data.push(objData);
      });
    }
    if (this.enableRealTime) {
      this.subScribeToRealTimeData();
    }
  }

  private getChartDataForSeriesFromFile(date: string): void {
    if (this.seriesData.length > 0) {
      this.infragistics_data = [];

      this.seriesData.forEach((element) => {
        let dateStr = String.Format("{0} {1}", date, element[0]);
        const dtDate = new Date(dateStr);

        const objData: any = {};
        objData.label = dtDate;
        objData.dateValue = dtDate.getTime();

        this.chartOptions.dataSeries.forEach((seriesPoint, index) => {
          switch(index)
          {
            case 0:
              objData.series1Data = parseFloat(element[seriesPoint.pointIndex]);
              break;

            case 1:
              objData.series2Data = parseFloat(element[seriesPoint.pointIndex]);
              break;

            case 2:
              objData.series3Data = parseFloat(element[seriesPoint.pointIndex]);
              break;

            case 3:
              objData.series4Data = parseFloat(element[seriesPoint.pointIndex]);
              break;

            case 4:
              objData.series5Data = parseFloat(element[seriesPoint.pointIndex]);
              break;

            case 5:
              objData.series6Data = parseFloat(element[seriesPoint.pointIndex]);
              break;

            case 6:
              objData.series7Data = parseFloat(element[seriesPoint.pointIndex]);
              break;

            case 7:
              objData.series8Data = parseFloat(element[seriesPoint.pointIndex]);
              break;

            case 8:
              objData.series9Data = parseFloat(element[seriesPoint.pointIndex]);
              break;

            case 9:
              objData.series10Data = parseFloat(element[seriesPoint.pointIndex]);
              break;

            case 10:
              objData.series11Data = parseFloat(element[seriesPoint.pointIndex]);
              break;

            case 11:
              objData.series12Data = parseFloat(element[seriesPoint.pointIndex]);
              break;

            case 12:
              objData.series13Data = parseFloat(element[seriesPoint.pointIndex]);
              break;

            case 13:
              objData.series14Data = parseFloat(element[seriesPoint.pointIndex]);
              break;

            case 14:
              objData.series15Data = parseFloat(element[seriesPoint.pointIndex]);
              break;

            case 15:
              objData.series16Data = parseFloat(element[seriesPoint.pointIndex]);
              break;
          }
        });

        if (this.MinReturns !== null && this.MinReturns !== null) {
          this.setMinMaxValue('Min', objData, this._minReturns);
          this.setMinMaxValue('Max', objData, this._maxReturns);
        }
        this.infragistics_data.push(objData);
      });
      if (this.infragistics_data.length > 1) {
        this.fromDate = new Date(this.infragistics_data[0].dateValue);
        this.toDate = new Date(this.infragistics_data[this.infragistics_data.length - 1].dateValue);
      }
    }
  }
  
  addZero(i: number) {
    if (i < 10) {
      return ('0' + i.toString()).toString();
    }
    return i.toString();
  }

  setRealtimeData(deviceIndex: number): number {
    const nRetVal = null;
    let decimalPoint = 2;
    const lgSeriesMapping = this.arrSeriesMappings.find(l => l.seriesIndex === deviceIndex);
    if (lgSeriesMapping) {
      decimalPoint = lgSeriesMapping.decimalPoints ?? 2;
    }

    if (this.deviceIdIndexValue.length > deviceIndex) {
      return Number(this.deviceIdIndexValue[deviceIndex].value?.toFixed(decimalPoint));
    }
    return nRetVal;
  }

  subScribeToRealTimeData() {
    let deviceSubs = null;
    let timeSub = null;

    this.chartOptions.dataSeries.forEach((inputSeries) => {
      if (inputSeries.deviceId !== null && inputSeries.pointIndex !== null) {
        this.deviceIdIndexValue.push(
          new DeviceIdIndexValue(
            inputSeries.deviceId,
            inputSeries.pointIndex,
            -999,
            ''
          )
        );
      }
    });

    if (
      this.deviceIdIndexValue !== undefined &&
      this.deviceIdIndexValue !== null
    ) {
      this.deviceIdIndexValue.forEach((e) => {
        deviceSubs = this.realTimeService
          .GetRealtimeData(e.deviceId, e.pointIndex)
          .subscribe((d) => {
            if (d !== undefined && d !== null) {
              e.match(d);
            }
          });
        this.dataSubscriptions.push(deviceSubs);
      });

      timeSub = this.realTimeService.GetUpdateDateValue().subscribe((dt) => {
        this.realTimeDate = dt;
        // get the time difference to splice data if required
        const minDateTime =
          this.infragistics_data.length > 0
            ? this.infragistics_data[0].dateValue
            : new Date(1970, 1);

        const timeDiff = (this.realTimeDate?.getTime() - minDateTime) / 1000;
        let chartVal = null;
        if (this.infragistics_data.length > 0 && timeDiff > 7500) {
          // 5 minutes
          const dtRemove = minDateTime + 300000;
          for (let iVal = 0; ; iVal++) {
            const dtValue = this.infragistics_data[iVal];
            if (dtValue.dateValue > dtRemove) {
              break;
            }

            chartVal = this.infragistics_data.splice(0, 1);
            this.infrgChart.notifyRemoveItem(
              this.infragistics_data,
              0,
              chartVal
            );
          }
        }
        // set new time here
        const newVal = {
          // tslint:disable-next-line: max-line-length
          label: this.realTimeDate, // this.addZero(this.realTimeDate.getHours()) + ":" + this.addZero(this.realTimeDate.getMinutes()) + ":" + this.addZero(this.realTimeDate.getSeconds()),
          dateValue: this.realTimeDate?.getTime(),
          series1Data: this.setRealtimeData(0),
          series2Data: this.setRealtimeData(1),
          series3Data: this.setRealtimeData(2),
          series4Data: this.setRealtimeData(3),
          series5Data: this.setRealtimeData(4),
          series6Data: this.setRealtimeData(5),
          series7Data: this.setRealtimeData(6),
          series8Data: this.setRealtimeData(7),
          series9Data: this.setRealtimeData(8),
          series10Data: this.setRealtimeData(9),
          series11Data: this.setRealtimeData(10),
          series12Data: this.setRealtimeData(11),
          series13Data: this.setRealtimeData(12),
          series14Data: this.setRealtimeData(13),
          series15Data: this.setRealtimeData(14),
          series16Data: this.setRealtimeData(15)
        };

        if (this.MinReturns !== null && this.MinReturns !== null) {
          this.setMinMaxValue('Min', newVal, this._minReturns);
          this.setMinMaxValue('Max', newVal, this._maxReturns);
        }
        this.infragistics_data.push(newVal);
        this.infrgChart.notifyInsertItem(
          this.infragistics_data,
          this.infragistics_data.length - 1,
          newVal
        );

        const labelInterval = this.xAxisTime.intervals.item(0);
        this.setUpChartAxesOnWidth(labelInterval);
      });
      this.dataSubscriptions.push(timeSub);
    }
  }

  onToggle(event, index) {
    // index = refers to index of series data, IgxSeries
    const igxSeriesBrush = this.igxSeriesBrushMap.get(index);
    if (igxSeriesBrush !== undefined && igxSeriesBrush !== null) {
      this.infrgChart.series.item(index).brush = event.checked ? igxSeriesBrush : this.transperantBrush;
      this.infrgChart.series.item(index).tooltipTemplate = event.checked ? this.toolTipTemplate : null;

      // Get Visible series count associated with Y axes
      const unitLabel = this.chartOptions.dataSeries[index].unit;
      let igxSeries = this.infrgChart.series.item(index) as IgxLineSeriesComponent;
      igxSeries.xAxis = event.checked ? this.xAxisTime : null;

      let unitCount = 0;
      this.seriesYAxesMap.forEach((unitName, seriesIndex) => {
        if (unitName === unitLabel && this.infrgChart.series.item(seriesIndex).brush !== this.transperantBrush) {
          unitCount++;
        }
      });

      // Hide Y Axes on basis of visible series associated
      const yAxis = this.igxYAxisMap.get(unitLabel);
      if (yAxis !== undefined && yAxis !== null) {
        yAxis.labelVisibility =
          unitCount === 0 ? Visibility.Collapsed : Visibility.Visible;
      }
    }

    // Set Series visibilty in legendsData
    const legend = this.arrSeriesMappings.find((l) => l.seriesIndex === index);
    legend.checked = event.checked;
  }

  zoomChange(zoom: boolean): void {
    const windowRect = this.infrgChart.windowRect;
    if (zoom === true) {
      // Zoom In
      const newZoom = {
        left: windowRect.left + 0.09999 > 1 ? 1 : windowRect.left + 0.09999,
        width: windowRect.width - 0.1 < 0 ? 0 : windowRect.width - 0.1,
        top: 0,
        height: 1,
      };
      this.infrgChart.windowRect = newZoom;
    } else {
      // Zoom Out
      const newZoom = {
        left: windowRect.left - 0.09999 < 0 ? 0 : windowRect.left - 0.09999,
        width: windowRect.width + 0.1 > 1 ? 1 : windowRect.width + 0.1,
        top: 0,
        height: 1,
      };
      this.infrgChart.windowRect = newZoom;
    }
  }

  zoomOutAll(): void {
    const newZoom = {
      left: 0,
      width: 1,
      top: 0,
      height: 1,
    };
    this.infrgChart.windowRect = newZoom;
  }

  public onZoomSliderWindowChanged(
    slider: IgxZoomSliderComponent,
    args: IgxRectChangedEventArgs
  ) {
    this.syncZooms(slider);
  }

  public onActualWindowRectChanged(
    chart: IgxDataChartComponent,
    args: IgxRectChangedEventArgs
  ) {
    this.syncZooms(chart);
  }

  private onIgxYAxisRangeChanged(e: IgxAxisRangeChangedEventArgs): void {
    if (this.IsMobile() && window.orientation === 0) {
      this.igxYAxisMap.forEach((yAxes) => {
        yAxes.interval =
          yAxes.actualMaximumValue <= 0
            ? -Math.floor(yAxes.actualMinimumValue * 1.5)
            : Math.floor(
              (yAxes.actualMaximumValue - yAxes.actualMinimumValue) / 2
            );
        if (yAxes.interval <= 0) {
          yAxes.interval = 0.2;
        }
      });
    }
  }

  public syncZooms(sender: any) {
    const zoomWindow = this.zoomSlider.windowRect;
    const datanChart = sender as IgxDataChartComponent;
    let chartWindow: any;
    if (sender === this.zoomSlider) {
      chartWindow = this.infrgChart.windowRect;
    } else {
      chartWindow = datanChart.windowRect;
    }

    if (sender === this.zoomSlider) {
      const newZoom = {
        left: zoomWindow.left,
        width: zoomWindow.width,
        top: chartWindow.top,
        height: chartWindow.height,
      };
      // console.log("Slider - Zoom Left, Zoom Width " + newZoom.left + ", " + newZoom.width);
      this.infrgChart.windowRect = newZoom;
      this.isZoomed = newZoom.left !== 0 || newZoom.width < 0.9999;
    } else {
      const newZoom = {
        left: chartWindow.left,
        width: chartWindow.width,
        top: chartWindow.top,
        height: chartWindow.height,
      };
      // console.log("Chart - Zoom Left, Zoom Width " + newZoom.left + ", " + newZoom.width);
      this.zoomSlider.windowRect = newZoom;
      this.isZoomed = newZoom.left !== 0 || newZoom.width < 0.9999;
    }
  }

  public onLegendChange(indexSeries: number, seriesLabel: string): void {
    if (seriesLabel !== undefined && seriesLabel !== null) {
      const igxSeries = this.infrgChart.series.item(indexSeries);
      igxSeries.title = seriesLabel;

      const chartSeries = this.chartOptions.dataSeries[indexSeries];
      if (chartSeries !== null) {
        chartSeries.label = seriesLabel;
        const updateSeries = this.chartOptions.selectSeries.find(
          (l) => l.label === seriesLabel
        );
        chartSeries.deviceId = updateSeries.deviceId;
        chartSeries.pointIndex = updateSeries.pointIndex;
      }
      this.UnSubscribePointSubscriptions();
      this.deviceIdIndexValue = [];
      this.infragistics_data.forEach((dataElement) => {
        this.setMinMaxValue(seriesLabel, dataElement, NaN);
      });
      this.getSeriesHistorianDataForCharts();
    }
  }

  onMinMaxClear(index) {
    this.chartOptions.yAxes[index].Min = null;
    this.chartOptions.yAxes[index].Max = null;
  }

  setSeriesBrush(): void {
    let xAxisSetting: XAxisSetting[] = [];
    this.arrSeriesMappings.forEach((series, index) => {
      series.brush = series.updateBrush;
      this.infrgChart.series.item(index).brush = series.checked
        ? series.brush
        : this.transperantBrush;
      this.igxSeriesBrushMap.set(index, series.brush);

      xAxisSetting.push({
        index: index,
        brush: series.brush
      });
    });

    // Set Min/Max
    let yAxesSetting = [];
    this.chartOptions.yAxes.forEach((yAxis, seriesIndex) => {
      if (yAxis.Min !== undefined && yAxis.Max !== undefined) {
        const igxYAxis = this.igxYAxisMap.get(yAxis.unit);
        igxYAxis.minimumValue = yAxis.Min ?? NaN;
        igxYAxis.maximumValue = yAxis.Max ?? NaN;
        yAxesSetting.push(yAxis);
      }
    });

    let chartSettings: ChartSettings = { xAxes: xAxisSetting, yAxes: yAxesSetting };
    if (this.chartId) {
      window.localStorage.setItem(this.chartId, JSON.stringify(chartSettings));
      this.showResetBtn = true;
    }
    this.chartSettingsPopUp.close();
  }

  cancelSeriesBrush(): void {
    this.arrSeriesMappings.forEach((series, index) => {
      series.updateBrush = series.brush;
    });
  }

  clearChartSettings(): void {
    window.localStorage.removeItem(this.chartId);
    this.showResetBtn = false;

    // clear min/max
    this.chartOptions.yAxes.forEach(yAxis => {
      yAxis.Min = NaN;
      yAxis.Max = NaN;

      const igxYAxis = this.igxYAxisMap.get(yAxis.unit);
      igxYAxis.minimumValue = NaN;
      igxYAxis.maximumValue = NaN;
    });

    // reset default chart colors
    this.chartOptions.dataSeries.forEach((series, index) => {
      this.infrgChart.series.item(index).brush = series.brush;
      this.arrSeriesMappings[index].brush = series.brush;
      this.arrSeriesMappings[index].updateBrush = series.brush;
      this.igxSeriesBrushMap.set(index, series.brush);
    });

    this.resetChartPopUp.close();
    this.chartSettingsPopUp.close();
  }

  setLegendsForYAxis(): void {
    this.seriesLegendMap.clear();
    this.chartOptions.yAxes.forEach((yAxis, index) => {
      const arrLegends = this.arrSeriesMappings.filter(
        (l) => l.unit === yAxis.unit
      );
      this.seriesLegendMap.set(index, arrLegends);
    });
  }

  public IsMobile(): boolean {
    return window.outerWidth < 768;
  }

  private setUpYAxisOnWidth(igxNumYAxis: IgxNumericYAxisComponent): void {
    if (this.IsMobile() && window.orientation === 0) {
      igxNumYAxis.labelAngle = 270;
      igxNumYAxis.labelTopMargin = 20;
      switch (igxNumYAxis.labelLocation) {
        case AxisLabelsLocation.OutsideLeft:
          igxNumYAxis.titleRightMargin = -30;
          break;

        case AxisLabelsLocation.OutsideRight:
          igxNumYAxis.titleLeftMargin = -25;
          break;
      }
    } else {
      igxNumYAxis.labelAngle = null;
      igxNumYAxis.interval = null;
      igxNumYAxis.labelTopMargin = null;
      igxNumYAxis.titleRightMargin = null;
      igxNumYAxis.titleLeftMargin = null;
      igxNumYAxis.titleBottomMargin = null;
    }
  }

  private setUpChartAxesOnWidth(labelInterval: IgxTimeAxisIntervalComponent): void {
    if (labelInterval) {
      const bIsMobileView = this.IsMobile();
      if (bIsMobileView) {
        labelInterval.interval = 10;
      }
      else {
        let fromDateTime = this.infragistics_data.length > 0 ? this.infragistics_data[0].dateValue : this.fromDate?.getTime();
        let toDateTime = this.enableRealTime ? new Date().getTime() : this.toDate ? this.toDate?.getTime() : new Date().getTime();
        let diff = toDateTime - fromDateTime;

        let minuteDiff = Math.floor(diff / 60 / 1000);
        if (minuteDiff >= 0 && minuteDiff <= 5) {
          labelInterval.interval = 1;
        }
        else if (minuteDiff > 5 && minuteDiff <= 15) {
          labelInterval.interval = 2;
        }
        else if (minuteDiff > 15 && minuteDiff <= 60) {
          labelInterval.interval = 5;
        }
        else if (minuteDiff > 60 && minuteDiff <= 120) {
          labelInterval.interval = 10;
        }
        else if (minuteDiff > 120 && minuteDiff <= 240){
          labelInterval.interval = 30;
        }
        else {
          labelInterval.interval = 120;
        }
      }

      labelInterval.intervalType = TimeAxisIntervalType.Minutes;
      this.xAxisTime.intervals.add(labelInterval);
      this.xAxisTime.titleVisibility =
        bIsMobileView || !this.hasDataSeries
          ? Visibility.Collapsed
          : Visibility.Visible;

      // Set Up Y Axis
      this.igxYAxisMap.forEach((yAxes) => {
        this.setUpYAxisOnWidth(yAxes);
      });

      // Adjust chart height based on number of legends and window width
      this.chartHeight = this.Height;
      if (this.chartOptions.dataSeries && this.chartOptions.dataSeries.length > 4) {
        this.chartHeight = window.outerWidth > 1447 ? this.Height + 10 : this.Height + 30;
      }
      else if (this.chartOptions.dataSeries && this.chartOptions.dataSeries.length > 2) {
        if (window.outerWidth <= 1875)
          this.chartHeight = this.Height + 10;
      }
    }
  }

  private setUpUniqueYAxis(): boolean {
    let bRetVal = true;
    if (this.chartOptions.yAxes.length > 4) {
      console.error('Maximum 4 units can be assigned to the chart.');
      bRetVal = false;
      return;
    }

    const chartSettings: ChartSettings = JSON.parse(window.localStorage.getItem(this.chartId));
    this.igxYAxisMap.clear();
    this.infrgChart.axes.clear();
    this.chartOptions.yAxes.forEach((yAxis) => {
      const unitDisplayLabel = this.getUnitDisplayLabel(yAxis.label);
      yAxis.label = unitDisplayLabel ? unitDisplayLabel + ` (${yAxis.label})` : yAxis.label;
      const unitLabel = this.igxYAxisMap.get(yAxis.unit);
      if (unitLabel === undefined || unitLabel === null) {
        const yAxisSetting = chartSettings?.yAxes.find(y => y.unit === yAxis.unit);
        const igxNumYAxis = new IgxNumericYAxisComponent();
        igxNumYAxis.title = yAxis.label;
        igxNumYAxis.titleTextColor = '#333333';
        igxNumYAxis.titleTextStyle = '12px Noto Sans';
        igxNumYAxis.labelTextColor = '#333333';
        igxNumYAxis.labelTextStyle = '12px Noto Sans';
        igxNumYAxis.majorStrokeThickness = 0;
        if (yAxis.Min || yAxisSetting?.Min != null) {
          igxNumYAxis.minimumValue = yAxisSetting ? yAxisSetting.Min : yAxis.Min;
          yAxis.Min = yAxisSetting ? yAxisSetting.Min : yAxis.Min;
        }
        if (yAxis.Max || yAxisSetting?.Max != null) {
          igxNumYAxis.maximumValue = yAxisSetting ? yAxisSetting.Max : yAxis.Max;
          yAxis.Max = yAxisSetting ? yAxisSetting.Max : yAxis.Max;
        }
        switch (this.igxYAxisMap.size) {
          case 0:
            igxNumYAxis.labelLocation = AxisLabelsLocation.OutsideLeft;
            break;

          case 1:
            igxNumYAxis.labelLocation = AxisLabelsLocation.OutsideRight;
            break;

          case 2:
            igxNumYAxis.labelLocation = AxisLabelsLocation.OutsideLeft;
            break;

          case 3:
            igxNumYAxis.labelLocation = AxisLabelsLocation.OutsideRight;
            break;
        }
        this.setUpYAxisOnWidth(igxNumYAxis);
        this.igxYAxisMap.set(yAxis.unit, igxNumYAxis);
        this.infrgChart.axes.add(igxNumYAxis);
      }
    });

    const axesCount = this.infrgChart.axes.count;
    if (axesCount > 0) {
      const igxYAxis = this.infrgChart.axes.item(
        this.infrgChart.axes.count - 1
      );
      //  igxYAxis.rangeChanged.subscribe((e: IgxAxisRangeChangedEventArgs) =>
      this.onIgxYAxisRangeChanged(null)
      //  );

      const igxYAxisMajStroke =
        axesCount > 1
          ? this.infrgChart.axes.item(1)
          : this.infrgChart.axes.item(0);
      igxYAxisMajStroke.majorStrokeThickness = 1;
    }

    return bRetVal;
  }

  private getValueMemberSeries(indexSeries: number): string {
    return 'series' + (indexSeries + 1) + 'Data';
  }

  public getSeriesValue(title: string, item: any): number {
    let value = 0;
    let decimalPoint = 2;

    const lgData = this.arrSeriesMappings.find((l) => l.label === title);
    if (lgData !== undefined && lgData !== null) {
      decimalPoint = lgData.decimalPoints ?? 2;

      switch (lgData.seriesIndex) {
        case 0:
          value = item.series1Data;
          break;
        case 1:
          value = item.series2Data;
          break;
        case 2:
          value = item.series3Data;
          break;
        case 3:
          value = item.series4Data;
          break;
        case 4:
          value = item.series5Data;
          break;
        case 5:
          value = item.series6Data;
          break;
        case 6:
          value = item.series7Data;
          break;
        case 7:
          value = item.series8Data;
          break;
        case 8:
          value = item.series9Data;
          break;
        case 9:
          value = item.series10Data;
          break;
        case 10:
          value = item.series11Data;
          break;
        case 11:
          value = item.series12Data;
          break;
        case 12:
          value = item.series13Data;
          break;
        case 13:
          value = item.series14Data;
          break;
        case 14:
          value = item.series15Data;
          break;
        case 15:
          value = item.series16Data;
          break;
      }
    }

    return Number(value?.toFixed(decimalPoint));
  }

  private setMinMaxValue(label: string, dataObj: any, value: number): void {
    const series = this.arrSeriesMappings.find((l) => l.label === label);
    if (series !== undefined && series !== null) {
      switch (series.seriesIndex) {
        case 0:
          dataObj.series1Data = value;
          break;
        case 1:
          dataObj.series2Data = value;
          break;
        case 2:
          dataObj.series3Data = value;
          break;
        case 3:
          dataObj.series4Data = value;
          break;
        case 4:
          dataObj.series5Data = value;
          break;
        case 5:
          dataObj.series6Data = value;
          break;
        case 6:
          dataObj.series7Data = value;
          break;
        case 7:
          dataObj.series8Data = value;
          break;
        case 8:
          dataObj.series9Data = value;
          break;
        case 9:
          dataObj.series10Data = value;
          break;
        case 10:
          dataObj.series11Data = value;
          break;
        case 11:
          dataObj.series12Data = value;
          break;
        case 12:
          dataObj.series13Data = value;
          break;
        case 13:
          dataObj.series14Data = value;
          break;
        case 14:
          dataObj.series15Data = value;
          break;
        case 15:
          dataObj.series16Data = value;
          break;
      }
    }
  }
  private fillMinReturnsCollection(): void {
    this.infragistics_data.forEach((dataElement) => {
      this.setMinMaxValue('Min', dataElement, this._minReturns);
    });
  }

  private fillMaxReturnsCollection(): void {
    this.infragistics_data.forEach((dataElement) => {
      this.setMinMaxValue('Max', dataElement, this._maxReturns);
    });
  }

  private setUpChartSeries(): void {
    if (this.chartOptions.dataSeries && this.chartOptions.dataSeries.length > 0) {
      this.arrSeriesMappings = [];
      if (this.setUpUniqueYAxis()) {
        const chartSettings: ChartSettings = JSON.parse(window.localStorage.getItem(this.chartId));
        const isTransitionEnabled = this.chartOptions.selectSeries === undefined ? true : false;
        this.igxSeriesBrushMap.clear();
        this.chartOptions.dataSeries.forEach((inputSeries, index) => {
          const igxSeries = new IgxLineSeriesComponent();
          igxSeries.title = inputSeries.label;
          igxSeries.brush = chartSettings && chartSettings.xAxes[index] ? chartSettings.xAxes[index].brush : inputSeries.brush;
          igxSeries.thickness = 2;
          igxSeries.xAxis = this.xAxisTime;
          igxSeries.yAxis = this.igxYAxisMap.get(inputSeries.unit);
          igxSeries.outline = '#f23030';
          igxSeries.trendLinePeriod = 50;
          igxSeries.isTransitionInEnabled = isTransitionEnabled;
          igxSeries.valueMemberPath = this.getValueMemberSeries(index);
          igxSeries.showDefaultTooltip = false;
          igxSeries.tooltipTemplate = this.toolTipTemplate;
          this.infrgChart.series.add(igxSeries);
          this.igxSeriesBrushMap.set(index, igxSeries.brush);
          this.seriesYAxesMap.set(index, inputSeries.unit);
          this.arrSeriesMappings.push({
            seriesIndex: index,
            label: inputSeries.label,
            unit: inputSeries.unit,
            decimalPoints: inputSeries.decimalPoints,
            brush: chartSettings && chartSettings.xAxes[index] ? chartSettings.xAxes[index].brush : inputSeries.brush,
            updateBrush: chartSettings && chartSettings.xAxes[index] ? chartSettings.xAxes[index].brush : inputSeries.brush,
            checked: true,
            isFixed: inputSeries.isFixed ?? true,
          });
        });
      }
      this.setLegendsForYAxis();
      this.getSeriesHistorianDataForCharts();
    }
  }

  getUnitDisplayLabel(unitSymbol) {
    if (this.unitSystemSelections && this.unitSystemSelections.size > 0) {
      if (this.unitSystemSelections.has(unitSymbol)) {
        return this.unitSystemSelections.get(unitSymbol);
      }
      else{
        for(let i = 0; i < this.UnitQuantities.length ; i++){
          if(this.UnitQuantities[i].SupportedUnitSymbols.find(x=>x.Value === unitSymbol)){
            
            return this.UnitQuantities[i].UnitQuantityDisplayLabel;
          }
        }
      }
    }
  }

  UnSubscribePointSubscriptions(): void {
    if (this.dataSubscriptions !== null) {
      this.dataSubscriptions.forEach((sb) => {
        if (sb !== null) {
          sb.unsubscribe();
        }
      });

      this.dataSubscriptions = [];
    }
  }

  cancelChartSettings(): void {
    this.cancelSeriesBrush();
  }

  snapshotChart() {
    html2canvas(this.toolChart.nativeElement).then((canvas) => {
      let capturedImage = canvas.toDataURL();
      const date = this.datePipe.transform(new Date(), "yyyyMMddHHmmss");
      saveAs(capturedImage, `snapshot_${date}.png`);
    });
  }

  ngOnDestroy(): void {
    this.UnSubscribePointSubscriptions();

    // Unsubscribe range changed event here
    this.igxYAxisMap.forEach((yAxes) => {
      yAxes.rangeChanged.unsubscribe();
    });
  }

  ngOnChanges(): void {
    if (this.MinReturns !== undefined && this.MaxReturns !== undefined) {
      let bUpdateChart = false;
      if (this._minReturns !== this.MinReturns) {
        this._minReturns = this.MinReturns ?? 0;
        this.fillMinReturnsCollection();
        bUpdateChart = true;
      }
      if (this._maxReturns !== this.MaxReturns) {
        this._maxReturns = this.MaxReturns ?? 0;
        this.fillMaxReturnsCollection();
        bUpdateChart = true;
      }

      if (bUpdateChart) {
        this.infrgChart.dataSource = this.infragistics_data;
      }
    }
  }

  ngAfterViewInit(): void {
    this.isMobileView = this.IsMobile();
    if (this.infrgChart !== undefined) {
      this.infrgChart.actualWindowRectChanged.subscribe(
        (e: IgxRectChangedEventArgs) =>
          this.onActualWindowRectChanged(this.infrgChart, e)
      );
    }

    if (this.zoomSlider !== undefined) {
      this.zoomSlider.higherThumbWidth = 20;
      // register Zoom slider rect changed event
      this.zoomSlider.windowRectChanged.subscribe(
        (e: IgxRectChangedEventArgs) =>
          this.onZoomSliderWindowChanged(this.zoomSlider, e)
      );
    }

    if (this.xAxisTime !== undefined) {
      const labelFormat = new IgxTimeAxisLabelFormatComponent();
      labelFormat.format = 'HH:mm';
      labelFormat.range = 1000;
      this.xAxisTime.labelFormats.add(labelFormat);
      this.xAxisTime.labelAngle = this.IsMobile() ? 300 : null;
      const labelInterval = new IgxTimeAxisIntervalComponent();
      this.setUpChartAxesOnWidth(labelInterval);
    }
  }

  ngOnInit(): void {
    let subscription = this.unitSystemModel$.subscribe((state: IUnitSystemState) => {
      if (state) {
        if (state.isLoaded === false) {
          this.store.dispatch(UNITSYSTEM_ACTIONS.UNITSYSTEM_LOAD());
        } else {
          this.unitSystemSelections.clear();
          this.UnitQuantities =_.cloneDeep( state.unitSystem.UnitQuantities);
          state.unitSystem.UnitQuantities.forEach((element) => {
            this.unitSystemSelections.set(
              element.SelectedDisplayUnitSymbol,
              element.UnitQuantityDisplayLabel
            );
          });

          this.setupChartOption();
        }
      }
    });
    this.dataSubscriptions.push(subscription);
    /*  if (this.timeRange && !this.enableRealTime) {
       this.setupChartOption();
     } */
  }

  private setupChartOption() {
    this.ChartOptionshelp = 'Chart Settings';
    this.hasDataSeries =
      this.chartOptions.dataSeries && this.chartOptions.dataSeries.length > 0
        ? true
        : false;
    if (!this.hasDataSeries) {
      this.zoomSlider.hide();
    }
    // Show/Hide Reset Chart Settings btn
    if (this.chartId) {
      this.showResetBtn = window.localStorage.getItem(this.chartId) != null ? true : false;
    }

    // Default 1 hr historian time range for real time trend
    this.toDate = new Date();
    this.fromDate = new Date();
    if (this.timeRange && !this.enableRealTime) {
      this.fromDate = this.timeRange.fromDate;
      this.toDate = this.timeRange.toDate;
      this.getSeriesHistorianDataForCharts();
    } else {
      if (this.chartOptions.chartStartTime) {
        this.fromDate = new Date(this.chartOptions.chartStartTime)
      }
      else {
        this.fromDate.setTime(this.toDate.getTime() - 60 * 120 * 1000);
      }
    }
    // trigger historian time range data loading
    const subscription = this.gatewayChartService.historianTimeRangeUpdatedEvent.subscribe(
      (timeRange: HistorianTimeRange) => {
        if (timeRange && !this.enableRealTime) {
          this.fromDate = timeRange.fromDate;
          this.toDate = timeRange.toDate;
          this.getSeriesHistorianDataForCharts();
          const labelInterval = this.xAxisTime.intervals.item(0);
          this.setUpChartAxesOnWidth(labelInterval);
        }
      }
    );
    this.dataSubscriptions.push(subscription);
    this.setUpChartSeries();
    this.chartHeight = this.Height;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event?): void {
    this.isMobileView = this.IsMobile();
    const labelInterval = this.xAxisTime.intervals.item(0);
    this.setUpChartAxesOnWidth(labelInterval);
  }

  @HostListener('window:orientationchange', ['$event'])
  onOrientationChange(event) {
    this.isMobileView = this.IsMobile();
    this.onIgxYAxisRangeChanged(null);
    this.xAxisTime.labelAngle =
      this.IsMobile() && window.orientation === 0 ? 300 : null;
  }

  showEditDataPointDialog() {
    let currentChart = { id: this.id, chartOptions: this.chartOptions, chartId: this.chartId, customDataLoggerDataPoints: this.selectedChartDataPoints };//this.gatewayChartService.getNewPointTrendChart(chartLength);
    this.isEditChartEmitEvent.emit(currentChart);
  }

  deleteChart() {
    let currentChart = { id: this.id, chartId: this.chartId };
    this.isDeleteChartEmitEvent.emit(currentChart)
  }
}

export class MapData {
  public label: string;
  public dateValue: Date;

  series1Data: number[];
  series2Data: number[];
  series3Data: number[];
  series4Data: number[];
  series5Data: number[];
  series6Data: number[];
  series7Data: number[];
  series8Data: number[];
  series9Data: number[];
  series10Data: number[];
  series11Data: number[];
  series12Data: number[];
  series13Data: number[];
  series14Data: number[];
  series15Data: number[];
  series16Data: number[];
}
