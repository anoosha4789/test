import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { RealTimeDataSignalRService } from '@core/services/realTimeDataSignalR.service';
import { MultiNodelocalstorageService } from '@features/multinode/services/multi-nodelocalstorage.service';
import { MultinodeService } from '@features/multinode/services/multinode.service';
import { provideMockStore } from '@ngrx/store/testing';

import { EndOfActuationDialogComponent } from './end-of-actuation-dialog.component';

fdescribe('EndOfActuationDialogComponent', () => {
  let component: EndOfActuationDialogComponent;
  let fixture: ComponentFixture<EndOfActuationDialogComponent>;
  let data = { well: {
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
    , multinodeDeviceId: 1 }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EndOfActuationDialogComponent ],
      imports:[ MatDialogModule,MatTableModule,HttpClientTestingModule],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: data },
        MultiNodelocalstorageService,
      //  MultinodeService,
        provideMockStore({})
        ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EndOfActuationDialogComponent);
    component = fixture.componentInstance;
    fixture.componentInstance.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
