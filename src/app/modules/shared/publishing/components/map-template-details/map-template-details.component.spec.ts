import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideMockStore } from '@ngrx/store/testing';

import { MapTemplateDetailsComponent } from './map-template-details.component';

fdescribe('MapTemplateDetailsComponent', () => {
  let component: MapTemplateDetailsComponent;
  let fixture: ComponentFixture<MapTemplateDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapTemplateDetailsComponent ],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      providers:[provideMockStore({})],
      imports:[MatDialogModule,HttpClientTestingModule,MatSelectModule,BrowserAnimationsModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapTemplateDetailsComponent);
    component = fixture.componentInstance;
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
