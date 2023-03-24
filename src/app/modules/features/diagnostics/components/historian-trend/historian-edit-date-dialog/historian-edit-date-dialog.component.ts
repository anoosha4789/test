import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GatewayChartService } from '@shared/gateway-chart/gatewayChart.service';
import { HistorianData, HistorianDatapointsDialogComponent } from '../historian-datapoints-dialog/historian-datapoints-dialog.component';

@Component({
  selector: 'app-historian-edit-date-dialog',
  templateUrl: './historian-edit-date-dialog.component.html',
  styleUrls: ['./historian-edit-date-dialog.component.scss']
})
export class HistorianEditDateDialogComponent implements OnInit {
  errorMessage: string = "";
  isValid = true;
  currentChart: HistorianData;
  fromDate: Date;
  toDate: Date;
  toMinTime: Date;
  toMaxTime: Date;
  fromTime: Date;
  toTime: Date;
  public date: Date = new Date();
  private chartStartTime: number;
  private chartToTime: number;

  constructor(public dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public data: HistorianData,
    protected gatewayChartService: GatewayChartService,) { }

  validate() {
    if (this.chartStartTime < this.chartToTime) {
      if ((this.chartToTime - this.chartStartTime) > HistorianDatapointsDialogComponent.ONEDAY_MILLISECONDS) {
        this.isValid = false;
        this.errorMessage = HistorianDatapointsDialogComponent.ERR_HISTORIAN_DATE_LIMIT;
      } else {
        this.isValid = true;
        this.errorMessage = "";
      }
    } else {
      if ((this.chartToTime - this.chartStartTime) > HistorianDatapointsDialogComponent.ONEDAY_MILLISECONDS) {
        this.isValid = false;
        this.errorMessage = HistorianDatapointsDialogComponent.ERR_HISTORIAN_DATE_LIMIT;
      } else {
        this.isValid = false;
        this.errorMessage = HistorianDatapointsDialogComponent.ERR_HISTORIAN_DATE_COMPARISON;
      }
    }
  }

  setMaxDate() {
    let date = this.currentChart.fromDate.getTime() + HistorianDatapointsDialogComponent.ONEDAY_MILLISECONDS;
    this.toMaxTime = new Date(date);
  }

  setMinMaxDate() {
    this.toMinTime = this.currentChart.fromDate;
    this.setMaxDate();
  }
  onFromTimeSelected(event) {
    this.currentChart.fromDate = new Date(event);
    this.setMinMaxDate();
    this.chartStartTime = new Date(event).getTime();
    this.validate();
  }

  onToTimeSelected(event) {
    this.errorMessage = "";
    this.currentChart.toDate = new Date(event);
    this.chartToTime = new Date(event).getTime();
    this.validate();
  }

  onTimeValidationFailed(event) {
    event?.timePicker?.close();
    this.validate();
  }
  OnCancel() {
    this.dialogRef.close();
  }

  OnSubmit() {
    this.dialogRef.close(this.currentChart);
  }
  ngOnInit(): void {
    this.currentChart = this.data;

    this.chartStartTime = new Date(this.currentChart.fromDate).getTime();
    this.chartToTime = new Date(this.currentChart.toDate).getTime();
    this.fromDate = this.currentChart.fromDate;
    this.toDate = this.currentChart.toDate;
    this.date = this.currentChart.Day;
    this.setMinMaxDate();
    this.validate();
  }

}
