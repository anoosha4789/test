import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { GatewayChartService } from '../gatewayChart.service';
import { IgxCategoryChartComponent, IgxZoomSliderComponent } from 'igniteui-angular-charts';
import { timer as observableTimer, Observable, Subscription } from 'rxjs';
import { IgxRectChangedEventArgs, IgRect } from 'igniteui-angular-core';
import { DatePipe } from '@angular/common';
import { DeviceIdIndexValue } from '@core/models/webModels/PointTemplate.model';
import { RealTimeDataSignalRService } from '@core/services/realTimeDataSignalR.service';

@Component({
  selector: 'gateway-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit {
  @ViewChild("infrgChart", { static: true })
  public infrgChart: IgxCategoryChartComponent;

  @ViewChild("zoomSlider", { static: true })
  public zoomSlider: IgxZoomSliderComponent = null;

  @Input("series") series: any;

  chartType = "line";

  private igxSeriesMap = new Map<number, any>();
  private seriesData: any[] = [];
  infragistics_data = [];

  private series1Data: any[] = [];
  private series2Data: any[] = [];
  private series3Data: any[] = [];
  private series4Data: any[] = [];
  private series5Data: any[] = [];
  private series6Data: any[] = [];
  private series7Data: any[] = [];
  private series8Data: any[] = [];

  public timerforRealTimeAcquasition: number;
  private timer: Observable<number>;
  private interval: number;
  private dataSubscriptions: Subscription[] = [];
  private subscription: Subscription;

  private deviceIdIndexValue: DeviceIdIndexValue[] = [];
  private realTimeDate: Date;

  public lastRect: IgRect = { left: -1, top: -1, width: -1, height: -1};

  constructor(private gatewayService: GatewayChartService, private realTimeService: RealTimeDataSignalRService, private datePipe: DatePipe) {
    this.interval = this.gatewayService.RequestInterval;
    this.timer = observableTimer(0, this.interval);
   }

   private getSeriesPointValue(value: number, seriesLabel: string): number {
    let retVal = value;
    if (value === null) {
      retVal = this.infragistics_data.length > 1 ? this.infragistics_data[this.infragistics_data.length - 1][seriesLabel] : null;
    }
    
    return retVal;
  }

  getChartDataForHour(): void {
    let toDate = new Date;
    let fromDate = new Date();
    fromDate.setHours(fromDate.getHours() - 1);

    let inputDataPoints = [];
    this.series.forEach(element => {
      inputDataPoints.push({deviceId: element.deviceId, pointIndex: element.pointIndex})
    });
    let chartDataModel:any = {
      dataPoints: inputDataPoints,
      fromDate: this.datePipe.transform(fromDate, 'yyyy-MM-ddTHH:mm:ss'),
      toDate: this.datePipe.transform(toDate, 'yyyy-MM-ddTHH:mm:ss')
    };

    this.gatewayService.getMultipleChartDataForTimeRange(chartDataModel)
      .subscribe(data => {
            if (data.length > 0) {

              this.seriesData = data;
              
            }
        }
    );
  }

  updateChartData(bUpdateRealtime: boolean): void {
    this.subscription = this.timer.subscribe(() => {
                                                      


      if (this.seriesData.length > 0) {

        this.infragistics_data = [];

        this.seriesData.forEach(element => {
          let dtDate = new Date(element.Key);

          let objData: any = {};
          objData.label = this.addZero(dtDate.getHours()) + ":" + this.addZero(dtDate.getMinutes()) + ":" + this.addZero(dtDate.getSeconds());
          objData.dateValue = dtDate.getTime();
          element.Value.forEach((dataValue, index) => {
            objData[this.series[index].label] = this.getSeriesPointValue(dataValue, this.series[index].label);
          });
          this.infragistics_data.push(objData);
        });

        this.subScribeToRealTimeData();
        this.subscription.unsubscribe();
      }});
  }

  addZero(i: number) {
    if (i < 10) {
        return ("0" + i.toString()).toString();
    }
    return i.toString();
  }
  formatSecsAsMins(timestamp: number) {
    let date = new Date(((timestamp - 25569) * 86400000));
    let tz = date.getTimezoneOffset();
    let newdate = new Date(((timestamp - 25569 + (tz / (60 * 24))) * 86400000));
    return new Date(newdate.getTime());

  }
  formatedFirstTimeData(a: number[], decimalplace: number): number[] {
    let b: number[] = [];
    if (a != null) {
        for (let i = 0; i < a.length; i++) {
            b.push(Number(a[i].toFixed(decimalplace)))
        }
    }
    return b;
  }

  subScribeToRealTimeData() {
    let deviceSubs = null;
    let timeSub = null;

    this.series.forEach(inputSeries => {
      this.deviceIdIndexValue.push(new DeviceIdIndexValue(inputSeries.deviceId, inputSeries.pointIndex, -999, ''));
    });
    
    if (this.deviceIdIndexValue != undefined && this.deviceIdIndexValue != null) {
      this.deviceIdIndexValue.forEach(e => {
        deviceSubs = this.realTimeService.GetRealtimeData(e.deviceId, e.pointIndex).subscribe(d => {

          if (d != undefined && d != null)
            e.match(d);
        });
        this.dataSubscriptions.push(deviceSubs);
      });

      timeSub = this.realTimeService.GetUpdateDateValue().subscribe(dt => {
          this.realTimeDate = dt;
          // get the time difference to splice data if required
          let minDateTime = this.infragistics_data[0].dateValue;
          let timeDiff = (this.realTimeDate?.getTime() - minDateTime)/1000;
          if (timeDiff > 3600) {
            let oldVal = this.infragistics_data.splice(0,1);
            this.infrgChart.notifyRemoveItem(this.infragistics_data, 0, oldVal);
          }
          // set new time here
          let newVal = {
            label: this.addZero(this.realTimeDate.getHours()) + ":" + this.addZero(this.realTimeDate.getMinutes()) + ":" + this.addZero(this.realTimeDate.getSeconds()),
            dateValue: this.realTimeDate.getTime()
          };
          for(let index = 0; index < this.deviceIdIndexValue.length; index++) {
            newVal[this.series[index].label] = Number(this.deviceIdIndexValue[index].value.toFixed(3));
          }
          
          this.infragistics_data.push(newVal);
          this.infrgChart.notifyInsertItem(this.infragistics_data, this.infragistics_data.length - 1, newVal);
        }
      );
      this.dataSubscriptions.push(timeSub);
    }
  }

  UnSubscribePointSubscriptions(): void {
    if (this.dataSubscriptions != null) {
        this.dataSubscriptions.forEach(sb=>{
            if (sb != null)
                sb.unsubscribe();
        });

        this.dataSubscriptions = [];
    }
  }

  ngOnDestroy(): void {
      if (this.subscription != null)
          this.subscription.unsubscribe();
      
      this.UnSubscribePointSubscriptions();
      clearInterval(this.timerforRealTimeAcquasition);
  }

  onToggle(event) {
    if (event.checked === true) {
      this.getChartDataForHour();
      this.updateChartData(true);
    }
    else
      this.UnSubscribePointSubscriptions();
  }

  changeZoom(value: boolean) {
    
  }

  public onZoomSliderWindowChanged(slider: IgxZoomSliderComponent, args: IgxRectChangedEventArgs) {
    this.syncZooms(slider);
  }

  public syncZooms(sender: any) {
    const zoomWindow = this.zoomSlider.windowRect;
    const datanChart = sender as IgxCategoryChartComponent;
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
        height: chartWindow.height
      };
    // console.log("updateChartZoom " + this.getRect(newZoom));
    this.infrgChart.windowRect = newZoom;
    }
  }

  ngAfterViewInit(): void {
    if (this.zoomSlider !== undefined) {
      // register Zoom slider rect changed event
      this.zoomSlider.windowRectChanged.subscribe((e: IgxRectChangedEventArgs) =>
          this.onZoomSliderWindowChanged(this.zoomSlider, e)
      );
    }
  }

  ngOnChanges(): void {
    this.infrgChart.excludedProperties = ["dateValue"];
    if (this.series != null) {
      //this.infrgChart.xAxisTitle = this.series.
      this.getChartDataForHour();
      this.updateChartData(false);
    }
  }

  ngOnInit(): void {
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
}
