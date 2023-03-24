import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GwTruncatePipe } from '@shared/gateway-pipes/pipes/gw-truncate.pipe';

import { ManualModePowerSupplyComponent } from './manual-mode-power-supply.component';

fdescribe('ManualModePowerSupplyComponent', () => {
  let component: ManualModePowerSupplyComponent;
  let fixture: ComponentFixture<ManualModePowerSupplyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManualModePowerSupplyComponent ,GwTruncatePipe],
      imports:[MatTabsModule,MatTooltipModule,BrowserAnimationsModule],
      schemas:[CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManualModePowerSupplyComponent);
    component = fixture.componentInstance;
    component.manualPowerSupplies = [
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
              //     "Name": "Power Supply: 01"
              // },
              // {
              //     "Name": "Power Supply: 04"
              // }
          ],
          "resizeGrid": false
      }
  ];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
