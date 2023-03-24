import { Component, OnInit, Input, ViewChild } from '@angular/core';

import { IgxLegendComponent } from "igniteui-angular-charts";

@Component({
  selector: 'app-shift-volume-chart',
  templateUrl: './shift-volume-chart.component.html',
  styleUrls: ['./shift-volume-chart.component.scss']
})
export class ShiftVolumeChartComponent implements OnInit {

  @ViewChild("legend")
  public legend: IgxLegendComponent;

  @Input()
  gaugeDetails: any;

  chartTitle: string;
  data: any;

  public chartType: string = "line";  

  constructor() {
    
    
  }

  formatData(data) {
    let res = [];
    data.forEach((item) => {
      let obj = {
        ShiftVolume: item[0],
        OpenPercent: item[1],
      };
      res.push(obj);
    });
    return res;
  }

  ngOnInit(): void {
    
    this.chartTitle = `${this.gaugeDetails.ToolSize}”${this.gaugeDetails.ToolType} Open % vs Shift Volume (mL)`;
    this.data = this.formatData(this.gaugeDetails.ShiftVolumeInMLAndOpenPercentages);
  }

}
