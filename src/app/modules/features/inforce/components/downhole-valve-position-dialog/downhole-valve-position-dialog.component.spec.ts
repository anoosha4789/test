import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/compiler';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTableModule } from '@angular/material/table';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { provideMockStore } from '@ngrx/store/testing';
import { DownholeValvePositionDialogComponent } from './downhole-valve-position-dialog.component';  
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { InforceWellUIModel } from '@core/models/UIModels/InforceWell.model';
import { ReturnsBasedShiftDefaultsModel } from '@core/models/webModels/ReturnsBasedShiftDefaults.model';
import { TimeBasedShiftDefaultsModel } from '@core/models/webModels/TimeBasedShiftDefaults.model';

fdescribe('DownholeValvePositionDialogComponent', () => {
  let component: DownholeValvePositionDialogComponent;
  let fixture: ComponentFixture<DownholeValvePositionDialogComponent>;
  let data: InforceWellUIModel;
  
  
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DownholeValvePositionDialogComponent ],
      imports: [  MatTableModule,MatDialogModule,HttpClientTestingModule  ],//ReactiveFormsModule, HttpClientModule, RouterTestingModule,
      providers: [{ provide: MAT_DIALOG_DATA, useValue: data }, { provide: MatDialogRef, useValue:  {} }],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DownholeValvePositionDialogComponent);
    component = fixture.componentInstance;
    
    component.data = {
        ControlArchitectureId: 3,
        NumberOfOutputs: 8,
        Zones: [
          {
            ZoneId: 1,
            ZoneName: "2N Zone 1",
            ValveType: 3,
            NumberOfPositions: 12,
            CurrentPosition: 1,
            MeasuredDepth: 1,
            TimeBasedShiftDefaults: {
              PressureLockTime: 15,
              VentTime: 15,
              ShiftTime: 60,
              IdShiftDefault: 3,
              MinimumResetTime: 240
            },
            ShiftMethod: "ReturnsBased",
            LineToZoneMapping: {
              ZoneId: 1,
              ZoneName: "2N Zone 1",
              OpenLine: "Line A",
              CloseLine: "Output H",
              ValveType: 3,
              Priority: 1,
              Enabled: true,
              Id: 1
            },
            ValvePositionsAndReturns: [
              {
                FromPosition: 12,
                ToPosition: 1,
                Description: "Fully Closed",
                ReturnVolume: 700,
                UserSelectable: true,
                Id: 1
              },
              {
                FromPosition: 1,
                ToPosition: 2,
                Description: "Open 1",
                ReturnVolume: 350,
                UserSelectable: true,
                Id: 2
              },
              {
                FromPosition: 2,
                ToPosition: 3,
                Description: "Open 2",
                ReturnVolume: 35,
                UserSelectable: true,
                Id: 3
              },
              {
                FromPosition: 3,
                ToPosition: 4,
                Description: "Open 3",
                ReturnVolume: 35,
                UserSelectable: true,
                Id: 4
              },
              {
                FromPosition: 4,
                ToPosition: 5,
                Description: "Open 4",
                ReturnVolume: 35,
                UserSelectable: true,
                Id: 5
              },
              {
                FromPosition: 5,
                ToPosition: 6,
                Description: "Open 5",
                ReturnVolume: 35,
                UserSelectable: true,
                Id: 6
              },
              {
                FromPosition: 6,
                ToPosition: 7,
                Description: "Open 6",
                ReturnVolume: 35,
                UserSelectable: true,
                Id: 7
              },
              {
                FromPosition: 7,
                ToPosition: 8,
                Description: "Open 7",
                ReturnVolume: 35,
                UserSelectable: true,
                Id: 8
              },
              {
                FromPosition: 8,
                ToPosition: 9,
                Description: "Open 8",
                ReturnVolume: 35,
                UserSelectable: true,
                Id: 9
              },
              {
                FromPosition: 9,
                ToPosition: 10,
                Description: "Open 9",
                ReturnVolume: 35,
                UserSelectable: true,
                Id: 10
              },
              {
                FromPosition: 10,
                ToPosition: 11,
                Description: "Open 10",
                ReturnVolume: 35,
                UserSelectable: true,
                Id: 11
              },
              {
                FromPosition: 11,
                ToPosition: 12,
                Description: "Fully Open",
                ReturnVolume: 35,
                UserSelectable: true,
                Id: 12
              }
            ],
            WellId: 1,
            ReturnsBasedShiftDefaults: {
              ToleranceHigh: 15,
              ToleranceLow: 15,
              IntervalTime: 5,
              IntervalCount: 4,
              StablizationDeadband: 0.20000000298023224,
              PressureLockTime: 15,
              VentTime: 15,
              MinShiftTime: 30,
              MaxShiftTime: 60,
              IdShiftDefault: 3,
              IsToleranceUnitInPercentage: 0,
              MinimumReturnsFlowRateForStabilization: 0.9,
              ReturnFlowStabilizationCheckingPeriodInSeconds: 5,
              MinimumResetTime: 240
            },
            HcmId: 12,
            IsWellLevelShiftDefaultApplied: true,
            CurrentPositionStateUnknownFlag: false
          },
          {
            ZoneId: 2,
            ZoneName: "2N Zone 2",
            ValveType: 2,
            NumberOfPositions: 2,
            CurrentPosition: 1,
            MeasuredDepth: 2,
            TimeBasedShiftDefaults: {
              PressureLockTime: 15,
              VentTime: 15,
              ShiftTime: 60,
              IdShiftDefault: 4,
              MinimumResetTime: 240
            },
            ShiftMethod: "ReturnsBased",
            LineToZoneMapping: {
              ZoneId: 2,
              ZoneName: "2N Zone 2",
              OpenLine: "Output B",
              CloseLine: "Line G",
              ValveType: 2,
              Priority: 1,
              Enabled: true,
              Id: 2
            },
            ValvePositionsAndReturns: [
              {
                FromPosition: 2,
                ToPosition: 1,
                Description: "Fully Closed",
                ReturnVolume: 558,
                UserSelectable: true,
                Id: 13
              },
              {
                FromPosition: 1,
                ToPosition: 2,
                Description: "Fully Open",
                ReturnVolume: 350,
                UserSelectable: true,
                Id: 14
              }
            ],
            WellId: 1,
            ReturnsBasedShiftDefaults: {
              ToleranceHigh: 15,
              ToleranceLow: 15,
              IntervalTime: 5,
              IntervalCount: 4,
              StablizationDeadband: 0.20000000298023224,
              PressureLockTime: 15,
              VentTime: 15,
              MinShiftTime: 30,
              MaxShiftTime: 60,
              IdShiftDefault: 4,
              IsToleranceUnitInPercentage: 0,
              MinimumReturnsFlowRateForStabilization: 0.9,
              ReturnFlowStabilizationCheckingPeriodInSeconds: 5,
              MinimumResetTime: 240
            },
            HcmId: 13,
            IsWellLevelShiftDefaultApplied: true,
            CurrentPositionStateUnknownFlag: false
          },
          {
            ZoneId: 3,
            ZoneName: "2N Zone 3",
            ValveType: 3,
            NumberOfPositions: 10,
            CurrentPosition: 1,
            MeasuredDepth: 3,
            TimeBasedShiftDefaults: {
              PressureLockTime: 15,
              VentTime: 15,
              ShiftTime: 60,
              IdShiftDefault: 5,
              MinimumResetTime: 240
            },
            ShiftMethod: "ReturnsBased",
            LineToZoneMapping: {
              ZoneId: 3,
              ZoneName: "2N Zone 3",
              OpenLine: "Line C",
              CloseLine: "Output F",
              ValveType: 3,
              Priority: 1,
              Enabled: true,
              Id: 3
            },
            ValvePositionsAndReturns: [
              {
                FromPosition: 10,
                ToPosition: 1,
                Description: "Fully Closed",
                ReturnVolume: 400,
                UserSelectable: true,
                Id: 15
              },
              {
                FromPosition: 1,
                ToPosition: 2,
                Description: "Open 1",
                ReturnVolume: 200,
                UserSelectable: true,
                Id: 16
              },
              {
                FromPosition: 2,
                ToPosition: 3,
                Description: "Open 2",
                ReturnVolume: 25,
                UserSelectable: true,
                Id: 17
              },
              {
                FromPosition: 3,
                ToPosition: 4,
                Description: "Open 3",
                ReturnVolume: 25,
                UserSelectable: true,
                Id: 18
              },
              {
                FromPosition: 4,
                ToPosition: 5,
                Description: "Open 4",
                ReturnVolume: 25,
                UserSelectable: true,
                Id: 19
              },
              {
                FromPosition: 5,
                ToPosition: 6,
                Description: "Open 5",
                ReturnVolume: 25,
                UserSelectable: true,
                Id: 20
              },
              {
                FromPosition: 6,
                ToPosition: 7,
                Description: "Open 6",
                ReturnVolume: 25,
                UserSelectable: true,
                Id: 21
              },
              {
                FromPosition: 7,
                ToPosition: 8,
                Description: "Open 7",
                ReturnVolume: 25,
                UserSelectable: true,
                Id: 22
              },
              {
                FromPosition: 8,
                ToPosition: 9,
                Description: "Open 8",
                ReturnVolume: 25,
                UserSelectable: true,
                Id: 23
              },
              {
                FromPosition: 9,
                ToPosition: 10,
                Description: "Fully Open",
                ReturnVolume: 25,
                UserSelectable: true,
                Id: 24
              }
            ],
            WellId: 1,
            ReturnsBasedShiftDefaults: {
              ToleranceHigh: 15,
              ToleranceLow: 15,
              IntervalTime: 5,
              IntervalCount: 4,
              StablizationDeadband: 0.20000000298023224,
              PressureLockTime: 15,
              VentTime: 15,
              MinShiftTime: 30,
              MaxShiftTime: 60,
              IdShiftDefault: 5,
              IsToleranceUnitInPercentage: 0,
              MinimumReturnsFlowRateForStabilization: 0.9,
              ReturnFlowStabilizationCheckingPeriodInSeconds: 5,
              MinimumResetTime: 240
            },
            HcmId: 14,
            IsWellLevelShiftDefaultApplied: true,
            CurrentPositionStateUnknownFlag: false
          },
          {
            ZoneId: 4,
            ZoneName: "2N Zone 4",
            ValveType: 3,
            NumberOfPositions: 9,
            CurrentPosition: 1,
            MeasuredDepth: 4,
            TimeBasedShiftDefaults: {
              PressureLockTime: 15,
              VentTime: 15,
              ShiftTime: 60,
              IdShiftDefault: 6,
              MinimumResetTime: 240
            },
            ShiftMethod: "ReturnsBased",
            LineToZoneMapping: {
              ZoneId: 4,
              ZoneName: "2N Zone 4",
              OpenLine: "Output D",
              CloseLine: "Line E",
              ValveType: 3,
              Priority: 1,
              Enabled: true,
              Id: 4
            },
            ValvePositionsAndReturns: [
              {
                FromPosition: 8,
                ToPosition: 1,
                Description: "Fully Closed",
                ReturnVolume: 490,
                UserSelectable: true,
                Id: 25
              },
              {
                FromPosition: 1,
                ToPosition: 2,
                Description: "Open 1",
                ReturnVolume: 389.70001220703125,
                UserSelectable: true,
                Id: 26
              },
              {
                FromPosition: 2,
                ToPosition: 3,
                Description: "Open 2",
                ReturnVolume: 14.699999809265137,
                UserSelectable: true,
                Id: 27
              },
              {
                FromPosition: 3,
                ToPosition: 4,
                Description: "Open 3",
                ReturnVolume: 14.699999809265137,
                UserSelectable: true,
                Id: 28
              },
              {
                FromPosition: 4,
                ToPosition: 5,
                Description: "Open 4",
                ReturnVolume: 14.699999809265137,
                UserSelectable: true,
                Id: 29
              },
              {
                FromPosition: 5,
                ToPosition: 6,
                Description: "Open 5",
                ReturnVolume: 14.699999809265137,
                UserSelectable: true,
                Id: 30
              },
              {
                FromPosition: 6,
                ToPosition: 7,
                Description: "Open 6",
                ReturnVolume: 14.699999809265137,
                UserSelectable: true,
                Id: 31
              },
              {
                FromPosition: 7,
                ToPosition: 8,
                Description: "Open 7",
                ReturnVolume: 14.699999809265137,
                UserSelectable: true,
                Id: 32
              },
              {
                FromPosition: 8,
                ToPosition: 9,
                Description: "Fully Open",
                ReturnVolume: 12.100000381469727,
                UserSelectable: true,
                Id: 33
              }
            ],
            WellId: 1,
            ReturnsBasedShiftDefaults: {
              ToleranceHigh: 15,
              ToleranceLow: 15,
              IntervalTime: 5,
              IntervalCount: 4,
              StablizationDeadband: 0.20000000298023224,
              PressureLockTime: 15,
              VentTime: 15,
              MinShiftTime: 30,
              MaxShiftTime: 60,
              IdShiftDefault: 6,
              IsToleranceUnitInPercentage: 0,
              MinimumReturnsFlowRateForStabilization: 0.9,
              ReturnFlowStabilizationCheckingPeriodInSeconds: 5,
              MinimumResetTime: 240
            },
            HcmId: 15,
            IsWellLevelShiftDefaultApplied: true,
            CurrentPositionStateUnknownFlag: false
          }
        ],
        TimeBasedShiftDefaults: {
          PressureLockTime: 15,
          VentTime: 15,
          ShiftTime: 60,
          IdShiftDefault: 2,
          MinimumResetTime: 240
        },
        ShiftMethod: "ReturnsBased",
        PanelToLineMappings: [
          {
            WellId: 1,
            PanelConnection: "Output A",
            DownholeLine: "Line A",
            PanelToLineMappingsId: 1
          },
          {
            WellId: 1,
            PanelConnection: "Output B",
            DownholeLine: "Output B",
            PanelToLineMappingsId: 2
          },
          {
            WellId: 1,
            PanelConnection: "Output C",
            DownholeLine: "Line C",
            PanelToLineMappingsId: 3
          },
          {
            WellId: 1,
            PanelConnection: "Output D",
            DownholeLine: "Output D",
            PanelToLineMappingsId: 4
          },
          {
            WellId: 1,
            PanelConnection: "Output E",
            DownholeLine: "Line E",
            PanelToLineMappingsId: 5
          },
          {
            WellId: 1,
            PanelConnection: "Output F",
            DownholeLine: "Output F",
            PanelToLineMappingsId: 6
          },
          {
            WellId: 1,
            PanelConnection: "Output G",
            DownholeLine: "Line G",
            PanelToLineMappingsId: 7
          },
          {
            WellId: 1,
            PanelConnection: "Output H",
            DownholeLine: "Output H",
            PanelToLineMappingsId: 8
          }
        ],
        LineToZoneMapping: [
          {
            ZoneId: 1,
            ZoneName: "2N Zone 1",
            OpenLine: "Line A",
            CloseLine: "Output H",
            ValveType: 3,
            Priority: 1,
            Enabled: true,
            Id: 1
          },
          {
            ZoneId: 2,
            ZoneName: "2N Zone 2",
            OpenLine: "Output B",
            CloseLine: "Line G",
            ValveType: 2,
            Priority: 1,
            Enabled: true,
            Id: 2
          },
          {
            ZoneId: 3,
            ZoneName: "2N Zone 3",
            OpenLine: "Line C",
            CloseLine: "Output F",
            ValveType: 3,
            Priority: 1,
            Enabled: true,
            Id: 3
          },
          {
            ZoneId: 4,
            ZoneName: "2N Zone 4",
            OpenLine: "Output D",
            CloseLine: "Line E",
            ValveType: 3,
            Priority: 1,
            Enabled: true,
            Id: 4
          }
        ],
        ReturnsBasedShiftDefaults: {
          ToleranceHigh: 15,
          ToleranceLow: 15,
          IntervalTime: 5,
          IntervalCount: 4,
          StablizationDeadband: 0.20000000298023224,
          PressureLockTime: 15,
          VentTime: 15,
          MinShiftTime: 30,
          MaxShiftTime: 60,
          IdShiftDefault: 2,
          IsToleranceUnitInPercentage: 0,
          MinimumReturnsFlowRateForStabilization: 0.9,
          ReturnFlowStabilizationCheckingPeriodInSeconds: 5,
          MinimumResetTime: 240
        },
        IsPanelLevelShiftDefaultApplied: true,
        WellId: 1,
        WellName: "2N Well 1",
        WellType: 3,
        WellDeviceId: 11,
        IsValid: false,
        IsDirty: false
    }
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
