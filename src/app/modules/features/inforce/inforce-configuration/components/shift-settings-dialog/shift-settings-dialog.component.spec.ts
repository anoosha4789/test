import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftSettingsDialogComponent } from './shift-settings-dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ValidationService } from '@core/services/validation.service';
import { provideMockStore } from '@ngrx/store/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
fdescribe('ShiftSettingsDialogComponent', () => {
  let component: ShiftSettingsDialogComponent;
  let fixture: ComponentFixture<ShiftSettingsDialogComponent>;
  let data = {
    applyButtonText: "Set at Well Level",
    defaultShiftSettingsTitle: "Use Panel Level Shift settings",
    customShiftSettingsTitle: "Use Custom Well Level Shift Settings",
    parentShiftSettings: {
      ShiftMethod: "ReturnsBased",
      TimeBasedShiftDefaults: {
        PressureLockTime: 15,
        VentTime: 15,
        ShiftTime: 60,
        IdShiftDefault: 1,
        MinimumResetTime: 240
      },
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
        IdShiftDefault: 1,
        IsToleranceUnitInPercentage: 0,
        MinimumReturnsFlowRateForStabilization: 0.9,
        ReturnFlowStabilizationCheckingPeriodInSeconds: 5,
        MinimumResetTime: 240
      },
      returnBasedError: null,
      timeBasedError: null
    },
    shiftSettings: {
      ShiftMethod: "ReturnsBased",
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
        IdShiftDefault: 1,
        IsToleranceUnitInPercentage: 0,
        MinimumReturnsFlowRateForStabilization: 0.9,
        ReturnFlowStabilizationCheckingPeriodInSeconds: 5,
        MinimumResetTime: 240
      },
      TimeBasedShiftDefaults: {
        PressureLockTime: 15,
        VentTime: 15,
        ShiftTime: 60,
        IdShiftDefault: 1,
        MinimumResetTime: 240
      }
    },
    isParentLevelShiftDefaultApplied: true,
    showHCMSSleeveSettings: true,
    isFlowmeterTransmitterNone: false
  }
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShiftSettingsDialogComponent ],
      imports: [  HttpClientTestingModule,RouterTestingModule],//HttpClientTestingModule,RouterTestingModule,MatTooltipModule,MatExpansionModule,BrowserAnimationsModule  ],//ReactiveFormsModule, HttpClientModule, RouterTestingModule,
      providers: [{ provide: MAT_DIALOG_DATA, useValue: {} }, { provide: MatDialogRef, useValue:  {} }, provideMockStore({}),ValidationService],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShiftSettingsDialogComponent);
    component = fixture.componentInstance;
    component.data = data;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
