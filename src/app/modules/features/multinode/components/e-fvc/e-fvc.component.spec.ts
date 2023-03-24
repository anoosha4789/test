import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ValidationService } from '@core/services/validation.service';
import { provideMockStore } from '@ngrx/store/testing';

import { EFVCComponent } from './e-fvc.component';

fdescribe('EFVCComponent', () => {
  let component: EFVCComponent;
  let fixture: ComponentFixture<EFVCComponent>;
  let data ={
    "efcvDetails": {
        "ZoneId": -1,
        "ZoneName": "eFCV 2",
        "Address": "2",
        "PositionDescriptionData": [
            {
                "Id": -1,
                "idPositionOwner": 3,
                "PositionStage": "STAGE_OPEN",
                "idOwner": 1,
                "Description": "OPEN",
                "RotationCount": 0
            },
            {
                "Id": -1,
                "idPositionOwner": 3,
                "PositionStage": "STAGE_1",
                "idOwner": 1,
                "Description": "CHOKE_1",
                "RotationCount": 1265
            },
            {
                "Id": -1,
                "idPositionOwner": 3,
                "PositionStage": "STAGE_2",
                "idOwner": 1,
                "Description": "CHOKE_2",
                "RotationCount": 2187
            },
            {
                "Id": -1,
                "idPositionOwner": 3,
                "PositionStage": "STAGE_3",
                "idOwner": 1,
                "Description": "CHOKE_3",
                "RotationCount": 3108
            },
            {
                "Id": -1,
                "idPositionOwner": 3,
                "PositionStage": "STAGE_4",
                "idOwner": 1,
                "Description": "CHOKE_4",
                "RotationCount": 4030
            },
            {
                "Id": -1,
                "idPositionOwner": 3,
                "PositionStage": "STAGE_CLOSE",
                "idOwner": 1,
                "Description": "CLOSED",
                "RotationCount": 6270
            },
            {
                "Id": -1,
                "idPositionOwner": 3,
                "PositionStage": "STAGE_NOTSET",
                "idOwner": 1,
                "Description": "UNKNOWN POSITION",
                "RotationCount": 0
            }
        ],
        "MotorSettings": {
            "MaxVoltage": 140,
            "MaxCurrent": 500,
            "TargetVoltage": 90,
            "OverCurrentThreshold": 0,
            "OverCurrentOverrideFlag": false,
            "DutyCycle": 0
        }
    },
    "modalEditMode": false,
    "efcvList": [],
    "wellId": -1,
    "wellList": [],
    "currentWell": {
        "WellId": -1,
        "WellName": "Well 1",
        "currentWellName": "Well 1",
        "WellType": 4,
        "Zones": [],
        "eFCVPositions": [],
        "TEC": {
            "Id": -1,
            "TECGuid": "",
            "WellId": -1,
            "TecNumber": 1,
            "PowerSupplySettings": {
                "MaxVoltage": 150,
                "MaxCurrent": 250,
                "TargetVoltage": 125,
                "RampRate": 25,
                "SettleVoltage": 90,
                "SettleRampRate": -10
            }
        },
        "WellDeviceId": -1,
        "IsValid": true,
        "IsDirty": true,
        "PositionDescriptionData": [
            {
                "Id": -1,
                "idPositionOwner": 2,
                "PositionStage": "STAGE_OPEN",
                "idOwner": 1,
                "Description": "OPEN",
                "RotationCount": 0
            },
            {
                "Id": -1,
                "idPositionOwner": 2,
                "PositionStage": "STAGE_1",
                "idOwner": 1,
                "Description": "CHOKE_1",
                "RotationCount": 1265
            },
            {
                "Id": -1,
                "idPositionOwner": 2,
                "PositionStage": "STAGE_2",
                "idOwner": 1,
                "Description": "CHOKE_2",
                "RotationCount": 2187
            },
            {
                "Id": -1,
                "idPositionOwner": 2,
                "PositionStage": "STAGE_3",
                "idOwner": 1,
                "Description": "CHOKE_3",
                "RotationCount": 3108
            },
            {
                "Id": -1,
                "idPositionOwner": 2,
                "PositionStage": "STAGE_4",
                "idOwner": 1,
                "Description": "CHOKE_4",
                "RotationCount": 4030
            },
            {
                "Id": -1,
                "idPositionOwner": 2,
                "PositionStage": "STAGE_CLOSE",
                "idOwner": 1,
                "Description": "CLOSED",
                "RotationCount": 6270
            },
            {
                "Id": -1,
                "idPositionOwner": 2,
                "PositionStage": "STAGE_NOTSET",
                "idOwner": 1,
                "Description": "UNKNOWN POSITION",
                "RotationCount": 0
            }
        ],
        "Error": null
    }
}
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EFVCComponent ],
      imports:[ ReactiveFormsModule, MatFormFieldModule,MatIconModule,MatDialogModule,MatSelectModule,
        MatInputModule,BrowserAnimationsModule],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: data },
        ValidationService,
        provideMockStore({}),
        ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EFVCComponent);
    component = fixture.componentInstance;
    //component.data = 
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
