import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PumpPressureDialogComponent } from './pump-pressure-dialog.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HPURealtimeDataPoint } from '../manual-mode/manual-mode.component';
import { DeviceIdIndexValue } from '@core/models/webModels/PointTemplate.model';
import { HyrdraulicPowerUnitPointIndex } from '@features/inforce/common/InForceModbusRegisterIndex';
fdescribe('PumpPressureDialogComponent', () => {
  let component: PumpPressureDialogComponent;
  let fixture: ComponentFixture<PumpPressureDialogComponent>;
  let data : HPURealtimeDataPoint = { hpuDataPoint: new DeviceIdIndexValue(2, HyrdraulicPowerUnitPointIndex.StartPump, -999.0, ''),
    hpuSubDataPoint: null,
    actionDataPoint: null
  };
 beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PumpPressureDialogComponent ],
      imports: [  MatTableModule,MatDialogModule,HttpClientTestingModule,RouterTestingModule,ReactiveFormsModule  ],//ReactiveFormsModule, HttpClientModule, RouterTestingModule,
      providers: [{ provide: MAT_DIALOG_DATA, useValue: {} }, { provide: MatDialogRef, useValue:  {} },provideMockStore({})],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PumpPressureDialogComponent);
    component = fixture.componentInstance;
    component.data.changePumpPressure = data;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
