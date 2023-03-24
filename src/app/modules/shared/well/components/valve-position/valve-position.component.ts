import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { IgxGridComponent, IgxColumnComponent } from '@infragistics/igniteui-angular';
import { InchargePositionUIModel } from '@core/models/UIModels/incharge.tool.model';


@Component({
  selector: 'app-valve-position',
  templateUrl: './valve-position.component.html',
  styleUrls: ['./valve-position.component.scss']
})
export class ValvePositionComponent implements OnInit {

  @Input()
  data: any[];

  @ViewChild('gridPositions', { static: true })
  public gridZones: IgxGridComponent;

  positions: any;

  constructor() { }

  initColumns(column: IgxColumnComponent) {
    // console.log(`init zone grid columns...${column}`);
  }

  formatData(data) {
    let res = [];
    data.forEach((item, idx) => {
      let obj: InchargePositionUIModel = {
        Index: idx,
        ShiftVolume: item[0],
        OpenPercent: item[1],
      };
      res.push(obj);
    });
    return res;
  }

  ngOnInit(): void {
    this.positions = this.formatData(this.data);

  }

}
