import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AddDatapointsToCustomMapComponent } from './add-datapoints-to-custom-map.component';

fdescribe('AddDatapointsToCustomMapComponent', () => {
  let component: AddDatapointsToCustomMapComponent;
  let fixture: ComponentFixture<AddDatapointsToCustomMapComponent>;
let data ={
  "startAddress": 24,
  "DataPoints": [
      {
          "StartRegisterAddress": 0,
          "DeviceId": 1,
          "DataPointIndex": 10,
          "SlaveDataType": 6,
          "ConversionFormat": 2,
          "UnitSymbol": "",
          "TagName": "Year",
          "ReadWriteFlag": 3
      },
      {
          "StartRegisterAddress": 1,
          "DeviceId": 1,
          "DataPointIndex": 11,
          "SlaveDataType": 6,
          "ConversionFormat": 2,
          "UnitSymbol": "",
          "TagName": "Month",
          "ReadWriteFlag": 3
      },
      {
          "StartRegisterAddress": 2,
          "DeviceId": 1,
          "DataPointIndex": 12,
          "SlaveDataType": 6,
          "ConversionFormat": 2,
          "UnitSymbol": "",
          "TagName": "Day",
          "ReadWriteFlag": 3
      },
      {
          "StartRegisterAddress": 3,
          "DeviceId": 1,
          "DataPointIndex": 13,
          "SlaveDataType": 6,
          "ConversionFormat": 2,
          "UnitSymbol": "",
          "TagName": "Hour",
          "ReadWriteFlag": 3
      },
      {
          "StartRegisterAddress": 4,
          "DeviceId": 1,
          "DataPointIndex": 14,
          "SlaveDataType": 6,
          "ConversionFormat": 2,
          "UnitSymbol": "",
          "TagName": "Minute",
          "ReadWriteFlag": 3
      },
      {
          "StartRegisterAddress": 5,
          "DeviceId": 1,
          "DataPointIndex": 15,
          "SlaveDataType": 6,
          "ConversionFormat": 2,
          "UnitSymbol": "",
          "TagName": "Second",
          "ReadWriteFlag": 3
      },
      {
          "StartRegisterAddress": 6,
          "DeviceId": 3,
          "DataPointIndex": 9,
          "SlaveDataType": 9,
          "ConversionFormat": 2,
          "UnitSymbol": "",
          "TagName": "COM1_Card 1_HostTimestamp",
          "ReadWriteFlag": 3
      },
      {
          "StartRegisterAddress": 8,
          "DeviceId": 3,
          "DataPointIndex": 10,
          "SlaveDataType": 9,
          "ConversionFormat": 2,
          "UnitSymbol": "",
          "TagName": "COM1_Card 1_CardTimestamp",
          "ReadWriteFlag": 3
      },
      {
          "StartRegisterAddress": 10,
          "DeviceId": 3,
          "DataPointIndex": 8,
          "SlaveDataType": 9,
          "ConversionFormat": 2,
          "UnitSymbol": "V",
          "TagName": "COM1_Card 1_SupplyVoltage",
          "ReadWriteFlag": 3
      },
      {
          "StartRegisterAddress": 12,
          "DeviceId": 3,
          "DataPointIndex": 7,
          "SlaveDataType": 9,
          "ConversionFormat": 2,
          "UnitSymbol": "mA",
          "TagName": "COM1_Card 1_SupplyCurrent",
          "ReadWriteFlag": 3
      },
      {
          "StartRegisterAddress": 14,
          "DeviceId": 3,
          "DataPointIndex": 6,
          "SlaveDataType": 9,
          "ConversionFormat": 2,
          "UnitSymbol": "V",
          "TagName": "COM1_Card 1_CableVoltage",
          "ReadWriteFlag": 3
      },
      {
          "StartRegisterAddress": 16,
          "DeviceId": 3,
          "DataPointIndex": 3,
          "SlaveDataType": 9,
          "ConversionFormat": 2,
          "UnitSymbol": "mA",
          "TagName": "COM1_Card 1_TotalCableCurrent",
          "ReadWriteFlag": 3
      },
      {
          "StartRegisterAddress": 18,
          "DeviceId": 4,
          "DataPointIndex": 11,
          "SlaveDataType": 9,
          "ConversionFormat": 2,
          "UnitSymbol": "psia",
          "TagName": "COM1_Card 1_TOOL_2_Pressure",
          "ReadWriteFlag": 3
      },
      {
          "StartRegisterAddress": 20,
          "DeviceId": 4,
          "DataPointIndex": 12,
          "SlaveDataType": 9,
          "ConversionFormat": 2,
          "UnitSymbol": "degF",
          "TagName": "COM1_Card 1_TOOL_2_Temperature",
          "ReadWriteFlag": 3
      },
      {
          "StartRegisterAddress": 22,
          "DeviceId": 4,
          "DataPointIndex": 2,
          "SlaveDataType": 9,
          "ConversionFormat": 2,
          "UnitSymbol": "",
          "TagName": "COM1_Card 1_TOOL_2_Diagnostics",
          "ReadWriteFlag": 3
      }
  ],
  "registerTableType": 3,
  "noOfDataPoints": 1
};
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddDatapointsToCustomMapComponent ],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      imports:[FormsModule,ReactiveFormsModule,MatInputModule,MatSelectModule,BrowserAnimationsModule],
      providers:[{ provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: data },]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddDatapointsToCustomMapComponent);
    component = fixture.componentInstance;
    component.addDataPointForm = new FormGroup({});
    component.addDataPointForm.addControl('StartAddress', new FormControl(''))
   // component.addDataPointForm.addControl('EndAddress', new FormControl(''))
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
