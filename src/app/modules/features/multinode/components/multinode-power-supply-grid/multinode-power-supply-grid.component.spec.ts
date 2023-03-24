import { AnimationBuilder } from '@angular/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { IgxOverlayService, IgxTooltipModule } from '@infragistics/igniteui-angular';
import { provideMockStore } from '@ngrx/store/testing';
import { IgxOverlaysModule } from 'igniteui-angular-charts';

import { MultinodePowerSupplyGridComponent } from './multinode-power-supply-grid.component';

fdescribe('MultinodePowerSupplyGridComponent', () => {
  let component: MultinodePowerSupplyGridComponent;
  let fixture: ComponentFixture<MultinodePowerSupplyGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultinodePowerSupplyGridComponent ],
      imports:[MatTooltipModule,IgxTooltipModule,RouterTestingModule,HttpClientTestingModule,BrowserAnimationsModule],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      providers:[provideMockStore({})]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultinodePowerSupplyGridComponent);
    component = fixture.componentInstance;
    component.manualPowerSupplies = 
      {
          "sie": {
              "Id": 1,
              "SIEGuid": "e72c627d-4863-4f4a-9394-ce5220ab9f96",
              "Name": "SIU 1",
              "NetworkType": "UDP",
              "IpAddress": "192.168.0.101",
              "PortNumber": 18888,
              "MacAddress": "00.06.03.20.00.00",
              "SIEWellLinks": [
                  {
                      "Id": 1,
                      "SIEId": 1,
                      "SIEName": "SIU 1",
                      "WellId": 1,
                      "WellName": "Well 1"
                  }
              ],
              "SIEDeviceId": 3,
              //"currentSieName": "SIU 1"
          },
          "powerSupplies": [
              // {
                  // "Name": "Power Supply: 01"
              // },
              // {
                  // "Name": "Power Supply: 04"
              // }
          ],
          "resizeGrid": false
      };
    fixture.detectChanges(false);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
