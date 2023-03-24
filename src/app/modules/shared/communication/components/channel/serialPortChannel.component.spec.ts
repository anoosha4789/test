import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { ValidationService } from '@core/services/validation.service';
import { provideMockStore } from '@ngrx/store/testing';

import { SerialPortChannelComponent } from './serialPortChannel.component';

fdescribe('ChannelComponent', () => {
  let component: SerialPortChannelComponent;
  let fixture: ComponentFixture<SerialPortChannelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SerialPortChannelComponent ],
      imports:[FormsModule,ReactiveFormsModule,RouterTestingModule,MatDialogModule],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      providers:[provideMockStore({}),ValidationService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SerialPortChannelComponent);
    component = fixture.componentInstance;
    component.channel ={
      "Id": -1,
      "IdCommConfig": -1,
      "Description": "COM1",
      "ComPort": 1,
      "BaudRate": 19200,
      "DataBits": 0,
      "StopBits": 0,
      "Parity": 0,
      "PortNamePath": "COM1",
      "SupportSoftwareFlowControl": false,
      "FlowControlTimeIntervalInMs": 0,
      "channelType": 0,
      "TimeoutInMs": 2000,
      "Retries": 3,
      "PollRateInMs": 1000,
      "Protocol": 1,
      "SinglePollRateMode": false,
      "Purpose": 1
  };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
