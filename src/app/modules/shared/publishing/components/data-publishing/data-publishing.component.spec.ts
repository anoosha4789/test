import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { ValidationService } from '@core/services/validation.service';
import { provideMockStore } from '@ngrx/store/testing';

import { DataPublishingComponent } from './data-publishing.component';

fdescribe('DataPublishingComponent', () => {
  let component: DataPublishingComponent;
  let fixture: ComponentFixture<DataPublishingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataPublishingComponent ],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      imports:[FormsModule,ReactiveFormsModule,RouterTestingModule,HttpClientTestingModule,MatDialogModule,MatSelectModule,BrowserAnimationsModule],
      providers:[provideMockStore({}),ValidationService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataPublishingComponent);
    component = fixture.componentInstance;
    component.dataPublishingForm = new FormGroup(
      {
        Channel: new FormGroup({}),
        ModbusConfiguration:  new FormGroup({}),
      });
   // component.dataPublishingForm.("Channel",new FormControl(''));
    component.publishing = {
      "Id": -1,
      "Name": "",
      "Channel": {
         // "Id": -1,
          "IdCommConfig": -1,
          "Description": "COM2",
         // "ComPort": 2,
          //"BaudRate": 19200,
          //"DataBits": 8,
          //"StopBits": 1,
          //"Parity": 0,
         // "PortNamePath": "COM2",
          //"SupportSoftwareFlowControl": false,
          //"FlowControlTimeIntervalInMs": 0,
          "channelType": 0,
          "TimeoutInMs": 2000,
          "Retries": 3,
          "PollRateInMs": 1000,
          "Protocol": 1,
          "SinglePollRateMode": false,
          "Purpose": 2
      },
      "SlaveId": 1,
      "Serial": null,
      "Tcp": null,
      "ModbusDeviceMap": [],
      "UnitSystem": "English",
      "IsForModbusMaster": false,
      "Endianness": 2,
      "WordOrder": "MSW-LSW",
      "ByteOrder": "MSB-LSB",
      "IsBytesSwapped": 0,
      "RegisteredModbusMapId": 1,
      "ModbusConfigurationId": -1,
      "ConnectionTo": "SCADA",
      "MapType": "SureSENS Default",
      "IsValid": true,
      "IsDirty": true,
      "Error": null
  };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
