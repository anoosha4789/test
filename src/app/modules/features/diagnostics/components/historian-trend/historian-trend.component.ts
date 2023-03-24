import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HistorianTimeRange } from '@core/models/webModels/DeviceInfo.model';
import { GatewayChartService } from '@shared/gateway-chart/gatewayChart.service';
import { GatewayModalService } from '@shared/gateway-dialogs/services/gatewayModal.service';
import { ButtonActions } from '@shared/gateway-dialogs/components/gateway-advanced-dialog/gateway-advanced-dialog.component';
import { HistorianData, HistorianDatapointsDialogComponent } from './historian-datapoints-dialog/historian-datapoints-dialog.component';
import { HistorianEditDateDialogComponent } from './historian-edit-date-dialog/historian-edit-date-dialog.component';

@Component({
  selector: 'app-historian-trend',
  templateUrl: './historian-trend.component.html',
  styleUrls: ['./historian-trend.component.scss'],
})
export class HistorianTrendComponent implements OnInit {
  // Title: string;
  public chartId: string = "historian";
  private datePipe = new DatePipe('en-US');
  showChart: boolean = false;
  historianData: HistorianData;
  fromTime: string = "";
  toTime: string = "";
  timeRange: HistorianTimeRange;

  constructor(
    protected gatewayChartService: GatewayChartService,
    protected gatewayModalService: GatewayModalService,
  ) {
  }

  ngOnInit(): void {
    this.initHistorianData();
    if (this.historianData) {
      this.showChart = true;
    } 
  }
  updateTitle(): void {
    if (this.historianData) {
      this.fromTime = this.datePipe.transform(this.historianData.fromDate, HistorianDatapointsDialogComponent.HISTORIAN_DATE_FORMAT);
      this.toTime = this.datePipe.transform(this.historianData.toDate, HistorianDatapointsDialogComponent.HISTORIAN_DATE_FORMAT);
    }
  }

  updateTimeRange() {
    if (this.historianData) {
      let timeRange = new HistorianTimeRange();
      timeRange.fromDate = this.historianData.fromDate;
      timeRange.toDate = this.historianData.toDate;
      this.gatewayChartService.UpdateHistorianTimeRange(timeRange);
      this.timeRange = timeRange;
    }
  }

  initHistorianData() {
    this.historianData = this.gatewayChartService.getHistorianTrendData();
    this.updateTimeRange();
    this.updateTitle();
  }

  showAddDataPointDialog() {
    this.showChart = false;
    const data: HistorianData = this.gatewayChartService.getNewHistorianTrendData();
    this.gatewayModalService.openAdvancedDialog(
      "Configure Historian Trend Data Points",
      ButtonActions.None,
      HistorianDatapointsDialogComponent,
      data,
      (result) => {
        if (result) {
          this.gatewayChartService.saveHistorianTrendData(result);
          this.initHistorianData();
          this.showChart = true;
        }
      },
      null,
      null,
      null,
      null
    );
  }
  HistorianEditChartEventReceiver(event) {
    const data: HistorianData = this.gatewayChartService.getHistorianTrendData();
    this.gatewayModalService.openAdvancedDialog(
      "Configure Historian Trend Data Points",
      ButtonActions.None,
      HistorianDatapointsDialogComponent,
      data,
      (result) => {
        if (result) {
          this.showChart = false;
          this.gatewayChartService.saveHistorianTrendData(result);
          this.initHistorianData();
          setTimeout(() => {
            this.showChart = true;
          }, 200);
        }
      },
      null,
      null,
      null,
      null
    );
  }
  onDateRangeClicked() {
    this.gatewayModalService.openAdvancedDialog(
      "Configure Date and Time Range",
      ButtonActions.None,
      HistorianEditDateDialogComponent,
      this.historianData,
      (result) => {
        if (result) {
          this.gatewayChartService.saveHistorianTrendData(result);
          this.initHistorianData();
        }
      },
      "425px",
      null,
      null,
      null
    );
  }
}
