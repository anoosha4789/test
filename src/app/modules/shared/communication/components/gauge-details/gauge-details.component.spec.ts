import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ValidationService } from '@core/services/validation.service';
import { provideMockStore } from '@ngrx/store/testing';

import { GaugeDetailsComponent } from './gauge-details.component';

fdescribe('GaugeDetailsComponent', () => {
  let component: GaugeDetailsComponent;
  let fixture: ComponentFixture<GaugeDetailsComponent>;
  let data = {
    "gauges": [],
    "selectedGauge": {
        "Active": true,
        "DeviceId": -1,
        "GaugeType": 0,
        "EspGaugeType": 0,
        "SerialNumber": null,
        "PressureCoefficientFileContent": [],
        "TemperatureCoefficientFileContent": []
    },
    "selectedCardId": -1,
    "selectedCardName": "Card 1",
    "selectedChannelId": -1,
    "selectedChannelName": "COM1",
    "IsInCHARGETool": false,
    "currentWellId": -1,
    "portingList": [
        {
            "Id": 2,
            "ConnectPorting": "Annulus"
        },
        {
            "Id": 1,
            "ConnectPorting": "Tubing"
        }
    ],
    "modalEditMode": false
};

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GaugeDetailsComponent ],
      imports:[ReactiveFormsModule,MatTooltipModule,MatInputModule,FormsModule,HttpClientTestingModule,MatSelectModule,BrowserAnimationsModule],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      providers:[provideMockStore({}), ValidationService,
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: data },]

    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GaugeDetailsComponent);
    component = fixture.componentInstance;
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
