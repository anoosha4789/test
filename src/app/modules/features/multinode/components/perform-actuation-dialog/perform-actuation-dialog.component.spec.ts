import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { GwTruncatePipe } from '@shared/gateway-pipes/pipes/gw-truncate.pipe';

import { PerformActuationDialogComponent } from './perform-actuation-dialog.component';

fdescribe('PerformActuationDialogComponent', () => {
  let component: PerformActuationDialogComponent;
  let fixture: ComponentFixture<PerformActuationDialogComponent>;
  
  let data = {
    "well": {
        "TEC": {
            "Id": 1,
            "TECGuid": "98d96464-38c7-4220-b042-34cc61f42423",
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
                "eFCVGuid": "0b046a80-08f9-4e5d-ab6d-748c6fc28645",
                "UId": "21",
                "TECId": 1,
                "Address": "2",
                "SerialNumber": "1",
                "ZoneName": "eFCV 2",
                "MeasuredDepth": 3,
                "MotorSettings": {
                    "Id": 1,
                    "eFCVGuid": "0b046a80-08f9-4e5d-ab6d-748c6fc28645",
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
    },
    "multinodeMonitoringZones": [
        [
            {
                "zone": {
                    "ZoneId": 1,
                    "eFCVGuid": "0b046a80-08f9-4e5d-ab6d-748c6fc28645",
                    "UId": "21",
                    "TECId": 1,
                    "Address": "2",
                    "SerialNumber": "1",
                    "ZoneName": "eFCV 2",
                    "MeasuredDepth": 3,
                    "MotorSettings": {
                        "Id": 1,
                        "eFCVGuid": "0b046a80-08f9-4e5d-ab6d-748c6fc28645",
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
                },
                "Position": "CLOSED",
                "tools": []
            }
        ]
    ],
    "sies": [
        {
            "Id": 1,
            "SIEGuid": "c9ab79ad-c478-4eae-9c41-5602f65a278e",
            "Name": "SIU 1",
            "NetworkType": "UDP",
            "IpAddress": "127.0.0.1",
            "PortNumber": 18888,
            "MacAddress": "12.34.56.78.90.AB",
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
      declarations: [ PerformActuationDialogComponent,GwTruncatePipe],
      imports:[MatTableModule,MatDialogModule],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      providers:[{ provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: data },]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PerformActuationDialogComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
