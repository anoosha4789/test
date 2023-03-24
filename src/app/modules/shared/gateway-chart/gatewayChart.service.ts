import { catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subscription, Subject, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DataPointDefinitionModel } from '@core/models/webModels/DataPointDefinition.model';
import { HistorianTimeRange } from '@core/models/webModels/DeviceInfo.model';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { TokenStorageService } from '@core/services/tokenStorage.service';
import { ChartOptions } from './multiaxis-chart/multiaxis-chart.model';
import { CHART_DEFAULTS, UITemperatureUnits } from '@core/data/UICommon';
import { PointTrendChart } from '@features/diagnostics/components/data-point-trend/data-point-trend.component';
import { HistorianData, HistorianFileData } from '@features/diagnostics/components/historian-trend/historian-datapoints-dialog/historian-datapoints-dialog.component';

@Injectable()
export class GatewayChartService {
  private gatewayBaseUrl = environment.webHostURL + 'api/';
  // define a subject to trigger data point selection changes.
  private selectedDataPointsForTrendGraph = new BehaviorSubject<
    DataPointDefinitionModel[]
  >(null);
  // define a subject to trigger the device selection changes
  // private selectedDataPointViewerDevice = new BehaviorSubject<DeviceModel>(
  //   null
  // );
  // define a subject to trigger the time range change for data point historian loading
  private historianTimeRange = new BehaviorSubject<HistorianTimeRange>(null);

  private pointTrendCharts: PointTrendChart[] = [];
  private historianTrendData: HistorianData;
  private csvHistorianFileData: HistorianFileData = new HistorianFileData();

  private queryOneHourDataURL =
    this.gatewayBaseUrl + 'InFluxDbTimeSeriesData/QueryDataPointDataByHour/';
  private queryTimeRangeDataURL =
    this.gatewayBaseUrl +
    'InFluxDbTimeSeriesData/QueryDataPointDataByTimeRange/';
  private queryMultiplePointsDataURL =
    this.gatewayBaseUrl +
    'InFluxDbTimeSeriesData/QueryMultipleDataPointsDataByTimeRange';

  public headers = new HttpHeaders({
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
  });

  public headerDict = new HttpHeaders({
    Accept: 'application/json',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
  });
  public RequestInterval = 1000;

  constructor(
    protected http: HttpClient,
    protected tokenStorageService: TokenStorageService
  ) { }

  selectedDataPointsUpdatedEvent = this.selectedDataPointsForTrendGraph.asObservable();
  // selectedDataPointViewerDeviceChangeEvent = this.selectedDataPointViewerDevice.asObservable();
  historianTimeRangeUpdatedEvent = this.historianTimeRange.asObservable();

  UpdateSelectedDataPoints(dps: DataPointDefinitionModel[]) {
    if (dps !== null) {
      this.selectedDataPointsForTrendGraph.next(dps);
    }
  }

  getNewPointTrendChart(id: number) {
    return { id: id, chartOptions: new ChartOptions(), chartId: "datapointtrend" + id };
  }

  getPointTrendCharts() {
    this.pointTrendCharts = [];
    if (window.localStorage.getItem("pointTrendCharts")) {
      this.pointTrendCharts = JSON.parse(window.localStorage.getItem("pointTrendCharts"))
    }
    return this.pointTrendCharts;
  }

  savePointTrendChart(chart: PointTrendChart) {
    let existingChart = this.pointTrendCharts.find(c => c.id === chart.id);
    if (existingChart) {
      existingChart.chartOptions = chart.chartOptions;
      existingChart.customDataLoggerDataPoints = chart.customDataLoggerDataPoints;
    } else {
      this.pointTrendCharts.push(chart);
    }
    window.localStorage.setItem("pointTrendCharts", JSON.stringify(this.pointTrendCharts));
  }
  // UpdateSelectedDataPointViewerDevice(device: DeviceModel) {
  //   if (device !== null) {
  //     this.selectedDataPointViewerDevice.next(device);
  //   }
  // }

  UpdateHistorianTimeRange(timeRange: HistorianTimeRange) {
    if (timeRange !== null) {
      this.historianTimeRange.next(timeRange);
    }
  }

  getNewHistorianTrendData() {
    let currentDate = new Date();
    currentDate.setSeconds(0);
    let fromDate = new Date(currentDate.getTime() - 60000);
    return { Day: new Date(), fromDate: fromDate, toDate: currentDate, SelectedFile: "", SelectedFileName: "", FileExtensions: '.csv', chartOptions: new ChartOptions(), customDataLoggerDataPoints: [], isByFile: false };
  }

  getHistorianTrendData() {
    if(this.historianTrendData){
      return this.historianTrendData;
    }

    if (window.localStorage.getItem("historianTrendData")) {
      this.historianTrendData = JSON.parse(window.localStorage.getItem("historianTrendData"))
      this.historianTrendData.fromDate = new Date(this.historianTrendData.fromDate);
      this.historianTrendData.toDate = new Date(this.historianTrendData.toDate);
      return this.historianTrendData;
    }
    return null;
  }

  saveHistorianTrendData(chart: HistorianData) {
    this.historianTrendData = chart;
    if(!chart.isByFile){
       window.localStorage.setItem("historianTrendData", JSON.stringify(this.historianTrendData));
    }
  }

  // APIs
  getChartDataForOneHour(
    deviceId: number,
    pointIndex: number,
    year: number,
    month: number,
    date: number,
    hour: number
  ): Observable<any[]> {
    return this.http
      .get<number[]>(
        this.queryOneHourDataURL +
        deviceId +
        '/' +
        pointIndex +
        '/' +
        year +
        '/' +
        month +
        '/' +
        date +
        '/' +
        hour,
        { headers: this.headerDict }
      )
      .pipe(
        catchError((err) => {
          console.log(err);
          return of([]);
        })
      );
  }

  getChartDataForTimeRange(
    deviceId: number,
    pointIndex: number,
    fromDate: Date,
    toDate: Date
  ): Observable<any[]> {
    return this.http
      .get<number[]>(
        this.queryTimeRangeDataURL +
        deviceId +
        '/' +
        pointIndex +
        '/' +
        fromDate.toISOString() +
        '/' +
        toDate.toISOString(),
        { headers: this.headerDict }
      )
      .pipe(
        catchError((err) => {
          console.log(err);
          return of([]);
        })
      );
  }

  getMultipleChartDataForTimeRange(chartDataModel: any): Observable<any[]> {
    return this.http
      .post<any[]>(this.queryMultiplePointsDataURL, chartDataModel, {
        headers: this.headers,
      })
      .pipe(
        catchError((err) => {
          console.log(err);
          return of([]);
        })
      );
  }
  isValidDate(dateStr) {
    return !isNaN(new Date(dateStr).getDate());
  }

  validateChartOptions(chartOptions: ChartOptions) {
    let message = "";
    let dataSeries = chartOptions.dataSeries;
    if (dataSeries.length > CHART_DEFAULTS.MAX_DATA_POINTS_SIZE) {
      message = "The chart can only accommodate a maximum of 16 data points. Please reselect.";
    } else if (chartOptions.yAxes.length > CHART_DEFAULTS.MAX_Y_AXIS_SIZE) {
      message = "The chart can only accommodate a maximum of 4 different units. Please reselect.";
    }
    return message;
  }
  public ImportLogFile(file: any): Promise<boolean> {
    const reader = new FileReader();
    reader.readAsText(file);

    return new Promise((resolve, reject) => {
      reader.onloadend = () => {
        const csv = reader.result as string;
        let csvArray = [];
        if (!csv.includes("\r\n")) {
          resolve(false);
          return;
        }
        // Splitting into differnt rows
        let csvToRowArray = csv.split("\r\n");

        // For file Validation by checking fields
        let firstRow = csvToRowArray[0]?.split(",");
        if (firstRow && firstRow.length > 5) {
          let firstCell = new Date(firstRow[0]);
          let isValidFile = firstCell && this.isValidDate(firstCell) && firstRow[2].includes("Serial#:") && firstRow[3].includes("Customer Name:") &&
            firstRow[4].includes("Field Name:");
          if (!isValidFile) {
            resolve(false);
            return;
          }
        } else {
          resolve(false);
          return;
        }

        // Ignoring first row and splitting into different rows
        for (let index = 1; index < csvToRowArray.length - 1; index++) {
          let row = csvToRowArray[index];
          if (row.endsWith(",")) {
            row = row.slice(0, row.length - 1);
          }
          let formattedRow = row.split(",");
          // let filteredRow = formattedRow.slice(1, formattedRow.length);
          // csvArray.push(filteredRow);
          csvArray.push(formattedRow);
        }
        if (csvArray.length < 3) {
          resolve(false);
          return;
        }
        // Checking if 4th row first cell is empty
        if (csvArray.length > 2 && csvArray[2][0] === "") {
          resolve(false);
          return;
        }

        let units = csvArray[0];
        let headers = csvArray[1];
        let csvHistorianValues = csvArray.slice(2, csvArray.length);
        let csvHistorianDataPoints = [];
        headers.forEach((header, index) => {
          const dp = new DataPointDefinitionModel();
          dp.DataPointIndex = index;
          dp.DataType = 1;
          dp.DeviceId = 0;
          dp.RawValue = -999;
          dp.ReadOnly = true;
          dp.TagName = header;
          dp.UnitQuantityType = units[index] ?? "";
          dp.UnitSymbol = this.getDisplayUnit(units[index]);
          csvHistorianDataPoints.push(dp);
        });
        this.csvHistorianFileData = new HistorianFileData();
        this.csvHistorianFileData.date = firstRow[0];
        this.csvHistorianFileData.headers = headers;
        this.csvHistorianFileData.units = units;
        this.csvHistorianFileData.csvHistorianDataPoints = csvHistorianDataPoints;
        this.csvHistorianFileData.csvHistorianValues = csvHistorianValues;
        resolve(true);
      };

      reader.onerror = () => {
        console.log("Error while reading file...");
        resolve(false);
      }
    });
  }
  private getDisplayUnit(displayUnitSymbol: any): string {
    let displayUnit = displayUnitSymbol;
    if(displayUnitSymbol){

      if(displayUnitSymbol === "degF")
        displayUnit=  UITemperatureUnits.degF;

      if(displayUnitSymbol === "degC")
         displayUnit=  UITemperatureUnits.degC;
    }
    return displayUnit;
  }
  getCSVHistorianFileData() {
    return this.csvHistorianFileData;
  }
}
