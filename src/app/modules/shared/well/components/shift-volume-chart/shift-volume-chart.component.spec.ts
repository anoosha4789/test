import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IgxDataChartCoreModule } from 'igniteui-angular-charts';

import { ShiftVolumeChartComponent } from './shift-volume-chart.component';

fdescribe('ShiftVolumeChartComponent', () => {
  let component: ShiftVolumeChartComponent;
  let fixture: ComponentFixture<ShiftVolumeChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShiftVolumeChartComponent ],
      schemas :[CUSTOM_ELEMENTS_SCHEMA],
      imports:[IgxDataChartCoreModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShiftVolumeChartComponent);
    component = fixture.componentInstance;
    component.gaugeDetails ={
      "SerialNumber": "SN1234567",
      "ToolType": "eHCM-P",
      "ToolSize": "3 1/2",
      "FullStrokeLengthInInch": 16.0,
      "DefaultFullShiftVolumeInML": 388.476812,
      "ShiftVolumeInMLAndOpenPercentages": [
        [ 0, 0 ],
        [ 270.918492, 0 ],
        [ 271.199732, 0.018291858 ],
        [ 271.480972, 0.050946689 ],
        [ 271.762212, 0.091974553 ],
        [ 272.043452, 0.139056764 ],
        [ 272.324692, 0.190647532 ],
        [ 272.605932, 0.24571633 ],
      ],
      "SelectableOpenPercentages": 
      [ 0.0, 1.0, 2.0, 5.0, 10.0, 20.0, 30.0, 40.0, 50.0, 60.0, 80.0, 100.0 ]
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
