import { DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { SatPopoverModule } from '@ncstate/sat-popover';
import { provideMockStore } from '@ngrx/store/testing';
import { GatewayChartService } from '@shared/gateway-chart/gatewayChart.service';
import { IgxDataChartCoreModule, IgxTimeXAxisModule, IgxZoomSliderModule } from 'igniteui-angular-charts';
import { ColorPickerModule } from 'ngx-color-picker';

import { MultiaxisChartComponent } from './multiaxis-chart.component';

fdescribe('MultiaxisChartComponent', () => {
  let component: MultiaxisChartComponent;
  let fixture: ComponentFixture<MultiaxisChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultiaxisChartComponent],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      imports:[FormsModule,ReactiveFormsModule,SatPopoverModule,IgxDataChartCoreModule,ColorPickerModule
      ,HttpClientTestingModule,MatDialogModule,IgxZoomSliderModule,IgxTimeXAxisModule],
      providers:[provideMockStore({}),GatewayChartService,DatePipe]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiaxisChartComponent);
    component = fixture.componentInstance;
    component.chartId ="1";
    component.chartOptions ={
      "hideCheckbox": true,
      "yAxes": [
          {
              "label": "dimensionless",
              "unit": "dimensionless",
              "Min": null,
              "Max": null
          },
          {
              "label": "Voltage (V)",
              "unit": "V",
              "Min": null,
              "Max": null
          }
      ],
      "dataSeries": [
          {
              "deviceId": 3,
              "pointIndex": 4,
              "label": "SIU 1_SIE_Voltage_12VRaw",
              "unit": "dimensionless",
              "decimalPoints": 2,
              "brush": "#2FC0CF",
              "isFixed": true
          },
          {
              "deviceId": 3,
              "pointIndex": 3,
              "label": "SIU 1_SIE_Voltage_12V (V)",
              "unit": "V",
              "decimalPoints": 2,
              "brush": "#DA127D",
              "isFixed": true
          }
      ],
      selectSeries:[]
  };

    //component.infrgChart.actualWindowRectChanged.asObservable().;
    fixture.detectChanges(false);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
