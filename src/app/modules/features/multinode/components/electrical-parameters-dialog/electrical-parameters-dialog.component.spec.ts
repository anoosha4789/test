import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { IgxTooltipModule } from '@infragistics/igniteui-angular';
import { provideMockStore } from '@ngrx/store/testing';

import { ElectricalParametersDialogComponent } from './electrical-parameters-dialog.component';

fdescribe('ElectricalParametersDialogComponent', () => {
  let component: ElectricalParametersDialogComponent;
  let fixture: ComponentFixture<ElectricalParametersDialogComponent>;
  let data = {
    "wells": [
        {
            "TEC": {
                "Id": 1,
                "TECGuid": "fed7df58-a2ae-4a5c-bd50-86bad7709e9c",
                "WellId": 1,
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
            "Zones": [
                {
                    "ZoneId": 1,
                    "eFCVGuid": "9c9ca662-9420-4960-b549-70a29878e4cb",
                    "UId": "uhg",
                    "TECId": 1,
                    "Address": "2",
                    "SerialNumber": "jj",
                    "ZoneName": "eFCV 2",
                    "MeasuredDepth": 666,
                    "MotorSettings": {
                        "Id": 1,
                        "eFCVGuid": "9c9ca662-9420-4960-b549-70a29878e4cb",
                        "MaxVoltage": 140,
                        "MaxCurrent": 500,
                        "TargetVoltage": 90,
                        "OverCurrentThreshold": 0,
                        "OverCurrentOverrideFlag": false,
                        "DutyCycle": 0
                    },
                    "PositionDescriptionData": [
                        {
                            "Id": 15,
                            "idPositionOwner": 3,
                            "PositionStage": "STAGE_OPEN",
                            "idOwner": 1,
                            "Description": "OPEN",
                            "RotationCount": 0
                        },
                        {
                            "Id": 16,
                            "idPositionOwner": 3,
                            "PositionStage": "STAGE_1",
                            "idOwner": 1,
                            "Description": "CHOKE_1",
                            "RotationCount": 1265
                        },
                        {
                            "Id": 17,
                            "idPositionOwner": 3,
                            "PositionStage": "STAGE_2",
                            "idOwner": 1,
                            "Description": "CHOKE_2",
                            "RotationCount": 2187
                        },
                        {
                            "Id": 18,
                            "idPositionOwner": 3,
                            "PositionStage": "STAGE_3",
                            "idOwner": 1,
                            "Description": "CHOKE_3",
                            "RotationCount": 3108
                        },
                        {
                            "Id": 19,
                            "idPositionOwner": 3,
                            "PositionStage": "STAGE_4",
                            "idOwner": 1,
                            "Description": "CHOKE_4",
                            "RotationCount": 4030
                        },
                        {
                            "Id": 20,
                            "idPositionOwner": 3,
                            "PositionStage": "STAGE_CLOSE",
                            "idOwner": 1,
                            "Description": "CLOSED",
                            "RotationCount": 6270
                        },
                        {
                            "Id": 21,
                            "idPositionOwner": 3,
                            "PositionStage": "STAGE_NOTSET",
                            "idOwner": 1,
                            "Description": "UNKNOWN POSITION",
                            "RotationCount": 0
                        }
                    ],
                    "HcmId": 5
                }
            ],
            "PositionDescriptionData": [
                {
                    "Id": 8,
                    "idPositionOwner": 2,
                    "PositionStage": "STAGE_OPEN",
                    "idOwner": 1,
                    "Description": "OPEN",
                    "RotationCount": 0
                },
                {
                    "Id": 9,
                    "idPositionOwner": 2,
                    "PositionStage": "STAGE_1",
                    "idOwner": 1,
                    "Description": "CHOKE_1",
                    "RotationCount": 1265
                },
                {
                    "Id": 10,
                    "idPositionOwner": 2,
                    "PositionStage": "STAGE_2",
                    "idOwner": 1,
                    "Description": "CHOKE_2",
                    "RotationCount": 2187
                },
                {
                    "Id": 11,
                    "idPositionOwner": 2,
                    "PositionStage": "STAGE_3",
                    "idOwner": 1,
                    "Description": "CHOKE_3",
                    "RotationCount": 3108
                },
                {
                    "Id": 12,
                    "idPositionOwner": 2,
                    "PositionStage": "STAGE_4",
                    "idOwner": 1,
                    "Description": "CHOKE_4",
                    "RotationCount": 4030
                },
                {
                    "Id": 13,
                    "idPositionOwner": 2,
                    "PositionStage": "STAGE_CLOSE",
                    "idOwner": 1,
                    "Description": "CLOSED",
                    "RotationCount": 6270
                },
                {
                    "Id": 14,
                    "idPositionOwner": 2,
                    "PositionStage": "STAGE_NOTSET",
                    "idOwner": 1,
                    "Description": "UNKNOWN POSITION",
                    "RotationCount": 0
                }
            ],
            "WellId": 1,
            "WellName": "Well 1",
            "WellType": 4,
            "WellDeviceId": 4,
            "currentWellName": "Well 1"
        }
    ],
    "sies": [
        {
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
            "currentSieName": "SIU 1"
        }
    ]
};

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ElectricalParametersDialogComponent ],
      imports:[MatDialogModule,IgxTooltipModule,RouterTestingModule,HttpClientTestingModule,BrowserAnimationsModule],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: data },
        provideMockStore({}),
        ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ElectricalParametersDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
