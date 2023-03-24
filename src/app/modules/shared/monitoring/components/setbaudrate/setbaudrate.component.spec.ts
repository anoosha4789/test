import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { GatewayPanelConfigurationService } from '@core/services/gateway-panel-configuration.service';
import { provideMockStore } from '@ngrx/store/testing';

import { SetBaudrateComponent } from './setbaudrate.component';

fdescribe('SetBaudrateComponent', () => {
  let component: SetBaudrateComponent;
  let fixture: ComponentFixture<SetBaudrateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SetBaudrateComponent ],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      imports:[RouterTestingModule,HttpClientTestingModule,MatDialogModule],
      providers:[provideMockStore({}),GatewayPanelConfigurationService,
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {
          "device": {
              "DataPointIndex": 25,
              "DataType": 6,
              "DeviceId": 15,
              "RawValue": 19200,
              "ReadOnly": false,
              "TagName": "BaudRate",
              "UnitQuantityType": "",
              "UnitSymbol": ""
          }
      } },]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetBaudrateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
