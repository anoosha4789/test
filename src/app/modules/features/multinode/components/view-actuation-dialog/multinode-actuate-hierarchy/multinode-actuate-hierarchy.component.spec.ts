
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';

import { MultinodeActuateHierarchyComponent } from './multinode-actuate-hierarchy.component';

fdescribe('MultinodeActuateHierarchyComponent', () => {
  let component: MultinodeActuateHierarchyComponent;
  let fixture: ComponentFixture<MultinodeActuateHierarchyComponent>;
  let wellInActuation =

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultinodeActuateHierarchyComponent ],
      schemas:[CUSTOM_ELEMENTS_SCHEMA],
      providers:[provideMockStore({})]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultinodeActuateHierarchyComponent);
    component = fixture.componentInstance;
    component.wellInActuation = {
      PositionDescriptionData:[
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
      TEC:{
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
      WellDeviceId:1,
      WellId:2,
      WellName:"Test",
      WellType:4,
      Zones:[],
    };
    component.efcvInActuation ={
      Address:"2",
      eFCVGuid:"",
      HcmId:3,
      MeasuredDepth:34,
      MotorSettings:{
        DutyCycle:2,
        MaxCurrent:4,
        MaxVoltage:3,
        OverCurrentOverrideFlag:true,
        OverCurrentThreshold:2,
        TargetVoltage:3
      },
      PositionDescriptionData:[],
      SerialNumber:"34",
      TECId:24,
      UId:"2",
      ZoneId:2,
      ZoneName:"erere"
    }
    component.dataPointDefinitions =[];
    component.actuationWellObject ={
      ActuationNodes:[
        {
          AFCDId:"2",
          CurrentStage:"test",
          DeviceId:3,
          PreviousStage:"34",
          TargetStage:"33"
        }
      ],
      IsTowardsHome: true,
      SIUID:"3",
      WellId:"3",
    }
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
